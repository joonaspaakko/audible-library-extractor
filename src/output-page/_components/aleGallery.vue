<template>
  <div id="ale-gallery">
    <ale-search :booksArray="booksArray" :library="library" :gallery="gallery"></ale-search>
    <ale-bookdetails :booksArray="booksArray" :library="library" :gallery="gallery"></ale-bookdetails> <!-- itunes style floater that plants itself between the cover items -->
    <ale-books :booksArray="booksArray" :library="library" :gallery="gallery"></ale-books>
  </div>
</template>

<script>
import aleSearch from './aleGallery/aleSearch'
import aleBooks from './aleGallery/aleBooks'
import aleBookdetails from './aleGallery/aleBookdetails'

export default {
  name: 'aleGallery',
  components: {
    aleSearch,
    aleBooks,
    aleBookdetails,
  },
  props: ['library'],
  data: function() {
    return {
      gallery: {
  			fuseResults: [],
        searchValue: '',
	      searchOptions: {
	        open: false,
          listsTemp: null,
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
            ]
	        }
	      },
        details: {
          open: false,
          index: -1,
					changed: false,
          sliders: {},
        }
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
        switch ( activeSortKey ) {
          case 'bookNumbers':
          sortedBooks = _.orderBy(sortedBooks, function(o) {
            
            if ( o.bookNumbers ) {
              // const seriesObj = _.filter(o.series, ['name', seriesName ]);
              const seriesObj = _.filter(o.series, ['name', o.series[0].name ]);
              const number = seriesObj[0].bookNumber;
              const numbers = _.isArray( number ) ? number[0] : number;
              // If the number is a string, we assume it's a number range
              // and once again use the first number from that range
              const dashSplit = typeof numbers == 'string' ? numbers.split('-') : [numbers];
              if ( dashSplit.length > 1 ) {
                return parseFloat( dashSplit[0] );
              }
              else {
                return numbers;
              }
            }
            else {
              return 9999999;
            }
            
          }, sortDirection);
          break;
          case 'dateAdded':
          // It worked out pretty well from the beginning with this, because even
          // before I had any aspirations to add any kinda sorting, I had chosen to
          // extract the book data in the order they were purchased/added. Turns out
          // that after I started working on this thing, Audible's desktop library
          // got a facelift and this new style library is missing the date of when
          // the book was added, unlike the old library. Fortunately I could still get
          // the date from the store page of the book... However, unfortunately that
          // means books that either don't have the store page anymore or books that
          // got replaced by a re-release or something are going to be missing the date
          // it was added. So that's why in here, I'm simply reversing the array on an
          // ascended sort and just passing the on the data as is on a descending sort.
          if (  sortDirection === 'asc' ) {
            sortedBooks = _.reverse( _.clone(sortedBooks) );
          }
          break;
          case 'releaseDate':
          sortedBooks = _.orderBy(sortedBooks, function(o) {
            return o.releaseDate ? new Date( o.releaseDate.split('-') ) :  new Date( '1800', '01', '01' );
          }, sortDirection);
          // _.orderBy(unOrderedCollection, [{activeSortKey: Number}], ['desc'])
          break;
          case 'authors.name':
          case 'narrators.name':
          const keyMinusName = activeSortKey.replace('.name','');
          sortedBooks = _.orderBy(sortedBooks, function( o ) {
            return o[ keyMinusName ] ? o[ keyMinusName ][0].name : null;
          }, sortDirection);
          break;
          case 'title':
          sortedBooks = _.orderBy(sortedBooks, function( o ) {
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
          sortedBooks = _.orderBy(sortedBooks, function( o ) {
            if ( o.length ) {
              
              return timeStringToSeconds( o.length );
              
              function timeStringToSeconds( string ) {
                const hasMinutes = string.match('min'); //sometimes 'min', sometimes 'mins'
                var numbers = string.match(/\d+/g);
                // If the array numbers.length is 2, then we the array must contain hours and minutes
                if ( numbers.length === 2 ) {
                  numbers = (+numbers[0]) * 60 * 60 + (+numbers[1]) * 60;
                }
                // If the array numbers.length is below 2...
                // ...and the original string doesn't contain the word 'min',
                // then we'll assume the unit is hours...
                else if ( !hasMinutes ) {
                  numbers = (+numbers[0]) * 60 * 60;
                }
                // If the array numbers is below 2...
                // ...and the original string contains the word 'min',
                // then we'll assume the unit is minutes...
                else {
                  numbers = (+numbers[0]) * 60;
                }
                return numbers;
              }
              
            }
            else { return 0; }
          }, sortDirection);
          break;
          case 'rating':
          case 'ratings':
          sortedBooks = _.orderBy(sortedBooks, function( o ) {
            if ( o[ activeSortKey ] ) {
              var text = o[ activeSortKey ];
              if ( activeSortKey === 'ratings' ) text = text.match(/\d/g).join('');
              return Number( text );
            }
            else { return 0; }
          }, sortDirection);
          break;
        }
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
