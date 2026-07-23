<template>
  <div
    class="ale-books grid-view"
    :class="{
      'sort-values-on': $store.getters.sortValues && ($store.getters.sortBy !== 'bookNumbers' && $store.getters.sortBy !== 'seriesOrder' ),
      'sort-values-stacked': $store.getters.sortValues && $store.getters.sortValuesKey && $store.getters.sortValuesKey !== $store.getters.sortBy,
      'details-stacked': $store.state.sticky.gridDetailsMode === 'stacked',
      'details-list': $store.state.sticky.gridDetailsMode === 'list'
    }"
    :style="gridStyle"
    ref="booksWrapper"
  >

    <div v-if="paddingTop" class="grid-spacer" :style="{ height: paddingTop + 'px' }" aria-hidden="true"></div>

    <template v-for="vRow in virtualRows" :key="'row:'+ vRow.index">
      <div class="ale-grid-row" :class="{ centered: rows.length === 1 && rows[0].length < cols }">
        <div
          v-for="(book, colIndex) in rows[ vRow.index ]"
          class="ale-book"
          :class="{ 'details-open': !!$route.query.book && $route.query.book === book.asin }"
          :data-asin="book.asin"
          :key="'book:'+book.asin"
        >
          <gallery-book :book="book" :index="vRow.index * cols + colIndex" :sortValuesEnabled="$store.getters.sortValues" :detailsMode="$store.state.sticky.gridDetailsMode"></gallery-book>
        </div>
      </div>

      <!-- Book details rendered in-flow under the open book's row. -->
      <div v-if="openRowIndex === vRow.index && $route.query.book" class="grid-details-wrap">
        <gallery-book-details :key="$route.query.book" :asin="$route.query.book" />
      </div>
    </template>

    <div v-if="paddingBottom" class="grid-spacer" :style="{ height: paddingBottom + 'px' }" aria-hidden="true"></div>

    <!-- Position jump rail (window-scrolled, so fixed to the viewport). -->
    <gallery-segment-rail target="window" :fixed="true" :total="$store.getters.collection.length" :virtualItems="virtualRows" :cols="cols" />

    <!-- Shared overlay for the press-and-hold blurb peek. -->
    <gallery-blurb-peek ref="blurbPeek" :lookupBook="lookupBook" />

  </div>
</template>

<script>
import { useWindowVirtualizer, defaultRangeExtractor } from "@tanstack/vue-virtual";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { computed, shallowRef, ref } from "vue";
import bookDetails from "@output-pages/gallery-root/gallery-grid-view/gallery-book-details.vue";
import slugify from "@output-mixins/gallery-slugify.js";

// Default list cover edge, kept in sync with $detailsListCover in _variables.scss.
const LIST_COVER_DEFAULT = 90;
// Space a list card reserves for the title/author/length text beside the cover. The
// card's minimum width is cover + this, so bigger covers fit fewer per row and smaller
// covers fit more, the same way the cover slider drives the plain grid.
const LIST_TEXT_MIN_WIDTH = 200;
// Default cards per row in list mode when the covers-per-row slider hasn't been set. Capped
// to what fits, so it still drops to fewer columns as the viewport narrows.
const LIST_DEFAULT_COLS = 3;


