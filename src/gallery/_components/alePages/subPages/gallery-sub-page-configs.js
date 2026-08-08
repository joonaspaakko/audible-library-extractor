
import store from "@output-modules/store/gallery-store-index.js";
import timeStringToSeconds from "@output-mixins/gallery-timeStringToSeconds.js";

function isWishlistSource() {
  return store.state.sticky.subPageSource === 'wishlist';
}

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

function myRatingTooltip( val ) {
  switch ( val ) {
    case 1: return `${ val } (Not for me)`;
    case 2: return `${ val } (It's okay)`;
    case 3: return `${ val } (Pretty good)`;
    case 4: return `${ val } (It's great)`;
    case 5: return `${ val } (I love it)`;
    default: return val;
  }
}

function addRatingFields( collection ) {
  _.each( collection, ( entity ) => {

    const rated = _.filter( entity.bookObjects, ( b ) => {
      const r = _.toNumber( b.myRating );
      return _.isFinite( r ) && r > 0;
    } );

    if ( rated.length ) {
      entity.myRatingMin = _.min( _.map( rated, b => _.toNumber( b.myRating ) ) );
      entity.myRatingMax = _.max( _.map( rated, b => _.toNumber( b.myRating ) ) );
      entity.myRatingAvg = _.round( _.sumBy( rated, b => _.toNumber( b.myRating ) ) / rated.length, 1 );
    }

    const communityRated = _.filter( entity.bookObjects, b => _.toNumber( b.rating ) > 0 );
    if ( communityRated.length ) {
      entity.ratingMax = _.round( _.max( _.map( communityRated, b => _.toNumber( b.rating ) ) ), 2 );
    }

    const totalRatings = _.sumBy( entity.bookObjects, b => _.toNumber( b.ratings ) || 0 );
    entity.ratingPopularity = totalRatings;
    if ( totalRatings > 0 ) {
      entity.ratingWeightedAvg = _.round(
        _.sumBy( entity.bookObjects, b => ( _.toNumber( b.rating ) || 0 ) * ( _.toNumber( b.ratings ) || 0 ) ) / totalRatings,
        2
      );
    }

    // DURATION
    const booksWithDuration = _.filter( entity.bookObjects, b => b.length );
    if ( booksWithDuration.length ) {
      const totalSeconds = _.sumBy( booksWithDuration, b => timeStringToSeconds.methods.timeStringToSeconds( b.length ) );
      entity.totalHours = _.round( totalSeconds / 3600, 1 );
      entity.avgHours   = _.round( totalSeconds / booksWithDuration.length / 3600, 1 );
    }

    // RELEASE YEAR
    const years = _.filter(
      _.map( entity.bookObjects, b => b.releaseDate ? new Date( b.releaseDate ).getFullYear() : null ),
      y => y && !isNaN( y )
    );
    if ( years.length ) {
      entity.newestReleaseYear = _.max( years );
      entity.oldestReleaseYear = _.min( years );
    }

    // ENGAGEMENT
    entity.hasFavorite     = _.some( entity.bookObjects, b => b.favorite );
    entity.finishedCount   = _.filter( entity.bookObjects, b => b.progress && b.progress.toLowerCase().trim() === 'finished' ).length;
    entity.unfinishedCount = entity.bookObjects.length - entity.finishedCount;

    // CROSS-REFERENCE COUNTS
    entity.uniqueNarratorsCount = _.uniqBy( _.flatMap( entity.bookObjects, b => b.narrators  || [] ), 'name' ).length;
    entity.uniqueAuthorsCount   = _.uniqBy( _.flatMap( entity.bookObjects, b => b.authors    || [] ), 'name' ).length;
    entity.uniqueSeriesCount    = _.uniqBy( _.flatMap( entity.bookObjects, b => b.series     || [] ), 'asin' ).length;

    // STANDALONE BOOKS
    entity.standaloneCount = _.filter( entity.bookObjects, b => !b.series || !b.series.length ).length;

    // Series-specific: % finished relative to total books including unowned
    if ( entity.allBooksMinusDupes && entity.allBooksMinusDupes.length ) {
      entity.pctFinishedOfAll = _.round( entity.finishedCount / entity.allBooksMinusDupes.length * 100 );
    }

  } );
}


