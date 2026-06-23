<template>
<div
class="ale-books list-view"
ref="listView"
:style="{ top: spreadsheetTop + 'px' }"
>

  <!-- Position jump rail (inner-container scrolled). -->
  <gallery-segment-rail target=".list-view-inner-wrap" :total="$store.getters.collection.length" :virtualItems="virtualRows" />

  <!-- COLUMN MENU (gear icon) -->
  <!-- Clicking the gear icon opens the column menu that you can also open by right-clicking the header. -->
  <button
    class="column-menu-gear"
    title="Show / hide columns"
    @mousedown.stop
    @click="openColumnMenu"
  >
    <mdi-cog />
  </button>

  <component is="style" type="text/css" v-if="frozenColumnStyles">{{ frozenColumnStyles }}</component>

  <div class="list-view-inner-wrap" ref="scrollWrap">
    <table>
      <thead>
        <gallery-header :keys="keys" :frozenKeys="frozenKeys" @open-column-menu="openColumnMenu"></gallery-header>
      </thead>
      <tbody>

        <tr v-if="paddingTop" class="virtual-spacer" :style="{ height: paddingTop + 'px' }" aria-hidden="true"></tr>

        <template v-for="row in virtualRows" :key="'book:'+ collection[ row.index ].asin">
          <gallery-row
            class="ale-row mounted"
            :class="{ odd: row.index % 2, 'details-open': openIndex === row.index }"
            :data-asin="collection[ row.index ].asin"
            :book="collection[ row.index ]"
            :rowIndex="row.index"
            :keys="keys"
            :frozenKeys="frozenKeys"
          ></gallery-row>
          <!-- Book details rendered in-flow at the open row, inside the gap the virtualizer reserves for it -->
          <tr v-if="openIndex === row.index && $route.query.book" class="details-gap-row">
            <td :colspan="keys.length">
              <gallery-book-details :key="$route.query.book" :asin="$route.query.book" />
            </td>
          </tr>
        </template>

        <tr v-if="paddingBottom" class="virtual-spacer" :style="{ height: paddingBottom + 'px' }" aria-hidden="true"></tr>

      </tbody>
    </table>
  </div>

  <gallery-column-menu
    v-if="columnMenu"
    :x="columnMenu.x"
    :y="columnMenu.y"
    :allKeys="orderedKeys"
    :hiddenKeys="hiddenKeys"
    :frozenKeys="frozenKeys"
  ></gallery-column-menu>

</div>
</template>

<script>
import { useVirtualizer } from "@tanstack/vue-virtual";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { computed, shallowRef } from "vue";
import bookDetails from "@output-pages/gallery-root/gallery-grid-view/gallery-book-details.vue";
import loaderLight from "@output-images/gallery-table-loader-light.gif";
import loaderDark  from "@output-images/gallery-table-loader-dark.gif";
import stringifyArray from "@output-mixins/gallery-stringifyArray.js";
import prepareKeys from "@output-mixins/gallery-prepareKeys.js";
import columnMenu from "@output-pages/gallery-root/gallery-list-view/gallery-column-menu.vue";

// FIXED ROW HEIGHT
// keep in sync with .ale-row height in the styles below
const ROW_HEIGHT = 28;

// COLUMNS HIDDEN BY DEFAULT
// lower-value columns so the table doesn't open with everything crammed in. This is the
// effective hidden set only while sticky.listColumnsHidden is null; the moment the user
// toggles anything in the menu it materializes into an explicit list and this is ignored.
// Includes the keys prepareKeys used to strip structurally (cover, sample, blurb...): the
// list view surfaces every key so they're all revealable, just hidden out of the box.
const DEFAULT_HIDDEN_COLUMNS = [
  // visible by default: title, series, bookNumbers, authors, narrators, length, progress,
  // added, myRating, rating. everything below stays revealable from the menu.
  "ratings",
  "favorite",
  "tags",
  "categories",
  "releaseDate",
  "publishers",
  "format",
  "language",
  "downloaded",
  "whispersync",
  "fromPlusCatalog",
  "unavailable",
  "archived",
  "storePageChanged",
  "storePageMissing",
  "isbn10",
  "isbn13",
  // formerly structurally excluded in prepareKeys: raw/array/duplicate fields
  "titleShort",
  "sample",
  "blurb",
  "url",
  "summary",
  "moreLikeThis",
  "peopleAlsoBought",
  "asin",
  "cover",
  "isbns",
];

