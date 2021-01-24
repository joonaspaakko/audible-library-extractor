<template>
  <div>
    <div
      id="ale-search-wrap"
      ref="searchWrap"
      :class="{ 'search-fixed': fixedSearch }"
    >
      <div id="ale-search" ref="aleSearch">
        <div class="search-wrapper" @click="$refs.searchInput.focus()">
          <input
            type="search"
            ref="searchInput"
            :value="$store.state.searchQuery"
            @input="search"
            :placeholder="placeholder"
          />
        </div>

        <search-icons :list-name.sync="listName">{{ $store.getters.collection.length }}</search-icons> 
        <search-options
          :list-name.sync="listName"
          v-if="listName"
        ></search-options>
      </div> <!-- #ale-search -->
    </div> <!-- #ale-search-wrap -->
    <slot></slot>
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
    searchOptions
  },
  mixins: [filterAndSort],
  props: ['collectionSource'],
  data: function() {
    return {
      // resultTimer: null,
      enableZoomTimer: null,
      // searchShouldSort: false,
      // searchFocusListener: null,
      // searchOptionsHider: null,

      fuse: null,
      // Defaults
      fuseOptions: {
        keys: ["title"],
        location: 0,
        distance: 400,
        threshold: 0.25,
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
    };
  },

  updated: function() {
    // console.log('%c' + 'SEARCH UPDATED' + '', 'background: yellow; color: #fff; padding: 2px 5px; border-radius: 8px;');
  },
  
  created: function() {
    
    var vue = this;
    // console.log('%c' + 'SEARCH CREATED' + '', 'background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;');
    this.$store.commit("prop", { key: "searchQuery", value: '' });
    this.$store.commit('prop', { key: 'collectionSource', value: this.collectionSource });
    
    const ifUrlParams = this.$route.query.sort || this.$route.query.filter;
    let collection = _.get(this.$store.state, this.collectionSource);
    if ( ifUrlParams ) {
      if ( this.$route.query.filter ) collection = this.filterBooks( collection );
      if ( this.$route.query.sort   ) collection = this.sortBooks( collection );
      this.$store.commit("prop", { key: 'mutatingCollection', value: collection });
    }
    else {
      this.$store.commit("prop", { key: 'mutatingCollection', value: collection });
    }
    
    
  },

  mounted: function() {
    
    // this.searchFocusListener = $('#ale-search').on("focus", '> input[type="search"]', this.searchInputFocus);
    // this.searchKeyupListener = $('#ale-search').on("keyup", '> input[type="search"]', this.searchInputKeyup);
    // $("#ale-search").on('touchstart', this.iosAutozoomDisable);
    this.$refs.aleSearch.addEventListener( "touchstart", this.iosAutozoomDisable, { passive: true });
    // window.addEventListener("scroll", this.scrolling);

    this.$root.$on("start-scope", this.scope);
    this.$root.$on("start-sort", this.sort);
    this.$root.$on("start-filter", this.filter);
    this.$root.$on("start-re-render", this.reRender);
    
    this.$root.$on("search-focus", this.focusOnSearch);
    
  },

  beforeDestroy: function() {
    
    this.$store.commit("prop", { key: "searchQuery", value: '' });
    
    // $('#ale-search').off("focus", '> input[type="search"]', this.searchInputFocus);
    // $('#ale-search').off("keyup", '> input[type="search"]', this.searchInputFocus);
    // $("#ale-search").off('touchstart', this.iosAutozoomDisable);
    this.$refs.aleSearch.removeEventListener(
      "touchstart",
      this.iosAutozoomDisable
    );
    
    // this.searchFocusListener = null;
    // this.searchKeyupListener = null;
    // this.searchOptionsHider = null;

    // window.removeEventListener("scroll", this.scrolling);

    this.$root.$off("start-scope", this.scope);
    this.$root.$off("start-sort", this.sort);
    this.$root.$off("start-filter", this.filter);
    this.$root.$off("start-re-render", this.reRender);
    
    this.$root.$off("search-focus", this.focusOnSearch);
    
  },

  methods: {
    
    scope: function() {
      this.$root.$emit("book-clicked", { book: null });
      if (this.$store.getters.searchIsActive ) this.search();
    },
    filter: function() {
      
      this.$root.$emit("book-clicked", { book: null });
      // scroll({ top: 0 });
      
      if ( this.$store.getters.searchIsActive ) {
        this.$store.commit("prop", { key: 'mutatingCollection', value: this.filterBooks( _.get(this.$store.state, this.collectionSource) ) });
        this.search();
      } 
      else {
        this.$store.commit("prop", { key: 'mutatingCollection', value: this.sortBooks( this.filterBooks( _.get(this.$store.state, this.collectionSource) ) ) });
      }
      
    },
    sort: function() {
      
      this.$root.$emit("book-clicked", { book: null });
      this.$store.commit("prop", { key: ( this.$store.getters.searchIsActive ? 'searchCollection' : 'mutatingCollection'), value: this.sortBooks( this.$store.getters.collection ) });
      
    },
    
    search: _.debounce( function(e) {
      
      // Reset 
      this.$root.$emit("book-clicked", { book: null });
      if (e)this.$store.commit("prop", { key: "searchQuery", value: e.target.value });

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
    
    restoreOptions: function() {
      
      updateListRenderingOpts();
      
    },
    
    focusOnSearch: function() {
      
      scroll({ top: 0 });
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
      if (
        navigator.userAgent.length &&
        /iPhone|iPad|iPod/i.test(navigator.userAgent)
      ) {
        // $('head').find('meta[name=viewport]').remove();
        const head = document.querySelector("head");
        head.querySelector("meta[name=viewport]").remove();

        let tempMeta = document.createElement("meta");
        tempMeta.content =
          "width=device-width, initial-scale=1.0, user-scalable=0";
        tempMeta.setAttribute = "viewport";
        head.appendChild(tempMeta);
        // $('<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0" />').appendTo('head');

        clearTimeout(this.enableZoomTimer);
        this.enableZoomTimer = setTimeout(function() {
          head.querySelector("meta[name=viewport]").remove();

          let originalMeta = document.createElement("meta");
          originalMeta.content =
            "width=device-width, initial-scale=1.0, user-scalable=1";
          originalMeta.setAttribute = "viewport";
          head.appendChild(originalMeta);
        }, 700);
      }
    },

    searchInputKeyup: function(e) {
      // if (e.which == 13) {
      // 	document.activeElement.blur();
      // 	$('#ale-search > input[type="search"]').blur();
      // }
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
    content: "";
    position: fixed;
    z-index: -1;
    top: 35px;
    left: 0px;
    right: 0px;
    height: 37px;
    background: #fff;
    box-shadow: 2px 0px 13px rgba(#000, 0.5);
  }
}
</style>
