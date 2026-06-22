<template>
  <transition name="fade">
    <div
      v-if="peek.visible && peek.blurb"
      class="blurb-peek"
      :style="panelStyle"
    >{{ peek.blurb }}</div>
  </transition>
</template>

<script>
import blurbPeekController from "@output-snippets/gallery-blurb-peek-controller.js";

export default {
  name: "blurbPeek",
  mixins: [ blurbPeekController ],
  computed: {

    // Sit just above the pointer, clamped so the panel never runs off either edge.
    panelStyle: function() {
      const width = 280;
      const margin = 10;
      let left = this.peek.x - ( width / 2 );
      left = Math.max( margin, Math.min( left, window.innerWidth - width - margin ) );
      return {
        left: left + 'px',
        top: this.peek.y + 'px',
        width: width + 'px',
      };
    },

  },
};
</script>

<style lang="scss" scoped>

.blurb-peek {
  position: fixed;
  z-index: 9999;
  transform: translateY( calc( -100% - 18px ) );
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.4;
  text-align: left;
  pointer-events: none;
  max-height: 50vh;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(#000, 0.5);
  @include themify($themes) {
    background: rgba( themed(backColor), 0.97 );
    color: themed(frontColor);
    border: 1px solid rgba( themed(outerColor), 0.3 );
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .12s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

</style>