// COLUMNS FROZEN BY DEFAULT
// title anchors the row and has always been stuck to the left edge; it stays frozen out of
// the box. Effective only while sticky.listColumnsFrozen is null; the first freeze toggle
// materializes an explicit list and this is ignored.
const DEFAULT_FROZEN_COLUMNS = [ "title", "added" ];

export default {
  name: "aleBooks",
  components: { galleryBookDetails: bookDetails, galleryColumnMenu: columnMenu },
  mixins: [stringifyArray, prepareKeys],

  setup: function() {

    const store = useStore();
    const scrollWrap = shallowRef( null );

    // The full sorted/filtered list the virtualizer iterates
    const collection = computed(function() {
      return store.getters.collection;
    });

    // The open book's row index (derived reactively from the route + collection,
    // so it resolves correctly no matter the order collection/route settle) and
    // the panel height to reserve after it (reported by the panel's ResizeObserver).
    const route = useRoute();
    const openIndex = computed(function() {
      const asin = route.query.book;
      if ( !asin ) return -1;
      return _.findIndex( collection.value, { asin: asin } );
    });
    const gapHeight = computed(function() { return store.state.openDetails.gapHeight; });

    const virtualizerOptions = computed(function() {
      // Referenced so the size function recomputes when the open row / gap changes
      const open = openIndex.value;
      const gap = gapHeight.value;
      return {
        count: collection.value.length,
        getScrollElement: function() { return scrollWrap.value; },
        estimateSize: function( index ) {
          return index === open ? ROW_HEIGHT + gap : ROW_HEIGHT;
        },
        overscan: 8,
      };
    });

    const virtualizer = useVirtualizer( virtualizerOptions );

    const virtualRows = computed(function() { return virtualizer.value.getVirtualItems(); });
    const paddingTop = computed(function() {
      const rows = virtualRows.value;
      return rows.length ? rows[ 0 ].start : 0;
    });
    const paddingBottom = computed(function() {
      const rows = virtualRows.value;
      return rows.length ? virtualizer.value.getTotalSize() - rows[ rows.length - 1 ].end : 0;
    });

    return { scrollWrap, collection, virtualizer, virtualRows, paddingTop, paddingBottom, openIndex };

  },

  data: function() {
    return {
      spreadsheetTop: 170,
      keys: "",
      restoringScroll: false,
      // The unfiltered structurally-valid columns, fed to the menu so it lists every
      // toggleable column regardless of what's currently visible.
      allKeys: [],
      // { x, y } while the menu is open, null when closed.
      columnMenu: null,
      // Generated CSS that sticks each frozen column at its cumulative left offset.
      frozenColumnStyles: "",
    };
  },

  computed: {
    // null = user hasn't customized, so the default seed applies; an array = explicit
    // user choice (even an empty one means "show everything").
    hiddenKeys: function() {
      const hidden = this.$store.state.sticky.listColumnsHidden;
      return hidden === null ? DEFAULT_HIDDEN_COLUMNS : hidden;
    },

    // null = uncustomized, so the default seed applies; an array = explicit user choice.
    frozenKeys: function() {
      const frozen = this.$store.state.sticky.listColumnsFrozen;
      return frozen === null ? DEFAULT_FROZEN_COLUMNS : frozen;
    },

    // allKeys arranged by the user's saved order. Keys not in the saved order keep their
    // natural position appended after the ordered ones, so newly surfaced fields still show.
    orderedKeys: function() {
      const order = this.$store.state.sticky.listColumnsOrder;
      if ( !order ) return this.allKeys;
      const allKeys = this.allKeys;
      const known = _.filter( order, function( key ) {
        return _.includes( allKeys, key );
      });
      const leftovers = _.reject( allKeys, function( key ) {
        return _.includes( order, key );
      });
      return known.concat( leftovers );
    },
  },
  
  watch: {
    '$store.state.desktopPlayerHeight'() {
      this.setSpreadsheetOffset();
    },
    '$route.query.book': function( asin ) {
      this.syncOpenDetails( asin );
    },
    '$store.state.openDetails.gapHeight': function() {
      // Panel changed height: recompute virtual offsets so rows below shift to match.
      this.virtualizer.measure();
    },
    '$store.state.sticky.listColumnsHidden': function() {
      this.applyColumnVisibility();
    },
    '$store.state.sticky.listColumnsOrder': function() {
      this.applyColumnVisibility();
    },
    '$store.state.sticky.listColumnsFrozen': function() {
      this.$nextTick( this.computeFrozenOffsets );
    },
  },

  created: function() {
    // removeKeys: [] surfaces every key (no structural exclusions); visibility is handled
    // entirely by the hidden set below so all columns stay revealable from the menu.
    this.allKeys = this.prepareKeys({ removeKeys: [] });
    this.applyColumnVisibility();
  },

  mounted: function() {
    this.setSpreadsheetOffset();
    this.$compEmitter.on('afterWindowResize', this.setSpreadsheetOffset);
    // Column widths shift on resize, so the frozen stack offsets have to be re-measured.
    this.$compEmitter.on('afterWindowResize', this.computeFrozenOffsets);

    document.addEventListener('mousedown', this.closeColumnMenu);

    this.$nextTick(function() {
      this.restoreScrollPosition();
      this.syncOpenDetails( this.$route.query.book );
      this.scrollWrap.addEventListener('scroll', this.saveScrollPosition, { passive: true });
      this.computeFrozenOffsets();
    });
  },
  beforeUnmount: function() {
    this.$compEmitter.off('afterWindowResize', this.setSpreadsheetOffset);
    this.$compEmitter.off('afterWindowResize', this.computeFrozenOffsets);
    document.removeEventListener('mousedown', this.closeColumnMenu);
    if ( this.scrollWrap ) this.scrollWrap.removeEventListener('scroll', this.saveScrollPosition);
    this.$store.commit('prop', { key: 'openDetails', value: { index: -1, gapHeight: 0 } });
    this.$store.commit('prop', { key: 'scrollVisibleIndex', value: -1 });
  },

  methods: {
    
    setSpreadsheetOffset: function() {
      this.$nextTick(function() {
        
        const searchWrap = document.querySelector('#ale-search-wrap');
        const searchOffset = window.pageYOffset + searchWrap.getBoundingClientRect().top;
        const searchHeight = searchWrap.offsetHeight;
        this.spreadsheetTop = searchOffset + searchHeight;
        
      });
    },

    // SCROLL RESTORE
    // book details takes precedence: scroll to the open book, otherwise restore the saved row
    restoreScrollPosition: function() {

      // Suppress save while the programmatic restore scroll settles
      this.restoringScroll = true;
      const vue = this;
      setTimeout(function() { vue.restoringScroll = false; }, 250);

      const bookParam = this.$route.query.book;
      if ( bookParam ) {
        const bookIndex = _.findIndex( this.collection, { asin: bookParam } );
        if ( bookIndex > -1 ) this.virtualizer.scrollToIndex( bookIndex, { align: 'center' } );
        return;
      }

      const row = this.$route.query.row ? parseInt( this.$route.query.row, 10 ) : 0;
      if ( row > 0 ) this.virtualizer.scrollToIndex( row, { align: 'start' } );

    },

    saveScrollPosition: _.throttle( function() {
      if ( !this.$store.state.lazyScroll ) return;
      // Ignore the programmatic scroll triggered by restore, so it doesn't write
      // a transient position back over the value we just restored.
      if ( this.restoringScroll ) return;
      // The row actually at the top of the viewport (not the first overscan row,
      // which sits above it - using that would drift the saved index upward on
      // every save/restore cycle).
      const scrollTop = this.scrollWrap ? this.scrollWrap.scrollTop : 0;
      const topItem = this.virtualizer.getVirtualItemForOffset( scrollTop );
      const topRow = topItem ? topItem.index : 0;
      this.$updateQueries({ row: topRow || null });
    }, 450, { leading: false, trailing: true }),

    // OPEN DETAILS
    // openIndex is derived reactively (computed) from the route + collection.
    // Here we just reset the reserved gap and scroll the open row into view so
    // the panel mounts where it can measure itself (ResizeObserver reports height back).
    syncOpenDetails: function( asin ) {

      // Reset the gap; the panel re-measures and reports its real height
      this.$store.commit('prop', { key: 'openDetails', value: { index: this.openIndex, gapHeight: 0 } });

      if ( !asin ) return;
      if ( this.openIndex > -1 ) this.virtualizer.scrollToIndex( this.openIndex, { align: 'start' } );

    },

    // COLUMN VISIBILITY
    applyColumnVisibility: function() {
      const hidden = this.hiddenKeys;
      this.keys = _.reject( this.orderedKeys, function( key ) {
        return _.includes( hidden, key );
      });
      // Visible columns changed: frozen offsets depend on which columns precede each
      // frozen one, so recompute after the table re-renders.
      this.$nextTick( this.computeFrozenOffsets );
    },

    // FROZEN COLUMN OFFSETS
    computeFrozenOffsets: function() {
      const header = this.$el ? this.$el.querySelector( '.list-view-header' ) : null;
      if ( !header ) {
        this.frozenColumnStyles = "";
        return;
      }

      const frozen = this.frozenKeys;
      let offset = 0;
      const rules = [];

      // Walk the visible columns in order so the offset accumulates left-to-right.
      _.forEach( this.keys, function( key ) {
        if ( !_.includes( frozen, key ) ) return;
        const colClass = "col-" + _.kebabCase( key );
        const cell = header.querySelector( "." + colClass );
        const width = cell ? cell.offsetWidth : 0;
        rules.push( "." + colClass + " { position: -webkit-sticky; position: sticky; left: " + offset + "px; z-index: 3; }" );
        offset += width;
      });

      this.frozenColumnStyles = rules.join( "\n" );
    },

    openColumnMenu: function( e ) {
      this.columnMenu = { x: e.clientX, y: e.clientY };
    },

    // Outside click closes the menu. Mousedowns inside it stop propagation (@mousedown.stop
    // on the menu and the gear), so this only fires for mousedowns elsewhere.
    closeColumnMenu: function() {
      if ( this.columnMenu ) this.columnMenu = null;
    },

  }
};
</script>

