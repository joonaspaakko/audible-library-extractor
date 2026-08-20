<!--
  Button that hides either book details sidebar or summary depending on their order. Always keeps whichever is first, hides the other.
-->
<template>
<div class="details-first-hider" @click="flip">
  <ph-number-circle-one-fill v-if="detailSettings.hideFirstSection"/>
  <ph-number-circle-two-fill v-else/>
  <span class="label">{{ detailSettings.hideFirstSection ? 'Show one' : 'Show both' }}</span>
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
  display: flex;
  align-items: center;
}

</style>
