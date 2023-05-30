<!--
  Button that hides either book details sidebar or summary depending on their order. Always hides whichever is first.
-->
<template>
<div class="details-first-hider" 
:class="{ flip: detailSettings.hideFirstSection }"
@click="flip"
>
  
  <!-- <fluent-circle-small-20-filled />
  <fluent-circle-12-filled/> -->
  <!-- <fa6-regular-eye-slash v-if="detailSettings.hideFirstSection"/>
  <fa6-regular-eye v-else /> -->
  <ph-number-circle-one-fill v-if="detailSettings.hideFirstSection"/>
  <ph-number-circle-two-fill v-else/>

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
      this.$store.commit('prop', { 
        key: 'sticky.bookDetailSettings.hideFirstSection', 
        value: !this.detailSettings.hideFirstSection 
      });
    },
  }
};
</script>

<style lang="scss" scoped>


.details-first-hider {
  @extend .no-selection;
  @include themify($themes) {
    // display: flex;
    // flex-direction: row;
    font-size: 18px;
    cursor: pointer;
    transition: color 200ms cubic-bezier(0, 0, 0, .1);
    color: rgba(themed(frontColor), 0.4);
    &.active,
    &:hover {
      color: themed(frontColor);
    }
  }
  
  // &.flip {
  //   flex-direction: row-reverse;
  // }
}

</style>