<style lang="scss">


.ale-books.list-view {
  position: absolute;
  top: 170px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  background: $lightBackColor;
  border-radius: 8px;
  @include themify($themes) {
    background: rgba(color.adjust(themed(backColor), $lightness: 3%), 0.8);
    box-shadow: themed(shadowSmall);
    color: themed(frontColor);
  }
}

// Pinned over the top-right of the table, above the sticky header (z-index 5). Its
// background masks the last column's header content sitting underneath it.
.column-menu-gear {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 8px;
  border: none;
  cursor: pointer;
  transition: color 120ms ease;
  svg {
    font-size: 15px;
  }
}
.theme-light .column-menu-gear {
  background: color.adjust(#f8f8f8, $lightness: -5%);
  color: rgba($lightFrontColor, 0.5);
  &:hover { color: $lightFrontColor; }
}
.theme-dark .column-menu-gear {
  background: color.adjust(#15171a, $lightness: -1%);
  color: rgba($darkFrontColor, 0.5);
  &:hover { color: $darkFrontColor; }
}

.list-view-inner-wrap {
  position: absolute;
  top: 5px;
  right: 5px;
  bottom: 5px;
  left: 5px;
  font-size: 0px;
  line-height: 0px;
  overflow: auto;
  padding-bottom: 150px;
  > table {
    position: relative;
    // The table shrink-wraps to its column total by default, so the rows never see the
    // viewport width to fill. Block + width 100% makes it span the scroll area; min-width
    // max-content lets it grow past that and scroll when the columns overflow, giving the
    // rows room to stretch when sparse without squishing when dense.
    display: block;
    width: 100%;
    min-width: max-content;
  }
  table,
  thead,
  tbody,
  tfoot,
  tr {
    margin: 0;
    padding: 0;
    border: none;
    border-collapse: collapse;
    border-spacing: 0;
    vertical-align: baseline;
  }
  // Table is display:block (above) so the rows can fill it; the row groups must be block
  // too, otherwise they fall back to table-row-group and ignore the block table's width.
  thead,
  tbody {
    display: block;
  }
  
  thead,
  .list-view-header {
    position: -webkit-sticky;
    position: sticky;
    top: 0px;
    z-index: 5;
  }
  // Frozen columns: the per-column left offset comes from the generated frozenColumnStyles
  // stylesheet (it has to measure widths to stack them). This just carries the shared bits.
  .sticky-col {
    position: -webkit-sticky;
    position: sticky;
    z-index: 2;
  }

  // Virtual scroller spacer rows (top/bottom of the rendered window)
  .virtual-spacer {
    padding: 0;
    border: none;
  }

  // In-flow book-details gap row: the panel breaks out to full width itself,
  // so this row/cell must impose no table width, border, or background. Stuck to the
  // left so the panel stays pinned to the viewport edge instead of scrolling off with
  // the columns when the table is wider than the viewport.
  .details-gap-row,
  .details-gap-row > td {
    padding: 0;
    border: none;
    background: none !important;
    width: auto;
  }
  .details-gap-row {
    position: -webkit-sticky;
    position: sticky;
    left: 0px;
    z-index: 2;
  }

  .ale-row {
    text-align: left;
    height: 28px;
    &:last-child {
      @include themify($themes) {
        border-bottom: 1px solid rgba(themed(frontColor), 0.14);
      }
    }
  }
  .ale-row-inner {
    white-space: nowrap;
    position: relative;
    z-index: 2;
    // Flex so the last column can absorb leftover width. The table (block, min-width 100%)
    // gives this row its full width to fill; min-width max-content lets the row overflow
    // and scroll instead of squishing once the columns are wider than the viewport.
    display: flex;
    width: 100%;
    min-width: max-content;
  }
  // Fixed-width columns keep their size (no grow/shrink); the last one soaks up the slack.
  .ale-col {
    flex: 0 0 auto;
    &:last-child {
      flex: 1 0 auto;
    }
  }
  .ale-col {
    // display: inline-flex;
    // justify-content: left;
    // align-content: center;
    // justify-items: left;
    // align-items: center;
    display: inline-block;
    font-size: 14px;
    line-height: 1.55em;
    padding: 0 8px;
  }

  .ale-col-inner {
    height: 27px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;

    .text-container {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 2;  
    }
    
    &, & > .icons-n-stuff {
      display: flex;
      justify-items: start;
      align-items: center;
      justify-content: start;
      align-content: center;
      > * {
        display: inline-block;
      }
      > img {
        width: 27px;
        height: 27px;
      }
    }
    & > .icons-n-stuff {
      > * {
        padding-right: 5px !important;
        padding-left: 3px;
        &:first-child {
          padding-left: 0;
        }
      }
    }
  }

  // ***********
  //   COLORS & stuff...
  // ***********

  // .ale-row,
  .list-view,
  .ale-col {
    @include themify($themes) {
      border: 1px solid rgba(themed(frontColor), 0.14);
    }
  }

  .list-view-header {
    height: auto;
  }

  // The last header column stretches to the right edge, where the gear button is pinned.
  // Pad its content so the sorter arrows (pushed right by space-between) clear the gear.
  .list-view-header .ale-col:last-child .ale-col-inner {
    padding-right: 32px;
  }

  // .ale-row {
  //   border-left: none !important;
  //   border-right: none !important;
  //   border-top: none !important;
  // }

  .ale-col {
    // border-top-width: 0px !important;
    border-right-width: 0px !important;
    border-bottom-width: 0px !important;
    // &:first-child { border-top-width: 0px !important; border-left-width: 0px !important; }
  }

  .sticky-col {
    border-right-width: 2px !important;
  }

  tbody .ale-row {
    position: relative;
    z-index: 0;
    &:before {
      background-repeat: no-repeat;
      background-position: center center;
      content: "";
      display: inline-block;
      position: -webkit-sticky;
      position: sticky;
      left: 0px;
      z-index: 2;
      margin-top: 1px;
      margin-left: 15px;
      width: 27px;
      height: 27px;
      background-size: 20px;
    }
    &.mounted:before {
      display: none;
    }
  }
} // .list-view

.theme-light {
  .ale-row {
    &:before {
      background-image: url(@output-images/gallery-table-loader-light.gif);
    }
  }

  .list-view {
    a {
      color: #252525;
      &:visited {
        color: color.adjust(#252525, $lightness: 45%);
      }
    }
  }
  .ale-row {
    .ale-col {
      background: #fff;
    }
    color: color.adjust($lightFrontColor, $lightness: -2%);
    &.odd .ale-col {
      background: #f8f8f8;
    }
    &:hover .ale-col {
      background: color.adjust(#f8f8f8, $lightness: -5%) !important;
    }
  }
  .list-view-header .ale-col {
    background: color.adjust(#f8f8f8, $lightness: -5%) !important;
  }
  .list-view-header .ale-row-inner {
    border-top: 1px solid color.adjust(#f8f8f8, $lightness: -15%) !important;
    border-bottom: 1px solid color.adjust(#f8f8f8, $lightness: -32%) !important;
  }

  .ale-row {
    outline: none;
  }
}

.theme-dark {
  .ale-row {
    &:before {
      background-image: url("@output-images/gallery-table-loader-dark.gif");
    }
  }

  .list-view {
    a {
      color: #e1e1e1;
      &:visited {
        color: color.adjust(#e1e1e1, $lightness: -45%);
      }
    }
  }
  
  .ale-row {
    .ale-col {
      background: #15171a;
    }
    color: color.adjust($darkFrontColor, $lightness: -10%);
    &.odd .ale-col {
      background: color.adjust(#15171a, $lightness: 2%);
    }
    &:hover .ale-col {
      background: color.adjust(#15171a, $lightness: 5%) !important;
    }
  }

  .list-view,
  .ale-row,
  .ale-col {
    border-color: color.adjust($darkBackColor, $lightness: 15%) !important;
  }

  .list-view-header .ale-col {
    background: color.adjust(#15171a, $lightness: -1%) !important;
  }
  .list-view-header .ale-row-inner {
    border-top: 1px solid color.adjust($darkBackColor, $lightness: 11%) !important;
    border-bottom: 1px solid color.adjust($darkBackColor, $lightness: 11%) !important;
  }

  .ale-row {
    outline: none;
  }
}

.list-view {
  .ale-col {
    width: 300px;
  }
  .col-added {
    width: 50px;
  }
  .col-book-numbers {
    width: 60px;
  }
  .col-categories {
    width: 350px;
  }
  .col-series {
    width: 350px;
  }
  .col-length {
    width: 100px;
  }
  .col-progress {
    width: 120px;
  }
  .col-release-date {
    width: 100px;
  }
  .col-publishers {
    width: 180px;
  }
  .col-my-rating {
    width: 70px;
  }
  .col-rating {
    width: 70px;
  }
  .col-ratings {
    width: 70px;
  }
  .col-is-new {
    width: 60px;
  }
  .col-downloaded {
    width: 70px;
  }
  .col-format {
    width: 140px;
  }
  .col-language {
    width: 90px;
  }
  .col-favorite {
    width: 90px;
  }
  .col-isbn-10 {
    width: 100px;
  }
  .col-isbn-13 {
    width: 120px;
  }
  .col-store-page-missing,
  .col-store-page-changed,
  .col-from-plus-catalog,
  .col-unavailable {
    width: 80px;
  }

  tbody .col-title {
    outline: none;
    cursor: pointer;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    .info-icon {
      font-size: 0.9em;
      line-height: 1em;
      // padding-right: 5px;
      color: #f29a33;
    }
  }
}

.ale-col {
  position: relative;
}

@media ( min-width: 920px ) {
  .list-view #ale-bookdetails .summary-read-more {
    text-align: left !important;
  }
}

</style>
