<template>
  <div id="ale-books" v-if="booksArray.length > 0">
    
    <lazy-component
    v-for="(book, index) in booksArray"
    class="ale-book"
    :key="book.asin"
    :data-asin="book.asin"
    :class="{ 'details-open': gallery.details.open && gallery.details.index === index  }"
    >
      <div 
      class="details-inner-wrap" 
      :data-title="book.title"
      :data-authors="stringifyArray( book.authors, 'name' )"
      :data-narrators="stringifyArray( book.narrators, 'name' )"
      >
        
        <sort-values :gallery="gallery" :book="book"></sort-values>
        <div class="hidden">
          <span class="title">{{ book.title }}</span>
          <span class="authors">{{ stringifyArray( book.authors, 'name' ) }}</span>
        </div>
        <div class="ale-cover">
          <div class="ale-play-sample" @click="playSample( book, index )">
            <div>
              <font-awesome-icon fas icon="play" />
            </div>
          </div>
          <div class="ale-click-wrap" @click="detailsToggle( index )">
            <div class="ale-info-indicator">
              <div>
                <font-awesome-icon fas icon="book" />
              </div>
            </div>
            <img
            class="ale-cover-image"
            :src="makeCoverUrl(book.coverUrl)"
            :alt="imageAlt( book, index )"
            >
          </div>
        </div>
        
      </div>
    </lazy-component> <!-- .ale-book -->
    
  </div>
</template>

<script>

import sortValues from './sortValues';
import slugify from '../../../_mixins/slugify';
import makeCoverUrl from '../../../_mixins/makeCoverUrl';

