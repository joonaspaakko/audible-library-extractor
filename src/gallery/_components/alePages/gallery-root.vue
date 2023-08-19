<template>
  <div id="ale-gallery">
    
    <gallery-book-details-settings v-if="$store.state.bookDetailSettingsOpen" />
    
    <!-- <ale-breadcrumbs :library="library" :general="general"></ale-breadcrumbs> -->
    
    <context-menu-reminder v-if="!$store.state.standalone && $store.state.sticky.contextMenuReminder" />
    
    <gallery-search v-if="prepsCompleted" :collectionSource="collectionSource" @vue:mounted="searchMounted" />
    
    <div v-if="collapseView" class="collection-expanded-btn" @click="expandView">
      <div>
        <span>Expand view</span>
        <span v-if="realLength">( {{ realLength }} )</span>
        <fa6-solid-lock-open/>
      </div>
    </div>
    
    <div v-if="!loading && $store.getters.collection && $store.getters.collection.length > 0">
      <div :style="galleryStyle">
        <gallery-grid-view @vue:mounted="gridViewMounted" @vue:beforeUnmount="viewsbeforeUnmount" v-if="$store.state.sticky.viewMode === 'grid'" />
        <gallery-list-view @vue:mounted="listViewMounted" @vue:beforeUnmount="viewsbeforeUnmount" v-else-if="$store.state.sticky.viewMode === 'spreadsheet'" />
        <gallery-book-details v-if="mountedChildren && $route.query.book" :key="$route.query.book" :asin="$route.query.book" />
      </div>
    </div>
    <div v-else-if="errorMessage" id="nothing-here-404">
      <h3 v-if="$store.getters.searchIsActive && !$store.state.searchCollection.length">Search: no results</h3>
      <h3 v-else class="error404">404: There's nothing here</h3>
    </div>
    
  </div>
</template>

<script>
import prepCategoriesSubPage from "@output-mixins/gallery-prepCategoriesSubPage.js";
import prepCollectionsSubPage from "@output-mixins/gallery-prepCollectionsSubPage.js";
import prepSeriesSubPage from "@output-mixins/gallery-prepSeriesSubPage.js";
import prepNarratorsSubPage from "@output-mixins/gallery-prepNarratorsSubPage.js";
import prepAuthorsSubPage from "@output-mixins/gallery-prepAuthorsSubPage.js";
import prepPublishersSubPage from "@output-mixins/gallery-prepPublishersSubPage.js";
import prepPodcasts from "@output-mixins/gallery-prepPodcasts.js";
import prepWishlist from "@output-mixins/gallery-prepWishlist.js";
import timeStringToSeconds from "@output-mixins/gallery-timeStringToSeconds.js";
import galleryListRenderingOpts from "@output-mixins/gallery-list-rendering-opts.js";
import smoothscroll from "smoothscroll-polyfill";
import findSubPageSource from "@output-mixins/gallery-findSubPageSource.js";
smoothscroll.polyfill();

