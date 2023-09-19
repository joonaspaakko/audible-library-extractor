<template>
  <div>
    <div
    v-if="inSeries"
    class="label hidden-section-label my-books-in-series-label"
    @click="booksInSeriesLabelClick"
    >
      <!-- Had to change this to make it a bit shorter... -->
      <!-- <span class="heading">Books I own in the series</span> -->
      <span class="heading">My books in the series</span>
      <span class="count">{{ series.count }}</span>
      <gallery-vertical-chevron :up="series.toggle" />
    </div>

    <div class="hidden-section my-books-in-series" v-if="series.toggle">
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
            
            <router-link v-if="$route.name !== 'series'" 
            :to="{ name: 'series', params: { series: series.asin } }" target="_blank" rel="noopener noreferrer">
              {{ series.name }}
            </router-link>
            <a v-else href="#" @click.prevent="goToBookInSeries( series )">
              {{ series.name }}
            </a>
            
            <!-- <a href="#" @click.prevent="goToBookInSeries( series )">
              {{ series.name }}
            </a> -->
          </div>
          <div class="series-length">
            {{ series.books.length }} / {{ series.length }}
          </div>
        </div>
        
        
        <router-link v-if="$route.name !== 'series'" 
        data-irregular-link="true"
        :data-series-name="series.name" class="numbers-list-item" :class="numbersClass(seriesBook)"
        v-for="(seriesBook, index) in series.books" :key="seriesBook.asin"
        :to="{ 
          name: 'series', 
          params: { series: series.asin }, 
          query: { book: book.asin }, 
        }" target="_blank" rel="noopener noreferrer">
          
          <span class="icon" :content="iconTippyContent(seriesBook)" v-tippy="{ placement: 'left', flipBehavior: ['left', 'top', 'bottom'] }">
            <i :class="booksInSeriesIcon(seriesBook)"></i>
          </span>
          
          <span>
            <span class="numbers">{{ getBookNumber(seriesBook, series.asin) }}</span>
            <span class="title">{{ seriesBook.title }}</span>
          </span>
          
        </router-link>
        <!-- <a v-else data-normal-link="true" href="#" 
        :data-series-name="series.name" class="numbers-list-item" :class="numbersClass(seriesBook)"
        v-for="(seriesBook, index) in series.books" :key="seriesBook.asin"
        @click.prevent="goToBookInSeries( series, seriesBook )">
          
          <span class="icon" :content="iconTippyContent(seriesBook)" v-tippy="{ placement: 'left', flipBehavior: ['left', 'top', 'bottom'] }">
            <font-awesome fas :icon="booksInSeriesIcon(seriesBook)" />
          </span>
          
          <span>
            <span class="numbers">{{ getBookNumber(seriesBook, series.asin) }}</span>
            <span class="title">{{ seriesBook.title }}</span>
          </span>
          
        </a> -->
        
        <!-- <div
        :data-series-name="series.name" class="numbers-list-item" :class="numbersClass(seriesBook)"
        v-for="(seriesBook, index) in series.books" :key="seriesBook.asin"
        @click.prevent="goToBookInSeries( series, seriesBook )"
        >
          <span class="icon" :content="iconTippyContent(seriesBook)" v-tippy="{ placement: 'left', flipBehavior: ['left', 'top', 'bottom'] }">
            <font-awesome fas :icon="booksInSeriesIcon(seriesBook)" />
          </span>
          
          <a href="#">
            <span class="numbers">{{ getBookNumber(seriesBook, series.asin) }}</span>
            <span class="title">{{ seriesBook.title }}</span>
          </a>
        </div> -->
        
      </div>
    </div>
    <!-- .by-books-in-series -->
  </div>
</template>

<script>
export default {
  name: "booksInSeries",
  props: ["book"],
  data: function() {
    return {
      inSeries: false,
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

  methods: {
    
    goToBookInSeries: function( series, book ) {
      if ( book ) {
        // FIXME: make sure this works
        this.$compEmitter.emit('book-clicked', { book: book });
        
      }
      else if ( series ) {
        
        this.$compEmitter.emit('book-clicked', { book: null });
        scroll({ top: 0 });
        
      }
    },
    
    getBookNumber: function(book, seriesAsin) {
      const numbers = _.find(book.series, { asin: seriesAsin }).bookNumbers;
      return numbers ? numbers.join(", ") : "";
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
            series.push({
              asin: currentSeries.asin,
              name: currentSeries.name,
              length: allBooksInSeries.length,
              books: _.map(allBooksInSeries.books, function(asin) {
                return _.find(vue.$store.state.library.books, { asin: asin });
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
      this.series.toggle = !this.series.toggle;
      this.$nextTick(() => {
        this.$compEmitter.emit("resizeSummary");
      });
    },

    numbersClass: function(book) {
      var progress = book.progress;
      return {
        finished: progress && progress.toLowerCase().match("finished") ? true : false,
        reading: progress && !progress.toLowerCase().match("finished") ? true : false,
        unfinished: !book.progress,
        current: this.book.asin === book.asin
      };
    },

    iconTippyContent: function(book) {
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
    },

    booksInSeriesIcon: function(book) {
      const classes = this.numbersClass(book);
      var iconClass = "";
      if (classes.finished) {
        iconClass = "fa-solid fa-box-archive";
      } else if (classes.unfinished) {
        iconClass = "fa-solid fa-book";
      } else if (classes.reading) {
        iconClass = "fa-solid fa-book-open-reader";
      }
      return iconClass;
    }
  }
};
</script>

<style lang="scss" scoped>


.my-books-in-series {
  .numbers-list-item {
    cursor: pointer;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    @include themify($themes) {
      border-bottom: 1px dotted rgba(themed(frontColor), 0.2);
    }

    .icon {
      margin-right: 4px;
    }

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

.series-heading {
  display: block;
  font-weight: 700;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .series-name {
    flex: 1;
  }
}


@media ( max-width: 630px ) {
  .my-books-in-series .numbers-list-item {
    padding: 4px 0;
  }
}

</style>
