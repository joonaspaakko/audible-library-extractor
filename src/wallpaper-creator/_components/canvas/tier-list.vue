<template>
  <div>
    
    <div v-for="tier in visibleTiers" :key="tier.key" class="row"
    :style="{
      marginTop: (store.coverSize/8)+'px',
      minHeight: store.coverSize+'px',
    }">
      
      <div 
      v-if="tier.key !== 'container'"
      class="label" 
      :style="{ 
        background: tier.color, 
        fontSize: (store.coverSize/3)+'px', 
        width: store.coverSize+'px',
        lineHeight: store.coverSize+'px',
        margin: store.paddingSize+'px',
      }"
      >{{ tier.key }}</div>
      
      <draggable class="drag-container" v-model="tier.list" group="covers" @end="$emit('draggingEnded')">
        <cover v-for="book in tier.list" :key="book.asin" :book="book"></cover>
      </draggable>
      
    </div>
  </div>
</template>

<script>

import draggable from 'vuedraggable';
import cover from '@editor-comps/canvas/cover.vue';

export default {
  components: { 
    draggable,
    cover,
  },
  data: function () {
    return {
      store: this.$store.state,
    };
  },
  
  created: function() {
    
    // this.$store.commit('tierConcat', {
    //   key: 'container',
    //   list: this.store.covers,
    //   ifEmpty: true,
    // });
    
  },

  computed: {
    visibleTiers: function() {
      return _.filter( this.store.tiers, function( o ){ return o.visible && o.key !== 'container' });
    },
  },
  
};
</script>

<style scoped lang="scss">

.row {
  display: flex;
  justify-content: flex-start;
  align-content: flex-start;
  &:first-child { margin-top: 0 !important; }
}

.drag-container {
  flex: 1;  
}

.label {
  color: #151515;
  display: inline-block;
  text-align: center;
  font-weight: 800;
}

</style>