// DEFAULT CONFIG — shared by all sub pages. Page configs override only what differs.
// bookProp-derived properties (pageId, pageTitle, rowRoute, booksTotalTippy) are resolved
// via each config's resolve{} block. Scope, sort, and filter items can be overridden or
// extended from page configs by key.
export const defaultConfig = {
  booksTotalBorderless: false,
  booksTotalContent   : ( item ) => item.books.length,
  // The namesake scope (the page's own entity name) is prepended per config below, since
  // its key/label differ by page ('Authors', 'Series', ...). 'booktitle' is shared: it
  // reads each entity's array of book titles ('books' field), labeled to avoid clashing
  // with the ambiguous 'title' on entity pages.
  scope: [
    { active: true, key: 'booktitle', field: 'books', alias: 'booktitle', label: 'book title', icon: 'title', weight: 1 },
  ],
  filters: [
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'bookCount',
      key         : 'books',
      label       : () => isWishlistSource() ? 'Books in wishlist' : 'Books in library',
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
    {
      active          : false,
      type            : 'filterExtras',
      id              : 'hasStandaloneBooks',
      key             : 'has-standalone-books',
      label           : 'Has standalone books',
      tippy           : 'Has at least one book that does not belong to any series',
      excludeFromSeries: true,
      condition       : ( item ) => item.standaloneCount > 0,
    },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'standaloneCount',
      key         : 'standalone-count',
      label       : 'Standalone books',
      tippy       : 'Number of books not belonging to any series',
      excludeFromSeries: true,
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 0,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.standaloneCount || 0 );
        return max ? ( max.standaloneCount || 1 ) : 1;
      },
      condition   : function ( item ) {
        const count = item.standaloneCount || 0;
        return count >= this.range[ 0 ] && count <= this.range[ 1 ];
      },
    },
    {
      type: 'divider',
      key : 'divider-plus-catalog',
    },
    {
      active          : false,
      type            : 'filterExtras',
      id              : 'plusCatalog',
      key             : 'has-plus-catalog',
      label           : 'Has plus catalog books',
      condition       : ( item ) => _.some( item.bookObjects, b => b.fromPlusCatalog ),
    },
    {
      active          : false,
      type            : 'filterExtras',
      id              : 'noPlusCatalog',
      key             : 'no-plus-catalog',
      label           : 'No plus catalog books',
      condition       : ( item ) => !_.some( item.bookObjects, b => b.fromPlusCatalog ),
    },
    {
      type              : 'divider',
      key               : 'divider-my-ratings',
      excludeFromWishlist: true,
    },
    {
      active            : false,
      type              : 'filterExtras',
      id                : 'myRatingMax',
      key               : 'my-rating-max',
      label             : 'My highest book rating',
      tippy             : 'At least one book rated this high or higher',
      excludeFromWishlist: true,
      range             : true,
      rangeMinDist      : 0,
      rangeSuffix       : '',
      rangeMin          : () => 1,
      rangeMax          : () => 5,
      tooltipFormatter  : myRatingTooltip,
      condition         : function ( item ) {
        return ( item.myRatingMax || 0 ) >= this.range[ 0 ];
      },
    },
    {
      active            : false,
      type              : 'filterExtras',
      id                : 'myRatingAvg',
      key               : 'my-rating-avg',
      label             : 'My average book rating',
      tippy             : 'Average of all personal ratings',
      excludeFromWishlist: true,
      range             : true,
      rangeMinDist      : 0,
      rangeSuffix       : '',
      rangeMin          : () => 1,
      rangeMax          : () => 5,
      tooltipFormatter  : myRatingTooltip,
      condition         : function ( item ) {
        return ( item.myRatingAvg || 0 ) >= this.range[ 0 ];
      },
    },
    {
      active            : false,
      type              : 'filterExtras',
      id                : 'myRatingMin',
      key               : 'my-rating-min',
      label             : 'My lowest book rating',
      tippy             : 'Even the lowest-rated book meets this threshold',
      excludeFromWishlist: true,
      range             : true,
      rangeMinDist      : 0,
      rangeSuffix       : '',
      rangeMin          : () => 1,
      rangeMax          : () => 5,
      tooltipFormatter  : myRatingTooltip,
      condition         : function ( item ) {
        return ( item.myRatingMin || 0 ) >= this.range[ 0 ];
      },
    },
    {
      type: 'divider',
      key : 'divider-community-rating',
    },
    {
      active          : false,
      type            : 'filterExtras',
      id              : 'ratingWeightedAvg',
      key             : 'rating-weighted-avg',
      label           : 'Average book rating (weighted)',
      tippy           : 'Books with more ratings carry more weight.',
      range           : true,
      rangeMinDist    : 0,
      rangeSuffix     : '',
      rangeInterval   : 0.1,
      rangeMin        : () => 1,
      rangeMax        : () => 5,
      condition       : function ( item ) {
        const rating = item.ratingWeightedAvg || 0;
        return rating >= this.range[ 0 ] && rating <= this.range[ 1 ];
      },
    },
    {
      active          : false,
      type            : 'filterExtras',
      id              : 'ratingMax',
      key             : 'top-book-rating',
      label           : 'Top book rating',
      tippy           : 'Highest Audible rating among the books',
      range           : true,
      rangeMinDist    : 0,
      rangeSuffix     : '',
      rangeInterval   : 0.1,
      rangeMin        : () => 1,
      rangeMax        : () => 5,
      condition       : function ( item ) {
        const rating = item.ratingMax || 0;
        return rating >= this.range[ 0 ] && rating <= this.range[ 1 ];
      },
    },
    {
      active          : false,
      type            : 'filterExtras',
      id              : 'ratingPopularity',
      key             : 'popularity',
      label           : 'Total book ratings',
      tippy           : 'Total number of Audible ratings, summed across all the books',
      range           : true,
      rangeMinDist    : 0,
      rangeSuffix     : '',
      rangeMin        : () => 0,
      rangeMax        : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.ratingPopularity || 0 );
        return max ? ( max.ratingPopularity || 1 ) : 1;
      },
      condition       : function ( item ) {
        const total = item.ratingPopularity || 0;
        return total >= this.range[ 0 ] && total <= this.range[ 1 ];
      },
    },

    // DURATION
    { type: 'divider', key: 'divider-duration' },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'totalHours',
      key         : 'total-hours',
      label       : 'Combined book length',
      tippy       : 'Combined length of all books, in hours',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : 'h',
      rangeInterval: 0.5,
      rangeMin    : () => 0,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.totalHours || 0 );
        return max ? ( Math.ceil( ( max.totalHours || 1 ) / 0.5 ) * 0.5 ) : 1;
      },
      condition   : function ( item ) {
        const hours = item.totalHours || 0;
        return hours >= this.range[ 0 ] && hours <= this.range[ 1 ];
      },
    },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'avgHours',
      key         : 'avg-hours',
      label       : 'Average book length',
      tippy       : 'Average length per book, in hours',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : 'h',
      rangeInterval: 0.5,
      rangeMin    : () => 0,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.avgHours || 0 );
        return max ? ( Math.ceil( ( max.avgHours || 1 ) / 0.5 ) * 0.5 ) : 1;
      },
      condition   : function ( item ) {
        const hours = item.avgHours || 0;
        return hours >= this.range[ 0 ] && hours <= this.range[ 1 ];
      },
    },

    // RELEASE YEAR
    { type: 'divider', key: 'divider-release-year' },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'newestReleaseYear',
      key         : 'newest-release-year',
      label       : 'Newest book year',
      tippy       : 'Year the most recently released book came out',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => {
        const min = _.minBy( _.filter( store.state.pageCollection, 'newestReleaseYear' ), 'newestReleaseYear' );
        return min ? min.newestReleaseYear : new Date().getFullYear() - 30;
      },
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.newestReleaseYear || 0 );
        return max ? ( max.newestReleaseYear || new Date().getFullYear() ) : new Date().getFullYear();
      },
      condition   : function ( item ) {
        if ( !item.newestReleaseYear ) return false;
        return item.newestReleaseYear >= this.range[ 0 ] && item.newestReleaseYear <= this.range[ 1 ];
      },
    },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'oldestReleaseYear',
      key         : 'oldest-release-year',
      label       : 'Oldest book year',
      tippy       : 'Year the earliest released book came out',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => {
        const min = _.minBy( _.filter( store.state.pageCollection, 'oldestReleaseYear' ), 'oldestReleaseYear' );
        return min ? min.oldestReleaseYear : new Date().getFullYear() - 30;
      },
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.oldestReleaseYear || 0 );
        return max ? ( max.oldestReleaseYear || new Date().getFullYear() ) : new Date().getFullYear();
      },
      condition   : function ( item ) {
        if ( !item.oldestReleaseYear ) return false;
        return item.oldestReleaseYear >= this.range[ 0 ] && item.oldestReleaseYear <= this.range[ 1 ];
      },
    },

    // ENGAGEMENT
    { type: 'divider', key: 'divider-engagement', excludeFromWishlist: true },
    {
      active            : false,
      type              : 'filterExtras',
      id                : 'hasFavorite',
      key               : 'has-favorite',
      label             : 'Has favorites',
      tippy             : 'Has at least one book marked as a favorite',
      excludeFromWishlist: true,
      condition         : ( item ) => item.hasFavorite,
    },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'finishedCount',
      key         : 'finished-count',
      label       : 'Finished books',
      tippy       : 'How many books you have finished',
      excludeFromWishlist: true,
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 0,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.finishedCount || 0 );
        return max ? ( max.finishedCount || 1 ) : 1;
      },
      condition   : function ( item ) {
        const count = item.finishedCount || 0;
        return count >= this.range[ 0 ] && count <= this.range[ 1 ];
      },
    },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'unfinishedCount',
      key         : 'unfinished-count',
      label       : 'Unfinished books',
      tippy       : 'Not started, or started but not finished',
      excludeFromWishlist: true,
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 0,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.unfinishedCount || 0 );
        return max ? ( max.unfinishedCount || 1 ) : 1;
      },
      condition   : function ( item ) {
        const count = item.unfinishedCount || 0;
        return count >= this.range[ 0 ] && count <= this.range[ 1 ];
      },
    },
    // TAGS & CATEGORIES
    { type: 'divider', key: 'divider-tags' },
    {
      active         : false,
      type           : 'filterExtras',
      id             : 'tags',
      key            : 'tags',
      label          : 'Tags',
      value          : [],
      placeholder    : 'Include tags...',
      dropdownOpts   : () => {
        const tags = _.flatMap( store.state.pageCollection, item =>
          _.flatMap( item.bookObjects, b => b.tags || [] )
        );
        const normalized = _.map( tags, t => typeof t === 'string' ? t : t.name );
        return _.sortBy( _.uniq( _.filter( normalized, Boolean ) ) );
      },
      condition      : function ( item ) {
        if ( !this.value || !this.value.length ) return true;
        return _.some( item.bookObjects, b =>
          _.intersection( _.map( b.tags || [], t => typeof t === 'string' ? t : t.name ), this.value ).length > 0
        );
      },
    },
    {
      active         : false,
      type           : 'filterExtras',
      id             : 'tags-exclude',
      key            : 'tags-exclude',
      label          : 'Tags',
      exclude        : true,
      value          : [],
      placeholder    : 'Exclude tags...',
      dropdownOpts   : () => {
        const tags = _.flatMap( store.state.pageCollection, item =>
          _.flatMap( item.bookObjects, b => b.tags || [] )
        );
        const normalized = _.map( tags, t => typeof t === 'string' ? t : t.name );
        return _.sortBy( _.uniq( _.filter( normalized, Boolean ) ) );
      },
      condition      : function ( item ) {
        if ( !this.value || !this.value.length ) return true;
        return !_.some( item.bookObjects, b =>
          _.intersection( _.map( b.tags || [], t => typeof t === 'string' ? t : t.name ), this.value ).length > 0
        );
      },
    },
    {
      active         : false,
      type           : 'filterExtras',
      id             : 'categories',
      key            : 'categories',
      label          : 'Categories',
      value          : [],
      placeholder    : 'Include categories...',
      dropdownOpts   : () => {
        const cats = _.flatMap( store.state.pageCollection, item =>
          _.flatMap( item.bookObjects, b => b.categories || [] )
        );
        const normalized = _.map( cats, c => typeof c === 'string' ? c : c.name );
        return _.sortBy( _.uniq( _.filter( normalized, Boolean ) ) );
      },
      condition      : function ( item ) {
        if ( !this.value || !this.value.length ) return true;
        return _.some( item.bookObjects, b =>
          _.intersection( _.map( b.categories || [], c => typeof c === 'string' ? c : c.name ), this.value ).length > 0
        );
      },
    },
    {
      active         : false,
      type           : 'filterExtras',
      id             : 'categories-exclude',
      key            : 'categories-exclude',
      label          : 'Categories',
      exclude        : true,
      value          : [],
      placeholder    : 'Exclude categories...',
      dropdownOpts   : () => {
        const cats = _.flatMap( store.state.pageCollection, item =>
          _.flatMap( item.bookObjects, b => b.categories || [] )
        );
        const normalized = _.map( cats, c => typeof c === 'string' ? c : c.name );
        return _.sortBy( _.uniq( _.filter( normalized, Boolean ) ) );
      },
      condition      : function ( item ) {
        if ( !this.value || !this.value.length ) return true;
        return !_.some( item.bookObjects, b =>
          _.intersection( _.map( b.categories || [], c => typeof c === 'string' ? c : c.name ), this.value ).length > 0
        );
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
    { active: true,  current: true,  key: 'added',  label: 'Added', type: 'sort', tippy: '<div style="text-align: left;"><small>&#9650;</small> Old at the top <br><small style="display: inline-block; transform: rotate(180deg);">&#9650;</small> New at the top</div>' },
    { active: true,  current: false, key: 'name',   label: 'Name',  type: 'sort', tippy: 'Sort by name' },
    {
      active      : false, current: false, type: 'sort',
      key         : 'amount',
      label       : () => isWishlistSource() ? 'Books in wishlist' : 'Books in library',
    },

    // MY RATINGS
    { type: 'divider', key: 'divider-my-ratings', excludeFromWishlist: true },
    {
      active            : false, current: false, type: 'sort',
      key               : 'myRatingAvg',
      label             : 'My average rating',
      tippy             : 'Average of all personal ratings',
      excludeFromWishlist: true,
      statContent       : ( item ) => item.myRatingAvg ? `${ item.myRatingAvg }&#9733;` : '-',
    },
    {
      active            : false, current: false, type: 'sort',
      key               : 'myRatingMax',
      label             : 'My highest rating',
      tippy             : 'Highest personal rating among the books',
      excludeFromWishlist: true,
      statContent       : ( item ) => item.myRatingMax ? `${ item.myRatingMax }&#9733;` : '-',
    },

    // COMMUNITY RATINGS
    { type: 'divider', key: 'divider-community-rating' },
    {
      active      : false, current: false, type: 'sort',
      key         : 'ratingWeightedAvg',
      label       : 'Average book rating',
      tippy       : 'Community rating, weighted so books with more ratings carry more weight',
      statContent : ( item ) => item.ratingWeightedAvg ? `${ item.ratingWeightedAvg }&#9733;` : '-',
    },
    {
      active      : false, current: false, type: 'sort',
      key         : 'ratingMax',
      label       : 'Top book rating',
      tippy       : 'Highest Audible rating among the books',
      statContent : ( item ) => item.ratingMax ? `${ item.ratingMax }&#9733;` : '-',
    },
    {
      active      : false, current: false, type: 'sort',
      key         : 'ratingPopularity',
      label       : 'Total book ratings',
      tippy       : 'Total number of Audible ratings, summed across all the books',
      statContent : ( item ) => item.ratingPopularity || '-',
    },

    // DURATION
    { type: 'divider', key: 'divider-duration' },
    {
      active      : false, current: false, type: 'sort',
      key         : 'totalHours',
      label       : 'Combined book length',
      tippy       : 'Combined length of all books, in hours',
      statContent : ( item ) => item.totalHours ? `${ item.totalHours }h` : '-',
    },
    {
      active      : false, current: false, type: 'sort',
      key         : 'avgHours',
      label       : 'Average book length',
      tippy       : 'Average length per book, in hours',
      statContent : ( item ) => item.avgHours ? `${ item.avgHours }h` : '-',
    },

    // RELEASE YEAR
    { type: 'divider', key: 'divider-release-year' },
    {
      active      : false, current: false, type: 'sort',
      key         : 'newestReleaseYear',
      label       : 'Newest book year',
      tippy       : 'Year the most recently released book came out',
      statContent : ( item ) => item.newestReleaseYear || '-',
    },
    {
      active      : false, current: false, type: 'sort',
      key         : 'oldestReleaseYear',
      label       : 'Oldest book year',
      tippy       : 'Year the earliest released book came out',
      statContent : ( item ) => item.oldestReleaseYear || '-',
    },

    // ENGAGEMENT
    { type: 'divider', key: 'divider-engagement', excludeFromWishlist: true },
    {
      active      : false, current: false, type: 'sort',
      key         : 'finishedCount',
      label       : 'Finished books',
      tippy       : 'How many books you have finished',
      excludeFromWishlist: true,
      statContent : ( item ) => `${ item.finishedCount || 0 }&nbsp;of&nbsp;<strong>${ item.books.length }</strong>`,
    },
    {
      active      : false, current: false, type: 'sort',
      key         : 'unfinishedCount',
      label       : 'Unfinished books',
      tippy       : 'Not started, or started but not finished',
      excludeFromWishlist: true,
      statContent : ( item ) => `${ item.unfinishedCount || 0 }&nbsp;of&nbsp;<strong>${ item.books.length }</strong>`,
    },
    {
      active      : false, current: false, type: 'sort',
      key         : 'standaloneCount',
      label       : 'Standalone books',
      tippy       : 'Number of books not belonging to any series',
      excludeFromSeries: true,
      statContent : ( item ) => _.isFinite( item.standaloneCount ) ? item.standaloneCount : '-',
    },
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
            name       : name,
            url        : url,
            added      : addedCounter++,
            books      : [ book.title || book.shortTitle ],
            bookObjects: [ book ],
            ..._.pick( book, relatedFields ),
          });
        }
        // Already in collection: just append the book title and object
        else {
          existing.books.push( book.title || book.shortTitle );
          existing.bookObjects.push( book );
        }
        
      });
    });
    
    _.reverse( collection );
    addRatingFields( collection );
    return collection;

  },
};


