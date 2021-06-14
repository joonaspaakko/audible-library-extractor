<template>
  <div v-if="inSeries">
    <div
    class="label hidden-section-label my-books-in-series-label"
    @click="booksInSeriesLabelClick"
    >
      <!-- Had to change this to make it a bit shorter... -->
      <!-- <span class="heading">Books I own in the series</span> -->
      <span class="heading">My books in the series</span>
      <span class="count">{{ series.count }}</span>
      <font-awesome fas :icon="$store.state.sticky.booksInSeriesToggle ? 'chevron-up' : 'chevron-down'" />
    </div>
    <div class="hidden-section my-books-in-series" v-if="$store.state.sticky.booksInSeriesToggle">
      
      <div class="show-all-toggle" v-if="showAllToggle">
        <div @click="toggleAll" :content="$store.state.sticky.booksInSeriesAll ? 'Hide books in the series that are not in your library' : 'Show all books in the series'" v-tippy="{ placement: 'right', flipBehavior: ['right', 'top', 'bottom'] }">
          <span>{{ $store.state.sticky.booksInSeriesAll ? 'Hide' : 'Show' }}</span> <span>books I don't have</span> <font-awesome :icon="['fas', 'ban']" />
        </div>
      </div>
      
      <div
      class="series-section"
      v-for="(series, seriesIndex) in series.collection"
      :key="series.asin"
      >
        <div
        class="series-heading"
        v-tippy="{ placement: 'right', flipBehavior: ['right', 'top', 'bottom'], maxWidth: 300, allowHTML: true }"
        content="<div style='text-align: left;'>The total number of books is based on every single listing in the series page, including different versions or bundles with books you may already have.</div>"
        >
          <div class="series-name">
            <a href="#" @click.prevent="goToBookInSeries( series )">
              {{ series.name }}
            </a>
          </div>
          <div class="series-length">
            {{ series.books.length }} / {{ series.length }}
          </div>
        </div>

        <div
        :data-series-name="series.name" class="numbers-list-item" :class="numbersClass(seriesBook)"
        v-for="(seriesBook, index) in series.books" :key="seriesBook.asin"
        >
          <open-in-app :size="14" :book="seriesBook" :muted="true" />
          <span class="icon" :content="iconTippyContent(seriesBook)" v-tippy="{ placement: 'left', flipBehavior: ['left', 'top', 'bottom'] }">
            <font-awesome fas :icon="booksInSeriesIcon(seriesBook)" />
          </span>
          <a v-if="seriesBook.notInLibrary && !!seriesBook.asin" class="clickety-click" target="_blank" :href="seriesNotInLibraryLink( seriesBook, series.asin )">
            <span class="numbers">{{ (seriesBook.notInLibrary ? seriesBook.bookNumbers : getBookNumber(seriesBook, series.asin)) || '∞' }}</span>
            <span class="title">{{ seriesBook.title }}</span>
          </a>
          <div v-else-if="seriesBook.notInLibrary" class="clickety-click" style="cursor: default;" content="Not available..." v-tippy="{ placement: 'right', flipBehavior: ['right', 'top', 'bottom'] }">
            <span class="numbers">{{ (seriesBook.notInLibrary ? seriesBook.bookNumbers : getBookNumber(seriesBook, series.asin)) || '∞' }}</span>
            <span class="title">{{ seriesBook.title }}</span>
          </div>
          <div v-else class="clickety-click" @click.prevent="goToBookInSeries( series, seriesBook )">
            <span class="numbers">{{ getBookNumber(seriesBook, series.asin) || '∞' }}</span>
            <span class="title">{{ seriesBook.title }}</span>
          </div>
        </div>
        
      </div>
    </div>
    <!-- .by-books-in-series -->
  </div>
</template>

<script>
import openInApp from "@output-comps/snippets/openInApp";
import makeUrl from "@output-mixins/makeFullUrl";

