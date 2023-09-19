<template>
  <div v-if="inSeries" data-scroll-to-url-param="&scrollToSeries=true">
    <div
    class="label hidden-section-label my-books-in-series-label"
    @click="booksInSeriesLabelClick"
    >
      <!-- Had to change this to make it a bit shorter... -->
      <!-- <span class="heading">Books I own in the series</span> -->
      <span class="heading">My books in the series</span>
      <span class="count">{{ series.count }}</span>
      <gallery-vertical-chevron :up="$store.state.sticky.booksInSeriesToggle" />
    </div>
    <div class="hidden-section my-books-in-series" v-if="$store.state.sticky.booksInSeriesToggle">
      
      <gallery-books-in-series-filters :series="series" />
      
      <div
        class="series-section"
        :class="{ first: seriesIndex === 0 }"
        v-for="(series, seriesIndex) in series.collection"
        :key="series.asin"
      >
        <div
          class="series-heading"
          v-tippy="{ placement: 'right', flipBehavior: ['right', 'top', 'bottom'], maxWidth: 300, allowHTML: true }"
          content="<div style='text-align: left;'>The first number is how many books you have in the series. The total is based on every single listing in the series page, including different versions or bundles with books you may already have.</div>"
        >
          <div class="series-name">
            <!-- <span v-if="$route.params.series === series.asin">{{ series.name }}</span>
            <gallery-books-in-series-link v-else :series="series" :book="seriesBook" :index="index" :seriesName="series.name" /> -->
            <gallery-books-in-series-link :series="series" :book="{}" :index="-1" :seriesName="series.name" />
          </div>
          <div class="series-length">
            {{ inLibraryLength( series ) }} / {{ series.length }}
          </div>
        </div>
        
        <gallery-books-in-series-books :series="series" :book="book" />
        
      </div>
    </div>
    <!-- .by-books-in-series -->
  </div>
</template>

<script>
import makeUrl from "@output-mixins/gallery-makeFullUrl.js";

export default {
  name: "booksInSeries",
  props: ["book"],
  mixins: [makeUrl],
  data: function() {
    return {
      inSeries: false,
      series: {
        collection: null,
        toggle: false
      },
      // seriesPage: false,
    };
  },

  created: function() {

    // Because these links lead to the series page, they are disabled
    // when on that page and instead a different book is opened...
    // Except when the link leads to another series...
    this.seriesPage = this.$route.name === 'series';

    this.series.collection = this.getBooksInSeries();
    this.series.count = this.getSeriesCount();

    // Check if this book is in a series
    _.each(this.series.collection, (series) => {
      if ( series.books.length ) {
        this.inSeries = true;
        return false;
      }
    });

  },

  mounted: function() {

    if ( this.$store.state.sticky.booksInSeriesToggle ) {
      this.$nextTick(() => {
        this.$compEmitter.emit("resizeSummary");
      });
    }

  },

  methods: {

    inLibraryLength: function( series ) {
      return _.filter( series.books, function( o ) { return !o.notInLibrary; }).length;
    },

    checkFilter: function( book ) {
      if ( _.get(book, 'notInLibrary') ) {
        return this.$store.state.sticky.booksInSeriesAll;
      }
      else {
        if ( this.$store.state.sticky.booksInSeriesFinished ) {
          return true;
        }
        else {
          let progress = _.get(book, 'obj.progress');
          return progress ? !progress.match(/finished/i) : true;
        }
      }

    },

    getBooksInSeries: function() {
      const vue = this;
      let series = [];
      if (vue.book.series) {
        _.each(vue.book.series, function(currentSeries, i) {
          const allBooksInSeries = _.find(vue.$store.state.library.series, {
            asin: currentSeries.asin
          });
          if (allBooksInSeries) {

            let booksSource = allBooksInSeries.books;
            if ( allBooksInSeries.allBooks ) booksSource = allBooksInSeries.allBooks;
            
            series.push({
              asin: currentSeries.asin,
              name: currentSeries.name,
              length: allBooksInSeries.length,
              books: _.map( booksSource , function( book ) {
                let asin = book.asin || book;
                let inLibrary = _.includes( allBooksInSeries.books, asin );
                const wishlistBook = _.find(vue.$store.state.library.wishlist, { asin: asin });
                if ( inLibrary ) {
                  let libBook = _.find(vue.$store.state.library.books, { asin: asin });
                  var libSeries = _.find( libBook.series, { asin: currentSeries.asin });
                  let inLibBookNumbers = !allBooksInSeries.allBooks ? (_.isArray(libSeries.bookNumbers) ? libSeries.bookNumbers.join(', ') : libSeries.bookNumbers) : book.bookNumbers;
                  let newLibBook = {
                    asin: book.asin || libBook.asin,
                    bookNumbers: inLibBookNumbers,
                    title: book.title || libBook.title,
                    titleShort: book.titleShort || libBook.titleShort,
                    obj: libBook,
                  };
                  return newLibBook;
                }
                else if (wishlistBook) {
                  return {
                    asin,
                    title: wishlistBook.title,
                    titleShort: book.titleShort,
                    obj: wishlistBook,
                    bookNumbers: book.bookNumbers,
                    inWishlist: true,
                  }
                }
                else {
                  book.notInLibrary = true;
                  book.obj = {
                    authors: vue.book.authors,
                    notInLibrary: true,
                  };
                  return book;
                }
              })
            });
          }
        });
      }

      return series.length > 0 ? series : null;
    },

    getSeriesCount: function() {
      let array = [];

      _.each(this.series.collection, function(series, seriesIndex ) {
        if ( series.books.length ) {
          _.each(series.books, function(book) {
            if ( !book.notInLibrary ) {
              if ( !array[ seriesIndex ] ) array.push(0);
              ++array[ seriesIndex ];
            }
          });
        }
      });

      return array.join(", ");
    },

    booksInSeriesLabelClick: function() {
      this.$store.commit('stickyProp', { key: 'booksInSeriesToggle', value: !this.$store.state.sticky.booksInSeriesToggle });
      this.$nextTick(() => {
        this.$compEmitter.emit("resizeSummary");
      });
    },
    
  }
};
</script>

