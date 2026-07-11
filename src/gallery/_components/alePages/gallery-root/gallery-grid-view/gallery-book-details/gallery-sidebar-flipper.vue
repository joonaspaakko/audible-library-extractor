<template>
<div
  class="action-reverse-direction"
  @click="flip"
>
  <span class="icon" :class="{ flip: detailSettings.reverseDirection }">
    <ri-toggle-line/>
  </span>
  <span class="label">Swap panels</span>
</div>
</template>

<script>
export default {
  name: "sidebarFlipper",
  data: function() {
    return {
      detailSettings: this.$store.state.sticky.bookDetailSettings,
    };
  },
  
  methods: {
    flip() {
      this.$emit('flip');
    },
  }
};
</script>

<style lang="scss" scoped>

.action-reverse-direction {
  @extend .no-selection;
  display: flex;
  flex-direction: row;
  align-items: center;

  .icon {
    display: inline-block;
    &.flip {
      transform: scaleX(-1);
    }
  }
}

</style>
