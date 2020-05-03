<template>
<div id="ale-bookdetails" v-if="gallery.details.open">
  <div class="arrow"></div>
  <div id="book-info-container">
    <div class="inner-wrap">
      <!-- {{ book }} -->
      <div class="top">
        <div class="information">
          <div class="cover-wrap">
            <a :href="book.url" target="_blank">
							<div class="progressbar"><div class="progress" :style="progress( book )"></div></div>
              <img class="cover" :src="book.coverUrl">
            </a>
          </div>
          <div class="basic-details">
            
            <div class="authors" v-if="stringifyArray( book.authors )">
              <strong class="label">Author:</strong> <span v-html="stringifyArray( book.authors )"></span>
            </div>
            <div class="narrators" v-if="stringifyArray( book.narrators )">
              <strong class="label">Narrator:</strong> <span v-html="stringifyArray( book.narrators )"></span>
            </div>
            <div class="series" v-if="stringifyArray( book.series )">
              <strong class="label">Series:</strong> <span v-html="stringifyArray( book.series )"></span>
            </div>
            <div class="own-rating" v-if="ownRating">
              <strong class="label">My rating:</strong> <span>{{ ownRating }}</span>
            </div>
						
						<h3 class="label">More info <font-awesome-icon fas icon="chevron-down" /></h3>
            <div class="hidden-section extra-info">
              
              <div class="progress" v-if="book.progress">
                <strong class="label">My progress:</strong> <span>{{ book.progress }}</span>
              </div>
              <div class="publisher" v-if="book.publisher">
                <strong class="label">Publisher:</strong> <span>{{ book.publisher }}</span>
              </div>
              <div class="rating" v-if="book.rating">
                <strong class="label">Overall rating:</strong> <span>{{ book.rating }} {{ book.ratings }}</span>
              </div>
              <div class="release-date" v-if="book.releaseDate">
                <strong class="label">Release date:</strong> <span>{{ book.releaseDate }}</span>
              </div>
              <div class="date-added" v-if="book.dateAdded">
                <strong class="label">Date added:</strong> <span>{{ book.dateAdded }}</span>
              </div>
              <div class="book-numbers" v-if="stringifyArray( book.numbers )">
                <strong class="label">Book Number:</strong> <span v-html="stringifyArray( book.numbers )"></span>
              </div>
              <div class="categories" v-if="stringifyArray( book.categories )">
                <strong class="label">Categories:</strong> <span v-html="stringifyArray( book.categories, ' > ' )"></span>
              </div>
            </div> <!-- .extra-info -->
            
            <h3 v-if="booksInSeries" class="label">Books I own in the series <font-awesome-icon fas icon="chevron-down" /></h3>
            <div class="hidden-section my-books-in-series">
              <div v-for="(series, seriesKey, seriesIndex) in booksInSeries" :key="seriesKey">
                <strong>{{ seriesKey }}</strong>
                <div :data-series-name="seriesKey" @click="booksInSeriesItemClick( book, seriesKey )" class="numbers-list" :class="numbersClass( book )" v-for="(book, index) in series" :key="index">
                  
                  <span class="icon" :content="iconTippyContent( book )" v-tippy="{ placement: 'left',  arrow: true }">
                    <font-awesome-icon fas :icon="booksInSeriesIcon( book )" />
                  </span>
                  <span class="numbers">{{ bookNumbers( book, seriesIndex ) }}</span>
                  <span class="title">{{ book.title }}</span>
                  
                </div>
              </div>
            </div> <!-- .by-books-in-series -->
            
          </div> <!-- .basic-details -->
        </div> <!-- .information -->
        
        <div class="book-summary-wrapper">
          <vuescroll :vueScrollOptions="vueScrollOptions">
            <div class="book-summary">
              <h2>{{ book.title }}</h2>
              <div class="categories" v-if="stringifyArray( book.categories )">
                <span v-html="stringifyArray( book.categories, ' > ' )"></span>
              </div>
              <div v-html="book.summary"></div>
            </div>
          </vuescroll>
        </div>

      </div>
      
      <ale-carousel v-if="book.peopleAlsoBought" :gallery="gallery" :books="book.peopleAlsoBought" type="peopleAlsoBought"></ale-carousel>
      <ale-carousel v-if="book.moreLikeThis" :gallery="gallery" :books="book.moreLikeThis" type="moreLikeThis"></ale-carousel>
      
    </div> <!-- .inner-wrap -->
  </div> <!-- #book-info-container -->
