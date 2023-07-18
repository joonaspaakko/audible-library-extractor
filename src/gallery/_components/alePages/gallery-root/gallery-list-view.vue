<template>
<div
class="ale-books list-view"
ref="listView"
:style="{ top: spreadsheetTop + 'px' }"
>

  <div class="list-view-inner-wrap">
    <table>
      <thead>
        <gallery-header :keys="keys"></gallery-header>
      </thead>
      <tbody>
        
        <!-- :class="{ 'details-open': detailsBook && detailsBook.asin === book.asin }" -->
        <gallery-lazy
          v-for="(book, index) in $store.state.chunkCollection"
          class="ale-row"
          :data-asin="book.asin"
          :key="'book:'+book.asin"
          ref="domBooks"
        >
          <gallery-row
            :book="book"
            :rowIndex="index"
            :keys="keys"
          ></gallery-row>
        </gallery-lazy>
        
      </tbody>
    </table>
  </div>
  
</div>
</template>

<script>
import loaderLight from "@output-images/gallery-table-loader-light.gif";
import loaderDark  from "@output-images/gallery-table-loader-dark.gif";
import stringifyArray from "@output-mixins/gallery-stringifyArray.js";
import prepareKeys from "@output-mixins/gallery-prepareKeys.js";

export default {
  name: "aleBooks",
  mixins: [stringifyArray, prepareKeys],
  data: function() {
    return {
      spreadsheetTop: 170,
      keys: "",
      prevScrollTop: 0,
    };
  },
  
  watch: {
    '$store.state.desktopPlayerHeight'() {
      this.setSpreadsheetOffset();
    },
  },

  created: function() {
    this.keys = this.prepareKeys();
  },

  mounted: function() {
    this.setSpreadsheetOffset();
    this.$compEmitter.on('afterWindowResize', this.setSpreadsheetOffset);
  },
  beforeUnmount: function() {
    this.$compEmitter.off('afterWindowResize', this.setSpreadsheetOffset);
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
      background-image: url(@output-images/gallery-table-loader-light.gif);
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
      background-image: url("@output-images/gallery-table-loader-dark.gif");
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
  .list-view #ale-bookdetails .summary-read-more {
    text-align: left !important;
  }
}

</style>
