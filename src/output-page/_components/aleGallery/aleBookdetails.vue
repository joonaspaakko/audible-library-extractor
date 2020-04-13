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
            
            <font-awesome-icon fas icon="chevron-down" />
            <div class="extra-info">
              
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
              <div class="book-numbers" v-if="stringifyArray( book.numbers )">
                <strong class="label">Book Number:</strong> <span v-html="stringifyArray( book.numbers )"></span>
              </div>
              <div class="categories" v-if="stringifyArray( book.categories )">
                <strong class="label">Categories:</strong> <span v-html="stringifyArray( book.categories, ' > ' )"></span>
              </div>
              <div class="my-books-in-series">
                <h3 class="label">Owned books in the series:</h3>
                <div v-for="(series, seriesKey, seriesIndex) in booksInSeries" :key="seriesKey">
                  <strong>{{ seriesKey }}</strong>
                  <div @click="booksInSeriesItemClick( book )" class="numbers-list" :class="numbersClass( book )" v-for="(book, index) in series" :key="index">
                    
              			<span class="icon">
                      <font-awesome-icon fas :icon="booksInSeriesIcon( book )" />
                    </span>
                    <span class="numbers">{{ bookNumbers( book, seriesIndex ) }}</span>
                    <span class="title">{{ book.title }}</span>
                    
                  </div>
                </div>
              </div>
              
              
            </div> <!-- .extra-info -->
          </div> <!-- .basic-details -->
        </div> <!-- .information -->
        
        <div class="summary">
          <h2>{{ book.title }}</h2>
					<div class="categories" v-if="stringifyArray( book.categories )">
						<span v-html="stringifyArray( book.categories, ' > ' )"></span>
					</div>
          <div v-html="book.summary"></div>
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
// const GreenAudioPlayer = require('green-audio-player');

export default {
  name: 'aleBookdetails',
  components: {
    aleCarousel
  },
  props: ['library', 'gallery'],
  computed: {
    booksInSeries: function() {
      var vue = this;
      var series = {};
      if ( vue.book.series ) {
        $.each(vue.book.series, function( i, obj ) {
          
          var findSeries = _.filter(vue.library.books, { series: [{name: obj.name }] });
          if ( !_.isEmpty( findSeries ) ) {
            series[ obj.name ] = _.sortBy(findSeries, ['bookNumbers']);
          }
          
        });
      }
      console.log( series );
      return series;
    },
    book: function() {
      return this.gallery.fuseResults ? this.gallery.fuseResults[ this.gallery.details.index ] : this.library.books[ this.gallery.details.index ];
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
    
    booksInSeriesItemClick: function( book ) {
      const index = _.findIndex(this.library.books, ['asin', book.asin]);
      this.gallery.details.booksInSeriesClick = true;
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
        return numbers ? numbers.toLowerCase().replace('book','').trim() : '';
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
  				var progress = book.progress.match(/\d+/g);
          console.log( book.progress );
  				progress = (+progress[0]) * 60 * 60 + (+progress[1]) * 60;
  				var length = book.length.match(/\d+/g);
  				length = (+length[0]) * 60 * 60 + (+length[1]) * 60;
  				
  				progress = length - progress;
  				return {
  					width: (progress / length) * 100 + '%',
  				};
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

#ale-bookdetails {
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
    margin: 31px;
    margin-top: 0;
    margin-left: 0px;
    border-radius: 3px;
    text-align: left;
    line-height: 1.6em;
    
    .label {
      // font-weight: normal;
      
    }
    
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
  
  .summary {
    flex-grow: 1;
    text-align: left;
    h2:first-child {
      font-size: 1.8em;
      margin-top: 0;
    }
  }
  
	.VueCarousel-dot-container {
		&, & > button {
      margin-top: 0 !important;
    }
    [aria-selected="false"] {
      @include themify($themes) { background-color: rgba( themed(frontColor), .43) !important; }
    }
	}
	
}
</style>
