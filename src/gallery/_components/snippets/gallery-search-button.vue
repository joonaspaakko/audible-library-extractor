<template>
  <div v-if="$store.state.searchMounted || true" 
  class="search-btn icon" 
  :class="{ float: float }"
  @click="startSearching" 
  v-tippy="{ interactive: true, allowHTML: true }" 
  content='
    Click to scroll up and search. <br>
    Read about advanced search operators 
    <a target="_blank" rel="noopener noreferrer" href="https://joonaspaakko.gitbook.io/audible-library-extractor/gallery/advanced-search">
      here
    </a>.'
  >
    <fa-solid-search/>
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
