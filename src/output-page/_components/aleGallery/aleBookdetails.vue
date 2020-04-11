<template>
<div id="ale-bookdetails" v-if="gallery.details.open">
  <div class="arrow"></div>
  <div id="book-info-container">
    <div class="inner-wrap">
      
      <div class="top">
        <div class="information">
          <div class="cover-wrap">
            <a :href="book.url" target="_blank">
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
            <div class="categories" v-if="stringifyArray( book.categories )">
              <strong class="label">Categories:</strong> <span v-html="stringifyArray( book.categories, ' > ' )"></span>
            </div>
            <div class="own-rating" v-if="ownRating">
              <strong class="label">My rating:</strong> <span>{{ ownRating }}</span>
            </div>
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
          </div>
        </div>
        
        <div class="summary">
          <h2>{{ book.title }}</h2>
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
		}
  },
  methods: {
    
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
		searchWatcher: function( sliderMount ) {
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
  font-size: 14px;
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
    
    a {
      white-space: nowrap;
      @include themify($themes) { color: themed(audibleOrange); }
    }
    a:visited { @include themify($themes) { color: darken( themed(audibleOrange), 5); } }
    
    > div {
      padding: 0 20px;
    }
    
    .cover-wrap {
      padding: 0;
      padding-bottom: 20px;
      img {
        display: block;
        width: 100%;
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
