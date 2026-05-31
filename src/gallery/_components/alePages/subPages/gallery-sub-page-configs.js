
import store from "@output-modules/store/gallery-store-index.js";

// SERIES HELPERS
function parseBookNumbers( bookNumbers ) {
  return ( bookNumbers || '' ).split( '-' ).map( _.toNumber ).filter( _.isFinite );
}

function getBookNumbers( books ) {
  return _.flatMap( books.map( b => parseBookNumbers( b.bookNumbers ) ) );
}

function getMaxBookNumber( books ) {
  return _.max( getBookNumbers( books ) );
}

function removeDuplicates( books ) {
  // Removes duplicate books from a series list, prioritizing books the user owns.
  // Bundles (combined book numbers) are ignored even if you own the individual books.
  let dollybooks = _.clone( books );

  var n = 0;
  _.each( dollybooks, function ( book ) {
    book.order = ++n;
  } );

  dollybooks = _.groupBy( dollybooks, 'bookNumbers' );

  _.each( dollybooks, function ( chunk, i ) {
    if ( chunk.length === 1 ) {
      dollybooks[ i ] = [ chunk[ 0 ] ];
    }
    else {
      var inLibrary = _.filter( chunk, function ( o ) { return !o.notInLibrary; } );
      dollybooks[ i ] = inLibrary.length > 0 ? inLibrary : [ chunk[ 0 ] ];
    }
  } );

  dollybooks = _.flatten( _.map( dollybooks, o => o ) );
  dollybooks = _.orderBy( dollybooks, 'order', 'asc' );

  return dollybooks;
}

function calcMinRating( obj, book ) {
  let ratings = [ obj.minRating, book.myRating ];
  ratings = _.map( ratings, _.toNumber );
  ratings = _.filter( ratings, _.isFinite );
  return _.min( ratings );
}


// DEFAULT CONFIG — shared by all sub pages. Page configs override only what differs.
// bookProp-derived properties (pageId, pageTitle, rowRoute, booksTotalTippy) are resolved
// via each config's resolve{} block. Scope, sort, and filter items can be overridden or
// extended from page configs by key.
export const defaultConfig = {
  booksTotalBorderless: false,
  booksTotalContent   : ( item ) => item.books.length,
  scope: [
    { active: true, key: 'name',  weight: 5 },
    { active: true, key: 'books', weight: 1 },
  ],
  filters: [
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'bookCount',
      key         : 'books',
      label       : 'Number of books',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 1,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.books ? item.books.length : 0 );
        return max ? max.books.length : 1;
      },
      condition   : function ( item ) {
        if ( item.books ) return item.books.length >= this.range[ 0 ] && item.books.length <= this.range[ 1 ];
      },
    },
  ],
  resolveEntity: ( entity, vue ) => entity.name ? { name: entity.name, url: vue.slugify( entity.name ) } : null,
  resolve: {
    pageId         : ( { bp } ) => bp,
    pageTitle      : ( { bp } ) => bp[ 0 ].toUpperCase() + bp.slice( 1 ),
    rowRoute       : ( { singular } ) => ( item, src ) => ( { name: singular, params: { [ singular ]: item.url }, query: { subPageSource: src } } ),
    booksTotalTippy: ( { singular } ) => `Total number of books with this ${ singular }.`,
  },
  sort: [
    { active: false, key: 'randomize', label: 'Randomize', type: 'sortExtras', tippy: "Ignores sorting and randomizes instead unless there's an active search." },
    { type: 'divider', key: 'divider1' },
    { active: true,  current: true,  key: 'added',  label: 'Added',           type: 'sort', tippy: '<div style="text-align: left;"><small>&#9650;</small> Old at the top <br><small style="display: inline-block; transform: rotate(180deg);">&#9650;</small> New at the top</div>' },
    { active: true,  current: false, key: 'name',   label: 'Name',            type: 'sort', tippy: 'Sort by name' },
    { active: false, current: false, key: 'amount', label: 'Number of books', type: 'sort' },
  ],
  makeCollection: function ( books, vue ) {
  
    const { bookProp, resolveEntity, scope } = vue.config;

    // Scope keys with dots (e.g. "narrators.name") indicate cross-reference fields.
    // Extract unique root names (e.g. "narrators") to know which fields to copy from each book.
    const relatedFields = _.chain( scope )
      // Split each key into parts — _.split guards against null/undefined keys
      .map( ( s ) => _.split( s.key, '.' ) )
      // Only dotted keys are cross-reference fields
      .filter( ( parts ) => parts.length > 1 )
      // Take the root field name (e.g. "narrators" from "narrators.name")
      .map( _.first )
      .uniq()
      .value();

    const collection = [];
    let addedCounter = 1;

    // Processed in reverse so "added" order is based on the first book added for each entity.
    _.eachRight( books, ( book ) => {
      _.each( book[ bookProp ], ( entity ) => {

        // Get name and url for this entity; returns null if the entity should be excluded (e.g. authors without a url)
        const resolved = resolveEntity( entity, vue );
        if ( !resolved ) return;
        const { name, url } = resolved;

        // First occurrence: create a new entry, copying cross-reference fields (e.g. authors, narrators) from the book
        const existing = _.find( collection, { name } );
        if ( !existing ) {
          collection.push({ 
            name: name, 
            url: url, 
            added: addedCounter++, 
            books: [ book.title || book.shortTitle ], 
            ..._.pick( book, relatedFields ),
          });
        }
        // Already in collection: just append the book title
        else {
          existing.books.push( book.title || book.shortTitle );
        }
        
      });
    });
    
    _.reverse( collection );
    return collection;
    
  },
};


