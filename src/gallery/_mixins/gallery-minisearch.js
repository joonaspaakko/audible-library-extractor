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

// The '@'-autocomplete vocabulary (which '@alias' the user can type, what field it
// searches, the label/icon for its row) is derived from the active scopes at query time,
// not a static table: each scope carries its own alias/field/label/icon, so adding a scope
// gives it '@' support automatically. buildScopeVocabulary turns a set of active scope keys
// into the two shapes the parser/menu need.
//   activeKeys  [{ name, field, weight, alias, label, icon }]  (aliciaKeys; name = scope key)
//   ->  { aliasToField, suggestions }
//     aliasToField  { authors: 'name', narrators: 'narrators.name', ... }  alias -> searched
//                   field, page-aware (the authors-page namesake 'authors' -> 'name').
//     suggestions   [{ alias, field, label, icon }] one row per scope, for the '@' menu.
function buildScopeVocabulary( activeKeys ) {

  const scopes = _.filter( activeKeys, ( k ) => k.alias );

  const aliasToField = _.reduce( scopes, ( acc, k ) => {
    acc[ k.alias.toLowerCase() ] = k.field || k.name;
    return acc;
  }, {} );

  const suggestions = _.map( scopes, ( k ) => ({
    alias: k.alias,
    field: k.field || k.name,
    label: k.label || k.alias,
    icon : k.icon || null,
  }) );

  return { aliasToField, suggestions };

}

