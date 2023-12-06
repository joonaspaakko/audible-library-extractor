<template>
  <span class="sorter-button-wrapper">
    <span
      v-if="item"
      :class="item.key"
      v-tippy="{ 
        delay: 150,
        maxWidth: 350, 
        placement: (tippyTop ? 'top' : 'left'), 
        flipBehavior: (tippyTop ? ['top', 'bottom', 'left', 'right'] : ['left', 'top', 'bottom', 'right']),
        distance: listName ? 20 : 10,
      }" 
      :content="item.tippy ? item.tippy : false"
    >
      <label class="sorter-button" :class="{ ranged: item.range, 'faux-disabled': (item.type === 'filterExtras' ? filterAmounts < 1 : false), 'is-dropdown': item.dropdownOpts }">

        <!-- LABEL in the front -->
        <span v-if="label === false" class="input-label" :class="{ active: isActiveSortItem(item) }">
          <slot />
        </span>

        <!-- HIDDEN input -->
        <input type="checkbox" :value="index" v-model="inputVmodel" />

        <!-- SORT ARROWS -->
        <span v-if="item.type === 'sort'" class="sortbox" :class="{ active: isActiveSortItem(item) }" >
          <fa6-solid-sort-down data-icon="sort-down" />
          <fa6-solid-sort-up data-icon="sort-up" />
        </span>
        <!-- RADIOBUTTONS -->
        <span v-else-if="item.radiobutton" class="radiobutton">
          <fa-regular-circle data-icon="circle" />
          <fa-regular-dot-circle data-icon="circle" />
        </span>
        <!-- CHECKBOXES -->
        <span v-else class="checkbox">
          <ic-round-square data-icon="square" />
          <fa-solid-check data-icon="check"/>
          <!-- <ion-checkmark-round data-icon="check"/> -->
        </span>
        <!-- LABEL in the back -->
        <span v-if="label !== false" class="input-label" :class="{ active: isActiveSortItem(item) }">
          <span>
            {{ item.label || item.key.replace(".name", "") }}
            <span v-if="item.dropdownOpts" class="dropdown-label-suffix">
              <span class="label-exclude" v-if="item.exclude">Exclude</span>
              <span class="label-include" v-else>Include</span>
            </span>
          </span>
        </span>

        <!-- EXTRA suffix -->
        <span class="books-in-filter" v-if="listName === 'filter'">
          {{ filterAmounts }}
          <!-- Ok, so I tried... -->
          <!-- <span class="of-total" v-if="item.type === 'filterExtras' && $store.getters.collectionSource">
            / {{ $store.getters.collectionSource.length }}
          </span> -->
        </span>
        
        <!-- <span class="books-in-filter" v-if="listName === 'filter'">
          ({{ filterHours }})
        </span> -->

      </label>

      <div class="range-slider" v-if="item.range">
        <span style="font-size: 13px; line-height: 13px; cursor: w-resize;" @click="adjustRange('left')">{{ range.value[0] }}{{ item.rangeSuffix }}</span>
        
        <vue-slider 
        :disabled="range.disabled"
        :dragOnClick="true"
        :adsorb="true"
        :lazy="true" 
        :hideLabel="true" 
        :included="!!(range.marks)" 
        :interval="range.min === range.max ? 1 : (item.rangeInterval || 1)" 
        :marks="range.marks" 
        :modelValue="range.value" 
        :min="range.min" 
        :max="range.max" 
        :min-range="range.min === range.max ? 0 : (item.rangeMinDist || 0)" 
        :enable-cross="false" 
        @change="rangeChanged" 
        :tooltip-formatter="item.tooltipFormatter || tooltipFormatter" 
        tooltip-placement="top" 
        tooltip="active"
        :use-keyboard="false"
        @drag-start="$store.commit('prop', { key: 'searchOptCloseGuard', value: true })"
        @drag-end="$store.commit('prop', { key: 'searchOptCloseGuard', value: false })"
        ></vue-slider>
        <span style="font-size: 13px; line-height: 13px; cursor: e-resize;" @click="adjustRange('right')">{{ range.value[1] }}{{ item.rangeSuffix }}</span>
      </div>

      <div v-if="!!item.dropdownOpts">
        <Multiselect
          ref="multiselect"
          :value="item.value" 
          :placeholder="item.placeholder || 'Include...'"
          @change="dropdownChanged" 
          @open="dropdownOpened"
          :options="dropdownOptions" 
          mode="tags" 
          :hideSelected="true"
          :clearOnSelect="false"
          :closeOnSelect="false"
          :multiple="true"
          :taggable="true"
          :searchable="true" 
          :track-by="item.dropdownTrackBy"
          :label="item.dropdownLabel"
          :valueProp="item.dropdownValueProp"
        />
      </div>

    </span>
  </span>
