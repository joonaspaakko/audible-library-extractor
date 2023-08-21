<template>
  <div>
    
    <gallery-page-title></gallery-page-title>
    
    <gallery-library-wishlist-switcher v-if="$route.meta.subPage" :aboveSearch="true" />
    
    <div
    id="ale-search-wrap"
    ref="searchWrap"
    :class="{ 'search-fixed': fixedSearch, 'highlight-search': highlightSearch }"
    >
      
      <div id="search-dropdown-overlay" v-show="listName"
        @mousedown="readyToCloseOpts = true" 
        @touchstart="readyToCloseOpts = true" 
        @touchmove="dontCloseOpts"
        @click="closeOpts"
      ></div>
      
      <div id="ale-search" ref="aleSearch">
        <div class="search-wrapper" @click="$refs.searchInput.focus()">
          <input
            type="search"
            ref="searchInput"
            :value="$store.state.searchQuery"
            @input="search"
            @keyup.enter="searchEnterBlur"
            :placeholder="placeholder"
            @focus="listName = false"
          />
        </div>
        
        <gallery-search-icons v-model:list-name="listName" /> 
        <gallery-search-options v-model:list-name="listName" v-if="listName" />
      </div> <!-- #ale-search -->
      
      <gallery-view-mode-switcher v-if="$route.meta.gallery && $store.state.windowWidth >= 450" />
      
    </div> <!-- #ale-search-wrap -->
    
    <div class="autocomplete" v-if="useAutocomplete && autocompleteResults && autocompleteResults.length">
      <div class="header-wrapper">
        <div class="title">Autocomplete: </div>
        <div 
        class="header" :class="{ active: item.active }"
        v-for="item in autocompleteResults" :key="item.key+'-header'" 
        @click="active_ac_item( item )"
        >
          <div>{{ item.name }}</div>
        </div>
      </div>
      <div class="content-wrapper" v-for="item in autocompleteResults" :key="item.key" v-if="item.active">
          <div class="content">
            <div v-for="book in item.books" @click="searchAutocompleteResult(  book )">
            <!-- <label> -->
              <!-- <input type="checkbox" > -->
              <span>{{ book.match.value }}</span>
            <!-- </label> -->
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>

import Fuse from 'fuse.js'
import filterAndSort from '@output-mixins/gallery-filter-and-sort.js';

