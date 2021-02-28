<template>
  <div id="ale-gallery" :data-audio-player-visible="$store.state.audioPlayerVisible">
    
    <!-- <ale-breadcrumbs :library="library" :general="general"></ale-breadcrumbs> -->
    
    <div class="gallery-title-wrapper" v-if="pageTitle || pageSubTitle">
      <h2 class="gallery-title" v-if="pageTitle">
        {{ pageTitle }}
      </h2>
      <div class="divider"></div>
      <h3 class="gallery-sub-title" v-if="pageSubTitle">
        {{ pageSubTitle }}
      </h3>
    </div>
    
    <ale-search :collectionSource="collectionSource"></ale-search>
    
    <div v-if="$store.getters.collection && $store.getters.collection.length > 0">
      <ale-grid-view v-if="$store.state.sticky.viewMode === 'grid'" />
      <ale-list-view v-else-if="$store.state.sticky.viewMode === 'spreadsheet'" />
    </div>
    
  </div>
</template>

<script>
import aleSearch from "./aleGallery/aleSearch";

import prepCategoriesSubPage from "@output-mixins/prepCategoriesSubPage.js";
import prepCollectionsSubPage from "@output-mixins/prepCollectionsSubPage.js";
import prepSeriesSubPage from "@output-mixins/prepSeriesSubPage.js";
import prepWishlist from "@output-mixins/prepWishlist.js";

import timeStringToSeconds from "@output-mixins/timeStringToSeconds";

