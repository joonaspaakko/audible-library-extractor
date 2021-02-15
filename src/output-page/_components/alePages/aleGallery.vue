<template>
  <div id="ale-gallery">
    
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
    
    <ale-grid-view v-if="$store.state.sticky.viewMode === 'grid'" />
    <ale-list-view v-else-if="$store.state.sticky.viewMode === 'spreadsheet'" />
    
  </div>
</template>

<script>
import aleSearch from "./aleGallery/aleSearch";

import prepCategoriesSubPage from "@output-mixins/prepCategoriesSubPage.js";
import prepCollectionsSubPage from "@output-mixins/prepCollectionsSubPage.js";
import prepSeriesSubPage from "@output-mixins/prepSeriesSubPage.js";
import prepWishlist from "@output-mixins/prepWishlist.js";

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
  ],
  
  data: function() {
    return {
      collectionSource: 'library.books',
      pageTitle: null,
      pageSubTitle: null,
    };
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
          // FIXME: I have to think a little bit more about how to add more filters if at all...
          { key: 'divider' },
          { active: true,  type: 'filterExtras', label: 'All',          key: 'all',          group: 'filterExtras', condition: function( book ) { return book.asin;            } },
          { active: false, type: 'filterExtras', label: 'Favorites',    key: 'favorites',    group: 'filterExtras', condition: function( book ) { return book.favorite;        } },
          { active: false, type: 'filterExtras', label: 'From plus catalog', key: 'from-plus-catalog', group: 'filterExtras', condition: function( book ) { return book.fromPlusCatalog; } },
          { active: false, type: 'filterExtras', label: 'Left plus catalog', key: 'left-plus-catalog', group: 'filterExtras', condition: function( book ) { return book.fromPlusCatalog && book.leftPlusCatalog; } },
          { active: false, type: 'filterExtras', label: 'Multiple narrators', key: 'multiple-narrators', group: 'filterExtras', condition: function( book ) { return book.narrators && book.narrators.length > 1; } },
          { active: false, type: 'filterExtras', label: 'Not in series', key: 'not-inseries', group: 'filterExtras', condition: function( book ) { return !book.series; } },
          { active: false, type: 'filterExtras', label: 'In series', key: 'inseries', group: 'filterExtras', condition: function( book ) { return book.series; } },
          { active: false, type: 'filterExtras', label: 'Books in series 1', key: '1inSeries', group: 'filterExtras', condition: function( book ) { 
            let result = false;
            _.each( book.series, function( cSeries ) {
              const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
              if ( series.books && series.books.length === 1 ) result = true; return false;
            });
            return result; 
          } },
          { active: false, type: 'filterExtras', label: 'Books in series > 1', key: '>1series', group: 'filterExtras', condition: function( book ) { 
            let result = false;
            _.each( book.series, function( cSeries ) {
              const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
              if ( series.books && series.books.length > 1 ) result = true; return false;
            });
            return result; 
          } },
          { active: false, type: 'filterExtras', label: 'Books in series > 5', key: '>5series', group: 'filterExtras', condition: function( book ) { 
            let result = false;
            _.each( book.series, function( cSeries ) {
              const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
              if ( series.books && series.books.length > 5 ) result = true; return false;
            });
            return result; 
          } },
          { active: false, type: 'filterExtras', label: 'Books in series > 10', key: '>10series', group: 'filterExtras', condition: function( book ) { 
            let result = false;
            _.each( book.series, function( cSeries ) {
              const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
              if ( series.books && series.books.length > 10 ) result = true; return false;
            });
            return result; 
          } },
          { active: false, type: 'filterExtras', label: 'Books in series > 20', key: '>20series', group: 'filterExtras', condition: function( book ) { 
            let result = false;
            _.each( book.series, function( cSeries ) {
              const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
              if ( series.books && series.books.length > 20 ) result = true; return false;
            });
            return result; 
          } },
          { active: false, type: 'filterExtras', label: 'Books in series > 30', key: '>30series', group: 'filterExtras', condition: function( book ) { 
            let result = false;
            _.each( book.series, function( cSeries ) {
              const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
              if ( series.books && series.books.length > 30 ) result = true; return false;
            });
            return result; 
          } },
        ],
        sort: [
          { active: false, sticky: true, key: 'sortValues',      label: 'Show sort values', type: 'sortExtras', tippy: "Shows the active sorter's value on top of the cover in the grid view." },
          { active: false,               key: 'randomize',       label: 'Randomize',        type: 'sortExtras', tippy: "Sorting is ignored and the order is randomized." },
          { key: 'divider' },
          // active: true = arrow down / descending
          { active: true , current: true , key: 'added'           , label: 'Added'             , type: 'sort'  , tippy: '<div style="text-align: left;"><small>&#9650;</small> Old at the top <br><small style="display: inline-block; transform: rotate(180deg);">&#9650;</small> New at the top</div>' },
          { active: true , current: false, key: 'title'           , label: 'Title'             , type: 'sort' }, 
          { active: false , current: false, key: 'releaseDate'     , label: 'Release date'      , type: 'sort' }, 
          { active: false , current: false, key: 'length'          , label: 'Length'            , type: 'sort' }, 
          { active: true , current: false, key: 'authors.name'    , label: 'Author'            , type: 'sort' }, 
          { active: true , current: false, key: 'narrators.name'  , label: 'Narrator'          , type: 'sort' }, 
          { active: false , current: false, key: 'rating'          , label: 'Rating'            , type: 'sort' }, 
          { active: false , current: false, key: 'ratings'         , label: 'Number of ratings' , type: 'sort' }, 
          { active: false, current: false, key: 'progress'        , label: 'Progress'          , type: 'sort' }, 
          { active: true , current: false, key: 'publishers.name' , label: 'Publishers'        , type: 'sort' }, 
          { active: false , current: false, key: 'favorite'        , label: 'Favorite'          , type: 'sort' }, 
          { active: true , current: false, key: 'series'          , label: 'Series'            , type: 'sort' }, 
          { active: false , current: false, key: 'myRating'        , label: 'My rating'         , type: 'sort' }, 
          { active: true , current: false, key: 'categories'      , label: 'Categories'        , type: 'sort' }, 
          { active: false , current: false, key: 'isNew'           , label: 'Newly added'       , type: 'sort'  , tippy: 'This status resets every time you do a full extraction.' },
          { active: true , current: false, key: 'language'        , label: 'Language'          , type: 'sort' }, 
          { active: true,  current: false, key: 'format',        label: 'Format', type: 'sort' },
          { active: false , current: false, key: 'fromPlusCatalog' , label: 'From plus catalog' , type: 'sort' }, 
          { active: false , current: false, key: 'leftPlusCatalog' , label: 'Left plus catalog' , type: 'sort' }, 
          { active: false , current: false, key: 'downloaded'      , label: 'Downloaded'        , type: 'sort' }, 
          { active: false , current: false, key: 'storePageMissing', label: 'Store page missing', type: 'sort', tippy: 'The original store page could not be found. There may be a new store page that replaced it.' }, 
          { active: false , current: false, key: 'storePageChanged', label: 'Store page changed', type: 'sort', tippy: 'There is a store page that exists, but it is for a different version of the book.' }, 
          { active: false , current: false, key: 'isbn10'          , label: 'Isbn 10'           , type: 'sort' }, 
          { active: false , current: false, key: 'isbn13'          , label: 'Isbn 13'           , type: 'sort' }, 
          { active: true,  current: false, key: 'bookNumbers', label: 'Book Numbers', type: 'sort', tippy: ' The infinite symbol (∞) means the book is in a series but does not have a number. <br><br> <strong>This is only a simple number sort.</strong> If you want the correct series order, as listed in Audible, check the series page in the top menu or the "my books in the series" button in book details. <br><br>Click any book cover (or row) to reveal book details.' },
        ],
      };
      
      this.$setListRenderingOpts( list );
      
    }
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
