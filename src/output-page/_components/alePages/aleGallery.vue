<template>
  <div id="ale-gallery">
    
    <!-- <ale-breadcrumbs :library="library" :general="general"></ale-breadcrumbs> -->
    <ale-search    
    :library="library" 
    :general="general" 
    
    :collection.sync="booksArray" 
    :page="$route.name"
    :options="search.options"
    :result.sync="search.result"
    @clear-search="booksArray = library.books"
    ></ale-search>
    
    <!-- <searchbar :booksArray="booksArray" :library="library" :general="general" /> -->
    
    <ale-grid-view 
    v-if="booksArray.length > 0"
    :booksArray="booksArray" 
    :library="library" 
    :gallery="gallery" 
    :general="general"
    ></ale-grid-view>
    
    <!-- <ale-list-view 
    v-if="booksArray.length > 0"
    :booksArray="booksArray" 
    :library="library" 
    :gallery="gallery" 
    :general="general"
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

import sortTitle from '../../_mixins/sort/title';
import sortLength from '../../_mixins/sort/length';
import sortRatings from '../../_mixins/sort/ratings';
import sortProgress from '../../_mixins/sort/progress';
import sortDateAdded from '../../_mixins/sort/dateAdded';
import sortBookNumbers from '../../_mixins/sort/bookNumbers';
import sortReleaseDate from '../../_mixins/sort/releaseDate';
import sortStringNameProp from '../../_mixins/sort/stringNameProp';
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
    sortBookNumbers,
    sortDateAdded,
    sortReleaseDate,
    sortStringNameProp,
    sortTitle,
    sortLength,
    sortRatings,
    sortProgress,
    buildCategories,
    filterAndSort,
  ],
  // directives: { vueShortkey },
  props: [ 'isStandalone', 'library', 'general'],
  data: function() {
    return {
      booksArray: [],
      gallery: {
        customResults: null,
  			fuseResults: null,
				searchEnabled: true,
        searchLocked: {
          active: null,
          tempValue: null,
          reason: null,
          inputValue: null,
        },// Search is active when the query returns an array of results
        searchValue: '',
        searchValueChanged: false,
	      searchOptions: {
	        open: false,
          listsTemp: null,
	        lists: {
	          current: null,
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
            tempSortIndex: null,
            sortIndex: 0,
            numberSortSeriesName: null,
            sortExtras: [
              { active: false, key: 'sortValues', label: 'Show sort values', type: 'sortExtras', tippy: 'Value comes from the active sort category below. <br/> Book title is used as a fallback when you perform a search.' },
              { active: false, key: 'randomize',  label: 'Randomize',        type: 'sortExtras', tippy: 'Ignores sorting and randomizes the result instead. Applies to search results as well.' },
            ],
	          sort: [
              // active: true = arrow down / descending
              { active: true,  key: 'added',           label: 'Added',   			     type: 'sort', tippy: 'High number = new <br/> Low number = old' },
	            { active: false, key: 'title',           label: 'Title',        		 type: 'sort' },
	            { active: false, key: 'releaseDate',     label: 'Release date', 		 type: 'sort' },
	            { active: false, key: 'length',          label: 'Length',       		 type: 'sort' },
	            { active: false, key: 'authors.name',    label: 'Author',       		 type: 'sort' },
	            { active: false, key: 'narrators.name',  label: 'Narrator',     		 type: 'sort' },
	            { active: false, key: 'bookNumbers',     label: 'Book number',  		 type: 'sort', tippy: "If you are sorting numbers without a specific series selected the sorting may be inaccurate." },
	            { active: false, key: 'rating',  			   label: 'Rating',  				 	 type: 'sort' },
	            { active: false, key: 'ratings',  			 label: 'Number of ratings', type: 'sort' },
	            { active: false, key: 'progress',  			 label: 'Progress',          type: 'sort' },
	            { active: false, key: 'publishers.name', label: 'Publishers',        type: 'sort' },
            ]
	        }
	      },
        details: {
					readmore: {
						toggle: false,
					},
          open: false,
          index: -1,
					changed: false,
          sliders: {},
        },
      },
      
      search: {
        result: null,
      },
      
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
      
      this.booksArray = this.filterAndSort( this.library.books );
      
    },
    
    
  },
  
  created: function() {
    
    this.updateBooksArray();
    
    console.log('%c' + 'ROUTE' + '', 'background: #01ffff; color: #000; padding: 2px 5px; border-radius: 8px;', this.$route);
    
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
      
      this.gallery.customResults = _.filter( this.library.books, function( book ) {
        if ( book.series && vue.$route.params.series ) {
          return _.find( book.series, function( series ) {
            console.log( series.asin === 'B077XNSN35' )
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
