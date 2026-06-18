<template>
  <div>
    
    <gallery-page-title></gallery-page-title>
    
    <gallery-library-wishlist-switcher v-if="$route.meta.subPage" :aboveSearch="true" />
    
    <div
    id="ale-search-wrap"
    ref="searchWrap"
    :class="{ 'search-fixed': fixedSearch, 'highlight-search': highlightSearch }"
    >
      
      <div id="search-dropdown-overlay" v-show="listName"
        @mousedown="readyToCloseOpts = true" 
        @touchstart="readyToCloseOpts = true" 
        @touchmove="dontCloseOpts"
        @click="closeOpts"
      ></div>
      
      <div id="ale-search" ref="aleSearch">
        <div class="search-wrapper" @click="$refs.searchInput.focus()">
          <input
            type="search"
            ref="searchInput"
            :value="$store.state.searchQuery"
            @input="onSearchInput"
            @keydown="searchKeydown"
            @keyup.enter="searchEnterBlur"
            @click="onSearchClick"
            @blur="onSearchBlur"
            :placeholder="placeholder"
            @focus="listName = false"
          />

          <!-- @field autocomplete: a Github-style menu anchored under the caret. Shown
               while the caret sits on an unfinished '@field' token. -->
          <div
            class="field-menu"
            v-if="fieldMenu.open"
            :style="{ left: fieldMenu.left + 'px', top: fieldMenu.top + 'px' }"
            @mousedown.prevent
          >
            <!-- The whole header is the help trigger; its tooltip explains how a scope value
                 list is written. The icon is just a visual cue. Opens on hover/tap. -->
            <div
              class="field-menu-header"
              :content="searchHelpTooltip"
              v-tippy="{ allowHTML: true, interactive: true, placement: 'right-start', offset: [0, 22], hideOnClick: true, delay: [0, 0], maxWidth: 'none' }"
            >
              <span>Inline search scope</span>
              <span class="field-menu-help" v-html="searchHelpIcon"></span>
            </div>
            <div
              class="field-menu-item"
              :class="{ active: index === fieldMenu.index }"
              v-for="(item, index) in fieldMenu.items" :key="item.key"
              @click="acceptFieldSuggestion( item )"
              @mouseenter="fieldMenu.index = index"
            >
              <span class="field-menu-icon" v-html="fieldIcons[ item.icon ]"></span>
              <span class="field-menu-label">{{ item.label }}</span>
            </div>
          </div>

          <!-- Autosuggest: completes the plain fragment under the caret to a whole field
               value. Floats over the content (does not push the grid down). Each row is a
               value with the typed fragment bolded, tagged with the scope it came from. -->
          <div class="suggest-menu" v-if="suggestMenu.open" @mousedown.prevent>
            <div
              class="suggest-item"
              :class="{ active: index === suggestMenu.index }"
              v-for="(item, index) in suggestMenu.items" :key="item.value + '-' + item.fieldKey"
              @click="acceptSuggestion( item.value )"
              @mouseenter="suggestMenu.index = index"
            >
              <span class="suggest-icon" v-if="item.icon" v-html="fieldIcons[ item.icon ]"></span>
              <span class="suggest-value" v-html="highlightTyped( item.value, suggestMenu.typed )"></span>
              <span class="suggest-badge">{{ item.label }}</span>
            </div>
          </div>
        </div>
        
        <gallery-search-icons v-model:list-name="listName" /> 
        <gallery-search-options v-model:list-name="listName" v-if="listName" />
      </div> <!-- #ale-search -->
      
      <gallery-view-mode-switcher v-if="$route.meta.gallery && $store.state.windowWidth >= 450" />
      
    </div> <!-- #ale-search-wrap -->

    <div class="summary-search-preparing" v-if="summarySearchPreparing">
      Preparing summary search...
    </div>

  </div>
</template>

<script>

import filterAndSort from '@output-mixins/gallery-filter-and-sort.js';
import miniSearchMixin from '@output-mixins/gallery-minisearch.js';
import { loadAllFieldData } from '@output-mixins/gallery-load-split-book-data.js';

// Raw SVGs for the '@field' autocomplete rows, keyed by the 'icon' name each scope carries
// (scopes declare their own alias/label/icon; see buildScopeVocabulary in the minisearch
// mixin). Imported statically so the build bundles them (a dynamic ':is' would not be
// picked up by unplugin-icons).
import IconTitle      from '~icons/icon-park-solid/text?raw';
import IconUserPen    from '~icons/fa6-solid/user-pen?raw';
import IconMicrophone from '~icons/fa6-solid/microphone?raw';
import IconLayerGroup from '~icons/fa6-solid/layer-group?raw';
import IconFolder     from '~icons/fa6-solid/folder?raw';
import IconTag        from '~icons/fa6-solid/tag?raw';
import IconBuilding   from '~icons/fa6-solid/building?raw';
import IconAlignLeft  from '~icons/fa6-solid/align-left?raw';
import IconFileLines  from '~icons/fa6-solid/file-lines?raw';
import IconHashtag    from '~icons/fa6-solid/hashtag?raw';
import IconInfo       from '~icons/fa6-solid/circle-info?raw';

