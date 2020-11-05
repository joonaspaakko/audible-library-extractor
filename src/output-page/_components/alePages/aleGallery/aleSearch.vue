<template>
<div id="ale-search-wrap">
  <div id="ale-search" @click="focusSearch($event)">
    <div class="search-locked" v-if="!gallery.searchEnabled">
      <div
        class="icon"
        @click="releaseSearchLock"
        v-tippy="{ placement: 'right',  arrow: true, theme: general.tippyTheme }"
        content="Click here to re-enable search"
      >
        <font-awesome fas icon="lock" />
        <font-awesome fas icon="unlock-alt" />
      </div>
      <div class="locked-text-reason" v-if="gallery.searchLocked.reason">
        {{ gallery.searchLocked.reason }}
      </div>
      <div class="locked-text" v-if="gallery.searchLocked.inputValue">
        {{ gallery.searchLocked.inputValue }}
      </div>
    </div>
  	<VueFuse
      v-if="gallery.searchEnabled"
      :placeholder="placeholder"
      :list="library.books"
      :keys="aliciaKeys"
      :location="0"
      :distance="400"
      :threshold="0.25"
      :defaultAll="false"
      :search="gallery.searchValue"
  		:shouldSort="searchShouldSort"
    />
  	<div class="icons">
      <div class="icon-wrap">
        <div class="book-in-selection">
          <div class="inner-wrap" content="Visible books" v-tippy="{ placement: 'top',  arrow: true, theme: general.tippyTheme }">
            {{ booksArray.length }}
          </div>
        </div>
      </div>
      <div class="icon-wrap" :class="{ disabled: !gallery.searchIcons.scope }">
        <div class="scope search-opt-btn" :class="{ active: gallery.searchOptions.open && currentOptionsListName === 'scope' }" @click="openSearchOptions('scope', $event)" content="Change the search scope for more accurate results" v-tippy="{ placement: 'top',  arrow: true, theme: general.tippyTheme, maxWidth: 410 }">
          <font-awesome fas icon="microscope" />
        </div>
      </div>
      <div class="icon-wrap" :class="{ disabled: !gallery.searchIcons.filter }">
        <div class="filter search-opt-btn" :class="{ active: gallery.searchOptions.open && currentOptionsListName === 'filter' }" @click="openSearchOptions('filter', $event)" content="Filter books" v-tippy="{ placement: 'top',  arrow: true, theme: general.tippyTheme }">
          <font-awesome fas icon="filter" />
        </div>
      </div>
  		<div class="icon-wrap" :class="{ disabled: !gallery.searchIcons.sort }">
        <div class="sort search-opt-btn" :class="{ active: gallery.searchOptions.open && currentOptionsListName === 'sort', 'is-enabled': gallery.searchOptions.lists.iewsIndex > -1 }" @click="openSearchOptions('sort', $event)" content="Sort books" v-tippy="{ placement: 'top',  arrow: true, theme: general.tippyTheme }">
    			<font-awesome fas icon="sort" />
    		</div>
      </div>
      
      <div id="search-options" v-if="gallery.searchOptions.open">
        <div class="search-opts-arrow"></div>
        
  			<ul class="sort-extras" v-if="currentOptionsList[0].type === 'sort'">
          <li class="search-option" v-for="( item, index ) in gallery.searchOptions.lists.sortExtras" :key="item.key">
            <label v-tippy="{ placement: 'left',  arrow: true, theme: general.tippyTheme }" :content="item.tippy ?  item.tippy : false">
              <input @change="sortExtrasCheck( item.key, index )" type="checkbox" :value="index" v-model="item.active" />
              <span class="checkbox">
                <font-awesome fas icon="square" />
                <font-awesome fas icon="check" />
              </span>
              <span class="input-label">{{ item.label || item.key.replace('.name', '') }}</span>
            </label>
          </li>
  			</ul>
        
        <ul>
          <li class="search-option" :class="{ disabled: searchIsActive }" v-for="( item, index ) in currentOptionsList" :key="item.key">
            <label v-tippy="{ placement: 'left',  arrow: true, theme: general.tippyTheme }" :content="item.tippy ?  item.tippy : false">
              <input @change="optionsCheck( item.type, index )" type="checkbox" :value="index" v-model="item.active" />
              <span v-if="item.type === 'sort'" class="sortbox" :class="{ active: index === gallery.searchOptions.lists.sortIndex }">
                <font-awesome fas icon="sort-down" />
                <font-awesome fas icon="sort-up" />
              </span>
              <span v-if="!item.type" class="checkbox">
                <font-awesome fas icon="square" />
                <font-awesome fas icon="check" />
              </span>
              <span class="input-label">{{ item.label || item.key.replace('.name', '') }}</span>
            </label>
          </li>
        </ul>
      </div>
      
  	</div>
  </div> <!-- #ale-search -->
