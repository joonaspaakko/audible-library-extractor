<template>
<div class="scroll-nav" :class="{ 'has-overflow': hasOverflow }">

  <div class="scroll-nav-arrow scroll-nav-arrow-prev" v-if="showPrevArrow" :class="{ disabled: atStart }" @click="scrollToSibling( -1 )" @mousedown="$haptic(1)">
    <fa-solid-chevron-left/>
  </div>

  <div class="scroll-nav-track" ref="track" @scroll="onScroll">
    <div class="scroll-nav-items" ref="items">
      <slot></slot>
    </div>
  </div>

  <div class="scroll-nav-arrow scroll-nav-arrow-next" v-if="showNextArrow" :class="{ disabled: atEnd }" @click="scrollToSibling( 1 )" @mousedown="$haptic(1)">
    <fa-solid-chevron-right/>
  </div>

</div>
</template>

<script>

export default {
  name: "scrollNav",
  props: {
    // 'ghost': arrows always rendered, dimmed + inert at the end they point past.
    // 'hide': arrows are removed from layout entirely at the end they point past.
    arrowStyle: { type: String, default: 'ghost' },
  },

  data: function() {
    return {
      hasOverflow: false,
      atStart: true,
      atEnd: true,
      resizeObserver: null,
    };
  },

  computed: {
    showPrevArrow() {
      return this.hasOverflow && ( this.arrowStyle === 'ghost' || !this.atStart );
    },
    showNextArrow() {
      return this.hasOverflow && ( this.arrowStyle === 'ghost' || !this.atEnd );
    },
  },

  mounted() {

    this.updateOverflow();
    this.scrollActiveIntoView();

    this.resizeObserver = new ResizeObserver( () => this.updateOverflow() );
    this.resizeObserver.observe( this.$refs.track );
    this.resizeObserver.observe( this.$refs.items );

  },

  beforeUnmount() {
    if ( this.resizeObserver ) this.resizeObserver.disconnect();
  },

  methods: {

    onScroll() {
      this.updateEdges();
    },

    updateOverflow() {
      const track = this.$refs.track;
      if ( !track ) return;
      this.hasOverflow = track.scrollWidth - track.clientWidth > 1;
      this.updateEdges();
    },

    // The active item can land in the overflow on load (eg. the last sub page selected), where
    // it's indistinguishable from nothing being selected at all. Jump it into view without an
    // animation, since this establishes initial state rather than responding to a user action.
    scrollActiveIntoView() {
      const track  = this.$refs.track;
      const active = this.$refs.items ? this.$refs.items.querySelector( '.active' ) : null;
      if ( !track || !active ) return;

      const max    = track.scrollWidth - track.clientWidth;
      const target = _.clamp( active.offsetLeft - ( track.clientWidth - active.offsetWidth ) / 2, 0, max );

      track.scrollLeft = target;
    },

    updateEdges() {
      const track = this.$refs.track;
      const items = this.$refs.items ? Array.from( this.$refs.items.children ) : [];
      if ( !track || !items.length ) return;

      const current = track.scrollLeft;
      const max     = track.scrollWidth - track.clientWidth;

      // Trailing items can all clamp to the same reachable offset (max), so matching by index
      // among duplicates is unreliable. Instead just check whether current has reached the
      // outermost reachable offset on either side, with enough tolerance for elastic overscroll
      // to settle a couple pixels short of the true rest point.
      const tolerance = 3;

      this.atStart = current <= tolerance;
      this.atEnd   = current >= max - tolerance;
    },

    // Scrolls exactly to the next/previous item's own edge, not an averaged/fixed distance.
    // The target is clamped to the real scrollable max so it never asks for an unreachable position.
    scrollToSibling( direction ) {

      const track = this.$refs.track;
      const items = this.$refs.items ? Array.from( this.$refs.items.children ) : [];
      if ( !track || !items.length ) return;

      const trackLeft = track.getBoundingClientRect().left;
      const current    = track.scrollLeft;
      const max        = track.scrollWidth - track.clientWidth;

      let target;

      if ( direction > 0 ) {
        const next = items.find( ( item ) => Math.round( item.getBoundingClientRect().left - trackLeft + current ) > current + 1 );
        target = next ? Math.min( next.offsetLeft, max ) : max;
      }
      else {
        const prev = _.findLast( items, ( item ) => Math.round( item.offsetLeft ) < current - 1 );
        target = prev ? prev.offsetLeft : 0;
      }

      track.scrollTo({ left: target, behavior: 'smooth' });

    },

  },
};
</script>


<style lang="scss" scoped>

.scroll-nav {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-width: 0;
}

.scroll-nav-track {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.scroll-nav-items {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  min-width: 100%;
  width: max-content;
  :deep(> *) {
    flex-shrink: 0;
    scroll-snap-align: start;
  }
}

.has-overflow .scroll-nav-items {
  justify-content: flex-start;
}
.scroll-nav-items {
  justify-content: center;
}

.scroll-nav-arrow {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  cursor: pointer;
  @include themify($themes) {
    color: rgba( themed(frontColor), .75);
  }
  &:hover {
    @include themify($themes) {
      color: themed(frontColor);
    }
  }
  &.disabled {
    pointer-events: none;
    opacity: .25;
  }
}

</style>
