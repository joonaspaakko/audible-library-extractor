<template>
  <div
    class="col-resizer"
    :class="{ dragging: startPosition }"
    @mousedown="resizeMouseDown"
    @mouseup="resizeMouseUp"
    @mousemove="resizeMouseMove"
  >
    <div
      class="floater-boy"
      v-if="mouseX"
      :style="{ left: mouseX + 'px' }"
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
      endPosition: null,
      dragging: false,
      minWidth: 30,
      width: null,
      mouseX: 0,
      threshold: 10
    };
  },

  created: function() {
    this.colClass = this.identifier.split(" ")[0];
  },

  methods: {
    resizeMouseDown: function(e) {
      this.endPosition = null;
      this.startPosition = e.clientX;
    },

    resizeMouseMove: _.throttle(function(e) {
      if (this.startPosition) {
        if (Math.abs(this.startPosition - e.clientX) >= this.threshold) {
          this.dragging = true;
          this.mouseX = e.clientX;
        }
      }
    }, 65),

    resizeMouseUp: function(e) {
      if (this.dragging) {
        this.endPosition = e.clientX;
        const prevDistance = this.width ? this.width : e.currentTarget.parentElement.offsetWidth;
        const dragDistance = Math.abs(this.startPosition - this.endPosition);
        const addition = this.endPosition > this.startPosition ? true : false;
        const width = prevDistance + (addition ? +dragDistance : -dragDistance);
        this.width = width < this.minWidth ? this.minWidth : width;
      }

      this.dragging = null;
      this.endPosition = null;
      this.startPosition = null;
      this.mouseX = 0;
    }
  }
};
</script>

<style lang="scss" scoped>


.col-resizer {
  width: 8px;
  // background: rgba( red, .4);
  &:hover {
    @include themify($themes) {
      background: rgba(themed(frontColor), 0.2);
    }
  }
  position: absolute !important;
  top: 0;
  right: 0;
  bottom: 0;
  cursor: col-resize;

  &.dragging:before {
    content: "";
    position: fixed;
    z-index: 999;
    // background: rgba( red, .4 );
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .floater-boy {
    opacity: 0;
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: #0b6fee;
  }
  &.dragging .floater-boy {
    opacity: 0.5;
  }
}
</style>
