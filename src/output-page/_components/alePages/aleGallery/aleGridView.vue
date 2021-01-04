<template>
  <div id="ale-books" class="grid-view" ref="booksWrapper">
    
    <book-details v-if="detailsBook" :key="'details:'+detailsBook.asin" :book.sync="detailsBook" :booksArray="booksArray" :booksWrapper="$refs.booksWrapper" :index="detailsBookIndex" :general="general" :library="library" :gallery="gallery" />
    
    <lazy-component
    v-for="(book, index) in booksArray"
    class="ale-book"
    :data-asin="book.asin"
    :key="book.asin"
    :class="{ 'details-open': detailsBook && detailsBook.asin === book.asin  }"
    >
      <book :book="book" :gallery="gallery" :index="index"></book>

    </lazy-component> <!-- .ale-book -->
    
  </div>
</template>

<script>

import bookDetails from './aleGridView/bookDetails'
import book from './aleGridView/book'

import slugify from '@output-mixins/slugify';

export default {
  name: 'aleBooks',
  props: ['booksArray', 'library', 'gallery', 'general'],
  components: {
    bookDetails,
    book,
  },
  mixins: [ slugify ],
	data: function() {
		return {
      detailsBook: null,
      detailsBookIndex: -1,
		}
  },
  
  created: function() {
    const vue = this;
    const routeName = this.$route.name;
    // if ( routeName === 'ale-category' ) {
    //   const parentCat = this.$route.params.parent;
    //   const childCat = this.$route.params.child;
    //   if ( parentCat ) {
        
    //     vue.gallery.customResults = _.filter( vue.library.books, function( book ) {
    //       if ( book.categories ) {
    //         var match = false;
    //         if ( childCat ) {
    //           if ( vue.slugify( book.categories[0].name ) === parentCat && vue.slugify( book.categories[1].name ) === childCat ) {
    //             return true;
    //           }
    //         }
    //         else {
    //           if ( vue.slugify( book.categories[0].name ) === parentCat ) {
    //             return true;
    //           }
    //         }
    //       }
    //     });
        
    //   }
    // }
    
    this.$root.$on('book-clicked', this.toggleBookDetails );
    // $("body, html").on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", this.scrollStopAnimate);
    // this.$root.$on('afterWindowResize', this.onWindowResize );
  },
  
	beforeDestroy: function() {
	 	this.$root.$off('book-clicked', this.toggleBookDetails );
    // $("body, html").off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", this.scrollStopAnimate);
	 	// this.$root.$off('afterWindowResize', this.onWindowResize );
  },
  
  mounted: function() {
    
    if ( this.$route.query.book ) {
      this.$nextTick(function() {
        
        this.toggleBookDetails({
          book: _.find( this.booksArray, { asin: this.$route.query.book })
        });
        
        // const bookEl = $('#ale-books .ale-book[data-asin="'+ this.$route.query.book +'"]');
        // if ( bookEl.length > 0 ) {
        //   // setTimeout( function() {
            
        //     Eventbus.$emit('galleryBookClick', {
        //       from: 'ale-gallery-query',
        //       index: bookEl.index(),
        //       dontClose: true,
        //       // animationSpeed: 0,
        //     });
            
        //   // }, 1500 );
          
        // }
      });
    }
    
  },
  
  methods: {
    
    
    // onBookClicked: function( e ) {
    //   this.toggleBookDetails( e )
    // },
    
    toggleBookDetails: function( e ) {
      console.log(  'TEST!!!!!!!');
      if ( !e.index )  e.index  = _.findIndex( this.booksArray, { asin: e.book.asin });
      
      const sameBook = _.get(this.detailsBook,'asin') === e.book.asin;
      this.detailsBook = null;
      this.detailsBookIndex = e.index;
      this.$nextTick(function() {
        if ( !sameBook ) this.detailsBook = e.book;
        else this.$router.replace({ query: { book: undefined } });
        console.log( this.detailsBook )
      });
      
    },
    
    scrollStopAnimate: function(){
      $("body, html").stop();
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
          // const el = $( $('#ale-gallery > div > .ale-book').get( clickedIndex ) );
          this.calculateDetailsPosition( el, this, clickedIndex, detailsIndex, coverViewportOffset, animSpeed, function( el ) {
            
            // FIXME: alebooks sample thing
            // DOESN'T WORK when plaing sample in library and clicking the book in another page....?
            // Also this gets triggered quite a few times on load?
            const asin = el.data('asin');
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
    
    // calculateDetailsPosition: function( el, comp, clickedIndex, detailsIndex, coverViewportOffset, animSpeed, callback ) {
      
    //   // FIXE: This should be a slightly lighter end of the row item calc: https://jsfiddle.net/4bxnu0vy/6/
    //   const gallery = $('#ale-gallery');
    //   const maxWidth = gallery.width();
    //   const firstBook = gallery.find('.ale-book').first();
    //   const bookWidth = firstBook.width();
    //   const bookLength = gallery.find('.ale-book').length;
    //   const maxColLength = Math.floor( maxWidth / bookWidth );
    //   const bookIndex = clickedIndex;
    //   // const colPosition = (bookIndex % maxColLength)+1;
      
    //   const firstCoverEl = firstBook.find('.ale-cover');
    //   const bookMargins = parseInt(firstCoverEl.css('margin-left')) + parseInt(firstCoverEl.css('margin-right'))
    //   gallery.find('.inner-wrap').css({
    //     maxWidth: (bookWidth*maxColLength ) - bookMargins
    //   });
      
    //   const maxRowLength = Math.floor( bookLength / maxColLength );
    //   const maxRowLengthRem = bookLength % maxColLength;
    //   // if ( maxRowLengthRem > 0 ) ++maxRowLength;
    //   const fullGrid = (maxRowLengthRem > 0 ? maxRowLength+1 : maxRowLength) * maxColLength
    //   const remainder = fullGrid - bookLength;
      
    //   const currentRow = Math.floor( bookIndex / maxColLength )+1;
    //   const lastRow  = currentRow === maxRowLength;
    //   const endOfTheRow = maxColLength * currentRow;
    //   const endOfTheRowEl = gallery.find('.ale-book').get( (lastRow ? endOfTheRow - remainder : endOfTheRow)-1 );
      
    //   // Details are moved at the end of the clicked row
    //   const bookDetails = $('#ale-bookdetails').insertAfter( endOfTheRowEl );
      
    //   const targetCenter = el.offset().left + (bookWidth/2) + 8;
    //   const detailsArrow = bookDetails.find('> .arrow');
    //   // var arrowHalf = parseInt( detailsArrow.css('border-left-width'))
    //   detailsArrow.css({
    //     left: targetCenter
    //   });
      
    //   const coverDocumentOffset = el.offset().top;
    //   const doc = $("body, html");
    //   doc.scrollTop( coverDocumentOffset - coverViewportOffset );
    //   const distance = Math.abs( coverViewportOffset);
    //   let animationSpeed = animSpeed != undefined ? animSpeed : 700;
    //   if ( animSpeed != 0 ) {
    //          if ( distance < 30  ) animationSpeed = 0;
    //     else if ( distance < 40  ) animationSpeed = (animationSpeed / 6);
    //     else if ( distance < 60  ) animationSpeed = (animationSpeed / 4);
    //     else if ( distance < 50  ) animationSpeed = (animationSpeed / 5);
    //     else if ( distance < 130 ) animationSpeed = (animationSpeed / 2);
        
    //     if ( animationSpeed < 0 ) animationSpeed = 0;
    //   }
    //   doc.stop().animate({
    //     scrollTop: coverDocumentOffset - (parseInt( firstCoverEl.css('margin-top') )*2)
    //   }, animationSpeed, function() {
    //     if ( callback ) callback( el );
    //   });
    // },
		
		// onWindowResize: function( msg ) {
      
		// 	if ( this.gallery.details.open ) {
    //     const index = this.gallery.details.index;
    //     const el = $( $('#ale-gallery > div > .ale-book').get( index ) );
    //     const coverViewportOffset = el.offset().top - $('body, html').scrollTop();
    //     this.calculateDetailsPosition( el, this, index, index, coverViewportOffset, 0 );
    //   }

		// },
		
  },
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

#ale-books.grid-view {
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
  
  &.details-open .ale-play-sample,
  &:hover .ale-play-sample { display: inline-block; }

  &.details-open {
    .details-inner-wrap {
      @include themify($themes) {
        border-color: themed(audibleOrange);
        box-shadow: 0 0 0 3px themed(audibleOrange), 0 2px 10px rgba( #000, .7 );
      }
    }
  }
  
  // Lazyload placeholder
  &:after {
    content: '';
    position: absolute;
    z-index: -1;
    top: 5px;
    right: 5px;
    bottom: 5px;
    left: 5px;
    border-radius: 5px;
    @include themify($themes) {
      background-color: themed(backColor);
    }
    @include themify($themes) {
      border: 1px solid rgba( themed(outerColor), .3 );
    }
    background-repeat: no-repeat;
    background-position: center center;
  }
  
}

.theme-light .ale-book:after {
  background-image: url("../../../images/table-loader-light.gif");
}
.theme-dark .ale-book:after {
  background-image: url("../../../images/table-loader-dark.gif");
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

  #ale-books.grid-view {
  	.ale-book {
  		width: 40vw;
  		height: 40vw;
  	}
  }
  
}
</style>
