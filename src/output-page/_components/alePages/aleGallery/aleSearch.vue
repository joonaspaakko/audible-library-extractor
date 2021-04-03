<template>
  <div>
    
    <div
    id="ale-search-wrap"
    ref="searchWrap"
    :class="{ 'search-fixed': fixedSearch, 'highlight-search': highlightSearch }"
    >
      
      <div id="search-dropdown-overlay" v-show="listName"></div>
      
      <div id="ale-search" ref="aleSearch">
        <div class="search-wrapper" @click="$refs.searchInput.focus()">
          <input
            type="search"
            ref="searchInput"
            :value="$store.state.searchQuery"
            @input="search"
            @keyup.enter="searchEnterBlur"
            :placeholder="placeholder"
          />
        </div>
        
        <search-icons :list-name.sync="listName">{{ $store.getters.collection.length }}</search-icons> 
        <search-options
          :list-name.sync="listName"
          v-if="listName"
        ></search-options>
      </div> <!-- #ale-search -->
      
      <view-mode-switcher v-if="$route.name !== 'all-series' && $store.state.windowWidth >= 450" />
      
    </div> <!-- #ale-search-wrap -->
    
  </div>
</template>

<script>
import Fuse from "fuse.js";

import searchIcons from "./aleSearch/searchIcons";
import searchOptions from "./aleSearch/searchOptions";

import filterAndSort from "@output-mixins/filter-and-sort.js";

