<template>
  <fa6-solid-circle-play
    class="pointer"
    @click="playSample(book, rowIndex)"
    :class="{ 'top-right': topRight }"
    :style="{ width: (size || 30) + 'px', height: 'auto' }"
    v-tippy content="Play sample audio"
  />
</template>

<script>
export default {
  name: "sampleButton",
  props: ["book", "index", "topRight", "size"],
  methods: {
    playSample: function(book, index) {
      
      if ( !book.sample ) {
        window.open(`${this.$store.state.urlOrigin}/webplayer?asin=${book.asin}&isSample=true`, '_blank');
      }
      else {
        
        this.$store.commit('prop', { 
          key: 'audioPlayer.audio', 
          value: {
            from: "book",
            route: this.$route,
            book: book,
            index: index
          } 
        });
        
      }
      
    }
  },
};
</script>

<style lang="scss" scoped>
.pointer { cursor: pointer; }
</style>
