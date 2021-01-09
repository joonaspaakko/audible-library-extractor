<template>
<div id="ale-search-wrap" ref="searchWrap" :class="{ 'search-fixed': fixedSearch }">
  <div id="ale-search" ref="aleSearch">
    
    <div class="search-wrapper" @click="$refs.searchInput.focus()">
      <input type="search" ref="searchInput" :value="$store.state.searchQuery" @input="search" :placeholder="placeholder">
    </div>
          
    <search-icons   :list-name.sync="listName">{{ collection ? collection.length : '' }}</search-icons>
    <search-options :list-name.sync="listName" v-if="listName"></search-options>
  	
  </div> <!-- #ale-search -->
</div> <!-- #ale-search-wrap -->

</template>

<script>
import Fuse from 'fuse.js';

import searchIcons from './aleSearch/searchIcons';
import searchOptions from './aleSearch/searchOptions';

import filterAndSort from '@output-mixins/filter-and-sort.js';

export default {
  name: 'aleBookdetails',
  props: ['collection'],
  components: {
    searchIcons,
    searchOptions,
  },
  mixins: [ filterAndSort, ],
	data : function() {
		return {
			// resultTimer: null,
      enableZoomTimer: null,
      // searchShouldSort: false,
      // searchFocusListener: null,
      // searchOptionsHider: null,
      
      
      fuse: null,
      // Defaults
      fuseOptions: {
        keys: ['title'],
        location: 0,
        distance: 400,
        threshold: 0.25,
        shouldSort: true,
        includeScore: false,
        includeMatches: false,
        useExtendedSearch: true,
      },
      
      listName: false,
      
      
      waypointOpts: {
        rootMargin: '-37px',
      },
      fixedSearch: false,
      searchResult: null,
		}
  },
  
  
    // v-if="gallery.searchEnabled"
    // :placeholder="placeholder"
    // :list="library.books"
    // :keys="aliciaKeys"
    // :location="0"
    // :distance="400"
    // :threshold="0.25"
    // :defaultAll="false"
    // :search="gallery.searchValue"
    // :shouldSort="searchShouldSort"
  
  updated:function() {
    // console.log('%c' + 'SEARCH UPDATED' + '', 'background: yellow; color: #fff; padding: 2px 5px; border-radius: 8px;');
  },
  
  created: function() {
    var vue = this;
    
    // console.log('%c' + 'SEARCH CREATED' + '', 'background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;');
    
    // Eventbus.$on('detailsToggle', this.onDetailsToggle );
    
    // this.$on('fuseResultsUpdated', results => {
      
    //   this.$store.commit('prop', { key: 'searchActive', value: results.length > 0 });
    //   // vue.gallery.searchActive = results.length > 0;
      
    //   console.log('%c' + this.$store.state.searchActive + '', 'background: #c71485; color: #fff; padding: 2px 5px; border-radius: 8px;');
      
    //   if ( !vue.gallery.searchValue.trim() && !vue.gallery.searchActive ) {
    //     vue.gallery.searchOptions.lists.sortIndex = vue.gallery.searchOptions.lists.tempSortIndex;
    //     vue.gallery.searchOptions.lists.tempSortIndex = null;
    //     // console.log('TEMP sort index RESTORED -- tempsortIndex NULL');
    //   }
    //   else if ( vue.gallery.searchValue.trim() ) {
      
    //     // Activate Title temporarily
    //     if ( this.$store.state.searchActive && vue.gallery.searchValueChanged && vue.gallery.searchOptions.lists.tempSortIndex === null ) {
    //       vue.gallery.searchOptions.lists.tempSortIndex = vue.gallery.searchOptions.lists.sortIndex;
    //       // console.log('TEMP sort index saved - ' + ' regular: ' + vue.gallery.searchOptions.lists.sortIndex )
    //       vue.gallery.searchOptions.lists.sortIndex = -1;
    //     }
        
    //     clearTimeout( vue.resultTimer);
    //     vue.resultTimer = setTimeout(function() {
          
    //       vue.gallery.fuseResults = results;
    //     }, 500);
    //   }
      
    // });
    
    // this.$on('fuseInputChanged', value => {
    //   this.gallery.searchValueChanged = this.gallery.searchValue !== value;
    //   if ( this.gallery.searchValueChanged ) {
    //     this.gallery.searchOptions.open = false;
    //     this.gallery.details.index = -1;
        
    //     if ( value.trim() === '' ) {
    //       this.gallery.fuseResults = null; // 
    //     }
    //   }
    //   this.gallery.searchValue = value; // Helps retain the seach query when re-rendered.
    // });
    
  },
  
  mounted: function() {
    
    this.updateCollection();
    // this.searchFocusListener = $('#ale-search').on("focus", '> input[type="search"]', this.searchInputFocus);
    this.searchInputFocus( this );
    // this.searchKeyupListener = $('#ale-search').on("keyup", '> input[type="search"]', this.searchInputKeyup);
    // $("#ale-search").on('touchstart', this.iosAutozoomDisable);
    this.$refs.aleSearch.addEventListener('touchstart', this.iosAutozoomDisable, { passive: true});
    window.addEventListener('scroll', this.scrolling );    
    
    this.$root.$on('start-scope', this.scope);
    this.$root.$on('start-sort', this.sort);
    this.$root.$on('start-filter', this.filter);
    
  },
  
	beforeDestroy: function() {
		// $('#ale-search').off("focus", '> input[type="search"]', this.searchInputFocus);
		// $('#ale-search').off("keyup", '> input[type="search"]', this.searchInputFocus);
    // $("#ale-search").off('touchstart', this.iosAutozoomDisable);
    this.$refs.aleSearch.removeEventListener('touchstart', this.iosAutozoomDisable );
    // Eventbus.$off('detailsToggle', this.onDetailsToggle );
    // this.searchFocusListener = null;
    // this.searchKeyupListener = null;
    // this.searchOptionsHider = null;
    
    window.removeEventListener('scroll', this.scrolling );
    
    this.$root.$off('start-scope', this.scope);
    this.$root.$off('start-sort', this.sort);
    this.$root.$off('start-filter', this.filter);
    
	},
	
  methods: {
    
    scope: function() {
      // this.$emit('update:collection', 
      //   this.filterBooks( this.$store.state.library.books )
      // );
      if ( this.$store.state.searchQuery.trim() !== '' ) this.search();
    },
    filter: function() {
      
      this.$root.$emit('book-clicked', { book: null });
      
      if ( this.$store.state.searchQuery.trim() !== '' ) {
        this.$emit('update:collection', 
          this.filterBooks( this.searchResult )
        );
      }
      else {
        this.$emit('update:collection', 
          this.filterBooks( this.$store.state.library.books )
        );
      }
    },
    sort: function() {
      this.$emit('update:collection', 
        this.sortBooks( this.collection || this.$store.state.library.books )
      );
    },
    updateCollection: function() {
      let filtered = this.filterBooks( this.$store.state.library.books );
      this.$emit('update:collection', 
        this.sortBooks( filtered )
      );
    },
    
    scrolling: _.throttle(function( e ) {
      
      if ( !this.fixedSearch && window.pageYOffset > 44 ) {
        this.fixedSearch = true;
      }
      else if ( this.fixedSearch && window.pageYOffset < 44 ) {
        this.fixedSearch = false;
      }
      
    }, 350),
    
    search: _.debounce(function( e ) {
      
      this.$root.$emit('book-clicked', { book: null });
      if ( e ) this.$store.commit('prop', { key: 'searchQuery', value: e.target.value });
      
      if ( this.$store.state.searchQuery.trim() !== ''  ) {
        
        const query = this.modifyQuery( this.$store.state.searchQuery );
        
        this.fuseOptions.keys = this.aliciaKeys;
        this.fuse = new Fuse( this.$store.state.library.books, this.fuseOptions);
        let result = this.fuse.search( query );
        
        if ( result.length > 0 ) {
          result = _.map( result, function( o ) {
            return o.item;
          });
        }
        else {
          result = null;
        }
        this.searchResult = result;
        this.$emit('update:collection', result);
        
      }
      else {
        this.$emit('update:collection', this.$store.state.library.books);
      }
      
      if ( this.fixedSearch ) {
        scroll({ top: this.$refs.searchWrap.offsetTop - 10 });
      }
      // else {
      //   scroll({ top: 0 });
      // }
      
      // FIXME: I think I'm going to have to go with plan A because the saerch options can potentially be taller than the viewport and as it is you can't scroll down... When you search it scrolls to the top anyways... So plan A is to basically have a button that scrolls you up to the searchbar that is never fixed to the viewport and focuses on it....
      
    }, 270, { 'leading': false, 'trailing': true }),    
    
    onWaypoint ({ going, direction }) {
      // going: in, out
      // direction: top, right, bottom, left
      if (going === this.$waypointMap.GOING_IN) {
        this.fixedSearch = false;
      }
      else {
        this.fixedSearch = true;
      }
    },
    
    modifyQuery: function( query ) {
      
      let newQuery = '';
      const hasAmpersand = query.match(/&/);
      const hasAnd = query.match(/ ?and ?/);
      if ( hasAmpersand ) {
        newQuery = query + '|' + query.replace('&', 'and');
      }
      else if ( hasAnd ) {
        newQuery = query + '|' + query.replace('and', '&');
      }
      else {
        newQuery = query;
      }
      return newQuery;
      
    },
    
    iosAutozoomDisable: function() {
      // IOS input focus zoom workaround
      if ( navigator.userAgent.length && /iPhone|iPad|iPod/i.test(navigator.userAgent) ) {
        // $('head').find('meta[name=viewport]').remove();
        const head = document.querySelector('head');
        head.querySelector('meta[name=viewport]').remove();
        
        let tempMeta = document.createElement('meta');
        tempMeta.content = "width=device-width, initial-scale=1.0, user-scalable=0";
        tempMeta.setAttribute = "viewport";
        head.appendChild( tempMeta );
        // $('<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0" />').appendTo('head');
        
        clearTimeout( this.enableZoomTimer );
        this.enableZoomTimer = setTimeout(function() {
          
          head.querySelector('meta[name=viewport]').remove();
          
          let originalMeta = document.createElement('meta');
          originalMeta.content = "width=device-width, initial-scale=1.0, user-scalable=1";
          originalMeta.setAttribute = "viewport";
          head.appendChild( originalMeta );
          
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
      // if (e.which == 13) {
      // 	document.activeElement.blur();
      // 	$('#ale-search > input[type="search"]').blur();
      // }
		},
    
		focusSearch: function({target}) {
      // if ( $(target).is('#ale-search') ) {
      //   $('#ale-search > input[type="search"]').focus();
      // }
		},
		
    releaseSearchLock: function() {
      
      // const gallery = this.gallery;
			// gallery.customResults = null;
			// gallery.searchEnabled = true;
      // gallery.searchLocked.active = null;
      // gallery.searchLocked.reason = null;
      // gallery.searchLocked.inputValue = null;
			// // gallery.searchOptions.lists.numberSortSeriesName = null;
      // gallery.searchOptions.lists = this.gallery.searchOptions.listsTemp;
      // gallery.searchOptions.listsTemp = null;
      // gallery.searchValue = this.gallery.searchLocked.tempValue;
      // gallery.searchLocked.tempValue = null;
      // gallery.searchIcons.scope = true;
      // gallery.searchIcons.filter = true;
      // gallery.searchIcons.sort = true;
      // gallery.details.open = false;
      // gallery.details.index = -1;
      
    },
    
    onDetailsToggle: function( msg ) {
      // this.gallery.searchOptions.open = false;
    },
    
    forceRerender: function() {
      // this.gallery.searchEnabled = false;
      // this.$nextTick(() => {
      //   this.gallery.searchEnabled = true;
      // });
    },
    forceRerenderBooks: function() {
      // const customResults = this.gallery.customResults;
      // console.log( customResults )
      // this.gallery.customResults = {};
      // this.$nextTick(() => {
      //   this.gallery.customResults = customResults;
      // });
    },
    
    // sort: function( type, index ) {
      
      // this.gallery.details.open = false;
      // this.gallery.details.index = -1;
      
      // if ( type === 'sort' ) Eventbus.$emit('sort', index );
      
    // },
    
    openSearchOptions: function( option, e ) {
      
      // const vue = this;
      // if ( !this.gallery.searchOptions.open ) {
      //   this.gallery.searchOptions.open = true;
      // }
      // else if ( this.gallery.searchOptions.open && this.gallery.searchOptions.lists.current == option ) {
      //   this.gallery.searchOptions.open = false;
      // }
      
      // if ( this.gallery.searchOptions.open && vue.searchOptionsHider === null ) {
      //   vue.searchOptionsHider = $(document).on('mouseup', function (e) {
      //     var options = $(e.target).closest("#search-options");
      //     var optionsBtn = $(e.target).closest(".search-opt-btn");
      //     if ( options.length < 1 && optionsBtn.length < 1 ) {
      //       vue.gallery.searchOptions.open = false;
      //     }
      //   });
      // }
      
      // var currentOption = this.gallery.searchOptions.lists.current;
      // this.gallery.searchOptions.lists.current = option;
      
      // if ( this.gallery.searchOptions.open || currentOption !== option ) {
      //   var clickedEl = $( e.currentTarget );
      //   this.$nextTick(() => {
      //     this.repositionSearchOptions( clickedEl );
      //   });
      // }
      
    },
		
		repositionSearchOptions: function( clickedEl ) {
      
      // const searchOpts = {};
      // searchOpts.el = $('#search-options');
      // searchOpts.width = searchOpts.el.innerWidth();
      
      // const iconsWrapper = {};
      // iconsWrapper.el = $('#ale-search > .icons');
      // iconsWrapper.width = iconsWrapper.el.innerWidth();
      
      // const option = {};
      // option.el = clickedEl.parent();
      // option.width = option.el.innerWidth();
      // option.middle = option.el.position().left + (option.width/2) + parseInt( option.el.css('margin-left'), 10);
      // // searchOpts.position = option.middle - (searchOpts.width/2);
      // option.middle = iconsWrapper.width - option.middle;
      // searchOpts.position = option.middle - (searchOpts.width/2);
      
      // var difference = (option.el.offset().left + (option.width/2) + (searchOpts.width/2)) - $(window).width();
      // var fitToWindow = difference > 0 ? difference + 20 : 0;
      // searchOpts.el.css({
      //   right: searchOpts.position + fitToWindow
      // });
      
      // const arrow = {};
      // arrow.el = searchOpts.el.find('.search-opts-arrow');
      
      // arrow.el.css({
      //   left: (searchOpts.width/2) - 10 + fitToWindow
      // });
      
		},
    
  },
  computed: {
    
    aliciaKeys: function() {
      
      const filteredKeys = _.filter( this.$store.state.sticky.listRenderingOpts.scope, ['active', true]);
      return _.map( filteredKeys, function( item ) {
        if ( item.active ) return item.key;
      });
      
    },
    
    // searchIsActive: function() {
    //   return this.gallery.searchActive;
    // },
    
    // currentOptionsListName: function() {
    //   return this.gallery.searchOptions.lists.current;
    // },
    
    // currentOptionsList: function() {
    //   const key = this.gallery.searchOptions.lists.current;
    //   return this.gallery.searchOptions.lists[ key ];
    // },
    
		placeholder: function() {
      
      const placeholderKeys = (function( keys ) {
        return _.map( keys, function( key ) {
          return key.replace('.name','');
        }).join(', ');
      }( this.aliciaKeys ));
      
      return 'Search: ' + placeholderKeys;
      
    },
    
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
  height: 46px;
}

#ale-search {
  height: 46px;
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-items: stretch;
  align-content: stretch;
  justify-content: stretch;
  position: relative;
  z-index: 800;
  top: 0px;
  text-align: center;
  background: #fff;
  border-radius: 999999px;
  @include themify($themes) {
    box-shadow: 0 5px 20px rgba(themed(outerColor), 0.9);
  }
  
  .search-wrapper {
    flex: 1;
    padding: 8px 20px;
    padding-right: 0px;
    display: flex;
    cursor: text;
    
    input[type="search"] {
      text-overflow: ellipsis;
      padding: 0px;
      outline: none;
      display: inline-block;
      flex-grow: 1;
      border: none;
      font-family: inherit;
      font-weight: 400;
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
  }
  
  
  .icons {
    position: relative;
    z-index: 0;
    padding: 0 18px 0 9px;
    color: rgba( #222, .65) ;
    display: flex;
    flex-direction: row;
    
    > .icon-wrap {
      cursor: pointer;
      margin-left: 5px;
      display: flex;
      justify-content: center;
      justify-items: center;
      align-content: center;
      align-items: center;
      > div {
        padding: 0px 10px;
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

#ale-search-wrap.search-fixed #ale-search {
  position: fixed;
  top: 36px;
  left: 30px;
  right: 30px;
  margin: 0 auto;
  max-width: 600px;
  height: 36px;
  box-shadow: none;
  &:before {
    content: '';
    position: fixed;
    z-index: -1;
    top: 35px;
    left: 0px;
    right: 0px;
    height: 37px;
    background: #fff;
    box-shadow: 2px 0px 13px rgba(#000, .5);
  }
}

</style>
