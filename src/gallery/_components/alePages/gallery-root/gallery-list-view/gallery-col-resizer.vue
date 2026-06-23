<template>
  <div
    class="col-resizer"
    :class="{ dragging: startPosition }"
    @mousedown="resizeMouseDown"
  >
    <div
      class="floater-boy"
      v-if="dragging"
      :style="{ left: edgeX + 'px', top: edgeTop + 'px', height: edgeHeight + 'px' }"
    ></div>
    <component is="style" type="text/css" v-if="width">
      .{{ colClass }} { width: {{ width }}px !important; }
    </component>
  </div>
</template>

<script>
export default {
  name: "colResizer",
  props: ["identifier"],
  data: function() {
    return {
      colClass: "",
      startPosition: null,
      startWidth: null,
      dragging: false,
      minWidth: 30,
      width: null,
      edgeX: 0,
      edgeTop: 0,
      edgeHeight: 0,
      threshold: 10
    };
  },

  created: function() {
    this.colClass = this.identifier.split(" ")[0];
    // Restore a previously saved width for this column so resizes survive reloads.
    const widths = this.$store.state.sticky.listColumnsWidths;
    if ( widths && widths[ this.colClass ] ) this.width = widths[ this.colClass ];
    // Stable references for the window listeners, so they can be removed again.
    this.boundMove = this.resizeMouseMove.bind(this);
    this.boundUp = this.resizeMouseUp.bind(this);
  },

  beforeUnmount() {
    window.removeEventListener('mousemove', this.boundMove);
    window.removeEventListener('mouseup', this.boundUp);
  },

  watch: {
    // Keep local width in sync when the shared map changes elsewhere, mainly so the menu's
    // Reset (which clears listColumnsWidths) drops this column back to its natural width.
    '$store.state.sticky.listColumnsWidths'( widths ) {
      this.width = _.get( widths, this.colClass ) || null;
    }
  },

  methods: {
    resizeMouseDown: function(e) {
      // preventDefault stops the header label from being text-selected as you drag.
      e.preventDefault();
      this.startPosition = e.clientX;
      // Capture the column's current width up front so widening/narrowing is measured from
      // a fixed baseline. Reading it at release breaks on frozen (sticky) columns.
      const cell = e.currentTarget.parentElement;
      this.startWidth = this.width ? this.width : cell.offsetWidth;
      // Baseline for the marker line: the cell's rendered right edge (the divider) minus the
      // current width, so during the drag the line sits at thatBase + width. Using the cell's
      // own right edge accounts for padding/border, which a content-left + width sum would miss.
      this.edgeBase = cell.getBoundingClientRect().right - this.startWidth;
      // Constrain the marker line to the scroll wrap's visible bounds (it holds both the
      // sticky header and the rows) so the line doesn't overflow past the table.
      const wrap = cell.closest( '.list-view-inner-wrap' );
      const wrapRect = wrap ? wrap.getBoundingClientRect() : null;
      this.edgeTop = wrapRect ? wrapRect.top : 0;
      const bottom = wrapRect ? Math.min( wrapRect.bottom, window.innerHeight ) : window.innerHeight;
      this.edgeHeight = bottom - this.edgeTop;
      // Track the pointer on the window, not the resizer: a frozen column stays put while
      // the pointer sweeps off the handle into the neighbouring cell, so element-bound
      // move/up events would drop and widening would never register.
      window.addEventListener('mousemove', this.boundMove);
      window.addEventListener('mouseup', this.boundUp);
    },

    resizeMouseMove: _.throttle(function(e) {
      if ( this.startPosition ) {
        if ( Math.abs(this.startPosition - e.clientX) >= this.threshold ) {
        
          this.dragging = true;
          // Apply the width live as the pointer moves so the column edge tracks the drag,
          // measured from the baseline captured at mousedown.
          const dragDistance = e.clientX - this.startPosition;
          const width = this.startWidth + dragDistance;
          this.width = width < this.minWidth ? this.minWidth : width;
          // Pin the marker line to the column's right edge (clamped), not the raw cursor.
          this.edgeX = this.edgeBase + this.width;
          
        }
      }
    }, 16),

    resizeMouseUp: function(e) {
      window.removeEventListener('mousemove', this.boundMove);
      window.removeEventListener('mouseup', this.boundUp);

      // The live move already set this.width; just persist the final value.
      if (this.dragging) this.persistWidth();

      this.dragging = null;
      this.startPosition = null;
      this.startWidth = null;
    },

    // Save this column's width into the shared widths map so it restores on reload, then
    // nudge the list view to re-measure frozen offsets since a width change shifts the stack.
    persistWidth() {

      const widths = _.clone( this.$store.state.sticky.listColumnsWidths ) || {};
      _.set(widths, this.colClass, this.width);

      this.$store.commit( 'stickyProp', { key: 'listColumnsWidths', value: widths });
      this.$nextTick( () => {
        this.$compEmitter.emit('afterWindowResize');
      });
      
    }
  }
};
</script>

<style lang="scss" scoped>


.col-resizer {
  // Straddle the divider between two columns: shifted half its width past the right edge
  // so the grab zone overlaps the line and is reachable from either neighbouring column.
  width: 12px;
  // background: rgba( red, .4);
  &:hover {
    @include themify($themes) {
      background: rgba(themed(frontColor), 0.2);
    }
  }
  position: absolute !important;
  top: 0;
  right: -6px;
  bottom: 0;
  z-index: 3;
  cursor: col-resize;

  // Full-screen shield during a drag: holds the col-resize cursor everywhere and blocks
  // text selection, even as the pointer sweeps over other cells. Window listeners handle
  // the actual move/up, so this is purely cosmetic now.
  &.dragging:before {
    content: "";
    position: fixed;
    z-index: 999;
    // background: rgba( red, .4 );
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    cursor: col-resize;
    user-select: none;
  }

  // Pinned to the column's right edge (left driven inline from edgeX), so it marks exactly
  // where the resize lands instead of floating at the cursor. top/height are driven inline
  // to match the table's bounds so the line doesn't overflow past it.
  .floater-boy {
    position: fixed;
    z-index: 9999;
    width: 2px;
    background: #0b6fee;
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
