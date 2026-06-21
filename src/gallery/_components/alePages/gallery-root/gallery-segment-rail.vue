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
// scroll (one pill per viewport-ish), clamped between these bounds so a short page
// isn't littered with pills and a huge library doesn't explode the count.
const SEGMENT_MIN = 3;
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
    };
  },

  computed: {

    // Hide the rail when there is nothing meaningful to jump through (content fits
    // within roughly one viewport).
    visible: function() {
      return this.scrollable > 50;
    },

    // One pill per screenful of scrolling (scrollable / viewport), clamped to the
    // min/max so short pages stay clean and long ones don't over-segment.
    segmentCount: function() {
      if ( this.viewport <= 0 ) return SEGMENT_MIN;
      const screens = Math.round( this.scrollable / this.viewport );
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
  },
  beforeUnmount: function() {
    clearTimeout( this.settleTimer );
    this.$compEmitter.off('afterWindowResize', this.measure);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
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

    // Map a pointer's Y over the rail to a scroll fraction and jump there.
    jumpToPointer: function( clientY ) {
      const rail = this.$refs.rail;
      if ( !rail ) return;
      const box = rail.getBoundingClientRect();
      const fraction = _.clamp( ( clientY - box.top ) / box.height, 0, 1 );
      this.scrollFraction = fraction;

      const m = this.metrics();
      const top = fraction * m.scrollable;
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
      this.dragging = true;
      this.$haptic( 1 );
      this.jumpToPointer( e.clientY );
      e.preventDefault();
    },

    onPointerMove: function( e ) {
      if ( !this.dragging ) return;
      this.jumpToPointer( e.clientY );
      // Stop the page/container from scrolling under a touch-drag on the rail.
      e.preventDefault();
    },

    onPointerUp: function() {
      if ( !this.dragging ) return;
      this.dragging = false;
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