export default {
  name: "aleBookdetails",
  components: {
    searchIcons,
    searchOptions,
    viewModeSwitcher: () => import( /* webpackChunkName: "view-mode-switcher" */ "@output-snippets/viewModeSwitcher"),
  },
  mixins: [filterAndSort],
  props: ['collectionSource'],
  data: function() {
    return {
      enableZoomTimer: null,
      fuse: null,
      // Defaults
      fuseOptions: {
        keys: ["title"],
        location: 0,
        distance: 150,
        // threshold: 0.25,
        threshold: 0.25,
        // ignoreLocation: true,
        shouldSort: true,
        includeScore: false,
        includeMatches: false,
        useExtendedSearch: true
      },

      listName: false,

      waypointOpts: {
        rootMargin: "-37px"
      },
      fixedSearch: false,
      highlightSearch: false,
    };
  },

  created: function() {
    
    var vue = this;
    // this.$store.commit("prop", { key: "searchQuery", value: '' });
    this.$store.commit('prop', { key: 'collectionSource', value: this.collectionSource });
    
    const ifUrlParams = this.$route.query.sort || this.$route.query.filter || this.$route.query.filterExtras;
    let collection = _.get(this.$store.state, this.collectionSource);
    if ( ifUrlParams ) {
      if ( this.$route.query.filter || this.$route.query.filterExtras ) collection = this.filterBooks( collection );
      if ( this.$route.query.sort   ) collection = this.sortBooks( collection );
      this.$store.commit("prop", { key: 'mutatingCollection', value: collection });
    }
    else {
      // this.$store.commit("prop", { key: 'mutatingCollection', value: collection });
      this.$store.commit("prop", { key: 'mutatingCollection', value: this.sortBooks( this.filterBooks( collection ) ) });
    }
    
    if ( this.$route.query.search ) {
      const searchQuery = decodeURIComponent(this.$route.query.search);
      this.$store.commit("prop", { key: "searchQuery", value: searchQuery });
      if ( this.$route.query.sort ) this.fuseOptions.shouldSort = false;
      this.search();
    }
    
  },

  mounted: function() {
    
    this.$root.$on("ios-auto-zoom-disable", this.iosAutozoomDisable);
    this.$refs.aleSearch.addEventListener( "touchstart", this.iosAutozoomDisable );
    
    this.$root.$on("start-scope", this.scope);
    this.$root.$on("start-sort", this.sort);
    this.$root.$on("start-filter", this.filter);
    this.$root.$on("start-re-render", this.reRender);
    this.$root.$on("search-focus", this.focusOnSearch);
    this.$store.commit('prop', { key: 'searchMounted', value: true });
    
  },

  beforeDestroy: function() {
    
    this.$store.commit("prop", { key: "searchQuery", value: '' });
    this.$root.$off("ios-auto-zoom-disable", this.iosAutozoomDisable);
    this.$refs.aleSearch.removeEventListener( "touchstart", this.iosAutozoomDisable);

    this.$root.$off("start-scope", this.scope);
    this.$root.$off("start-sort", this.sort);
    this.$root.$off("start-filter", this.filter);
    this.$root.$off("start-re-render", this.reRender);
    this.$root.$off("search-focus", this.focusOnSearch);
    this.$store.commit('prop', { key: 'searchMounted', value: false });
    
  },

  methods: {
    
    scope: function() {
      this.$root.$emit("book-clicked", { book: null });
      // No need to shuffle anything when there's no active search
      if ( this.$store.getters.searchIsActive ) {
        this.$store.commit("prop", { key: 'mutatingCollection', value: this.sortBooks( this.filterBooks( _.get(this.$store.state, this.collectionSource) ) ) });
        // this.$nextTick(function() {
          if ( !this.$store.state.searchSort ) this.fuseOptions.shouldSort = false;
          this.search();
        // });
      } 
    },
    filter: function() {
      
      this.$root.$emit("book-clicked", { book: null });
      
      this.$store.commit("prop", { key: 'mutatingCollection', value: this.sortBooks( this.filterBooks( _.get(this.$store.state, this.collectionSource) ) ) });
      
      if ( this.$store.getters.searchIsActive ) {
        // this.$nextTick(function() {
          if ( !this.$store.state.searchSort ) this.fuseOptions.shouldSort = false;
          this.search();
        // });
      } 
      
    },
    sort: function() {
      
      this.$root.$emit("book-clicked", { book: null });
      this.$store.commit("prop", { key: ( this.$store.getters.searchIsActive ? 'searchCollection' : 'mutatingCollection'), value: this.sortBooks( this.$store.getters.collection ) });
      
    },
    
    search: _.debounce( function( e, shouldSort ) {
      
      // Reset 
      this.$root.$emit("book-clicked", { book: null });
      
      const triggeredByEvent = e;
      if ( triggeredByEvent ) {
        
        this.fuseOptions.shouldSort = true;
        this.$store.commit("prop", { key: "searchQuery", value: e.target.value });
        this.$updateQuery({ query: 'search', value: encodeURIComponent(e.target.value) });
        
        if ( e.target.value.trim() !== "" ) {
          if ( this.$route.query.sort ) {
            this.$updateQuery({ query: 'sort', value: null });
            this.$updateQuery({ query: 'sortDir', value: null }); 
          }
        }
        else {
          var activeSorter = _.find( this.$store.state.listRenderingOpts.sort, 'current');
          this.$updateQuery({ query: 'sort', value: activeSorter.key });
          this.$updateQuery({ query: 'sortDir', value: activeSorter.active ? "desc" : "asc" });
        }
        
      }
      
      // This was really just for making sure sorters aren't shown as active when searching )
      if ( this.fuseOptions.shouldSort ) {
        this.$store.commit("prop", { 
          key: 'searchSort', 
          value: this.$store.getters.searchIsActive
        });
      }

      // Start searching
      if (this.$store.getters.searchIsActive) {
        const query = this.modifyQuery(this.$store.state.searchQuery);
        
        this.fuseOptions.keys = this.aliciaKeys;
        this.fuse = new Fuse( this.$store.state.mutatingCollection, this.fuseOptions );
        let result = this.fuse.search(query);
        
        if (result.length > 0) {
          result = _.map(result, function(o) {
            return o.item;
          });
        }
        
        this.$store.commit("prop", { key: 'searchCollection', value: result });
      }
      // Stop searching  
      else {
        this.$store.commit("prop", { key: 'searchCollection', value: [] });
      }
      
    }, 270, { leading: false, trailing: true }),
    
    searchEnterBlur: _.debounce( function(e) {
      this.$refs.searchInput.blur();
    }, 100, { leading: false, trailing: true }),
    
    restoreOptions: function() {
      
      updateListRenderingOpts();
      
    },
    
    focusOnSearch: function() {
      
      let vue = this;
      scroll({ top: 0 });
      this.highlightSearch = true;
      setTimeout(function() { vue.highlightSearch = false; }, 1200);
      this.$refs.searchInput.focus();
      
    },
    
    scrolling: _.throttle(function(e) {
      if (!this.fixedSearch && window.pageYOffset > 44) {
        this.fixedSearch = true;
      } else if (this.fixedSearch && window.pageYOffset < 44) {
        this.fixedSearch = false;
      }
    }, 350),
    
    onWaypoint({ going, direction }) {
      // going: in, out
      // direction: top, right, bottom, left
      if (going === this.$waypointMap.GOING_IN) {
        this.fixedSearch = false;
      } else {
        this.fixedSearch = true;
      }
    },

    modifyQuery: function(query) {
      let newQuery = "";
      const hasAmpersand = query.match(/&/);
      const hasAnd = query.match(/ ?and ?/);
      if (hasAmpersand) {
        newQuery = query + "|" + query.replace("&", "and");
      } else if (hasAnd) {
        newQuery = query + "|" + query.replace("and", "&");
      } else {
        newQuery = query;
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
        if (item.active) return item.key;
      });
    },

    placeholder: function() {
      const placeholderKeys = (function(keys) {
        return _.map(keys, function(key) {
          return key.replace(".name", "");
        }).join(", ");
      })(this.aliciaKeys);

      return "Search: " + placeholderKeys;
    }
  }
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

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
  -webkit-backdrop-filter: grayscale(.96);
  backdrop-filter: grayscale(.96);
    background: rgba(#505050, .55);
  @supports (backdrop-filter: grayscale(.96)) or (-webkit-backdrop-filter: grayscale(.96)) {
    background: rgba(#505050, .2);
  }
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

</style>