export default {
  name: "GallerySearch",
  mixins: [filterAndSort, miniSearchMixin],
  props: ['collectionSource'],
  data: function() {
    return {
      enableZoomTimer: null,

      // Summary text is chunked out of the book objects at save time, so summary
      // search needs it hydrated back into memory first. These track that one-time
      // load so search can show a "preparing" state until the data is ready.
      summarySearchReady: false,
      summarySearchHydrating: false,

      // When true, search results are ordered by relevance. Set false while a user
      // sort is in effect so matches keep the collection's existing (sorted) order.
      sortByRelevance: true,

      listName: false,

      waypointOpts: {
        rootMargin: "-37px"
      },
      fixedSearch: false,
      highlightSearch: false,
      readyToCloseOpts: false,

      // Autosuggest menu state. Completes the plain word under the caret (the '@field'
      // menu, separate below, takes priority when the caret sits on an '@field' token).
      // 'items' is the suggested words, 'index' the keyboard-highlighted row, 'typed' the
      // fragment being completed, and 'start'/'end' the slice of the query that word
      // occupies (so accepting splices the full suggestion in its place).
      suggestMenu: {
        open: false,
        items: [],
        index: 0,
        typed: '',
        start: 0,
        end: 0,
        inList: false,
      },

      // One-shot: set when a suggestion is accepted with Enter, so the keyup-Enter blur
      // skips that one Enter and keeps focus for continued typing.
      suggestAcceptedEnter: false,

      // '@field' autocomplete menu state. 'items' is the filtered suggestion list, 'index'
      // the keyboard-highlighted row, 'start'/'end' the slice of the query the typed
      // '@fragment' occupies (so accepting can splice in the full '@alias:'), and
      // 'left'/'top' the caret-anchored pixel position of the dropdown.
      fieldMenu: {
        open: false,
        items: [],
        index: 0,
        start: 0,
        end: 0,
        left: 0,
        top: 0,
      },

      // Raw SVG strings for the field-menu rows, keyed by suggestion icon name.
      fieldIcons: {
        'title':       IconTitle,
        'user-pen':    IconUserPen,
        'microphone':  IconMicrophone,
        'layer-group': IconLayerGroup,
        'folder':      IconFolder,
        'tag':         IconTag,
        'building':    IconBuilding,
        'align-left':  IconAlignLeft,
        'file-lines':  IconFileLines,
        'hashtag':     IconHashtag,
      },

      // Raw SVG for the help marker beside the '@field' menu header.
      searchHelpIcon: IconInfo,
    };
  },
  
  mounted: function() {
    
    if ( this.$route.query.search ) {
      let searchQuery = decodeURIComponent(this.$route.query.search);
      this.$store.commit("prop", { key: "searchQuery", value: searchQuery });
    }
    
    this.$store.commit('prop', { key: 'collectionSource', value: this.collectionSource });
    
    let collection = this.$store.getters.collectionSource;
    const ifUrlParams = this.$route.query.sort || this.$route.query.filter || this.$route.query.filterExtras;
    if ( ifUrlParams ) {
      if ( this.$route.query.filter || this.$route.query.filterExtras ) collection = this.filterBooks( collection );
      if ( this.$route.query.sort   ) collection = this.sortBooks( collection );
      this.$store.commit("prop", { key: 'mutatingCollection', value: collection });
    }
    else {
      // this.$store.commit("prop", { key: 'mutatingCollection', value: collection });
      this.$store.commit("prop", { key: 'mutatingCollection', value: this.sortBooks( this.filterBooks( collection ) ) });
    }
    
    if ( this.$route.query.search ) {
      if ( this.$route.query.sort ) this.sortByRelevance = false;
      this.search( null, 'on-load');
    }
    
    this.$refs.aleSearch.addEventListener( "touchstart", this.iosAutozoomDisable, { passive: true });
    this.$compEmitter.on("ios-auto-zoom-disable", this.iosAutozoomDisable);
    this.$compEmitter.on("start-scope", this.scope);
    this.$compEmitter.on("start-sort", this.sort);
    this.$compEmitter.on("start-filter", this.filter);
    this.$compEmitter.on("search-focus", this.focusOnSearch);
    this.$store.commit('prop', { key: 'searchMounted', value: true });
    
  },

  beforeUnmount: function() {
    
    this.$store.commit("prop", { key: "searchQuery", value: '' });
    this.$refs.aleSearch.removeEventListener( "touchstart", this.iosAutozoomDisable);
    this.$compEmitter.off("ios-auto-zoom-disable", this.iosAutozoomDisable);
    this.$compEmitter.off("start-scope", this.scope);
    this.$compEmitter.off("start-sort", this.sort);
    this.$compEmitter.off("start-filter", this.filter);
    this.$compEmitter.off("search-focus", this.focusOnSearch);
    this.$store.commit('prop', { key: 'searchMounted', value: false });
    
  },
  
  methods: {
    
    dontCloseOpts: _.throttle( function() {
      if ( this.readyToCloseOpts ) this.readyToCloseOpts = false;
    }, 50, { leading: false, trailing: true }),
    
    closeOpts: function() {
      if ( this.readyToCloseOpts ) {
        this.readyToCloseOpts = false;
        this.$nextTick(function() {
          let vue = this;
          setTimeout(function() {
            vue.listName = false;
          }, 30); // Timeout prevents interaction with elements below the overlay on click...
        });
      }
    },
    
    scope: function() {
      this.$nextTick(() => {
        // No need to shuffle anything when there's no active search
        if ( this.$store.getters.searchIsActive ) {
          this.$store.commit("prop", { key: 'mutatingCollection', value: this.sortBooks( this.filterBooks(this.$store.getters.collectionSource) ) });
          if ( !this.$store.getters.searchIsActive ) this.sortByRelevance = false;
          this.search();
        } 
        
      });
    },
    filter: function() {
      this.$nextTick(() => {
        
        this.$store.commit("prop", { key: 'mutatingCollection', value: this.sortBooks( this.filterBooks(this.$store.getters.collectionSource) ) });
        
        if ( !this.$store.getters.searchIsActive ) this.sortByRelevance = false;
        if ( this.$store.getters.searchIsActive ) {
          this.search();
        } 
        
      });
    },
    sort: function() {
      this.$nextTick(() => {
        
        this.$store.commit("prop", { key: ( this.$store.getters.searchIsActive ? 'searchCollection' : 'mutatingCollection'), value: this.sortBooks( this.$store.getters.collection ) });
        
      });
    },
    
    // One-time hydration of summary text back onto the in-memory book objects so the
    // 'summary' scope can be searched. Summaries are loaded from IndexedDB (warmed by
    // the background prefetcher) and matched onto library + wishlist books by asin.
    hydrateSummaries: async function() {

      if ( this.summarySearchReady || this.summarySearchHydrating ) return;

      const splitFields = _.get( this.$store.state, 'audibledata.extras.splitFields' );
      const cacheID     = _.get( this.$store.state, 'audibledata.extras.cacheID' );

      // No split-summary manifest means summaries already live on the books (extension
      // gallery) or there are none. Either way nothing to hydrate.
      if ( !_.get( splitFields, 'summary' ) ) {
        this.summarySearchReady = true;
        return;
      }

      this.summarySearchHydrating = true;

      try {

        const entries = await loadAllFieldData( splitFields, cacheID, 'summary' );
        const summaryByAsin = _.keyBy( entries, 'asin' );

        const books = _.concat(
          _.get( this.$store.state, 'audibledata.library', [] ),
          _.get( this.$store.state, 'audibledata.wishlist', [] )
        );

        _.each( books, ( book ) => {
          const entry = summaryByAsin[ book.asin ];
          if ( entry ) book.summary = entry.summary;
        });

        this.summarySearchReady = true;

        // Summaries were written onto the books in place, so the existing index is
        // stale. Force a rebuild that includes the summary text.
        this.resetSearchIndex();

        // If a query is already pending behind the gate, run it now.
        if ( this.$store.getters.searchIsActive ) this.search();

      }
      catch ( err ) {
        console.warn( '[summary search] hydration failed:', err );
      }
      finally {
        this.summarySearchHydrating = false;
      }

    },

    // Input handler. The input is ':value'-bound to the store, so the store value must
    // track the field synchronously, otherwise the next reactive re-render (e.g. the
    // field menu opening) snaps the input back to the stale store value and eats the
    // last character typed. So commit the value now and refresh the menu now; only the
    // expensive matching stays debounced (via search()).
    onSearchInput: function( e ) {
      this.$store.commit( "prop", { key: "searchQuery", value: e.target.value });
      this.search( e );
      this.updateFieldMenu();
      this.updateSuggestMenu();
    },

    // Commits a new query value to the store synchronously (keeping the ':value'-bound
    // input in sync) and runs the search against it. Used when code, not the user's
    // typing, changes the value (accepting an '@field' suggestion).
    commitSearchValue: function( value ) {
      this.$store.commit( "prop", { key: "searchQuery", value: value });
      this.search({ target: { value: value } });
    },

    // Recomputes the '@field' menu from the input's current value and caret. Opens it,
    // anchored under the caret, when the caret sits on an unfinished '@field' token;
    // closes it otherwise. Safe to call on input, click, and arrow-key navigation.
    updateFieldMenu: function() {

      const input = this.$refs.searchInput;
      if ( !input ) return this.closeFieldMenu();

      // All page scopes (not just active): '@field:' is a scope override, so the menu offers
      // every field you can target, including currently-unchecked ones.
      const state = this.fieldSuggestState( input.value, input.selectionStart, this.allScopeKeys );
      if ( !state ) return this.closeFieldMenu();

      // Keep the highlight in range when the filtered list shrinks under the cursor.
      const index = Math.min( this.fieldMenu.index, state.suggestions.length - 1 );
      const coords = this.caretCoords( input, state.start );

      this.fieldMenu = {
        open: true,
        items: state.suggestions,
        index: index < 0 ? 0 : index,
        start: state.start,
        end: state.end,
        left: coords.left,
        top: coords.top,
      };

      // The '@field' menu owns the caret now; never show both at once.
      this.closeSuggestMenu();

    },

    closeFieldMenu: function() {
      if ( this.fieldMenu.open ) this.fieldMenu.open = false;
    },

    // Keyboard navigation for whichever menu is open. The '@field' menu takes priority
    // (the two never show at once, but guard the order anyway); the suggest menu is next.
    // Returns early (letting the keystroke through to the input) when neither is open, so
    // normal typing is untouched.
    searchKeydown: function( e ) {

      // if ( this.backspaceScopeToken( e ) ) return;

      if ( this.fieldMenu.open ) return this.fieldMenuKeydown( e );
      if ( this.suggestMenu.open ) return this.suggestMenuKeydown( e );

    },

    // // A single Backspace deletes a whole '@scope:' token (the scope and all its values).
    // // Basically pressing backspace with the text cursor at any position marked by a
    // // vertical pipe would remove the entive scope and the value(s) (in this case
    // // fiction): example @|t|a|g|s|:|fiction 
    // //
    // // UNUSED: sounded good on paper, but in practice it left too much room for accidental
    // // deletions that could be far more frustrating than a few extra keystrokes.
    // backspaceScopeToken: function( e ) {
      
    //   if ( e.key !== 'Backspace' ) return false;
      
    //   const input = this.$refs.searchInput;
    //   if ( !input ) return false;
      
    //   const caret = input.selectionStart;
    //   if ( caret !== input.selectionEnd || caret === 0 ) return false;
      
    //   const value = input.value;
      
    //   const at = value.lastIndexOf( '@', caret - 1 );
    //   if ( at < 0 ) return false;
    //   if ( at > 0 && !/\s/.test( value[ at - 1 ] ) ) return false;
      
    //   const colon = value.indexOf( ':', at );
    //   if ( colon < 0 ) return false;
    //   const alias = value.slice( at + 1, colon );
    //   if ( !alias || /\s/.test( alias ) ) return false;
      
    //   if ( caret > colon + 1 ) return false;
      
    //   let end     = value.length;
    //   let inQuote = false;
    //   for ( let i = colon + 1; i < value.length; i++ ) {
    //     if ( value[ i ] === '"' ) inQuote = !inQuote;
    //     else if ( value[ i ] === ' ' && !inQuote ) {
    //       end = i;
    //       break;
    //     }
    //   }
      
    //   let cut = end;
    //   if ( value[ end ] === ' ' ) cut = end + 1;
      
    //   e.preventDefault();
    //   const newValue = value.slice( 0, at ) + value.slice( cut );
      
    //   this.closeFieldMenu();
    //   this.closeSuggestMenu();
    //   this.commitSearchValue( newValue );
    //   this.restoreCaret( newValue, at );
      
    //   return true;
      
    // },

    // Keyboard navigation for the '@field' menu.
    fieldMenuKeydown: function( e ) {

      const count = this.fieldMenu.items.length;

      // Move the highlight.
      if ( e.key === 'ArrowDown' ) {
        e.preventDefault();
        this.fieldMenu.index = ( this.fieldMenu.index + 1 ) % count;
        return;
      }
      if ( e.key === 'ArrowUp' ) {
        e.preventDefault();
        this.fieldMenu.index = ( this.fieldMenu.index - 1 + count ) % count;
        return;
      }
      // Accept the highlighted suggestion.
      if ( e.key === 'Enter' || e.key === 'Tab' ) {
        e.preventDefault();
        this.acceptFieldSuggestion( this.fieldMenu.items[ this.fieldMenu.index ] );
        return;
      }
      // Dismiss without choosing.
      if ( e.key === 'Escape' ) {
        e.preventDefault();
        this.closeFieldMenu();
        return;
      }

    },

    // Keyboard navigation for the autosuggest menu. Mirrors the '@field' menu: Enter or
    // Tab accepts the highlighted word (accepting splices it in and runs the search via
    // commitSearchValue, so the query updates on its own).
    suggestMenuKeydown: function( e ) {

      const count = this.suggestMenu.items.length;

      // Move the highlight.
      if ( e.key === 'ArrowDown' ) {
        e.preventDefault();
        this.suggestMenu.index = ( this.suggestMenu.index + 1 ) % count;
        return;
      }
      if ( e.key === 'ArrowUp' ) {
        e.preventDefault();
        this.suggestMenu.index = ( this.suggestMenu.index - 1 + count ) % count;
        return;
      }
      // Accept the highlighted word. Flag the accept so the keyup-Enter handler does not
      // also blur the input: accepting keeps focus (caret after the inserted word) so the
      // user can keep typing, unlike a plain Enter which blurs to dismiss the keyboard.
      if ( e.key === 'Enter' || e.key === 'Tab' ) {
        e.preventDefault();
        if ( e.key === 'Enter' ) this.suggestAcceptedEnter = true;
        this.acceptSuggestion( this.suggestMenu.items[ this.suggestMenu.index ].value );
        return;
      }
      // Dismiss without choosing.
      if ( e.key === 'Escape' ) {
        e.preventDefault();
        this.closeSuggestMenu();
        return;
      }

    },

    // Caret moved by click: recompute both menus from the new caret.
    onSearchClick: function() {
      this.updateFieldMenu();
      this.updateSuggestMenu();
    },

    // Close both menus on blur. mousedown.prevent on the menu rows keeps a click on a
    // suggestion from blurring the input before the click lands.
    onSearchBlur: function() {
      this.closeFieldMenu();
      this.closeSuggestMenu();
    },

    // Replaces the typed '@fragment' with the full '@alias:' and drops the caret right
    // after the colon, ready for the value. The store holds the input's value (the input
    // is ':value'-bound to it), so we commit there first, then restore the caret on the
    // next tick once Vue has reflected the new value back into the field.
    acceptFieldSuggestion: function( item ) {

      const input = this.$refs.searchInput;
      if ( !input ) return;

      const value    = input.value;
      const inserted = '@' + item.alias + ':';
      const newValue = value.slice( 0, this.fieldMenu.start ) + inserted + value.slice( this.fieldMenu.end );
      const caret    = this.fieldMenu.start + inserted.length;

      this.closeFieldMenu();
      this.commitSearchValue( newValue );

      // Drop the caret right after the inserted ':' and keep it there. The value commit
      // above re-renders now (collapsing the caret), and the debounced search re-renders
      // again ~270ms later (route/query update collapses it a second time), so a single
      // $nextTick restore gets undone. restoreCaret re-applies the caret across both
      // render passes until they settle.
      this.restoreCaret( newValue, caret );

    },

    // Re-applies the caret position to the search input across the renders triggered by
    // accepting an '@field' suggestion. The synchronous value commit and the debounced
    // search each reassign the ':value'-bound input.value, which collapses the caret, so
    // a single restore gets undone. This re-applies the caret on each animation frame
    // through the debounce window, but bails the instant the value changes (the user
    // typed) so it never fights real input.
    restoreCaret: function( expectedValue, caret ) {

      const input    = this.$refs.searchInput;
      if ( !input ) return;
      const deadline = Date.now() + 400;

      const apply = () => {
        const el = this.$refs.searchInput;
        if ( !el ) return;
        // The user typed (or cleared) since we accepted: leave their caret alone.
        if ( el.value !== expectedValue ) return;
        if ( document.activeElement !== el ) el.focus();
        if ( el.selectionStart !== caret || el.selectionEnd !== caret ) {
          el.setSelectionRange( caret, caret );
        }
        if ( Date.now() < deadline ) requestAnimationFrame( apply );
      };

      this.$nextTick( apply );

    },

    // Pixel position (relative to the input's offset parent) of the caret at character
    // 'index', for anchoring the dropdown. A hidden mirror div copies the input's text
    // styling so a marker span at the index reports the exact spot the glyph sits, then
    // we offset by the input's own position and scroll. The menu is placed just under
    // the text baseline.
    caretCoords: function( input, index ) {

      const mirror = document.createElement('div');
      const style  = window.getComputedStyle( input );

      // Copy the properties that affect where a glyph lands.
      _.each(
        [ 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing',
          'textTransform', 'paddingLeft', 'paddingTop', 'paddingRight', 'borderLeftWidth',
          'borderTopWidth', 'boxSizing' ],
        ( prop ) => { mirror.style[ prop ] = style[ prop ]; }
      );
      mirror.style.position   = 'absolute';
      mirror.style.visibility = 'hidden';
      mirror.style.whiteSpace = 'pre';
      mirror.style.top        = '0';
      mirror.style.left       = '0';

      mirror.textContent = input.value.slice( 0, index );
      const marker = document.createElement('span');
      marker.textContent = '​';
      mirror.appendChild( marker );

      document.body.appendChild( mirror );
      const markerLeft = marker.offsetLeft;
      document.body.removeChild( mirror );

      return {
        left: input.offsetLeft + markerLeft - input.scrollLeft,
        top:  input.offsetTop + input.offsetHeight,
      };

    },

    search: _.debounce( function( e, onLoad ) {
      
      // Reset 
      const newQueries = {};
      const searchQuery = decodeURIComponent(this.$route.query.search);
      if ( !onLoad ) {
        newQueries.book = null;
        this.$store.commit('prop', { key: 'bookClicked', value: true });
      }
      
      const triggeredByEvent = e;
      if ( triggeredByEvent ) {

        this.sortByRelevance = true;
        // The query is committed to the store synchronously upstream (onSearchInput /
        // commitSearchValue) so the ':value'-bound input stays in sync. Only commit here
        // when it actually differs: re-committing the same value still triggers Vue to
        // reassign input.value, which collapses the caret. That late reassignment, firing
        // when this debounce lands, was what dropped the caret after an '@field' insert.
        if ( this.$store.state.searchQuery !== e.target.value ) {
          this.$store.commit("prop", { key: "searchQuery", value: e.target.value });
        }
        newQueries.search = encodeURIComponent(e.target.value);
        if ( !newQueries.search ) newQueries.search = null;
        
        if ( e.target.value.trim() !== "" ) {
          if ( this.$route.query.sort ) {
            newQueries.sort = null;
            newQueries.sortDir = null;
          }
        }
        else {
          var activeSorter = _.find( this.$store.state.listRenderingOpts.sort, 'current');
            newQueries.sort = activeSorter.key;
            newQueries.sortDir = activeSorter.active ? "desc" : "asc";
        }
        
      }
      
      this.$updateQueries( newQueries );
      
      // Gate: summary scope is active but its text isn't hydrated yet. Kick off (or
      // wait on) hydration; hydrateSummaries re-runs search() once it's ready.
      if ( this.summaryScopeActive && !this.summarySearchReady ) {
        this.hydrateSummaries();
        return;
      }

      // Start searching
      if (this.$store.getters.searchIsActive) {
        const query = this.$store.state.searchQuery;

        const result = this.miniSearchRun(
          this.$store.state.mutatingCollection,
          query,
          this.aliciaKeys,
          { keepCollectionOrder: !this.sortByRelevance, scopeKeys: this.allScopeKeys }
        );

        this.$store.commit("prop", { key: 'searchCollection', value: result });

      }
      // Stop searching  
      else {
        this.$store.commit("prop", { key: 'searchCollection', value: [] });
      }
      
      
    }, 270, { leading: false, trailing: true }),
    
    // Recomputes the autosuggest menu from the input's current value and caret. The
    // '@field' menu wins: while it is open the suggest menu stays closed, so the two never
    // show at once. Otherwise miniSuggest completes the plain word under the caret.
    updateSuggestMenu: function() {

      const input = this.$refs.searchInput;
      if ( !input || this.fieldMenu.open ) return this.closeSuggestMenu();

      // All page scopes (not just active) so a value inside an '@scope:' completes even for
      // an unchecked scope, matching the '@'-override behaviour.
      const result = this.miniSuggest(
        this.$store.state.mutatingCollection,
        input.value,
        input.selectionStart,
        this.allScopeKeys
      );
      if ( !result || !result.suggestions.length ) return this.closeSuggestMenu();

      // Keep the highlight in range when the list shrinks under the cursor.
      const index = Math.min( this.suggestMenu.index, result.suggestions.length - 1 );

      this.suggestMenu = {
        open: true,
        items: result.suggestions,
        index: index < 0 ? 0 : index,
        typed: result.typed,
        start: result.start,
        end: result.end,
        inList: result.inList,
      };

    },

    closeSuggestMenu: function() {
      if ( this.suggestMenu.open ) this.suggestMenu.open = false;
    },

    // Replaces the typed fragment with the chosen value (quoted when it contains spaces) and
    // runs the search. A plain value gets a trailing space; inside an '@scope:' list nothing
    // is appended, so the user adds a comma (another member) or a space (end the scope).
    acceptSuggestion: function( value ) {

      const input = this.$refs.searchInput;
      if ( !input ) return;

      const current   = input.value;
      const phrase    = _.includes( value, ' ' ) ? '"' + value + '"' : value;
      // Inside an '@scope:' list, append nothing so the user chooses what's next (a comma to
      // add another, a space to end the scope); a plain value gets a trailing space.
      const separator = this.suggestMenu.inList ? '' : ' ';
      const inserted  = phrase + separator;
      const newValue  = current.slice( 0, this.suggestMenu.start ) + inserted + current.slice( this.suggestMenu.end );
      const caret     = this.suggestMenu.start + inserted.length;

      this.closeSuggestMenu();
      this.commitSearchValue( newValue );
      this.restoreCaret( newValue, caret );

    },

    // Bolds the typed fragment inside the suggested value, so each row reads as a
    // completion of what the user is typing. The fragment matches at the value start or a
    // word start (see wordStartsWith), so find its first occurrence and bold from there.
    // Plain string match, HTML-escaped.
    highlightTyped: function( value, typed ) {

      const fragment = ( typed || '' ).trim();
      const at = fragment ? value.toLowerCase().indexOf( fragment.toLowerCase() ) : -1;
      if ( at < 0 ) return _.escape( value );

      const before = _.escape( value.slice( 0, at ) );
      const hit    = _.escape( value.slice( at, at + fragment.length ) );
      const after  = _.escape( value.slice( at + fragment.length ) );

      return before + '<strong>' + hit + '</strong>' + after;

    },
    
    searchEnterBlur: _.debounce( function(e) {
      // Accepting a suggestion with Enter keeps focus so the user can keep typing; don't
      // blur in that case. Consume the one-shot flag set by suggestMenuKeydown.
      if ( this.suggestAcceptedEnter ) {
        this.suggestAcceptedEnter = false;
        return;
      }
      this.$refs.searchInput.blur();
    }, 100, { leading: false, trailing: true }),
    
    restoreOptions: function() {
      
      updateListRenderingOpts();
      
    },
    
    focusOnSearch: function() {
      
      let vue = this;
      scroll({ top: 0 });
      this.$refs.searchInput.focus();
      // this.highlightSearch = true;
      // setTimeout(function() { vue.highlightSearch = false; }, 1200);
      
    },
    
    // scrolling: _.throttle(function(e) {
    //   if (!this.fixedSearch && window.pageYOffset > 44) {
    //     this.fixedSearch = true;
    //   } else if (this.fixedSearch && window.pageYOffset < 44) {
    //     this.fixedSearch = false;
    //   }
    // }, 350),
    
    // onWaypoint({ going, direction }) {
    //   // going: in, out
    //   // direction: top, right, bottom, left
    //   if (going === this.$waypointMap.GOING_IN) {
    //     this.fixedSearch = false;
    //   } else {
    //     this.fixedSearch = true;
    //   }
    // },

    iosAutozoomDisable: function() {
      // IOS input focus zoom workaround
      if ( document.querySelector('.is-ios') ) {
        
        const head = document.querySelector("head");
        let metaViewport = head.querySelector("meta[name=viewport]");
        metaViewport.content = "width=device-width, initial-scale=1.0, user-scalable=0";
        
        clearTimeout(this.enableZoomTimer);
        this.enableZoomTimer = setTimeout(function() {
          metaViewport.content = "width=device-width, initial-scale=1.0, user-scalable=1";
        }, 700);
      }
    },
    
  },
  computed: {
    // HTML for the '@field' menu help tooltip: how a scope value list is written.
    searchHelpTooltip: function() {
      return [
        '<div class="scope-help">',
          '<div class="scope-help-title">Search for multiple:</div>',
          '<div class="scope-help-row"><code>,</code> Match all <span class="scope-help-eg">@tags:a,b</span></div>',
          '<div class="scope-help-row"><code>|</code> Match any <span class="scope-help-eg">@tags:a|b</span></div>',
          '<div class="scope-help-note"><code>@authors:king,stephen</code> matches both words in any order; <code>@authors:"stephen king"</code> matches those words in that order. Advanced operators work here too.</div>',
        '</div>',
      ].join('');
    },

    // Maps a scope item to the shape the search engine expects. 'key' is the scope's display
    // identity; 'field' is the book property actually searched (they differ for sub-page
    // entity scopes, where the namesake key reads the entity's 'name', so default field to
    // key). 'alias'/'label'/'icon' drive the '@'-autocomplete, derived from the scope rather
    // than a static table.
    scopeKey: function() {
      return function( item ) {
        return {
          name    : item.key,
          field   : item.field || item.key,
          weight  : item.weight || 0,
          alias   : item.alias,
          label   : item.label,
          icon    : item.icon,
          wordMode: item.wordMode,
          active      : item.active,
        };
      };
    },

    // The ACTIVE scopes: what plain (unprefixed) search matches, what the chips and the '@'
    // dropdown show.
    aliciaKeys: function() {
      const filteredKeys = _.filter( this.$store.state.listRenderingOpts.scope, [ "active", true ] );
      return _.map( filteredKeys, this.scopeKey );
    },

    // EVERY scope on the page, active or not. Drives '@field:' resolution so a field-prefixed
    // term overrides the scope checkboxes (e.g. @summary: works while summary is unchecked),
    // the long-standing override behavior. Plain search still uses only aliciaKeys.
    allScopeKeys: function() {
      return _.map( this.$store.state.listRenderingOpts.scope, this.scopeKey );
    },

    placeholder: function() {
      const placeholderKeys = (function(keys) {
        return _.map(keys, function(key) {
          return key.name.replace(".name", "");
        }).join(", ");
      })(this.aliciaKeys);

      return "Search: " + placeholderKeys;
    },

    // True when the 'summary' scope key is currently active. Summary lives in chunk
    // files, not on the book objects, so this drives hydration before searching.
    summaryScopeActive: function() {
      const summaryScope = _.find( this.$store.state.listRenderingOpts.scope, { key: 'summary' });
      return !!( summaryScope && summaryScope.active );
    },

    // Show a "preparing" hint while summary data is still loading behind an active
    // summary search.
    summarySearchPreparing: function() {
      return this.summaryScopeActive && this.summarySearchHydrating && this.$store.getters.searchIsActive;
    },
  },

  watch: {
    // Start hydrating summaries as soon as the summary scope becomes active, whether
    // toggled by hand, restored from sticky state, or set via a URL param on load.
    summaryScopeActive: {
      immediate: true,
      handler: function( active ) {
        if ( active ) this.hydrateSummaries();
      },
    },
  },
};
</script>

