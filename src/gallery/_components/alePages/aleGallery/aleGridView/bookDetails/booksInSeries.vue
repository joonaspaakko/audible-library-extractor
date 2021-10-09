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
      
      <filters :series="series"></filters>
      
      <div
      class="series-section"
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
            <books-in-series-link v-else :series="series" :book="seriesBook" :index="index" :seriesName="series.name" /> -->
            <books-in-series-link :series="series" :book="{}" :index="-1" :seriesName="series.name" />
          </div>
          <div class="series-length">
            {{ inLibraryLength( series ) }} / {{ series.length }}
          </div>
        </div>
        
        <div
        :data-series-name="series.name" class="numbers-list-item" :class="numbersClass(seriesBook)"
        v-for="(seriesBook, index) in series.books" :key="seriesBook.asin"
        v-if="checkFilter( seriesBook )"
        > 
        
          <open-in-app v-if="$store.state.sticky.booksInSeriesOpenInApp" :size="14" :book="seriesBook" :muted="true" />
          <good-reads-link v-else :size="14" :book="seriesBook" :icon="true" :muted="true"  />
          
          <span class="icon" :content="iconTippyContent(seriesBook)" v-tippy="{ placement: 'left', flipBehavior: ['left', 'top', 'bottom'] }">
            <font-awesome fas :icon="booksInSeriesIcon(seriesBook)" />
          </span>
          
          <books-in-series-link :series="series" :book="seriesBook" :index="index" />
          
        </div>
        
      </div>
    </div>
    <!-- .by-books-in-series -->
  </div>
</template>

<script>
import openInApp from "@output-comps/snippets/openInApp";
import goodReadsLink from "@output-comps/snippets/goodReadsLink";
import booksInSeriesLink from "./booksInSeriesLink.vue";
import filters from "./booksInSeriesFilters.vue";
import makeUrl from "@output-mixins/makeFullUrl";

export default {
  name: "booksInSeries",
  props: ["book"],
  mixins: [makeUrl],
  components: {
    openInApp,
    goodReadsLink,
    booksInSeriesLink,
    filters,
  },
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
    
    inLibraryLength: function( series ) {
      return _.filter( series.books, function( o ) { return !o.notInLibrary; }).length;
    },
    
    checkFilter: function( book ) {
      if ( book.notInLibrary ) {
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
            if ( !!allBooksInSeries.allBooks ) booksSource = allBooksInSeries.allBooks;
            
            series.push({
              asin: currentSeries.asin,
              name: currentSeries.name,
              length: allBooksInSeries.length,
              books: _.map( booksSource , function( book ) {
                let asin = book.asin || book;
                let inLibrary = _.includes( allBooksInSeries.books, asin );
                
                if ( inLibrary ) {
                  let libBook = _.find(vue.$store.state.library.books, { asin: asin });
                  var libSeries = _.find( libBook.series, { asin: currentSeries.asin });
                  let inLibBookNumbers = !allBooksInSeries.allBooks ? (_.isArray(libSeries.bookNumbers) ? libSeries.bookNumbers.join(',') : libSeries.bookNumbers) : book.bookNumbers;
                  let newLibBook = {
                    asin: book.asin || libBook.asin,
                    bookNumbers: inLibBookNumbers,
                    title: book.title || libBook.title,
                    titleShort: book.titleShort || libBook.titleShort,
                    obj: libBook,
                  };
                  return newLibBook;
                }
                else {
                  book.notInLibrary = true;
                  book.obj = {};
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
      var progress = _.get(book, 'obj.progress');
      return {
        finished: progress && progress.toLowerCase().match("finished") ? true : false,
        reading: progress && !progress.toLowerCase().match("finished") ? true : false,
        unfinished: !progress,
        current: this.book.asin === _.get(book, 'obj.asin'),
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

<style lang="scss">
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
    padding: 5px 0;
  }
}

.theme-light .my-books-in-series .numbers-list-item {
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
