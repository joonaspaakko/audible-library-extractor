<template>
<div id="ale-bookdetails" v-if="gallery.details.open && book" v-shortkey.once="['esc']" @shortkey="closeBookDetails()">
  <div class="arrow"></div>
  <div id="book-info-container" v-shortkey.once="{left: ['arrowleft'], right: ['arrowright']}" @shortkey="openAdjacentBookDetails">
    <div class="inner-wrap">
      <!-- {{ book }} -->
      <div class="top">
        <div class="information">
          <div class="cover-wrap">
            <a :href="bookUrl" target="_blank">
							<div class="progressbar">
                <div class="progress" :style="progressbarWidth( book )">
                  <!-- <div class="progress-tooltip" v-if="book.progress && book.length" :content="progressTooltip( book )" v-tippy="{ placement: 'top',  arrow: true, theme: general.tippyTheme, showOnInit: true, trigger: 'manual', hideOnClick: false, boundary: progressToolTipBoundaryEl() }"></div> -->
                </div>
              </div>
              <img class="cover" v-if="book.coverUrl" :src="makeCoverUrl(book.coverUrl)">
            </a>
          </div>
          <div class="progress-info" v-html="progressInfo( book )"></div>
          <div class="basic-details">
            
            <div class="search-goodreads" v-if="goodReadsSearchUrl">
              <a :href="goodReadsSearchUrl" target="_blank">Search in Goodreads</a>
            </div>
            
            <div class="authors" v-if="linkifyObjArray( book.authors )">
              <strong class="strong-label">Author:</strong> <span v-html="linkifyObjArray( book.authors )"></span>
            </div>
            <div class="narrators" v-if="linkifyObjArray( book.narrators )">
              <strong class="strong-label">Narrator:</strong> <span v-html="linkifyObjArray( book.narrators )"></span>
            </div>
            <div class="series" v-if="linkifyObjArray( book.series )">
              <strong class="strong-label">Series:</strong> <span v-html="linkifySeries( book.series )"></span>
            </div>
            <div class="own-rating" v-if="book.myRating">
              <strong class="strong-label">My rating:</strong> <span>{{ book.myRating }}</span>
            </div>
            
            <div class="publisher" v-if="linkifyObjArray( book.publisher )">
              <strong class="strong-label">Publisher:</strong> <span v-html="linkifyObjArray( book.publisher )"></span>
            </div>
            <div class="rating" v-if="book.rating">
              <strong class="strong-label">Overall rating:</strong> <span>{{ book.rating }} ({{ book.ratings }} ratings)</span>
            </div>
            <!-- <div class="progress" v-if="book.progress">
              <strong class="strong-label">My progress:</strong> <span>{{ book.progress }}</span>
            </div> -->
            
          </div> <!-- .basic-details -->
					<div v-if="booksInSeries" class="label hidden-section-label my-books-in-series-label" @click="booksInSeriesLabelClick">Books I own in the series <span>{{ booksInSeriesCount }}</span><font-awesome fas :icon="booksInSeriesContent.toggle ? 'chevron-up' : 'chevron-down'" /></div>
					<div class="hidden-section my-books-in-series" v-if="booksInSeriesContent.toggle">
						<div v-for="(series, seriesIndex) in booksInSeries" :key="series.asin">
							<strong>{{ series.name }}</strong>
                
                <div :data-series-name="series.name" class="numbers-list-item" :class="numbersClass( book )" v-for="(book, index) in series.books" :key="book.asin">
                  <router-link :to="{ 
                      name: 'ale-series', 
                      params: { series: series.asin }, 
                      query: { book: book.asin },
                  }">
                    
                    <span class="icon" :content="iconTippyContent( book )" v-tippy="{ placement: 'left',  arrow: true, theme: general.tippyTheme }">
                      <font-awesome fas :icon="booksInSeriesIcon( book )" />
                    </span>
                    <span class="numbers">{{ bookNumbers( book, series.asin ) }}</span>
                    <span class="title">{{ book.title }}</span>
                    
                </router-link>
              </div>
						</div>
					</div> <!-- .by-books-in-series -->
        </div> <!-- .information -->
        
        <div class="book-summary-wrapper" :class="{ expanded: gallery.details.readmore.toggle  }"  :style="{ maxHeight: summary.maxHeight, paddingBottom: gallery.details.readmore.toggle ? '40px' : '0px' }">
          
          <div class="book-summary">
            <h2 class="book-title">
              <a :href="bookUrl" target="_blank">
                {{ book.title }}
              </a>
            </h2>
            <div class="categories" v-if="linkifyObjArray( book.categories )">
              <span v-html="linkifyObjArray( book.categories, ' > ' )"></span>
            </div>
            <div class="inline-children smoll-text">
              <div class="release-date" v-if="book.releaseDate">
                <span class="strong-label">Released:</span> <span>{{ book.releaseDate }}</span>
              </div>
              <!-- <div class="date-added" v-if="book.dateAdded">
                <span class="strong-label">Added to my library:</span> <span>{{ book.dateAdded }}</span>
              </div> -->
            </div>
            <div class="summary-inner-wrap" v-html="getSummary"></div>
          </div>
          
          <div class="summary-read-more" @click="summaryReadMoreclick" v-if="summary.readmore.exists"><span>{{ gallery.details.readmore.toggle ? 'Read less' : 'Read more' }}</span> <font-awesome fas :icon="gallery.details.readmore.toggle ? 'chevron-up' : 'chevron-down'" /></div>

        </div>
      </div>
      
      <ale-carousel v-if="book.peopleAlsoBought" :gallery="gallery" :general="general" :books="book.peopleAlsoBought" type="peopleAlsoBought"></ale-carousel>
      <ale-carousel v-if="book.moreLikeThis" :gallery="gallery" :general="general" :books="book.moreLikeThis" type="moreLikeThis"></ale-carousel>
      
    </div> <!-- .inner-wrap -->
  </div> <!-- #book-info-container -->