<style lang="scss">


#ale-search-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  align-content: center;
  justify-content: center;
  margin: 0 auto;
  padding-bottom: 30px;
  max-width: 600px;
  height: 46px;
  
  &.highlight-search #ale-search {
    // border: 3px solid $audibleOrange;
    background-color: $audibleOrange;
    &, & input { color: #fff; }
    ::placeholder { color: #fff; opacity: 1; }
    :-ms-input-placeholder { color: #fff; }
    ::-ms-input-placeholder { color: #fff; }
  }
  
}

#ale-search {
  // transition: all 10ms ease-in-out;
  // transition-delay: 500ms;
  width: 100%;
  height: 46px;
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-items: stretch;
  align-content: stretch;
  justify-content: stretch;
  position: relative;
  z-index: 800;
  top: 0px;
  text-align: center;
  background: #fff;
  border-radius: 999999px;
  @include themify($themes) {
    box-shadow: 0 5px 20px rgba(themed(outerColor), 0.9);
  }

  .search-wrapper {
    flex: 1;
    padding: 8px 20px;
    padding-right: 0px;
    display: flex;
    cursor: text;
    // Positioning context for the caret-anchored '@field' menu.
    position: relative;

    input[type="search"] {
      background-color: transparent;
      text-overflow: ellipsis;
      padding: 0px;
      outline: none;
      display: inline-block;
      flex-grow: 1;
      border: none;
      font-family: inherit;
      font-weight: 400;
      min-width: 30px;
      width: 100%;
    }

    input[type="search"]::-webkit-search-cancel-button {
      -webkit-appearance: none;
      height: 10px;
      width: 10px;
      padding: 5px;
      display: block;
      background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGRlZnM+PHN0eWxlPi5je2ZpbGw6IzZmNmY2Zjt9PC9zdHlsZT48L2RlZnM+PGc+PGc+PGc+PHBhdGggY2xhc3M9ImMiIGQ9Ik0yMCwxNi4wOWExLjU1LDEuNTUsMCwwLDEtLjQ3LDEuMTVsLTIuMjksMi4yOWExLjU1LDEuNTUsMCwwLDEtMS4xNS40N0ExLjYsMS42LDAsMCwxLDE1LDE5LjUzbC00Ljk1LTUtNSw1QTEuNTUsMS41NSwwLDAsMSwzLjkxLDIwYTEuNTUsMS41NSwwLDAsMS0xLjE1LS40N0wuNDcsMTcuMjRBMS41NSwxLjU1LDAsMCwxLDAsMTYuMDksMS42LDEuNiwwLDAsMSwuNDcsMTVsNS00Ljk1LTUtNUExLjUzLDEuNTMsMCwwLDEsMCwzLjkxLDEuNTUsMS41NSwwLDAsMSwuNDcsMi43NkwyLjc2LjQ3QTEuNTUsMS41NSwwLDAsMSwzLjkxLDAsMS41MywxLjUzLDAsMCwxLDUuMDUuNDdsNSw1TDE1LC40N0ExLjYsMS42LDAsMCwxLDE2LjA5LDBhMS41NSwxLjU1LDAsMCwxLDEuMTUuNDdsMi4yOSwyLjI5QTEuNTUsMS41NSwwLDAsMSwyMCwzLjkxYTEuNTMsMS41MywwLDAsMS0uNDcsMS4xNGwtNSw1LDUsNC45NUExLjYsMS42LDAsMCwxLDIwLDE2LjA5WiIvPjwvZz48L2c+PC9nPjwvc3ZnPg==");
      background-repeat: no-repeat;
      background-position: center center;
      background-size: 10px;
      cursor: pointer;
    }

    // '@field' autocomplete menu, anchored under the caret. Rounded panel, each row an
    // icon and a label, with the active row accented. Sized to its content.
    .field-menu {
      position: absolute;
      z-index: 900;
      margin-top: 4px;
      // Sized to the field rows. The legend fills this width (width: 100%) and wraps within
      // it rather than dictating its own, so it never stretches the menu wide.
      width: max-content;
      padding: 4px;
      border-radius: 10px;
      font-size: 0.85em;
      text-align: left;
      cursor: default;
      @include themify($themes) {
        background: color.adjust(themed(backColor), $lightness: 10%);
        color: themed(frontColor);
        border: 1px solid rgba(themed(frontColor), 0.12);
        box-shadow: 0 8px 24px rgba(themed(outerColor), 0.9);
      }

      .field-menu-header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px 5px;
        font-size: 0.82em;
        cursor: help;
        @include themify($themes) {
          color: rgba(themed(frontColor), 0.45);
        }

        .field-menu-help {
          display: inline-flex;
          cursor: help;
          svg {
            width: 12px;
            height: 12px;
          }
          @include themify($themes) {
            color: rgba(themed(frontColor), 0.4);
          }
          &:hover {
            @include themify($themes) {
              color: themed(audibleOrange);
            }
          }
        }
      }

      .field-menu-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        border-radius: 6px;
        cursor: pointer;
        white-space: nowrap;

        &.active {
          @include themify($themes) {
            background: rgba(themed(audibleOrange), 0.18);
          }
        }

        .field-menu-icon {
          display: inline-flex;
          width: 14px;
          justify-content: center;
          @include themify($themes) {
            color: rgba(themed(frontColor), 0.65);
          }
        }
        .field-menu-label {
          flex: 1;
        }
      }

    }

    // Autosuggest menu: full-width dropdown floating just under the input (absolute, so it
    // overlays the grid instead of pushing it down). Shares the '@field' menu's panel look.
    // Capped height with scroll so a long value list never runs off-screen.
    .suggest-menu {
      position: absolute;
      z-index: 900;
      left: 0;
      right: 0;
      top: 100%;
      margin-top: 4px;
      padding: 4px;
      border-radius: 10px;
      font-size: 0.9em;
      text-align: left;
      cursor: default;
      max-height: 280px;
      overflow-y: auto;
      @include themify($themes) {
        background: color.adjust(themed(backColor), $lightness: 10%);
        color: themed(frontColor);
        border: 1px solid rgba(themed(frontColor), 0.12);
        box-shadow: 0 8px 24px rgba(themed(outerColor), 0.9);
      }
      @extend .no-selection;

      .suggest-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        padding: 5px 10px;
        border-radius: 6px;
        cursor: pointer;

        &.active {
          @include themify($themes) {
            background: rgba(themed(audibleOrange), 0.18);
          }
        }

        // Scope icon leads the row as a meaningful bullet.
        .suggest-icon {
          display: inline-flex;
          width: 14px;
          flex-shrink: 0;
          justify-content: center;
          @include themify($themes) {
            color: rgba(themed(frontColor), 0.55);
          }
        }

        // The value text fills the row between the icon and the badge.
        .suggest-value {
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          strong {
            font-weight: 700;
            @include themify($themes) {
              color: themed(audibleOrange);
            }
          }
        }

        // Scope name as a small rounded pill on the right, so it reads as a tag belonging
        // to the row rather than floating form-label text. A thin border gives it a crisp
        // edge instead of a soft fill blob.
        .suggest-badge {
          flex-shrink: 0;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 0.66em;
          line-height: 1.4;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          @include themify($themes) {
            background: rgba(themed(frontColor), 0.05);
            border: 1px solid rgba(themed(frontColor), 0.15);
            color: rgba(themed(frontColor), 0.55);
          }
        }

        // On the active (highlighted) row, tint the badge to match the accent.
        &.active .suggest-badge {
          @include themify($themes) {
            background: rgba(themed(audibleOrange), 0.18);
            border-color: rgba(themed(audibleOrange), 0.45);
            color: rgba(themed(frontColor), 0.75);
          }
        }
      }
    }
  }

  .icons {
    position: relative;
    z-index: 2;
    padding: 0 18px 0 9px;
    color: rgba(#222, 0.65);
    display: flex;
    flex-direction: row;

    > .icon-wrap {
      cursor: pointer;
      margin-left: 5px;
      display: flex;
      justify-content: center;
      justify-items: center;
      align-content: center;
      align-items: center;
      outline: none;
      > div {
        padding: 0px 10px;
        outline: none;
      }
      position: relative;
      z-index: 0;
      &.disabled:before {
        content: "";
        position: absolute;
        z-index: 10;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
      &.disabled > div {
        opacity: 0.3;
      }
    }

    .filter {
      font-size: 0.92em;
    }

    .is-enabled,
    .active {
      @include themify($themes) {
        color: themed(audibleOrange);
      }
    }
    .active-filters {
      display: inline-flex;
      justify-items: center;
      justify-content: center;
      align-items: center;
      align-content: center;
    }
    .active-filters:before {
      content: '';
      position: absolute;
      z-index: -1;
      top: 7px;
      border-radius: 99999999999px;
      width: 6px;
      height: 6px;
      @include themify($themes) {
        background: themed(audibleOrange);
      }
    }
  }
  
}

@media (max-width: 370px) {
  #ale-search .icons > .icon-wrap > div {
    padding: 0 5px;
  }
}