// AUTHORS
export const authorsConfig = {
  bookProp      : 'authors',
  label         : 'author',
  icon          : 'user-pen',
  resolveEntity : ( entity ) => ( entity.name && entity.url ) ? { name: entity.name, url: entity.url } : null,
  scope: [
    { active: true, key: 'narrators.name',  alias: 'narrators',  label: 'narrators',  icon: 'microphone',  tippy: 'Search authors by narrators',  weight: 1 },
    { active: true, key: 'publishers.name', alias: 'publishers', label: 'publishers', icon: 'building',    tippy: 'Search authors by publishers', weight: 1 },
    { active: true, key: 'series.name',     alias: 'series',     label: 'series',     icon: 'layer-group', tippy: 'Search authors by series',     weight: 1 },
  ],
  filters: [
    { type: 'divider', key: 'divider-cross-ref' },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'uniqueNarratorsCount',
      key         : 'narrators-count',
      label       : 'Number of narrators',
      tippy       : 'How many unique narrators have read their books',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 1,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.uniqueNarratorsCount || 0 );
        return max ? ( max.uniqueNarratorsCount || 1 ) : 1;
      },
      condition   : function ( item ) { const count = item.uniqueNarratorsCount || 0; return count >= this.range[ 0 ] && count <= this.range[ 1 ]; },
    },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'uniqueSeriesCount',
      key         : 'series-count',
      label       : 'Number of series',
      tippy       : 'How many different series their books appear in',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 1,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.uniqueSeriesCount || 0 );
        return max ? ( max.uniqueSeriesCount || 1 ) : 1;
      },
      condition   : function ( item ) { const count = item.uniqueSeriesCount || 0; return count >= this.range[ 0 ] && count <= this.range[ 1 ]; },
    },
  ],
  sort: [
    { type: 'divider', key: 'divider-cross-ref' },
    { active: false, current: false, key: 'uniqueNarratorsCount', label: 'Number of narrators', type: 'sort', tippy: 'How many unique narrators have read their books', statContent: ( item ) => item.uniqueNarratorsCount || '-' },
    { active: false, current: false, key: 'uniqueSeriesCount',    label: 'Number of series',    type: 'sort', tippy: 'How many different series their books appear in', statContent: ( item ) => item.uniqueSeriesCount || '-' },
  ],
};

