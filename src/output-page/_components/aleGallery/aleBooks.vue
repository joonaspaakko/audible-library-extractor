<template>
  <div id="ale-books">
    <div
      class="ale-book"
      :class="{ 'details-open': gallery.details.open && gallery.details.index === index  }"
      v-for="(book, index) in booksArray"
			:key="book.asin"
      @click="detailsToggle( index )"
    >
      <div class="details-inner-wrap">
        
  			<sort-values :gallery="gallery" :book="book"></sort-values>
        <div class="hidden">
          <span class="title">{{ book.title }}</span>
          <span class="authors">{{ stringifyArray( book.authors, 'name' ) }}</span>
        </div>
        <div class="ale-cover" >
          <img
            v-lazy="book.coverUrl"
            :data-title="book.title"
            :data-asin="book.asin"
            :data-authors="stringifyArray( book.authors, 'name' )"
            :data-narrators="stringifyArray( book.narrators, 'name' )"
            :alt="book.title"
          >
        </div>
        
      </div>
    </div> <!-- .ale-book -->
  </div>
</template>

<script>

import sortValues from './sortValues'

export default {
  name: 'aleBooks',
  props: ['booksArray', 'library', 'gallery'],
  components: {
    sortValues
  },
	
	data: function() {
		return {
			windowWidth: null,
			windowResizeTimer: null,
		}
	},
  
  created: function() {
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
  
  methods: {
    
    stringifyArray: function( array, key ) {
      if ( key ) return _.map( array, key ).join(', ');
      else return array.join(', ')
    },
    
    scrollStopAnimate: function(){
      $("body, html").stop();
    },
    
    onBookClicked: function( msg ) {
      this.detailsToggle( msg.index, msg.animationSpeed )
    },
    
    detailsToggle: function( clickedIndex, animSpeed ) {
      
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
			else if ( this.gallery.details.open && this.gallery.details.index === clickedIndex ) {
				this.gallery.details.open = false;
			}
      
      const detailsIndex = this.gallery.details.index;
      this.gallery.details.index = clickedIndex;
      this.gallery.details.changed = (detailsIndex !== clickedIndex || this.gallery.details.open);
      
      this.$nextTick(() => {
        if ( this.gallery.details.open ) {
          const el = $( $('#ale-gallery > div > .ale-book').get( clickedIndex ) );
          this.calculateDetailsPosition( el, this, clickedIndex, detailsIndex, coverViewportOffset, animSpeed );
        }
        Eventbus.$emit('detailsToggle', {
          from: 'aleBooks',
          detailsChanged: this.gallery.details.changed
        });
      });
      
      
			
    },
    
    calculateDetailsPosition: function( el, comp, clickedIndex, detailsIndex, coverViewportOffset, animSpeed ) {
      
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
      
      var coverDocumentOffset = el.offset().top;
      var doc = $("body, html");
      doc.scrollTop( coverDocumentOffset - coverViewportOffset );
      doc.stop().animate({
        scrollTop: coverDocumentOffset - (parseInt( firstCoverEl.css('margin-top') )*2)
      }, animSpeed != undefined ? animSpeed : 900);
			
			var targetCenter = el.offset().left + (bookWidth/2) + 8;
      var detailsArrow = bookDetails.find('> .arrow');
      var arrowHalf = parseInt( detailsArrow.css('border-left-width'))
      detailsArrow.css({
        left: targetCenter
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
}

.ale-book {
  position: relative;
  z-index: 0;
  text-align: center;
  display: inline-block;
  // font-size: 0;
  .details-inner-wrap {
    max-width: $thumbnailSize;
    margin: 5px;
    border-radius: 3px;
    overflow: hidden;
    background-clip: padding-box;
  }
  .ale-cover {
    border-radius: 3px;
    overflow: hidden;
    background-clip: padding-box;
    @include themify($themes) {
      border: 1px solid rgba( themed(outerColor), .3 );
    }
    img {
      display: block;
      width: $thumbnailSize;
      height: $thumbnailSize;
  	  -webkit-user-drag: none;
  	  -khtml-user-drag: none;
  	  -moz-user-drag: none;
  	  -o-user-drag: none;
  	  user-drag: none;
    }
  }
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

@media ( max-width: 609px ) {
  .ale-book {
    $thumbnailSizeSmall: $thumbnailSize - 25;
    .details-inner-wrap {
      max-width: $thumbnailSizeSmall;
    }
    .ale-cover img {
      width: $thumbnailSizeSmall;
      height: $thumbnailSizeSmall;
    }
  }
}

@media ( max-width: 550px ) {
  .ale-book {
    $thumbnailSizeSmall: $thumbnailSize - 45;
    .details-inner-wrap {
      max-width: $thumbnailSizeSmall;
    }
    .ale-cover img {
      width: $thumbnailSizeSmall;
      height: $thumbnailSizeSmall;
    }
  }
}

@media ( max-width: 474px ) {
  .ale-book {
    $thumbnailSizeSmall: $thumbnailSize;
    .details-inner-wrap {
      max-width: $thumbnailSizeSmall;
    }
    .ale-cover img {
      width: $thumbnailSizeSmall;
      height: $thumbnailSizeSmall;
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
      .icon-wrap {
        margin-left: 0px;
        > div { padding: 6px 6px; }
      }
    }
  }
   
  #ale-books {
  	.ale-book {
  		width: 50%;
			.ale-cover img {
				width: 100%;
        height: auto;
			}
  	}
  }
  
}

@media ( max-width: 420px ) {
  #ale-bookdetails div.ale-carousel .slick-dots {
    display: none !important;
  }
}
</style>
