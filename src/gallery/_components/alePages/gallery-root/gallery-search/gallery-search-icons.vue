<template>
  <div class="icons">
    <tippy tag="div" class="icon-wrap" trigger="click mouseenter" interactive>
      <div class="book-in-selection">
        <div class="inner-wrap">
          {{ $store.getters.collection.length }}
        </div>
      </div>

      <template #content>
        <div class="selection-tooltip">
          <div class="selection-tooltip-summary">
            <strong>{{ $store.getters.collection.length }}</strong> / {{ $store.getters.collectionTotal }} books in current view<template v-if="$store.getters.collectionHours">, <strong>{{ collectionHoursRounded }}</strong> of listening <span class="dim">(or {{ $store.getters.collectionDuration }})</span></template>
          </div>
          <div class="selection-tooltip-note" v-if="$route.name === 'series'">
            Owned books only
          </div>
        </div>
      </template>
    </tippy>

    <template v-if="!collapseIcons">
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
    </template>

    <!-- On mobile, while the input is focused, the option icons collapse to this inert
         3-dot glyph so the field has room. It has no handler on purpose: it isn't
         focusable, so tapping it blurs the input, which dismisses the keyboard and brings
         the real icons back. -->
    <div class="icons-collapsed-dots" v-if="collapseIcons" v-html="dotsIcon"></div>
  </div>
</template>

<script>
// ICON IMPORTS
import IconMicroscope from '~icons/fa6-solid/microscope?raw';
import IconFilter     from '~icons/fa6-solid/filter?raw';
import IconSort       from '~icons/fa6-solid/sort?raw';
import IconEllipsis   from '~icons/fa6-solid/ellipsis?raw';

export default {
  name: "searchIcons",
  props: ["listName", "searchFocused"],
  data: function() {
    return {
      // Raw SVG for the inert mobile-collapse 3-dot glyph.
      dotsIcon: IconEllipsis,
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

    // On mobile, collapse the option icons to the inert 3-dot while the input is focused,
    // so the search field has room. Desktop always shows the full row.
    collapseIcons() {
      return this.searchFocused && this.$store.getters.mobileThreshold;
    },

    // Whole-hours summary for the selection tooltip. collectionHours carries minutes down
    // to the last straggler (216h 49m); this rounds that away for the headline figure, the
    // exact breakdown still shows in the dimmed collectionDuration next to it.
    collectionHoursRounded() {
      const hours = Math.round( this.$store.getters.collectionDuration_inSeconds / 3600 );
      return hours + ' hours';
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
  
  // Inert 3-dot standing in for the collapsed option icons. Roughly the footprint of one
  // icon; no pointer cursor since it does nothing but drop focus when tapped.
  .icons-collapsed-dots {
    display: flex;
    align-items: center;
    padding: 0 10px;
    -webkit-user-select: none;
    user-select: none;
    opacity: 0.5;
    svg {
      width: 16px;
      height: 16px;
    }
  }

</style>

<style lang="scss">

// Selection-count tooltip content. Rendered inside the tippy (appended to body), so it
// lives at the top level rather than nested under the scoped styles above.
.selection-tooltip {
  user-select: text;
  cursor: text;
  text-align: left;
  width: max-content;
  max-width: 60vw;
  
  @media (max-width: 600px) {
    max-width: 80vw;
  }

  .selection-tooltip-summary {
    font-size: 1em;

    .dim {
      opacity: 0.6;
    }
  }

  .selection-tooltip-note {
    margin-top: 6px;
    font-style: italic;
    opacity: 0.7;
  }

}

</style>