// NARRATORS
export const narratorsConfig = {
  bookProp      : 'narrators',
  label         : 'narrator',
  icon          : 'microphone',
  scope: [
    { active: true, key: 'authors.name',    alias: 'authors',    label: 'authors',    icon: 'user-pen',    tippy: 'Search narrators by authors',    weight: 1 },
    { active: true, key: 'publishers.name', alias: 'publishers', label: 'publishers', icon: 'building',    tippy: 'Search narrators by publishers', weight: 1 },
    { active: true, key: 'series.name',     alias: 'series',     label: 'series',     icon: 'layer-group', tippy: 'Search narrators by series',     weight: 1 },
  ],
  filters: [
    { type: 'divider', key: 'divider-cross-ref' },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'uniqueAuthorsCount',
      key         : 'authors-count',
      label       : 'Number of authors',
      tippy       : 'How many unique authors they have narrated for',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 1,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.uniqueAuthorsCount || 0 );
        return max ? ( max.uniqueAuthorsCount || 1 ) : 1;
      },
      condition   : function ( item ) { const count = item.uniqueAuthorsCount || 0; return count >= this.range[ 0 ] && count <= this.range[ 1 ]; },
    },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'uniqueSeriesCount',
      key         : 'series-count',
      label       : 'Number of series',
      tippy       : 'How many different series they have narrated',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 1,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.uniqueSeriesCount || 0 );
        return max ? ( max.uniqueSeriesCount || 1 ) : 1;
      },
      condition   : function ( item ) { const count = item.uniqueSeriesCount || 0; return count >= this.range[ 0 ] && count <= this.range[ 1 ]; },
    },
  ],
  sort: [
    { type: 'divider', key: 'divider-cross-ref' },
    { active: false, current: false, key: 'uniqueAuthorsCount', label: 'Number of authors', type: 'sort', tippy: 'How many unique authors they have narrated for', statContent: ( item ) => item.uniqueAuthorsCount || '-' },
    { active: false, current: false, key: 'uniqueSeriesCount',  label: 'Number of series',  type: 'sort', tippy: 'How many different series they have narrated', statContent: ( item ) => item.uniqueSeriesCount || '-' },
  ],
};

