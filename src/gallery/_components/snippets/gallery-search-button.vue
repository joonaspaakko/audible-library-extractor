<template>
  <div v-if="$store.state.searchMounted || true"
  class="search-btn icon"
  :class="{ float: float }"
  @click="startSearching"
  @mousedown="$haptic(1)"
  >
    <span class="search-icon-stack">
      <fa6-solid-magnifying-glass class="glass" />
      <fa6-solid-arrow-up class="up-arrow" />
    </span>
  </div>
</template>

<script>
export default {
  props: [ 'float' ],
  methods: {
    
    startSearching() {
      this.$compEmitter.emit("ios-auto-zoom-disable");
      this.$compEmitter.emit('search-focus');
    },
    
  }
};
</script>

<style lang="scss" scoped>


.search-btn {

  &:focus,
  &:active {
    color: $audibleOrange;
  }

  .search-icon-stack {
    position: relative;
    display: inline-flex;
    line-height: 1;
  }

  // Small upward arrow badge overlaid on the magnifying glass,
  // hinting that the button scrolls up before focusing the search.
  .up-arrow {
    position: absolute;
    top: -0.35em;
    right: -0.45em;
    font-size: 0.6em;
  }
  
  .float {
    position: absolute;
    top: -46px;
    cursor: pointer;
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
  }
  
}

</style>