export default {
  name: "aleBooks",
  components: { galleryBookDetails: bookDetails },
  mixins: [slugify],

  setup: function() {

    const store = useStore();
    const route = useRoute();
    const booksWrapper = shallowRef( null );

    // Measured from the live DOM (desktop is fixed px, mobile is vw-based, so we
    // never hardcode these). Updated on mount and window resize.
    const cols = ref( 1 );
    const cellHeight = ref( 182 );
    // Distance from the document top to the grid container (the window virtualizer
    // measures offsets in document space, so it needs this).
    const scrollMargin = ref( 0 );

    // The user can widen the grid past its default max so more covers fit per row
    // at their natural size. It's a max-width, so the viewport still bounds it on
    // narrow screens (the wrapper is centered with side padding from the page).
    const gridStyle = computed(function() {
      const style = {};
      // List cards manage their own width (they flex to fill the row), so the covers-per-row
      // max width doesn't apply there. Let the grid run full width in list mode instead.
      const listMode = store.state.sticky.gridDetailsMode === 'list';
      const max = store.state.sticky.gridMaxWidth;
      if ( max && !listMode ) style.maxWidth = max + 'px';
      // An explicit cover size feeds a CSS variable the cover cells read; when null the
      // cells fall back to their responsive default sizes.
      const coverSize = store.state.sticky.coverSize;
      if ( coverSize ) style['--cover-size'] = coverSize + 'px';
      return _.isEmpty( style ) ? null : style;
    });

    const collection = computed(function() {
      return store.getters.collection;
    });

    // Group the flat collection into rows of `cols`
    const rows = computed(function() {
      const list = collection.value;
      const perRow = cols.value;
      const out = [];
      for ( let i = 0; i < list.length; i += perRow ) {
        out.push( list.slice( i, i + perRow ) );
      }
      return out;
    });

    // The open book's row index, and the panel height to reserve after it (the
    // panel reports its measured height via ResizeObserver -> openDetails.gapHeight).
    const openRowIndex = computed(function() {
      const asin = route.query.book;
      if ( !asin ) return -1;
      const flatIndex = _.findIndex( collection.value, { asin: asin } );
      return flatIndex < 0 ? -1 : Math.floor( flatIndex / cols.value );
    });
    const gapHeight = computed(function() { return store.state.openDetails.gapHeight; });

    const virtualizerOptions = computed(function() {
      const open = openRowIndex.value;
      const gap = gapHeight.value;
      const rowH = cellHeight.value;
      return {
        count: rows.value.length,
        estimateSize: function( index ) {
          return index === open ? rowH + gap : rowH;
        },
        overscan: 4,
        // gapHeight is 0 until the ResizeObserver's first callback lands, which the browser
        // can delay for seconds - during that window estimateSize thinks the open row is a
        // normal cover row, so scrolling into the panel can push it out of the calculated
        // range and unmount it, collapsing the document and snapping the scroll back. Force
        // the open row into the range unconditionally so it can never be unmounted while
        // open, regardless of how stale the estimate is.
        rangeExtractor: function( range ) {
          
          const base = defaultRangeExtractor( range );
          if ( open < 0 || _.includes( base, open ) ) return base;
          
          const start = Math.min( base[ 0 ], open );
          const end = Math.max( base[ base.length - 1 ], open );
          return _.range( start, end + 1 );
          
        },
        scrollMargin: scrollMargin.value,
        // Keep an opened row clear of the fixed top nav (0 on mobile). scrollToIndex
        // with align:'start' lands the row at item.start - scrollPaddingStart, so this
        // offsets it below the nav - matching the old resetScroll(- topNavOffset - 25).
        scrollPaddingStart: store.state.topNavOffset + 25,
      };
    });

    const virtualizer = useWindowVirtualizer( virtualizerOptions );

    const virtualRows = computed(function() { return virtualizer.value.getVirtualItems(); });
    // Spacers are relative to the container, so subtract scrollMargin from the
    // document-space offsets the window virtualizer reports.
    const paddingTop = computed(function() {
      const r = virtualRows.value;
      return r.length ? Math.max( 0, r[ 0 ].start - scrollMargin.value ) : 0;
    });
    const paddingBottom = computed(function() {
      const r = virtualRows.value;
      if ( !r.length ) return 0;
      return Math.max( 0, virtualizer.value.getTotalSize() - r[ r.length - 1 ].end );
    });

    // Resolves an asin under the pointer to its book for the blurb-peek overlay.
    const lookupBook = ( asin ) => _.find( collection.value, { asin: asin } );

    return { store, booksWrapper, collection, rows, cols, cellHeight, gridStyle, scrollMargin, openRowIndex, virtualizer, virtualRows, paddingTop, paddingBottom, lookupBook };

  },

  data: function() {
    return {
      restoringScroll: false,
      pendingOpenScroll: false,
      detailsWrapObserver: null,
    };
  },

  // Hand the blurb-peek overlay down to the covers. They're siblings of the overlay
  // (both children here), so the shared ancestor provides it. A thin proxy reads the
  // ref lazily, since it isn't populated until after this provide() runs.
  provide: function() {
    const vue = this;
    return {
      blurbPeek: {
        blurbEnabled: function() { return vue.$refs.blurbPeek.blurbEnabled(); },
        start: function( event ) { vue.$refs.blurbPeek.start( event ); },
        consumeClick: function() { return vue.$refs.blurbPeek.consumeClick(); },
      },
    };
  },

  watch: {
    '$route.query.book': function( asin ) {
      this.syncOpenDetails( asin );
    },
    '$store.state.openDetails.gapHeight': function() {
      this.virtualizer.measure();
      // Re-pin the open row to the top ONLY when the gap change came from navigating
      // to another book (open / arrow / tab). Gap changes from reading interactions
      // (collapsing the summary, sidebar sections, etc.) must NOT yank the view, so
      // they are not flagged. pendingOpenScroll is set by syncOpenDetails on nav.
      if ( this.pendingOpenScroll && this.openRowIndex > -1 ) {
        this.pendingOpenScroll = false;
        const vue = this;
        this.$nextTick(function() {
          vue.virtualizer.scrollToIndex( vue.openRowIndex, { align: 'start' } );
        });
      }
    },
    '$store.getters.collection': function() {
      // Collection changed (sort/filter/search): re-measure the grid metrics
      this.$nextTick( this.measureGrid );
    },
    '$store.state.sticky.gridMaxWidth': function() {
      // Grid width changed: re-measure so the new column count is picked up and the
      // virtualizer re-rows the collection. Wait for the style to apply first.
      // Skip snapCoverSize: the user is adjusting covers-per-row explicitly, so snapping
      // the cover size to the new grid width would cause the two sliders to fight.
      this.$nextTick(() => this.measureGrid( true ) );
    },
    '$store.getters.sortValues': function() {
      // Toggling sort values on/off adds/removes the sort strip, changing cell height.
      this.$nextTick( this.measureGrid );
    },
    '$store.getters.sortValuesKey': function() {
      // The locked value stacks a second strip, growing the cell height. The collection
      // is unchanged so its watcher won't fire; re-measure once the class has applied.
      this.$nextTick( this.measureGrid );
    },
    '$store.state.sticky.coverSize': function() {
      // A new cover size changes the cell size while the grid width stays the same, so a
      // different number of columns fits. Re-measure once the style has applied.
      this.$nextTick( this.measureGrid );
    },
    '$store.state.sticky.gridListCols': function() {
      // The list covers-per-row slider sets the column count directly. Re-row to it.
      this.$nextTick( this.measureGrid );
    },
    '$store.state.sticky.gridDetailsMode': function() {
      // Each details layout changes the cell size: stacked makes cells taller, list makes
      // them wider and shorter. Both shift the column count, so re-measure once applied.
      this.$nextTick( this.measureGrid );
    },
  },

  mounted: function() {
    // Not this.measureGrid directly: mitt calls handlers with the event payload as the
    // first argument, which would land in measureGrid's skipSnapCoverSize parameter and
    // make it truthy, silently skipping snapCoverSize on every resize.
    this.$compEmitter.on('afterWindowResize', this.onWindowResizeMeasure);

    this.$nextTick(function() {
      this.measureGrid();
      this.restoreScrollPosition();
      this.syncOpenDetails( this.$route.query.book );
      window.addEventListener('scroll', this.saveScrollPosition, { passive: true });
    });
  },
  beforeUnmount: function() {
    this.$compEmitter.off('afterWindowResize', this.onWindowResizeMeasure);
    if ( this.detailsWrapObserver ) {
      this.detailsWrapObserver.disconnect();
      this.detailsWrapObserver = null;
    }
    window.removeEventListener('scroll', this.saveScrollPosition);
    this.$store.commit('prop', { key: 'openDetails', value: { index: -1, gapHeight: 0 } });
    this.$store.commit('prop', { key: 'scrollVisibleIndex', value: -1 });
  },

  methods: {

    // GAP HEIGHT
    // Watches .grid-details-wrap with a ResizeObserver so gapHeight always matches
    // the wrapper's actual flow height (including the panel's margins). Called from
    // syncOpenDetails after the wrapper is in the DOM, and torn down on close.
    // The wrapper is a sibling of the virtualizer's padding spacers — not inside them
    // — so the spacers resizing does not trigger this observer. No feedback loop.
    observeDetailsWrap: function( el ) {

      if ( this.detailsWrapObserver ) {
        this.detailsWrapObserver.disconnect();
        this.detailsWrapObserver = null;
      }

      if ( !el ) return;

      const store = this.$store;
      this.detailsWrapObserver = new ResizeObserver(function( entries ) {
        const entry = entries[0];
        if ( !entry ) return;
        const height = entry.borderBoxSize
          ? entry.borderBoxSize[0].blockSize
          : entry.contentRect.height;
        if ( height < 1 ) return;
        const current = store.state.openDetails;
        if ( Math.abs( current.gapHeight - height ) < 2 ) return;
        store.commit('prop', { key: 'openDetails', value: { index: current.index, gapHeight: height } });
      });
      this.detailsWrapObserver.observe( el, { box: 'border-box' } );

    },

    // Window resize handler: measureGrid takes skipSnapCoverSize as its first argument,
    // so it can't be registered on the emitter directly (mitt passes the event payload).
    onWindowResizeMeasure: function() {
      this.measureGrid();
    },

    // GRID METRICS
    // Measure columns + cell height from a real rendered cover (covers keep their
    // natural CSS size; the grid's max width is what changes), plus the container's
    // distance from the document top (scrollMargin for the window virtualizer).
    measureGrid: function( skipSnapCoverSize ) {

      const wrapper = this.booksWrapper;
      if ( !wrapper ) return;

      const wrapperWidth = wrapper.getBoundingClientRect().width;
      const cell = wrapper.querySelector('.ale-book');

      // Covers-per-row / cover size slider bounds. Only depend on the parent, not a
      // rendered cover, so run unconditionally (a resize during zero results shouldn't
      // leave these stale).
      const parent = wrapper.parentElement;
      const parentStyle = window.getComputedStyle( parent );
      const parentPadding = parseFloat( parentStyle.paddingLeft ) + parseFloat( parentStyle.paddingRight );
      const available = parent.getBoundingClientRect().width - parentPadding;
      // The default (no-override) max width is the smaller of the CSS default and
      // the space available, so it matches what the grid shows at rest.
      const cssDefault = 728;
      this.$store.commit('prop', [
        { key: 'gridDefaultMaxWidth', value: Math.min( cssDefault, available ) },
        { key: 'gridAvailableWidth', value: available },
      ]);
      if ( !skipSnapCoverSize ) this.$store.commit('snapCoverSize');

      if ( cell ) {
        const cellBox = cell.getBoundingClientRect();
        // List cards stretch to fill the row, so their measured width is already the full
        // share and dividing by it always yields one column. Derive the count from a
        // minimum card width instead, so cards never get narrower than that before another
        // column drops off.
        if ( this.$store.state.sticky.gridDetailsMode === 'list' ) {
          // How many cards fit at their minimum width is the ceiling for any width. The
          // minimum grows with the cover size, so bigger covers fit fewer per row.
          const listCover = this.$store.state.sticky.coverSize || LIST_COVER_DEFAULT;
          const listCardMin = listCover + LIST_TEXT_MIN_WIDTH;
          const fits = Math.floor( wrapperWidth / listCardMin ) || 1;
          // An explicit count (the covers-per-row slider) wins, but never beyond what fits,
          // so the row still drops columns as the viewport narrows. Without one, default to
          // three per row, also capped to what fits so it drops on narrow viewports.
          const listCols = this.$store.state.sticky.gridListCols || LIST_DEFAULT_COLS;
          this.cols = Math.min( listCols, fits );
        }
        else {
          this.cols = Math.floor( wrapperWidth / cellBox.width ) || 1;
        }
        this.cellHeight = cellBox.height;
        // gridCols: book-details arrow nav steps by it. gridCoverWidth: the
        // covers-per-row slider's step / unit.
        this.$store.commit('prop', [
          { key: 'gridCols', value: this.cols },
          { key: 'gridCoverWidth', value: cellBox.width },
        ]);
      }

      this.scrollMargin = wrapper.getBoundingClientRect().top + window.scrollY;

      this.virtualizer.measure();

    },

    // SCROLL RESTORE
    restoreScrollPosition: function() {

      this.restoringScroll = true;
      const vue = this;
      setTimeout(function() { vue.restoringScroll = false; }, 250);

      const bookParam = this.$route.query.book;
      if ( bookParam ) {
        const flatIndex = _.findIndex( this.collection, { asin: bookParam } );
        if ( flatIndex > -1 ) this.virtualizer.scrollToIndex( Math.floor( flatIndex / this.cols ), { align: 'start' } );
        return;
      }

      const row = this.$route.query.row ? parseInt( this.$route.query.row, 10 ) : 0;
      if ( row > 0 ) this.virtualizer.scrollToIndex( row, { align: 'start' } );

    },

    saveScrollPosition: _.throttle( function() {
      if ( !this.$store.state.lazyScroll ) return;
      if ( this.restoringScroll ) return;
      const topItem = this.virtualizer.getVirtualItemForOffset( this.virtualizer.getScrollOffset() );
      if ( !topItem ) return;
      this.$updateQueries({ row: topItem.index > 0 ? topItem.index : null });
    }, 450, { leading: false, trailing: true }),

    // OPEN DETAILS
    // openRowIndex is derived reactively from the route + collection. Make sure the
    // open row is rendered so the panel can measure itself and anchor to the cover.
    // This only fires on book change (route watcher / mount), NOT on scroll, so the
    // panel re-mounting when its row scrolls back into view won't re-scroll the page.
    syncOpenDetails: function( asin ) {

      // Closed (no book): stop observing, clear the reserved gap, re-measure.
      if ( !asin || this.openRowIndex < 0 ) {
        this.observeDetailsWrap( null );
        if ( this.$store.state.openDetails.gapHeight !== 0 ) {
          this.$store.commit('prop', { key: 'openDetails', value: { index: -1, gapHeight: 0 } });
        }
        this.virtualizer.measure();
        return;
      }

      // Reset the reserved gap to 0 immediately. Otherwise the PREVIOUS book's gap
      // height stays in the store and gets applied to the NEW open row, throwing off
      // the offset math during the transition - which landed the view below the panel
      // when changing rows (and never self-corrected if the new panel was the same
      // height, since the gapHeight watcher wouldn't fire).
      this.$store.commit('prop', { key: 'openDetails', value: { index: this.openRowIndex, gapHeight: 0 } });

      // A book was navigated to (open / arrow / tab). Pin its row to the top: scroll
      // now (mounts the panel so it can measure) and, via pendingOpenScroll, again
      // once the panel's gap settles - so the cover lands at top regardless of the
      // panel's height or scroll direction. The flag is what tells the gapHeight
      // watcher this change is navigation (re-pin) vs. in-panel reading (leave be).
      this.pendingOpenScroll = true;
      const vue = this;
      this.$nextTick(function() {
        vue.virtualizer.scrollToIndex( vue.openRowIndex, { align: 'start' } );
        // gapHeight stays 0 until the ResizeObserver's first (async, sometimes delayed)
        // callback lands. That's fine now: the rangeExtractor keeps the open row rendered
        // regardless of its estimated size, so a stale gap only leaves the rows below it
        // momentarily mis-spaced (the observer corrects that) - it can no longer virtualize
        // the panel away mid-scroll and snap the view back.
        vue.observeDetailsWrap( vue.$el.querySelector('.grid-details-wrap') );
      });
      // Safety: if the gap doesn't change (next book's panel is the same height) the
      // watcher won't fire - clear the flag so a later in-panel collapse/expand isn't
      // mistaken for navigation and doesn't yank the view back to top.
      clearTimeout( this.pendingOpenScrollTimer );
      this.pendingOpenScrollTimer = setTimeout(function() { vue.pendingOpenScroll = false; }, 500);

    },

  },
};
</script>