// import aleBreadcrumbs from '../aleBreadcrumbs'
import filterAndSort from "@output-mixins/filter-and-sort.js";
import smoothscroll from "smoothscroll-polyfill";
smoothscroll.polyfill();

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
    prepWishlist,
    timeStringToSeconds,
  ],
  
  data: function() {
    return {
      collectionSource: 'library.books',
      pageTitle: null,
      pageSubTitle: null,
    };
  },
  
  beforeCreate: function() {
    
    if ( this.$route.query.view ) {
      this.$store.commit('stickyProp', { key: 'viewMode', value: this.$route.query.view });
    }
    
  },
  
  created: function() {
    
    this.updateListRenderingOptions();
    
    // Setup for other pages that use the gallery page to show titles
    this.prepCategoriesSubPage();    
    this.prepCollectionsSubPage();    
    this.prepSeriesSubPage();
    this.prepWishlist();
    
  },
  
  methods: {
    updateListRenderingOptions: function() {
      const vue = this;
      let list = {
        scope: [
          { active: true,  key: 'title' },
          { active: true,  key: 'authors.name' },
          { active: true,  key: 'narrators.name' },
          { active: true,  key: 'series.name' },
          { active: false, key: 'categories.name' },
          { active: false, key: 'publishers.name' },
        ],
        filter: [
          { active: true, type: 'filter', label: 'Not started', key: 'notStarted', condition: function( book ) { return !book.progress; } },
          { active: true, type: 'filter', label: 'Started',     key: 'started',    condition: function( book ) { return book.progress && !book.progress.toLowerCase().match('finished') ? true : false; }  },
          { active: true, type: 'filter', label: 'Finished',    key: 'finished',   condition: function( book ) { return book.progress && book.progress.toLowerCase().match('finished') ? true : false; }  },
          
          { type: 'divider', key: 'divider1' },
          
          { active: true,  type: 'filterExtras', label: 'All',          key: 'all',          group: 'filterExtras', condition: function( book ) { return book.asin;            } },
          { active: false, type: 'filterExtras', label: 'Favorites',    key: 'favorites',    group: 'filterExtras', condition: function( book ) { return book.favorite;        } },
          { active: false, type: 'filterExtras', label: 'Not in series', key: 'not-inseries', group: 'filterExtras', condition: function( book ) { return !book.series; } },
          { active: false, type: 'filterExtras', label: 'In series', key: 'inseries', group: 'filterExtras', condition: function( book ) { return book.series; } },
          { active: false, type: 'filterExtras', label: 'From plus catalog', key: 'from-plus-catalog', group: 'filterExtras', condition: function( book ) { return book.fromPlusCatalog; } },
          { active: false, type: 'filterExtras', label: 'Unavailable', key: 'unavailable', group: 'filterExtras', condition: function( book ) { return book.fromPlusCatalog && book.unavailable; } },
          { active: false, type: 'filterExtras', label: 'Store page unavailable', key: 'store-page-unavailable', group: 'filterExtras', condition: function( book ) { return book.storePageChanged || book.storePageMissing; } },
          { active: false, type: 'filterExtras', label: 'New books', key: 'new-books', group: 'filterExtras', condition: function( book ) { return book.isNew; } },
          
          { type: 'divider', key: 'divider2.0' },

          { active: false, type: 'filterExtras', label: 'Length 0-1h', key: 'length-0-1h', group: 'filterExtras', condition: function( book ) { 
            if (book.length) {
              const length = vue.timeStringToSeconds(book.length);
              return length <= 3600; 
            } 
          } },
          { active: false, type: 'filterExtras', label: 'Length 1-3h', key: 'length-1-3h', group: 'filterExtras', condition: function( book ) { 
            if (book.length) {
              const length = vue.timeStringToSeconds(book.length);
              return length > 3600 && length <= 10800; 
            } 
          } },
          { active: false, type: 'filterExtras', label: 'Length 3-5h', key: 'length-3-5h', group: 'filterExtras', condition: function( book ) { 
            if (book.length) {
              const length = vue.timeStringToSeconds(book.length);
              return length > 10800 && length <= 18000; 
            } 
          } },
          { active: false, type: 'filterExtras', label: 'Length 5-10h', key: 'length-5-10h', group: 'filterExtras', condition: function( book ) {
            if (book.length) {
              const length = vue.timeStringToSeconds(book.length);
              return length > 18000 && length <= 36000; 
            } 
          } },
          { active: false, type: 'filterExtras', label: 'Length 10-20h', key: 'length-10-20h', group: 'filterExtras', condition: function( book ) { 
            if (book.length) {
              const length = vue.timeStringToSeconds(book.length);
              return length > 36000 && length <= 72000; 
            } 
          } },
          { active: false, type: 'filterExtras', label: 'Length 20-30h', key: 'length-20-30h', group: 'filterExtras', condition: function( book ) {
            if (book.length) {
              const length = vue.timeStringToSeconds(book.length);
              return length > 72000 && length <= 108000; 
            } 
          } },
          { active: false, type: 'filterExtras', label: 'Length +30h', key: 'length-plus30h', group: 'filterExtras', condition: function( book ) {
            if (book.length) {
              const length = vue.timeStringToSeconds(book.length);
              return length > 108000; 
            } 
          } },
          
          { type: 'divider', key: 'divider2.1' },
          
          { active: false, type: 'filterExtras', label: 'Multiple narrators', key: 'multiple-narrators', group: 'filterExtras', condition: function( book ) { return book.narrators && book.narrators.length > 1; } },
          { active: false, type: 'filterExtras', label: 'Multiple narrators 2', key: 'multiple-narrators2', group: 'filterExtras', condition: function( book ) { return book.narrators && book.narrators.length === 2; } },
          { active: false, type: 'filterExtras', label: 'Multiple narrators 3-5', key: 'multiple-narrators-3-5', group: 'filterExtras', condition: function( book ) { return book.narrators && (book.narrators.length > 2 && book.narrators.length <= 5); } },
          { active: false, type: 'filterExtras', label: 'Multiple narrators 6-10', key: 'multiple-narrators-6-10', group: 'filterExtras', condition: function( book ) { return book.narrators && (book.narrators.length > 5 && book.narrators.length <= 10); } },
          { active: false, type: 'filterExtras', label: 'Multiple narrators > 10', key: 'multiple-narrators-greater-10', group: 'filterExtras', condition: function( book ) { return book.narrators && (book.narrators.length > 10); } },
          
          { type: 'divider', key: 'divider3' },
          
          { active: false, type: 'filterExtras', label: 'Books in series 1', key: '1inSeries', group: 'filterExtras', condition: function( book ) { 
            let result = false;
            _.each( book.series, function( cSeries ) {
              const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
              if ( series && series.books && series.books.length === 1 ) result = true; return false;
            });
            return result; 
          } },
          { active: false, type: 'filterExtras', label: 'Books in series > 1', key: 'plus1series', group: 'filterExtras', condition: function( book ) { 
            let result = false;
            _.each( book.series, function( cSeries ) {
              const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
              if ( series && series.books && series.books.length > 1 ) result = true; return false;
            });
            return result; 
          } },
          { active: false, type: 'filterExtras', label: 'Books in series > 5', key: 'plus5series', group: 'filterExtras', condition: function( book ) { 
            let result = false;
            _.each( book.series, function( cSeries ) {
              const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
              if ( series && series.books && series.books.length > 5 ) result = true; return false;
            });
            return result; 
          } },
          { active: false, type: 'filterExtras', label: 'Books in series > 10', key: 'plus10series', group: 'filterExtras', condition: function( book ) { 
            let result = false;
            _.each( book.series, function( cSeries ) {
              const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
              if ( series && series.books && series.books.length > 10 ) result = true; return false;
            });
            return result; 
          } },
          { active: false, type: 'filterExtras', label: 'Books in series > 20', key: 'plus20series', group: 'filterExtras', condition: function( book ) { 
            let result = false;
            _.each( book.series, function( cSeries ) {
              const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
              if ( series && series.books && series.books.length > 20 ) result = true; return false;
            });
            return result; 
          } },
          { active: false, type: 'filterExtras', label: 'Books in series > 30', key: 'plus30series', group: 'filterExtras', condition: function( book ) { 
            let result = false;
            _.each( book.series, function( cSeries ) {
              const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
              if ( series && series.books && series.books.length > 30 ) result = true; return false;
            });
            return result; 
          } },
          
          { type: 'divider', key: 'divider4' },
          { active: false, type: 'filterExtras', label: 'Average rating 1', key: 'rating-1', group: 'filterExtras', condition: function( book ) { return book.rating >= 1 && book.rating < 2; }},
          { active: false, type: 'filterExtras', label: 'Average rating 2', key: 'rating-2', group: 'filterExtras', condition: function( book ) { return book.rating >= 2 && book.rating < 3; }},
          { active: false, type: 'filterExtras', label: 'Average rating 3', key: 'rating-3', group: 'filterExtras', condition: function( book ) { return book.rating >= 3 && book.rating < 4; }},
          { active: false, type: 'filterExtras', label: 'Average rating 4', key: 'rating-4', group: 'filterExtras', condition: function( book ) { return book.rating >= 4 && book.rating < 5; }},
          { active: false, type: 'filterExtras', label: 'Average rating 5', key: 'rating-5', group: 'filterExtras', condition: function( book ) { return book.rating === 5; }},
          
          { type: 'divider', key: 'divider5' },
          { active: false, type: 'filterExtras', label: 'My rating 1', key: 'my-rating-1', group: 'filterExtras', condition: function( book ) { return book.myRating >= 1 && book.myRating < 2; }, tippy: 'Not for me'},
          { active: false, type: 'filterExtras', label: 'My rating 2', key: 'my-rating-2', group: 'filterExtras', condition: function( book ) { return book.myRating >= 2 && book.myRating < 3; }, tippy: 'It’s okay'},
          { active: false, type: 'filterExtras', label: 'My rating 3', key: 'my-rating-3', group: 'filterExtras', condition: function( book ) { return book.myRating >= 3 && book.myRating < 4; }, tippy: 'Pretty good'},
          { active: false, type: 'filterExtras', label: 'My rating 4', key: 'my-rating-4', group: 'filterExtras', condition: function( book ) { return book.myRating >= 4 && book.myRating < 5; }, tippy: 'It’s great'},
          { active: false, type: 'filterExtras', label: 'My rating 5', key: 'my-rating-5', group: 'filterExtras', condition: function( book ) { return book.myRating === 5; }, tippy: 'I love it'},
        ],
        sort: [
          { active: false, sticky: true, key: 'sortValues',      label: 'Show sort values', type: 'sortExtras', tippy: "Shows the active sorter's value on top of the cover in the grid view." },
          { active: false,               key: 'randomize',       label: 'Randomize',        type: 'sortExtras', tippy: "Sorting is ignored and the order is randomized." },
          
          { type: 'divider', key: 'divider1' },
          // active: true = arrow down / descending
          { active: true , current: true , key: 'added'           , label: 'Added'             , type: 'sort'  , tippy: '<div style="text-align: left;"><small>&#9650;</small> Old at the top <br><small style="display: inline-block; transform: rotate(180deg);">&#9650;</small> New at the top</div>' },
          { active: true , current: false, key: 'title'           , label: 'Title'             , type: 'sort' }, 
          { active: true , current: false, key: 'authors.name'    , label: 'Author'            , type: 'sort' }, 
          { active: true , current: false, key: 'narrators.name'  , label: 'Narrator'          , type: 'sort' }, 
          { active: false , current: false, key: 'releaseDate'     , label: 'Release date'      , type: 'sort' }, 
          { active: false , current: false, key: 'length'          , label: 'Length'            , type: 'sort' }, 
          
          { type: 'divider', key: 'divider2' },
          { active: false , current: false, key: 'rating'          , label: 'Rating'            , type: 'sort' }, 
          { active: false , current: false, key: 'ratings'         , label: 'Number of ratings' , type: 'sort' }, 
          { active: false, current: false, key: 'progress'        , label: 'Progress'          , type: 'sort' }, 
          { active: true , current: false, key: 'publishers.name' , label: 'Publishers'        , type: 'sort' }, 
          
          { type: 'divider', key: 'divider3' },
          { active: false , current: false, key: 'favorite'        , label: 'Favorite'          , type: 'sort' }, 
          { active: true , current: false, key: 'series'          , label: 'Series'            , type: 'sort', tippy: 'Sorts books by the series name alphabetically.' }, 
          { active: false , current: false, key: 'myRating'        , label: 'My rating'         , type: 'sort' }, 
          { active: true , current: false, key: 'categories'      , label: 'Categories'        , type: 'sort' }, 
          { active: false , current: false, key: 'isNew'           , label: 'New books'       , type: 'sort' },
          
          { type: 'divider', key: 'divider4' },
          { active: true , current: false, key: 'language'        , label: 'Language'          , type: 'sort' }, 
          { active: true,  current: false, key: 'format',        label: 'Format', type: 'sort' },
          { active: false , current: false, key: 'fromPlusCatalog' , label: 'From plus catalog' , type: 'sort' }, 
          { active: false , current: false, key: 'unavailable' , label: 'Unavailable' , type: 'sort', tippy: 'From the plus catalog and currently unavailable...' }, 
          { active: false , current: false, key: 'downloaded'      , label: 'Downloaded'        , type: 'sort' }, 
          
          { type: 'divider', key: 'divider5' },
          { active: false , current: false, key: 'storePageMissing', label: 'Store page missing', type: 'sort', tippy: 'The original store page could not be found. There may be a new store page that replaced it.' }, 
          { active: false , current: false, key: 'storePageChanged', label: 'Store page changed', type: 'sort', tippy: 'There is a store page that exists, but it is for a different version of the book.' }, 
          { active: false , current: false, key: 'isbn10'          , label: 'Isbn 10'           , type: 'sort' }, 
          { active: false , current: false, key: 'isbn13'          , label: 'Isbn 13'           , type: 'sort' }, 
          { active: true,  current: false, key: 'bookNumbers', label: 'Book Numbers', type: 'sort', tippy: '<strong>This is only a simple number sort.</strong> <br> If you want the correct series order, as listed in Audible, check the series page in the top menu or the "my books in the series" button in book details. <br><br>Click any book cover (or row) to reveal book details. <br><br> The infinite symbol (∞) means the book is in a series but does not have a number.' },
        ],
      };
      
      this.$setListRenderingOpts( list );
      
    }
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
  
}

.gallery-title-wrapper {
  margin-bottom: 20px;
  text-align: center;
  > * { 
    display: inline-block; 
    position: relative;
  }
  .divider {
    display: block !important;
  }
}

.gallery-title {
  font-size: 23px;
  line-height: 24px;
  font-weight: bold;
  margin: 0px;
  @include themify($themes) {
    color: themed(frontColor);
  }
}

.gallery-sub-title {
  font-size: 14px;
  line-height: 16px;
  font-weight: normal;
  margin: 0px;
  margin-top: 10px;
  padding: 5px 10px;
  border-radius: 9999px;
}

.theme-light .gallery-sub-title {
  color: $lightBackColor;
  border: 1px solid $lightFrontColor;
  background: $lightFrontColor;
}

.theme-dark .gallery-sub-title {
  color: $darkFrontColor;
  border: 1px solid $audibleOrange;
  background: $darkBackColor;
}

</style>