</div> <!-- #ale-search-wrap -->

</template>

<script>
export default {
  name: 'aleBookdetails',
  props: ['booksArray', 'library', 'general', 'gallery'],
	data : function() {
		return {
      searchShouldSort: false,
      searchFocusListener: null,
      searchOptionsHider: null,
			resultTimer: null,
      enableZoomTimer: null,
		}
	},
  
  created: function() {
    var vue = this;
    
    Eventbus.$on('detailsToggle', this.onDetailsToggle );
    
    this.$on('fuseResultsUpdated', results => {
      
      vue.gallery.searchActive = results.length > 0;
      
      if ( !vue.gallery.searchValue.trim() && !vue.gallery.searchActive ) {
        vue.gallery.searchOptions.lists.sortIndex = vue.gallery.searchOptions.lists.tempSortIndex;
        vue.gallery.searchOptions.lists.tempSortIndex = null;
        // console.log('TEMP sort index RESTORED -- tempsortIndex NULL');
      }
      else if ( vue.gallery.searchValue.trim() ) {
      
        // Activate Title temporarily
        if ( vue.gallery.searchActive && vue.gallery.searchValueChanged && vue.gallery.searchOptions.lists.tempSortIndex === null ) {
          vue.gallery.searchOptions.lists.tempSortIndex = vue.gallery.searchOptions.lists.sortIndex;
          // console.log('TEMP sort index saved - ' + ' regular: ' + vue.gallery.searchOptions.lists.sortIndex )
          vue.gallery.searchOptions.lists.sortIndex = -1;
        }
        
        clearTimeout( vue.resultTimer);
        vue.resultTimer = setTimeout(function() {
          
          vue.gallery.fuseResults = results;
        }, 500);
      }
      
    });
    
    this.$on('fuseInputChanged', value => {
      this.gallery.searchValueChanged = this.gallery.searchValue !== value;
      if ( this.gallery.searchValueChanged ) {
        this.gallery.searchOptions.open = false;
        this.gallery.details.index = -1;
        
        if ( value.trim() === '' ) {
          this.gallery.fuseResults = null; // 
        }
      }
      this.gallery.searchValue = value; // Helps retain the seach query when re-rendered.
    });
    
  },
  
  mounted: function() {
    
    // this.searchFocusListener = $('#ale-search').on("focus", '> input[type="search"]', this.searchInputFocus);
    this.searchInputFocus( this );
    this.searchKeyupListener = $('#ale-search').on("keyup", '> input[type="search"]', this.searchInputKeyup);
    $("#ale-search").on('touchstart', this.iosAutozoomDisable);
    
  },
	
	beforeDestroy: function() {
		// $('#ale-search').off("focus", '> input[type="search"]', this.searchInputFocus);
		$('#ale-search').off("keyup", '> input[type="search"]', this.searchInputFocus);
    $("#ale-search").off('touchstart', this.iosAutozoomDisable);
	 	Eventbus.$off('detailsToggle', this.onDetailsToggle );
    this.searchFocusListener = null;
    this.searchKeyupListener = null;
    this.searchOptionsHider = null;
	},
	
  methods: {
    
    iosAutozoomDisable: function() {
      // IOS input focus zoom workaround
      if ( navigator.userAgent.length && /iPhone|iPad|iPod/i.test(navigator.userAgent) ) {
        $('head').find('meta[name=viewport]').remove();
        $('<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0" />').appendTo('head');
        clearTimeout( this.enableZoomTimer );
        this.enableZoomTimer = setTimeout(function(){
          $('head').find('meta[name=viewport]').remove();
          $('<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1" />').appendTo('head');
        }, 700 );
      }
    },
    
		searchInputFocus: function( vue ) {
      // $('#ale-search > input[type="search"]').one("focus", function() {
        
      //   if ( !vue.searchShouldSort ) {
      //     vue.searchShouldSort = true;
      //     vue.forceRerender();
      //     console.log( 'vue.forceRerender()' );
      //     // $('#ale-search > input[type="search"]').focus();
      //     setTimeout(function() {
      //       vue.$nextTick(() => {
      //         $('#ale-search > input[type="search"]').focus();
      //         vue.searchInputFocus( vue );
      //       });
      //     }, 10);
      //   }
        
      // });
		},
    
		searchInputKeyup: function( e ) {
      if (e.which == 13) {
      	document.activeElement.blur();
      	$('#ale-search > input[type="search"]').blur();
      }
		},
    
		focusSearch: function({target}) {
      if ( $(target).is('#ale-search') ) {
        $('#ale-search > input[type="search"]').focus();
      }
		},
		
    releaseSearchLock: function() {
      
      const gallery = this.gallery;
			gallery.customResults = null;
			gallery.searchEnabled = true;
      gallery.searchLocked.active = null;
      gallery.searchLocked.reason = null;
      gallery.searchLocked.inputValue = null;
			// gallery.searchOptions.lists.numberSortSeriesName = null;
      gallery.searchOptions.lists = this.gallery.searchOptions.listsTemp;
      gallery.searchOptions.listsTemp = null;
      gallery.searchValue = this.gallery.searchLocked.tempValue;
      gallery.searchLocked.tempValue = null;
      gallery.searchIcons.scope = true;
      gallery.searchIcons.filter = true;
      gallery.searchIcons.sort = true;
      gallery.details.open = false;
      gallery.details.index = -1;
      
    },
    
    onDetailsToggle: function( msg ) {
      this.gallery.searchOptions.open = false;
    },
    
    forceRerender: function() {
      this.gallery.searchEnabled = false;
      this.$nextTick(() => {
        this.gallery.searchEnabled = true;
      });
    },
    forceRerenderBooks: function() {
      const customResults = this.gallery.customResults;
      console.log( customResults )
      this.gallery.customResults = {};
      this.$nextTick(() => {
        this.gallery.customResults = customResults;
      });
    },
    
    optionsCheck: function( type, index ) {
      this.gallery.details.open = false;
      this.gallery.details.index = -1;
      if ( type === 'sort' ) {
        
        const oldSortIndex = this.gallery.searchOptions.lists.sortIndex;
        this.gallery.searchOptions.lists.sortIndex = index;
        // this.searchShouldSort = false;
        const sortValuesActive = _.find(this.gallery.searchOptions.lists.sortExtras, function( o ) { return o.key === 'sortValues' && o.active });
        if ( sortValuesActive && oldSortIndex !== index ) {
          this.forceRerenderBooks();
        }
      }
      // if ( !this.gallery.searchLocked.active ) {
      //   this.forceRerender();
      // }
    },
    
    sortExtrasCheck: function( key ) {
      
      if ( key === 'randomize' ) {
        this.gallery.details.open = false;
        this.gallery.details.index = -1;
      }
      else if ( key === 'sortValues' ) {
        this.forceRerenderBooks();
      }
      
    },
    
    openSearchOptions: function( option, e ) {
      
      const vue = this;
      if ( !this.gallery.searchOptions.open ) {
        this.gallery.searchOptions.open = true;
      }
      else if ( this.gallery.searchOptions.open && this.gallery.searchOptions.lists.current == option ) {
        this.gallery.searchOptions.open = false;
      }
      
      if ( this.gallery.searchOptions.open && vue.searchOptionsHider === null ) {
        vue.searchOptionsHider = $(document).on('mouseup', function (e) {
          var options = $(e.target).closest("#search-options");
          var optionsBtn = $(e.target).closest(".search-opt-btn");
          if ( options.length < 1 && optionsBtn.length < 1 ) {
            vue.gallery.searchOptions.open = false;
          }
        });
      }
      
      var currentOption = this.gallery.searchOptions.lists.current;
      this.gallery.searchOptions.lists.current = option;
      
      if ( this.gallery.searchOptions.open || currentOption !== option ) {
        var clickedEl = $( e.currentTarget );
        this.$nextTick(() => {
          this.repositionSearchOptions( clickedEl );
        });
      }
      
    },
		
		repositionSearchOptions: function( clickedEl ) {
      
      const searchOpts = {};
      searchOpts.el = $('#search-options');
      searchOpts.width = searchOpts.el.innerWidth();
      
      const iconsWrapper = {};
      iconsWrapper.el = $('#ale-search > .icons');
      iconsWrapper.width = iconsWrapper.el.innerWidth();
      
      const option = {};
      option.el = clickedEl.parent();
      option.width = option.el.innerWidth();
      option.middle = option.el.position().left + (option.width/2) + parseInt( option.el.css('margin-left'), 10);
      // searchOpts.position = option.middle - (searchOpts.width/2);
      option.middle = iconsWrapper.width - option.middle;
      searchOpts.position = option.middle - (searchOpts.width/2);
      
      var difference = (option.el.offset().left + (option.width/2) + (searchOpts.width/2)) - $(window).width();
      var fitToWindow = difference > 0 ? difference + 20 : 0;
      searchOpts.el.css({
        right: searchOpts.position + fitToWindow
      });
      
      const arrow = {};
      arrow.el = searchOpts.el.find('.search-opts-arrow');
      
      arrow.el.css({
        left: (searchOpts.width/2) - 10 + fitToWindow
      });
      
		},
    
  },
  computed: {
    
    searchIsActive: function() {
      return this.gallery.searchActive;
    },
    
    currentOptionsListName: function() {
      return this.gallery.searchOptions.lists.current;
    },
    
    currentOptionsList: function() {
      const key = this.gallery.searchOptions.lists.current;
      return this.gallery.searchOptions.lists[ key ];
    },
    
		placeholder: function() {
      var placeholderKeys = (function( keys ) {
        var truncKeys = [];
        $.each( keys, function( i, key ) {
          truncKeys.push( key.replace('.name','') );
        });
        return truncKeys.join(', ');
      }( this.aliciaKeys ));
      
      return 'Search: ' + placeholderKeys;
    },
    
    aliciaKeys: function() {
      const filteredKeys = _.filter(this.gallery.searchOptions.lists.scope, ['active', true]);
      return _.map( filteredKeys, function( item ) {
        if ( item.active ) return item.key;
      });
    }
    
  }
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

#ale-search-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  align-content: center;
  justify-content: center;
  margin: 0 auto;
  margin-bottom: 30px;
  max-width: 600px;
}

