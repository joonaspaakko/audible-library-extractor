<template>
<div class="icons">
  
  <div class="icon-wrap" content="Visible books" v-tippy="tippyConfig">
    <div class="book-in-selection">
      <div class="inner-wrap">
        <slot></slot>
      </div>
    </div>
  </div>
  
  <div 
  v-for="item in items" :key="item.name"
  class="icon-wrap" :class="{ disabled: !item.on }" 
  :content="item.tooltip" 
  v-tippy="tippyConfig"
  >
    
    <div 
    class="search-opt-btn" :data-option="item.name" :class="{ active: listOpen === item.name }" 
    @click="openSearchOptions( item, $event)" 
    >
      <font-awesome fas :icon="item.icon" />
    </div>

  </div>

  <!-- 
  <div class="icon-wrap" :class="{ disabled: !gallery.searchIcons.scope }">
    <div class="scope search-opt-btn" :class="{ active: gallery.searchOptions.open && currentOptionsListName === 'scope' }" @click="openSearchOptions('scope', $event)" content="Change the search scope for more accurate results" v-tippy="tippyConfig">
      <font-awesome fas icon="microscope" />
    </div>
  </div>
  <div class="icon-wrap" :class="{ disabled: !gallery.searchIcons.filter }">
    <div class="filter search-opt-btn" :class="{ active: gallery.searchOptions.open && currentOptionsListName === 'filter' }" @click="openSearchOptions('filter', $event)" content="Filter books" v-tippy="tippyConfig">
      <font-awesome fas icon="filter" />
    </div>
  </div>
  <div class="icon-wrap" :class="{ disabled: !gallery.searchIcons.sort }">
    <div class="sort search-opt-btn" :class="{ active: gallery.searchOptions.open && currentOptionsListName === 'sort', 'is-enabled': gallery.searchOptions.lists.iewsIndex > -1 }" @click="openSearchOptions('sort', $event)" content="Sort books" v-tippy="tippyConfig">
      <font-awesome fas icon="sort" />
    </div>
  </div> -->
  
</div>
</template>

<script>
export default {
  name: 'searchIcons',
  props: ['listOpen', 'searchOptions'],
	data : function() {
		return {
      tippyConfig: { placement: 'top', theme: this.$store.state.tippyTheme, maxWidth: 410 },
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
      
      const listBeforeClick = this.listOpen;
      // Open list or change source
      this.$emit("update:listOpen", clickedOption.name);
      // Close list if currently open option was clicked
      if ( this.listOpen && listBeforeClick === clickedOption.name ) this.$emit("update:listOpen", false);
      
    },
    
  },
  
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

</style>
