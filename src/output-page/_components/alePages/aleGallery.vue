<template>
  <div id="ale-gallery">
    
    <!-- <ale-breadcrumbs :library="library" :general="general"></ale-breadcrumbs> -->
    <ale-search 
    :collection.sync="booksArray" 
    :result.sync="searchResult"
    ></ale-search>
    
    <!-- <searchbar :booksArray="booksArray" :library="library" :general="general" /> -->
    
    <ale-grid-view 
    v-if="booksArray && booksArray.length > 0"
    :booksArray="booksArray" 
    ></ale-grid-view>
    
    <!-- <ale-list-view 
    v-if="booksArray && booksArray.length > 0"
    :booksArray="booksArray" 
    ></ale-list-view> -->
    
    <audio-player></audio-player>
    
  </div>
</template>

<script>

import aleSearch from './aleGallery/aleSearch';
import aleGridView from './aleGallery/aleGridView';
import aleListView from './aleGallery/aleListView';

// import aleBreadcrumbs from '../aleBreadcrumbs'
import audioPlayer from '@output-snippets/audio-player';

import buildCategories from '../../_mixins/buildCategories';

import filterAndSort from '@output-mixins/filter-and-sort.js';

// import vueShortkey from 'vue-shortkey';

export default {
  name: 'aleGallery',
  components: {
    aleSearch,
    aleGridView,
    aleListView,
    // aleBreadcrumbs,
    audioPlayer,
  },
  mixins: [
    buildCategories,
    filterAndSort,
  ],
  // directives: { vueShortkey },
  data: function() {
    return {      
      searchResult: null,
      booksArray: null,
      
    }
  },
  
  computed: {
    
    // booksArray: function() {
    //   return this.sortedObj();
    // },
    
    // booksArray: function() {
      
    //   const searchQueryNotEmpty = this.$store.state.searchQuery.trim() !== '';
    //   const searchResultEmpty   = !this.search.result;
    //   if ( searchQueryNotEmpty && searchResultEmpty ) {
    //     return [];
    //   }
    //   else {
    //     const filteredBooks = this.filterBooks();
    //     return this.sortedBooks( filteredBooks );
    //   }
      
    // },
    
  },
  
  watch: {
    booksArray: function( a ) {
      
      console.log('%c' + 'a' + '', 'background-image: linear-gradient(90deg,#ff006b, #ff53ab); color: #fff; padding: 2px 5px; border-radius: 8px;', a );
      
    }
  },
  
  methods: {
    
    
    // sort: function( sortIndex ) {
      
    //   // FIXME: This is where I left off. Fixing how sort executes.....
      
    //   const oldSortIndex = this.gallery.searchOptions.lists.sortIndex;
    //   this.gallery.searchOptions.lists.sortIndex = sortIndex;
      
    //   this.booksArray = this.sortedBooks();
      
    //   const sortValuesActive = _.find(this.gallery.searchOptions.lists.sortExtras, function( o ) { return o.key === 'sortValues' && o.active });
    //   if ( sortValuesActive && oldSortIndex !== sortIndex ) {
    //     this.forceRerenderBooks();
    //   }
      
    // },
    
    updateBooksArray: function() {
      
      // this.$store.state.library.books
      
      // let filtered = this.filterBooks( this.booksArray || this.$store.state.library.books );
      // console.log( 'adsfadsfafasdfasfas ', this.filtered );
      // this.booksArray = this.sortBooks( filtered );
      
    },
    
    updateListRenderingOptions: function() {
      
      const listRenderingOpts = {
        scope: [
          { active: true,  key: 'title' },
          { active: true,  key: 'authors.name' },
          { active: true,  key: 'narrators.name' },
          { active: true,  key: 'series.name' },
          { active: false, key: 'categories.name' },
          { active: false, key: 'publishers.name' },
        ],
        filter: [
          { active: true, label: 'Not started', key: 'notStarted', condition: function( book ) { return !book.progress; } },
          { active: true, label: 'Started', key: 'started', condition: function( book ) { return book.progress && !book.progress.toLowerCase().match('finished') ? true : false; }  },
          { active: true, label: 'Finished', key: 'finished', condition: function( book ) { return book.progress && book.progress.toLowerCase().match('finished') ? true : false; }  },
        ],
        sortExtras: [
          { active: false, key: 'sortValues', label: 'Show sort values', type: 'sortExtras', tippy: 'Value comes from the active sort category below. <br/> Book title is used as a fallback when you perform a search.' },
          { active: false, key: 'randomize',  label: 'Randomize',        type: 'sortExtras', tippy: 'Ignores sorting and randomizes the result instead. Applies to search results as well.' },
        ],
        sort: [
          // active: true = arrow down / descending
          { active: true,  current: true,   key: 'added',           label: 'Added',   			    type: 'sort', tippy: 'High number = new <br/> Low number = old' },
          { active: false, current: false,  key: 'title',           label: 'Title',        		  type: 'sort' },
          { active: false, current: false,  key: 'releaseDate',     label: 'Release date', 		  type: 'sort' },
          { active: false, current: false,  key: 'length',          label: 'Length',       		  type: 'sort' },
          { active: false, current: false,  key: 'authors.name',    label: 'Author',       		  type: 'sort' },
          { active: false, current: false,  key: 'narrators.name',  label: 'Narrator',     		  type: 'sort' },
          { active: false, current: false,  key: 'bookNumbers',     label: 'Book number',  		  type: 'sort', tippy: "If you are sorting numbers without a specific series selected the sorting may be inaccurate." },
          { active: false, current: false,  key: 'rating',  			  label: 'Rating',  				  type: 'sort' },
          { active: false, current: false,  key: 'ratings',  			  label: 'Number of ratings', type: 'sort' },
          { active: false, current: false,  key: 'progress',  			label: 'Progress',          type: 'sort' },
          { active: false, current: false,  key: 'publishers.name', label: 'Publishers',        type: 'sort' },
        ],
      };
      
      this.$store.commit('stickyProp', { key: 'listRenderingOpts', value: listRenderingOpts });
      
    }
    
  },
  
  created: function() {
    
    this.updateListRenderingOptions();
    
    // console.log('%c' + 'ROUTE' + '', 'background: #01ffff; color: #000; padding: 2px 5px; border-radius: 8px;', this.$route);
    
    // Eventbus.$on('sort', this.sort );
    
    const vue = this;
    if ( this.$route.name === 'category' )  {
      this.general.categories = this.buildCategories();
    }
    else if ( this.$route.name === 'series' ) {
      
      const sortValues = _.find(this.gallery.searchOptions.lists.sortExtras, ['key', 'sortValues']);
      sortValues.active = true;
      const sort = _.find(this.gallery.searchOptions.lists.sort, ['key', 'bookNumber']);
      const sortItemIndex = _.findIndex(this.gallery.searchOptions.lists.sort, ['key', 'bookNumbers']);
      this.gallery.searchOptions.lists.sort[ sortItemIndex ].active = false;
      this.gallery.searchOptions.lists.sortIndex = sortItemIndex;
      
      this.gallery.customResults = _.filter( this.$store.state.library.books, function( book ) {
        if ( book.series && vue.$route.params.series ) {
          return _.find( book.series, function( series ) {
            // console.log( series.asin === 'B077XNSN35' )
            return series.asin === vue.$route.params.series;
          });
        }
      });
      
      
      
    }
  },
  
  beforeDestroy: function() {
    Eventbus.$off('sort', this.sort);
  },
  
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';
#ale-gallery {
  max-width: $containerSize;
  margin: 0 auto 550px auto;
  text-align: center;
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
