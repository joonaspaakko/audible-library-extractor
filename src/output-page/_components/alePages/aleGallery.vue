<template>
  <div id="ale-gallery">
    
    <!-- <ale-breadcrumbs :library="library" :general="general"></ale-breadcrumbs> -->
    <ale-search    
    :booksArray="booksArray" 
    :library="library" 
    :gallery="gallery"
    :general="general"
    ></ale-search>
    
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
    
  </div>
</template>

<script>
import aleSearch from './aleGallery/aleSearch'
import aleGridView from './aleGallery/aleGridView'
import aleListView from './aleGallery/aleListView'
import aleBreadcrumbs from '../aleBreadcrumbs'

import sortTitle from '../../_mixins/sort/title'
import sortLength from '../../_mixins/sort/length'
import sortRatings from '../../_mixins/sort/ratings'
import sortProgress from '../../_mixins/sort/progress'
import sortDateAdded from '../../_mixins/sort/dateAdded'
import sortBookNumbers from '../../_mixins/sort/bookNumbers'
import sortReleaseDate from '../../_mixins/sort/releaseDate'
import sortStringNameProp from '../../_mixins/sort/stringNameProp'
import buildCategories from '../../_mixins/buildCategories'

// Vue.use(require('vue-shortkey'));
import vueShortkey from 'vue-shortkey';

export default {
  name: 'aleGallery',
  components: {
    aleSearch,
    aleGridView,
    aleListView,
    aleBreadcrumbs,
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
  ],
  directives: { vueShortkey },
  props: ['library', 'general'],
  data: function() {
    return {
      booksArray: null,
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
							{ active: false, key: 'publishers' },
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
      }
    }
  },
  
  computed: {
    
    // booksArray: function() {
    //   return this.sortedObj();
    // },
    
  },
  
  watch: {
    booksArray: function( a ) {
      
      console.log('%c' + 'a' + '', 'background-image: linear-gradient(90deg,#ff006b, #ff53ab); color: #fff; padding: 2px 5px; border-radius: 8px;', a );
      
    }
  },
  
  methods: {
    
    sort: function( sortIndex ) {
      
      // FIXME: This is where I left off. Fixing how sort executes.....
      
      const oldSortIndex = this.gallery.searchOptions.lists.sortIndex;
      this.gallery.searchOptions.lists.sortIndex = sortIndex;
      
      this.booksArray = this.sortedBooks();
      
      const sortValuesActive = _.find(this.gallery.searchOptions.lists.sortExtras, function( o ) { return o.key === 'sortValues' && o.active });
      if ( sortValuesActive && oldSortIndex !== sortIndex ) {
        this.forceRerenderBooks();
      }
      
    },
    
    initBooksArray: function() {
      const filteredBooks = this.filterBooks();
      this.booksArray = this.sortedBooks( filteredBooks );
    },
    
    sortedBooks: function( filteredBooks ) {

      let books = filteredBooks || this.booksArray;
      
      const randomizeON = _.find(this.gallery.searchOptions.lists.sortExtras, function( o ) { return o.key === 'randomize' && o.active });
      if ( randomizeON ) {
        return _.shuffle( books );
      }
      else {
          
        const activeSortIndex = this.gallery.searchOptions.lists.sortIndex;
        if ( activeSortIndex !== -1 ) {
          const activeSortItem = this.gallery.searchOptions.lists.sort[ activeSortIndex ];
          const activeSortKey = activeSortItem.key;
          const sortDirection = activeSortItem.active ? 'desc' : 'asc';
          const sortOptions = {
            books: books,
            direction: sortDirection,
            sortKey: activeSortKey
          };
          switch ( activeSortKey.split('.')[0] ) {
            case 'bookNumbers':
              sortOptions.seriesName = this.gallery.searchOptions.lists.numberSortSeriesName;
              sortOptions.missingNumber = 0;
              books = this.sortBookNumbers( sortOptions );
              break;
            case 'added':
              books = this.sortDateAdded( sortOptions );
              break;
            case 'releaseDate':
              books = this.sortReleaseDate( sortOptions );
              break;
            case 'authors':
            case 'narrators':
            case 'publishers':
              books = this.sortStringNameProp( sortOptions );
              break;
            case 'title':
              books = this.sortTitle( sortOptions );
              break;
            case 'length':
              books = this.sortLength( sortOptions );
              break;
            case 'rating':
            case 'ratings':
              books = this.sortRatings( sortOptions );
              break;
            case 'progress':
              books = this.sortProgress( sortOptions );
              break;
          }
        }
        return books;
        
      }
      
    },
    
		filterBooks: function( sideLoadBooks ) {
      
			const books = sideLoadBooks || this.library.books;
      const rules = this.filterRules();
      
			return _.filter(books, function( o ) {
        var result = false;
        _.each( rules, function( condition, i ) {
          if ( condition(o) ) {
            result = true;
            return false;
          }
        });
        return result;
      });
      
		},
		
		filterRules: function() {
      
      var filters = _.filter( this.gallery.searchOptions.lists.filter, ['active', true] );
      return _.map( filters, function( filter ) {
        if ( filter.active ) return filter.condition;
      });
      
		},
    
  },
  
  created: function() {
    
    this.initBooksArray();
    
    Eventbus.$on('sort', this.sort );
    
    const vue = this;
    if ( this.$route.name === 'ale-category' )  {
      this.general.categories = this.buildCategories();
    }
    else if ( this.$route.name === 'ale-series' ) {
      
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