// PUBLISHERS
export const publishersConfig = {
  bookProp        : 'publishers',
  label           : 'publisher',
  icon            : 'building',
  scope: [
    { active: true, key: 'authors.name',   alias: 'authors',   label: 'authors',   icon: 'user-pen',    tippy: 'Search publishers by authors',    weight: 1 },
    { active: true, key: 'narrators.name', alias: 'narrators', label: 'narrators', icon: 'microphone',  tippy: 'Search publishers by narrators',  weight: 1 },
    { active: true, key: 'series.name',    alias: 'series',    label: 'series',    icon: 'layer-group', tippy: 'Search publishers by series',     weight: 1 },
  ],
  filters: [
    { type: 'divider', key: 'divider-cross-ref' },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'uniqueAuthorsCount',
      key         : 'authors-count',
      label       : 'Number of authors',
      tippy       : 'How many unique authors they publish',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 1,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.uniqueAuthorsCount || 0 );
        return max ? ( max.uniqueAuthorsCount || 1 ) : 1;
      },
      condition   : function ( item ) { const count = item.uniqueAuthorsCount || 0; return count >= this.range[ 0 ] && count <= this.range[ 1 ]; },
    },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'uniqueNarratorsCount',
      key         : 'narrators-count',
      label       : 'Number of narrators',
      tippy       : 'How many unique narrators they have used',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 1,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.uniqueNarratorsCount || 0 );
        return max ? ( max.uniqueNarratorsCount || 1 ) : 1;
      },
      condition   : function ( item ) { const count = item.uniqueNarratorsCount || 0; return count >= this.range[ 0 ] && count <= this.range[ 1 ]; },
    },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'uniqueSeriesCount',
      key         : 'series-count',
      label       : 'Number of series',
      tippy       : 'How many different series they have published',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 1,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.uniqueSeriesCount || 0 );
        return max ? ( max.uniqueSeriesCount || 1 ) : 1;
      },
      condition   : function ( item ) { const count = item.uniqueSeriesCount || 0; return count >= this.range[ 0 ] && count <= this.range[ 1 ]; },
    },
  ],
  sort: [
    { type: 'divider', key: 'divider-cross-ref' },
    { active: false, current: false, key: 'uniqueAuthorsCount',   label: 'Number of authors',   type: 'sort', tippy: 'How many unique authors they publish', statContent: ( item ) => item.uniqueAuthorsCount || '-' },
    { active: false, current: false, key: 'uniqueNarratorsCount', label: 'Number of narrators', type: 'sort', tippy: 'How many unique narrators they have used', statContent: ( item ) => item.uniqueNarratorsCount || '-' },
    { active: false, current: false, key: 'uniqueSeriesCount',    label: 'Number of series',    type: 'sort', tippy: 'How many different series they have published', statContent: ( item ) => item.uniqueSeriesCount || '-' },
  ],
};

