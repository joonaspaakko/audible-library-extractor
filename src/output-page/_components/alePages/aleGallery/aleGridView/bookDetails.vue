<template>
<div id="ale-bookdetails" ref="bookDetails" v-shortkey.once="['esc']" @shortkey="closeBookDetails()">
  <div class="arrow" ref="arrow"></div>
  <div id="book-info-container" v-shortkey.once="{left: ['arrowleft'], right: ['arrowright']}" @shortkey="openAdjacentBookDetails">
    <div class="inner-wrap" :style="{ maxWidth: getMaxWidth }">
      
      <div class="top">
        <div class="information" ref="information">
          
          <div class="cover-wrap">
            <a :href="makeUrl('book', book.asin)" target="_blank">
							<div class="progressbar">
                <div class="progress" :style="progressbarWidth( book )">
                  <!-- <div class="progress-tooltip" v-if="book.progress && book.length" :content="progressTooltip( book )" v-tippy="{ placement: 'top',  arrow: true, theme: general.tippyTheme, showOnInit: true, trigger: 'manual', hideOnClick: false, boundary: progressToolTipBoundaryEl() }"></div> -->
                </div>
              </div>
              <img class="cover" v-if="book.cover" :src="makeCoverUrl(book.cover)">
            </a>
          </div>
          <div class="progress-info" v-html="progressInfo( book )"></div>
          <div class="basic-details">
            
            <div class="search-goodreads" v-if="goodReadsSearchUrl">
              <a :href="goodReadsSearchUrl" target="_blank">Search in Goodreads</a>
            </div>
            
            <book-basic-info :book="book" :general="general"></book-basic-info>
            
          </div> <!-- .basic-details -->
          <books-in-series :library="library" :book="book" :general="general"></books-in-series>
					
        </div> <!-- .information -->
        
        <book-summary :book="book" :general="general" ></book-summary>
        
      </div>
      
      <carousel v-if="!loading && book.peopleAlsoBought" :general="general" :books="book.peopleAlsoBought">
        <!-- People who bought this also bought: -->
        Listeners also enjoyed
      </carousel>
      
      <carousel v-if="!loading && book.moreLikeThis" :general="general" :books="book.moreLikeThis">
        More listens like this
      </carousel>
      
    </div> <!-- .inner-wrap -->
  </div> <!-- #book-info-container -->
</div> <!-- #ale-bookdetails -->
</template>

<script>
// import sortBookNumbers from '@output-mixins/sort/bookNumbers';
import timeStringToSeconds from '@output-mixins/timeStringToSeconds';
import secondsToTimeString from '@output-mixins/secondsToTimeString';
import progressbarWidth from '@output-mixins/progressbarWidth';
import makeCoverUrl from '@output-mixins/makeCoverUrl';

import carousel from './bookDetails/carousel';
import booksInSeries from './bookDetails/booksInSeries';
import bookSummary from './bookDetails/bookSummary';

import makeUrl from '@output-mixins/makeFullUrl';

import bookBasicInfo from '@output-comps/snippets/book-basic-info';
import arrayToHTML from '@output-comps/snippets/arrayToHTML';

