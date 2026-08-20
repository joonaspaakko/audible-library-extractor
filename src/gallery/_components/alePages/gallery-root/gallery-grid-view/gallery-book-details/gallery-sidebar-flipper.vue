<template>
<div
  class="action-reverse-direction"
  @click="flip"
>
  <span class="icon" :class="{ flip: detailSettings.reverseDirection }">
    <ri-toggle-line/>
  </span>
  <span class="label">{{ sidebarSideLabel }}</span>
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

  computed: {
    // Matches gallery-book-details.vue's own mobileWidth breakpoint, since this
    // label describes where that component currently puts the sidebar.
    sidebarSideLabel() {
      const mobile = this.$store.state.windowWidth <= 688;
      if ( mobile ) return this.detailSettings.reverseDirection ? 'Summary on top' : 'Info on top';
      return this.detailSettings.reverseDirection ? 'Sidebar on right' : 'Sidebar on left';
    },
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