export default {
  name: "GallerySearch",
  mixins: [filterAndSort],
  props: ['collectionSource'],
  data: function() {
    return {
      enableZoomTimer: null,
      fuse: null,
      // Defaults
      fuseOptions: {
        keys: [],
        location: 0,
        // distance: 350,
        // threshold: 0.15,
        threshold: 0.3,
        ignoreLocation: true,
        shouldSort: true,
        includeScore: true,
        includeMatches: true,
        useExtendedSearch: true,
        minMatchCharLength: 2,
      },

      listName: false,

      waypointOpts: {
        rootMargin: "-37px"
      },
      fixedSearch: false,
      highlightSearch: false,
      readyToCloseOpts: false,
      autocompleteResults: [],
      useAutocomplete: false,
    };
  },
  
  mounted: function() {
    
    if ( this.$route.query.search ) {
      let searchQuery = decodeURIComponent(this.$route.query.search);
      this.$store.commit("prop", { key: "searchQuery", value: searchQuery });
    }
    
    this.$store.commit('prop', { key: 'collectionSource', value: this.collectionSource });
    
    let collection = this.$store.getters.collectionSource;
    const ifUrlParams = this.$route.query.sort || this.$route.query.filter || this.$route.query.filterExtras;
    if ( ifUrlParams ) {
      if ( this.$route.query.filter || this.$route.query.filterExtras ) collection = this.filterBooks( collection );
      if ( this.$route.query.sort   ) collection = this.sortBooks( collection );
      this.$store.commit("prop", { key: 'mutatingCollection', value: collection });
    }
    else {
      // this.$store.commit("prop", { key: 'mutatingCollection', value: collection });
      this.$store.commit("prop", { key: 'mutatingCollection', value: this.sortBooks( this.filterBooks( collection ) ) });
    }
    
    if ( this.$route.query.search ) {
      if ( this.$route.query.sort ) this.fuseOptions.shouldSort = false;
      this.search( null, 'on-load');
    }
    
    this.$refs.aleSearch.addEventListener( "touchstart", this.iosAutozoomDisable, { passive: true });
    this.$compEmitter.on("ios-auto-zoom-disable", this.iosAutozoomDisable);
    this.$compEmitter.on("start-scope", this.scope);
    this.$compEmitter.on("start-sort", this.sort);
    this.$compEmitter.on("start-filter", this.filter);
    this.$compEmitter.on("search-focus", this.focusOnSearch);
    this.$store.commit('prop', { key: 'searchMounted', value: true });
    
  },

  beforeUnmount: function() {
    
    this.$store.commit("prop", { key: "searchQuery", value: '' });
    this.$refs.aleSearch.removeEventListener( "touchstart", this.iosAutozoomDisable);
    this.$compEmitter.off("ios-auto-zoom-disable", this.iosAutozoomDisable);
    this.$compEmitter.off("start-scope", this.scope);
    this.$compEmitter.off("start-sort", this.sort);
    this.$compEmitter.off("start-filter", this.filter);
    this.$compEmitter.off("search-focus", this.focusOnSearch);
    this.$store.commit('prop', { key: 'searchMounted', value: false });
    
  },
  
  methods: {
    
    dontCloseOpts: _.throttle( function() {
      if ( this.readyToCloseOpts ) this.readyToCloseOpts = false;
    }, 50, { leading: false, trailing: true }),
    
    closeOpts: function() {
      if ( this.readyToCloseOpts ) {
        this.readyToCloseOpts = false;
        this.$nextTick(function() {
          let vue = this;
          setTimeout(function() {
            vue.listName = false;
          }, 30); // Timeout prevents interaction with elements below the overlay on click...
        });
      }
    },
    
    scope: function() {
      this.$nextTick(() => {
        // No need to shuffle anything when there's no active search
        if ( this.$store.getters.searchIsActive ) {
          this.$store.commit("prop", { key: 'mutatingCollection', value: this.sortBooks( this.filterBooks(this.$store.getters.collectionSource) ) });
          if ( !this.$store.getters.searchIsActive ) this.fuseOptions.shouldSort = false;
          this.search();
        } 
        
      });
    },
    filter: function() {
      this.$nextTick(() => {
        
        this.$store.commit("prop", { key: 'mutatingCollection', value: this.sortBooks( this.filterBooks(this.$store.getters.collectionSource) ) });
        
        if ( !this.$store.getters.searchIsActive ) this.fuseOptions.shouldSort = false;
        if ( this.$store.getters.searchIsActive ) {
          this.search();
        } 
        
      });
    },
    sort: function() {
      this.$nextTick(() => {
        
        this.$store.commit("prop", { key: ( this.$store.getters.searchIsActive ? 'searchCollection' : 'mutatingCollection'), value: this.sortBooks( this.$store.getters.collection ) });
        
      });
    },
    
    search: _.debounce( function( e, onLoad ) {
      
      // Reset 
      const newQueries = {};
      const searchQuery = decodeURIComponent(this.$route.query.search);
      if ( !onLoad ) {
        newQueries.book = null;
        this.$store.commit('prop', { key: 'bookClicked', value: true });
      }
      
      const triggeredByEvent = e;
      if ( triggeredByEvent ) {
        
        this.fuseOptions.shouldSort = true;
        this.$store.commit("prop", { key: "searchQuery", value: e.target.value });
        newQueries.search = encodeURIComponent(e.target.value);
        if ( !newQueries.search ) newQueries.search = null;
        
        if ( e.target.value.trim() !== "" ) {
          if ( this.$route.query.sort ) {
            newQueries.sort = null;
            newQueries.sortDir = null;
          }
        }
        else {
          var activeSorter = _.find( this.$store.state.listRenderingOpts.sort, 'current');
            newQueries.sort = activeSorter.key;
            newQueries.sortDir = activeSorter.active ? "desc" : "asc";
        }
        
      }
      
      this.$updateQueries( newQueries );
      
      // Start searching
      if (this.$store.getters.searchIsActive) {
        const query = this.modifyQuery(this.$store.state.searchQuery);
        
        this.fuseOptions.keys = this.aliciaKeys;
        
        let vue = this;
        
        vue.fuse = new Fuse( vue.$store.state.mutatingCollection, vue.fuseOptions );
        let result = vue.fuse.search(query);
        
        if ( vue.useAutocomplete ) vue.autocomplete( result );
        result = _.map(result, 'item');
        
        vue.$store.commit("prop", { key: 'searchCollection', value: result });
        
      }
      // Stop searching  
      else {
        this.$store.commit("prop", { key: 'searchCollection', value: [] });
      }
      
      
    }, 270, { leading: false, trailing: true }),
    
    autocomplete: function( result ) {
      
      const vue = this;
      let sections = _.map( JSON.parse(JSON.stringify(this.aliciaKeys)), function( o, index ) {
        o.key = o.name;
        o.name = o.name.replace('.name', '');
        o.active = index < 1;
        return o;
      });
      
      _.each( result, function( item ) {
        _.each( item.matches, function( match ) {
          
          const targetSection = _.find( sections, { key: match.key });
          targetSection.books = targetSection.books || [];          
          targetSection.books.push({
            item: item.item,
            match: match,
            refIndex: item.refIndex,
            score: item.score,
          });
          
        });
      });
      
      sections = _.filter( sections, 'books');
      
      _.each( sections, function( section, i ) {
        section.books = _.uniqBy( section.books, 'match.value');
        section.books = section.books.slice(0,5);
        if ( section.books.length < 2 ) sections[i] = null;
        section.active = false;
      });
      
      sections = _.compact( sections );
      if ( sections.length ) sections[0].active = true;
      
      console.log('sections', sections);
      
      // sections = _.orderBy( sections, function( sect ) {
      //   return _.minBy( sect.books, 'score' ).score;
      // }, 'asc');
      
      this.autocompleteResults = sections;
      
      console.log( sections );
      
    },
    
    active_ac_item: function( item ) {
      _.each( this.autocompleteResults, function( o ) {
        o.active = false;
      });
      item.active = true;
    },
    
    searchAutocompleteResult: function( book ) {
      
      const searchQuery = book.match.value;
      this.$store.commit('prop', { key: "searchQuery", value: searchQuery });
      this.search();
      
    },
    
    searchEnterBlur: _.debounce( function(e) {
      this.$refs.searchInput.blur();
    }, 100, { leading: false, trailing: true }),
    
    restoreOptions: function() {
      
      updateListRenderingOpts();
      
    },
    
    focusOnSearch: function() {
      
      let vue = this;
      scroll({ top: 0 });
      this.$refs.searchInput.focus();
      // this.highlightSearch = true;
      // setTimeout(function() { vue.highlightSearch = false; }, 1200);
      
    },
    
    // scrolling: _.throttle(function(e) {
    //   if (!this.fixedSearch && window.pageYOffset > 44) {
    //     this.fixedSearch = true;
    //   } else if (this.fixedSearch && window.pageYOffset < 44) {
    //     this.fixedSearch = false;
    //   }
    // }, 350),
    
    // onWaypoint({ going, direction }) {
    //   // going: in, out
    //   // direction: top, right, bottom, left
    //   if (going === this.$waypointMap.GOING_IN) {
    //     this.fixedSearch = false;
    //   } else {
    //     this.fixedSearch = true;
    //   }
    // },

    modifyQuery: function(query) {
      let newQuery = query;
      
      if ( query.match(/&/i) || query.match(/ and /i) || query.match(/ a /i) || query.match(/ the /i) ) {
        newQuery = query + "|" + 
                   query.replace(/ & /ig, " ") + "|" + 
                   query.replace(/ and /ig, " ") + "|" + 
                   query.replace(/ a /ig, " ") + "|" + // For some reason titles with particles act kinda weird
                   query.replace(/ an /ig, " ") + "|" + // For some reason titles with particles act kinda weird
                   query.replace(/ the /ig, " "); // For some reason titles with particles act kinda weird
      }
      
      return newQuery;
    },

    iosAutozoomDisable: function() {
      // IOS input focus zoom workaround
      if ( document.querySelector('.is-ios') ) {
        
        const head = document.querySelector("head");
        let metaViewport = head.querySelector("meta[name=viewport]");
        metaViewport.content = "width=device-width, initial-scale=1.0, user-scalable=0";
        
        clearTimeout(this.enableZoomTimer);
        this.enableZoomTimer = setTimeout(function() {
          metaViewport.content = "width=device-width, initial-scale=1.0, user-scalable=1";
        }, 700);
      }
    },
    
  },
  computed: {
    aliciaKeys: function() {
      const filteredKeys = _.filter(
        this.$store.state.listRenderingOpts.scope,
        ["active", true]
      );
      return _.map(filteredKeys, function(item) {
        return { name: item.key, weight: item.weight || 0 };
      });
    },

    placeholder: function() {
      const placeholderKeys = (function(keys) {
        return _.map(keys, function(key) {
          return key.name.replace(".name", "");
        }).join(", ");
      })(this.aliciaKeys);

      return "Search: " + placeholderKeys;
    }
  }
};
</script>

