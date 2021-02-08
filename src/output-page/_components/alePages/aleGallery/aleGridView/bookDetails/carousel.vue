<template>
  <div class="ale-carousel">
		<h3 class="ale-heading">
			<slot></slot>
		</h3>
				
		<splide :options="options" ref="splide" v-if="loaded">
			<splide-slide class="ale-carousel-item" v-for="(book, index) in books" :key="index">
				
					<a :href="makeUrl('book', book.asin)" target="_blank" v-tippy :content="sliderTippyContent( book )">
						<img class="cover" :data-splide-lazy="makeCoverUrl(book.cover)" alt="">
					</a>
					
			</splide-slide>
		</splide>
		
  </div>
</template>

<script>
// import { Splide, SplideSlide } from '@splidejs/vue-splide';
import '@splidejs/splide/dist/css/themes/splide-sea-green.min.css';

import makeFullUrl from '@output-mixins/makeFullUrl';
import makeCoverUrl from '@output-mixins/makeCoverUrl';

export default {
  name: 'carousel',
  props: ['books', 'width'],
  mixins: [
    makeFullUrl,
    makeCoverUrl,
	],
	
	components: {
		'splide': () => import( /* webpackChunkName: "splide" */'@splidejs/vue-splide').then(({ Splide }) => Splide),
		'splide-slide': () => import( /* webpackChunkName: "splide" */'@splidejs/vue-splide').then(({ SplideSlide }) => SplideSlide),
  },
	
	data: function() {
		return {
			loaded: false,
			options: {
				type        : 'loop',
				rewind      : true,
				// autoWidth   : true,
				width				: null,
				trimSpace   : false,
				gap         : '4px',
				lazyLoad    : 'nearby',
				preloadPages: 1,
				perPage     : 5,
			},
		}
	},
	
	mounted: function() {
		
		this.$nextTick(function() {	
			const winWidth = window.innerWidth;
			const windowMobile = winWidth <= '716';
			this.options.width = windowMobile ? winWidth : this.$el.offsetWidth;
			const carouselWidth = windowMobile ? winWidth - (42*2) : this.$el.offsetWidth - (42*2);
			let coverSize = 127;
			if ( winWidth <= '500' ) coverSize = 102;
			if ( winWidth <= '415' ) coverSize = 72;
												
			this.options.perPage = Math.floor(carouselWidth / coverSize);
			this.loaded = true;
		});
		
		
	},
	
	methods: {
		
		sliderTippyContent: function( book ) {
			const html =
				'<div style="font-weight: normal; text-align: left; padding: 10px; font-size: 13px; line-height: 17px">' +
					(book.title 		 ? '<div><h3 style="font-size: 1.2em; font-weight: bold; margin: 0 0 3px 0;">'+ book.title +'</h3>' : '') +
					(book.subHeading ? '<div><h2 style="font-size: 1.1em; font-weight: normal; margin: 0 0 3px 0;">'+ book.subHeading +'</h2>' : '') +
					(book.authors 	 ? '<div><strong>Authors: </strong>'+ book.authors +'</div>' : '') +
					(book.narrators  ? '<div><strong>Authors: </strong>'+ book.narrators +'</div>' : '') +
					(book.length 		 ? '<div><strong>Length: </strong>'+ book.length +'</div>' : '') +
				'</div>';
			return html;
		},
			
	},
	
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

.ale-carousel {
	display: block;
	border-radius: 20px;
	width: 100%;
	margin-top: 20px;
	&:first-child { margin-top: 0 !important; }
	
	.ale-heading {
		text-align: center;
		margin: 0px;
		margin-top: 20px;
	}
	
	.ale-slider {
		width: 100%;
	}
	.tooltip {
		display: none;
	}

	.ale-carousel-item {
		display: inline-block;
		> a {
			outline: none;
			display: inline-block;
		}
		width: 125px !important;
		height: 125px !important;
		.cover {
			width: 125px !important;
			height: 125px !important;
			@include themify($themes) { border: 1px solid rgba( themed(outerColor), .5); }
		}
		
	}
	
	.splide {
		padding-top: 25px !important;
		padding-bottom: 25px !important;
	}
	.splide__pagination {
		bottom: 9px !important;
	}
	.splide__arrow {
		// margin-top: -19px;
		svg {
			width: 20px !important;
			height: 20px !important;
			padding: 10px !important;
			@include themify($themes) { fill: rgba( themed(frontColor), .5 ) !important; }
		}
		&:hover svg {
			@include themify($themes) { fill: rgba( themed(frontColor), .87 ) !important; }
		}
	}
	.splide__arrow--prev { 
		left: 10px !important; 
		svg { padding-left: 0px !important; }
	}
	.splide__arrow--next { 
		right: 10px !important; 
		svg { padding-left: 0px !important; }
	}
	.splide__pagination__page.is-active {
		@include themify($themes) { background: themed(audibleOrange) !important; }
	}
	
}


@media (max-width: 716px) {
	.splide {
		box-sizing: border-box !important;
		position: relative;
		left: 50%;
		right: 50%;
		width: 100vw;
		margin-left: -50vw;
		margin-right: -50vw;
		max-width: unset !important;
	}
}

@media ( max-width: 500px ) {

  .ale-carousel {
  	
		.ale-carousel-item {
			&, .cover {
				width: 100px !important;
				height: 100px !important;
			}
		}
		
		.slick-dots {
	    // display: none;
			li {
				margin-left: 1px;
				margin-right: 1px;
			}
			button {
				padding-left: 1px;
				padding-right: 1px;
			}
	  }
		
  } // .ale-carousel
  
	.splide__pagination__page { width: 10px !important; }
	
}

@media ( max-width: 415px ) {

  .ale-carousel {
		.ale-carousel-item {
			&, .cover {
				width: 70px !important;
				height: 70px !important;
			}
		}
  } // .ale-carousel
  
}
</style>