</template>

<script>
import 'vue-slider-component/theme/antd.css';
import '@vueform/multiselect/themes/default.css';
import VueSlider from 'vue-slider-component';
import slugify from "@output-mixins/gallery-slugify.js";
import Multiselect from '@vueform/multiselect'
// import timeStringToSeconds from "@output-mixins/gallery-timeStringToSeconds.js";
// import secondsToTimeString from "@output-mixins/gallery-secondsToTimeString.js";

export default {
  name: "sorter",
  props: [ "label", "currentList", "listName", "item", "index", "tippyTop" ],
  mixins: [slugify/*, timeStringToSeconds, secondsToTimeString*/],
  components: {
    VueSlider,
    Multiselect,
  },
  data: function() {
    return {
      range: null,
      dropdownOptions: null,
    };
  },

  created: function() {
    if ( this.item.range ) {

      var range = {
        min: this.item.rangeMin(),
        max: this.item.rangeMax(),
      };

      // Sorta crude failsafe to make sure the calculated rangeMax() is never smaller than rangeMin()
      if ( range.min < 0 ) range.min = 0;
      if ( range.max < 0 ) range.max = 0;
      if ( range.min > range.max ) range.min = range.max;

      // So basically if the user has changed the range, use that and otherwise min max...
      // ...unless user set range goes past the current min or max.
      let rangeIsSetByUser = _.isArray(this.item.range);
      if ( rangeIsSetByUser ) {
        range.value = _.clone(this.item.range);
        if ( range.value[0] < range.min || range.value[0] > range.max ) range.value[0] = range.min;
        if ( range.value[1] < range.min || range.value[1] > range.max ) range.value[1] = range.max;
      }
      else {
        range.value = [range.min, range.max];
      }

      // If all values are equal disable the slinger since it won't be very useful...
      // const noRange = (range.min === range.value[0] && range.value[0] === range.value[1] && range.value[1] === range.max);
      // if (  noRange ) range.disabled = true;
      // else range.disabled = false;
      
      if ( this.item.rangeMarks ) range.marks = this.item.rangeMarks( range );
      
      this.range = range; 
      
    }
    else if ( this.$store.getters.filterExtrasKeys.match( this.item.key ) ) {
      // Compiles dropdown data (options) on create it it's active
      // Otherwise the data is compiled when the dropdown is first opened on click in the "dropdownOpened" method
      if ( !this.dropdownOptions && !!this.item.dropdownOpts ) this.dropdownOptions = this.item.dropdownOpts();
    }

  },

  computed: {
    filterBooks: function( ) {
      
      this.$compEmitter.emit('repositionSearchOpts'); // potentially changes the width of the container...
      
      let isRegularFilter = !(this.item.range || this.item.dropdownOpts); 
      let specialFilterIsActive = (!isRegularFilter && this.item.active === true);
      if ( isRegularFilter || specialFilterIsActive ) {

        const vue = this;
        const filterExtraRules = _.filter( this.$store.state.listRenderingOpts.filter, { type: 'filterExtras', active: true });

        let conditionCheck = function( book ) {

          let filterExtrasConditions = _.map( filterExtraRules, function( filter ) {
            return !!filter.condition( book, filter );
          });

          return !_.includes( filterExtrasConditions, false );

        };

        // I could just do "this.$store.getters.collection", but it would've shown 0 for unchecked regular filters.
        // So with this change even unchecked regular filters show a number... So you kinda know what you're missing.
        let collection = this.item.type === 'filter' ?
            (this.$store.getters.searchIsActive ? this.$store.state.searchCollection : this.$store.getters.collectionSource ) :
            this.$store.getters.collection;

        return _.filter( collection, function(book) {
          return vue.item.condition(book) && conditionCheck( book );
        });

      }
      else {
        return [];
      }

    },
    filterAmounts: function( ) {
      
      return this.filterBooks.length;

    },
    
    // filterHours: function( ) {
      
    //   const result = _.sumBy( this.filterBooks, ( book ) => {
    //     const length = book.length ? this.timeStringToSeconds(book.length) : 0;
    //     return length;
    //   });
      
    //   return this.secondsToTimeString(result, true);

    // },

    rangeVal: function() {
      // let itemRange = _.get( this.item, 'range' );
      // return _.isArray(itemRange) ? itemRange : this.range.value;
      return this.range.value;
    },

    inputVmodel: {
      get: function() {
        return this.item.active;
      },
      set: function(value) {

        let changes = {
          listName: this.listName,
          key: this.item.key,
          active: value,
        };

        if ( this.item.range ) {
          changes.range = value ? _.clone( this.range.value ) : true;
        }

        if ( this.item.group ) changes.group = true;
        this.$store.commit("updateListRenderingOpts", changes);
        this.doTheThings( value );

      }
    },

  },

  methods: {

    

    isActiveSortItem: function( item ) {
      
      if ( this.listName === "sort" ) {
        if ( item.current ) {
          const searching = this.$store.getters.searchIsActive;
          if ( !searching || (searching && this.$route.query.sort) ) {
            return true;
          }
        }
      }
      
      return false;
      
    },
    
    tooltipFormatter: function( val ) {
      return val + this.item.rangeSuffix;
    },

    dropdownChanged: function( value ) {

      let changes = {
        listName: this.listName,
        key: this.item.key,
        active: value.length > 0,
        value: value,
      };

      if ( this.item.group ) changes.group = true;
      this.$store.commit("updateListRenderingOpts", changes);
      this.doTheThings( value, true );

    },

    dropdownOpened: function( e ) {

      const createDropdownDataOnFirstOpen = !this.dropdownOptions && !!this.item.dropdownOpts;
      if ( createDropdownDataOnFirstOpen ) this.dropdownOptions = this.item.dropdownOpts();

    },

    rangeChanged: function( value ) {

      this.range.value = value;

      let changes = {
        listName: this.listName,
        key: this.item.key,
        range: value,
        active: true,
      };

      if ( this.item.group ) changes.group = true;
      this.$store.commit("updateListRenderingOpts", changes);
      this.doTheThings( value, true);

    },

    adjustRange: function( direction ) {

      let changes = {
        listName: this.listName,
        key: this.item.key,
        active: true,
        range: [0,0],
      };

      if ( direction === 'left' ) {
        const min = this.range.min;
        changes.range[0]    = min;
        this.range.value = [min, this.range.value[1]];
      }
      else {
        const max = this.range.max;
        changes.range[1]    = max;
        this.range.value = [this.range.value[0], max];
      }

      if ( this.item.group ) changes.group = true;
      this.$store.commit("updateListRenderingOpts", changes);
      this.doTheThings( changes.range, true);
    },

    doTheThings: function( value, specialBoy ) {
      
      // if ( this.item.key === "sortValues" ) this.$compEmitter.emit("book-clicked", null);
    
      const action = {
        change: {
          scope : this.listName === "scope",
          sort  : this.listName === "sort",
          filter: this.listName === "filter",
        },
        randomize   : this.item.key === "randomize" && !this.$store.getters.searchIsActive,
        noSortvalues: this.item.key !== "sortValues",
        start: '',
      };
      
      
      if ( action.change.scope ) {
        action.start = 'start-scope';
      }
      else if ( ( action.change.sort || action.randomize ) && action.noSortvalues ) {
        this.$store.commit("prop", { 'key': 'searchSort', value: false });
        action.start = 'start-sort';
      } else if ( action.change.filter ) {
        action.start = 'start-filter';
      } 
      
      this.saveOptions( value, specialBoy);
      this.$compEmitter.emit( action.start );
      
        
    },

    saveOptions: function( value, specialBoy ) {

      let vue = this;
      const sortKey = this.item.key;
      const sortType = this.item.type;
      const queryObj = {};
      
      if ( sortKey === "sortValues" ) {
        queryObj[ sortKey ] = value;
      }
      else if ( sortType === "sort" ) { 
        
        queryObj[ sortType ] = sortKey;
        queryObj.sortDir = value ? "desc" : "asc";
        
      }
      else if ( this.listName === "filter" ) {
        if ( sortType === 'filter') {
          
          queryObj[ sortType ] = encodeURIComponent(this.$store.getters.filterKeys);
          
        }
        if ( sortType === 'filterExtras' ) {
          
          if ( this.$route.name === 'series' ) {
            if ( sortKey.match(/inLibrary|notInLibrary/) ) {
              this.$store.commit('prop', { key: 'sticky.seriesFilters.' + sortKey, value: value });
            }
          }
          
          let vue = this;
          const filterExtrasKeys = vue.$store.getters.filterExtrasKeys;
          const queryKeysArray = !filterExtrasKeys ? false : _.map( filterExtrasKeys.split(','), function( key ) {
            const keyItem = _.find( vue.$store.state.listRenderingOpts.filter, { key: key });
            let range = _.get(vue.range, 'value');
            if ( !range ) range = _.get(keyItem, 'range');
            if ( range && _.isArray(range) ) {
              return encodeURIComponent( key + ':' + range[0] +'-'+ (range[1]||range[0]) );
            }
            else if ( _.get(keyItem, 'value.0') ) {
              return encodeURIComponent(key + ':') + encodeURIComponent(_.map( keyItem.value, function( val ) { return val; }).join('|'));
            }
            else if ( key ) { 
              return encodeURIComponent(key); 
            }
          });
          
          queryObj[ sortType ] = _.isArray(queryKeysArray) ? queryKeysArray.join(', ') : null;
          
        }
      }
      else if ( this.listName === "scope" ) {
        
        queryObj[ this.listName ] = encodeURIComponent(this.$store.getters.scopeKeys);
        
      }
      
      queryObj.book = null;
      this.$store.commit('prop', { key: 'bookClicked', value: true });
      
      this.$updateQueries( queryObj, { src: 'saveOptions' });
      
    },

  },
};
</script>