// Pulls a scope key off a book as the list of its individual values. A plain key
// ('title', 'summary') yields a single-element list; a nested array key ('authors.name',
// 'tags.name') yields one element PER item. Keeping items separate matters for matching:
// joining tags into one string would let a phrase like "urban fantasy" match across two
// unrelated tags ("gritty urban" + "fantasy world"). Callers join only when they want
// that cross-item behavior (the MiniSearch index does; the cell matcher does not).
function extractFieldItems( book, fieldKey ) {

  if ( !_.includes( fieldKey, '.' ) ) {
    const value = book[ fieldKey ];
    if ( !value ) return [];
    // A plain key can hold a scalar (title, asin) OR an array of scalars. Sub-page entity
    // collections use the latter: the 'books' scope is an array of title strings, one per
    // book in the series/author/etc. Spread the array into separate items so each is matched
    // on its own; wrapping it ([ value ]) would push a whole array at normalizeText.
    return _.isArray( value ) ? value.filter( Boolean ) : [ value ];
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
      // The indexed field set (space-joined keys) the current index was built with. The
      // field set depends on the active scope (sub pages add entity/'books' fields), so a
      // scope change on the same collection must also trigger a rebuild.
      miniSearchFields: null,
    };
  },

  methods: {

    // Builds (or rebuilds) the MiniSearch index for a collection. Cheap to call
    // repeatedly: skips the rebuild when the same collection AND the same field set come
    // back. activeKeys are the active scope keys; sub-page entity scopes (the entity name,
    // its 'books', ...) live outside the fixed SEARCH_FIELDS, so they are unioned in here
    // and indexed too. Passing [] (or omitting) just indexes SEARCH_FIELDS, the library case.
    buildSearchIndex: function( books, activeKeys ) {

      // The field set: the fixed library fields plus whatever the active scope references,
      // so every searchable scope on the current page actually gets an index. A scope key's
      // searched field is 'field' (differs from display 'name' for entity scopes).
      const fields = _.union( SEARCH_FIELDS, _.map( activeKeys, ( k ) => k.field || k.name ) );
      const fieldsKey = fields.join(' ');

      // Same collection and same field set: the cached index is still valid.
      if ( this.miniSearch && this.miniSearchSource === books && this.miniSearchFields === fieldsKey ) {
        return this.miniSearch;
      }

      const miniSearch = new MiniSearch({
        idField: '__uid',
        fields: fields,
        // Keep the whole book object on the result so callers can use it directly.
        storeFields: ['__book'],
        extractField: ( doc, fieldKey ) => {
          if ( fieldKey === '__uid' )  return doc.__uid;
          if ( fieldKey === '__book' ) return doc.__book;
          return extractField( doc, fieldKey );
        },
      });

      // MiniSearch needs a unique id per doc, but the value is never read back (results map
      // to the original via the stored __book), so the loop index is the safest id: always
      // unique, regardless of collection shape. Real ids are unreliable here. Books have a
      // unique 'asin', but sub-page entities (authors, narrators, ...) have none, and their
      // 'url' is a (non-unique) source ASIN that two authors can share, so keying on it
      // collided ('duplicate ID'). The index sidesteps all of that.
      const docs = _.map( books, ( book, index ) => ({
        ...book,
        __uid: index,
        __book: book,
      }) );
      miniSearch.addAll( docs );

      this.miniSearch = miniSearch;
      this.miniSearchSource = books;
      this.miniSearchFields = fieldsKey;

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
    //   activeKeys  the page scopes ({ name, field, alias, label, icon } each), ALL of them,
    //               not just the checked ones: '@field:' is a scope override, so the menu
    //               offers every targetable field. Each suggestion carries its alias/label/icon.
    fieldSuggestState: function( text, caret, activeKeys ) {

      const before = ( text || '' ).slice( 0, caret );
      const at     = before.lastIndexOf('@');
      if ( at < 0 ) return null;
      // The '@' only starts a field token at the string start or after whitespace.
      if ( at > 0 && !/\s/.test( before[ at - 1 ] ) ) return null;
      // The fragment between '@' and the caret; a space or colon means it's no longer an
      // open field name being typed.
      const typed = before.slice( at + 1 );
      if ( /[\s:]/.test( typed ) ) return null;

      // The menu is the active scopes whose alias starts with the typed fragment. The
      // namesake resolves page-aware to its entity field (see parseSearchQuery), so offering
      // it is never a dead end. 'key' is for the v-for; the row carries alias/label/icon.
      const lower = typed.toLowerCase();
      const suggestions = _( buildScopeVocabulary( activeKeys ).suggestions )
        .filter( ( s ) => _.startsWith( s.alias.toLowerCase(), lower ) )
        .map( ( s ) => ({ key: s.alias, alias: s.alias, label: s.label, icon: s.icon }) )
        .value();
      if ( !suggestions.length ) return null;

      return { typed, start: at, end: caret, suggestions };

    },

    // Splits a raw query into tokens on UNQUOTED spaces, so a quoted phrase and a whole
    // '@scope:a,"two words"|b' field query (its commas and pipes) each stay one token. A
    // space inside double quotes does not split.
    //   '^"Mark Watney" -moon base$'  ->  ['^"Mark Watney"', '-moon', 'base$']
    //   '@tags:a,"sci fi"|b dune'     ->  ['@tags:a,"sci fi"|b', 'dune']
    tokenizeSearchQuery: function( raw ) {
      const text   = raw || '';
      const tokens = [];
      let inQuote  = false;
      let start    = -1;
      for ( let i = 0; i <= text.length; i++ ) {
        const char  = text[ i ];
        const ended = i === text.length || ( char === ' ' && !inQuote );
        if ( char === '"' ) inQuote = !inQuote;
        if ( ended ) {
          if ( start >= 0 ) {
            tokens.push( text.slice( start, i ) );
            start = -1;
          }
        }
        else if ( start < 0 ) {
          start = i;
        }
      }
      return tokens;
    },

    // Splits 'text' on every occurrence of 'sep' that sits outside double quotes.
    splitUnquoted: function( text, sep ) {
      const parts = [];
      let inQuote = false;
      let start   = 0;
      for ( let i = 0; i < text.length; i++ ) {
        const char = text[ i ];
        if ( char === '"' ) inQuote = !inQuote;
        else if ( char === sep && !inQuote ) {
          parts.push( text.slice( start, i ) );
          start = i + 1;
        }
      }
      parts.push( text.slice( start ) );
      return parts;
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
    classifyTerm: function( token, aliasToField ) {

      // FIELD PREFIX: '@alias:value'. Only an '@'-prefixed recognized alias is a field
      // query; this is what keeps titles safe. A bare 'summary:murder' (no @), a colon
      // inside a quoted phrase, or a stylized 'Warlock:' all stay literal text, because
      // a book title never starts a word with '@alias:'. Peel the '@alias:' off and parse
      // the rest as a value list (comma = AND, '|' = OR, both local to this field).
      if ( token[0] === '@' ) {
        const colon = token.indexOf(':');
        // 'colon > 1' needs a non-empty alias before it. A trailing colon with nothing
        // after ('@authors:') is a field the user has chosen but not yet given a value.
        if ( colon > 1 ) {
          const alias = token.slice( 1, colon ).toLowerCase();
          // aliasToField is derived from the active scopes (page-aware), so the namesake
          // '@authors' resolves to the entity 'name' on the authors page and to nothing on a
          // page where it isn't a scope. An unknown alias stays literal text.
          const fieldKey = aliasToField && aliasToField[ alias ];
          if ( fieldKey ) {
            const orGroups = this.parseFieldValue( token.slice( colon + 1 ) );
            // No usable value yet ('@authors:'): emit no term so it neither matches nor
            // breaks the group until a value is typed.
            if ( !orGroups.length ) return null;
            return { type: 'fieldList', fieldKey, orGroups };
          }
        }
      }

      return this.classifyBareTerm( token );

    },

    // Parses an '@scope:' value into OR-groups of AND-members: split on unquoted '|' for the
    // OR-groups, each split on unquoted ',' for its AND-members, each member classified the
    // same as a bare term (so operators -, =, ^, $ and quoted phrases still work per member).
    // Empty members are dropped; a group with no members is dropped.
    //   'urban,fantasy|fiction'  ->  [ [plain urban, plain fantasy], [plain fiction] ]
    parseFieldValue: function( value ) {
      const orGroups = [];
      _.each( this.splitUnquoted( value, '|' ), ( groupText ) => {
        const members = [];
        _.each( this.splitUnquoted( groupText, ',' ), ( memberText ) => {
          if ( memberText === '' ) return;
          const member = this.classifyBareTerm( memberText );
          // Drop a member that unquoted to nothing (a stray operator with no value).
          if ( member.value === '' ) return;
          members.push( member );
        });
        if ( members.length ) orGroups.push( members );
      });
      return orGroups;
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

    // Parses a raw query into OR-groups (each an AND-list of terms) plus a flat list of
    // exclude terms.
    //
    // A space-delimited '|' OR's whole AND-groups (AND binds tighter): 'a b | c d' is
    // '(a AND b) OR (c AND d)'. A top-level exclude (-) is pulled out as a global filter
    // applied on top of whichever group matched. A scoped term ('@tags:a,b|c') is a single
    // 'fieldList' term carrying its own OR-of-ANDs, kept local to that field (its commas and
    // pipes do not split the global query); its own excludes stay inside it.
    //   'storm front | "adam binder" -abridged'
    //     -> groups:  [ [storm, front], ["adam binder"] ]   (each group is AND'd)
    //        exclude: [ abridged ]
    // Also returns 'includeWords' (every positive word/phrase, scoped members included) so
    // the candidate search can be a broad OR before the groups trim it down.
    parseSearchQuery: function( raw, activeKeys ) {

      // The '@'-vocabulary for this query is derived from the active scopes: which aliases
      // exist and what field each resolves to (page-aware).
      const { aliasToField } = buildScopeVocabulary( activeKeys );

      const tokens  = this.tokenizeSearchQuery( raw );
      const groups  = [ [] ];
      const exclude = [];

      _.each( tokens, ( token ) => {

        // A standalone '|' starts a new AND-group.
        if ( token === '|' ) {
          groups.push( [] );
          return;
        }

        const term = this.classifyTerm( token, aliasToField );

        // An incomplete term (a field chosen but not yet given a value, '@authors:')
        // classifies to null: skip it so it neither matches nor breaks the group.
        if ( !term ) return;

        // A top-level exclude (any tier) is global, never part of a group. Scoped excludes
        // live inside their fieldList term, so they are not pulled out here.
        if ( term.type === 'exclude' || term.type === 'excludeWord' || term.type === 'excludeValue' ) {
          exclude.push( term );
          return;
        }

        _.last( groups ).push( term );

      });

      // Drop empty groups (e.g. a stray '|' or a group that held only excludes).
      const nonEmptyGroups = _.filter( groups, ( g ) => g.length );

      // Every positive word/phrase for the broad candidate search. A fieldList contributes
      // every include member across its OR-groups.
      const includeWords = _.flatMap( _.flatten( nonEmptyGroups ), ( term ) => {
        if ( term.type !== 'fieldList' ) return term.value;
        return _.flatMap( term.orGroups, ( group ) => _.map( group, 'value' ) );
      });

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
      // Items should already be strings (extractFieldItems splits array-valued fields into
      // individual string items), but coerce defensively so a stray non-string field can
      // never crash the whole search. _.toString turns null/undefined into '' (not the
      // string 'null'/'undefined'), so the regex always runs on a real string.
      return _.toString( text ).toLowerCase().replace( /[^\p{L}\p{N}]+/gu, ' ' ).trim();
    },

    // Removes HTML tags so free-text fields (blurb, summary carry markup like <p>, <i>) do
    // not turn their tag letters into spurious words in word-mode suggestions.
    stripHtml: function( text ) {
      return _.toString( text ).replace( /<[^>]*>/g, ' ' );
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

      // A scoped 'fieldList' carries its own OR-of-ANDs against one field: it matches when
      // ANY of its OR-groups is fully satisfied (every include member hits an item and no
      // exclude member hits any), so '@tags:urban,fantasy|fiction' is (urban AND fantasy)
      // OR fiction, all local to tags.
      if ( term.type === 'fieldList' ) {
        const items = getFieldItems( [ term.fieldKey ] );
        return _.some( term.orGroups, ( group ) => _.every( group, ( member ) => {
          const hit = this.itemsMatchValue( member.type, member.value, items );
          return this.isExcludeType( member.type ) ? !hit : hit;
        }));
      }

      const fieldKeys = term.fieldKey ? [ term.fieldKey ] : activeFields;
      const items     = getFieldItems( fieldKeys );
      return this.itemsMatchValue( term.type, term.value, items );

    },

    isExcludeType: function( type ) {
      return type === 'exclude' || type === 'excludeWord' || type === 'excludeValue';
    },

    // Does some item satisfy 'value' at the tier implied by 'type'? Whole-value (===/---)
    // wants an exact item; whole-word (==/--) a complete word inside an item; ^/$ anchor the
    // ends; everything else (plain, =, -, phrase) is a literal substring. Exclude and include
    // tiers test the same way here; the caller negates for excludes.
    itemsMatchValue: function( type, value, items ) {
      if ( type === 'exactValue' || type === 'excludeValue' ) return _.some( items, ( v ) => v === value );
      if ( type === 'exactWord'  || type === 'excludeWord'  ) return _.some( items, ( v ) => this.containsWholeWord( v, value ) );
      if ( type === 'startsWith' ) return _.some( items, ( v ) => _.startsWith( v, value ) );
      if ( type === 'endsWith'   ) return _.some( items, ( v ) => _.endsWith( v, value ) );
      return _.some( items, ( v ) => _.includes( v, value ) );
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
    //   activeKeys  [{ name, field, weight }] from the active scope (aliciaKeys). 'name' is
    //               the display key; 'field' is the searched book property (defaults to name).
    //   opts.keepCollectionOrder  when true, return matches in the collection's
    //                             existing (sorted) order instead of relevance rank.
    //   opts.scopeKeys  ALL page scopes (active or not), for '@field:' resolution so a
    //                   field prefix overrides the checkboxes. Defaults to activeKeys.
    miniSearchRun: function( books, query, activeKeys, opts = {} ) {

      // Index every page scope's field (not just active ones) so a '@field:' override can
      // search an unchecked scope; the index already unions in SEARCH_FIELDS on top.
      const miniSearch = this.buildSearchIndex( books, opts.scopeKeys || activeKeys );
      // Parse with the full scope vocabulary so '@summary:' resolves even when summary is
      // unchecked; plain (unprefixed) terms below still match only the active scopes.
      const { groups, exclude, includeWords } = this.parseSearchQuery( query, opts.scopeKeys || activeKeys );

      // The active scope fields, weighted by scope. Unprefixed terms search these. A scope
      // key's searched field is 'field' (it differs from the display 'name' for sub-page
      // entity scopes, where the 'series' chip reads the entity's 'name' property).
      const fields = _.map( activeKeys, ( k ) => k.field || k.name );
      const boost  = _.reduce( activeKeys, ( acc, k ) => {
        acc[ k.field || k.name ] = k.weight || 1;
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

    // Locates the fragment the caret sits on, for autosuggest. Returns { typed, start, end },
    // plus 'scopeAlias' and 'inList' when the caret is inside an '@alias:value' field query
    // (so the caller scopes suggestions and appends a comma, not a space). Null when there's
    // nothing plain to complete.
    //
    // The fragment is the whole "section" the caret sits in, taken on BOTH sides of the caret,
    // not just the text typed to its left: a '|' OR-divider and an '@scope' both split sections,
    // and inside an '@scope:value' the list delimiters (',' '|' and quotes) split members. So a
    // caret dropped into the middle of an already-typed run completes that whole run, not the
    // half before the caret. Examples (the run the caret lands in is what's completed):
    //  - '@tags:urban,fa|nt'     -> { typed:'fant', scopeAlias:'tags', inList:true }  (member
    //                               around the caret, bounded by its commas)
    //  - 'a @tags:x some|th'     -> { typed:'someth' }   a plain word after a completed
    //                               '@scope:' term still completes (the term is not absorbed)
    //  - 'storm front | jim| but'-> { typed:'jim but' }  spaces stay, so a multi-word value
    //                               completes as one fragment
    //  - 'author of the |iron druid' -> { typed:'author of the iron druid' }  the caret is
    //                               inside the run, so its right side joins the fragment too
    suggestFragmentAt: function( raw, caret ) {

      const text = raw || '';

      // Quote-aware tokens of the whole query, each tagged with its absolute index, so a quoted
      // phrase (and an '@scope:"two words"|b' value, whose own '|' stays inside the token) is one
      // token. A standalone '|' token is the OR-divider between sections (matching the parser),
      // so the section the caret sits in runs between the standalone '|' tokens on either side.
      const allTokens = this.tokenizeSegment( text, 0 );
      if ( !allTokens.length ) return null;

      const tokens = [];
      for ( const t of allTokens ) {
        // Keep only the tokens of the caret's section: reset the collected run at each
        // standalone '|', and stop once a standalone '|' starts after the caret.
        if ( t.text === '|' ) {
          if ( t.index >= caret ) break;
          tokens.length = 0;
          continue;
        }
        tokens.push( t );
      }
      if ( !tokens.length ) return null;

      // The token the caret sits in (or, between tokens, the last one starting before it).
      const caretToken = _.findLast( tokens, ( t ) => t.index <= caret );
      if ( !caretToken ) return null;

      // Caret inside an '@alias:value'? Complete the member the caret sits in, bounded by the
      // unquoted list separators (',' for AND, '|' is already a segment split) around it.
      const fieldMatch = caretToken.text.match( /^@([a-z]+):/i );
      if ( fieldMatch ) {
        const alias       = fieldMatch[ 1 ].toLowerCase();
        const valueStart  = caretToken.index + fieldMatch[ 0 ].length;
        const valuePart   = caretToken.text.slice( fieldMatch[ 0 ].length );
        // Caret offset within the value part, and the member around it (between the unquoted
        // separators on either side).
        const caretInValue = Math.max( 0, Math.min( caret - valueStart, valuePart.length ) );
        const memberStart  = this.lastUnquotedSeparatorIndex( valuePart.slice( 0, caretInValue ) ) + 1;
        const sepAfter     = this.firstUnquotedSeparatorIndex( valuePart, caretInValue );
        const memberEnd    = sepAfter < 0 ? valuePart.length : sepAfter;
        const member       = valuePart.slice( memberStart, memberEnd );
        // Trailing '$' (ends-with) terminates the value, nothing to complete.
        if ( member[ member.length - 1 ] === '$' ) return null;
        // Peel a leading operator (-, =, ^, +) so an excluded/exact member still completes
        // against its bare value; start points past it, so accepting keeps the operator.
        const prefix = ( member.match( /^[-^=+]*/ ) || [ '' ] )[ 0 ];
        let value    = member.slice( prefix.length );
        let valueOffset = prefix.length;
        // A quoted phrase (open '"iron' or closed '"iron"') still completes, just literally:
        // peel the wrapping quotes so the fragment matches the unquoted value, and aim
        // start/end at the inner text so accepting replaces only the phrase, quotes kept.
        const open = value.match( /^"/ );
        if ( open ) {
          value       = value.replace( /^"/, '' ).replace( /"$/, '' );
          valueOffset += open[ 0 ].length;
        }
        const start = valueStart + memberStart + valueOffset;
        return { typed: value, start, end: start + value.length, scopeAlias: alias, inList: true };
      }

      // Plain fragment: the run of plain tokens the caret sits in. Walk LEFT from the caret
      // token over plain tokens, and RIGHT over them too, stopping on either side at the first
      // boundary (a completed '@alias:...', an operator term, or a '$'-terminated term) so the
      // fragment never merges into a neighbouring scope/operator section.
      const isBoundary = ( t ) => /^@[a-z]+:/i.test( t.text ) || /^[-^=+]/.test( t.text ) || t.text[ t.text.length - 1 ] === '$';
      if ( isBoundary( caretToken ) ) return null;

      const caretIdx = _.indexOf( tokens, caretToken );
      let runStart   = caretToken.index;
      for ( let i = caretIdx; i >= 0 && !isBoundary( tokens[ i ] ); i-- ) {
        runStart = tokens[ i ].index;
      }
      let runEndToken = caretToken;
      for ( let i = caretIdx; i < tokens.length && !isBoundary( tokens[ i ] ); i++ ) {
        runEndToken = tokens[ i ];
      }
      const runEnd = runEndToken.index + runEndToken.text.length;

      const typed = text.slice( runStart, runEnd );
      if ( !typed ) return null;

      return { typed, start: runStart, end: runEnd };

    },

    // Splits a segment into tokens on unquoted spaces (a space inside double quotes stays in
    // the token), so a quoted phrase or an '@scope:"two words"' value is one token. Each token
    // carries its absolute index ('offset' is the segment's start in the full query).
    tokenizeSegment: function( segment, offset ) {
      const tokens = [];
      let inQuote = false;
      let start   = -1;
      for ( let i = 0; i <= segment.length; i++ ) {
        const char  = segment[ i ];
        const ended = i === segment.length || ( char === ' ' && !inQuote );
        if ( char === '"' ) inQuote = !inQuote;
        if ( ended ) {
          if ( start >= 0 ) {
            tokens.push({ text: segment.slice( start, i ), index: offset + start });
            start = -1;
          }
        }
        else if ( start < 0 ) {
          start = i;
        }
      }
      return tokens;
    },

    // Index of the last list separator (',' or '|') outside double quotes in 'text', or -1
    // if none. Marks where the current '@scope:' value member begins.
    lastUnquotedSeparatorIndex: function( text ) {
      let inQuote = false;
      let last    = -1;
      for ( let i = 0; i < text.length; i++ ) {
        const char = text[ i ];
        if ( char === '"' ) inQuote = !inQuote;
        else if ( ( char === ',' || char === '|' ) && !inQuote ) last = i;
      }
      return last;
    },

    // Index of the first list separator (',' or '|') outside double quotes at or after 'from'
    // in 'text', or -1 if none. Marks where the current '@scope:' value member ends.
    firstUnquotedSeparatorIndex: function( text, from ) {
      let inQuote = false;
      for ( let i = 0; i < text.length; i++ ) {
        const char = text[ i ];
        if ( char === '"' ) inQuote = !inQuote;
        else if ( i >= from && ( char === ',' || char === '|' ) && !inQuote ) return i;
      }
      return -1;
    },

    // The distinct values of a field across all books, with their normalized form for
    // matching and original-cased text for display. Cached per (source, field) so the
    // gather runs once. Multi-value fields (tags, authors, ...) contribute one entry per
    // item; an empty normalized form is dropped. In sentence mode (free-text fields like blurb
    // and summary) the entries are the distinct normalized texts (each blurb/summary), since
    // a whole blurb is useless to suggest as-is but its consecutive word runs are what feed
    // multi-word completion (see sentenceModeRun); HTML is stripped first.
    //   fieldValues(books, 'series.name')  ->  [{ display:'Dresden Files', norm:'dresden files' }, ...]
    fieldValues: function( books, fieldKey, sentenceMode ) {

      if ( !this.fieldValueCache || this.fieldValueSource !== books ) {
        this.fieldValueCache  = {};
        this.fieldValueSource = books;
      }
      const cacheKey = sentenceMode ? fieldKey + '::sentences' : fieldKey;
      if ( this.fieldValueCache[ cacheKey ] ) return this.fieldValueCache[ cacheKey ];

      const seen   = new Set();
      const values = [];
      _.each( books, ( book ) => {
        _.each( extractFieldItems( book, fieldKey ), ( item ) => {
          // Sentence mode keeps the whole normalized text (deduped): a single word is useless
          // to display, so the run that matches the typed fragment is extracted at suggest time.
          const norm = sentenceMode ? this.normalizeText( this.stripHtml( item ) ) : this.normalizeText( item );
          if ( !norm || seen.has( norm ) ) return;
          seen.add( norm );
          values.push({ display: sentenceMode ? norm : item, norm });
        });
      });

      this.fieldValueCache[ cacheKey ] = values;
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
    //   activeKeys  should be ALL page scopes (each carrying its own 'active' flag). A plain
    //               fragment draws only from the active ones (what plain search matches); a
    //               caret inside an '@alias:value' narrows to that one aliased scope, active or
    //               not, so an '@scope:' value completes even for an unchecked scope.
    miniSuggest: function( books, query, caret, activeKeys ) {

      const at = this.suggestFragmentAt( query, caret );
      if ( !at ) return null;

      const needle = this.normalizeText( at.typed );
      if ( !needle ) return null;

      // Inside an '@alias:value', draw only from that aliased scope's field (active or not:
      // the '@'-prefix is a scope override); an unknown alias matches none, so no suggestions.
      // A plain fragment (no alias) draws only from the ACTIVE scopes, matching what plain
      // search actually searches, so the menu never offers values from an unchecked scope.
      let scopes;
      if ( at.scopeAlias ) {
        scopes = _.filter( activeKeys, ( k ) => ( k.alias || '' ).toLowerCase() === at.scopeAlias );
        if ( !scopes.length ) return null;
      }
      else {
        scopes = _.filter( activeKeys, ( k ) => k.active );
        if ( !scopes.length ) return null;
      }

      // Gather matches across the scopes, each from its searched field, tagged with the scope
      // for its row label. Tiers, tightest first (so a clean prefix always outranks a scattered
      // hit, but a scattered hit still appears rather than the menu lying that there's nothing):
      //   -1  exact: value EQUALS the fragment (kept top so accepting phrase-searches it)
      //    0  value-prefix: value starts with the fragment
      //    1  word-run: the fragment's words appear as an in-order run inside the value
      //    2  scattered: the value contains every fragment word in ANY order (last a prefix),
      //        matching how unquoted SEARCH treats the words, so the suggestion never goes blank
      //        on a query the search would find. Highlighted per-word since the hits scatter.
      const needleWords = needle.split(' ');
      const matches = [];
      _.each( scopes, ( k ) => {
        const scopeKey = k.name;
        const weight   = k.weight || 1;
        const label    = k.label || k.alias || k.name;
        const icon     = k.icon || null;
        _.each( this.fieldValues( books, k.field || k.name, k.sentenceMode ), ( value ) => {
          // Sentence-mode fields (free text like blurb/summary) suggest the smallest passage
          // that contains every typed word (order-independent, like unquoted search), not the
          // whole text. 'value' is that passage (what gets inserted); 'display' adds context
          // words around it (preview only); 'highlightWords' are the words to bold individually.
          if ( k.sentenceMode ) {
            const match = this.sentenceModeRun( value.norm, needleWords );
            if ( match ) matches.push({ value: match.run, display: match.display, highlightWords: match.highlightWords, norm: match.run, fieldKey: scopeKey, label, icon, tier: 0, weight });
            return;
          }
          // Discrete-value scopes suggest the whole value. Tiers -1..1 are contiguous, so the
          // caller highlights the typed fragment as one run (highlightWords stays null); tier 2
          // is scattered, so the matched words are listed for per-word highlighting.
          let tier = null;
          let highlightWords = null;
          if ( value.norm === needle ) tier = -1;
          else if ( _.startsWith( value.norm, needle ) ) tier = 0;
          else if ( this.wordRunMatches( value.norm, needleWords ) ) tier = 1;
          else {
            const scattered = this.wordsAllPresent( value.norm, needleWords );
            if ( scattered ) {
              tier = 2;
              highlightWords = scattered;
            }
          }
          if ( tier === null ) return;
          matches.push({ value: value.display, display: value.display, highlightWords, norm: value.norm, fieldKey: scopeKey, label, icon, tier, weight });
        });
      });

      // Rank within a scope: by tier (exact, then value-prefix, then in-order run, then scattered
      // any-order), then heavier scope, then shorter value, so the closest match leads and a
      // scattered hit always falls below a clean prefix. One row per inserted value
      // (uniqBy value after the sort keeps each value's best-ranked, highest-weighted field;
      // for sentence mode that collapses two windows of the same run to one). The list is then
      // shared fairly across scopes (see allotByScope), capped at the total budget.
      const ranked = _( matches )
        .orderBy( [ 'tier', ( m ) => -m.weight, ( m ) => m.norm.length ], [ 'asc', 'asc', 'asc' ] )
        .uniqBy( 'value' )
        .value();

      const suggestions = _.map(
        this.allotByScope( ranked, 8 ),
        ( m ) => ({ value: m.value, display: m.display, highlightWords: m.highlightWords, fieldKey: m.fieldKey, label: m.label, icon: m.icon })
      );

      return { typed: at.typed, start: at.start, end: at.end, suggestions, inList: !!at.inList };

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

    // Finds the passage inside a sentence-mode value (blurb/summary text) that completes the
    // typed fragment. Returns { run, display, highlightWords } (or null when the text has no
    // such passage). Matching mirrors how the SEARCH treats unquoted words, so the suggestion
    // never goes blank on a query the search would find: all the typed words must appear in the
    // passage but ORDER DOES NOT MATTER (a literal in-order phrase is what double quotes are
    // for), and each word matches by PREFIX (mirroring the search's `prefix: true`). Among all
    // windows that hold every word, the smallest is chosen, so the run stays tight.
    //   'run'            the smallest consecutive word window covering every typed word, in the
    //                    text's own order (what gets inserted on accept; accepting snaps the
    //                    user's possibly-reordered input to the real passage).
    //   'display'        that run padded with a few context words on each side (preview only),
    //                    the window shrinking as the typed phrase grows; '...' marks a clip.
    //   'highlightWords' the set of value words that matched a typed word, so each is bolded on
    //                    its own (scattered highlight, not one contiguous block).
    // Both value and needleWords are already normalized to single-spaced lowercase words.
    sentenceModeRun: function( value, needleWords ) {

      const valueWords = value.split(' ');

      // A value word is "relevant" when it prefix-matches at least one needle word. Each value
      // index is tagged with the set of needle words it covers, so a sliding window can check
      // coverage. Prefix (not whole-word) mirrors the search, so 'dru iro' still matches.
      const covered = _.map( valueWords, ( vw ) => _.filter( needleWords, ( n ) => _.startsWith( vw, n ) ) );

      // Smallest window [start, end] of value words that together cover every distinct needle
      // word. Slide 'end' forward, growing a count of how many needle words the window covers,
      // then pull 'start' in as far as coverage allows. Track the tightest window seen.
      const distinct = _.uniq( needleWords );
      const need     = {};
      _.each( distinct, ( n ) => { need[ n ] = ( need[ n ] || 0 ) + 1; } );

      let best  = null;
      const have = {};
      let satisfied = 0;
      let start = 0;
      for ( let end = 0; end < valueWords.length; end++ ) {
        _.each( covered[ end ], ( n ) => {
          have[ n ] = ( have[ n ] || 0 ) + 1;
          if ( have[ n ] === need[ n ] ) satisfied++;
        });
        // Once every needle word is covered, shrink from the left while coverage holds.
        while ( satisfied === distinct.length ) {
          if ( !best || ( end - start ) < ( best.end - best.start ) ) best = { start, end };
          _.each( covered[ start ], ( n ) => {
            if ( have[ n ] === need[ n ] ) satisfied--;
            have[ n ]--;
          });
          start++;
        }
      }
      if ( !best ) return null;

      const runStart = best.start;
      const runEnd   = best.end + 1;
      const run      = valueWords.slice( runStart, runEnd ).join(' ');

      // The distinct value words inside the window that actually matched a typed word (checked
      // by their window position, so a repeated word is judged where it sits), for highlighting.
      const highlightWords = _.uniq(
        _.filter( valueWords.slice( runStart, runEnd ), ( vw, i ) => covered[ runStart + i ].length )
      );

      // Context words per side: 4 for a single typed word, one fewer per extra word, floored
      // at 1, so a longer query overflows less. Ellipsis marks a window clipped from the text.
      const pad        = Math.max( 1, 4 - ( needleWords.length - 1 ) );
      const fromStart  = Math.max( 0, runStart - pad );
      const toEnd      = Math.min( valueWords.length, runEnd + pad );
      const before     = valueWords.slice( fromStart, runStart ).join(' ');
      const after      = valueWords.slice( runEnd, toEnd ).join(' ');
      let   display    = run;
      if ( before ) display = ( fromStart > 0 ? '... ' : '' ) + before + ' ' + display;
      if ( after )  display = display + ' ' + after + ( toEnd < valueWords.length ? ' ...' : '' );

      return { run, display, highlightWords };

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

    // Returns the distinct value words that match, when the value contains EVERY needle word in
    // any order, or null when some needle word is missing. Each needle word matches a value word
    // by PREFIX, exactly mirroring the search's `prefix: true` over AND'd terms, so the
    // suggestion matches whatever unquoted search matches: 'druid iron' and 'dru iro' both cover
    // 'the iron druid chronicles'. The returned words drive per-word highlighting. Both value and
    // needleWords are normalized.
    wordsAllPresent: function( value, needleWords ) {

      const valueWords = value.split(' ');
      const matched    = [];

      const allPresent = _.every( needleWords, ( n ) => {
        const hits = _.filter( valueWords, ( vw ) => _.startsWith( vw, n ) );
        if ( !hits.length ) return false;
        matched.push( ...hits );
        return true;
      });
      if ( !allPresent ) return null;

      return _.uniq( matched );

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