// AUTHORS
export const authorsConfig = {
  bookProp      : 'authors',
  label         : 'author',
  resolveEntity : ( entity ) => ( entity.name && entity.url ) ? { name: entity.name, url: entity.url } : null,
  scope: [
    { active: true, key: 'narrators.name',  tippy: 'Search authors by narrators',  weight: 1 },
    { active: true, key: 'publishers.name', tippy: 'Search authors by publishers', weight: 1 },
    { active: true, key: 'series.name',     tippy: 'Search authors by series',     weight: 1 },
  ],
};

// NARRATORS
export const narratorsConfig = {
  bookProp      : 'narrators',
  label         : 'narrator',
  scope: [
    { active: true, key: 'authors.name',    tippy: 'Search narrators by authors',    weight: 1 },
    { active: true, key: 'publishers.name', tippy: 'Search narrators by publishers', weight: 1 },
    { active: true, key: 'series.name',     tippy: 'Search narrators by series',     weight: 1 },
  ],
};

// PUBLISHERS
export const publishersConfig = {
  bookProp        : 'publishers',
  label           : 'publisher',
  scope: [
    { active: true, key: 'authors.name',   tippy: 'Search publishers by authors',    weight: 1 },
    { active: true, key: 'narrators.name', tippy: 'Search publishers by narrators',  weight: 1 },
    { active: true, key: 'series.name',    tippy: 'Search publishers by series',     weight: 1 },
  ],
};