</div> <!-- #ale-bookdetails -->
</template>

<script>
import aleCarousel from './aleCarousel'
import vuescroll from 'vuescroll';
// const GreenAudioPlayer = require('green-audio-player');

export default {
  name: 'aleBookdetails',
  components: {
    aleCarousel,
    vuescroll,
  },
  data: function() {
    return {
      vueScrollOptions: {
        scrollingX: false,
        rail: {
          background: '#f79a1c',
          opacity: 0,
          size: '3px',
          specifyBorderRadius: false,
          gutterOfEnds: null,
          gutterOfSide: '2px',
          keepShow: true,
        },
        bar: {
          showDelay: 100,
          onlyShowBarOnScroll: false,
        }
      }
    }
  },
  props: ['booksArray', 'library', 'gallery'],
  computed: {
    booksInSeries: function() {
      var vue = this;
      var series = {};
      if ( vue.book.series ) {
        $.each(vue.book.series, function( i, obj ) {
          
          var findSeries = _.filter(vue.library.books, { series: [{name: obj.name }] });
          if ( !_.isEmpty( findSeries ) ) {
            series[ obj.name ] = vue.sortBookNumbers( findSeries, i );
          }
          
        });
      }
      return _.isEmpty(series) || series.length < 2 ? null : series;
    },
    book: function() {
      // return this.gallery.fuseResults ? this.gallery.fuseResults[ this.gallery.details.index ] : this.library.books[ this.gallery.details.index ];
      return this.booksArray[ this.gallery.details.index ];
    },
		ownRating: function() {
      var book = this.library.books[ this.gallery.details.index ];
      var newStyle = _.has(book.ownRating, 'newStyleRating');
      var value = newStyle ? book.ownRating.newStyleRating : book.ownRating;
			return value;
		},
		searchWatcher: function() {
			return this.gallery.fuseResults;
		},
  },
  methods: {
    
    sortBookNumbers: function( array, i ) {
      return _.orderBy(array, function(o) {
        
        if ( o.bookNumbers ) {
          // If one book has multiple numbers, the first one is used for sorting
          var numbers = _.isArray( o.bookNumbers[i] ) ? o.bookNumbers[i][0] : o.bookNumbers[i];
          // If the number is a string, we assume it's a number range
          // and once again use the first number from that range
          var dashSplit = typeof numbers == 'string' ? numbers.split('-') : [numbers];
          if ( dashSplit.length > 1 ) {
            return parseFloat( dashSplit[0] );
          }
          else {
            return numbers;
          }
        }
        else {
          return 9999999;
        }
        
      }, 'asc');
    },
    
    booksInSeriesItemClick: function( book, seriesName ) {
      
      const vue = this;
      var fuseOpts = {
        keys: ['series.name'],
        distance: 0,
        threshold: 0.0,
        distance: 100,
      };
      
      vue.$search( seriesName, vue.library.books, {
        keys: ['series.name'],
        location: 0,
        distance: 900,
        threshold: 0.0
      }).then(results => {
        
        vue.gallery.searchValue = seriesName;
        vue.$nextTick(() => {
          const sortedResult =  vue.sortBookNumbers( results, 0 );
          const index = _.findIndex(sortedResult, ['asin', book.asin]);
          vue.gallery.fuseResults = sortedResult;
          vue.$nextTick(() => {
            Event.$emit('galleryBookClick', {
              from: 'books-in-series-item-click',
              index: index
            });
          });
        });
        
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
    
    bookNumbers: function( book, seriesIndex) {
      if ( book.bookNumbers ) {
        var numbers = book.bookNumbers[ seriesIndex ];
        return _.isArray( numbers ) ? numbers.join(', ') : numbers;
      }
      else {
        return '';
      }
    },
    
		progress: function( book ) {
      if ( book.progress ) {
        if ( book.progress.toLowerCase().trim() === 'finished' ) {
          return {
            width: '100%',
          };
        }
  			else if ( book.length ) {
					
          var progress = timeStringToSeconds( book.progress );
          const length = timeStringToSeconds( book.length );
  				
  				progress = length - progress;
					
  				return {
  					width: (progress / length) * 100 + '%',
  				};
          
          function timeStringToSeconds( string ) {
            const hasMinutes = string.match('min'); //sometimes 'min', sometimes 'mins'
            var numbers = string.match(/\d+/g);
            // If the array numbers.length is 2, then we the array must contain hours and minutes
            if ( numbers.length === 2 ) {
              numbers = (+numbers[0]) * 60 * 60 + (+numbers[1]) * 60;
            }
            // If the array numbers.length is below 2...
            // ...and the original string doesn't contain the word 'min',
            // then we'll assume the unit is hours...
            else if ( !hasMinutes ) {
              numbers = (+numbers[0]) * 60 * 60;
            }
            // If the array numbers is below 2...
            // ...and the original string contains the word 'min',
            // then we'll assume the unit is minutes...
            else {
              numbers = (+numbers[0]) * 60;
            }
            return numbers;
          }
					
  			}
  			else {
  				return {
  					width: 0,
  				}
  			}
      }
			else {
				return {
					width: 0,
				}
			}
		},
    stringifyArray: function( array, delimiter ) {
      if ( array ) {
        var html = '';
        array.forEach((item, index ) => {
          html += '<a href="'+ item.url +'" target="_blank">'+ item.name +'</a>';
          if ( index < array.length-1 ) html += (delimiter || ', ');
        });
        return html;
      }
    },
  
  },
  watch: {
		searchWatcher: function() {
			this.gallery.details.open = false;
			this.gallery.details.index = -1;
		}
	},
}
</script>

<style lang="scss">
@import '~@/_variables.scss';
@import 'node_modules/green-audio-player/src/scss/main.scss';

.prevent-scrolling {
  overflow: hidden;
}

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
    @include themify($themes) { color: themed(audibleOrange); }
  }
  a:visited { @include themify($themes) { color: darken( themed(audibleOrange), 5); } }
  
  .information {
    @include themify($themes) {
      // border: 1px solid rgba( themed(frontColor), .1);
      background-color: darken(themed(backColor), 1);
      box-shadow: 0 3px 15px rgba( darken(themed(backColor), 30) , .8);
    }
    border-radius: 3px;
    overflow: hidden;
    background-clip: padding-box;
    min-width: 280px;
    max-width: 280px;
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
      margin-bottom: 20px;
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
      }
    }
    
    .basic-details > div {
      &:first-child { padding-top: 0; }
      padding-top: 10px;
    }
    
    // padding-top: 20px;
    padding-bottom: 20px;
    
    .series a {
      white-space: normal;
    }
    
    .label {
      margin: 10px 0 5px 0;
    }
    div.hidden-section {
      // display: none;
      padding-top: 0px;
    }
    
  }
  
  .information .my-books-in-series {
    .numbers-list {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      @include themify($themes) {
        border-bottom: 1px dotted rgba( themed(frontColor), .2);
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
    &:hover {
      @include themify($themes) {
        box-shadow: 0 0 10px rgba( darken(themed(frontColor), 30) , .3);
      }
    }
  }
  .book-summary {
    position: relative;
    z-index: 0;
    // overflow: hidden;
    // overflow-x: hidden;
    // overflow-y: auto;
    flex-grow: 1;
    text-align: left;
    h2:first-child {
      font-size: 1.8em;
      margin-top: 0;
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

@media screen and ( max-width: 900px ) {
  
  #ale-bookdetails {
    .inner-wrap {
      .top {
        display: flex;
        flex-direction: column;
        .information {
          display: flex;
          flex-direction: row;
          img.cover {
            min-width: 80px;
            max-width: 80px;
          }
        }
      }
    }
  }
  
}


</style>
