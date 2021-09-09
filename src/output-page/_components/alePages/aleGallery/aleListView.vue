<template>
<div
class="ale-books list-view"
ref="listView"
:style="{ top: spreadsheetTop + 'px' }"
>

  <book-details
  v-if="$store.state.bookDetails.book"
  :index="$store.state.bookDetails.index"
  :booksWrapper="$refs.booksWrapper"
  />
  
  <div class="list-view-inner-wrap">
    <table>
      <thead>
        <ale-header :keys="keys"></ale-header>
      </thead>
      <tbody>
        
        <!-- :class="{ 'details-open': detailsBook && detailsBook.asin === book.asin }" -->
        <lazy
        v-for="(book, index) in $store.state.chunkCollection"
        class="ale-row"
        :data-asin="book.asin"
        :key="'book:'+book.asin"
        ref="domBooks"
        v-if="book.asin"
        >
          <ale-list-row
            :book="book"
            :rowIndex="index"
            :keys="keys"
          ></ale-list-row>
        </lazy>
        
      </tbody>
    </table>
  </div>
  
</div>
</template>

<script>
// import slugify from '../../../_mixins/slugify';
// import makeCoverUrl from '../../../_mixins/makeCoverUrl';
import aleHeader from "./aleListView/aleHeader";
import aleListRow from "./aleListView/aleRow";
import lazy from "@output-snippets/lazy.vue";
import stringifyArray from "@output-mixins/stringifyArray";
import prepareKeys from "@output-mixins/prepareKeys.js";

export default {
  name: "aleBooks",
  components: {
    lazy,
    aleHeader,
    aleListRow,
    bookDetails: () => import( /* webpackPrefetch: true */ /* webpackChunkName: "book-Details" */ "./aleGridView/bookDetails"),
  },
  mixins: [stringifyArray, prepareKeys],
  data: function() {
    return {
      spreadsheetTop: 170,
      keys: "",
      prevScrollTop: 0,
    };
  },

  created: function() {
    this.keys = this.prepareKeys();
  },

  mounted: function() {
    this.setSpreadsheetOffset();
  },

  methods: {
    
    setSpreadsheetOffset: function() {
      
      const searchWrap = document.querySelector('#ale-search-wrap');
      const searchOffset = window.pageYOffset + searchWrap.getBoundingClientRect().top;
      const searchHeight = searchWrap.offsetHeight;
      this.spreadsheetTop = searchOffset + searchHeight;
    
    },
    
  }
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

.ale-books.list-view {
  position: absolute;
  top: 170px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  background: $lightBackColor;
  border-radius: 8px;
  @include themify($themes) {
    background: rgba(lighten(themed(backColor), 3), 0.8);
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
      background-image: url("data:image/gif;base64,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");
    }
  }

  .list-view {
    a {
      color: #252525;
      &:visited {
        color: lighten(#252525, 45%);
      }
    }
  }
  .ale-row {
    .ale-col {
      background: #fff;
    }
    color: darken($lightFrontColor, 2);
    &:nth-child(odd) .ale-col {
      background: #f8f8f8;
    }
    &:hover .ale-col {
      background: darken(#f8f8f8, 5) !important;
    }
  }
  .list-view-header .ale-col {
    background: darken(#f8f8f8, 5) !important;
  }
  .list-view-header .ale-row-inner {
    border-top: 1px solid darken(#f8f8f8, 15) !important;
    border-bottom: 1px solid darken(#f8f8f8, 32) !important;
  }

  .ale-row {
    outline: none;
  }
}

.theme-dark {
  .ale-row {
    &:before {
      background-image: url("data:image/gif;base64,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");
    }
  }

  .list-view {
    a {
      color: #e1e1e1;
      &:visited {
        color: darken(#e1e1e1, 45%);
      }
    }
  }
  
  .ale-row {
    .ale-col {
      background: #15171a;
    }
    color: darken($darkFrontColor, 10);
    &:nth-child(odd) .ale-col {
      background: lighten(#15171a, 2);
    }
    &:hover .ale-col {
      background: lighten(#15171a, 5) !important;
    }
  }

  .list-view,
  .ale-row,
  .ale-col {
    border-color: lighten($darkBackColor, 15) !important;
  }

  .list-view-header .ale-col {
    background: darken(#15171a, 1) !important;
  }
  .list-view-header .ale-row-inner {
    border-top: 1px solid lighten($darkBackColor, 11) !important;
    border-bottom: 1px solid lighten($darkBackColor, 11) !important;
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
  #ale-bookdetails .summary-read-more {
    text-align: left !important;
  }
}

</style>
