
<template>
<div id="search-options" ref="options" :style="css.options">
  <div class="search-opts-arrow" :style="css.arrow"></div>
  
  <ul class="sort-extras" v-if="listName === 'sort'">
    <li class="search-option" v-for="( item, index ) in searchOptions[ page ].sortExtras" :key="item.key">
      <listItem :label="item.label" :item="item" :index="index"></listItem>
    </li>
  </ul>
  
  <ul>
    <li class="search-option" :class="{ disabled: $store.state.searchActive }" v-for="( item, index ) in optionsList" :key="item.key">
      <listItem :label="item.label" :item="item" :index="index"></listItem>
    </li>
  </ul>
  
</div>
</template>

<script>
import listItem from '../../../snippets/sorter';

export default {
  name: 'searchOptions',
  props: ['listName', 'searchOptions', 'page'],
  components: {
    listItem,
  },
	data : function() {
		return {
      tippyConfig: { placement: 'left', theme: this.$store.state.tippyTheme, maxWidth: 410 },
      css: {
        arrow: { left: '0px' },
        options: { right: '0px' },
      },
		}
  },
  
  created: function () {
    console.log('%c' + 'searchopt mounted' + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;', this.page, this.listName, this.searchOptions[ this.page ][ this.listName ], this.searchOptions);
    this.optionsList = this.searchOptions[ this.page ][ this.listName ];
    
  },
  
  mounted: function() {
    
    // Reposition options list
    this.repositionSearchOptions();
    
    // Start listening for an outside click...
    if ( this.listName ) $(document).on('mouseup', this.outsideClick);
    
  },
  
  beforeDestroy: function() {
    
    $(document).off('mouseup', this.outsideClick);
    
  },
  
  watch: {
    
    optionsList: function() {
      // Reposition options list
      this.repositionSearchOptions();
    }
    
  },
  
  
  methods: {
    
    outsideClick: function( e ) {
      
      const vue = this;
      var options = $(e.target).closest("#search-options");
      var optionsBtn = $(e.target).closest(".search-opt-btn");
      if ( options.length < 1 && optionsBtn.length < 1 ) {
        $( this ).off( e );
        vue.$emit("update:listName", false);
      }
      
    },
    
		repositionSearchOptions: function() {
      this.$nextTick(function() {
        
        const clickedEl = $('.search-opt-btn.active');
        const searchOpts = {};
        searchOpts.el = $( this.$refs.options );
        searchOpts.width = searchOpts.el.innerWidth();
        
        const iconsWrapper = {};
        iconsWrapper.el = $('#ale-search > .icons');
        iconsWrapper.width = iconsWrapper.el.innerWidth();
        
        const option = {};
        option.el = clickedEl.parent();
        option.width = option.el.innerWidth();
        option.left = option.el.position().left + parseInt( option.el.css('margin-left'), 10);
        // searchOpts.position = option.middle - (searchOpts.width/2);
        option.middle = iconsWrapper.width - (option.left + (option.width/2));
        searchOpts.position = option.middle + parseInt( $('#ale-search').css('padding-right'), 10)  - (searchOpts.width/2);
        
        const difference = (option.el.offset().left + (option.width/2) + (searchOpts.width/2)) - $(window).width();
        const fitToWindow = difference > 0 ? difference + 20/* margin / */ : 0;
      
        this.css.options.right = searchOpts.position + fitToWindow + 'px';     
        this.css.arrow.left = (searchOpts.width/2) - 10 + fitToWindow + 'px';
        
      });
		},
    
  },
  
}
</script>

<style lang="scss">
@import '~@/_variables.scss';


#search-options {
  cursor: default !important;
  position: absolute;
  z-index: 1;
  top: 51px;
  right: 0;
  font-size: 1em;
  line-height: 1.9em;
  padding: 12px 15px 12px 14px !important;
  margin: 0px !important;
  border-radius: 3px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  @include themify($themes) {
    color: themed(frontColor);
    background: lighten( themed(backColor), 10);
    box-shadow: 0 3px 15px rgba( #000, .4 );
  }
  
  ul, li { list-style: none; margin: 0; padding: 0; text-align: left; }
  .search-opts-arrow {
    position: absolute;
    top: -9px;
    left: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 10px 10px 10px;
    @include themify($themes) {
      border-color: transparent transparent themed(backColor) transparent;
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
    input { display: none; }
    .checkbox, .sortbox {
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
        opacity: .35;
      }
      &.sortbox.active {
        [data-icon="sort-up"] {
          opacity: 1;
        }
        [data-icon="sort-down"] {
          opacity: .35;
        }
      }
      &.checkbox {
        [data-icon="square"] {
          opacity: .2;
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
          opacity: .35;
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
  
  .sort-extras {
    padding-bottom: 9px;
    margin-bottom: 9px;
    @include themify($themes) {
      border-bottom: 1px solid rgba( themed(frontColor), .1 );
    }
  }

  input[disabled="disabled"] + .checkbox [data-icon="check"] { display: none; }
  input[disabled="disabled"] ~ .input-label  {
    text-decoration: line-through;
    opacity: .35;
  }
  
} // #search-options

</style>
