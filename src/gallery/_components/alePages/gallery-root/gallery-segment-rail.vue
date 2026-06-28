<template>
<div
  v-show="visible"
  class="segment-rail"
  :class="{ fixed: fixed }"
>
  <!-- Cosmetic, fixed-count segment blocks. They are NOT jump targets: the jump is
       continuous (proportional to pointer position). Each block fills itself by how
       far the scroll fraction has passed through it, so the gaps between pills stay
       visible at any scroll position (the rail always reads as segmented). -->
  <div class="segment-blocks" aria-hidden="true">
    <div
      v-for="n in segmentCount"
      :key="n"
      class="segment-block"
    >
      <div class="segment-block-fill" :style="{ height: ( segmentFill( n - 1 ) * 100 ) + '%' }"></div>
    </div>
  </div>

  <!-- Running count of items scrolled past. -->
  <div
    v-if="total > 0 && $store.state.scrollVisibleIndex >= 0"
    v-show="showLabel"
    class="segment-rail-label"
    :style="{ top: ( scrollFraction * 100 ) + '%' }"
  >{{ $store.state.scrollVisibleIndex + 1 }}</div>

  <!-- Naive-ui slider handles all touch/pointer routing correctly on iOS —
       its internal pointer tracking doesn't fight native scroll the way our
       custom rAF loop did. Track and thumb are made transparent via theme
       overrides; the segment blocks above are the visual. -->
  <n-config-provider :theme="naiveTheme" :theme-overrides="naiveThemeOverrides">
    <n-slider
      class="segment-rail-slider"
      :value="sliderValue"
      :min="0"
      :max="SLIDER_MAX"
      :step="1"
      :tooltip="false"
      :vertical="true"
      :reverse="true"
      @update:value="onSliderUpdate"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
    />
  </n-config-provider>

</div>
</template>

<script>
import { NConfigProvider, NSlider, darkTheme, lightTheme } from 'naive-ui';

// VISUAL SEGMENT COUNT
// Purely cosmetic blocks. The count scales with how many screenfuls there are to
// scroll (one pill per viewport-ish), clamped between these bounds. The min is 1 so a
// page with barely any scrolling doesn't show 3 pills implying multiple screenfuls
// that aren't there; the max keeps a huge library from exploding the count.
const SEGMENT_MIN = 1;
const SEGMENT_MAX = 12;

const SLIDER_MAX = 10000;

// Naive-ui theme overrides that make the slider's own track and thumb invisible
// so only our segment blocks show. The slider still handles all pointer/touch events.
const TRANSPARENT_OVERRIDES = {
  Slider: {
    railColor: 'transparent',
    railColorHover: 'transparent',
    fillColor: 'transparent',
    fillColorHover: 'transparent',
    handleColor: 'transparent',
    dotBorderActive: 'none',
    handleBoxShadow: 'none',
    handleBoxShadowHover: 'none',
    handleBoxShadowActive: 'none',
    handleBoxShadowFocus: 'none',
  },
};

