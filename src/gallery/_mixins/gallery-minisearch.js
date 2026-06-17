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

// Aliases for @scope:searchQueries,can,be,comma,separated (no spaces) → @summary:mark,watney
const FIELD_ALIASES = {
  title:     'title',
  author:    'authors.name',
  authors:   'authors.name',
  narrator:  'narrators.name',
  narrators: 'narrators.name',
  series:    'series.name',
  category:  'categories.name',
  categories:'categories.name',
  tag:       'tags.name',
  tags:      'tags.name',
  publisher: 'publishers.name',
  publishers:'publishers.name',
  blurb:     'blurb',
  summary:   'summary',
  asin:      'asin',
};

// Alternation of every alias, for the @-field-query regex. Longer aliases first so
// 'authors' wins over 'author' (regex alternation is left-biased).
const FIELD_ALIAS_GROUP = _( FIELD_ALIASES ).keys().sortBy( ( k ) => -k.length ).join('|');

// The aliases offered in the '@'-autocomplete dropdown, one row per scope key. Several
// aliases map to the same key (author / authors); we surface only the plural form the
// user is most likely to mean, in scope order, so the menu reads like the scope list
// rather than listing every synonym. Each row carries the canonical alias to insert and
// a label/icon for display. Icons are FontAwesome-solid (the gallery's existing set).
const FIELD_SUGGESTIONS = [
  { key: 'title',           alias: 'title',     label: 'Title',     icon: 'title' },
  { key: 'authors.name',    alias: 'authors',   label: 'Authors',   icon: 'user-pen' },
  { key: 'narrators.name',  alias: 'narrators', label: 'Narrators', icon: 'microphone' },
  { key: 'series.name',     alias: 'series',    label: 'Series',    icon: 'layer-group' },
  { key: 'categories.name', alias: 'categories', label: 'Categories', icon: 'folder' },
  { key: 'tags.name',       alias: 'tags',      label: 'Tags',      icon: 'tag' },
  { key: 'publishers.name', alias: 'publishers', label: 'Publishers', icon: 'building' },
  { key: 'blurb',           alias: 'blurb',     label: 'Blurb',     icon: 'align-left' },
  { key: 'summary',         alias: 'summary',   label: 'Summary',   icon: 'file-lines' },
  { key: 'asin',            alias: 'asin',      label: 'ASIN',      icon: 'hashtag' },
];

// Pulls a scope key off a book as the list of its individual values. A plain key
// ('title', 'summary') yields a single-element list; a nested array key ('authors.name',
// 'tags.name') yields one element PER item. Keeping items separate matters for matching:
// joining tags into one string would let a phrase like "urban fantasy" match across two
// unrelated tags ("gritty urban" + "fantasy world"). Callers join only when they want
// that cross-item behavior (the MiniSearch index does; the cell matcher does not).
function extractFieldItems( book, fieldKey ) {

  if ( !_.includes( fieldKey, '.' ) ) {
    const value = book[ fieldKey ];
    return value ? [ value ] : [];
  }

  // Nested 'collection.prop' (authors.name, series.name, ...).
  const [ collectionKey, prop ] = fieldKey.split('.');
  const collection = book[ collectionKey ];
  if ( !collection ) return [];

  return _.map( _.castArray( collection ), prop ).filter( Boolean );

}