// SERIES
export const seriesConfig = {
  bookProp            : 'series',
  label               : 'series',
  booksTotalBorderless: true,
  booksTotalContent: function ( item ) {
    if ( item.allBooks && item.allBooks.length ) {
      const space = '&nbsp;';
      return `<span>${ item.books.length }</span>${ space }of${ space }<strong>${ item.allBooks.length }</strong>`;
    }
    return item.books.length;
  },
  resolve: {
    rowRoute: () => ( item, sourceName ) => ( { name: 'series', params: { series: item.asin }, query: { subPageSource: sourceName } } ),
  },
  scope: [
    { active: true, key: 'authors.name',    tippy: 'Search series by authors',    weight: 1 },
    { active: true, key: 'narrators.name',  tippy: 'Search series by narrators',  weight: 1 },
    { active: true, key: 'publishers.name', tippy: 'Search series by publishers', weight: 1 },
  ],

  sort: [
    { key: 'name',   tippy: 'Sort by series name' },
    { key: 'amount', label: 'Number of owned books' },
    { excludeFromWishlist: true, active: false, current: false, key: 'amountTotal', label: 'Total number of books',  type: 'sort' },
    { excludeFromWishlist: true, active: false, current: false, key: 'missing',     label: 'Missing',                type: 'sort', tippy: 'Number of missing books' },
  ],

  filters: [
    { id: 'bookCount', key: 'inSeries', label: 'Number of owned books' },
    {
      excludeFromWishlist: true,
      type: 'divider',
      key: 'divider1.0',
    },
    {
      excludeFromWishlist: true,
      active: false,
      type: 'filterExtras',
      label: 'Rating (min)',
      tippy: 'Based on the book you rated lowest in the series',
      key: 'min-rating',
      condition: function ( series ) {
        return ( series.minRating || 0 ) >= this.range[ 0 ];
      },
      range: true,
      rangeMin: () => 1,
      rangeMax: () => 5,
      rangeMinDist: 0,
      rangeSuffix: '',
      tooltipFormatter: function ( val ) {
        switch ( val ) {
          case 1: return val + ` (Not for me)`;
          case 2: return val + ` (It's okay)`;
          case 3: return val + ` (Pretty good)`;
          case 4: return val + ` (It's great)`;
          case 5: return val + ` (I love it)`;
          default: return 0;
        }
      },
    },
    {
      excludeFromWishlist: true,
      type: 'divider',
      key: 'divider1.1',
    },
    {
      excludeFromWishlist: true,
      active: false,
      type: 'filterExtras',
      label: 'Incomplete series',
      key: 'series-incomplete',
      tippy: "Series in which I don't own all the books",
      condition: function ( series ) {
        return series.allBooksMinusDupes.length > series.books.length;
      },
    },
    {
      excludeFromWishlist: true,
      type: 'divider',
      key: 'divider1.2',
    },
    {
      excludeFromWishlist: true,
      active: false,
      type: 'filterExtras',
      label: 'Missing latest book',
      key: 'missing-latest',
      condition: ( series ) => series?.missingLatest,
    },
  ],

  makeCollection: function ( books, vue ) {
  
    const seriesCollection = [];
    let addedCounter = 1;

    // LOOP BOOKS
    // Processed in reverse so that "added" order is based on the first book added to the library for each series.
    _.eachRight( books, ( book ) => {
      // LOOP SERIES
      _.each( _.get( book, 'series' ), ( series ) => {

        const seriesAdded = _.find( seriesCollection, { asin: series.asin } );
        const librarySeries = _.find( vue.$store.state.audibledata.series, { asin: series.asin } );

        const currentObj = seriesAdded ?? {
          books     : [],
          added     : addedCounter++,
          name      : series.name,
          asin      : series.asin,
          authors   : book.authors,
          narrators : book.narrators,
          publishers: book.publishers,
          minRating : _.toNumber( book.myRating ),
        };

        if ( librarySeries ) {
          // Duplicates removed because multiple versions of a book make series appear incomplete.
          librarySeries.allBooksMinusDupes = removeDuplicates( librarySeries.allBooks );

          const ownedBooks = _.filter( librarySeries.allBooksMinusDupes, ( ownedBook ) => {
            return _.includes( librarySeries.books, ownedBook.asin );
          } );

          currentObj.allBooks = librarySeries.allBooks || [];
          currentObj.allBooksMinusDupes = librarySeries.allBooksMinusDupes;
          currentObj.myMaxBookNumber = getMaxBookNumber( ownedBooks );
          currentObj.maxBookNumber = getMaxBookNumber( librarySeries.allBooksMinusDupes );
          currentObj.missingLatest = currentObj.myMaxBookNumber < currentObj.maxBookNumber;
          currentObj.minRating = calcMinRating( currentObj, book );
        }

        currentObj.books.push( book.title || book.shortTitle );

        if ( !seriesAdded ) seriesCollection.push( currentObj );

      } );
    } );

    _.reverse( seriesCollection );
    return seriesCollection;
    
  },
};
