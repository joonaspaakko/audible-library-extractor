<template>
  <font-awesome 
  fas 
  icon="play-circle" 
  class="pointer" 
  @click="playSample( book, rowIndex )" 
  :class="{ 'top-right': topRight }"
  :style="{ width: (size || 30) + 'px', height: 'auto' }"
  />
</template>

<script>
export default {
  name: 'sampleButton',
  props: ['book', 'index', 'topRight', 'size'],
  methods: {
        
    playSample: function( book, index ) {
      Eventbus.$emit('play-audio', {
        from: 'sampleButton',
        route: this.$route,
        book: book,
        index: index,
      });
    },
    
  },
}
</script>

<style lang="scss" scoped>
  
</style>
