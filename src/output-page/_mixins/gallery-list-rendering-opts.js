
export default {
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
          { active: true,  key: 'blurb' },
        ],
        filter: [
          { active: true, type: 'filter', label: 'Not started', key: 'notStarted', condition: function( book ) { return !book.progress; } },
          { active: true, type: 'filter', label: 'Started',     key: 'started',    condition: function( book ) { return book.progress && !book.progress.toLowerCase().match('finished') ? true : false; }  },
          { active: true, type: 'filter', label: 'Finished',    key: 'finished',   condition: function( book ) { return book.progress && book.progress.toLowerCase().match('finished') ? true : false; }  },
          
          // { type: 'divider', key: 'divider1' },
          
          // { active: true,  type: 'filterExtras', label: 'All',          key: 'all',          group: 'filterExtras', condition: function( book ) { return book.asin;            } },
          { active: false, type: 'filterExtras', label: 'In series', key: 'inseries', group: 'filterExtras', condition: function( book ) { return book.series; } },
          { active: false, type: 'filterExtras', label: 'Not in series', key: 'not-inseries', group: 'filterExtras', condition: function( book ) { return !book.series; } },
          { type: 'divider', key: 'divider1.1' },
          { active: false, type: 'filterExtras', label: 'Not from plus catalog', key: 'not-from-plus-catalog', group: 'filterExtras', condition: function( book ) { return !book.fromPlusCatalog; } },
          { active: false, type: 'filterExtras', label: 'Plus catalog: Available', key: 'plus-catalog-available', group: 'filterExtras', condition: function( book ) { return book.fromPlusCatalog && !book.unavailable; } },
          { active: false, type: 'filterExtras', label: 'Plus catalog: Unavailable', key: 'plus-catalog-unavailable', group: 'filterExtras', condition: function( book ) { return book.fromPlusCatalog && book.unavailable; }, tippy: "Books that are from the plus catalog, but they are locked. Conditions: a book left the plus catalog or inactive membership." },
          { type: 'divider', key: 'divider1.3' },
          { active: false, type: 'filterExtras', label: 'Store page available', key: 'store-page-available', group: 'filterExtras', condition: function( book ) { return !(book.storePageChanged || book.storePageMissing); } },
          { active: false, type: 'filterExtras', label: 'Store page unavailable', key: 'store-page-unavailable', group: 'filterExtras', condition: function( book ) { return book.storePageChanged || book.storePageMissing; }, tippy: "Store page has been removed or changed after it was added." },
          { type: 'divider', key: 'divider1.4' },
          { active: false, type: 'filterExtras', label: 'Favorites',    key: 'favorites',    group: 'filterExtras', condition: function( book ) { return book.favorite;        } },
          { active: false, type: 'filterExtras', label: 'No rating', key: 'no-rating', group: 'filterExtras', condition: function( book ) { return !book.myRating; }, tippy: "Books you haven't rated yet." },
          { active: false, type: 'filterExtras', label: 'New books', key: 'new-books', group: 'filterExtras', condition: function( book ) { return book.isNew; }, tippy: "Most recent additions." },
          { active: false, type: 'filterExtras', label: 'Giftable books', key: 'giftable', group: 'filterExtras', condition: function( book ) { return !book.fromPlusCatalog && !book.unavailable && !book.storePageChanged && !book.storePageMissing; }, tippy: 'Excludes all books that are from the plug catalog and books with removed or changed store pages, since those cannot be gifted using the "Send this book" feature.' },
          
          { type: 'divider', key: 'divider2.0' },

          { active: false, type: 'filterExtras', label: 'Length', key: 'length', group: 'filterExtras', range: true, rangeMinDist: 1, rangeSuffix: 'h', 
          rangeMin: function() { 
            return 0; 
          }, 
          rangeMax: function() { 
            let books = _.get(vue.$store.state, vue.collectionSource);
            let longest = _.maxBy( books, function( book ){ return vue.timeStringToSeconds(book.length); }); 
            // seconds to minutes + rounded UP
            return longest ? Math.ceil(vue.timeStringToSeconds(longest.length) / 3600) : 0; 
          }, 
          condition: function( book ) { 
            if (book.length ) {
              let min = this.range[0];
              let max = this.range[1];
              let length = vue.timeStringToSeconds(book.length) / 3600;
              return length >= min && length <= max; 
              // return Math.ceil(length) >= min && Math.floor(length) <= max; 
            } 
          },
          // Good idea, but I think it made it too restrictive and 0-10 was a little tightly packed.
          // rangeMarks: function( max ) {
          //   return lengthMarksCalc( max );
          // } 
          },
          
          { type: 'divider', key: 'divider2.1' },
          
          { active: false, type: 'filterExtras', label: 'Narrators', key: 'narrators', group: 'filterExtras',  range: true, rangeMinDist: 0, rangeSuffix: '', 
          rangeMin: function() { 
            return 1;
          }, 
          rangeMax: function() { 
            let books = _.get(vue.$store.state, vue.collectionSource);
            let most = _.maxBy( books, function( book ){ return (book.narrators) ? book.narrators.length : 0; }); 
            return most ? most.narrators.length : 0; 
          }, 
          condition: function( book ) { 
            if (book.narrators ) {
              let min = this.range[0];
              let max = this.range[1];
              let length = book.narrators.length;
              return length >= min && length <= max; 
            } 
          } },
          
          { type: 'divider', key: 'divider3' },
          
          { active: false, type: 'filterExtras', label: 'Books in series', key: 'booksinseries', group: 'filterExtras',  range: true, rangeMinDist: 0, rangeSuffix: '', 
          rangeMin: function() { 
            return 1;
          }, 
          rangeMax: function() { 
            let books = _.filter( _.get(vue.$store.state, vue.collectionSource), 'series' );
            
            let most = 0;
            _.each( books, function( book ){ 
                let bigBoe = _.maxBy( book.series, function( series ) {
                  let foundSeries = _.find( vue.$store.state.library.series, { asin: series.asin });
                  if ( foundSeries && foundSeries.books ) return foundSeries.books.length;
                });
                const bigBoeLength = _.find( vue.$store.state.library.series, { asin: bigBoe.asin }).books.length;
                if ( most < bigBoeLength ) most = bigBoeLength;
            }); 
            
            return most; 
          }, 
          condition: function( book ) { 
            if ( book.series ) {
              
              let min = this.range[0];
              let max = this.range[1];
              
              let result = false;
              _.each( book.series, function( cSeries ) {
                const series = _.find( vue.$store.state.library.series, { asin: cSeries.asin });
                if ( series.books.length >= min && series.books.length <= max ) {
                  result = true;
                  return false;
                }
              });
              
              return result; 
              
            } 
          } },
          
          { type: 'divider', key: 'divider4' },
          { active: false, type: 'filterExtras', label: 'Average rating', key: 'rating', group: 'filterExtras',  range: true, rangeMinDist: 0, rangeSuffix: '', 
          rangeMin: function() { 
            let books = _.get(vue.$store.state, vue.collectionSource);
            let smallestRating = _.minBy( books, function( book ){ if (book.rating) return parseFloat(book.rating); }); 
            // return smallestRating ? Math.floor(parseFloat(smallestRating.rating)) : 0; 
            return smallestRating ? parseFloat(smallestRating.rating) : 0; 
          }, 
          rangeMax: function() { 
            let books = _.get(vue.$store.state, vue.collectionSource);
            let biggestRating = _.maxBy( books, function( book ){ if (book.rating) return parseFloat(book.rating); }); 
            // return biggestRating ? Math.ceil(parseFloat(biggestRating.rating)) : 0; 
            return biggestRating ? parseFloat(biggestRating.rating) : 0; 
          }, 
          condition: function( book ) { 
            if ( book.rating ) {
              let min = this.range[0];
              let max = this.range[1];
              let rating = parseFloat( book.rating );
              // return Math.floor(rating) >= min && Math.ceil(rating) <= max; 
              return rating >= min && rating <= max; 
            } 
          }, rangeInterval: .1 },
          
          { type: 'divider', key: 'divider5.2' },
          { active: false, type: 'filterExtras', label: 'Ratings', key: 'number-of-ratings', group: 'filterExtras', range: true, rangeMinDist: 1, rangeSuffix: '', 
          rangeMin: function() { 
            // return 1; 
            
            let books = _.get(vue.$store.state, vue.collectionSource);
            let bigBoe = _.minBy( books, function( book ){ if ( book.ratings ) return parseFloat(book.ratings) }); 
            // seconds to minutes + rounded UP
            return bigBoe ? bigBoe.ratings : 0; 
            
          }, 
          rangeMax: function() { 
            let books = _.get(vue.$store.state, vue.collectionSource);
            let bigBoe = _.maxBy( books, function( book ){ if ( book.ratings ) return parseFloat(book.ratings) }); 
            // seconds to minutes + rounded UP
            return bigBoe ? bigBoe.ratings : 0; 
          }, 
          condition: function( book ) { 
            if (book.ratings ) {
              let min = this.range[0];
              let max = this.range[1];
              let ratings = parseFloat(book.ratings);
              return ratings >= min && ratings <= max; 
            } 
          } },
          
          { type: 'divider', key: 'divider5' },
          { active: false, type: 'filterExtras', label: 'My rating', key: 'myrating', group: 'filterExtras',  range: true, rangeMinDist: 0, rangeSuffix: '', 
          rangeMin: function() { 
            let books = _.get(vue.$store.state, vue.collectionSource);
            let smallestRating = _.minBy( books, function( book ){ if (book.myRating) return parseFloat(book.myRating); }); 
            return smallestRating ? parseFloat(smallestRating.myRating) : 0; 
          }, 
          rangeMax: function() { 
            let books = _.get(vue.$store.state, vue.collectionSource);
            let biggestRating = _.maxBy( books, function( book ){ if (book.myRating) return parseFloat(book.myRating); }); 
            return biggestRating ? parseFloat(biggestRating.myRating) : 0; 
          }, 
          condition: function( book ) { 
            if ( book.myRating ) {
              let min = this.range[0];
              let max = this.range[1];
              let rating = parseFloat( book.myRating );
              return rating >= min && rating <= max; 
            } 
          } },
          
          { type: 'divider', key: 'divider5.1' },
          { active: false, type: 'filterExtras', label: 'Added', key: 'added', group: 'filterExtras',  range: true, rangeMinDist: 1, rangeSuffix: '', 
          rangeMin: function() { 
            let books = _.get(vue.$store.state, vue.collectionSource);
            let smalled = _.minBy( books, function( book ){ if (book.added) return parseFloat(book.added); }); 
            return smalled ? parseFloat(smalled.added) : 0; 
          }, 
          rangeMax: function() { 
            let books = _.get(vue.$store.state, vue.collectionSource);
            let biggest = _.maxBy( books, function( book ){ if (book.added) return parseFloat(book.added); }); 
            return biggest ? parseFloat(biggest.added) : 0; 
          }, 
          condition: function( book ) { 
            if ( book.added ) {
              let min = this.range[0];
              let max = this.range[1];
              let added = parseFloat( book.added );
              return added >= min && added <= max; 
            } 
          }, rangeInterval: 1, tippy: "Low number = old book <br> High number = new book" },
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
          { active: true , current: false, key: 'narratorsNumber'  , label: 'Number of narrators'          , type: 'sort' }, 
          { active: false , current: false, key: 'length'          , label: 'Length'            , type: 'sort' }, 
          { active: true , current: false, key: 'series'          , label: 'Series'            , type: 'sort', tippy: 'Sorts books by the series name alphabetically.' }, 
          // { active: true , current: false, key: 'seriesNumber'  , label: 'Series length'          , type: 'sort' }, 
          
          { type: 'divider', key: 'divider2' },
          { active: false , current: false, key: 'releaseDate'     , label: 'Release date'      , type: 'sort' }, 
          { active: false , current: false, key: 'rating'          , label: 'Average rating'            , type: 'sort' }, 
          { active: false , current: false, key: 'ratings'         , label: 'Number of ratings' , type: 'sort' },
          { active: false , current: false, key: 'myRating'        , label: 'My rating'         , type: 'sort' },
          { active: true , current: false, key: 'publishers.name' , label: 'Publishers'        , type: 'sort' }, 
          
          { type: 'divider', key: 'divider3' }, 
          { active: false, current: false, key: 'progress'        , label: 'Progress'          , type: 'sort' }, 
          { active: false , current: false, key: 'favorite'        , label: 'Favorite'          , type: 'sort' },
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
    
  }
};


function lengthMarksCalc( max ) {
  
  var marks = [0,1,2,3,4,5,6,7,8,9,10,15,20];

  if ( max < 20 ) {
    while ( marks[marks.length-1] > max ) {
      marks.pop();
    }
    if ( max > marks[marks.length-1] ) {
      if ( max <=  marks[marks.length-1] + 2  ) marks.pop();
      marks.push(max);
    }
  }
  else {
    
    var remainder = max-20;
    var tens = Math.floor( remainder / 10 );
    
    if ( tens === 0 ) {
      if ( max <=  marks[marks.length-1] + 4  ) marks.pop();
      marks.push(max);
    }
    else {
      
      var tensArray = _.range(1,tens+1);
      _.each( tensArray, function() {
        marks.push( marks[marks.length-1] + 10 );
      });
          
      if ( max > marks[marks.length-1] ) {  
        if ( max <=  marks[marks.length-1] + 4  ) marks.pop();
        marks.push(max);
      }
      
    }

  }

  return marks;
  
}