#ale-search {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  align-content: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  text-align: center;
  background: #fff;
  padding: 8px 20px;
  border-radius: 999999px;
  @include themify($themes) {
    box-shadow: 0 5px 20px rgba(themed(outerColor), 0.9);
  }
  .search-locked {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: default;
    position: relative;
    z-index: 0;
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    .icon {
      cursor: pointer;
      outline: none;
      position: relative;
      left: -9px;
      width: 31px;
      height: 31px;
      border: 1px solid #e1e1e1;
      box-shadow: 0 0px 3px rgba( #000, .05 );
      color: #c1c1c1;
      border-radius: 9999px;
      margin-right: 7px;
      display: flex;
      align-items: center;
      justify-items: center;
      align-content: center;
      justify-content: center;
      &:hover {
        box-shadow: 0 3px 7px rgba( #000, .13 );
        opacity: 1 !important;
        color: #555 !important;
        -webkit-animation: none !important;
        animation: none !important;
      }
    }
    &:hover .icon {
      opacity: .5;
      @include themify($themes) {
        color: themed(audibleOrange);
      }
      border: 1px solid #b1b1b1;
      -webkit-animation: pulsate-bck 1.1s ease-in-out infinite both;
      animation: pulsate-bck 1.1s ease-in-out infinite both;
    }
    
    .icon [data-icon="unlock-alt"] { display: none; }
    &:hover .icon {
      & [data-icon="lock"] { display: none; }
      & [data-icon="unlock-alt"] { display: inline-block; }
    }
    
    .locked-text-reason {
      position: absolute;
      z-index: 5;
      left: 40px;
      top: 17px;
      color: #878787;
      font-size: .7em;
    }
    .locked-text {
      text-align: left;
      flex-grow: 1;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      width: 0px;
      margin-top: -2px;
    }
  }
  input[type="search"] {
    outline: none;
    display: inline-block;
    flex-grow: 1;
    border: none;
    font-family: inherit;
    font-weight: 400;
    // line-height: 31px;
    // height: 31px;
  }
  
  input[type="search"]::-webkit-search-cancel-button {

    -webkit-appearance: none;
    height: 10px;
    width: 10px;
    padding: 5px;
    display: block;
    background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGRlZnM+PHN0eWxlPi5je2ZpbGw6IzZmNmY2Zjt9PC9zdHlsZT48L2RlZnM+PGc+PGc+PGc+PHBhdGggY2xhc3M9ImMiIGQ9Ik0yMCwxNi4wOWExLjU1LDEuNTUsMCwwLDEtLjQ3LDEuMTVsLTIuMjksMi4yOWExLjU1LDEuNTUsMCwwLDEtMS4xNS40N0ExLjYsMS42LDAsMCwxLDE1LDE5LjUzbC00Ljk1LTUtNSw1QTEuNTUsMS41NSwwLDAsMSwzLjkxLDIwYTEuNTUsMS41NSwwLDAsMS0xLjE1LS40N0wuNDcsMTcuMjRBMS41NSwxLjU1LDAsMCwxLDAsMTYuMDksMS42LDEuNiwwLDAsMSwuNDcsMTVsNS00Ljk1LTUtNUExLjUzLDEuNTMsMCwwLDEsMCwzLjkxLDEuNTUsMS41NSwwLDAsMSwuNDcsMi43NkwyLjc2LjQ3QTEuNTUsMS41NSwwLDAsMSwzLjkxLDAsMS41MywxLjUzLDAsMCwxLDUuMDUuNDdsNSw1TDE1LC40N0ExLjYsMS42LDAsMCwxLDE2LjA5LDBhMS41NSwxLjU1LDAsMCwxLDEuMTUuNDdsMi4yOSwyLjI5QTEuNTUsMS41NSwwLDAsMSwyMCwzLjkxYTEuNTMsMS41MywwLDAsMS0uNDcsMS4xNGwtNSw1LDUsNC45NUExLjYsMS42LDAsMCwxLDIwLDE2LjA5WiIvPjwvZz48L2c+PC9nPjwvc3ZnPg==");
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 10px;
    cursor: pointer;
  }
  
  .icons {
    position: relative;
    z-index: 0;
    padding-left: 9px;
    color: rgba( #222, .65) ;
    display: flex;
    flex-direction: row;
    
    > .icon-wrap {
      cursor: pointer;
      margin-left: 5px;
      > div {
        padding: 6px 10px;
        outline: none;
      }
      position: relative;
      z-index: 0;
      &.disabled:before {
        content: '';
        position: absolute;
        z-index: 10;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
      &.disabled > div {
        opacity: .3;
      }
    }
    
    .filter {
      font-size: .92em;
    }
    
    .is-enabled,
    .active {
      @include themify($themes) {
        color: themed(audibleOrange);
      }
    }
    
  }
  
  #search-options {
    cursor: default !important;
    position: absolute;
    z-index: 1;
    top: 35px;
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
      box-shadow: 0 3px 15px rgba( #000, .6 );
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
  
  .book-in-selection {
    cursor: default !important;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-size: .85em;
    > div {
      outline: none;
    }
  }
  
}
</style>