<template>
  <div id="ale-gallery">
    
    <!-- <ale-breadcrumbs :library="library" :general="general"></ale-breadcrumbs> -->
    <ale-search :collectionSource="collectionSource"></ale-search>
    
    <ale-grid-view v-if="$store.state.sticky.viewMode === 'grid'" />
    <ale-list-view v-else-if="$store.state.sticky.viewMode === 'spreadsheet'" />
    
    <audio-player />
    
    <!-- TODO: a general reminder to fix parts of the light theme. Many things look kinda off...
    -->
    
    <!-- TODO: a general reminder to fix mobile styles... Mostly just finishing touches
    -->
    
  </div>
</template>

<script>
import aleSearch from "./aleGallery/aleSearch";

import prepCategoriesSubPage from "@output-mixins/prepCategoriesSubPage.js";
import prepCollectionsSubPage from "@output-mixins/prepCollectionsSubPage.js";
import prepSeriesSubPage from "@output-mixins/prepSeriesSubPage.js";
import prepWishlist from "@output-mixins/prepWishlist.js";

// import aleBreadcrumbs from '../aleBreadcrumbs'
import audioPlayer from "@output-snippets/audio-player";
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
    audioPlayer
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
    };
  },
  
  methods: {
    updateListRenderingOptions: function() {
      const list = {
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
          { active: true, type: 'filter', label: 'Started', key: 'started', condition: function( book ) { return book.progress && !book.progress.toLowerCase().match('finished') ? true : false; }  },
          { active: true, type: 'filter', label: 'Finished', key: 'finished', condition: function( book ) { return book.progress && book.progress.toLowerCase().match('finished') ? true : false; }  },
          // FIXME: I have to think a little bit more about how to add more filters if at all...
          // { key: 'divider' },
          // { active: true, type: 'filterExtras', label: 'Favorites', key: 'favorites', condition: function( book ) { return book.favorite; } },
        ],
        sort: [
          { active: false, sticky: true, key: 'sortValues',      label: 'Show sort values', type: 'sortExtras', tippy: "The shown value comes from the active sort category below. Sort by title and you'll see the title of eachbook above the cover." },
          { active: false,                 key: 'randomize',       label: 'Randomize',        type: 'sortExtras', tippy: "Sorting is ignored and the order is randomized." },
          { key: 'divider' },
          // active: true = arrow down / descending
          { active: true,  current: true,  key: 'added',           label: 'Added',   			     type: 'sort', tippy: 'High number = new <br/> Low number = old' },
          { active: true,  current: false, key: 'title',           label: 'Title',        		 type: 'sort' },
          { active: true,  current: false, key: 'releaseDate',     label: 'Release date', 		 type: 'sort' },
          { active: true,  current: false, key: 'length',          label: 'Length',       		 type: 'sort' },
          { active: true,  current: false, key: 'authors.name',    label: 'Author',       		 type: 'sort' },
          { active: true,  current: false, key: 'narrators.name',  label: 'Narrator',     		 type: 'sort' },
          { active: true,  current: false, key: 'rating',  			   label: 'Rating',  				   type: 'sort' },
          { active: true,  current: false, key: 'ratings',  			 label: 'Number of ratings', type: 'sort' },
          { active: false, current: false, key: 'progress',  			 label: 'Progress',          type: 'sort' },
          { active: true,  current: false, key: 'publishers.name', label: 'Publishers',        type: 'sort' },
          { active: true,  current: false, key: 'favorite',        label: 'Favorite',          type: 'sort' },
        ],
      };
      
      this.$setListRenderingOpts( list );
      
    }
  },

  created: function() {
    
    this.$store.commit("prop", [ { key: 'pageTitle', value: null }, { key: 'pageSubTitle', value: null } ]);
    
    this.updateListRenderingOptions();
    
    // Setup for other pages that use the gallery page to show titles
    this.prepCategoriesSubPage();    
    this.prepCollectionsSubPage();    
    this.prepSeriesSubPage();
    this.prepWishlist();
    
  },
  
  beforeDestroy: function() {
    this.$store.commit("prop", [ { key: 'pageTitle', value: null }, { key: 'pageSubTitle', value: null } ]);
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
</style>
