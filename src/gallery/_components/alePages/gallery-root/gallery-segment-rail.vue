<template>
<div
  v-show="visible"
  class="segment-rail"
  :class="{ fixed: fixed }"
  ref="rail"
  @pointerdown="onPointerDown"
>
  <!-- Cosmetic, fixed-count segment blocks. They are NOT jump targets: the jump is
       continuous (proportional to pointer position). Each block fills itself by how
       far the scroll fraction has passed through it, so the gaps between pills stay
       visible at any scroll position (the rail always reads as segmented). -->
  <div
    v-for="n in segmentCount"
    :key="n"
    class="segment-block"
  >
    <div class="segment-block-fill" :style="{ height: ( segmentFill( n - 1 ) * 100 ) + '%' }"></div>
  </div>

</div>
</template>

<script>

// VISUAL SEGMENT COUNT
// Purely cosmetic blocks. The count scales with how many screenfuls there are to
// scroll (one pill per viewport-ish), clamped between these bounds. The min is 1 so a
// page with barely any scrolling doesn't show 3 pills implying multiple screenfuls
// that aren't there; the max keeps a huge library from exploding the count.
const SEGMENT_MIN = 1;
const SEGMENT_MAX = 12;

export default {
  name: 'gallerySegmentRail',

  // target: 'window' (grid, window-scrolled) or a CSS selector for the scroll
  // container (spreadsheet's '.list-view-inner-wrap').
  props: {
    target: {
      type: String,
      default: 'window',
    },
    // Window-scrolled views (grid) need the rail pinned to the viewport (fixed) so
    // it stays put as the page scrolls. Inner-container views (spreadsheet) use an
    // absolutely positioned rail inside their non-scrolling wrapper.
    fixed: {
      type: Boolean,
      default: false,
    },
  },

  data: function() {
    return {
      scrollFraction: 0,
      scrollable: 0,
      viewport: 0,
      dragging: false,
      scrollEl: null,
      // Cached at pointerdown so each move maps the pointer without reading layout
      // (getBoundingClientRect mid-drag forces a reflow and, on phones, thrashes hard
      // enough to make scrubbing jump). Refreshed if the rail can't be measured.
      railBox: null,
      dragScrollable: 0,
      pointerId: null,
      // Touch fires pointermove far faster than the screen paints (and a resting
      // finger still jitters out a stream of moves), so coalesce them: a move only
      // stores the latest Y and the actual jump runs once per animation frame.
      pendingY: null,
      rafId: null,
    };
  },

  computed: {

    // Hide the rail when there is nothing meaningful to jump through (content fits
    // within roughly one viewport).
    visible: function() {
      return this.scrollable > 50;
    },

    // One pill per screenful of scrolling (scrollable / viewport), clamped to the
    // min/max so short pages stay clean and long ones don't over-segment. Fall back to
    // the live window height if viewport hasn't been measured yet, so a barely-
    // scrollable page doesn't floor at SEGMENT_MIN as if it had multiple screenfuls.
    segmentCount: function() {
      const viewport = this.viewport > 0 ? this.viewport : window.innerHeight;
      if ( viewport <= 0 ) return SEGMENT_MIN;
      const screens = Math.round( this.scrollable / viewport );
      return _.clamp( screens, SEGMENT_MIN, SEGMENT_MAX );
    },

  },

  mounted: function() {
    this.bindScrollSource();
    // Content height settles across a few frames (virtualized rows, spacers, image
    // loads), so re-measure shortly after mount to catch the final scrollable size.
    const vue = this;
    this.$nextTick(function() { vue.measure(); });
    clearTimeout( this.settleTimer );
    this.settleTimer = setTimeout(function() { vue.measure(); }, 300);
    this.$compEmitter.on('afterWindowResize', this.measure);
    // Pointer move/up live on the window so a drag keeps tracking even if the
    // pointer leaves the thin rail.
    window.addEventListener('pointermove', this.onPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onPointerUp, { passive: true });
    // If the browser hijacks the touch for its own gesture it sends pointercancel
    // instead of pointerup; without this the drag would stay stuck on.
    window.addEventListener('pointercancel', this.onPointerUp, { passive: true });
  },
  beforeUnmount: function() {
    clearTimeout( this.settleTimer );
    if ( this.rafId !== null ) cancelAnimationFrame( this.rafId );
    this.$compEmitter.off('afterWindowResize', this.measure);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    const source = this.scrollSource();
    if ( source ) source.removeEventListener('scroll', this.onScroll);
  },

  watch: {
    target: function() {
      this.bindScrollSource();
    },
  },

  methods: {

    // How much of segment `i` is filled (0-1): how far the current scroll fraction
    // has travelled through this segment's slice of the rail. Fully filled above the
    // current position, partially at the current segment, empty below.
    segmentFill: function( i ) {
      const span = 1 / this.segmentCount;
      const start = i * span;
      return _.clamp( ( this.scrollFraction - start ) / span, 0, 1 );
    },

    // The element (or window) whose scroll the rail reflects and drives.
    scrollSource: function() {
      if ( this.target === 'window' ) return window;
      return this.scrollEl;
    },

    bindScrollSource: function() {
      const old = this.scrollSource();
      if ( old ) old.removeEventListener('scroll', this.onScroll);

      // For an element target, resolve it now (the view that owns it is mounted).
      this.scrollEl = this.target === 'window' ? null : document.querySelector( this.target );

      const source = this.scrollSource();
      if ( source ) source.addEventListener('scroll', this.onScroll, { passive: true });

      this.measure();
    },

    // Current scroll metrics (window vs element have different property names).
    metrics: function() {
      if ( this.target === 'window' ) {
        const doc = document.documentElement;
        return {
          top: window.scrollY,
          viewport: window.innerHeight,
          scrollable: doc.scrollHeight - window.innerHeight,
        };
      }
      const el = this.scrollEl;
      if ( !el ) return { top: 0, viewport: 0, scrollable: 0 };
      return {
        top: el.scrollTop,
        viewport: el.clientHeight,
        scrollable: el.scrollHeight - el.clientHeight,
      };
    },

    measure: function() {
      const m = this.metrics();
      this.scrollable = m.scrollable;
      this.viewport = m.viewport;
      this.scrollFraction = m.scrollable > 0 ? _.clamp( m.top / m.scrollable, 0, 1 ) : 0;
    },

    onScroll: function() {
      // Don't fight the user's own drag; the drag already sets the fraction.
      if ( this.dragging ) return;
      this.measure();
    },

    // Map a pointer's Y over the rail to a scroll fraction and jump there. Uses the
    // rail box and scrollable height cached at pointerdown so the drag never reads
    // layout mid-move.
    jumpToPointer: function( clientY ) {
      const box = this.railBox;
      if ( !box || box.height <= 0 ) return;
      const fraction = _.clamp( ( clientY - box.top ) / box.height, 0, 1 );
      this.scrollFraction = fraction;

      const top = fraction * this.dragScrollable;
      const source = this.scrollSource();
      if ( !source ) return;
      if ( this.target === 'window' ) {
        window.scrollTo({ top: top });
      }
      else {
        source.scrollTop = top;
      }
    },

    onPointerDown: function( e ) {
      const rail = this.$refs.rail;
      if ( !rail ) return;
      // Capture the pointer so every move routes here (and the browser stops trying to
      // scroll the page under the touch). Without this, a touch-drag fights native
      // scrolling and, at the top of the page, can trigger pull-to-refresh.
      this.pointerId = e.pointerId;
      try { rail.setPointerCapture( e.pointerId ); } catch ( err ) {}

      this.dragging = true;
      this.railBox = rail.getBoundingClientRect();
      this.dragScrollable = this.metrics().scrollable;
      this.jumpToPointer( e.clientY );
      e.preventDefault();
    },

    // Coalesce the burst of pointermoves into one jump per frame: remember the latest
    // Y and schedule a single rAF that does the reactive write + scroll. This keeps a
    // jittery, high-frequency touch stream from re-rendering the rail and recomputing
    // the virtual scroller many times per frame (which is what chokes weak phones).
    flushDrag: function() {
      this.rafId = null;
      if ( !this.dragging || this.pendingY === null ) return;
      this.jumpToPointer( this.pendingY );
    },

    onPointerMove: function( e ) {
      if ( !this.dragging ) return;
      // Only the captured pointer drives the drag (ignore a second finger).
      if ( this.pointerId !== null && e.pointerId !== this.pointerId ) return;
      this.pendingY = e.clientY;
      if ( this.rafId === null ) this.rafId = requestAnimationFrame( this.flushDrag );
      e.preventDefault();
    },

    onPointerUp: function( e ) {
      if ( !this.dragging ) return;
      if ( this.pointerId !== null && e && e.pointerId !== this.pointerId ) return;
      const rail = this.$refs.rail;
      if ( rail && this.pointerId !== null ) {
        try { rail.releasePointerCapture( this.pointerId ); } catch ( err ) {}
      }
      this.pointerId = null;
      // Land on the final pointer position (a pending move may not have flushed yet),
      // then drop the coalescing state. railBox/dragScrollable are still set here.
      if ( this.rafId !== null ) {
        cancelAnimationFrame( this.rafId );
        this.rafId = null;
      }
      if ( this.pendingY !== null ) this.jumpToPointer( this.pendingY );
      this.pendingY = null;
      this.dragging = false;
      this.railBox = null;
      this.measure();
    },

  },
};
</script>