export default {
  name: 'aleBooks',
  props: ['booksArray', 'library', 'gallery', 'general'],
  components: {
    sortValues,
  },
  mixins: [ slugify, makeCoverUrl, ],
	data: function() {
		return {
			windowWidth: null,
      windowResizeTimer: null,
      filteredBooks: null,
		}
  },
  
  created: function() {
    const vue = this;
    const routeName = this.$route.name;
    if ( routeName === 'ale-category' ) {
      const parentCat = this.$route.params.parent;
      const childCat = this.$route.params.child;
      if ( parentCat ) {
        
        vue.gallery.customResults = _.filter( vue.library.books, function( book ) {
          if ( book.categories ) {
            var match = false;
            if ( childCat ) {
              if ( vue.slugify( book.categories[0].name ) === parentCat && vue.slugify( book.categories[1].name ) === childCat ) {
                return true;
              }
            }
            else {
              if ( vue.slugify( book.categories[0].name ) === parentCat ) {
                return true;
              }
            }
          }
        });
        
      }
    }
    
    Eventbus.$on('galleryBookClick', this.onBookClicked );
		this.windowWidth = $(window).width();
		$(window).on('resize', this.onWindowResize );
    $("body, html").on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", this.scrollStopAnimate);
  },
  
	beforeDestroy: function() {
	 	Eventbus.$off('galleryBookClick', this.onBookClicked );
		$(window).off('resize', this.onWindowResize );
    $("body, html").off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", this.scrollStopAnimate);
  },
  
  mounted: function() {
    
    if ( this.$route.query.book ) {
      this.$nextTick(function() {
        const bookEl = $('#ale-books .ale-book[data-asin="'+ this.$route.query.book +'"]');
        if ( bookEl.length > 0 ) {
          console.log( bookEl[0] )
          // setTimeout( function() {
            
            Eventbus.$emit('galleryBookClick', {
              from: 'ale-gallery-query',
              index: bookEl.index(),
              dontClose: true,
              // animationSpeed: 0,
            });
            
          // }, 1500 );
          
        }
      });
    }
    
  },
  
  methods: {
    
    imageAlt: function( book, index ) {
      return book.authors[0].name+ ' - ' +book.title;
    },
    
    playSample: function( book, index ) {
      Eventbus.$emit('playSample', {
        from: 'aleBooks',
        route: this.$route,
        book: book,
        index: index,
      });
    },
    
    stringifyArray: function( array, key ) {
      if ( key ) return _.map( array, key ).join(', ');
      else return array.join(', ')
    },
    
    scrollStopAnimate: function(){
      $("body, html").stop();
    },
    
    onBookClicked: function( msg ) {
      this.detailsToggle( msg.index, msg.animationSpeed, msg.dontClose )
    },
    
    detailsToggle: function( clickedIndex, animSpeed, dontClose ) {
      
      const vue = this;
      this.gallery.details.readmore.toggle = false;
			
      const comp = this;
      const el = $( $('#ale-gallery > div > .ale-book').get( clickedIndex ) );
      const coverViewportOffset = el.offset().top - $(document).scrollTop();
      
      // Open if closed
			const detailsClosed = !this.gallery.details.open ? true : false;
			if ( !this.gallery.details.open ) {
				this.gallery.details.open = true;
			}
      // Close if the same cover is clicked a second time
			else if ( !dontClose && this.gallery.details.open && this.gallery.details.index === clickedIndex ) {
				this.gallery.details.open = false;
      }
      
      const detailsIndex = this.gallery.details.index;
      this.gallery.details.index = clickedIndex;
      this.gallery.details.changed = (detailsIndex !== clickedIndex || this.gallery.details.open);
      
      this.$nextTick(() => {
        
        if ( this.gallery.details.open ) {
          const el = $( $('#ale-gallery > div > .ale-book').get( clickedIndex ) );
          this.calculateDetailsPosition( el, this, clickedIndex, detailsIndex, coverViewportOffset, animSpeed, function( el ) {
            
            // FIXME: alebooks sample thing
            // DOESN'T WORK when plaing sample in library and clicking the book in another page....?
            // Also this gets triggered quite a few times on load?
            const asin = el.data('asin');
            console.log('s')
            console.log( vue.$route.query.book );
            console.log('e')
            if ( vue.$route.query.book !== asin ) vue.$router.replace({ query: { book: asin } });
            
          });
        }
        else {
          
          const asin = el.data('asin');
          if ( vue.$route.query.book ) vue.$router.replace({ query: { book: undefined } });

        }
        Eventbus.$emit('detailsToggle', {
          from: 'aleBooks',
          detailsChanged: this.gallery.details.changed
        });
        
      });
      
      
			
    },
    
    calculateDetailsPosition: function( el, comp, clickedIndex, detailsIndex, coverViewportOffset, animSpeed, callback ) {
      
      var gallery = $('#ale-gallery');
      var maxWidth = gallery.width();
      var firstBook = gallery.find('.ale-book').first();
      var bookWidth = firstBook.width();
      var bookLength = gallery.find('.ale-book').length;
      var maxColLength = Math.floor( maxWidth / bookWidth );
      var bookIndex = clickedIndex;
      var colPosition = (bookIndex % maxColLength)+1;
      
      var firstCoverEl = firstBook.find('.ale-cover');
      var bookMargins = parseInt(firstCoverEl.css('margin-left')) + parseInt(firstCoverEl.css('margin-right'))
      gallery.find('.inner-wrap').css({
        maxWidth: (bookWidth*maxColLength ) - bookMargins
      });
      
      var maxRowLength = Math.floor( bookLength / maxColLength );
      var maxRowLengthRem = bookLength % maxColLength;
      if ( maxRowLengthRem > 0 ) ++maxRowLength;
      var fullGrid = maxRowLength * maxColLength
      var remainder = fullGrid - bookLength;
      
      var currentRow = Math.floor( bookIndex / maxColLength )+1;
      var lastRow  = currentRow === maxRowLength;
      var endOfTheRow = maxColLength * currentRow;
      endOfTheRow = lastRow ? endOfTheRow - remainder : endOfTheRow;
      var endOfTheRowEl = gallery.find('.ale-book').get( endOfTheRow-1 );
      
      // Details are moved at the end of the clicked row
      var bookDetails = $('#ale-bookdetails').insertAfter( endOfTheRowEl );
      
      var targetCenter = el.offset().left + (bookWidth/2) + 8;
      var detailsArrow = bookDetails.find('> .arrow');
      var arrowHalf = parseInt( detailsArrow.css('border-left-width'))
      detailsArrow.css({
        left: targetCenter
      });
      
      var coverDocumentOffset = el.offset().top;
      var doc = $("body, html");
      doc.scrollTop( coverDocumentOffset - coverViewportOffset );
      const distance = Math.abs( coverViewportOffset);
      let animationSpeed = animSpeed != undefined ? animSpeed : 700;
      if ( animSpeed != 0 ) {
        if      ( distance < 30 ) animationSpeed = 0;
        else if ( distance < 40 ) animationSpeed = (animationSpeed / 6);
        else if ( distance < 60 ) animationSpeed = (animationSpeed / 4);
        else if ( distance < 50 ) animationSpeed = (animationSpeed / 5);
        else if ( distance < 130 ) animationSpeed = (animationSpeed / 2);
        
        if ( animationSpeed < 0 ) animationSpeed = 0;
      }
      doc.stop().animate({
        scrollTop: coverDocumentOffset - (parseInt( firstCoverEl.css('margin-top') )*2)
      }, animationSpeed,function() {
        
        if ( callback ) callback( el );
        
      });
    },
		
		onWindowResize: function() {
      
			var vue = this;
		  clearTimeout( vue.windowResizeTimer);
		  vue.windowResizeTimer = setTimeout(function() {
        var windowWidth = $(this).width();
				if ( windowWidth !== vue.windowWidth ) {
          vue.windowWidth = windowWidth;
  				if ( vue.gallery.details.open ) {
            const index = vue.gallery.details.index;
            const el = $( $('#ale-gallery > div > .ale-book').get( index ) );
            const coverViewportOffset = el.offset().top - $('body, html').scrollTop();
            vue.calculateDetailsPosition( el, vue, index, index, coverViewportOffset, 0 );
            Eventbus.$emit('afterWindowResize', {
              from: 'aleBooks',
            });
          }
					// if ( vue.gallery.details.open ) vue.gallery.details.open = false;
				}
		  }, 150);

		}
		
  },
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

#ale-books {
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-size: 0px;
  line-height: 0px;
  > div {
    font-size: 14px;
    line-height: 1.55em;
  }
}