// Pulls a scope key off a book as a single flat string (items space-joined). Used for
// the MiniSearch index, where cross-item matching for candidate gathering is fine.
function extractField( book, fieldKey ) {
  return extractFieldItems( book, fieldKey ).join(' ');
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

    // Reads the text immediately left of the caret and, when it sits on an unfinished
    // '@field' token, returns the autocomplete state for the dropdown. Returns null when
    // the caret is not on such a token (no '@', already past the colon, or interrupted by
    // a space). The token starts at the last '@' that is at the string start or right
    // after whitespace, and runs to the caret; a colon inside it means the field is
    // already chosen, so no suggestions.
    //   'jim @aut' , caret at end  ->  { typed: 'aut', start: 4, end: 8, suggestions: [...] }
    //   'jim @author:weir'         ->  null (past the colon)
    fieldSuggestState: function( text, caret ) {

      const before = ( text || '' ).slice( 0, caret );
      const at     = before.lastIndexOf('@');
      if ( at < 0 ) return null;
      // The '@' only starts a field token at the string start or after whitespace.
      if ( at > 0 && !/\s/.test( before[ at - 1 ] ) ) return null;
      // The fragment between '@' and the caret; a space or colon means it's no longer an
      // open field name being typed.
      const typed = before.slice( at + 1 );
      if ( /[\s:]/.test( typed ) ) return null;

      const lower       = typed.toLowerCase();
      const suggestions = _.filter( FIELD_SUGGESTIONS, ( s ) => _.startsWith( s.alias, lower ) );
      if ( !suggestions.length ) return null;

      return { typed, start: at, end: caret, suggestions };

    },

    // Splits a raw query into tokens, keeping "quoted phrases" together as one token.
    // Leading operators (-, ^) and the trailing $ ride along on their token so the
    // parser can read them off afterwards.
    //   '^"Mark Watney" -moon base$'  ->  ['^"Mark Watney"', '-moon', 'base$']
    tokenizeSearchQuery: function( raw ) {

      // Match either a (possibly field- and operator-prefixed) "quoted phrase" with an
      // optional trailing $, or a run of non-space characters. The quoted alternative
      // comes first so spaces inside quotes don't split the phrase. Prefixes that ride
      // along on a quoted phrase: an optional '@field:' then an operator, including the
      // doubled whole-item forms (-- ==), so @author:"jim butcher", @tag:-"sci fi" and
      // @tag:=="science fiction" all stay single tokens.
      const matches = ( raw || '' ).match(/(?:@[a-z]+:)?(?:={1,3}|\+{1,3}|-{1,3}|\^)?"[^"]*"\$?|\S+/gi);

      return matches || [];

    },

    // Classifies a single token into a typed term. Reads an optional 'field:' prefix
    // (which overrides the active scopes for this term), then any leading/trailing
    // operator, and lowercases/unquotes the value so matching is case-insensitive.
    //   '-sun'              -> { type: 'exclude',    value: 'sun' }
    //   '=exact'            -> { type: 'exact',      value: 'exact' }   ( + is an alias )
    //   '^bran'             -> { type: 'startsWith', value: 'bran' }
    //   'weir$'             -> { type: 'endsWith',   value: 'weir' }
    //   '"the martian"'     -> { type: 'phrase',     value: 'the martian' }
    //   'space'             -> { type: 'plain',      value: 'space' }
    //   '@author:"jim b"'   -> { type: 'phrase',     value: 'jim b', fieldKey: 'authors.name' }
    //   '@tag:-scifi'       -> { type: 'exclude',    value: 'scifi', fieldKey: 'tags.name' }
    // Operators compose with quotes: ^"foo bar", "foo bar"$, -"foo bar", ="foo bar".
    classifyTerm: function( token ) {

      // FIELD PREFIX: '@alias:value'. Only an '@'-prefixed recognized alias is a field
      // query; this is what keeps titles safe. A bare 'summary:murder' (no @), a colon
      // inside a quoted phrase, or a stylized 'Warlock:' all stay literal text, because
      // a book title never starts a word with '@alias:'. The '@'-list expansion (in
      // expandFieldQueries) has already split any comma list, so here the value is a
      // single member. Peel the '@alias:' off so the operator logic runs on the value.
      let fieldKey = null;
      if ( token[0] === '@' ) {
        const colon = token.indexOf(':');
        // 'colon > 1' needs a non-empty alias before it. A trailing colon with nothing
        // after ('@authors:') is a field the user has chosen but not yet given a value,
        // so it's an incomplete term, not a search: peel the prefix and let the empty
        // value drop out below, rather than fuzzy-searching the alias word itself.
        if ( colon > 1 ) {
          const alias = token.slice( 1, colon ).toLowerCase();
          if ( FIELD_ALIASES[ alias ] ) {
            fieldKey = FIELD_ALIASES[ alias ];
            token = token.slice( colon + 1 );
          }
        }
      }

      // A recognized field with no value yet ('@authors:'): nothing to match on, so emit
      // no term. The caller drops null terms, so a half-typed field query matches nothing
      // (it neither narrows nor widens the results) until a value is typed.
      if ( fieldKey && token === '' ) return null;

      const term = this.classifyBareTerm( token );
      if ( fieldKey ) term.fieldKey = fieldKey;

      return term;

    },

    // Inspects a leading run of the given operator chars. Returns { tier, run } where
    // 'run' is how many operator chars actually lead the token and 'tier' is that capped
    // at 3 (the deepest tier: 1 substring / 2 whole-word / 3 whole-value). Returns null
    // when there's no leading operator or no value left after it (so a bare '==' is not
    // an operator). The whole run is stripped from the value, so '====war' reads as tier
    // 3 on 'war' rather than leaving a stray '='.
    leadingOperator: function( token, chars ) {

      let run = 0;
      while ( run < token.length && _.includes( chars, token[ run ] ) ) run++;

      if ( run < 1 || run >= token.length ) return null;

      return { tier: Math.min( run, 3 ), run };

    },

    // Classifies a token that has already had any 'field:' prefix removed.
    classifyBareTerm: function( token ) {

      // INCLUDE / EXCLUDE tiers. Repeating the operator tightens the match by one level:
      //   =  substring   ==  whole word        ===  whole value
      //   -  substring   --  whole word         ---  whole value
      // '+' is an alias of '=' at every tier ( +, ++, +++ ). 'whole word' means the term
      // appears as a complete space-delimited word inside a value ('==war' matches the
      // value 'my war lock' but not 'warlock'); 'whole value' means the value IS the term
      // exactly. Longer runs are checked first so the tightest form wins.
      const inc = this.leadingOperator( token, [ '=', '+' ] );
      if ( inc ) {
        const value = this.unquoteTerm( token.slice( inc.run ) );
        if ( inc.tier === 1 ) return { type: 'exact', value };
        if ( inc.tier === 2 ) return { type: 'exactWord', value };
        return { type: 'exactValue', value };
      }
      const exc = this.leadingOperator( token, [ '-' ] );
      if ( exc ) {
        const value = this.unquoteTerm( token.slice( exc.run ) );
        if ( exc.tier === 1 ) return { type: 'exclude', value };
        if ( exc.tier === 2 ) return { type: 'excludeWord', value };
        return { type: 'excludeValue', value };
      }
      // STARTS WITH: ^word or ^"phrase"
      if ( token.length > 1 && token[0] === '^' ) {
        return { type: 'startsWith', value: this.unquoteTerm( token.slice(1) ) };
      }
      // ENDS WITH: word$ or "phrase"$
      if ( token.length > 1 && token[ token.length - 1 ] === '$' ) {
        return { type: 'endsWith', value: this.unquoteTerm( token.slice( 0, -1 ) ) };
      }
      // PHRASE: "phrase" with no anchor (words must appear adjacent).
      if ( token.length > 1 && token[0] === '"' && token[ token.length - 1 ] === '"' ) {
        return { type: 'phrase', value: this.unquoteTerm( token ) };
      }
      // Plain fuzzy/prefix include word.
      return { type: 'plain', value: this.unquoteTerm( token ) };

    },

    // Expands every '@alias:' field query in the raw string into one '@alias:member'
    // token per comma-separated member, pre-tokenizing. This is what lets a single
    // '@alias:' carry a list:
    //   '@tag:a,b,-c'  ->  '@tag:a @tag:b @tag:-c'
    // So a comma list means AND (each member becomes its own AND-cell downstream), with
    // '-' members peeling off as their own excludes. The list runs to the first UNQUOTED
    // space, so '@tag:a,b author x' ends the list at the space ('author x' stays its own
    // terms), and a quoted member protects its spaces ('@tag:a,"what about",b'). Only
    // '@'-prefixed recognized aliases are touched; a bare 'summary:murder' is left alone
    // as literal text, which is what keeps colon-bearing titles safe.
    expandFieldQueries: function( raw ) {

      // @alias : then a comma-joined run of members, each member an optional '-' plus a
      // quoted string or a run of non-space, non-comma chars. The run stops at a space.
      const member = '-?(?:"[^"]*"|[^\\s,]+)';
      const re = new RegExp( '@(' + FIELD_ALIAS_GROUP + '):(' + member + '(?:,' + member + ')*)', 'gi' );

      return ( raw || '' ).replace( re, ( match, alias, list ) => {
        // Split the list on commas outside quotes into individual members.
        const members = list.match(/(?:"[^"]*"|[^,])+/g) || [];
        return _.map( members, ( m ) => '@' + alias + ':' + m ).join(' ');
      });

    },

    // Parses a raw query into OR-groups (each an AND-list of terms) plus a flat list of
    // exclude terms.
    //
    // Spaces mean AND; '|' OR's its neighbouring terms into one cell (flat, Fuse-style,
    // left to right). AND binds tighter than OR (the Fuse precedence): '|' separates the
    // query into whole AND-groups, and a book matches when ANY group fully matches. So
    // 'a b | c d' is '(a AND b) OR (c AND d)' -- the '|' divides two complete sub-queries,
    // not just its two neighbouring words. Exclude (-) is never part of a group, it's
    // always pulled out as a global filter applied on top of whichever group matched.
    //   'storm front | "adam binder" -abridged'
    //     -> groups:  [ [storm, front], ["adam binder"] ]   (each group is AND'd)
    //        exclude: [ abridged ]
    // Also returns 'includeWords' (every positive word/phrase) so the candidate search
    // can be a broad OR before the groups trim it down.
    parseSearchQuery: function( raw ) {

      const tokens  = this.tokenizeSearchQuery( this.expandFieldQueries( raw ) );
      const groups  = [ [] ];
      const exclude = [];

      _.each( tokens, ( token ) => {

        // '|' starts a new AND-group.
        if ( token === '|' ) {
          groups.push( [] );
          return;
        }

        const term = this.classifyTerm( token );

        // An incomplete term (a field chosen but not yet given a value, '@authors:')
        // classifies to null: skip it so it neither matches nor breaks the group.
        if ( !term ) return;

        // Exclude (any tier: substring / whole-word / whole-value) is global, never part
        // of a group.
        if ( term.type === 'exclude' || term.type === 'excludeWord' || term.type === 'excludeValue' ) {
          exclude.push( term );
          return;
        }

        _.last( groups ).push( term );

      });

      // Drop empty groups (e.g. a stray '|' or a group that held only excludes).
      const nonEmptyGroups = _.filter( groups, ( g ) => g.length );

      // Every positive word/phrase, for the broad candidate search up front.
      const includeWords = _.map( _.flatten( nonEmptyGroups ), 'value' );

      return { groups: nonEmptyGroups, exclude, includeWords };

    },

    // Reduces text to space-separated lowercase words for word-boundary matching:
    // lowercases, then turns every run of non-alphanumeric characters (punctuation,
    // and any whitespace including non-breaking spaces) into a single space, and trims.
    // This is what makes the boundary checks robust. Scraped Audible titles glue
    // punctuation to words ('Warlock:', 'Novels,') and use non-breaking spaces, so a
    // raw ' word ' test would silently miss. Matching the fuzzy index's own tokenizing,
    // 'White Trash Warlock: The Adam Binder Novels, Book 1' becomes
    // 'white trash warlock the adam binder novels book 1', so =warlock now matches.
    normalizeText: function( text ) {
      return ( text || '' ).toLowerCase().replace( /[^\p{L}\p{N}]+/gu, ' ' ).trim();
    },

    // Strips wrapping double quotes (if present) then normalizes the term the same way
    // as the field haystack, so operator matching is case-insensitive, quote-agnostic,
    // and punctuation/whitespace line up on both sides of the comparison.
    unquoteTerm: function( term ) {

      let value = term || '';
      if ( value.length > 1 && value[0] === '"' && value[ value.length - 1 ] === '"' ) {
        value = value.slice( 1, -1 );
      }

      return this.normalizeText( value );

    },

    // Tests a single typed term against a book. The fields searched are the term's own
    // 'field:' override when present, otherwise the active scope fields.
    //   getFieldItems( fieldKeys )  returns the flat list of normalized item-strings for
    //                               a book (one per tag/author, etc.), cached.
    //   activeFields                the active scope fields, used when the term has no
    //                               field override.
    // Matching is per item, so a phrase or start/end test never spans two unrelated
    // values (e.g. "urban fantasy" won't match across the tags "gritty urban" + "fantasy
    // world"). Each item is anchored on its own.
    termMatches: function( term, getFieldItems, activeFields ) {

      const fieldKeys = term.fieldKey ? [ term.fieldKey ] : activeFields;
      const items     = getFieldItems( fieldKeys );

      // WHOLE-VALUE INCLUDE (===): an item must EQUAL the term exactly (the whole tag,
      // author, etc), not merely contain it.
      if ( term.type === 'exactValue' ) {
        return _.some( items, ( v ) => v === term.value );
      }
      // WHOLE-WORD INCLUDE (==): the term must appear as a complete space-delimited word
      // inside an item ('war' in 'my war lock', but not inside 'warlock').
      if ( term.type === 'exactWord' ) {
        return _.some( items, ( v ) => this.containsWholeWord( v, term.value ) );
      }
      // STARTS WITH: at least one item must begin with the term.
      if ( term.type === 'startsWith' ) {
        return _.some( items, ( v ) => _.startsWith( v, term.value ) );
      }
      // ENDS WITH: at least one item must end with the term.
      if ( term.type === 'endsWith' ) {
        return _.some( items, ( v ) => _.endsWith( v, term.value ) );
      }
      // EXACT, PLAIN and PHRASE all come down to "does some item contain this literal
      // string". EXACT (= / +) is a literal substring with no fuzzy/prefix, so a copied
      // fragment finds its book; PHRASE enforces adjacency within a single item via that
      // containment; PLAIN here is the post-filter fallback for non-simple queries.
      return _.some( items, ( v ) => _.includes( v, term.value ) );

    },

    // True when 'term' appears as a complete space-delimited word (or run of words)
    // inside 'value'. Both are already normalized to single-spaced words, so padding
    // each with spaces turns a whole-word test into a simple substring check on the
    // padded strings: ' war ' is in ' my war lock ' but not in ' warlock '.
    containsWholeWord: function( value, term ) {
      return _.includes( ' ' + value + ' ', ' ' + term + ' ' );
    },

    // Runs a search against the active scope keys. Returns book objects, ranked.
    //   query       raw user input. Plain words are fuzzy/prefix includes; operators:
    //                 -term / -"phrase"   exclude
    //                 ^term / ^"phrase"   a field starts with term/phrase
    //                 term$ / "phrase"$   a field ends with term/phrase
    //                 =term / +term       exact literal substring (no fuzzy/prefix)
    //                 "phrase"            words must appear adjacent
    //                 a b | c d           OR of AND-groups: (a AND b) OR (c AND d)
    //                 @field:a,b,-c       search only that field (overrides scopes);
    //                                     comma list = AND, '-' member excludes, runs to
    //                                     first unquoted space, composes with operators
    //   activeKeys  [{ name, weight }] from the active scope (aliciaKeys)
    //   opts.keepCollectionOrder  when true, return matches in the collection's
    //                             existing (sorted) order instead of relevance rank.
    miniSearchRun: function( books, query, activeKeys, opts = {} ) {

      const miniSearch = this.buildSearchIndex( books );
      const { groups, exclude, includeWords } = this.parseSearchQuery( query );

      // The active scope fields, weighted by scope. Unprefixed terms search these.
      const fields = _.map( activeKeys, 'name' );
      const boost  = _.reduce( activeKeys, ( acc, k ) => {
        acc[ k.name ] = k.weight || 1;
        return acc;
      }, {} );

      // Candidate search fields: the active fields PLUS every field a 'field:' prefix
      // targets. A field-scoped term overrides the active scopes, so its field must be
      // searched for candidates even when that scope is toggled off (otherwise the group
      // filter never sees those books, the bug where tags:"..." found nothing with tags
      // disabled, or skewed results from whatever scopes happened to be on).
      const prefixedFields = _.compact( _.uniq( _.map( _.flatten( groups ).concat( exclude ), 'fieldKey' ) ) );
      const candidateFields = _.union( fields, prefixedFields );

      // A "simple" query is the common case: a single AND-group of plain words, no OR and
      // no operator terms (=, ^, $, phrase, field). There we let MiniSearch do the
      // matching so its fuzzy/prefix typo tolerance is preserved. Anything with OR or an
      // operator term drops to substring-based group filtering, where fuzzy doesn't apply.
      const isSimpleQuery = !exclude.length
        && groups.length === 1
        && _.every( groups[0], ( term ) => term.type === 'plain' && !term.fieldKey );

      // Candidate set from MiniSearch. Simple queries AND the words (the real match);
      // otherwise it runs a broad OR purely to gather candidates and the cell logic
      // below does the real AND/OR/operator filtering. With no positive words (query is
      // only excludes) we start from every book.
      let results;
      if ( includeWords.length ) {
        results = miniSearch.search( includeWords.join(' '), {
          fields: candidateFields,
          boost,
          prefix: true,
          // Edit-distance typo tolerance, decided per term. Short words are skipped: a
          // 1-2 edit allowance is a big fraction of a short word, so a single common one
          // (like 'martian') fans out into dozens of loose matches. Words of 5+ chars get
          // a 20% allowance (capped at 4 edits), which still catches real typos in longer
          // titles and names without dragging in the noise.
          fuzzy: ( term ) => ( term.length >= 5 ? 0.2 : false ),
          maxFuzzy: 4,
          combineWith: isSimpleQuery ? 'AND' : 'OR',
        });
      }
      else if ( exclude.length ) {
        results = _.map( books, ( book ) => ({ __book: book }) );
      }
      else {
        return [];
      }

      let mapped = _.map( results, '__book' );

      // Simple queries are fully matched by MiniSearch above, so skip group filtering
      // (which would re-check by substring and strip fuzzy matches). Everything else gets
      // group + exclude filtering: a book passes when ANY AND-group fully matches (every
      // term in that group matches) and no exclude hits.
      if ( !isSimpleQuery && ( groups.length || exclude.length ) ) {
        mapped = _.filter( mapped, ( book ) => {

          // Per-book cache of a field's normalized item-strings, keyed by field key.
          // Each tag/author/etc. stays a separate item so matching never bleeds across
          // values. Normalizing (lowercase, punctuation/whitespace to single spaces)
          // keeps substring and start/end checks reliable even when items glue
          // punctuation to words or use non-breaking spaces. Empty items are dropped.
          // Cached so a term's field set is extracted once per book.
          const fieldCache = {};
          const fieldItems = ( f ) => {
            if ( !( f in fieldCache ) ) {
              fieldCache[ f ] = _.compact( _.map( extractFieldItems( book, f ), ( v ) => this.normalizeText( v ) ) );
            }
            return fieldCache[ f ];
          };
          const getFieldItems = ( fieldKeys ) => _.flatMap( fieldKeys, fieldItems );

          // EXCLUDE: drop the book if any excluded term hits an item in its searched
          // fields (its own 'field:' override, or the active fields when unscoped). The
          // three tiers mirror the include side: '-' substring, '--' whole word, '---'
          // whole value.
          const excluded = _.some( exclude, ( t ) => {
            const fieldKeys = t.fieldKey ? [ t.fieldKey ] : fields;
            const items     = getFieldItems( fieldKeys );
            if ( t.type === 'excludeValue' ) return _.some( items, ( v ) => v === t.value );
            if ( t.type === 'excludeWord' )  return _.some( items, ( v ) => this.containsWholeWord( v, t.value ) );
            return _.some( items, ( v ) => _.includes( v, t.value ) );
          });
          if ( excluded ) return false;

          // At least one AND-group must fully match: every term in that group matches
          // (OR of ANDs). With no positive groups (query was only excludes), an empty
          // groups list means "everything passes the include test".
          const groupsPass = !groups.length || _.some( groups, ( group ) => {
            return _.every( group, ( term ) => this.termMatches( term, getFieldItems, fields ) );
          });
          if ( !groupsPass ) return false;

          return true;

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

    // Locates the plain word the caret sits on, for autosuggest. Returns the word and
    // its [start, end) slice in the raw query, or null when the caret is not on a
    // suggestable word. A word is the run of non-space characters around the caret. It is
    // NOT suggestable when it is empty, carries a leading operator (-, ^, =, +) or trailing
    // $, or is part of an '@field' token (starts with '@', or any earlier word in the
    // query is an unfinished '@alias:...' the caret's word belongs to). Operator and
    // '@field' / operator tokens get their own handling (or none) elsewhere; here we only
    // complete a plain fragment.
    //   'dresd', caret at end          ->  { typed: 'dresd', start: 0, end: 5 }
    //   'storm front | jim but', end   ->  { typed: 'jim but', start: 14, end: 21 }
    //   '@tags:re', caret at end       ->  null  ('@field' token)
    //   '="wa', caret at end           ->  null  (operator token)
    //
    // The fragment is the trailing run from the last segment boundary up to the caret. A
    // boundary is the query start or a '|' (OR). Spaces do NOT break the fragment, so a
    // multi-word value like 'jim but' stays one fragment and can complete to 'Jim Butcher'.
    suggestFragmentAt: function( raw, caret ) {

      const before = ( raw || '' ).slice( 0, caret );

      // Back up to just after the last '|' (the current OR-segment), then left-trim.
      const bar   = before.lastIndexOf('|');
      const segStart = bar < 0 ? 0 : bar + 1;
      const segment  = before.slice( segStart );
      const trimmed  = segment.replace( /^\s+/, '' );
      const start    = segStart + ( segment.length - trimmed.length );
      const typed    = trimmed;

      // Empty (caret on whitespace after a boundary): nothing to complete.
      if ( !typed ) return null;

      // An '@field' or operator-prefixed fragment is not a plain value fragment. Bail so
      // those keep their own (or no) handling. A trailing '$' is the ends-with operator.
      if ( typed[0] === '@' ) return null;
      if ( /^[-^=+]/.test( typed ) ) return null;
      if ( typed[ typed.length - 1 ] === '$' ) return null;

      return { typed, start, end: caret };

    },

    // The distinct values of a field across all books, with their normalized form for
    // matching and original-cased text for display. Cached per (source, field) so the
    // gather runs once. Multi-value fields (tags, authors, ...) contribute one entry per
    // item; an empty normalized form is dropped.
    //   fieldValues(books, 'series.name')  ->  [{ display:'Dresden Files', norm:'dresden files' }, ...]
    fieldValues: function( books, fieldKey ) {

      if ( !this.fieldValueCache || this.fieldValueSource !== books ) {
        this.fieldValueCache  = {};
        this.fieldValueSource = books;
      }
      if ( this.fieldValueCache[ fieldKey ] ) return this.fieldValueCache[ fieldKey ];

      const seen   = new Set();
      const values = [];
      _.each( books, ( book ) => {
        _.each( extractFieldItems( book, fieldKey ), ( item ) => {
          const norm = this.normalizeText( item );
          if ( !norm || seen.has( norm ) ) return;
          seen.add( norm );
          values.push({ display: item, norm });
        });
      });

      this.fieldValueCache[ fieldKey ] = values;
      return values;

    },

    // Returns whole-value completions for the plain fragment under the caret, drawn from
    // the distinct values of the active scope fields. A value matches when the normalized
    // fragment is a prefix of the value, or of any word inside it (so 'jim but' and 'but'
    // both reach 'Jim Butcher', but a mid-word substring does not). Value prefixes rank
    // ahead of word prefixes; within a tier, higher-weighted fields and shorter values
    // come first, so the tightest, most-scoped value wins. Returns the display strings
    // (original case) to splice over [start, end), quoted by the caller when multi-word.
    //   { typed, start, end, suggestions: ['Dresden Files', ...] }
    miniSuggest: function( books, query, caret, activeKeys ) {

      const at = this.suggestFragmentAt( query, caret );
      if ( !at ) return null;

      const needle = this.normalizeText( at.typed );
      if ( !needle ) return null;

      // Active fields paired with their scope weight, for ranking.
      const weightOf = _.reduce( activeKeys, ( acc, k ) => {
        acc[ k.name ] = k.weight || 1;
        return acc;
      }, {} );

      // Gather matches across the active fields. Tiers, tightest first:
      //   -1  exact: the value EQUALS the fragment (you typed the whole thing). Kept and
      //       ranked top so accepting it phrase-searches that value, no manual quotes.
      //    0  value-prefix: the value starts with the fragment.
      //    1  word-run: the fragment's words appear as a run inside the value (last word a
      //       prefix), so a fragment crossing a word boundary still matches.
      // Each match keeps the field it came from so the row can be labeled by scope.
      const needleWords = needle.split(' ');
      const matches = [];
      _.each( _.keys( weightOf ), ( fieldKey ) => {
        _.each( this.fieldValues( books, fieldKey ), ( value ) => {
          let tier = null;
          if ( value.norm === needle ) tier = -1;
          else if ( _.startsWith( value.norm, needle ) ) tier = 0;
          else if ( this.wordRunMatches( value.norm, needleWords ) ) tier = 1;
          if ( tier === null ) return;
          matches.push({ display: value.display, norm: value.norm, fieldKey, tier, weight: weightOf[ fieldKey ] });
        });
      });

      // Rank within a scope: exact before value-prefix before word-run, then heavier scope,
      // then shorter value, so the closest whole-value match leads. One row per value
      // (uniqBy display after the sort keeps each value's best-ranked, highest-weighted
      // field). The list is then shared fairly across scopes (see allotByScope), capped at
      // the total budget.
      const ranked = _( matches )
        .orderBy( [ 'tier', ( m ) => -m.weight, ( m ) => m.norm.length ], [ 'asc', 'asc', 'asc' ] )
        .uniqBy( 'display' )
        .value();

      const suggestions = _.map(
        this.allotByScope( ranked, 8 ),
        ( m ) => ({ value: m.display, fieldKey: m.fieldKey })
      );

      return { typed: at.typed, start: at.start, end: at.end, suggestions };

    },

    // Shares a 'limit' budget of rows fairly across the scopes present, round-robin: one
    // row from each scope in turn (scopes ordered by their best row, so the scope holding
    // the top-ranked match leads and an exact match stays row 1), then a second from each,
    // and so on. A scope that runs out drops from the rotation and its slots flow to the
    // others, so 1 series + many titles shows the 1 series and fills the rest with titles,
    // while plenty of both lands roughly half and half. 'ranked' must already be in final
    // within-scope order; this preserves that order inside each scope.
    allotByScope: function( ranked, limit ) {

      // Group into per-scope queues, keeping the input order (so each queue is pre-ranked).
      // The groups are ordered by first appearance in 'ranked', which is global rank order,
      // so the scope with the best overall row rotates first.
      const queues = _.values( _.groupBy( ranked, 'fieldKey' ) );

      const out = [];
      // Round-robin: keep cycling the queues, taking one row from each, until the budget is
      // full or every queue is empty.
      while ( out.length < limit && _.some( queues, ( q ) => q.length ) ) {
        _.each( queues, ( queue ) => {
          if ( out.length >= limit ) return false;
          if ( queue.length ) out.push( queue.shift() );
        });
      }

      return out;

    },

    // True when the needle's words appear as a run of consecutive words anywhere in the
    // value, with every needle word but the last matching a value word exactly and the
    // last being a prefix of its value word. This is what lets a multi-word fragment that
    // spans a word boundary still match: 'dresden fi' (['dresden','fi']) matches the value
    // 'the dresden files' (dresden == dresden, files starts-with fi), even though the value
    // does not start with the fragment and no single word starts with the whole fragment.
    // Both value and needleWords are already normalized to single-spaced lowercase words.
    wordRunMatches: function( value, needleWords ) {

      const valueWords = value.split(' ');
      const last       = needleWords.length - 1;

      // Try each start offset where the run could begin and still fit.
      for ( let offset = 0; offset + needleWords.length <= valueWords.length; offset++ ) {

        let ok = true;
        for ( let i = 0; i < needleWords.length; i++ ) {
          const valueWord  = valueWords[ offset + i ];
          // All but the last needle word must match exactly; the last is a prefix.
          const matches = i < last ? valueWord === needleWords[ i ] : _.startsWith( valueWord, needleWords[ i ] );
          if ( !matches ) {
            ok = false;
            break;
          }
        }
        if ( ok ) return true;

      }

      return false;

    },

    // The display label and icon for a scope field key, for tagging a suggestion row with
    // its scope. Reuses FIELD_SUGGESTIONS (the same labels/icons as the '@field' menu) so
    // the two menus read consistently. Falls back to the bare key when unmapped.
    fieldLabel: function( fieldKey ) {
      const found = _.find( FIELD_SUGGESTIONS, { key: fieldKey } );
      if ( found ) return { label: found.label, icon: found.icon };
      return { label: fieldKey, icon: null };
    },

    // Drops the cached index, forcing a rebuild on the next search. Call when the
    // underlying book data changes in place (e.g. summaries hydrated onto books).
    resetSearchIndex: function() {
      this.miniSearch = null;
      this.miniSearchSource = null;
      this.fieldValueCache = null;
      this.fieldValueSource = null;
    },

  },

};