<style lang="scss">
  
  .multiselect {
    max-width: 300px;
    outline: none !important;
    box-shadow: none !important;
    min-height: 32px !important;
    margin-bottom: 10px;
  }
  .multiselect-tag, .multiselect > *,
  .multiselect-option {
    font-size: 12px;
    line-height: 15px;
  }
  .multiselect-tags {
    overflow: hidden;
    // margin-top: 0 !important;
    padding-right: 5px;
    padding-left: 5px;
    > *,
    > * > * {
      box-sizing: border-box;
    }
  }
  .multiselect-tag,
  .multiselect-option {
    line-height: 12px;
    padding: 5px;
    padding-right: 0;
  }
  .multiselect-tag {
    padding-top: 1px;
    padding-bottom: 1px;
    font-weight: 700;
    line-height: 15px;
    white-space: normal;
    @include themify($themes) {
      background: themed(audibleOrange);
      // background: rgba( themed(frontColor), .3);
    }
    // background: #3e3e3e !important;
  }
  .multiselect-tag-remove-icon {
    width: 11px;
    height: 11px;
  }
  .multiselect-option {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 5px !important;
    min-height: 25px;
    line-height: 25px;
    color: #252525;
  }
  .multiselect-clear {
    background: transparent;
    padding-right: 0;
    margin-right: 7px;
    &, & > span {
      width: 12px;
      height: 12px;
    }
  }
  .multiselect-tag i:before {
    color: #fff;
  }
  .multiselect.is-open .multiselect-tags-search {
    // display: inline-block !important;
  }
  .multiselect-tags-search {
    font-size: 12px !important;
    background: transparent !important;
    margin-bottom: 4px !important;
    align-self: stretch;
    border: none !important;
    padding: 2px !important;
  }
  .multiselect-placeholder {
    padding-left: 13px;
  }

  .theme-dark {
    .multiselect {
      background: rgba( $darkBackColor, .15) !important;
      border-color: rgba( $darkFrontColor, .15);
    }
    .multiselect-tags-search { color: $darkFrontColor !important; }
    .multiselect-caret {
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 320 512' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z'/%3E%3C/svg%3E") !important;
    }
    .multiselect-clear-icon {
      background-color: white !important;
    }
    // .multiselect-clear-icon {
    //   background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 320 512' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z'/%3E%3C/svg%3E") !important;
    // }
  }
  