<style lang="scss">


.ale-books.grid-view {
  // Window-scrolled (the page scrolls), so covers scroll off the top of the
  // viewport cleanly rather than clipping at a container edge.
  position: relative;
  max-width: 728px;
  margin: 0 auto 350px auto;
  text-align: left;
  font-size: 0px;
  line-height: 0px;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

// A virtualized row of covers (normal flow, between the top/bottom spacers)
.ale-grid-row {
  font-size: 0px;
  line-height: 0px;
  text-align: left;
  &.centered {
    text-align: center;
  }
}

// Reset the font context inside each cover cell (the grid container / row wrappers
// use font-size:0 to kill inline-block whitespace; covers and their hover markers
// rely on a real inherited font-size, so restore it here - matches the old
// `.ale-books.grid-view > div` rule before the rows were wrapped).
.ale-book {
  font-size: 14px;
  line-height: 1.55em;
}

// Top/bottom virtual-scroll spacers (height only)
.grid-spacer {
  font-size: 0px;
  line-height: 0px;
}

// In-flow book-details under the open row; the panel breaks out to full width itself.
// display:flow-root establishes a BFC so the panel's top margin doesn't collapse out
// of this wrapper, keeping the measured height stable across mount/unmount cycles.
.grid-details-wrap {
  font-size: 14px;
  line-height: 1.55em;
  text-align: left;
  display: flow-root;
  padding-top: 12px;
  padding-bottom: 35px;
}


body:not(.is-mobile) .ale-book:hover .ale-cover-icon {
  display: inline-block;
}

.theme-dark .ale-book.details-open .details-inner-wrap {
  background: color.adjust($darkBackColor, $lightness: 9%);
}
.theme-light  .ale-book.details-open .details-inner-wrap {
  background: #202020;
}
// In list and stacked mode the inner wrap covers the whole card including the text strip,
// so the open-book dark fill would make the strip text unreadable. Keep a neutral card
// background instead (the orange highlight border still marks the open book).
.theme-light.details-list .ale-book.details-open .details-inner-wrap,
.theme-light .details-list .ale-book.details-open .details-inner-wrap {
  background: #fff;
}
.theme-dark.details-list .ale-book.details-open .details-inner-wrap,
.theme-dark .details-list .ale-book.details-open .details-inner-wrap {
  background: #171717;
}
.theme-light.details-stacked .ale-book.details-open .details-inner-wrap,
.theme-light .details-stacked .ale-book.details-open .details-inner-wrap {
  background: #e8e8e8;
}
.theme-dark.details-stacked .ale-book.details-open .details-inner-wrap,
.theme-dark .details-stacked .ale-book.details-open .details-inner-wrap {
  background: color.adjust($darkBackColor, $lightness: 9%);
}

.ale-book {
  position: relative;
  z-index: 0;
  text-align: center;
  display: inline-block;
  // font-size: 0;

  &.details-open .ale-cover-icon {
    display: inline-block;
  }

  &.details-open .details-inner-wrap {
    @include themify($themes) {
      border-color: themed(audibleOrange);
      box-shadow: 0 0 0 3px themed(audibleOrange), 0 2px 10px rgba(#000, 0.7);
    }
    .ale-info-indicator.not-in-library { display: none; }
    .placeholder-cover,
    .ale-cover-image {
      -webkit-filter: unset !important;
      filter: unset !important;
    }
    .ale-info-indicator {
      display: none !important;
    }
  }
}


// Cover size: the covers-per-row slider sets --cover-size when overridden; otherwise the
// per-breakpoint default below is the fallback, so resizing keeps the responsive behavior.
.ale-book {
  width: var(--cover-size, #{$thumbnailSize + 2});
  height: var(--cover-size, #{$thumbnailSize + 2});
}
// For showing sort values correctly...
.sort-values-on .ale-book,
.sort-values-stacked .ale-book {
  height: auto;
}

// DETAILS: STACKED
// Title/author/length strip under the cover, so the cell grows by the strip height. The
// cover stays square (its own width), so the wrapper becomes a column and the cover sits
// on top with the strip filling the rest.
// Strip height scales with cover size to match the scaled font size, with the same
// clamp bounds as the font-size rule in gallery-book.vue.
// 3 lines * line-height 1.3 * font-size + top padding (6px).
.details-stacked .ale-book,
.sort-values-on.details-stacked .ale-book,
.sort-values-stacked.details-stacked .ale-book {
  height: auto;
}
.details-stacked .details-inner-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: visible;
}
// The cover keeps its square aspect (its img wrapper pads to 100% of its own width), so
// don't pin a height here, just stop it from stretching to fill the taller cell.
.details-stacked .ale-cover {
  flex: 0 0 auto;
}
.details-stacked .book-details-strip {
  padding: 6px 4px 0;
}

// DETAILS: LIST
// A wide, short card: square cover on the left, text to the right. Cards stretch to fill
// the row (the row is a flexbox, each card flexes equally), so the covers-per-row column
// count decides how many cards share the width, edge to edge. A single column gives one
// full-width row. The cover is a fixed square; the text column takes the rest.
// $detailsListCover is defined in _variables.scss
// The widest a single card grows to. Cards flex to fill a narrow row (so there are no dead
// gaps on small screens), but stop here once the row is wide, so on a big screen they keep
// the fixed feel of the plain grid instead of stretching liquid edge to edge. Scales with
// the cover so a bigger cover gets a proportionally roomier text column. This is the max
// text reserve, larger than the LIST_TEXT_MIN_WIDTH used to count columns, so a card has
// room to stretch from its minimum up to this cap before going fixed.
$detailsListCardMax: 300px;
// List cards cap their own width, so let the container run the full available width (the
// column count is measured from this width). The card row centers within it, and the open
// details panel sizes itself to the rendered card span (see repositionBookDetails in
// gallery-book-details.vue) so the two line up. Drop the cover grid's default 728px cap.
.ale-books.grid-view.details-list {
  max-width: none;
}
.details-list .ale-grid-row {
  display: flex;
  flex-direction: row;
  gap: 4px;
  // Cards cap their width rather than stretching, so a wide row has leftover space. Center
  // the cards so that slack splits evenly instead of all trailing right, matching how the
  // plain grid sits centered on the page.
  justify-content: center;
}
.details-list .ale-book {
  flex: 1 1 0;
  min-width: 0;
  width: auto;
  // Grow to fill a narrow row, but stop at the cap so a wide row leaves a trailing gap
  // (the fixed-grid feel) instead of stretching each card edge to edge.
  max-width: calc(var(--cover-size, #{$detailsListCover}) + #{$detailsListCardMax});
  // Cover, plus the card's padding (8px each side), margin (5px each side) and border.
  // The cover follows the cover-size slider (var) and falls back to the default otherwise.
  height: calc(var(--cover-size, #{$detailsListCover}) + 28px);
}
.details-list .details-inner-wrap {
  display: flex;
  flex-direction: row;
  // Sort values (when shown) wrap onto their own full-width line above the cover|text row.
  flex-wrap: wrap;
  align-items: center;
}
// Sort values stack above the cover|text row: force them to a full-width first line.
.details-list .sort-values-container {
  flex: 0 0 100%;
  width: 100%;
}
// With sort values on, the card gains the extra strip on top, so let it grow past the
// cover height. The virtualizer measures the real rendered height, so auto is safe.
.details-list.sort-values-on .ale-book {
  height: auto;
}
// Fixed square cover. align-self stops the flex row from stretching it to the card height
// (which would give it an indefinite height that the percentage-sized image can't resolve,
// collapsing the cover). Everything below is sized in explicit pixels for the same reason:
// no percentage chain that depends on an indefinite parent.
.details-list .ale-cover {
  flex: 0 0 var(--cover-size, #{$detailsListCover});
  align-self: flex-start;
  width: var(--cover-size, #{$detailsListCover});
  height: var(--cover-size, #{$detailsListCover});
}
// The base cover sizing builds its square from width-percentages and padding tricks that
// assume an auto-height parent. Here the box is a fixed square (sized by the cover-size
// slider via the var), so size the wrapper and image to that explicit square directly. The
// .ale-book ancestor keeps these ahead of gallery-book's scoped base rules regardless of
// stylesheet order.
.details-list .ale-book .ale-cover .cover-img-wrapper,
.details-list .ale-book .ale-cover .placeholder-cover {
  width: var(--cover-size, #{$detailsListCover});
  height: var(--cover-size, #{$detailsListCover});
  padding-bottom: 0;
}
.details-list .ale-book .ale-cover img.ale-cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--cover-size, #{$detailsListCover});
  height: var(--cover-size, #{$detailsListCover});
  padding-top: 0;
}
// The text block fills the column to the right of the cover, centered vertically.
.details-list .book-details-strip {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px;
}
// Each card gets a panel background, border and padding so it reads as its own card rather
// than a bare cover with floating text.
.details-list .details-inner-wrap {
  border-radius: 8px;
  padding: 8px;
  box-sizing: border-box;
}
.theme-light .details-list .details-inner-wrap {
  background: #fff;
  border: 1px solid rgba($lightFrontColor, .18);
}
.theme-dark .details-list .details-inner-wrap {
  background: #171717;
  border: 1px solid rgba($darkFrontColor, .12);
}
// The cover-only views show a hover overlay (the open-details icon and its lightening
// wash) over the whole cover. In list mode the whole card opens the book, so the wash
// over just the cover reads as a stray highlight. Suppress the overlay here.
.details-list .ale-click-wrap:hover .ale-info-indicator {
  display: none;
}
// The whole card opens the book, not just the cover, so the pointer cursor covers it all.
.details-list .details-inner-wrap {
  cursor: pointer;
}

@media (max-width: 767px) {
  .ale-book {
    width: var(--cover-size, calc(26.3vw - 20px));
    height: var(--cover-size, calc(26.3vw - 20px));
  }
  .sort-values-on .ale-book,
  .sort-values-stacked .ale-book {
    height: auto;
  }
}

@media (max-width: 630px) {

  .ale-book {
    width: var(--cover-size, calc(34.4vw - 24px));
    height: var(--cover-size, calc(34.4vw - 24px));
  }
  .sort-values-on .ale-book,
  .sort-values-stacked .ale-book {
    height: auto;
  }

}

@media (max-width: 616px) {

  #ale-search {
    .icon-wrap {
      &:first-child {
        margin-left: 0;
        > div {
          padding-left: 0 7px;
        }
      }
    }
  }
}

@media (max-width: 504px) {

  #ale-search-wrap {
    padding-left: 10px;
    padding-right: 10px;
  }
  #ale-search {
    > .icons {
      font-size: 0.9em;
    }
  }
}

@media (max-width: 504px) {

  .ale-book {
    width: var(--cover-size, calc(50vw - 25px));
    height: var(--cover-size, calc(50vw - 25px));
  }
  .sort-values-on .ale-book,
  .sort-values-stacked .ale-book {
    height: auto;
  }
  // Stacked: use the same 2-up fallback as the plain grid so the default auto size
  // matches the flowing layout an explicit cover-size value would give.
  .details-stacked .ale-book {
    width: var(--cover-size, calc(50vw - 25px));
  }
  // List cards already flex to fill the row, so at this width the column count falls to
  // one on its own (the wrapper is narrower than the min card width). Nothing to override.
}

</style>
