<template>
<div
class="ale-books list-view"
ref="listView"
:style="{ top: spreadsheetTop + 'px' }"
>

  <!-- Position jump rail (inner-container scrolled). -->
  <gallery-segment-rail target=".list-view-inner-wrap" :total="$store.getters.collection.length" :virtualItems="virtualRows" />

  <div class="list-view-inner-wrap" ref="scrollWrap">
    <table>
      <thead>
        <gallery-header :keys="keys"></gallery-header>
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

// FIXED ROW HEIGHT
// keep in sync with .ale-row height in the styles below
const ROW_HEIGHT = 28;

export default {
  name: "aleBooks",
  components: { galleryBookDetails: bookDetails },
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
    };
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
  },

  created: function() {
    this.keys = this.prepareKeys();
  },

  mounted: function() {
    this.setSpreadsheetOffset();
    this.$compEmitter.on('afterWindowResize', this.setSpreadsheetOffset);

    this.$nextTick(function() {
      this.restoreScrollPosition();
      this.syncOpenDetails( this.$route.query.book );
      this.scrollWrap.addEventListener('scroll', this.saveScrollPosition, { passive: true });
    });
  },
  beforeUnmount: function() {
    this.$compEmitter.off('afterWindowResize', this.setSpreadsheetOffset);
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
  
  thead,
  .list-view-header {
    position: -webkit-sticky;
    position: sticky;
    top: 0px;
    z-index: 5;
  }
  .sticky-col {
    position: -webkit-sticky;
    position: sticky;
    left: 0px;
    z-index: 2;
  }

  // Virtual scroller spacer rows (top/bottom of the rendered window)
  .virtual-spacer {
    padding: 0;
    border: none;
  }

  // In-flow book-details gap row: the panel breaks out to full width itself,
  // so this row/cell must impose no table width, border, or background.
  .details-gap-row,
  .details-gap-row > td {
    padding: 0;
    border: none;
    background: none !important;
    width: auto;
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
