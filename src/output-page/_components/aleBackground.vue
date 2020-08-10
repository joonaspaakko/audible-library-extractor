<template>
<div id="ale-background" v-if="books">
	<img v-for="( book, index ) in books" :key="book.asin" :src="makeCoverUrl(book.coverUrl, 200)" alt="">
</div>
</template>

<script>
import makeCoverUrl from '../_mixins/makeCoverUrl';

export default {
  name: 'aleBackground',
  props: ['library'],
  mixins: [ makeCoverUrl ],
	data : function() {
		return {
      books: null,
      windowWidth: null,
      timer1: null,
      timer2: null,
		}
	},
  
  created: function() {
    
    const vue = this;
    
    setTimeout(function() {
      vue.books = vue.getBooks();
      vue.flipAnimationRandomizer();
    }, 1500);
    
    this.windowWidth = $(window).width();
    $(window).on('resize', this.onWindowResize );
    
  },
  destroyed: function() {
		$(window).off('resize', this.onWindowResize );
  },
  
  methods: {
    
		getBooks: function() {
      
      // 15 (>1300)
      // 12 (<1300) 
      // 8 (<1000)
      // 6 (<760)
      // 4 (<530)
      function calculateBgLength( n ) { return 3*n; }
      let bgLength = calculateBgLength(15);
      if ( this.windowWidth < 530 ) {
        bgLength = calculateBgLength(4);
      }
      else if ( this.windowWidth < 760 ) {
        bgLength = calculateBgLength(6);
      }
      else if ( this.windowWidth < 1000 ) {
        bgLength = calculateBgLength(8);
      }
      else if ( this.windowWidth < 1300 ) {
        bgLength = calculateBgLength(12);
      }
      
      const books = (function( books ) {
        const booksLength = books.length;
        if ( booksLength <= bgLength ) {
          const fits = Math.floor( bgLength / booksLength );
          const difference = bgLength - (booksLength * fits);
          const loopLength = fits;
          let clonedBooks = [];
          for (let i = 0; i < loopLength; i++) {
            clonedBooks = clonedBooks.concat( books );
          }
          if ( difference > 0 ) clonedBooks = clonedBooks.concat( books.splice(-1,difference) );
          return clonedBooks;
        }
        else {
          return _.sampleSize( books, bgLength);
        }
      }( this.library.books ));
      
      return books;
      
    },
    
    flipAnimationRandomizer: function () {
      
      const vue = this;
      
      const gridImages = $('#ale-background img');
      const gridImagesLength = gridImages.length-1;
      
      clearInterval( vue.timer1 );
      clearInterval( vue.timer2 );      
      
      vue.timer1 = setInterval( function() {
        coverSwitcheroo();
      }, randomNumber( 1500, 3000 ));
      vue.timer2 = setInterval( function() {
        coverSwitcheroo();
      }, randomNumber( 3500, 5000 ));
      
      function coverSwitcheroo() {
        const gridImages = $('#ale-background img');
        const gridImagesLength = gridImages.length-1;
        const img1 = gridImages.get( randomNumber( 0, gridImagesLength ) );
        const img2 = vue.library.books[ randomNumber( 0, vue.library.books.length-1 ) ].coverUrl;
        $(img1).addClass('flip-out');
        setTimeout(function() {
          $(img1).attr('src', vue.makeCoverUrl(img2, 200) ).removeClass('flip-out');
        }, 1000);
      }
      function randomNumber( min, max ) {
        return Math.floor( Math.random() * (max-min+1) +min );
      }
      
    },
    
    onWindowResize: function() {

			var vue = this;
		  clearTimeout( vue.windowResizeTimer);
		  vue.windowResizeTimer = setTimeout(function() {
        var windowWidth = $(this).width();
				if ( windowWidth !== vue.windowWidth ) {
          vue.windowWidth = windowWidth;
          vue.books = vue.getBooks();
				}
      }, 1000);
      
    },
    
  },
  
}
</script>

<style lang="scss">
@import '~@/_variables.scss';


#ale-background {
  position: fixed;
  z-index: -1;
  left: -3.05%;
  right: -3.05%;
  top: 0;
  opacity: 0.2;
  text-align: center;
  font-size: 0px;
  line-height: 0px;

  &:after {
    content: "";
    position: absolute;
    z-index: 1;
    top: 25%;
    right: 0;
    bottom: 0;
    left: 0;
    @include themify($themes) {
      background: -moz-linear-gradient( top, rgba(themed(backColor),0) 0%, rgba(themed(backColor),.6) 24%, themed(backColor) 78%, themed(backColor) 100%);
      background: -webkit-linear-gradient( top, rgba(themed(backColor),0) 0%, rgba(themed(backColor),.6) 24%, themed(backColor) 78%, themed(backColor) 100%);
      background: linear-gradient( to bottom, rgba(themed(backColor),0) 0%, rgba(themed(backColor),.6) 24%, themed(backColor) 78%,themed(backColor) 100%);
    }
  }

  img {
    position: relative;
    z-index: 0;
    width: 6%;
    margin: 2px;
    transition: all 900ms;
    opacity: 1;
    transform: rotateY(0deg);
    &.flip-out {
      opacity: 0;
      transform: rotateY(180deg);
      transition-duration: 1000ms;
    }
    -webkit-transform: translateZ(0);
    @-webkit-keyframes showImage { 0% { opacity: 0; } 100% { opacity: 1; }  }
    @keyframes showImage { 0% { opacity: 0; } 100% { opacity: 1; }  }
    -webkit-animation: 1000ms showImage;
    animation: 1000ms showImage;
  }
}
// In ios, the gradient "mask" flickers when a cover animates behind it.
// Fix: hide it on IOS and use mask-image instead..
@supports (-webkit-touch-callout: none) {
  #ale-background:after {
    display: none !important;
  }
  #ale-background {
    opacity: 0.1;
    -webkit-mask-image: -webkit-gradient(
      linear,
      left 20%,
      left bottom,
      from(rgba(0, 0, 0, 1)),
      to(rgba(0, 0, 0, 0))
    ) !important;
  }
}

.theme-dark #ale-background:after {
	-webkit-animation: color-change-dark 400ms linear;
	animation: color-change-dark 400ms linear;
}
.theme-light #ale-background:after {
	-webkit-animation: color-change-light 400ms linear;
	animation: color-change-light 400ms linear;
}

@media ( max-width: 1300px ) {

  #ale-background img {
    width: 7.55%;
  }
  
}
@media ( max-width: 1000px ) {

  #ale-background img {
    width: 11.37%;
  }
  
}
@media ( max-width: 760px ) {

  #ale-background img {
    width: 15.09%;
  }
  
}
@media ( max-width: 530px ) {

  #ale-background img {
    width: 22.84%;
  }
  
}
</style>
