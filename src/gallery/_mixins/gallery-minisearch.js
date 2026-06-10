// Single search engine for the gallery, replacing Fuse. MiniSearch gives consistent
// multi-key matching, long-text (summary/blurb) search, and most importantly a
// deterministic include/exclude across all keys at once (Fuse's exclude behaved
// inconsistently across multiple keys).
//
// Books are indexed by asin. Nested scope keys like 'authors.name' are flattened to
// a searchable string via extractField. The index is rebuilt when the underlying
// collection changes; querying against it is cheap per keystroke.

import MiniSearch from 'minisearch';

// Every scope key the search UI can enable. Must cover listRenderingOpts.scope keys.
// Order doesn't matter; boosts come from the active scope weights at query time.
const SEARCH_FIELDS = [
  'title',
  'authors.name',
  'narrators.name',
  'series.name',
  'categories.name',
  'tags.name',
  'publishers.name',
  'blurb',
  'summary',
  'asin',
];

// Pulls a scope key off a book as a flat string. Handles nested array keys
// ('authors.name' -> "Name One Name Two") and plain keys ('title', 'summary').
function extractField( book, fieldKey ) {

  if ( !_.includes( fieldKey, '.' ) ) {
    return book[ fieldKey ] ?? '';
  }

  // Nested 'collection.prop' (authors.name, series.name, ...).
  const [ collectionKey, prop ] = fieldKey.split('.');
  const collection = book[ collectionKey ];
  if ( !collection ) return '';

  return _.map( _.castArray( collection ), prop ).filter( Boolean ).join(' ');

}

export default {

  data: function() {
    return {
      miniSearch: null,
      // The collection the current index was built from, so we can tell when to rebuild.
      miniSearchSource: null,
    };
  },

  methods: {

    // Builds (or rebuilds) the MiniSearch index for a collection of books. Cheap to
    // call repeatedly: skips the rebuild when the same collection reference is passed.
    buildSearchIndex: function( books ) {

      if ( this.miniSearch && this.miniSearchSource === books ) return this.miniSearch;

      const miniSearch = new MiniSearch({
        idField: 'asin',
        fields: SEARCH_FIELDS,
        // Keep the whole book object on the result so callers can use it directly.
        storeFields: ['__book'],
        extractField: ( doc, fieldKey ) => {
          if ( fieldKey === 'asin' )   return doc.asin ?? '';
          if ( fieldKey === '__book' ) return doc.__book;
          return extractField( doc, fieldKey );
        },
      });

      // MiniSearch needs each doc to carry its id field and we stash the original book
      // under __book so results map straight back without a second lookup.
      const docs = _.map( books, ( book ) => ({ asin: book.asin, __book: book, ...book }) );
      miniSearch.addAll( docs );

      this.miniSearch = miniSearch;
      this.miniSearchSource = books;

      return miniSearch;

    },

    // Parses a raw query into MiniSearch terms plus exclude terms.
    //   "space -sun -moon"  ->  { include: "space", exclude: ['sun','moon'] }
    // Exclude is the operator that mattered: it must remove matches across ALL keys.
    parseSearchQuery: function( raw ) {

      const tokens = _.compact( ( raw || '' ).trim().split(/\s+/) );

      const exclude = [];
      const include = [];

      _.each( tokens, ( token ) => {
        if ( token.length > 1 && token[0] === '-' ) {
          exclude.push( token.slice(1).toLowerCase() );
        }
        else {
          include.push( token );
        }
      });

      return { include: include.join(' '), exclude };

    },

    // Runs a search against the active scope keys. Returns book objects, ranked.
    //   query       raw user input (may contain -exclude terms)
    //   activeKeys  [{ name, weight }] from the active scope (aliciaKeys)
    //   opts.keepCollectionOrder  when true, return matches in the collection's
    //                             existing (sorted) order instead of relevance rank.
    miniSearchRun: function( books, query, activeKeys, opts = {} ) {

      const miniSearch = this.buildSearchIndex( books );
      const { include, exclude } = this.parseSearchQuery( query );

      // Only search the fields the user currently has enabled, weighted by scope.
      const fields = _.map( activeKeys, 'name' );
      const boost  = _.reduce( activeKeys, ( acc, k ) => {
        acc[ k.name ] = k.weight || 1;
        return acc;
      }, {} );

      // Nothing to match on (e.g. query is only exclude terms): return everything,
      // then let the exclude filter below trim it. Mirrors "show all, minus excluded".
      let results;
      if ( include ) {
        results = miniSearch.search( include, {
          fields,
          boost,
          prefix: true,
          // Edit-distance typo tolerance: up to 30% of the term length, capped at 4
          // edits so short words stay tight while longer titles tolerate real typos.
          fuzzy: 0.3,
          maxFuzzy: 4,
          combineWith: 'AND',
        });
      }
      else if ( exclude.length ) {
        results = _.map( books, ( book ) => ({ __book: book }) );
      }
      else {
        return [];
      }

      let mapped = _.map( results, '__book' );

      // Exclude: drop any book whose searched fields contain an excluded term. Checked
      // across every active field at once, so exclude is consistent (the Fuse fix).
      if ( exclude.length ) {
        mapped = _.filter( mapped, ( book ) => {
          const haystack = _.map( fields, ( f ) => extractField( book, f ) ).join(' ').toLowerCase();
          return !_.some( exclude, ( term ) => _.includes( haystack, term ) );
        });
      }

      // When a user sort is in effect, present matches in the collection's existing
      // order rather than relevance rank.
      if ( opts.keepCollectionOrder ) {
        const matchedAsins = new Set( _.map( mapped, 'asin' ) );
        return _.filter( books, ( book ) => matchedAsins.has( book.asin ) );
      }

      return mapped;

    },

    // Drops the cached index, forcing a rebuild on the next search. Call when the
    // underlying book data changes in place (e.g. summaries hydrated onto books).
    resetSearchIndex: function() {
      this.miniSearch = null;
      this.miniSearchSource = null;
    },

  },

};
