<template>
  <div class="mobile-back-btns-wrapper" :class="{ 'viewport-float': viewportFloat }">
    <div class="mobile-back-btns" :class="{ disabled: $store.state.navHistory.back.length < 1 }" @click.prevent="navigate('back')">
      <fa-solid-chevron-left/>
    </div>
    
    <div class="mobile-back-btns" :class="{ disabled: $store.state.navHistory.forward.length < 1 }" @click.prevent="navigate('forward')">
      <fa-solid-chevron-right/>
    </div>
  </div>
</template>

<script>
export default {
  name: "backForwardBtns",  
  props: [ 'viewportFloat' ],
  methods: {
    
    navigate: function( direction ) {
      if ( this.$store.state.navHistory[ direction ].length > 0 ) {
        this.$store.commit('navHistory', { key: direction, value: this.$route.name });
        this.$router[ direction ]();
      }      
    },
    
  }
};
</script>

<style scoped lang="scss">


.mobile-back-btns-wrapper {
  @extend .center-contents;
  position: absolute;
  z-index: 1;
  right: 65px;
  white-space: nowrap;
}
.mobile-back-btns {
  cursor: pointer;
  @extend .no-selection;
  @extend .center-contents;
  border-radius: 999999px;
  width:  32px;
  height: 32px;
  // @include themify($themes) {
  //   background: rgba( themed(backColor), .25);
  // }
  &, svg { color: #fff; }
  background: rgba( #292929, .90);
  border: 1px solid rgba( #fff, 1);
  
  position: relative;
  top: 0;
  margin: 7px;
  &, a {
    @extend .center-contents;
    width:  32px;
    height: 32px;
  }
  &.disabled {
    border-color: #b1b1b1 !important;
  }
  &.disabled svg {
    color: #999 !important;
  }
}

.viewport-float {
  position: fixed;
  top: unset !important;
  bottom: 20px;
  right: 20px;
}

</style>