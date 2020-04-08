<template>
  <div class="ale-carousel" :class="type">
		
		<h3 class="ale-heading">{{ heading }}</h3>
			
		<carousel :perPage="5">
			<slide class="ale-carousel-item" v-for="(book, index) in books" :key="index">
				<a :href="book.url" target="_blank">
					<img width="130" height="130" class="cover" :src="bookCover(book)" alt="">
				</a>
				<div class="tooltip">
					Title: {{ book.title }} <br>
					Authors: {{ book.authors }} <br>
					Series: {{ book.seriesName }} <br>
					Length: {{ book.length }}
					Rating: {{ book.ratingOverall }}, {{ book.ratingPerformance }}, {{ book.ratingStory }} <br>
					Summary: {{ book.summary }}
					Bridged: {{ book.bridged }}
				</div>
			</slide>
		</carousel>
  </div>
</template>

<script>

import { Carousel, Slide } from 'vue-carousel';

export default {
  name: 'aleCarousel',
  props: ['books','type'],
	components: {
    Carousel,
    Slide,
	},
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
		}
	},
	methods: {
		bookCover: function( book ) {
			return book.coverUrl ? book.coverUrl.replace('._SL5_.', '.') : '';
		}
	},
  mounted: function() {
		// console.log( this.books );
		// console.log( this.type );
  },
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';
#ale-bookdetails div.ale-carousel {
	display: block;
	border-radius: 20px;
	width: 100%;
	margin-top: 20px;
	&:first-child { margin-top: 0; }
	
	.tooltip {
		display: none;
	}
	
	.ale-carousel-item {
		display: inline-block;
		.cover {
			@include themify($themes) { border: 1px solid rgba( themed(outerColor), .5); }
		}
	}
	
}

</style>
