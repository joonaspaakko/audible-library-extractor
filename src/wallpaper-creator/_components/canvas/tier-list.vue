<template>
  <div>
    
    <div 
      v-for="(tier, index) in visibleTiers" 
      :key="tier.key" 
      class="row tier-list-row"
      :style="{
        marginTop: (store.paddingSize*1.5)+'px',
        borderRadius: (store.coverSize * store.borderRadius) + 'px',
      }"
    >
      
      <div 
        v-if="tier.key !== 'container'"
        data-tier-list-label
        class="label panzoom-exclude" 
        ref="label"
        :style="{ 
          background: tier.color, 
          margin: store.paddingSize+'px',
          borderRadius: (store.coverSize * store.borderRadius) + 'px',
          // padding: (this.store.coverSize/13) + 'px',
          width: (store.coverSize-(store.coverSize/5))+'px', 
          minHeight: (store.coverSize-(store.coverSize/5))+'px',
          padding: (store.coverSize/5)/2+'px',
        
        }"
        @click="editableFocus"
      >
        <div>
          <tier-list-label :tier="tier" :index="index" :visibleTiers="visibleTiers" />
        </div>
      </div>
      
      <draggable 
        v-model="tier.list" 
        class="drag-container" 
        item-key="asin"
        group="covers"
        @start="$emit('start', $event)" 
        @move="$emit('move', $event)" 
        @end="$emit('end', $event)"
      >
        <template #item="{element}">
          <cover :key="element.asin" :book="element"></cover>
        </template>
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
  
  computed: {
    visibleTiers: function() {
      return _.filter( this.store.tiers, function( o ){ return o.visible && o.key !== 'container' });
    },
  },
  
  created: function() {
    
    // this.$store.commit('tierConcat', {
    //   key: 'container',
    //   list: this.store.covers,
    //   ifEmpty: true,
    // });
    
  },
  
  methods: {
    
    editableFocus( e ) {
      console.log( e );
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
  // &:hover {
  //   background: rgba(#ffbf7e, .3);
  // }
}

.drag-container {
  flex: 1;
  // overflow: hidden;
}

.dragging-into {
  background: rgba(#ffbf7e, 1);
}

.label {
  color: #151515;
  &, & > div {
    display: inline-flex;
    text-align: center;
    justify-content: center;
    align-items: center;
  }
  > div {
    width: 100%;
    height: 100%;
  }
  font-weight: 800;
  -webkit-user-select: text !important;
  -khtml-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
}

</style>
