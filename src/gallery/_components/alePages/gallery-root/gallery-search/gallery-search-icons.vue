<template>
  <div class="icons">
    <div class="icon-wrap" v-tippy="{ trigger: 'click mouseenter' }" :content="'Items in current selection: <strong>'+ $store.getters.collection.length +'</strong> / <strong>' + $store.getters.collectionTotal +'</strong>.' + (!$store.getters.collectionHours ? '' : '<br> That amounts to: ' + $store.getters.collectionHours + ' ' + `or ${$store.getters.collectionDuration}.`) + ' ' + ($route.name === 'series' ? 'Owned books only!' : '')">
      <div class="book-in-selection">
        <div class="inner-wrap">
          {{ $store.getters.collection.length }}
        </div>
      </div>
    </div>

    <div
      v-for="item in filteredItems"
      :key="item.name"
      class="icon-wrap"
      :class="{ disabled: !item.on }"
      v-tippy
      :content="item.tooltip"
      @click="openSearchOptions(item, $event)"
      @mousedown="$haptic(1)"
    >
      <div
        class="search-opt-btn"
        :data-option="item.name"
        :class="{ active: listName === item.name, 'active-filters': item.name === 'filter' && filtersActive }"
      >
        <span v-html="item.icon"></span>
      </div>
    </div>
  </div>
</template>

<script>
// ICON IMPORTS
import IconMicroscope from '~icons/fa6-solid/microscope?raw';
import IconFilter     from '~icons/fa6-solid/filter?raw';
import IconSort       from '~icons/fa6-solid/sort?raw';

export default {
  name: "searchIcons",
  props: ["listName"],
  data: function() {
    return {
      items: [
        {
          name: "scope",
          on: true,
          active: false,
          icon: IconMicroscope,
          tooltip: "Change the search scope for more accurate results"
        },
        {
          name: "filter",
          on: true,
          active: false,
          icon: IconFilter,
          tooltip: "Filter books"
        },
        {
          name: "sort",
          on: true,
          active: false,
          icon: IconSort,
          tooltip: "Sort books"
        }
      ]
    };
  },
  
  computed: {
    // totalTitle: function() {
    //   return (( this.$route.meta.title === this.$store.state.pageTitle ) ? this.$store.state.pageTitle : (this.$store.state.pageTitle ? (this.$route.meta.title + ' - ' + this.$store.state.pageTitle) : this.$route.meta.title));
    // },
    filtersActive: function() {
      return this.$store.getters.filterExtrasKeys || (this.$store.getters.filterKeys !== 'notStarted,started,finished' && this.$store.getters.filterKeysLength );
    },
    
    filteredItems() {
      return _.filter( this.items, (item) => {
        return this.showIcon( item );
      });
    },
    
  },
  
  methods: {
    
    openSearchOptions: function(clickedOption, e) {
      const listBeforeClick = this.listName;
      this.$emit("update:listName", false);
      if (listBeforeClick !== clickedOption.name) {
        this.$nextTick(function() {
          this.$emit("update:listName", clickedOption.name);
        });
      }
    },
    
    showIcon: function( item ) {
      if ( !item ) return;
      switch ( item.name ) {
        case 'scope':
          return this.$store.state.listRenderingOpts[ item.name ].length > 0;
          break;
          
        case 'filter':
          let noRegularFilters = !this.$store.getters.regularFilters;
          return _.filter( this.$store.state.listRenderingOpts[ item.name ], function( filter ) {
            
            let isDivider = filter.type === 'divider';
            let isFilter = noRegularFilters ? true : filter.type === item.name;
            return !isDivider && isFilter;
            
          }).length > 0;
          break;
          
        case 'sort':
          return _.filter( this.$store.state.listRenderingOpts[ item.name ], function( filter ) {
            
            let isDivider = filter.type === 'divider';
            let isFilter = filter.type === item.name;
            return !isDivider && isFilter;
            
          }).length > 0;
          break;
      }
    },
    
  }
};
</script>


<style lang="scss" scoped>
  
  
  .book-in-selection {
    -webkit-touch-callout: none; 
    -webkit-user-select: none; 
    -khtml-user-select: none; 
    -moz-user-select: none; 
    -ms-user-select: none; 
    user-select: none; 
  }
  
</style>
