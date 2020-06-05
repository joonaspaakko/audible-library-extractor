<template>
  <div id="ale-gallery">
    <ale-search      :booksArray="booksArray" :library="library" :gallery="gallery" :views="views"></ale-search>
    <ale-bookdetails :booksArray="booksArray" :library="library" :gallery="gallery"></ale-bookdetails> <!-- itunes style floater that plants itself between the cover items -->
    <ale-books       :booksArray="booksArray" :library="library" :gallery="gallery"></ale-books>
  </div>
</template>

<script>
import aleSearch from './aleGallery/aleSearch'
import aleBooks from './aleGallery/aleBooks'
import aleBookdetails from './aleGallery/aleBookdetails'

import sortBookNumbers from '../_mixins/sort/bookNumbers'
import sortDateAdded from '../_mixins/sort/dateAdded'
import sortReleaseDate from '../_mixins/sort/releaseDate'
import sortStringNameProp from '../_mixins/sort/stringNameProp'
import sortTitle from '../_mixins/sort/title'
import sortLength from '../_mixins/sort/length'
import sortRatings from '../_mixins/sort/ratings'
import sortProgress from '../_mixins/sort/progress'

export default {
  name: 'aleGallery',
  components: {
    aleSearch,
    aleBooks,
    aleBookdetails,
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
  ],
  props: ['library', 'views'],
  data: function() {
    return {
      gallery: {
        filterResults: null,
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
        searchValue: '',
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
	            { active: true, key: 'unfinished', condition: function( book ) { return !book.progress; } },
	            { active: true, key: 'listening', condition: function( book ) { return book.progress && !book.progress.toLowerCase().match('finished') ? true : false; }  },
	            { active: true, key: 'finished', condition: function( book ) { return book.progress && book.progress.toLowerCase().match('finished') ? true : false; }  },
	          ],
            sortIndex: 0,
            showSortValues: false,
	          sort: [
              // active: true = arrow down / descending
              { active: true,  key: 'dateAdded',      label: 'Date added',   			type: 'sort' },
	            { active: false, key: 'releaseDate',    label: 'Release date', 			type: 'sort' },
	            { active: false, key: 'title',          label: 'Title',        			type: 'sort' },
	            { active: false, key: 'length',         label: 'Length',       			type: 'sort' },
	            { active: false, key: 'authors.name',   label: 'Author',       			type: 'sort' },
	            { active: false, key: 'narrators.name', label: 'Narrator',     			type: 'sort' },
	            { active: false, key: 'bookNumbers',    label: 'Book number',  			type: 'sort' },
	            { active: false, key: 'rating',  			  label: 'Rating',  				 	type: 'sort' },
	            { active: false, key: 'ratings',  			label: 'Number of ratings', type: 'sort' },
	            { active: false, key: 'progress',  			label: 'Progress',          type: 'sort' },
	            { active: false, key: 'publisher',  		label: 'Publisher',         type: 'sort' },
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
      return this.sortedObj;
    },
    
    sortedObj: function() {
      const activeSortIndex = this.gallery.searchOptions.lists.sortIndex;
      var sortedBooks = this.filteredObj;
      if ( activeSortIndex != -1 ) {
        const activeSortItem = this.gallery.searchOptions.lists.sort[ activeSortIndex ];
        const activeSortKey = activeSortItem.key;
        const sortDirection = activeSortItem.active ? 'desc' : 'asc';
        const sortOptions = {
          books: sortedBooks,
          direction: sortDirection,
          sortKey: activeSortKey
        };
        switch ( activeSortKey ) {
          case 'bookNumbers':
            sortedBooks = this.sortBookNumbers( sortOptions );
            break;
          case 'dateAdded':
          	sortedBooks = this.sortDateAdded( sortOptions );
            break;
          case 'releaseDate':
            sortedBooks = this.sortReleaseDate( sortOptions );
            break;
          case 'authors.name':
          case 'narrators.name':
            sortedBooks = this.sortStringNameProp( sortOptions );
            break;
          case 'title':
          case 'publisher':
            sortedBooks = this.sortTitle( sortOptions );
            break;
          case 'length':
            sortedBooks = this.sortLength( sortOptions );
            break;
          case 'rating':
          case 'ratings':
            sortedBooks = this.sortRatings( sortOptions );
            break;
					case 'progress':
						sortedBooks = this.sortProgress( sortOptions );
						break;
        }
      }
      
      return sortedBooks;
    },
    
		filteredObj: function() {
      const vue = this;
			var books = this.gallery.filterResults || this.gallery.fuseResults || this.library.books;
			const keys = this.filterKeys;
			return _.filter(books, function(o) {
        var result = false;
        $.each( keys, function(i, key) {
          const keyCondition = _.find(vue.gallery.searchOptions.lists.filter, ['key', key]).condition( o );
          if ( keyCondition ) {
            result = true;
            return true;
          }
        });
        return result;
			});
		},
		
		filterKeys: function() {
      const filteredKeys = _.filter(this.gallery.searchOptions.lists.filter, ['active', true]);
      return _.map( filteredKeys, function( item ) {
        if ( item.active ) return item.key;
      });
		},
    
  }
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';
#ale-gallery {
  max-width: $containerSize;
  margin: 0 auto;
  text-align: center;
  padding: 0 20px;
  
}

</style>
