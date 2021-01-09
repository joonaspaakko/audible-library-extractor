<template>
<div class="icons">
  
  <div class="icon-wrap" v-tippy content="Visible books">
    <div class="book-in-selection">
      <div class="inner-wrap">
        <slot></slot>
      </div>
    </div>
  </div>
  
  <div 
  v-for="item in items" :key="item.name"
  class="icon-wrap" :class="{ disabled: !item.on }" 
  v-tippy :content="item.tooltip" 
  >
    
    <div 
    class="search-opt-btn" :data-option="item.name" :class="{ active: listName === item.name }" 
    @click="openSearchOptions( item, $event)" 
    >
      <font-awesome fas :icon="item.icon" />
    </div>

  </div>
  
</div>
</template>

<script>
export default {
  name: 'searchIcons',
  props: ['listName'],
	data : function() {
		return {
      items: [
        { 
          name: 'scope', 
          on: true, 
          active: false, 
          icon: 'microscope', 
          tooltip: "Change the search scope for more accurate results", 
        },
        { 
          name: 'filter', 
          on: true, 
          active: false, 
          icon: 'filter', 
          tooltip: "Filter books", 
        },
        { 
          name: 'sort', 
          on: true, 
          active: false, 
          icon: 'sort', 
          tooltip: "Sort books", 
        },
      ]
		}
  },
  
  methods: {
    
    openSearchOptions: function( clickedOption, e ) {
      
      const listBeforeClick = this.listName;
      this.$emit("update:listName", false);
      if ( listBeforeClick !== clickedOption.name ) {
        this.$nextTick(function() { 
          this.$emit("update:listName", clickedOption.name); 
        });
      }
      
    },
    
  },
  
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

</style>
