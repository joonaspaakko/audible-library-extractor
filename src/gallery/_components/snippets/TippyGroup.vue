<template>
  <component :is="tag">
    <slot @hook:mounted="slotMounted" />
  </component>
</template>

<script>
import { tippy } from "vue-tippy";

export default {
  props: {
    tag: {
      default: () => "div",
    },
    delay: {},
  },

  mounted() {
    // not sure if nextTick is needed
    this.$nextTick(() => {
      
      const tippyComponents = [
        ...this.$el.querySelectorAll("[data-tippy-component-trigger]"),
      ].map((el) => el._tippy);

      const tippyDirectives = [
        ...this.$el.querySelectorAll("[data-tippy-directive]"),
      ].map((el) => el._tippy);
      
      if ( !tippyComponents.length ) return;
      tippy.group(_.compact([...tippyComponents, ...tippyDirectives]), {
        delay: this.delay,
      });
      
    });
  },
};
</script>