<style lang="scss" scoped>

.segment-rail {
  position: absolute;
  // Above the open book-details panel (which breaks out to full viewport width and
  // would otherwise paint its orange border over the rail).
  z-index: 20;
  top: 50%;
  left: -14px;
  transform: translateY(-50%);
  height: 80%;
  width: 5px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  cursor: pointer;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;

  // Window-scrolled (grid): pin to the viewport's left edge so it stays put while
  // the page scrolls, and keep it clear of the scrollbar on the right.
  &.fixed {
    position: fixed;
    left: 6px;
    height: 80vh;
  }

  // Bigger invisible hitbox without fattening the visible line.
  &:before {
    content: '';
    position: absolute;
    z-index: 1;
    top: -10px;
    bottom: -10px;
    left: -12px;
    right: -12px;
  }

  // Backing so content sliding under the rail (covers, the open details panel)
  // doesn't bleed through and muddy the pills. Slightly larger than the line.
  &:after {
    content: '';
    position: absolute;
    z-index: -1;
    top: -6px;
    bottom: -6px;
    left: -4px;
    right: -4px;
    border-radius: 999px;
    @include themify($themes) {
      background: rgba( themed(backColor), .85 );
    }
  }
}

.segment-block {
  position: relative;
  z-index: 0;
  flex: 1;
  border-radius: 999px;
  overflow: hidden;
  @include themify($themes) {
    // Toned-down track each pill fills over.
    background: rgba( themed(audibleOrange), .22 );
  }
}

// Per-pill fill: grows from the top of its own block by how far the scroll fraction
// has passed through that segment, so the gaps between pills stay visible at any
// position (the rail always reads as segmented, never one solid bar).
.segment-block-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  @include themify($themes) {
    background: themed(audibleOrange);
  }
}

</style>