#search-dropdown-overlay {
  position: fixed;
  z-index: 700;
  -webkit-backdrop-filter: grayscale(.96) blur(1.5px);
  backdrop-filter: grayscale(.96) blur(1.5px);
  background: rgba(#505050, .55);
  @supports (backdrop-filter: grayscale(.96)) or (-webkit-backdrop-filter: grayscale(.96)) {
    background: rgba(#505050, .2);
  }
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}


.summary-search-preparing {
  max-width: 600px;
  margin: -15px auto 20px;
  text-align: center;
  font-size: 0.9em;
  @include themify($themes) {
    color: rgba( themed(frontColor), 0.6 );
  }
}

// '@field' menu help tooltip. Rendered inside the tippy (appended to body), so it lives at
// the top level rather than nested under the search styles.
.scope-help {
  text-align: left;

  code {
    padding: 0 3px;
    border-radius: 3px;
    font-family: monospace;
    background: rgba(#fff, 0.12);
  }

  .scope-help-title {
    margin-bottom: 4px;
    opacity: 0.6;
    font-size: 0.9em;
  }

  .scope-help-row {
    white-space: nowrap;
    padding: 3px 0;

    // The leading symbol reads as a fixed first column.
    code {
      display: inline-block;
      min-width: 1.3em;
      margin-right: 7px;
      text-align: center;
    }

    .scope-help-eg {
      margin-left: 4px;
      font-family: monospace;
      opacity: 0.5;
    }
  }

  .scope-help-note {
    max-width: 340px;
    margin-top: 6px;
    padding-top: 6px;
    font-size: 0.9em;
    line-height: 1.7;
    opacity: 0.6;
    border-top: 1px solid rgba(#fff, 0.15);

    // Let a long example break anywhere so it flows into the line instead of jumping to the
    // next one whole; keeps the chip background.
    code {
      word-break: break-all;
    }
  }
}

</style>
