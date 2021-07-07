<template>
  <div id="ale-gallery" :data-audio-player-visible="$store.state.audioPlayerVisible">
    
    <!-- <ale-breadcrumbs :library="library" :general="general"></ale-breadcrumbs> -->
    
    <ale-search v-if="prepsCompleted" :collectionSource="collectionSource" :pageTitle="pageTitle" :pageSubTitle="pageSubTitle"></ale-search>
    
    <div v-if="collapseView" class="collection-expanded-btn" @click="expandView">
      <div>
        <span>Expand view</span>
        <span v-if="realLength">( {{ realLength }} )</span>
        <font-awesome :icon="['fas', 'unlock-alt']" />
      </div>
    </div>
    
    <div v-if="$store.getters.collection && $store.getters.collection.length > 0">
      <ale-grid-view @hook:mounted="gridViewMounted" @hook-beforeDestroy="viewsBeforeDestroy" v-if="$store.state.sticky.viewMode === 'grid'" />
      <ale-list-view @hook:mounted="listViewMounted" @hook-beforeDestroy="viewsBeforeDestroy" v-else-if="$store.state.sticky.viewMode === 'spreadsheet'" />
    </div>
    <div v-else-if="errorMessage" id="nothing-here-404">
      <h3 v-if="$store.getters.searchIsActive && !$store.state.searchCollection.length">Search: no results</h3>
      <h3 v-else>404: There's nothing here</h3>
    </div>
    
  </div>
</template>

<script>
import aleSearch from "./aleGallery/aleSearch";

import prepCategoriesSubPage from "@output-mixins/prepCategoriesSubPage.js";
import prepCollectionsSubPage from "@output-mixins/prepCollectionsSubPage.js";
import prepSeriesSubPage from "@output-mixins/prepSeriesSubPage.js";
import prepNarratorsSubPage from "@output-mixins/prepNarratorsSubPage.js";
import prepAuthorsSubPage from "@output-mixins/prepAuthorsSubPage.js";
import prepPublishersSubPage from "@output-mixins/prepPublishersSubPage.js";
import prepWishlist from "@output-mixins/prepWishlist.js";

import timeStringToSeconds from "@output-mixins/timeStringToSeconds";
import filterAndSort from "@output-mixins/filter-and-sort.js";
import galleryListRenderingOpts from "@output-mixins/gallery-list-rendering-opts.js";
import smoothscroll from "smoothscroll-polyfill";
import findSubPageSource from "@output-mixins/findSubPageSource.js";
smoothscroll.polyfill();

// import aleBreadcrumbs from '../aleBreadcrumbs'