export default {
  name: 'bookDetails',
  components: {
    bookBasicInfo,
    carousel,
    booksInSeries,
    arrayToHTML,
    bookSummary,
  },
  mixins: [
    // sortBookNumbers,
		timeStringToSeconds,
    secondsToTimeString,
    progressbarWidth,
    makeCoverUrl,
    makeUrl,
  ],
  props: ['general', 'book', 'booksArray', 'index', 'library', 'gallery', 'booksWrapper'],
  data: function() {
    return {
      maxWidth: 'none',
      scrollTop: 0,
      loading: true,
    }
  },
  
  created: function() {
    
    this.scrollTop = window.pageYOffset;
    
    Eventbus.$on('detailsToggle', this.onDetailsToggle );
	 	this.$root.$on('afterWindowResize', this.onWindowResize );
    
  },
  
  mounted: function() {
    
    this.maxWidth = this.repositionBookDetails() + 'px';
    this.resetScroll();
    this.changeUrl();
    
    this.loading = false;
    
  },
	
	beforeDestroy: function() {
	 	Eventbus.$off('detailsToggle', this.onDetailsToggle );
	 	this.$root.$off('afterWindowResize', this.onWindowResize );
	},
  
  computed: {    
    
    getMaxWidth: function() {
      return window.innerWidth > 800 ? this.maxWidth : '800px';
    },
    
    // FIXME: Fix this
    goodReadsSearchUrl: function() {
      
      const base = 'https://www.goodreads.com/search?q=';
      return base + (
        this.book.ISBN_10 && this.book.ISBN_10 ||
        this.book.ISBN_13 && this.book.ISBN_13 ||
        this.book.authors ? encodeURIComponent( this.book.authors[0].name + ' ' + this.book.titleShort ) : null
      );
      
    },
    
    // bookUrl: function() {
    //   const url = new Url( this.general.urlOrigin + this.book.url );
    //   url.query.ipRedirectOverride = true;
    //   url.query.overrideBaseCountry = true;
    //   return url.toString();
    // },
    
    // book: function() {
    //   if ( this.booksArray[ this.gallery.details.index ] ) {
    //     return this.booksArray[ this.gallery.details.index ];
    //   }
    //   else {
    //     return false;
    //   }
    // },
    
  },
  methods: {
    
    onWindowResize: function() {
      
      console.log('%c' + 'onwindowresize' + '', 'background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;');
      this.maxWidth = this.repositionBookDetails() + 'px';
      this.resetScroll();
      
    },
    
    changeUrl: function() {
      if ( this.$route.query.book !== this.book.asin ) {
        this.$router.replace({ query: { book: this.book.asin } });
      }
    },
    
    resetScroll: function() {
      this.$nextTick(function() {
        scroll({ top: document.querySelector('.ale-book.details-open').offsetTop - 78 });
      });
    },
    
    scrollToDetails: function() {
      
      // window.scroll({ 
      //   top: this.bookEl.offsetTop - 42,
      //   left: 0,
      //   behavior: 'smooth'
      // });
      // this.$refs.bookDetails.scrollIntoView({ behavior: 'smooth' });
      
    },
    
    repositionBookDetails: function() {
      
      const gridView = document.querySelector('#ale-books.grid-view');
      const domBooks = gridView.querySelectorAll('.ale-book');
      
      const target = {};
      target.el = domBooks[ this.index ];
      target.index = this.index;
      target.width = target.el.offsetWidth;
      target.siblings = domBooks; // + target.el

      const wrapper ={};
      wrapper.el = gridView;
      wrapper.width = wrapper.el.offsetWidth;

      const info = {};
      info.cols = Math.floor( wrapper.width / target.width );

      if ( info.cols < 2 ) {
        info.rowEndEl = target.el; 
      }
      else {
        info.currentRow = Math.floor( target.index / info.cols ) + 1;
        info.rowEnd = info.currentRow * info.cols;
        // Rolls back if the last element is not at the end of the row
        info.getRowEndEl = function( index ) {
          let el = target.siblings[ index ];
          if ( !el ) { el = info.getRowEndEl( --index ); }
          return el; 
        }
        info.rowEndEl = info.getRowEndEl( info.rowEnd-1 );
      }

      info.rowEndEl.classList.add('target-row-end');
      info.rowEndEl.parentNode.insertBefore(this.$refs.bookDetails, info.rowEndEl.nextSibling);
      
      this.repositionBookDetailsArrow( target.el );
      
      return target.width * info.cols;
      
    },
    
    repositionBookDetailsArrow: function( clickedEl ) {
      
      const leftOffset = clickedEl.getBoundingClientRect().left + window.scrollX;
      const targetCenter = leftOffset + (clickedEl.offsetWidth/2);
      
      this.$refs.arrow.style.left = targetCenter + 'px';
      
    },
    
    openAdjacentBookDetails: function( e ) {
      
      switch ( e.srcKey ) {
        case 'left':
          if ( this.index > 0 ) {
            
            this.$emit('open-adjacent-book', { book: this.booksArray[ this.index-1 ] });
            
          }
          break;
        case 'right':
          const booksLength = this.booksArray.length;
          if ( this.index < booksLength ) {
            
            this.$emit('open-adjacent-book', { book: this.booksArray[ this.index+1 ] });
            
          }
          break;
      }

    },
    
    closeBookDetails: function() {
      
      this.$emit('update:book', null );
      this.$router.replace({ query: { book: undefined } });
      
    },
    
    progressToolTipBoundaryEl: function() {
      return $('#ale-bookdetails .information .cover-wrap')[0];
    },
    
    progressTooltip: function( book ) {
      if ( book.progress.toLowerCase().trim() === 'finished' ) {
        const length = this.timeStringToSeconds( book.length );
        return 'Finished: ( '+ this.secondsToTimeString( length ) +' )';
      }
      else {
        const progress = this.timeStringToSeconds( book.progress );
        const length = this.timeStringToSeconds( book.length );
        
        const difference = length - progress;
        return 'Progress: ' + this.secondsToTimeString( difference ) +' / '+ this.secondsToTimeString( length );
      }
    },
    
    progressInfo: function( book ) {
      if ( book.progress && book.length ) {
        if ( book.progress.toLowerCase().trim() === 'finished' ) {
          const length = this.timeStringToSeconds( book.length );
          return '<div class="stretch-center" style="flex: 1;"><strong>Finished!</strong> ( '+ this.secondsToTimeString( length, true ) +' )</div>';
        }
        else {
          const progress = this.timeStringToSeconds( book.progress );
          const length = this.timeStringToSeconds( book.length );
          const difference = length - progress;
          return '<strong>Progress: </strong>' + '<div>'+ this.secondsToTimeString( difference, true ) + ' / ' + this.secondsToTimeString( length, true ) +'</div>';
        }
      }
      else {
        return '<div>Length: '+ book.length +'</div>';
      }
    },
    
    // onDetailsToggle: function( msg ) {
		// 	if ( msg.detailsChanged ) {
		// 		this.summaryMaxHeight();
		// 	}
    // },
    
    
		// searchLock: function( params ) {
      
		// 	if ( !this.gallery.searchLocked.active ) {
    //     this.gallery.randomResults = null;
    //     this.gallery.searchLocked.tempValue = this.gallery.searchValue;
		// 		this.gallery.searchLocked.active = true;
    //     this.gallery.searchEnabled = false;
		// 		this.gallery.searchIcons.scope = false;
    //     this.gallery.searchOptions.listsTemp = _.cloneDeep( this.gallery.searchOptions.lists );
		// 	}
      
    //   this.gallery.searchLocked.inputValue = params.seriesName;
    //   this.gallery.searchOptions.lists.showSortValues = params.sortValues;
    //   this.gallery.searchOptions.lists.numberSortSeriesName = params.seriesName;
    //   this.gallery.searchLocked.reason = params.reason;
      
    //   _.map( this.gallery.searchOptions.lists.filter, function(obj, i) {
    //     return _.extend(obj, { active: true });
    //   });
        
    //   this.gallery.customResults = _.filter(this.library.books, params.filter );
    //   const sortItemIndex = _.findIndex(this.gallery.searchOptions.lists.sort, ['key', params.sortKey]);
    //   this.gallery.searchOptions.lists.sort[ sortItemIndex ].active = false;
    //   this.gallery.searchOptions.lists.sortIndex = sortItemIndex;
      
    
    //   this.$nextTick(() => {
    //     params.callback( this );
    //   });
      
		// },
		
    booksInSeriesItemClick: function( book, seriesName ) {
      
			// this.searchLock({
			// 	reason: 'Series',
			// 	filter: { series: [{name: seriesName }] },
			// 	sortKey: 'bookNumbers',
			// 	sortValues: true,
			// 	sortDirection: 'asc',
			// 	seriesName: seriesName,
      //   callback: function( vue ) {
          
      //     vue.gallery.details.open = false; // Makes sure that when you click the open book in the "books I own in the series" list, book details won't get closed. I decided it was better to do it this way for books that are part of multiple series.
          
      //     Eventbus.$emit('galleryBookClick', {
      //       from: 'books-in-series-item-click',
      //       index: _.findIndex(vue.booksArray, ['asin', book.asin]),
      //       animationSpeed: 0
      //     });
          
      //   },
			// });      
      
    },
    
    // bookNumbers: function( book, seriesAsin ) {
    //   let anyNumbers = _.find( book.series, 'bookNumbers');
    //   if ( anyNumbers ) {
    //     const numbers = _.find(book.series, ['asin', seriesAsin ]).bookNumbers;
    //     return _.isArray( numbers ) ? numbers.join(', ') : numbers;
    //   }
    //   else {
    //     return '';
    //   }
    // },
    
  }
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';

#ale-bookdetails {
  -webkit-user-select: text;
  -khtml-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
	
  @include themify($themes) {
    border-top: 3px solid themed(audibleOrange);
    border-bottom: 3px solid rgba( themed(frontColor), .15);
    background: rgba( themed(backColor), .9 );
    box-shadow: themed(shadowSmall);
    color: themed(frontColor);
  }
	width: 100vw;
  box-sizing: border-box;
  // font-size: 14px;
  padding: 40px 35px;
  margin-top: 12px;
  margin-bottom: 35px;
	position: relative;
	left: 50%;
	right: 50%;
	margin-left: -50vw;
	margin-right: -50vw;
  
  .arrow {
    @include themify($themes) {
      border-color: transparent transparent themed(audibleOrange) transparent;
    }
    position: absolute;
    top: -9px;
    left: 50%;
    margin-left: -21px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 21px 7px 21px;
  }
  
  .book-info-container {
    padding: 0 20px;
  }
  
  .inner-wrap {
    display: flex;
    flex-direction: column;
    justify-content: start;
    justify-items: start;
    align-content: start;
    align-items: start;
    margin: 0 auto;
    max-width: $containerSize;
    width: 100%;
    position: relative;
    z-index: 0;
    > .top {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: start;
      justify-items: start;
      align-content: start;
      align-items: start;
    }
  }
  
  a {
    white-space: nowrap;
  }
  
  .information {
    @include themify($themes) {
      // border: 1px solid rgba( themed(frontColor), .1);
      background-color: rgba(themed(frontColor), .01);
      box-shadow: 0 3px 15px rgba( darken(themed(backColor), 30) , .8);
    }
    border-radius: 3px;
    overflow: hidden;
    background-clip: padding-box;
    flex-basis: 280px;
    max-width: 280px;
    flex-shrink: 0;
    margin-right: 31px;
    border-radius: 3px;
    text-align: left;
    line-height: 1.6em;
    
    > div {
      margin-bottom: 20px !important;
    }
    
    .cover-wrap {
      position: relative;
      padding: 0;
      overflow: hidden;
      margin-bottom: 0px !important;
      img {
        display: block;
        width: 280px;
        height: 280px;
      }
      .progressbar {
        position: absolute;
        z-index: 5;
        right: 0;
        bottom: 0;
        left: 0;
        @include themify($themes) {
          background: rgba(darken(themed(backColor), 1), .65);
        }
        .progress {
          height: 5px;
          @include themify($themes) {
            background: themed(audibleOrange);
          }
        }
        .progress-tooltip {
          width: 1px;
          height: 100%;
          float: right;
        }
      }
    }
    
    div.progress-info {
      font-size: .9em;
      text-align: center;
      margin-bottom: 15px;
      padding: 3px 13px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      @include themify($themes) {
        background: rgba( themed(frontColor), .01 );
        border-top: 1px solid rgba( themed(frontColor), .15 );
        border-bottom: 1px solid rgba( themed(frontColor), .15 );
      }
      > div {
        width: 100%;
        text-align: center;
      }
    }
    
    .basic-details {
      padding: 0 20px;
      > div {
        &:first-child { padding-top: 0; }
        padding-top: 10px;
      }
    }
    
    // padding-top: 20px;
    // padding-bottom: 20px;
    
    .series a {
      white-space: normal;
    }
    .series .book-number {
      font-size: .8em;
			white-space: nowrap;
    }
    
    .strong-label {
      margin: 10px 0 5px 0;
    }
    
  }
  
} // #ale-bookdetails

