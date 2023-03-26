<template>
<div>
	
	<!-- TOOLTIP -->
	<tippy 
		tag="div"
		ref="tippy"
		:data-book-index="index"
		:data-book-asin="book.asin"
		class="carousel-cover-tippy"
	>

		<!-- COVER IMAGE/LINK (to Audible store page) -->
		<component class="cover-wrapper" :is="tag" :href="tag === 'a' ? storePageURL : null" target="_blank" rel="noopener noreferrer" ref="coverLink">
			<img crossorigin="anonymous" class="cover" :data-splide-lazy="makeCoverUrl(book.cover, 150)" alt="">
		</component>
		
		<template #content>
			<div style="font-weight: normal; text-align: left; padding: 10px; font-size: 13px; line-height: 17px;">
				
				<div v-if="book.title">
					<h3 style="font-size: 1.2em; font-weight: bold; margin: 0 0 3px 0;">
						<a :href="storePageURL" target="_blank" rel="noopener noreferrer">
							{{ book.title }}
						</a>
					</h3>
				</div>
				<div v-if="book.subHeading"><h2 style="font-size: 1.1em; font-weight: normal; margin: 0 0 3px 0;">{{ book.subHeading }}</h2></div>
				<div v-if="book.authors"><strong>Authors: </strong>{{ book.authors }}</div>
				<div v-if="book.narrators"><strong>Narrators: </strong>{{ book.narrators }}</div>
				<div v-if="book.length"><strong>Length: </strong>{{ book.length }}</div>
				
				<div>
					
					<!-- BOOK PART OF SAME SERIES AS THE ONE USER IS LOOKING AT -->
					<div 
						v-if="inSameSeries"
						class="carousel-gallery-link not-link in-same-series" 
						v-tippy="{ maxWidth: 300 }" :content="'This carousel book is in the same series as the one you have book details open on right now: <strong>' + detailsBook.title || detailsBook.titleShort + '</strong>'"
					>
						from this series
					</div>
					
					<!-- LINK TO BOOK IN LIBRARY -->
					<router-link 
						v-if="inLibrary && book.asin"
						style="background: #1065d9;" 
						class="carousel-gallery-link" 
						:to="{ 
							name: 'library', 
							query: { 
								book: book.asin, 
								refresh: true,
							} 
						}"
					>
						book in library
					</router-link>
					
					<!-- LINK TO BOOK IN SERIES -->
					<router-link 
						v-if="inSeries && inSeries.asin"
						style="background: #ae2753;" 
						class="carousel-gallery-link" 
						:to="{ 
							name: 'series', 
							params: { 
								series: inSeries.asin, 
							}, 
							query: { 
								subPageSource: 'library', 
								refresh: true,
								scrolltop: true,
							} 
						}"
					>
						series in library 
						<span v-if="inSeries.ownedBooksLength">
							({{ inSeries.ownedBooksLength }}<span v-if="inSeries.obj.allBooks">/{{ inSeries.obj.allBooks.length }}</span>)
						</span>
					</router-link>
					
					<!-- LINK TO BOOK IN WISHLIST -->
					<router-link 
						v-if="inWishlist && book.asin"
						style="background: #dd7100;" 
						class="carousel-gallery-link" 
						:to="{ 
							name: 'wishlist', 
							query: { 
								book: book.asin, 
								refresh: true,
							} 
						}"
					>
						book in wishlist 
					</router-link>
					
				</div>
				
			</div>
			
			
		</template>
	</tippy>
		
</div>
</template>

<script>

import makeCoverUrl from '@output-mixins/gallery-makeCoverUrl.js';

export default {
  name: 'carousel-slide',
  props: [ 'detailsBook', 'book', 'index', "mobileWidth", "inLibrary", "inSeries", "inSameSeries", "inWishlist", "storePageURL"],
  mixins: [
    makeCoverUrl,
	],
	
	data: function() {
		return {
		};
	},
	
	computed: {
		tag() {
			return this.mobileWidth ? 'div' : 'a';
		},
	},
	
}
</script>

<style lang="scss" scoped>

.carousel-cover-tippy {
	display: inline-block;
}

.cover-wrapper {
	display: inline-block;
}

.carousel-gallery-link,
a.carousel-gallery-link {
	@include themify($themes) {
		@extend .no-selection;
		cursor: pointer;	
		&.not-link { cursor: default; }
		display: inline-block; 
		font-size: 12px; 
		background: themed(audibleOrange); 
		color: #fff !important; 
		border-radius: 5px; 
		text-decoration: none !important; 
		font-weight: bold; 
		padding: 4px 7px;
		margin: 10px 0px 0px 10px;
		&:first-child { margin-left: 0; }
	}
}

.in-same-series {
	@include themify($themes) {
		background: #047844; 
		border: 2px dotted themed(backColor);
		color: white !important;
	}
}
</style>
