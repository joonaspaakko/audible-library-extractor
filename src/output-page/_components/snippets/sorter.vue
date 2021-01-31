<template>
  <span class="sorter-button-wrapper">
    <label
    v-if="item" class="sorter-button"
    v-tippy="{ placement: 'left', maxWidth: 200 }" :content="item.tippy ? item.tippy : false"
    >
      
      <!-- LABEL in the front -->
      <span v-if="label === false" class="input-label" :class="{ active: isActiveSortItem, highlight: highlight }">
        <slot />
      </span>
      
      <!-- HIDDEN input -->
      <input type="checkbox" :value="index" v-model="inputVmodel" />
      
      <!-- SORT ARROWS -->
      <span v-if="item.type === 'sort'" class="sortbox" :class="{ active: isActiveSortItem }" >
        <font-awesome fas icon="sort-down" />
        <font-awesome fas icon="sort-up" />
      </span>
      
      <!-- CHECKBOXES -->
      <span v-else class="checkbox">
        <font-awesome fas icon="square" />
        <font-awesome fas icon="check" />
      </span>
      
      <!-- LABEL in the back -->
      <span v-if="label !== false" class="input-label">
        {{ item.label || item.key.replace(".name", "") }}
      </span>
      
      <!-- EXTRA suffix -->
      <span class="books-in-filter" v-if="listName === 'filter'">
        ({{ filterAmounts() }})
      </span>
      
    </label>
  </span>
</template>

<script>

export default {
  name: "sorter",
  props: [ "name", "label", "currentList", "listName", "item", "index", "highlight" ],
  data: function() {
    return {};
  },

  computed: {
    inputVmodel: {
      get: function() {
        return this.currentList[this.index].active;
      },
      set: function(value) {
        this.$store.commit("updateListRenderingOpts", {
          listName: this.listName,
          index: this.index,
          active: value
        });
        
        this.saveOptions( value );
        
        if ( this.item.key === "sortValues" ) this.$root.$emit("book-clicked", { book: null });
        
        // this.$nextTick(function() {
          if (this.listName === "scope") {
            this.$root.$emit("start-scope");
          }
          else if (
            ( this.listName === "sort" || this.item.key === "randomize" && !this.$store.getters.searchIsActive ) 
            && this.item.key !== "sortValues"
          ) {
            this.$root.$emit("start-sort");
          } else if (this.listName === "filter") {
            this.$root.$emit("start-filter");
          } 
        // });
      }
    },

    isActiveSortItem: function() {
      const changedIndex = _.findIndex(this.currentList, "current");
      return changedIndex === this.index;
    },
    
  },
  
  methods: {
    
    filterAmounts: function( ) {
      
      const vue = this;
      return _.filter( _.get(vue.$store.state, vue.$store.state.collectionSource), function(book) {
        return vue.item.condition(book);
      }).length;
      
    },
    
    saveOptions: function( value ) {
      
      if ( this.item.key === "sortValues" ) {
        this.$updateQuery({ query: this.item.key, value: value });
      }
      else if ( this.item.type === "sort" ) {  
        this.$updateQuery({ query: this.item.type, value: this.item.key });
        this.$updateQuery({ query: 'sortDir', value: value ? "desc" : "asc" });
      }
      else if ( this.item.type === "filter" ) {
        this.$updateQuery({ query: this.item.type, value: this.$store.getters.filterKeys });
      }
      else if ( this.listName === "scope" ) {
        this.$updateQuery({ query: this.listName, value: this.$store.getters.scopeKeys });
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
    &.checkbox {
      [data-icon="square"] {
        opacity: 0.2;
      }
      [data-icon="check"] {
        opacity: 0;
        padding: 3px 0px 0px 3px;
        width: 9px;
        height: 9px;
        color: #fff;
      }
    }
  }
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
    &.checkbox {
      [data-icon="square"] {
        opacity: 1;
        color: #65aa3a;
      }
      [data-icon="check"] {
        opacity: 1;
      }
    }
  }

  input[disabled="disabled"] + .checkbox [data-icon="check"] {
    display: none;
  }
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
  
  .input-label.active.highlight {
    @include themify($themes) {
      color: themed(audibleOrange);
    }
  }
  
} // #search-options
</style>