export default {
  name: "GalleryRoot",
  mixins: [
    prepCategoriesSubPage, 
    prepCollectionsSubPage, 
    prepSeriesSubPage,
    prepNarratorsSubPage,
    prepAuthorsSubPage,
    prepPublishersSubPage,
    prepPodcasts,
    prepWishlist,
    timeStringToSeconds,
    galleryListRenderingOpts,
    findSubPageSource,
  
  ],
  
  data: function() {
    return {
      loading: true,
      collectionSource: 'library.books',
      pageTitle: null,
      pageSubTitle: null,
      scrollContainer: null,
      collapseView: null,
      realLength: 0,
      prepsCompleted: false,
      errorMessage: false,
      mountedChildren: false,
    };
  },
  
  beforeCreate: function() {
    
    if ( this.$route.query.view ) {
      this.$store.commit('stickyProp', { key: 'viewMode', value: this.$route.query.view });
    }
    
  },
  
  computed: {
    galleryStyle: function() {
      
      if ( this.$store.state.searchOptOpenHeight ) {
        
        return {
          overflow: 'hidden',
          height: this.$store.state.searchOptOpenHeight + 'px',
        };
        
      }
      else {
        return false;
      }
      
    },
  },
  
  created: function() {
    
    this.updateListRenderingOptions();
    
    // Setup for other pages that use the gallery page to show titles
    this.prepCategoriesSubPage();    
    this.prepCollectionsSubPage();    
    this.prepSeriesSubPage();
    this.prepNarratorsSubPage();
    this.prepAuthorsSubPage();
    this.prepPublishersSubPage();
    this.prepPodcasts();
    this.prepWishlist();
    
    this.prepsCompleted = true;
    
    // this.pageLoadBook = _.get(this.$route, "query.book");
    // ID: tn664iGW (related to 3Ez82Egn)
    // Makes it so just the book with book details open with open on page load
    // this.collapseView = this.pageLoadBook && this.$route.name !== 'series';
    
    this.$compEmitter.on("book-clicked", this.toggleBookDetails);
    
  },
  
  mounted() {
    // console.log('%c' + 'GALLERY.vue MOUNTED' + '', 'background: green; color: #fff; padding: 2px 5px; border-radius: 8px;');
    this.$nextTick(function() {
      this.errorMessage = true;
    });
  },
  
  beforeUnmount: function() {
    this.$compEmitter.off("book-clicked", this.toggleBookDetails);
    // console.log('%c' + 'GALLERY.vue DESTROYED' + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;');
    this.errorMessage = false;
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
    '$route.query.book': function( bookParam ) {
      
      // This is mostly in place because I didn't make certain things work in a reactive way
      // When you back or forward navigate to the same route (by name) this refreshes the view
      if ( !this.$store.state.bookClicked ) {
        this.$updateQueries({ refresh: true });
      }
      else {
        this.$store.commit('prop', { key: 'bookClicked', value: false });
      }
      
    },
  },
  
  methods: {
    
    childrenMounted: function() {
      
      this.$nextTick(function() {
        
        let scrollPosition = this.$route.query.y ? parseFloat(this.$route.query.y) : 0;
        if ( this.$route.query.scrolltop ) scrollPosition = 0;
        
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
          
          // this.$nextTick(function() {
          //   this.$compEmitter.emit("book-clicked", { book: this.$store.state.chunkCollection[bookIndex], index: bookIndex, force: true });
          // });
          
          this.$nextTick(function() {
            this.mountedChildren = true;
          });
          
        }
        else if ( scrollPosition || this.$route.query.scrolltop ) {
          
          this.$updateQueries({ scrolltop: null });

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
          if ( factor > 1 ) this.$store.commit("chunkCollectionAdd", { chunkDistance: this.$store.state.chunkDistance * factor });
          
          this.$nextTick(function() {
            if (this.$store.state.sticky.viewMode === 'grid') {
              scroll({
                top: scrollPosition
              });
            } else {
              document.querySelector('.list-view-inner-wrap').scroll({
                top: scrollPosition
              });
            }
            
            this.$nextTick(function() {
              this.mountedChildren = true;
            });
            
          });
          
        }
        else {
          this.$nextTick(function() {
            this.mountedChildren = true;
          });
        }
        
      });
    },
    
    expandView: function() {
      
      // this.$updateQueries({ book: null }, { history: true });
      
    },
    
    gridViewMounted: function() {
      
      this.scrollContainer = window;
      this.scrollContainer.removeEventListener('scroll', this.addDomItems);
      this.scrollContainer.addEventListener('scroll', this.addDomItems, { passive: true });
      
      this.childrenMounted();
      
    },
    listViewMounted: function() {
      
      this.scrollContainer = document.querySelector('.list-view-inner-wrap');
      this.scrollContainer.removeEventListener('scroll', this.addDomItems);
      this.scrollContainer.addEventListener('scroll', this.addDomItems, { passive: true });
      
      this.childrenMounted();
      
    },
    viewsbeforeUnmount: function() {
      
      this.scrollContainer.removeEventListener('scroll', this.addDomItems);
      this.mountedChildren = false;
      
    },
    
    addDomItems: _.throttle( function(e) {
      if ( this.$store.state.lazyScroll ) {
        
        const gridView = this.$store.state.sticky.viewMode === 'grid';
        let bottomOffset = gridView ? 550 + (window.innerHeight/2) : (this.scrollContainer.clientHeight/3);
        let container = gridView ? document.documentElement : this.scrollContainer;
        let atTheBottom = container.scrollTop + (container.innerHeight || container.clientHeight) + bottomOffset >= container.scrollHeight;
        
        // At the bottom of currently rendered chunk
        if ( atTheBottom ) this.$store.commit('chunkCollectionAdd');
        
        // Update scroll distance
        // Don't update with book details open, because it takes precedence
			  this.$updateQueries({ y: container.scrollTop });
        
      }
    }, 450, { leading: false, trailing: true }),
    
    searchMounted() {
      
      const vue = this;
      this.$nextTick(function() {
        setTimeout(function() {
          vue.loading = false;
        }, 10);
      });
      
    },
    
    // updateScrollDistance: _.debounce( function( scrollTop ) {
    //   this.$updateQueries({ y: scrollTop });
    // }, 100, { leading: false, trailing: true }),
    
    toggleBookDetails: function( asin ) {
      
      this.$store.commit('prop', { key: 'bookClicked', value: true });
      
      const clicked = {
        asin: asin,
      };
      
      const query = {
        asin: _.get(this.$route, 'query.book'),
        newValue: clicked.asin,
      };
      
      // Abort if changing url param is unnecessary
      // - This was causing issues when it was overlapping with other url param changes      
      if ( 
        !query.newValue === !query.asin && !query.newValue // || // If false + identical value
        //  query.newValue ===  query.asin && !!query.newValue  // If true + identical value
      ) return;
      
      // Already open, so close it
      if ( clicked.asin === query.asin ) query.newValue = null;
      // nullify false
      if ( !query.newValue ) query.newValue = null;
      // Active book clicked: close bookdetails
      this.$updateQueries({ book: query.newValue }, { src: 'toggleBookDetails' });
      
    },
    
  },
  
  
  
};
</script>

<style lang="scss" scoped>


#ale-gallery {
  padding: 0 20px;
  &:before {
    content: ".";
    visibility: hidden;
    display: block;
    height: 0;
    clear: both;
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
