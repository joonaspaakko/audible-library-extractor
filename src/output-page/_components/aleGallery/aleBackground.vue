<template>
<div id="ale-background">
	<img v-for="( book, index ) in books" :key="index" :src="book.coverUrl" alt="">
</div>
</template>

<script>
export default {
  name: 'aleBackground',
  props: ['library', 'gallery'],
	data : function() {
		return {
		}
	},
	computed: {
		books: function() {
			var n = this.library.books.length < 50 ? this.library.books : 50;
			return _.sampleSize( this.library.books, n);
		}
	},
	mounted: function() {
		
		// var timer = randomNumber( 500, 3300 );
		// setInterval( function() {
		//
		//   var gridImages = $('#bg-grid-wrapper img');
		//   var gridImagesLength = gridImages.length-1;
		//
		//   coverSwitcheroo( gridImages, gridImagesLength );
		//
		//   setTimeout( function() {
		//     coverSwitcheroo( gridImages, gridImagesLength );
		//   }, randomNumber( 1000, 3000 ));
		//
		//   setTimeout( function() {
		//     coverSwitcheroo( gridImages, gridImagesLength );
		//   }, randomNumber( 1000, 3000 ));
		//
		//   timer = randomNumber(500, 3300);
		// }, timer);
		//
		// function coverSwitcheroo( gridImages, gridImagesLength ) {
		//
		//   var img1 = gridImages.get( randomNumber( 0, gridImagesLength ) );
		//   var img2 = gridImages.get( randomNumber( 0, gridImagesLength ) );
		//   $(img1).addClass('flip-out');
		//   setTimeout(function() {
		//     $(img1).attr('src', $(img2).attr('src') ).removeClass('flip-out');
		//   }, 1000);
		//
		// }
		//
		// function randomNumber( min, max ) {
		//     return Math.floor( Math.random() * (max-min+1) +min );
		// }
		//
	}
}
</script>

<style lang="scss">
@import '~@/_variables.scss';


#ale-background {
  position: fixed;
  z-index: -1;
  left: -2.8%;
  right: -2.8%;
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
    transition: all 1000ms;
    opacity: 1;
    transform: rotateY(0deg);
    &.flip-out {
      opacity: 0;
      transform: rotateY(180deg);
    }
    -webkit-transform: translateZ(0);
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


</style>
