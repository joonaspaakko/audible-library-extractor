<template>

  <input
    class="zoom-zoom"
    type="range"
    min="0.1"
    max="3"
    :value="store.canvas.zoom"
    @input="$emitter.emit('canvas-zoom', $event.target.value)"
    step=".01"
    @dblclick="$emitter.emit('canvas-reset-zoom')"
  />

  <div
    v-tippy content="Click to reset to 100% zoom"
    class="zoom-text"
    :class="{ highlight: store.canvas.zoom != 1 }"
    @click="$emitter.emit('canvas-reset-zoom')"
  >
    {{ zoomPercentage }}%
  </div>

</template>

<script>

// Split out of the toolbar so a zoom change only re-renders these two elements.
// Re-rendering the toolbar itself rebuilds every v-tippy instance on it, which
// tears down and re-adds their listeners on every single zoom event.
export default {
  name: "zoom-slider",
  data: function () {
    return {
      store: this.$store.state,
    };
  },
  computed: {

    zoomPercentage: function () {
      var zoom = this.store.canvas.zoom == 0 ? 1 : this.store.canvas.zoom;
      return Math.floor(zoom * 100);
    },

  },
};
</script>

<style scoped lang="scss">

.zoom-zoom {
  position: relative;
  width: 120px;
  transform: rotate(180deg);
  transform-origin: center center;
}

.zoom-text {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  transform: rotate(-90deg);
  transform-origin: center center;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: pointer;
  position: relative;
  font-size: 11px !important;
  &.highlight {
    color: #ffc02b !important;
    opacity: 1;
  }
}

</style>