<style lang="scss">


.my-books-in-series {
  position: relative;
  z-index: 0;
  .numbers-list-item {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    display: flex;
    flex-direction: row;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    @include themify($themes) {
      border-bottom: 1px dotted rgba(themed(frontColor), 0.2);
    }

    .clickety-click {
        cursor: pointer;
        display: flex;
        flex-direction: row;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      .numbers {
        padding-right: 4px;
      }
      .title {
        display: inline !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      &.cursor-alias {
        cursor: alias;
      }
      &.link-disabled {
        cursor: default;
      }
    }

    .icon {
      outline: none;
      padding-right: 8px;
    }
    
    &.in-wishlist,
    &.not-in-library,
    &.finished {
      .title {
        overflow: hidden;
        position: relative;
      }
      .title:after {
        content: "";
        position: absolute;
        top: 0.9em;
        right: 0px;
        left: 0px;
        height: 1px;
        @include themify($themes) {
          background: rgba(themed(frontColor), 0.2);
        }
      }
      .icon {
        opacity: 0.5;
      }
      .title {
        text-decoration: line-through;
        opacity: 0.5;
      }
    }
    &.in-wishlist,
    &.not-in-library {
      .icon { color: #e75551; }
      .title { text-decoration: none; }
      .numbers { opacity: 0.5; }
    }

    &.reading {
      font-style: normal;
    }
    &.unfinished {
    }
    &.current {
      .icon {
        @include themify($themes) {
          color: themed(audibleOrange);
        }
      }
    }

    a {
      @include themify($themes) {
        color: themed(frontColor) !important;
      }
      &:visited {
        @include themify($themes) {
          color: rgba( themed(frontColor), .6) !important;
        }
      }
    }

  }

}

div.hidden-section-label {
  cursor: pointer !important;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  padding: 0 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  @include themify($themes) {
    background: rgba(themed(frontColor), 0.01);
    border-top: 1px solid rgba(themed(frontColor), 0.15);
    border-bottom: 1px solid rgba(themed(frontColor), 0.15);
  }
  > * {
    padding: 5px 0;
  }
  .heading {
    flex: 1;
  }
  .count {
    padding-left: 7px;
    padding-right: 7px;
    @include themify($themes) {
      border-left: 1px solid rgba(themed(frontColor), 0.15);
      border-right: 1px solid rgba(themed(frontColor), 0.15);
    }
  }
  [data-icon] {
    padding-left: 10px;
  }
  // padding-bottom: 4px;
  // @include themify($themes) {
  //   border-bottom: 2px solid rgba( themed(frontColor), .3 );
  // }
}
div.hidden-section {
  padding: 20px;
  padding-bottom: 0;
}

.series-section {
  margin-top: 15px;
  &.first { margin-top: 5px; }
}

.series-heading {
  display: block;
  font-weight: 700;
  line-height: 1.2em;
  padding-bottom: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .series-name {
    flex: 1;
  }
  .series-length {
    white-space: nowrap;
    padding-left: 5px;
  }
}


@media ( max-width: 630px ) {
  .my-books-in-series .numbers-list-item {
    padding: 5px 0;
  }
}

.theme-light .my-books-in-series .numbers-list-item {
  &.in-wishlist,
  &.not-in-library {
    .icon, .title {
      opacity: .65 !important;
    }
  }

  &.finished {
    .icon, .title {
      opacity: .50 !important;
    }
  }
}

</style>
