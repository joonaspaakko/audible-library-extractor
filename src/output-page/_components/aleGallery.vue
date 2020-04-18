<template>
  <div id="ale-gallery">
    <ale-background :library="library" :gallery="gallery"></ale-background>
    <ale-search :booksArray="booksArray" :library="library" :gallery="gallery"></ale-search>
    <ale-lightswitch></ale-lightswitch>
    <ale-bookdetails :booksArray="booksArray" :library="library" :gallery="gallery"></ale-bookdetails> <!-- itunes style floater that plants itself between the cover items -->
    <ale-books :booksArray="booksArray" :library="library" :gallery="gallery"></ale-books>
  </div>
</template>

<script>
import aleBackground from './aleGallery/aleBackground'
import aleSearch from './aleGallery/aleSearch'
import aleBooks from './aleGallery/aleBooks'
import aleBookdetails from './aleGallery/aleBookdetails'
import aleLightswitch from './aleGallery/aleLightswitch'

export default {
  name: 'aleGallery',
  components: {
    aleBackground,
    aleSearch,
    aleBooks,
    aleBookdetails,
    aleLightswitch,
  },
  props: ['library'],
  data: function() {
    return {
      gallery: {
  			fuseResults: [],
        searchValue: '',
	      searchOptions: {
	        open: false,
	        lists: {
	          current: null,
	          filter: [
	            { active: true, key: 'unfinished', condition: function( book ) { return !book.progress; } },
	            { active: true, key: 'listening', condition: function( book ) { return book.progress && !book.progress.toLowerCase().match('finished') ? true : false; }  },
	            { active: true, key: 'finished', condition: function( book ) { return book.progress && book.progress.toLowerCase().match('finished') ? true : false; }  },
	          ],
	          scope: [
	            { active: true,  key: 'title' },
	            { active: true,  key: 'authors.name' },
	            { active: true,  key: 'narrators.name' },
	            { active: true,  key: 'series.name' },
	            { active: false, key: 'categories.name' },
	          ],
            sortIndex: 0,
	          sort: [
              // active: true = arrow down / descending
              { active: true,  key: 'dateAdded',      label: 'Date added',   type: 'sort' },
	            { active: false, key: 'releaseDate',    label: 'Release date', type: 'sort' },
	            { active: false, key: 'title',          label: 'Title',        type: 'sort' },
	            { active: false, key: 'length',         label: 'Length',       type: 'sort' },
	            { active: false, key: 'authors.name',   label: 'Author',       type: 'sort' },
	            { active: false, key: 'narrators.name', label: 'Narrator',     type: 'sort' },
	            { active: false, key: 'bookNumbers',    label: 'Book number',  type: 'sort' },
            ]
	        }
	      },
        details: {
          open: false,
          index: -1,
          slider: null,
          sliderMount: false,
        }
      }
    }
  },
  
  computed: {
    
    booksArray: function() {
      return this.sortedObj;
    },
    
    sortedObj: function() {
      const books = this.filteredObj;
      const activeSortIndex = this.gallery.searchOptions.lists.sortIndex;
      const activeSortItem = this.gallery.searchOptions.lists.sort[ activeSortIndex ];
      const activeSortKey = activeSortItem.key;
      const sortDirection = activeSortItem.active ? 'desc' : 'asc';
      var sortedBooks;
      switch ( activeSortKey ) {
        case 'bookNumbers':
          sortedBooks = _.orderBy(books, function(o) {
            if ( o.bookNumbers ) {
              // If one book has multiple numbers, the first one is used for sorting
              var numbers = _.isArray( o.bookNumbers[0] ) ? o.bookNumbers[0][0] : o.bookNumbers[0];
              // If the number is a string, we assume it's a number range
              // and once again use the first number from that range
              var dashSplit = typeof numbers == 'string' ? numbers.split('-') : [numbers];
              if ( dashSplit.length > 1 ) {
                return parseFloat( dashSplit[0] );
              }
              else {
                return numbers;
              }
            }
            else {
              return 0;
            }
            
          }, sortDirection);
          break;
        case 'dateAdded':
          if (  sortDirection === 'asc' ) {
            sortedBooks = _.reverse( _.clone(books) );
          }
          else {
            sortedBooks = books;
          }
          break;
        case 'releaseDate':
          sortedBooks = _.orderBy(books, function(o) {
            return o.releaseDate ? new Date( o.releaseDate.split('-') ) :  new Date( '1800', '01', '01' );
          }, sortDirection);
          // _.orderBy(unOrderedCollection, [{activeSortKey: Number}], ['desc'])
          break;
        case 'authors.name':
        case 'narrators.name':
          const keyMinusName = activeSortKey.replace('.name','');
          sortedBooks = _.orderBy(books, function( o ) {
            return o[ keyMinusName ] ? o[ keyMinusName ][0].name : null;
          }, sortDirection);
          break;
        case 'title':
          sortedBooks = _.orderBy(books, function( o ) {
            if ( o.title ) {
              var titleLowercase = o.title.toLowerCase();
              const getThe = titleLowercase.match(/^the /);
              const getA = titleLowercase.match(/^a /);
              const getAn = titleLowercase.match(/^an /);
              const replacements = getThe && /^the / || getA && /^a / || getAn && /^an /;
              if ( replacements ) titleLowercase = titleLowercase.replace( replacements,'');
              return titleLowercase;
            }
            else { return null; }
          }, sortDirection);
          break;
        case 'length':
          sortedBooks = _.orderBy(books, function( o ) {
            if ( o.length ) {
              
      				var length = o.length.match(/\d+/g);
              if ( length[1] ) length = (+length[0]) * 60 * 60 + (+length[1]) * 60;
              else  length = (+length[0]) * 60;
      				return length;
            }
            else { return 0; }
          }, sortDirection);
          break;
        default:
          // if ( o )
      }
      
      return sortedBooks;
    },
    
		filteredObj: function() {
      const vue = this;
			var books = this.gallery.fuseResults || this.library.books;
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
