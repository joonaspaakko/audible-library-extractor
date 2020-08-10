<template>
  <div id="ale-gallery">
    <!-- <ale-breadcrumbs :library="library" :general="general"></ale-breadcrumbs> -->
    <ale-search      :booksArray="booksArray" :library="library" :gallery="gallery"></ale-search>
    <ale-bookdetails :booksArray="booksArray" :library="library" :gallery="gallery" :general="general"></ale-bookdetails> <!-- itunes style floater that plants itself between the cover items -->
    <ale-books       :booksArray="booksArray" :library="library" :gallery="gallery"></ale-books>
  </div>
</template>

<script>
import aleBookdetails from './aleGallery/aleBookdetails'
import aleSearch from './aleGallery/aleSearch'
import aleBooks from './aleGallery/aleBooks'
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

export default {
  name: 'aleGallery',
  components: {
    aleSearch,
    aleBooks,
    aleBookdetails,
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
  props: ['library', 'general'],
  data: function() {
    return {
      gallery: {
        customResults: null,
  			fuseResults: null,
				searchEnabled: true,
        searchIcons: {
          scope: true,
          filter: true,
          sort: true,
        },
        searchLocked: {
          active: null,
          tempValue: null,
          reason: null,
          inputValue: null,
        },
        searchActive: false, // Search is active when the query returns an array of results
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
							{ active: false, key: 'publisher' },
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
              { active: true,  key: 'added',          label: 'Added',   			    type: 'sort', tippy: 'High number = new <br/> Low number = old' },
	            { active: false, key: 'title',          label: 'Title',        			type: 'sort' },
	            { active: false, key: 'releaseDate',    label: 'Release date', 			type: 'sort' },
	            { active: false, key: 'length',         label: 'Length',       			type: 'sort' },
	            { active: false, key: 'authors.name',   label: 'Author',       			type: 'sort' },
	            { active: false, key: 'narrators.name', label: 'Narrator',     			type: 'sort' },
	            { active: false, key: 'bookNumbers',    label: 'Book number',  			type: 'sort' },
	            { active: false, key: 'rating',  			  label: 'Rating',  				 	type: 'sort' },
	            { active: false, key: 'ratings',  			label: 'Number of ratings', type: 'sort' },
	            { active: false, key: 'progress',  			label: 'Progress',          type: 'sort' },
	            { active: false, key: 'publisher.name', label: 'Publisher',         type: 'sort' },
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
    
    booksArray: function() {
      return this.sortedObj();
    },
    
  },
  
  methods: {
    
    sortedObj: function() {
      
      let booksFiltered = this.filteredObj();
      const randomize = _.find(this.gallery.searchOptions.lists.sortExtras, function( o ) { return o.key === 'randomize' && o.active });
      if ( randomize ) {
        return _.shuffle( booksFiltered );
      }
      else {
          
        const activeSortIndex = this.gallery.searchOptions.lists.sortIndex;
        if ( activeSortIndex !== -1 ) {
          const activeSortItem = this.gallery.searchOptions.lists.sort[ activeSortIndex ];
          const activeSortKey = activeSortItem.key;
          const sortDirection = activeSortItem.active ? 'desc' : 'asc';
          const sortOptions = {
            books: booksFiltered,
            direction: sortDirection,
            sortKey: activeSortKey
          };
          switch ( activeSortKey.split('.')[0] ) {
            case 'bookNumbers':
              sortOptions.seriesName = this.gallery.searchOptions.lists.numberSortSeriesName;
              booksFiltered = this.sortBookNumbers( sortOptions );
              break;
            case 'added':
              booksFiltered = this.sortDateAdded( sortOptions );
              break;
            case 'releaseDate':
              booksFiltered = this.sortReleaseDate( sortOptions );
              break;
            case 'authors':
            case 'narrators':
            case 'publisher':
              booksFiltered = this.sortStringNameProp( sortOptions );
              break;
            case 'title':
              booksFiltered = this.sortTitle( sortOptions );
              break;
            case 'length':
              booksFiltered = this.sortLength( sortOptions );
              break;
            case 'rating':
            case 'ratings':
              booksFiltered = this.sortRatings( sortOptions );
              break;
            case 'progress':
              booksFiltered = this.sortProgress( sortOptions );
              break;
          }
        }
        return booksFiltered;
        
      }
      
    },
    
		filteredObj: function() {
      const vue = this;
			var books = this.gallery.customResults || this.gallery.fuseResults || this.library.books;
      // console.log( 'books' )
      // console.log( books )
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
