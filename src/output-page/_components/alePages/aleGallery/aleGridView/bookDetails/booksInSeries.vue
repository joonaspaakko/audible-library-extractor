<template>
<div>
  
  <div v-if="book.series" class="label hidden-section-label my-books-in-series-label" @click="booksInSeriesLabelClick">
    <!-- Had to change this to make it a bit shorter... -->
    <!-- <span class="heading">Books I own in the series</span> -->
    <span class="heading">My books in the series</span>
    <span class="count">{{ series.count }}</span>
    <font-awesome fas :icon="series.toggle ? 'chevron-up' : 'chevron-down'" />
  </div>
  
  <div class="hidden-section my-books-in-series" v-if="series.toggle">
    <div class="series-section" v-for="(series, seriesIndex) in series.collection" :key="series.asin">
      
      <div class="series-heading" v-tippy="{ placement: 'left' }" content="This number represents every single book listing in the series page, including different versions of books you may already have.">
        <div class="series-name">{{ series.name }}</div> <div class="series-length">{{ series.books.length }} / {{ series.length }}</div>
      </div>
      
      <div :data-series-name="series.name" class="numbers-list-item" :class="numbersClass( seriesBook )" v-for="(seriesBook, index) in series.books" :key="seriesBook.asin">
      
        <span class="icon" :content="iconTippyContent( seriesBook )" v-tippy="{ placement: 'left' }">
          <font-awesome fas :icon="booksInSeriesIcon( seriesBook )" />
        </span>
        
        <router-link v-if="seriesBook.asin !== book.asin" :to="{ 
        name: 'ale-series', 
        params: { series: series.asin }, 
        query: { book: seriesBook.asin },
        }">
          
          <span class="numbers">{{ getBookNumber( seriesBook, series.asin ) }}</span>
          <span class="title">{{ seriesBook.title }}</span>
          
        </router-link>
        <span v-else>
          
          <span class="numbers">{{ getBookNumber( seriesBook, series.asin ) }}</span>
          <span class="title">{{ seriesBook.title }}</span>
          
        </span>
        
      </div>
    </div>
  </div> <!-- .by-books-in-series -->
  
</div>
</template>

<script>
export default {
  name: 'booksInSeries',
  props: ['book'],
	data: function() {
		return {
      series: {
        collection: null,
        toggle: false,
      },
		}
  },
  
  created: function() {
    
    this.series.collection = this.getBooksInSeries();
    this.series.count = this.getSeriesCount();
    
  },
  
  methods: {
    
    getBookNumber: function( book, seriesAsin ) {
      
      const numbers = _.find( book.series, { asin: seriesAsin }).bookNumbers;
      return numbers ? numbers.join(',') : '';
      
    },
    
    getBooksInSeries: function() {
      
      const vue = this;
      let series = [];
      if ( vue.book.series ) {
        
        _.each(vue.book.series, function( currentSeries, i  ) {

          const allBooksInSeries = _.find(vue.$store.state.library.series, { asin: currentSeries.asin });
          if ( allBooksInSeries ) {
            series.push({
              asin: currentSeries.asin,
              name: currentSeries.name,
              length: allBooksInSeries.length,
              books: _.map( allBooksInSeries.books, function( asin  ) {
                return _.find( vue.$store.state.library.books, { asin: asin });
              }),
            });
          }
          
        });
        
      }
      return series.length > 0 ? series : null;
      
    },
    
    getSeriesCount: function() {
      
      let array = [];
      
      _.each( this.series.collection, function( series ) {
        array.push( series.books.length );
      });
      
      return array.join(', ');
      
    },
    
    booksInSeriesLabelClick: function() {
      
      this.series.toggle = !this.series.toggle;
      this.$nextTick(() => {
        this.$root.$emit('resizeSummary');
      });
      
    },
    
    numbersClass: function( book ) {
      
      var progress = book.progress;
      return {
        finished: progress && progress.toLowerCase().match('finished') ? true : false,
        reading: progress && !progress.toLowerCase().match('finished') ? true : false,
        unfinished: !book.progress,
        current: this.book.asin === book.asin,
      }
      
    },
    
    iconTippyContent: function( book ) {
      
      const classes = this.numbersClass( book );
      var tippyContent = '';
      if ( classes.finished ) {
        tippyContent = 'Finished!';
      }
      else if ( classes.unfinished ) {
        tippyContent = "Haven't started yet...";
      }
      else if ( classes.reading ) {
        tippyContent = 'Still listening...';
      }
      return tippyContent;
      
    },
    
    booksInSeriesIcon: function( book ) {
      
      const classes = this.numbersClass( book );
      var iconClass = '';
      if ( classes.finished ) {
        iconClass = 'archive';
      }
      else if ( classes.unfinished ) {
        iconClass = 'book';
      }
      else if ( classes.reading ) {
        iconClass = 'book-reader';
      }
      return iconClass;
      
    },
    
  },
  
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';

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
      border-bottom: 1px dotted rgba( themed(frontColor), .2);
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
        content: '';
        position: absolute;
        top: .9em;
        right: 0px;
        left: 0px;
        height: 1px;
        @include themify($themes) {
          background: rgba( themed(frontColor), .2);
        }
      }
      .icon { opacity: .5; }
      .title {
        text-decoration: line-through;
        opacity: .5;
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
    background: rgba( themed(frontColor), .01 );
    border-top: 1px solid rgba( themed(frontColor), .15 );
    border-bottom: 1px solid rgba( themed(frontColor), .15 );
  }
  > * { padding: 5px 0; }
  .heading { flex: 1; }
  .count {
    padding-left: 7px;
    padding-right: 7px;
    @include themify($themes) {
      border-left: 1px solid rgba( themed(frontColor), .15 );
      border-right: 1px solid rgba( themed(frontColor), .15 );
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
  &:first-child { margin-top: 0; }
}

.series-heading {
  display: block;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .series-name { flex: 1; }
}

</style>