.theme-light #ale-bookdetails {
  background: -moz-linear-gradient(top,  rgba(249,248,248,0.9) 0%, rgba(249,248,248,1) 49%, rgba(249,248,248,1) 100%);
  background: -webkit-linear-gradient(top,  rgba(249,248,248,0.9) 0%,rgba(249,248,248,1) 49%,rgba(249,248,248,1) 100%);
  background: linear-gradient(to bottom,  rgba(249,248,248,0.9) 0%,rgba(249,248,248,1) 49%,rgba(249,248,248,1) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#e6f9f8f8', endColorstr='#f9f8f8',GradientType=0 );
}
.theme-dark #ale-bookdetails {
  background: -moz-linear-gradient(top,  rgba(21,23,27,0.9) 0%, rgba(21,23,27,1) 49%, rgba(21,23,27,1) 100%);
  background: -webkit-linear-gradient(top,  rgba(21,23,27,0.9) 0%,rgba(21,23,27,1) 49%,rgba(21,23,27,1) 100%);
  background: linear-gradient(to bottom,  rgba(21,23,27,0.9) 0%,rgba(21,23,27,1) 49%,rgba(21,23,27,1) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#e615171b', endColorstr='#15171b',GradientType=0 );
}

// #ale-bookdetails {
  
// 	.VueCarousel-dot-container {
// 		&, & > button {
//       margin-top: 0 !important;
//     }
//     [aria-selected="false"] {
//       @include themify($themes) { background-color: rgba( themed(frontColor), .43) !important; }
//     }
// 	}
	
// } // #ale-bookdetails

@media ( max-width: 640px ) {
  
  #ale-bookdetails {
    // #book-info-container {
    //   padding: 0 45px;
    // }
    .inner-wrap {
      max-width: none !important;
      .top {
        display: flex;
        flex-direction: column;
        .information {
          max-width: none;
          width: 100%;
          margin-right: 0;
          margin-bottom: 40px;
          flex: auto;
          .cover-wrap {
            max-height: 65px;
          }
        }
      }
    }
  }
  
}


</style>
