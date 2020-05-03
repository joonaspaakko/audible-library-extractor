<template>
  <div id="ale-books">
    <div
      class="ale-book"
      :class="{ 'details-open': gallery.details.open && gallery.details.index === index  }"
      v-for="(book, index) in booksArray"
			:key="book.asin"
      @click="detailsToggle( index )"
    >
			<sort-specials :gallery="gallery" :book="book"></sort-specials>
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
  </div>
</template>

<script>

import sortSpecials from './sortSpecials'

export default {
  name: 'aleBooks',
  props: ['booksArray', 'library', 'gallery'],
  components: {
    sortSpecials
  },
  
  created: function() {
    var vue = this;
    Event.$on('galleryBookClick', function( msg ) {
      vue.detailsToggle( msg.index );
    });
  },
  
  methods: {
    
    stringifyArray: function( array, key ) {
      if ( key ) return _.map( array, key ).join(', ');
      else return array.join(', ')
    },
    
    detailsToggle: function( clickedIndex ) {
      
      var comp = this;
      var el = $( $('#ale-gallery > div > .ale-book').get( clickedIndex ) );
      var coverViewportOffset = el.offset().top - $(document).scrollTop();
      
      
      // Open if closed
			var detailsClosed = !this.gallery.details.open ? true : false;
			if ( !this.gallery.details.open ) {
				this.gallery.details.open = true;
			}
      // Close if the same cover is clicked a second time
			else if ( this.gallery.details.open && this.gallery.details.index === clickedIndex ) {
				this.gallery.details.open = false;
			}
      
      var detailsIndex = this.gallery.details.index;
      this.gallery.details.index = clickedIndex;
      this.gallery.details.changed = (detailsIndex !== clickedIndex || this.gallery.details.open);
      
      this.$nextTick(() => {
        Event.$emit('gallerySliderMount', {
          from: 'aleBooks'
        });
        Event.$emit('detailsToggle', {
          from: 'aleBooks',
          detailsChanged: this.gallery.details.changed
        });
      });
      
      if ( this.gallery.details.open ) {
        this.$nextTick(() => {
					
					this.summaryMaxHeight();
          this.calculateDetailsPosition( el, this, clickedIndex, detailsIndex, coverViewportOffset );
					
        });
      }
      
			
    },
		
		summaryMaxHeight: function() {
      this.$nextTick(() => {
        var bookdetails = $('#ale-bookdetails > #book-info-container > .inner-wrap > .top');
    		var information = bookdetails.find('> .information');
        var informationH = information.outerHeight();
    		var summary = bookdetails.find('.book-summary');
        var summaryH = summary.height();
        
    		summary.css({
    			maxHeight: informationH
    		});
        
        summary.mouseenter(function(){
          $('html').addClass('prevent-scrolling');
        }).mouseleave(function(){
          $('html').removeClass('prevent-scrolling');
        });
        
			});
		},
    
    calculateDetailsPosition: function( el, comp, clickedIndex, detailsIndex, coverViewportOffset ) {
      
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
      
      var doc = $("body, html");
      var coverDocumentOffset = el.offset().top;
      doc.scrollTop( coverDocumentOffset - coverViewportOffset );
      doc.on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function(){ doc.stop(); });
      $(window).on("resize", function() {
        if ( comp.gallery.details.open ) comp.gallery.details.open = false;
      });
      doc.stop().animate({
        scrollTop: coverDocumentOffset - (parseInt( firstCoverEl.css('margin-top') )*2)
      }, 900);
			
			var targetCenter = el.offset().left + (bookWidth/2);
      var detailsArrow = bookDetails.find('> .arrow');
      var arrowHalf = parseInt( detailsArrow.css('border-left-width'))
      detailsArrow.css({
        left: targetCenter
      });
      
    }
    
  },
}
</script>

<style lang="scss" scoped>
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
  .ale-cover {
    margin: 5px;
    border-radius: 3px;
    overflow: hidden;
    background-clip: padding-box;
    @include themify($themes) {
      border: 1px solid rgba( themed(outerColor), .3 );
    }
    img {
      display: block;
      width: $thumbnailSize;
    }
  }
  &.details-open {
    .ale-cover {
      @include themify($themes) {
        border-color: themed(audibleOrange);
        box-shadow: 0 0px 1px 2px themed(audibleOrange), 0 2px 10px rgba( themed(frontColor), .4 );
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

</style>