export default {
  name: "booksInSeries",
  props: ["book"],
  mixins: [makeUrl],
  components: {
    openInApp,
  },
  data: function() {
    return {
      inSeries: false,
      showAllToggle: false,
      series: {
        collection: null,
        toggle: false
      }
    };
  },

  created: function() {
    
    
    this.series.collection = this.getBooksInSeries();
    this.series.count = this.getSeriesCount();
    
    // Check if this book is in a series
    const vue = this;
    _.each(this.series.collection, function(series) {
      if ( series.books.length ) {
        vue.inSeries = true;
        return false;
      }
    });
    
  },
  
  mounted: function() {
    
    if ( this.$store.state.sticky.booksInSeriesToggle ) {
      this.$nextTick(() => {
        this.$root.$emit("resizeSummary");
      });
    }
    
  },

  methods: {
    
    toggleAll: function() {
      this.$store.commit('stickyProp', { key: 'booksInSeriesAll', value: !this.$store.state.sticky.booksInSeriesAll });
      this.series.collection = this.getBooksInSeries();
    },
    
    seriesNotInLibraryLink: function( book, seriesAsin ) {
      if ( book.asin ) {
        return this.makeUrl('book', book.asin);
      }
      else if ( seriesAsin ) { 
        return this.makeUrl('series', { asin: seriesAsin });
      }
    },
    
    goToBookInSeries: function( series, book ) {
      
      if ( book ) {
        
        if ( this.$route.name !== 'series' ) {
          this.$router.push({ 
            name: 'series', 
            params: { series: series.asin }, 
            query: { book: book.asin, subPageSource: 'books' }, 
          });
        }
        else {
          this.$root.$emit('book-clicked', { book: book });
        }
        
      }
      else if ( series ) {
        
        if ( this.$route.name !== 'series' ) {
          this.$router.push({ 
            name: 'series', 
            params: { series: series.asin }, 
            query: { subPageSource: 'books' },
          });
        }
        else {
          this.$root.$emit('book-clicked', { book: null });
          scroll({ top: 0 });
        }
        
      }
      
    },
    
    getBookNumber: function(book, seriesAsin) {
      const numbers = _.find(book.series, { asin: seriesAsin }).bookNumbers;
      return numbers ? numbers.join(",") : "";
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
            
            if ( !!allBooksInSeries.allBooks ) {
              if ( vue.$store.state.sticky.booksInSeriesAll ) booksSource = allBooksInSeries.allBooks;
              vue.showAllToggle = true;
            }
            
            series.push({
              asin: currentSeries.asin,
              name: currentSeries.name,
              length: allBooksInSeries.length,
              books: _.map( booksSource , function( book ) {
                let asin = book.asin || book;
                let inLibrary = _.includes( allBooksInSeries.books, asin );
                if ( inLibrary ) {
                  return _.find(vue.$store.state.library.books, { asin: asin });
                }
                else {
                  book.notInLibrary = true;
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

      _.each(this.series.collection, function(series) {
        array.push(series.books.length);
      });

      return array.join(", ");
    },

    booksInSeriesLabelClick: function() {
      this.$store.commit('stickyProp', { key: 'booksInSeriesToggle', value: !this.$store.state.sticky.booksInSeriesToggle });
      this.$nextTick(() => {
        this.$root.$emit("resizeSummary");
      });
    },

    numbersClass: function(book) {
      var progress = book.progress;
      return {
        finished: progress && progress.toLowerCase().match("finished") ? true : false,
        reading: progress && !progress.toLowerCase().match("finished") ? true : false,
        unfinished: !book.progress,
        current: this.book.asin === book.asin,
        'not-in-library': book.notInLibrary,
      };
    },

    iconTippyContent: function(book) {
      if ( book.free && book.notInLibrary ) {
        return 'This book is free...';
      }
      else if ( book.plus && book.notInLibrary ) {
        return 'In the plus catalog...';
      }
      else if ( book.notInLibrary ) {
        return 'Not in library...';
      }
      else {
        const classes = this.numbersClass(book);
        var tippyContent = "";
        if (classes.finished) {
          tippyContent = "Finished!";
        } else if (classes.unfinished) {
          tippyContent = "Not started...";
        } else if (classes.reading) {
          tippyContent = "Started...";
        }
        return tippyContent;
      }
    },

    booksInSeriesIcon: function(book) {
      if ( book.free && book.notInLibrary ) {
        return 'minus-circle';
      }
      else if ( book.plus && book.notInLibrary ) {
        return 'plus-circle';
      }
      else if ( book.notInLibrary ) {
        return 'ban';
      }
      else {
        const classes = this.numbersClass(book);
        var iconClass = "";
        if (classes.finished) {
          iconClass = "archive";
        } else if (classes.unfinished) {
          iconClass = "book";
        } else if (classes.reading) {
          iconClass = "book-reader";
        }
        return iconClass;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";

.my-books-in-series {
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
    }

    .icon {
      outline: none;
      padding-right: 8px;
    }
    
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
    &.not-in-library .icon {
      color: #e75551;
      // color: rgba( #e75551, .5);
    }
    &.not-in-library .title { text-decoration: none; }
    &.not-in-library .numbers { opacity: 0.5; }
    
    &.reading {
      font-style: italic;
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
  
  .show-all-toggle {
    -webkit-touch-callout: none; 
    -webkit-user-select: none; 
    -khtml-user-select: none; 
    -moz-user-select: none; 
    -ms-user-select: none; 
    user-select: none; 
    position: relative;
    z-index: 1;
    height: 10px;
    text-align: center;
    > div {
      outline: none;
      position: relative;
      top: -6px;
      left: 0px;
      border-radius: 9999px;
      display: inline-block;
      padding: 0px 8px;
      font-size: 12px;
      cursor: pointer;
      @include themify($themes) {
        color: rgba( themed(frontColor), .4);
        border: 1px solid rgba( themed(frontColor), .4);
      }
      svg {
        margin-left: 2px;
      }
    }
  }
}

div.hidden-section-label {
  cursor: pointer;
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
  &:first-child {
    margin-top: 0;
  }
}

.series-heading {
  display: block;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .series-name {
    flex: 1;
  }
}


@media ( max-width: 630px ) {
  .my-books-in-series .numbers-list-item {
    padding: 5px 0;
  }
}

.theme-light .my-books-in-series .numbers-list-item {
  &.not-in-library,
  &.finishe {
    .icon, .title {
      opacity: .65 !important;
    }
  }
}

</style>