</div> <!-- #ale-bookdetails -->
</template>

<script>
import sortBookNumbers from '../../../../_mixins/sort/bookNumbers';
import timeStringToSeconds from '../../../../_mixins/timeStringToSeconds';
import secondsToTimeString from '../../../../_mixins/secondsToTimeString';
import progressbarWidth from '../../../../_mixins/progressbarWidth';
import makeCoverUrl from '../../../../_mixins/makeCoverUrl';
import aleCarousel from './aleCarousel';

export default {
  name: 'aleBookdetails',
  components: {
    aleCarousel,
  },
  mixins: [
    sortBookNumbers,
		timeStringToSeconds,
    secondsToTimeString,
    progressbarWidth,
    makeCoverUrl,
  ],
  props: ['booksArray', 'library', 'gallery', 'general'],
  data: function() {
    return {
      booksInSeriesContent: {
        toggle: false,
      },
      summary: {
        readmore: {
          exists: false,
        },
        maxHeight: null,
        maxHeightTemp: null,
      }
    }
  },
  
  created: function() {
    Eventbus.$on('detailsToggle', this.onDetailsToggle );
    Eventbus.$on('afterWindowResize', this.onWindowResize );
  },
	
	beforeDestroy: function() {
	 	Eventbus.$off('detailsToggle', this.onDetailsToggle );
	 	Eventbus.$off('afterWindowResize', this.onWindowResize );
	},
  
  computed: {
    
    getSummary() {
      return this.book.summary || this.book.blurb;
    },
    
    goodReadsSearchUrl: function() {
      
      var base = 'https://www.goodreads.com/search?q=';
      return base + (
        this.book.ISBN_10 && this.book.ISBN_10 ||
        this.book.ISBN_13 && this.book.ISBN_13 ||
        this.book.authors ? encodeURIComponent( this.book.authors[0].name + ' ' + this.book.titleShort ) : null
      );
      
    },
    
    bookUrl: function() {
      const url = new Url( this.general.urlOrigin + this.book.url );
      url.query.ipRedirectOverride = true;
      url.query.overrideBaseCountry = true;
      return url.toString();
    },
    
    booksInSeriesCount: function() {
      if ( this.booksInSeries ) {
        const seriesName = this.gallery.searchOptions.lists.numberSortSeriesName;
        var seriesLength = null;
        if ( seriesName ) {
          seriesLength = this.booksInSeries[ seriesName ].length;
        }
        else {
          var numbers = [];
          _.each( this.booksInSeries, function( obj ) {
            numbers.push( obj.length );
          });
          seriesLength = numbers.join(',');
          numbers = null;
        }
        return seriesLength ? '('+ seriesLength  +')' : '';
      }
      else {
        return '';
      }
    },
    
    booksInSeries: function() {
      var vue = this;
      var series = [];
      if ( vue.book.series ) {
        $.each(vue.book.series, function( i, obj ) {
          
          var findSeriesBooks = _.filter(vue.library.books, { series: [{asin: obj.asin }] });
          console.log('findSeriesBooks')
          console.log(findSeriesBooks)
          if ( !_.isEmpty( findSeriesBooks ) ) {
            series.push({
              asin: obj.asin,
              name: obj.name,
              books: vue.sortBookNumbers({
                books: findSeriesBooks,
                direction: 'asc',
                seriesName: obj.name
              })
            });
          }
          
        });
      }
      console.log( series )
      return _.isEmpty(series) ? false : series;
    },
    
    book: function() {
      if ( this.booksArray[ this.gallery.details.index ] ) {
        return this.booksArray[ this.gallery.details.index ];
      }
      else {
        return false;
      }
    },
    
  },
  methods: {
    
    openAdjacentBookDetails: function( e ) {
      
      if ( this.gallery.details.open ) {
        switch ( e.srcKey ) {
          case 'left':
            if ( this.gallery.details.index > 0 ) {
              
              Eventbus.$emit('galleryBookClick', {
                from: 'book-details-arrow-left-click',
                index: this.gallery.details.index-1,
                animationSpeed: 1700,
                dontClose: true,
              });
              
            }
            break;
          case 'right':
            const booksLength = this.booksArray.length;
            if ( this.gallery.details.index < booksLength ) {
              
              Eventbus.$emit('galleryBookClick', {
                from: 'book-details-arrow-right-click',
                index: this.gallery.details.index+1,
                animationSpeed: 0,
                dontClose: true,
              });
              
            }
            break;
        }
      }
      
    },
    
    closeBookDetails: function() {
      if ( this.gallery.details.open ) {
        this.gallery.details.open = false;
        this.gallery.details.index = -1;
        const asin = this.book.asin;
        if ( this.$route.query.book ) this.$router.replace({ query: { book: undefined } });
      }
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
          return '<div>Finished ( '+ this.secondsToTimeString( length, true ) +' )</div>';
        }
        else {
          const progress = this.timeStringToSeconds( book.progress );
          const length = this.timeStringToSeconds( book.length );
          const difference = length - progress;
          return '<div class="text-align-left">Progress: </div>' +
					'<div class="text-align-right">'+ this.secondsToTimeString( difference, true ) +
					' / ' +
          this.secondsToTimeString( length, true ) +'</div>';
        }
      }
      else {
        return '<div>Length: '+ book.length +'</div>';
      }
    },
    
    onDetailsToggle: function( msg ) {
			if ( msg.detailsChanged ) {
				this.summaryMaxHeight();
			}
    },
		
    onWindowResize: function( msg ) {
			// if ( !this.gallery.details.readmore.toggle ) {
        this.summaryMaxHeight();
      // }
    },
    
		summaryMaxHeight: function() {
        this.gallery.details.readmore.toggle = false;
        const bookdetails = $('#ale-bookdetails > #book-info-container > .inner-wrap > .top');
    		const information = bookdetails.find('> .information');
        const informationH = information.outerHeight();
    		const summary = bookdetails.find('> .book-summary-wrapper > .book-summary');
        const summaryH = summary.height();
        const summaryTooSwoll = summaryH > informationH;
  			this.summary.readmore.exists = summaryTooSwoll ? true : false;
        this.summary.maxHeight = summaryTooSwoll ? (informationH + 'px') : 'none';
        this.summary.maxHeightTemp = (informationH + 'px');
		},
    
    summaryReadMoreclick: function() {
      
      this.gallery.details.readmore.toggle = !this.gallery.details.readmore.toggle ? true : false;
			
			if ( !this.gallery.details.readmore.toggle ) {
        var readmoreBtn = $('#ale-bookdetails .book-summary-wrapper .summary-read-more');
        var scrollDistance = $('html, body').scrollTop();
				var btnOffset = readmoreBtn.offset().top;
				var viewPortOffset = btnOffset - scrollDistance;
			}
			
      this.summary.maxHeight = this.gallery.details.readmore.toggle ? 'none' : this.summary.maxHeightTemp;
      
      // Keep read more/less button in the viewport on collapse
      if ( !this.gallery.details.readmore.toggle ) {
        // ...but only if closing it would mean losing sight of it.
        var scrollDistance = $('html, body').scrollTop();
        var summaryBottomOffset = $('#ale-bookdetails').offset().top + $('#ale-bookdetails .inner-wrap .information').innerHeight();
        if ( scrollDistance > summaryBottomOffset ) {
          this.$nextTick(() => {
            $('html, body').animate({
              scrollTop: readmoreBtn.offset().top - viewPortOffset
            }, 0 );
          });
        }
      }
      
    },
    
    booksInSeriesLabelClick: function() {
      this.booksInSeriesContent.toggle = this.booksInSeriesContent.toggle ? false : true;
      // if ( !this.gallery.details.readmore.toggle ) {
        this.$nextTick(() => {
          this.summaryMaxHeight();
        });
      // }
    },
    
		searchLock: function( params ) {
      
			if ( !this.gallery.searchLocked.active ) {
        this.gallery.randomResults = null;
        this.gallery.searchLocked.tempValue = this.gallery.searchValue;
				this.gallery.searchLocked.active = true;
        this.gallery.searchEnabled = false;
				this.gallery.searchIcons.scope = false;
        this.gallery.searchOptions.listsTemp = _.cloneDeep( this.gallery.searchOptions.lists );
			}
      
      this.gallery.searchLocked.inputValue = params.seriesName;
      this.gallery.searchOptions.lists.showSortValues = params.sortValues;
      this.gallery.searchOptions.lists.numberSortSeriesName = params.seriesName;
      this.gallery.searchLocked.reason = params.reason;
      
      _.map( this.gallery.searchOptions.lists.filter, function(obj, i) {
        return _.extend(obj, { active: true });
      });
        
      this.gallery.customResults = _.filter(this.library.books, params.filter );
      const sortItemIndex = _.findIndex(this.gallery.searchOptions.lists.sort, ['key', params.sortKey]);
      this.gallery.searchOptions.lists.sort[ sortItemIndex ].active = false;
      this.gallery.searchOptions.lists.sortIndex = sortItemIndex;
      
    
      this.$nextTick(() => {
        params.callback( this );
      });
      
		},
		
    booksInSeriesItemClick: function( book, seriesName ) {
      
			this.searchLock({
				reason: 'Series',
				filter: { series: [{name: seriesName }] },
				sortKey: 'bookNumbers',
				sortValues: true,
				sortDirection: 'asc',
				seriesName: seriesName,
        callback: function( vue ) {
          
          vue.gallery.details.open = false; // Makes sure that when you click the open book in the "books I own in the series" list, book details won't get closed. I decided it was better to do it this way for books that are part of multiple series.
          
          Eventbus.$emit('galleryBookClick', {
            from: 'books-in-series-item-click',
            index: _.findIndex(vue.booksArray, ['asin', book.asin]),
            animationSpeed: 0
          });
          
        },
			});      
      
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
    
    numbersClass: function( book ) {
      var progress = book.progress;
      return {
        finished: progress && progress.toLowerCase().match('finished') ? true : false,
        reading: progress && !progress.toLowerCase().match('finished') ? true : false,
        unfinished: !book.progress,
        current: this.book.asin === book.asin,
      }
    },
    
    bookNumbers: function( book, seriesAsin ) {
      let anyNumbers = _.find( book.series, 'bookNumbers');
      if ( anyNumbers ) {
        const numbers = _.find(book.series, ['asin', seriesAsin ]).bookNumbers;
        return _.isArray( numbers ) ? numbers.join(', ') : numbers;
      }
      else {
        return '';
      }
    },
    
    linkifySeries: function( array, delimiter ) {
      const vue = this;
      if ( array ) {
        var html = '';
        _.each(array, function(item, index ) {
          const url = new Url( vue.general.urlOrigin + item.url );
          url.query.ipRedirectOverride = true;
          url.query.overrideBaseCountry = true;
          html += '<a href="'+ url.toString() +'" target="_blank">'+ item.name +'</a>';
          if ( item.bookNumber ) html += '<span class="book-number"> (book '+ item.bookNumber +')</span>';
          if ( index < array.length-1 ) html += (delimiter || ', ');
        });
        return html;
      }
    },
    
    linkifyObjArray: function( array, delimiter ) {
      const vue = this;
      if ( array ) {
        var html = '';
        _.each( array, function(item, index ) {
          const url = new Url( vue.general.urlOrigin + item.url );
          url.query.ipRedirectOverride = true;
          url.query.overrideBaseCountry = true;
          html += '<a href="'+ url.toString() +'" target="_blank">'+ item.name +'</a>';
          if ( index < array.length-1 ) html += (delimiter || ', ');
        });
        return html;
      }
    },
  
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
  // font-size: 14px;
  padding: 40px 0;
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
    margin-left: -27px;
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
      padding: 0 20px;
    }
    
    .cover-wrap {
      position: relative;
      padding: 0;
      overflow: hidden;
      // margin-bottom: 20px;
      img {
        display: block;
        width: 100%;
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
      .text-align-left { text-align: left; }
      .text-align-right { text-align: right; }
      .text-middle {
        width: auto;
      }
    }
    
    .basic-details {
      > div {
        &:first-child { padding-top: 0; }
        padding-top: 10px;
      }
    }
    
    // padding-top: 20px;
    padding-bottom: 20px;
    
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
    
    div.hidden-section-label {
      cursor: pointer;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      padding-top: 5px;
      padding-bottom: 5px;
      @include themify($themes) {
        background: rgba( themed(frontColor), .01 );
        border-top: 1px solid rgba( themed(frontColor), .15 );
        border-bottom: 1px solid rgba( themed(frontColor), .15 );
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
      // display: none;
      padding-top: 0px;
    }
    
  }
  
  .information .my-books-in-series {
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
        // .title {
        //   overflow: hidden;
        //   position: relative;
        // }
        // .title:after {
        //   content: '';
        //   position: absolute;
        //   top: .9em;
        //   right: 0px;
        //   left: 0px;
        //   height: 1px;
        //   @include themify($themes) {
        //     background: rgba( themed(frontColor), .2);
        //   }
        // }
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
  
  .book-summary-wrapper {
    transition: all 200ms linear;
    max-height: none;
    padding-bottom: 0px;
    overflow: hidden;
    position: relative;
    .summary-read-more {
      cursor: pointer;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      position: absolute;
      z-index: 5;
      right: 0;
      bottom: 0px;
      left: 0;
      [data-icon] {
        padding-left: 10px;
      }
      &:after {
        content: '';
        position: absolute;
        z-index: -1;
        right: 0;
        bottom: 0;
        left: 0;
        height: 40px;
      }
    }
  }
  
  // Normalizes the top margin in the summary area.
  .summary-inner-wrap {
    p {
      margin-top: 1em;
      margin-bottom: 1em;
    }
    p:first-child { margin-top: 0; }
    margin-top: 1em;
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

.theme-light #ale-bookdetails .summary-read-more:after {
  background: -moz-linear-gradient(top,  rgba(249,248,248,0) 0%, rgba(249,248,248,1) 51%, rgba(249,248,248,1) 99%);
  background: -webkit-linear-gradient(top,  rgba(249,248,248,0) 0%,rgba(249,248,248,1) 51%,rgba(249,248,248,1) 99%);
  background: linear-gradient(to bottom,  rgba(249,248,248,0) 0%,rgba(249,248,248,1) 51%,rgba(249,248,248,1) 99%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00f9f8f8', endColorstr='#f9f8f8',GradientType=0 );
}
.theme-dark #ale-bookdetails .summary-read-more:after {
  background: -moz-linear-gradient(top,  rgba(21,23,27,0) 0%, rgba(21,23,27,1) 51%, rgba(21,23,27,1) 99%);
  background: -webkit-linear-gradient(top,  rgba(21,23,27,0) 0%,rgba(21,23,27,1) 51%,rgba(21,23,27,1) 99%);
  background: linear-gradient(to bottom,  rgba(21,23,27,0) 0%,rgba(21,23,27,1) 51%,rgba(21,23,27,1) 99%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#0015171b', endColorstr='#15171b',GradientType=0 );
}

#ale-bookdetails {
  
  .book-summary {
    position: relative;
    z-index: 0;
    // overflow: hidden;
    // overflow-x: hidden;
    // overflow-y: auto;
    // flex-grow: 1;
    text-align: left;
    h2.book-title {
      font-size: 1.8em;
      line-height: 1.1em;
      margin: 0;
      margin-bottom: 10px;
      a {
        white-space: normal;
        text-decoration: none;
        @include themify($themes) { color: themed(frontColor); }
        &:hover { text-decoration: underline; }
      }
    }
    .categories {
      line-height: 1.2em;
    }
    .inline-children {
      margin-top: 6px;
      > * { display: inline-block; }
    }
    .smoll-text {
      font-size: .8em;
      line-height: 1.2em;
    }
  } // .summary
  
	.VueCarousel-dot-container {
		&, & > button {
      margin-top: 0 !important;
    }
    [aria-selected="false"] {
      @include themify($themes) { background-color: rgba( themed(frontColor), .43) !important; }
    }
	}
	
} // #ale-bookdetails

@media ( max-width: 609px ) {
  
  #ale-bookdetails {
    #book-info-container {
      padding: 0 45px;
    }
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
    .book-summary-wrapper {
      max-height: 300px !important;
    }
    .expanded.book-summary-wrapper {
      max-height: none !important;
    }
  }
  
}


</style>