</style>

<style lang="scss" scoped>


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
  input[type="checkbox"],
  input[type="radio"] {
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
      @include themify($themes) {
        color: rgba( themed(frontColor), 1);
      }
    }
    &.sortbox.active {
      [data-icon="sort-up"] {
        @include themify($themes) {
          color: rgba( themed(frontColor), 1);
        }
      }
      [data-icon="sort-down"] {
        @include themify($themes) {
          color: rgba( themed(frontColor), .35);
        }
      }
    }
    &.radiobutton,
    &.checkbox {
      [data-icon="circle"]:first-child,
      [data-icon="square"] {
        @include themify($themes) {
          color: rgba( themed(frontColor), .2);
        }
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
        @include themify($themes) {
          color: rgba( themed(frontColor), .35);
        }
      }
      [data-icon="sort-down"] {
        @include themify($themes) {
          color: rgba( themed(frontColor), 1);
        }
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
    // text-decoration: line-through;
    @include themify($themes) {
      // color: rgba( themed(frontColor), .35);
    }
  }

  &.faux-disabled {
    &.ranged,
    &.is-dropdown {
      .input-label { text-decoration: none; }
    }
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
    @include themify($themes) {
      color: rgba( themed(frontColor), .5);
    }
  }

  &.is-dropdown,
  &.ranged {
    display: inline-block !important;
    width: auto !important;
  }  
  
} // .sorter-button


.sorter-button .dropdown-label-suffix {
  span { font-weight: bold; }
}

.theme-light .sorter-button {
  .label-exclude {
    color: #9f3504;
  }
  .label-include {
    color: #226700;
  }
}
.theme-dark .sorter-button {
  .label-exclude {
    color: #ec8251;
  }
  .label-include {
    color: #65aa3a;
  }
}

</style>