export default {
  name: "aleGallery",
  components: {
    aleSearch,
    aleGridView: () => import( /* webpackChunkName: "grid-view" */ "./aleGallery/aleGridView"),
    aleListView: () => import( /* webpackChunkName: "spreadsheet-view" */ "./aleGallery/aleListView"),
    // aleBreadcrumbs,
  },
  mixins: [
    filterAndSort, 
    prepCategoriesSubPage, 
    prepCollectionsSubPage, 
    prepSeriesSubPage,
    prepNarratorsSubPage,
    prepAuthorsSubPage,
    prepPublishersSubPage,
    prepWishlist,
    timeStringToSeconds,
    galleryListRenderingOpts,
    findSubPageSource,
  ],
  
  data: function() {
    return {
      collectionSource: 'library.books',
      pageTitle: null,
      pageSubTitle: null,
      scrollContainer: null,
      collapseView: null,
      realLength: 0,
      prepsCompleted: false,
      errorMessage: false,
    };
  },
  
  beforeCreate: function() {
    
    if ( this.$route.query.view ) {
      this.$store.commit('stickyProp', { key: 'viewMode', value: this.$route.query.view });
    }
    
  },
  
  created: function() {
    
    if ( this.$route.name === 'gallery' ) {
      this.pageTitle = 'Library';
      this.pageSubTitle = null;
    }
    else if ( this.$route.name === 'wishlist' ) {
      this.pageTitle = 'Wishlist';
      this.pageSubTitle = null;
    }
    
    this.updateListRenderingOptions();
    
    // Setup for other pages that use the gallery page to show titles
    this.prepCategoriesSubPage();    
    this.prepCollectionsSubPage();    
    this.prepSeriesSubPage();
    this.prepNarratorsSubPage();
    this.prepAuthorsSubPage();
    this.prepPublishersSubPage();
    this.prepWishlist();
    
    this.prepsCompleted = true;
    
    // this.pageLoadBook = _.get(this.$route, "query.book");
    // ID: tn664iGW (related to 3Ez82Egn)
    // Makes it so just the book with book details open with open on page load
    // this.collapseView = this.pageLoadBook && this.$route.name !== 'series';
    
  },
  
  watch: {
    '$store.getters.collection': function() {
      
      this.$store.commit("chunkCollectionReset");
      
      // if ( this.pageLoadBook && this.$route.name === 'series' ) {
      //   this.$store.commit("prop", { key: 'chunkCollection', value: this.$store.getters.collection });
      // }
      // else {
        this.$store.commit("chunkCollectionAdd");
      // }
      
    },
  },
  
  methods: {
    
    childrenMounted: function() {
      
      this.$nextTick(function() {
        
        const scrollPosition = this.$route.query.y ? parseFloat(this.$route.query.y) : 0;
        
        // Book query: open book details on load
        if ( this.$route.query.book ) {
          
          let wrapper = document.querySelector(".ale-books");
          let wrapperOffset = wrapper.offsetTop;
          let grid = this.$store.state.sticky.viewMode === 'grid';
          let bookHeight = grid ? wrapper.querySelector('.ale-book').getBoundingClientRect().height : wrapper.querySelector('table tbody .ale-row').getBoundingClientRect().height;
          let wrapperMax = grid ? wrapper.getBoundingClientRect().width : wrapper.getBoundingClientRect().height;
          let cols = Math.floor(wrapperMax / bookHeight) || 1;
          
          // this.$store.commit("chunkCollectionAdd", { chunkDistance: this.$store.state.chunkDistance * factor });
          
          let bookIndex = _.findIndex(this.$store.getters.collection, { asin: this.$route.query.book });
          let max = Math.ceil( (bookIndex+1) / cols );
          let currentRow = Math.floor(bookIndex / cols) + 1;
          let rowEnd = currentRow * cols;
          this.$store.commit("chunkCollectionAdd", { chunkDistance: rowEnd + this.$store.state.chunkDistance });
          // ID: 3Ez82Egn (related to tn664iGW)
          // Makes it so just the book with book details open with open on page load
          // this.realLength = this.$store.getters.collection.length;
          // if ( this.collapseView && ( this.realLength === 1 ) ) this.collapseView = false;
          // if ( this.collapseView ) {
            //   this.$store.commit("prop", { key: 'mutatingCollection', value: [book] });
          // }
          
          this.$nextTick(function() {
            this.$root.$emit("book-clicked", { book: this.$store.getters.collection[bookIndex] });
          });
          
        }
        else if ( scrollPosition ) {
          
          let wrapper = document.querySelector(".ale-books");
          let wrapperOffset = wrapper.offsetTop;
          let grid = this.$store.state.sticky.viewMode === 'grid';
          let bookHeight = grid ? wrapper.querySelector('.ale-book').getBoundingClientRect().height : wrapper.querySelector('table tbody .ale-row').getBoundingClientRect().height;
          let visibleArea = scrollPosition + window.innerHeight - wrapperOffset;
          let maxItems = Math.ceil(visibleArea / bookHeight) || 1;
          let wrapperMax = grid ? wrapper.getBoundingClientRect().width : wrapper.getBoundingClientRect().height;
          let cols = Math.floor(wrapperMax / bookHeight) || 1;
          let visibleBooks = grid ? maxItems*cols : cols;
          let factor = Math.ceil(visibleBooks / this.$store.state.chunkDistance) || 1;
          if ( factor > 1 ) {
            this.$store.commit("chunkCollectionAdd", { chunkDistance: this.$store.state.chunkDistance * factor });
          }
          
          if ( !this.$route.query.book ) {
            this.$nextTick(function () {
              if (this.$store.state.sticky.viewMode === 'grid') {
                scroll({
                  top: scrollPosition
                });
              } else {
                document.querySelector('.list-view-inner-wrap').scroll({
                  top: scrollPosition
                });
              }
            });
          }
        }
        
        this.errorMessage = true;
        
      });
    },
    
    expandView: function() {
      this.$updateQuery({ query: 'book', value: false, history: true });
      this.$root.$emit('refresh-page');
    },
    
    gridViewMounted: function() {
      
      this.scrollContainer = window;
      this.scrollContainer.addEventListener('scroll', this.addDomItems);
      
      this.childrenMounted();
      
    },
    listViewMounted: function() {
      
      this.scrollContainer = document.querySelector('.list-view-inner-wrap');
      this.scrollContainer.addEventListener('scroll', this.addDomItems);
      
      this.childrenMounted();
      
    },
    viewsBeforeDestroy: function() {
      this.scrollContainer.removeEventListener('scroll', this.addDomItems);
    },
    
    addDomItems: _.throttle( function(e) {
      
      let bottomOffset = this.$store.state.sticky.viewMode === 'grid' ? 550 + (window.innerHeight/2) : (this.scrollContainer.clientHeight/3);
      let container = this.$store.state.sticky.viewMode === 'grid' ? document.documentElement : this.scrollContainer;
      let atTheBottom = container.scrollTop + (container.innerHeight || container.clientHeight) + bottomOffset >= container.scrollHeight;
      this.$updateQuery({ query: 'y', value: container.scrollTop });
      if ( atTheBottom ) {
        this.$store.commit('chunkCollectionAdd');
      }
      
    }, 500, { leading: false, trailing: true }),
    
  },
  
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";

#ale-gallery {
  padding: 0 20px;
  &:before {
    content: ".";
    visibility: hidden;
    display: block;
    height: 0;
    clear: both;
  }
  
  @media ( min-width: 630px ) {
    &[data-audio-player-visible="true"] {
      padding-top: 64px;
    }
  }
  
  .collection-expanded-btn {
    cursor: pointer;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    text-align: center;
    margin-top: -8px;
    position: relative;
    z-index: 200;
    > div {
      display: inline-block;
      margin-bottom: 20px;
      padding: 7px 20px;
      border-radius: 8px;
      @include themify($themes) {
        color: themed(frontColor);
        border: 1px solid themed(audibleOrange);
        background: themed(backColor);
      }
      span {
        padding-right: 6px;
      }
    }
  }
  
}

</style>
