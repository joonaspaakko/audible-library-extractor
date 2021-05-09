<template>
  <span class="sorter-button-wrapper">
    <span
    v-if="item"
    :class="item.key"
    v-tippy="{ 
      delay: 150,
      maxWidth: 350, 
      placement: (tippyTop ? 'top' : 'left'), 
      flipBehavior: (tippyTop ? ['top', 'bottom', 'left', 'right'] : ['left', 'top', 'bottom', 'right']) 
    }" 
    :content="item.tippy ? item.tippy : false"
    >
      <label class="sorter-button" :class="{ ranged: item.range, 'faux-disabled': (item.type === 'filterExtras' ? filterAmounts < 1 : false) }">
        
        <!-- LABEL in the front -->
        <span v-if="label === false" class="input-label" :class="{ active: isActiveSortItem }">
          <slot />
        </span>
        
        <!-- HIDDEN input -->
        <input type="checkbox" :value="index" v-model="inputVmodel" :disabled="item.range ? item.range && range.min === range.max : false" />
        
        <!-- SORT ARROWS -->
        <span v-if="item.type === 'sort'" class="sortbox" :class="{ active: isActiveSortItem }" >
          <font-awesome fas icon="sort-down" />
          <font-awesome fas icon="sort-up" />
        </span>
        
        <!-- RADIOBUTTONS -->
        <span v-else-if="item.radiobutton" class="radiobutton">
          <font-awesome fas icon="circle" />
          <font-awesome fas icon="circle" />
        </span>
        <!-- CHECKBOXES -->
        <span v-else class="checkbox">
          <font-awesome fas icon="square" />
          <font-awesome fas icon="check" />
        </span>
        <!-- LABEL in the back -->
        <span v-if="label !== false" class="input-label" :class="{ active: isActiveSortItem }">
          {{ item.label || item.key.replace(".name", "") }}
        </span>
        
        <!-- EXTRA suffix -->
        <span class="books-in-filter" v-if="listName === 'filter'">
          {{ filterAmounts }}
          <!-- Ok, so I tried... -->
          <!-- <span class="of-total" v-if="item.type === 'filterExtras' && $store.getters.collectionSource">
            / {{ $store.getters.collectionSource.length }}
          </span> -->
        </span>
        
      </label>
      
      <div class="range-slider" v-if="item.range">
        <span style="cursor: w-resize;" @click="adjustRange('left')">{{ rangeVal[0] }}{{ item.rangeSuffix }}</span>
        <vue-slider 
        :dragOnClick="true" 
        :adsorb="true"
        :lazy="true" 
        :hideLabel="true" 
        :included="!!(range.marks)" 
        :interval="item.rangeInterval || 1" 
        :marks="range.marks || Math.abs(range.min - range.max) <= 10" 
        :value="rangeVal" 
        :min="range.min" 
        :max="range.max" 
        :min-range="item.rangeMinDist || 0" 
        :enable-cross="false" 
        @change="rangeChanged" 
        :tooltip-formatter="tooltipFormatter" 
        tooltip-placement="top" 
        tooltip="focus"
        ></vue-slider>
        <span style="cursor: e-resize;" @click="adjustRange('right')">{{ rangeVal[1] }}{{ item.rangeSuffix }}</span>
      </div>
        
    </span>
  </span>
</template>

<script>

import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