<style lang="scss">


#ale-search-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  align-content: center;
  justify-content: center;
  margin: 0 auto;
  padding-bottom: 30px;
  max-width: 600px;
  height: 46px;
  
  &.highlight-search #ale-search {
    // border: 3px solid $audibleOrange;
    background-color: $audibleOrange;
    &, & input { color: #fff; }
    ::placeholder { color: #fff; opacity: 1; }
    :-ms-input-placeholder { color: #fff; }
    ::-ms-input-placeholder { color: #fff; }
  }
  
}

#ale-search {
  // transition: all 10ms ease-in-out;
  // transition-delay: 500ms;
  width: 100%;
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
      background-color: transparent;
      text-overflow: ellipsis;
      padding: 0px;
      outline: none;
      display: inline-block;
      flex-grow: 1;
      border: none;
      font-family: inherit;
      font-weight: 400;
      min-width: 30px;
      width: 100%;
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
    z-index: 2;
    padding: 0 18px 0 9px;
    color: rgba(#222, 0.65);
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
      outline: none;
      > div {
        padding: 0px 10px;
        outline: none;
      }
      position: relative;
      z-index: 0;
      &.disabled:before {
        content: "";
        position: absolute;
        z-index: 10;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
      &.disabled > div {
        opacity: 0.3;
      }
    }

    .filter {
      font-size: 0.92em;
    }

    .is-enabled,
    .active {
      @include themify($themes) {
        color: themed(audibleOrange);
      }
    }
    .active-filters {
      display: inline-flex;
      justify-items: center;
      justify-content: center;
      align-items: center;
      align-content: center;
    }
    .active-filters:before {
      content: '';
      position: absolute;
      z-index: -1;
      top: 7px;
      border-radius: 99999999999px;
      width: 6px;
      height: 6px;
      @include themify($themes) {
        background: themed(audibleOrange);
      }
    }
  }
  
}

@media (max-width: 370px) {
  #ale-search .icons > .icon-wrap > div {
    padding: 0 5px;
  }
}



