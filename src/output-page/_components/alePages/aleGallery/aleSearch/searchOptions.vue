<template>
  <div id="search-options" ref="options" :class="listName+'-options'" :style="css.options">
    <div class="search-options-inner-wrap">
      
      <div class="search-opts-arrow" :style="css.arrow"></div>
      
      <ul v-if="listName === 'filter'" class="regular-filters" :style="css.filter">
        <li class="search-option" 
        v-for="(item, index) in optionsList" :key="item.key"
        v-if="item.type === 'filter'"
        >
          <listItem 
          :label="item.label" :item="item" :index="index" 
          :currentList="optionsList" :listName="listName"
          ></listItem>
        </li>
      </ul>
      
      <ul>
        <li class="search-option" 
        :class="{ extras: item.type && item.type.match(/extra/i), divider: item.type === 'divider' }" 
        v-for="(item, index) in optionsList" :key="item.key"
        v-if="!($store.state.sticky.viewMode !== 'grid' && item.key === 'sortValues') && item.type !== 'filter'"
        >
          <listItem v-if="item.type !== 'divider'" 
          :label="item.label" :item="item" :index="index" 
          :currentList="optionsList" :listName="listName"
          ></listItem>
        </li>
      </ul>
      
    </div>
  </div>
</template>

<script>
import listItem from "../../../snippets/sorter";

export default {
  name: "searchOptions",
  props: ["listName"],
  components: {
    listItem
  },
  data: function() {
    return {
      css: {
        arrow: { left: "0px" },
        options: { right: "0px" },
        filter: { top: '40px' },
      }
    };
  },

  created: function() {
    this.optionsList = this.$store.state.listRenderingOpts[ this.listName];
    
    if ( this.listName === 'filter' ) {
      let topNav = document.querySelector('#ale-navigation.regular');
      this.css.filter = { top: (topNav ? topNav.offsetHeight+'px' : 0) };
    }
  },

  mounted: function() {
    // Reposition options list
    this.repositionSearchOptions();
    this.$root.$on("repositionSearchOpts", this.repositionSearchOptions);

    // Start listening for an outside click...
    if (this.listName) document.addEventListener("mousedown", this.outsideClick);
  },

  beforeDestroy: function() {
    
    this.$root.$off("repositionSearchOpts", this.repositionSearchOptions);
    document.removeEventListener("mousedown", this.outsideClick);
    
    window.scroll({ top: 0, behavior: 'smooth' });
    
  },

  watch: {
    optionsList: function() {
      // Reposition options list
      this.repositionSearchOptions();
    }
  },

  methods: {
    outsideClick: function(e) {
      const vue = this;
      if (vue.listName) {
        var options = e.target.closest(".search-options-inner-wrap");
        var optionsBtn = e.target.closest(".search-opt-btn");
        if (!options && !optionsBtn) {
          vue.$emit("update:listName", false);
        }
      }
    },
    
    repositionSearchOptions: function() {
      this.$nextTick(function() {
        const searchOpts = {};
        searchOpts.el = this.$refs.options;
        searchOpts.width = searchOpts.el.offsetWidth;
        searchOpts.left = searchOpts.el.offsetLeft;

        const iconsWrapper = {};
        iconsWrapper.el = document.querySelector("#ale-search > .icons");
        iconsWrapper.width = iconsWrapper.el.offsetWidth;

        const option = {};
        option.el = document.querySelector(".search-opt-btn.active").parentNode;
        option.width = option.el.offsetWidth;

        option.left = option.el.offsetLeft;
        // searchOpts.position = option.middle - (searchOpts.width/2);
        option.middle = iconsWrapper.width - (option.left + option.width / 2);
        searchOpts.position = option.middle - searchOpts.width / 2;

        const difference =
          option.el.getBoundingClientRect().left +
          option.width / 2 +
          searchOpts.width / 2 -
          window.innerWidth;

        const fitToWindow = difference > 0 ? difference + 20 /* margin / */ : 0;

        this.css.options.right = searchOpts.position + fitToWindow + "px";
        this.css.arrow.left = searchOpts.width / 2 - 10 + fitToWindow + "px";
      });
    }
  }
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

#search-options {
  display: inline-block;
  cursor: default !important;
  position: absolute;
  z-index: 10;
  top: 51px;
  right: 0;
  font-size: 1em;
  line-height: 1.9em;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  padding-bottom: 300px !important;
  
  .search-options-inner-wrap {
    position: relative;
    z-index: 5;
    display: inline-block;
    padding: 12px 15px 12px 14px !important;
    margin: 0px !important;
    border-radius: 3px;
    // max-height: 200px;
    // overflow-x: hidden;
    // overflow-y: auto;
    
    @include themify($themes) {
      color: themed(frontColor);
      background: lighten(themed(backColor), 10);
      box-shadow: 0 3px 15px rgba(#000, 0.7);
      border: 2px solid themed(audibleOrange);
    }
  }


  ul,
  li {
    list-style: none;
    margin: 0;
    padding: 0;
    text-align: left;
  }
  .search-opts-arrow {
    position: absolute;
    z-index: 1;
    top: -11px;
    left: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 10px 10px 10px;
    @include themify($themes) {
      border-color: transparent transparent themed(audibleOrange) transparent;
    }
    &:before {
      content: '';
      position: absolute;
      z-index: 2;
      top: 3px;
      left: -10px;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 10px 10px 10px;
      @include themify($themes) {
        border-color: transparent transparent lighten(themed(backColor), 10) transparent;
      }
    }
  }

  .search-option {
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
      top: 2.5px;
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
    
  } // .search-option
  
  .search-option.divider{
    padding-top: 9px;
    margin-top: 9px;
    @include themify($themes) {
      border-top: 1px solid rgba(themed(frontColor), 0.1);
    }
  }

  input[disabled="disabled"] + .checkbox [data-icon="check"] {
    display: none;
  }
  input[disabled="disabled"] ~ .input-label {
    text-decoration: line-through;
    opacity: 0.35;
  }
  
  .regular-filters {
    @include themify($themes) {
      background: lighten(themed(backColor), 12);
      box-shadow: 0 7px 14px rgba(themed(backColor), .4);
      border-bottom: 2px solid rgba(themed(frontColor), 0.01);
    }
    margin: -11px -15px 15px -14px;
    padding: 14px;
    position: sticky;
    top: 40px;
    z-index: 10;
    margin-bottom: 10px;
  }
  
} // #search-options
</style>