export default {
  name: "sorter",
  props: [ "label", "currentList", "listName", "item", "index", "tippyTop" ],
  components: {
    VueSlider
  },
  data: function() {
    return {
      range: null,
    };
  },
  
  created: function() {
    
    if ( this.item.range ) {
      
      const min = this.item.rangeMin();
      const max = this.item.rangeMax();
      this.range = {
        min: min,
        max: max,
        value: _.isArray(this.item.range) ? this.item.range : [min, max],
      };
      
      if ( this.item.rangeMarks ) this.range.marks = this.item.rangeMarks( max );
      
      let changes = {
        listName: this.listName,
        index: this.index,
        value: this.item.value,
        range: this.range.value,
        active: this.item.active,
      };
      
      this.$store.commit("updateListRenderingOpts", changes);
      
    }
    
  },

  computed: {
    
    
    
    filterAmounts: function( ) {
      
      this.$root.$emit('repositionSearchOpts');
      
      const vue = this;
      const filterExtraRules = _.filter( this.$store.state.listRenderingOpts.filter, { type: 'filterExtras', active: true }); 
      
      let conditionCheck = function( book ) {
        
        let filterExtrasConditions = _.map( filterExtraRules, function( filter ) {
          return !!filter.condition( book );
        });
        
        return !_.includes( filterExtrasConditions, false );
        
      };
      
      // I could just do "this.$store.getters.collection", but it would've shown 0 for unchecked regular filters.
      // So with this change even unchecked regular filters show a number... So you kinda know what you're missing.
      let collection = this.item.type === 'filter' ? 
          (
            this.$store.getters.searchIsActive ? 
              this.$store.state.searchCollection : 
              this.$store.getters.collectionSource 
          ) : 
          this.$store.getters.collection;
          
      return _.filter( collection, function(book) {
        return vue.item.condition(book) && conditionCheck( book );
      }).length;
      
    },
    
    rangeVal: function() {
      return (this.item.range && this.item.range !== true) ? this.item.range : this.range.value;
    },
    
    inputVmodel: {
      get: function() {
        return this.item.active;
      },
      set: function(value) {
        
        let changes = {
          listName: this.listName,
          index: this.index,
          active: value,
        };
        
        if ( this.item.group ) changes.group = true;
        this.$store.commit("updateListRenderingOpts", changes);
        this.doTheThings( value );
        
      }
    },

    isActiveSortItem: function() {
      if ( this.listName === "sort" ) {
        
        if ( !this.$store.state.searchSort ) {
          const changedIndex = _.findIndex(this.currentList, "current");
          return changedIndex === this.index;
        }
      }
      else if ( this.listName === "filter" ) {
        // const changedIndex = _.findIndex(this.currentList, { active: true, type: 'filterExtras' });
        // return changedIndex === this.index;
        return false;
      }
    },
    
  },
  
  methods: {
    
    tooltipFormatter: function( val ) {
      if ( this.item.key === 'myrating' ) {
        switch ( val ) {
          case 1:
            return val+' - Not for me';
            break;
          case 2:
            return val+' - It’s okay';
            break;
          case 3:
            return val+' - Pretty good';
            break;
          case 4:
            return val+' - It’s great';
            break;
          case 5:
            return val+' - I love it';
            break;
        }
      }
      else {
        return val+this.item.rangeSuffix;
      }
    },
    
    rangeChanged: function( value ) { 
      
      let changes = {
        listName: this.listName,
        index: this.index,
        active: true,
        range: value,
      };
      
      if ( this.item.group ) changes.group = true;
      this.$store.commit("updateListRenderingOpts", changes);
      this.doTheThings( value, true);
      
    },
    
    adjustRange: function( direction ) {
      
      let changes = {
        listName: this.listName,
        index: this.index,
        active: true,
        range: _.cloneDeep(this.rangeVal),
      };
      
      if ( direction === 'left' ) {
        changes.range[0] = this.range.min;
      }
      else {
        changes.range[1] = this.range.max;
      }
      
      if ( this.item.group ) changes.group = true;
      this.$store.commit("updateListRenderingOpts", changes);
      this.doTheThings( changes.range, true);
    },
    
    doTheThings: function( value, range ) {
      
      this.saveOptions( value, range);
      
      if ( this.item.key === "sortValues" ) this.$root.$emit("book-clicked", { book: null });
    
      if ( this.listName === "scope" ) {
        this.$root.$emit("start-scope");
      }
      else if (
        ( this.listName === "sort" || this.item.key === "randomize" && !this.$store.getters.searchIsActive ) 
        && this.item.key !== "sortValues"
      ) {
        this.$store.commit("prop", { 'key': 'searchSort', value: false });
        this.$root.$emit("start-sort");
      } else if ( this.listName === "filter" ) {
        this.$root.$emit("start-filter", range ? value : null);
      } 
        
    },
    
    saveOptions: function( value, range ) {
      
      if ( this.item.key === "sortValues" ) {
        this.$updateQuery({ query: this.item.key, value: value });
      }
      else if ( this.item.type === "sort" ) { 
        this.$updateQuery({ query: this.item.type, value: this.item.key });
        this.$updateQuery({ query: 'sortDir', value: value ? "desc" : "asc" });
      }
      else if ( this.listName === "filter" ) {
        if ( this.item.type === 'filter') {
          this.$updateQuery({ query: this.item.type, value: encodeURIComponent(this.$store.getters.filterKeys) });
        }
        if ( this.item.type === 'filterExtras' ) {
          let vue = this;
          if ( vue.$store.getters.filterExtrasKeys || !value && !range ) {
            const rangedKeys = _.map( vue.$store.getters.filterExtrasKeys.split(','), function( key ) {
              const keyItem = _.find( vue.$store.state.listRenderingOpts.filter, { key: key });
              if ( keyItem && keyItem.range ) {
                return key + ':' + keyItem.range[0] +'-'+ keyItem.range[1];
              }
              else { return key; }
            });
            this.$updateQuery({ query: this.item.type, value: encodeURIComponent(rangedKeys) });
          }
        }
      }
      else if ( this.listName === "scope" ) {
        this.$updateQuery({ query: this.listName, value: encodeURIComponent(this.$store.getters.scopeKeys) });
      }
      // else {
      //   this.$updateQuery({ query: this.item.key, value: value });
      // }
      
    },
    
  },
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";

.sorter-button-wrapper {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  > span {
    outline: none;
    display: block;
  }
}

.range-slider {
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  justify-items: stretch;
  justify-content: stretch;
  white-space: nowrap;
  div { flex: 1; }
  span:first-child { padding-right: 10px; }
  span:last-child { padding-left: 10px; }
}

.sorter-button {
  outline: none;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  justify-items: stretch;
  justify-content: space-between;
  white-space: nowrap;
  label {
    outline: none;
    display: block;
    &:hover {
      @include themify($themes) {
        color: themed(audibleOrange);
      }
    }
  }
  input {
    display: none;
  }
  .radiobutton,
  .checkbox,
  .sortbox {
    display: inline-block;
    position: relative;
    z-index: 0;
    // top: 2.5px;
    width: 14px;
    height: 14px;
    svg {
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      width: 14px;
      height: 14px;
      @include themify($themes) {
        color: themed(frontColor);
      }
      transition: all 120ms ease-in-out;
    }
    &.sortbox [data-icon] {
      opacity: 0.35;
    }
    &.sortbox.active {
      [data-icon="sort-up"] {
        opacity: 1;
      }
      [data-icon="sort-down"] {
        opacity: 0.35;
      }
    }
    &.radiobutton,
    &.checkbox {
      [data-icon="circle"]:first-child,
      [data-icon="square"] {
        opacity: 0.2;
      }
      [data-icon="circle"]:last-child,
      [data-icon="check"] {
        opacity: 0;
        padding: 3px 0px 0px 3px;
        width: 9px;
        height: 9px;
        color: #fff;
      }
      [data-icon="circle"]:last-child {
        padding: 4px 0px 0px 4px;
        width: 6px;
        height: 6px;
      }
    }
  }
  input:checked + .radiobutton,
  input:checked + .checkbox,
  input:checked + .sortbox {
    &.sortbox.active {
      [data-icon="sort-up"] {
        opacity: 0.35;
      }
      [data-icon="sort-down"] {
        opacity: 1;
      }
    }
    &.radiobutton, 
    &.checkbox {
      
      [data-icon="circle"]:first-child,
      [data-icon="square"] {
        opacity: 1;
        color: #65aa3a;
      }
      [data-icon="circle"]:last-child,
      [data-icon="check"] {
        opacity: 1;
      }
    }
  }
  
  // &.faux-disabled .checkbox [data-icon="check"],
  input[disabled="disabled"] + .radiobutton [data-icon="circle"]:last-child,
  input[disabled="disabled"] + .checkbox [data-icon="check"] {
    display: none;
  }
  
  &.faux-disabled .input-label,
  input[disabled="disabled"] ~ .input-label {
    text-decoration: line-through;
    opacity: 0.35;
  }
  
  .books-in-filter {
    vertical-align: middle;
    font-size: .8em;
    @include themify($themes) {
      color: rgba( themed(frontColor), .6);
    }
  }
  
  
  .input-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 2;  
  }
  
  .input-label.active {
    @include themify($themes) {
      color: themed(audibleOrange);
    }
  }
  
  .radiobutton {
    top: 2px;
  }
  
  .of-total {
    opacity: .5;
  }
  
  &.ranged {
    display: inline-block !important;
    width: auto !important;
  }
  
} // .sort-button
</style>


<style lang="scss">
  @import "~@/_variables.scss";
  .vue-slider-dot-tooltip-inner,
  .vue-slider-process {
    @include themify($themes) {
      background: themed(audibleOrange);
    }
  }
  .vue-slider-dot-tooltip-inner {
    @include themify($themes) {
      border-color: themed(audibleOrange);
    }
  }
  .vue-slider-mark {
    width: 2px !important;
    @include themify($themes) {
      background-color: rgba(#000, .05);
    }
  }
</style>