<template>
  <div class="ale-carousel" :class="type">
		
		<h3 class="ale-heading">{{ heading }}</h3>
			
		<div class="ale-slider">
			<div class="ale-carousel-item" v-for="(book, index) in books" :key="index">
				<a :href="book.url" target="_blank">
					<img width="130" height="130" class="cover" :data-lazy="bookCover(book)" alt="">
				</a>
				<!-- <div class="tooltip">
					Title: {{ book.title }} <br>
					Authors: {{ book.authors }} <br>
					Series: {{ book.seriesName }} <br>
					Length: {{ book.length }}
					Rating: {{ book.ratingOverall }}, {{ book.ratingPerformance }}, {{ book.ratingStory }} <br>
					Summary: {{ book.summary }}
					Bridged: {{ book.bridged }}
				</div> -->
			</div>
		</div>
  </div>
</template>

<script>
import slick from 'slick-carousel';

export default {
  name: 'aleCarousel',
  props: ['gallery','books','type'],
	computed: {
		heading: function() {
			switch ( this.type ) {
				case "peopleAlsoBought":
					return 'People who bought this also bought:'
					break;
				case "moreLikeThis":
					return 'More listens like this:'
					break;
			}
		},
		sliderMountWatcher: function() {
			return this.gallery.details.sliderMount;
		}
	},
	methods: {
		bookCover: function( book ) {
			return book.coverUrl ? book.coverUrl.replace('._SL5_.', '.') : '';
		},
		makeSlider: function() {
			
			this.gallery.details.slider = $(".ale-slider").not('.slick-initialized').slick({
			  infinite: false,
				draggable: true,
				dots: true,
				slidesToShow: 5,
				slidesToScroll: 5,
  			lazyLoad: 'ondemand',
			  responsive: [
					{
			      breakpoint: 750,
			      settings: {
			        slidesToShow: 3,
						  slidesToScroll: 3
			      }
			    },
					{
			      breakpoint: 600,
			      settings: {
			        slidesToShow: 2,
						  slidesToScroll: 2
			      }
			    },
					{
			      breakpoint: 400,
			      settings: "unslick" // destroys slick
			    }
				]
			});
			
		},
		
		destroySlider: function() {
			if ( this.gallery.details.slider ) {
				this.gallery.details.slider.slick('unslick');
				this.gallery.details.slider = null;
			}
		},
	},
  watch: {
		sliderMountWatcher: function( sliderMount ) {
			console.log( 'sliderMount: ' + sliderMount );
			if ( sliderMount ) {
				
				this.gallery.details.sliderMount = null;
				this.destroySlider();
				
				this.$nextTick(() => {
					this.makeSlider();
				});
				
			}
 		
   }
	},
	beforeDestroy: function() {
		this.destroySlider();
	}
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

@import './node_modules/slick-carousel/slick/slick.scss';
@import './node_modules/slick-carousel/slick/slick-theme.scss';

#ale-bookdetails div.ale-carousel {
	display: block;
	border-radius: 20px;
	width: 100%;
	margin-top: 20px;
	&:first-child { margin-top: 0; }
	
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
		.cover {
			@include themify($themes) { border: 1px solid rgba( themed(outerColor), .5); }
		}
		
	}

}

</style>