// SERIES
export const seriesConfig = {
  bookProp            : 'series',
  label               : 'series',
  icon                : 'layer-group',
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
    { active: true, key: 'authors.name',    alias: 'authors',    label: 'authors',    icon: 'user-pen',   tippy: 'Search series by authors',    weight: 1 },
    { active: true, key: 'narrators.name',  alias: 'narrators',  label: 'narrators',  icon: 'microphone', tippy: 'Search series by narrators',  weight: 1 },
    { active: true, key: 'publishers.name', alias: 'publishers', label: 'publishers', icon: 'building',   tippy: 'Search series by publishers', weight: 1 },
  ],

  sort: [
    { key: 'name',   tippy: 'Sort by series name' },
    { key: 'amount', label: 'Owned books in series', order: 40 },
    {
      excludeFromWishlist: true, active: false, current: false, key: 'amountTotal', label: 'Total books in series', type: 'sort', order: 41,
      tippy      : 'Total number of books in the series, including ones you do not own',
      statContent: ( item ) => item.allBooksMinusDupes ? item.allBooksMinusDupes.length : ( item.allBooks ? item.allBooks.length : '-' ),
    },
    { excludeFromWishlist: true, active: false, current: false, key: 'missing', label: 'Missing', type: 'sort', tippy: 'Number of missing books', order: 42 },
    {
      excludeFromWishlist: true, active: false, current: false, key: 'pctFinishedOfAll', label: 'Finished % (of all books)', type: 'sort', order: 43,
      tippy      : 'Percentage of all books in the series you have finished, including books you do not own',
      statContent: ( item ) => _.isFinite( item.pctFinishedOfAll ) ? `${ item.pctFinishedOfAll }%` : '-',
    },
  ],

  filters: [
    { id: 'bookCount', key: 'inSeries' },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'totalInSeries',
      key         : 'total-in-series',
      label       : 'Total books in series',
      tippy       : 'Total number of books in the series, including ones you do not own',
      order       : 5,
      excludeFromWishlist: true,
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 1,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.allBooks ? item.allBooks.length : 0 );
        return max && max.allBooks ? max.allBooks.length : 1;
      },
      condition   : function ( item ) {
        if ( !item.allBooks ) return false;
        return item.allBooks.length >= this.range[ 0 ] && item.allBooks.length <= this.range[ 1 ];
      },
    },
    { id: 'myRatingMin', excludeFromWishlist: true, tippy: 'Based on the book you rated lowest in the series' },
    {
      active            : false,
      type              : 'filterExtras',
      id                : 'pctFinishedOfAll',
      key               : 'pct-finished-of-all',
      label             : 'Finished % (of all books)',
      tippy             : 'Percentage of all books in the series you have finished, including books you do not own',
      excludeFromWishlist: true,
      order             : 265,
      range             : true,
      rangeMinDist      : 0,
      rangeSuffix       : '%',
      rangeMin          : () => 0,
      rangeMax          : () => 100,
      condition         : function ( item ) {
        if ( item.pctFinishedOfAll == null ) return false;
        return item.pctFinishedOfAll >= this.range[ 0 ] && item.pctFinishedOfAll <= this.range[ 1 ];
      },
    },
    { type: 'divider', key: 'divider-cross-ref' },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'uniqueAuthorsCount',
      key         : 'authors-count',
      label       : 'Number of authors',
      tippy       : 'How many unique authors wrote books in this series',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 1,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.uniqueAuthorsCount || 0 );
        return max ? ( max.uniqueAuthorsCount || 1 ) : 1;
      },
      condition   : function ( item ) { const count = item.uniqueAuthorsCount || 0; return count >= this.range[ 0 ] && count <= this.range[ 1 ]; },
    },
    {
      active      : false,
      type        : 'filterExtras',
      id          : 'uniqueNarratorsCount',
      key         : 'narrators-count',
      label       : 'Number of narrators',
      tippy       : 'How many unique narrators have narrated books in this series',
      range       : true,
      rangeMinDist: 0,
      rangeSuffix : '',
      rangeMin    : () => 1,
      rangeMax    : () => {
        const max = _.maxBy( store.state.pageCollection, item => item.uniqueNarratorsCount || 0 );
        return max ? ( max.uniqueNarratorsCount || 1 ) : 1;
      },
      condition   : function ( item ) { const count = item.uniqueNarratorsCount || 0; return count >= this.range[ 0 ] && count <= this.range[ 1 ]; },
    },
    {
      excludeFromWishlist: true,
      type: 'divider',
      key: 'series-section-divider',
    },
    {
      excludeFromWishlist: true,
      active: false,
      type: 'filterExtras',
      label: 'Incomplete series',
      key: 'series-incomplete',
      tippy: "Series where I don't own all the books",
      condition: function ( series ) {
        return series.allBooksMinusDupes.length > series.books.length;
      },
    },
    {
      excludeFromWishlist: true,
      type: 'divider',
      key: 'series-missing-divider',
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
          books      : [],
          bookObjects: [],
          added      : addedCounter++,
          name       : series.name,
          asin       : series.asin,
          authors    : book.authors,
          narrators  : book.narrators,
          publishers : book.publishers,
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
        }

        currentObj.books.push( book.title || book.shortTitle );
        currentObj.bookObjects.push( book );

        if ( !seriesAdded ) seriesCollection.push( currentObj );

      } );
    } );

    _.reverse( seriesCollection );
    addRatingFields( seriesCollection );
    return seriesCollection;

  },
};
