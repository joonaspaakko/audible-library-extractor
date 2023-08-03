<template>
<div class="ale-carousel" :data-scrolling="scrolling">
	
	<!-- CAROUSEL HEADING -->
	<h3 class="ale-heading">
		<slot></slot>
	</h3>
	
	<!-- CAROUSEL -->
	<gallery-lazy :offset="-60" :delay="10" class="lazyboy">
		<tippy-singleton 
			move-transition="transform 0.2s ease-out" 
			placement="top"
			:appendTo="appendTo"
			:interactive="true" 
			:interactiveDebounce="75"
			:interactiveBorder="30"
			:allowHTML="true" 
			:delay="1000" 
      @trigger="onShow" 
			@untrigger="onHide"
		>
			<splide :options="options" ref="splide">
				
				<!-- CAROUSEL "SLIDEs" -->
				<splide-slide class="ale-carousel-item" v-for="(carouselBook, index) in books" :key="index">
					<gallery-carousel-slide 
						:detailsBook="detailsBook" 
						:book="carouselBook" 
						:index="index" 
						:mobileWidth="mobileWidth" 
						:inLibrary="inLibrary"
						:inSeries="inSeries"
						:inSameSeries="inSameSeries"
						:inWishlist="inWishlist"
						:storePageURL="storePageURL"
					/>
				</splide-slide>
				
			</splide>
    </tippy-singleton>
	</gallery-lazy>
	
</div>
</template>

<script>
// import '@splidejs/vue-splide/css';
import '@splidejs/vue-splide/css/sea-green';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import makeFullUrl from '@output-mixins/gallery-makeFullUrl.js';

