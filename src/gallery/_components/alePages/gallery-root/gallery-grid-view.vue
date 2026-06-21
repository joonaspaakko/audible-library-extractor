<template>
  <div
    class="ale-books grid-view"
    :class="{ 'sort-values-on': $store.getters.sortValues && ($store.getters.sortBy !== 'bookNumbers' && $store.getters.sortBy !== 'seriesOrder' ) }"
    ref="booksWrapper"
  >

    <div v-if="paddingTop" class="grid-spacer" :style="{ height: paddingTop + 'px' }" aria-hidden="true"></div>

    <template v-for="vRow in virtualRows" :key="'row:'+ vRow.index">
      <div class="ale-grid-row">
        <gallery-lazy
          v-for="(book, colIndex) in rows[ vRow.index ]"
          class="ale-book"
          :class="{ 'details-open': !!$route.query.book && $route.query.book === book.asin, 'image-loaded': imageLoaded }"
          :data-asin="book.asin"
          :key="'book:'+book.asin"
        >
          <gallery-book :book="book" :index="vRow.index * cols + colIndex" :sortValuesEnabled="$store.getters.sortValues" v-model:imageLoaded="imageLoaded"></gallery-book>
        </gallery-lazy>
      </div>

      <!-- Book details rendered in-flow under the open book's row. -->
      <div v-if="openRowIndex === vRow.index && $route.query.book" class="grid-details-wrap">
        <gallery-book-details :key="$route.query.book" :asin="$route.query.book" />
      </div>
    </template>

    <div v-if="paddingBottom" class="grid-spacer" :style="{ height: paddingBottom + 'px' }" aria-hidden="true"></div>

  </div>
</template>

<script>
import { useWindowVirtualizer } from "@tanstack/vue-virtual";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { computed, shallowRef, ref } from "vue";
import bookDetails from "@output-pages/gallery-root/gallery-grid-view/gallery-book-details.vue";
import loaderLight from "@output-images/gallery-table-loader-light.gif";
import loaderDark  from "@output-images/gallery-table-loader-dark.gif";
import slugify from "@output-mixins/gallery-slugify.js";

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

    return { store, booksWrapper, collection, rows, cols, cellHeight, scrollMargin, openRowIndex, virtualizer, virtualRows, paddingTop, paddingBottom };

  },

  data: function() {
    return {
      imageLoaded: false,
      restoringScroll: false,
      pendingOpenScroll: false,
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
  },

  mounted: function() {
    this.$compEmitter.on('afterWindowResize', this.measureGrid);

    this.$nextTick(function() {
      this.measureGrid();
      this.restoreScrollPosition();
      this.syncOpenDetails( this.$route.query.book );
      window.addEventListener('scroll', this.saveScrollPosition, { passive: true });
    });
  },
  beforeUnmount: function() {
    this.$compEmitter.off('afterWindowResize', this.measureGrid);
    window.removeEventListener('scroll', this.saveScrollPosition);
    this.$store.commit('prop', { key: 'openDetails', value: { index: -1, gapHeight: 0 } });
  },

  methods: {

    // GRID METRICS
    // Measure columns + cell height from a real rendered cover, and the container's
    // distance from the document top (scrollMargin for the window virtualizer).
    measureGrid: function() {

      const wrapper = this.booksWrapper;
      if ( !wrapper ) return;

      const wrapperWidth = wrapper.getBoundingClientRect().width;
      const cell = wrapper.querySelector('.ale-book');

      if ( cell ) {
        const cellBox = cell.getBoundingClientRect();
        this.cols = Math.floor( wrapperWidth / cellBox.width ) || 1;
        this.cellHeight = cellBox.height;
        // Share the measured column count so book-details vertical arrow nav steps
        // by the right number of covers (it can't reliably measure this itself).
        this.$store.commit('prop', { key: 'gridCols', value: this.cols });
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

      // Closed (no book): clear the reserved gap and re-measure so the row that had
      // the panel collapses back to a normal row immediately. Without this the
      // virtualizer keeps the stale gap in its cached total until those rows happen
      // to re-render on scroll (the gap lingered until you scrolled past it).
      if ( !asin || this.openRowIndex < 0 ) {
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
  text-align: center;
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
  text-align: center;
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

// In-flow book-details under the open row; the panel breaks out to full width itself
.grid-details-wrap {
  font-size: 14px;
  line-height: 1.55em;
  text-align: left;
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


  // Lazyload placeholder
  &:before {
    content: "";
    position: absolute;
    z-index: -1;
    top: 5px;
    right: 5px;
    bottom: 5px;
    left: 5px;
    border-radius: 5px;
    @include themify($themes) {
      background-color: themed(backColor);
      border: 1px solid rgba(themed(outerColor), 0.3);
    }
  }
  &:after {
    content: "";
    position: absolute;
    z-index: -1;
    top: 5px;
    right: 5px;
    bottom: 5px;
    left: 5px;
    border-radius: 5px;
    @include themify($themes) {
      background-color: themed(backColor);
      border: 1px solid rgba(themed(outerColor), 0.3);
    }
    background-repeat: no-repeat;
    background-position: center center;
    // Image set a few lines down...
  }

  &.mounted.image-loaded:before,
  &.mounted.image-loaded:after {
    display: none !important;
  }
}


.ale-book {
  width: $thumbnailSize + 2;
  height: $thumbnailSize + 2;
}
// For showing sort values correctly...
.sort-values-on .ale-book {
  height: $thumbnailSize + 2 + 27;
}

.ale-book:after {
  z-index: 0 !important;
}
.theme-light .ale-book:after {
  background-image: url(@output-images/gallery-table-loader-light.gif);
}
.theme-dark .ale-book:after {
  background-image: url("@output-images/gallery-table-loader-dark.gif");
}

@media (max-width: 767px) {
  .ale-book {
    width: calc( 26.3vw - 20px);
    height: calc( 26.3vw - 20px);
  }
  .sort-values-on .ale-book {
    height: calc(26.3vw - 20px + 27px);
  }
}

@media (max-width: 630px) {

  .ale-book {
    width: calc( 34.4vw - 24px);
    height: calc( 34.4vw - 24px);
  }
  .sort-values-on .ale-book {
    height: calc(34.4vw - 24px + 27px);
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
      padding-left: 0px;
      .icon-wrap:first-child > div { padding-left: 0px; }
    }
    > .icons {
      font-size: 0.9em;
    }
  }
}

@media (max-width: 504px) {

  .ale-book {
    width: calc( 50vw - 25px);
    height: calc( 50vw - 25px);
  }
  .sort-values-on .ale-book {
    height: calc(50vw - 25px + 27px);
  }
}

</style>