.ale-book {
  position: relative;
  z-index: 0;
  text-align: center;
  display: inline-block;
  width: $thumbnailSize+2;
  height: $thumbnailSize+2;
  // font-size: 0;
  .details-inner-wrap {
    // max-width: $thumbnailSize+2;
    margin: 5px;
    border-radius: 5px;
    overflow: hidden;
    background-clip: padding-box;
  }
  .ale-cover {
    cursor: pointer;
    position: relative;
    border-radius: 5px;
    overflow: hidden;
    background-clip: padding-box;
    @include themify($themes) {
      border: 1px solid rgba( themed(outerColor), .3 );
    }
    img.ale-cover-image {
      display: block;
      width: 100%;
      height: auto;
      // width: $thumbnailSize;
      // height: $thumbnailSize;
  	  -webkit-user-drag: none;
  	  -khtml-user-drag: none;
  	  -moz-user-drag: none;
  	  -o-user-drag: none;
  	  user-drag: none;
      @-webkit-keyframes showImage { 0% { opacity: 0; } 100% { opacity: 1; }  }
      @keyframes showImage { 0% { opacity: 0; } 100% { opacity: 1; }  }
      -webkit-animation: 300ms showImage;
      animation: 300ms showImage;
    }
  }
  
  .ale-info-indicator {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    justify-items: center;
    color: #fff;
    background: rgba( #000, .20 );
    z-index: 998;
    transition: all 200ms ease-in-out;
    opacity: 0;
    &:after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-content: center;
      align-items: center;
      justify-items: center;
      background: rgba( #fff, .25 );
      z-index: 0;
      transition: all 200ms ease-in-out;
      opacity: 0;
    }
    > div {
      font-size: 120%;
      transition: all 100ms ease-in-out;
      cursor: pointer;
      position: relative;
      z-index: 2;
      width: 10%;
      height: 10%;
      opacity: 0;
      border-radius: 99999px;
      background: rgba( #000, .70 );
      box-shadow:  0 0 2px 1px rgba( #000, .70 );
      display: flex;
      justify-content: center;
      align-content: center;
      align-items: center;
      justify-items: center;
    }
  }
  .ale-click-wrap:hover {
    &:hover .ale-info-indicator,
    &:hover .ale-info-indicator div,
    &:hover .ale-info-indicator:after { opacity: 1; }
    
    &:hover .ale-info-indicator div { width: 50%; height: 50%; font-size: 140%; }
    
    &:hover .ale-cover > div > img {
      filter: blur(1px) grayscale(30%);
    }
  }
  
  
  .ale-play-sample {
    display: none;
    position: absolute;
    z-index: 999;
    bottom: 12px;
    right: 12px;
    padding: 6px;
    border-radius: 999999px;
    cursor: default;
    > div { 
      font-size: 10px;
      width: 20px;
      height: 20px;
      padding: 3px;
      color: rgba( #fff, 1 );
      background: rgba( #000, .9 );
      border-radius: 999999px;
      border: 2px solid rgba( $audibleOrange, .9 );
      box-shadow: 0px 0px 9px rgba( #000, .9 );
      cursor: pointer; 
    }
  }
  &.details-open .ale-play-sample,
  &:hover .ale-play-sample { display: inline-block; }
  
  &.details-open {
    .details-inner-wrap {
      @include themify($themes) {
        border-color: themed(audibleOrange);
        box-shadow: 0 0 0 3px themed(audibleOrange), 0 2px 10px rgba( #000, .7 );
      }
    }
    .ale-cover{
      @include themify($themes) {
        border-color: themed(backColor);
      }
    }
  }
  
  .hidden {
    position: absolute;
    z-index: -1;
    top: 50%;
    right: 0;
    left: 0;
    display: inline-block;
    width: 100%;
    height: 0;
    overflow: hidden;
  }
}

@media ( max-width: 616px ) {
  .ale-book {
    width: $thumbnailSize - 25;
    height: $thumbnailSize - 25;
  }
  
  #ale-search {
    > .icons {
      padding-left: 0;
      .icon-wrap {
        &:first-child {
          margin-left: 0;
        }
      }
    }
  }
}

@media ( max-width: 423px ) {

  #ale-search {
    padding: 8px 15px;
    [type="search"] {
      width: 100%;
    }
    > .icons {
      font-size: .9em;
    }
  }
  
}

@media ( max-width: 504px ) {

  #ale-books {
  	.ale-book {
  		width: 40vw;
  		height: 40vw;
  	}
  }
  
}
</style>