export default {
  name: 'carousel',
  props: [ 'detailsBook', 'books', 'width', 'mobileWidth'],
	components: {
		Splide,
    SplideSlide,
  },
	mixins: [
    makeFullUrl,
	],
	
	data: function() {
		return {
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
			coverSize: 127,
			scrolling: false,
			scrollContainer: null,
			// prepworkDone: false,
			inLibrary: null,
			inSeries: { 
				asin: null, 
				obj: null,
				ownedBooksLength: null,
			},
			inSameSeries: null,
			inWishlist: null,
			// timeStamp: null,
			storePageURL: null,
			scrollContainer: null,
			tippy: null,
      prevIndex: null,
			book: null,
		}
	},
	
	mounted: function() {
		
		const winWidth = window.innerWidth;
		const windowMobile = winWidth <= '716';
		this.options.width = windowMobile ? winWidth : this.$el.offsetWidth;
		const carouselWidth = windowMobile ? winWidth - (42*2) : this.$el.offsetWidth - (42*2);
		
		if ( winWidth <= '500' ) this.coverSize = 102;
		if ( winWidth <= '415' ) this.coverSize = 72;
		
		this.options.perPage = Math.floor(carouselWidth / this.coverSize);
		
		this.scrollContainer = document.querySelector('.list-view-inner-wrap') || window;
		this.scrollContainer.addEventListener('scroll', this.windowScrollStarted, { passive: true });
		
			
	},
	
	beforeUnmount: function() {
		
		this.scrollContainer.removeEventListener('scroll', this.windowScrollStarted, { passive: true });
			
	},
	
	methods: {
		
		appendTo() {
			return document.querySelector('#ale-bookdetails');
		},
		
		windowScrollStarted() {
			
			if ( this.$route.query.carousel )  this.$updateQueries({ carousel: null });
			
		},
		
		tippyMount( t ) {
			
			// console.log( 'after update', t );
		},
		
		// Process the heavy stuff on first hover
		onShow( t, e ) {
			
      const index = e.target.getAttribute('data-book-index');

      // Mouseenter was a bit trigger happy when interacting with tooltip
      if ( this.prevIndex === index ) return;
      this.prevIndex = index;

      // Reset
      this.repositionTooltip(t);
      this.additionalData = null;
			this.inLibrary = null;
			this.inSeries.asin = null;
			this.inSeries.obj = null;
			this.inSeries.ownedBooksLength = null;
			this.inSameSeries = null;
			this.inWishlist = null;

      // In real world the item data has a much bigger role in fetching the additional data...
      this.book = this.books[ index ];

      // Get additional item data and render in the tooltip
			
			// this.tippy = tippy;
			
			// if ( !this.prepworkDone ) {
			this.findBookFromLibrary();
			this.findBookFromSeries();
			this.findSameSeries();
			this.findInWishlist();
			// this.timeStamp = new Date().getTime();
			this.storePageURL = this.makeUrl('book', this.book.asin);
				// this.prepworkDone = true;
			// }
			
			// this.scrollContainer = document.querySelector('.list-view-inner-wrap') || window;
			// this.scrollContainer.addEventListener('scroll', this.scrollHide, { passive: true });
			
      this.$updateQueries({ carousel: true });
			
			// return !!tippy.props.content;
			
			// This somehow causes the next tooltip to disappear
			this.repositionTooltip(t);
			
		},
		
		onHide( t, e ) {
			
			// if ( !this.scrollContainer ) this.scrollContainer = document.querySelector('.list-view-inner-wrap') || window;
			// this.scrollContainer.addEventListener('scroll', this.scrollHide, { passive: true });
			t.clearDelayTimeouts();
			
		},
		
		scrollHide() {
			
			const tippy = this.tippy;
			if ( tippy && tippy.state.isVisible ) {
				tippy.hide();
				tippy.reference.blur();
			}
			
		},
		
    // Repositions tooltip after a possible height change...
    repositionTooltip( tippy ) {
			this.$nextTick(() => {
				try { tippy.popperInstance.update(); } catch (e) {}
			});
    },
		
		
		findBookFromLibrary() {
			
			const library = this.$store.state.library.books;
			const inLibrary = _.find( library, { asin: this.book.asin });
			if ( inLibrary ) this.inLibrary = true;
			
		},
		
		findBookFromSeries() {
			
			const carouselBookAsin = this.book.asin;
			const series = this.$store.state.library.series;
			const inSeries = _.find( series, function( seriesObj ) {
				const allBooksInSeries = _.get(seriesObj, 'allBooks');
				if ( allBooksInSeries ) return _.find( allBooksInSeries, { asin: carouselBookAsin });
			});
			
			if ( inSeries ) {
				this.inSeries.asin = inSeries.asin;
				this.inSeries.obj = inSeries;
				const allBooksInSeries = _.get(inSeries, 'allBooks');
				if ( allBooksInSeries ) this.inSeries.ownedBooksLength = _.filter( allBooksInSeries, function( o ) { return !o.notInLibrary; }).length;
			}
			
		},
		
		findSameSeries() {
			if ( this.inSeries.obj ) {
				
				const allBooks = _.get(this.inSeries, 'obj.allBooks');
				const inSameSeries = _.find( allBooks, { asin: this.detailsBook.asin });
				this.inSameSeries = !!inSameSeries;	
				
			}
		},
		
		findInWishlist() {
			
			const carouselBookAsin = this.book.asin;
			const wishlist = this.$store.state.library.wishlist;
			this.inWishlist = _.find( wishlist, { asin: carouselBookAsin });
			
		},
		
	},
	
}
</script>

<style lang="scss">
[data-tippy-root] .tippy-box .tippy-content a.carousel-gallery-link { text-decoration: none !important; }

.ale-carousel {
	position: relative;
	z-index: 0;
	display: block;
	border-radius: 20px;
	width: 100%;
	margin-top: 20px;
	
	> * { position: relative; z-index: 0; }
	
	&:first-child { margin-top: 0 !important; }
	
	.ale-heading {
		text-align: center;
		margin: 0;
		padding: 25px 0;
	}
	
	.ale-slider {
		width: 100%;
	}
	.tooltip {
		display: none;
	}
	
	.lazyboy { min-height: 138px; }

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
	
	&[data-scrolling="true"]:before {
		content: '';
		position: absolute;
		z-index: 1;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background: rgba(red, .4);
	}
		
	.splide {
		padding: 42px !important;
		padding-top: 0px !important;
		padding-bottom: 25px !important;
	}
	
}

@media ( max-width: 500px ) {

  .ale-carousel {
  	
		.lazyboy { min-height: 113px; }
		
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
	
}

@media ( max-width: 415px ) {

  .ale-carousel {
		
		.lazyboy { min-height: 83px; }
		
		.ale-carousel-item {
			&, .cover {
				width: 70px !important;
				height: 70px !important;
			}
		}
  } // .ale-carousel
  
}
</style>