export default {
  name: 'gallerySegmentRail',
  components: { NConfigProvider, NSlider },

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
    // Drives the running count label. When 0 the label never shows, so call sites
    // without a meaningful count can simply omit it.
    total: {
      type: Number,
      default: 0,
    },
    // Raw virtual items array from the active virtualizer. When provided, the rail
    // filters them to the visible viewport and commits the last visible index to
    // the store, replacing the per-view duplicate filtering logic.
    virtualItems: {
      type: Array,
      default: null,
    },
    // Number of books per virtualizer row (grid view: cols; list view: 1).
    cols: {
      type: Number,
      default: 1,
    },
  },

  data: function() {
    return {
      SLIDER_MAX: SLIDER_MAX,
      scrollFraction: 0,
      scrollable: 0,
      viewport: 0,
      dragging: false,
      scrollEl: null,
      showLabel: false,
    };
  },

  computed: {

    visible: function() {
      return this.scrollable > 50;
    },

    segmentCount: function() {
      const viewport = this.viewport > 0 ? this.viewport : window.innerHeight;
      if ( viewport <= 0 ) return SEGMENT_MIN;
      const screens = Math.round( this.scrollable / viewport );
      return _.clamp( screens, SEGMENT_MIN, SEGMENT_MAX );
    },

    // Only push a value to the slider when not dragging — let naive-ui own the
    // value during drag so its internal state doesn't fight Vue's binding.
    sliderValue: function() {
      return this.dragging ? undefined : Math.round( this.scrollFraction * SLIDER_MAX );
    },

    naiveTheme: function() {
      return this.$store.state.sticky.lightSwitch ? lightTheme : darkTheme;
    },

    naiveThemeOverrides: function() {
      return TRANSPARENT_OVERRIDES;
    },

  },

  mounted: function() {
    this.bindScrollSource();
    const vue = this;
    this.$nextTick(function() { vue.measure(); });
    clearTimeout( this.settleTimer );
    this.settleTimer = setTimeout(function() { vue.measure(); }, 300);
    this.$compEmitter.on('afterWindowResize', this.measure);
  },
  beforeUnmount: function() {
    clearTimeout( this.settleTimer );
    clearTimeout( this.labelTimer );
    this.$compEmitter.off('afterWindowResize', this.measure);
    const source = this.scrollSource();
    if ( source ) source.removeEventListener('scroll', this.onScroll);
  },

  watch: {
    target: function() {
      this.bindScrollSource();
    },
    virtualItems: function() {
      this.updateVisibleIndex();
    },
  },

  methods: {

    segmentFill: function( i ) {
      const span = 1 / this.segmentCount;
      const start = i * span;
      return _.clamp( ( this.scrollFraction - start ) / span, 0, 1 );
    },

    scrollSource: function() {
      if ( this.target === 'window' ) return window;
      return this.scrollEl;
    },

    bindScrollSource: function() {
      const old = this.scrollSource();
      if ( old ) old.removeEventListener('scroll', this.onScroll);

      this.scrollEl = this.target === 'window' ? null : document.querySelector( this.target );

      const source = this.scrollSource();
      if ( source ) source.addEventListener('scroll', this.onScroll, { passive: true });

      this.measure();
    },

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
      if ( this.dragging ) return;
      this.measure();
      this.updateVisibleIndex();
      this.flashLabel();
    },

    updateVisibleIndex: _.throttle( function() {
      const items = this.virtualItems;
      if ( !items || !items.length || this.total <= 0 ) return;
      const m = this.metrics();
      const scrollTop = m.top;
      const viewEnd = scrollTop + m.viewport;
      const inView = items.filter(function( r ) { return r.end > scrollTop && r.start < viewEnd; });
      const lastRow = inView.length ? inView[ inView.length - 1 ].index : items[ items.length - 1 ].index;
      const lastIndex = Math.min( lastRow * this.cols + this.cols - 1, this.total - 1 );
      this.$store.commit('prop', { key: 'scrollVisibleIndex', value: lastIndex });
    }, 100, { leading: true, trailing: true } ),

    flashLabel: function() {
      if ( this.total <= 0 ) return;
      this.showLabel = true;
      this.armLabelHide();
    },

    armLabelHide: function() {
      const vue = this;
      clearTimeout( this.labelTimer );
      this.labelTimer = setTimeout(function() { vue.showLabel = false; }, 700);
    },

    jumpToFraction: function( fraction ) {
      const m = this.metrics();
      const top = _.clamp( fraction, 0, 1 ) * m.scrollable;
      const source = this.scrollSource();
      if ( !source ) return;
      if ( this.target === 'window' ) {
        window.scrollTo( 0, top );
      }
      else {
        source.scrollTop = top;
      }
    },

    onDragStart: function() {
      this.dragging = true;
      if ( this.total > 0 ) {
        clearTimeout( this.labelTimer );
        this.showLabel = true;
      }
    },

    onSliderUpdate: function( value ) {
      const fraction = value / SLIDER_MAX;
      this.scrollFraction = fraction;
      this.jumpToFraction( fraction );
      this.updateVisibleIndex();
    },

    onDragEnd: function() {
      this.dragging = false;
      if ( this.total > 0 ) this.armLabelHide();
    },

  },
};
</script>

<style lang="scss" scoped>

.segment-rail {
  position: absolute;
  z-index: 20;
  top: 50%;
  left: -14px;
  transform: translateY(-50%);
  height: 80%;
  width: 5px;
  -webkit-user-select: none;
  user-select: none;

  &.fixed {
    position: fixed;
    left: 6px;
    height: 80vh;
  }

  // Backing so content sliding under the rail doesn't bleed through the pills.
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

// Cosmetic segment blocks sit behind the invisible slider.
.segment-blocks {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  pointer-events: none;
}

.segment-block {
  position: relative;
  z-index: 0;
  flex: 1;
  border-radius: 999px;
  overflow: hidden;
  @include themify($themes) {
    background: rgba( themed(audibleOrange), .22 );
  }
}

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

.segment-rail-label {
  position: absolute;
  z-index: 1;
  left: 9px;
  width: max-content;
  min-width: max-content;
  flex: none;
  transform: translateY(-50%);
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1;
  font-weight: 600;
  pointer-events: none;
  transition: opacity .15s ease;
  @include themify($themes) {
    background: rgba( themed(backColor), .9 );
    color: themed(audibleOrange);
  }
}

// The slider fills the full rail and extends the hitbox on all sides.
// Its track/thumb are invisible (theme overrides); it only provides touch handling.
.segment-rail-slider {
  position: absolute !important;
  top: -10px !important;
  bottom: -10px !important;
  left: -12px !important;
  right: -12px !important;
  width: calc( 100% + 24px ) !important;
  height: calc( 100% + 20px ) !important;
}

</style>