#search-dropdown-overlay {
  position: fixed;
  z-index: 700;
  -webkit-backdrop-filter: grayscale(.96) blur(1.5px);
  backdrop-filter: grayscale(.96) blur(1.5px);
  background: rgba(#505050, .55);
  @supports (backdrop-filter: grayscale(.96)) or (-webkit-backdrop-filter: grayscale(.96)) {
    background: rgba(#505050, .2);
  }
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.autocomplete {
  @include themify($themes) {
    color: themed( frontColor );
    max-width: 600px;
    margin: 0 auto;
    margin-bottom: 30px;
    padding: 10px;
    border-radius: 15px;
    border: 1px solid themed( frontColor );
    @extend .no-selection;
  }
  
  .header-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 5px;
    .title {
      font-weight: bold;
    }
    .header {
      cursor: pointer;
      padding: 2px 6px;
      margin: 2px;
      &.active {
        @include themify($themes) {
          color: themed(audibleOrange);
        }
      }
    }
  }
  .content-wrapper {
    cursor: pointer;
    display: block;
    padding: 5px;
    .search-highlight {
      @include themify($themes) {
        background: rgba( themed(audibleOrange), .4);
        color: #ffff;
      }
    }
  }
}

.theme-light .autocomplete {
  background: #fff;
  box-shadow: 0 3px 15px rgba(#000, 0.2);
}

.theme-dark .autocomplete {
  background: lighten( #121517, 4);
  box-shadow: 0 3px 15px rgba(#000, 1);
}

</style>
