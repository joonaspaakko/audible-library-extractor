<template>
<div>
	
	<!-- TOOLTIP -->
	<tippy :delay="520" :allowHTML="true" :interactive="true" class="carousel-cover-tippy" @show="onShow" @hide="onHide">
		
		<template v-slot:trigger>
			<!-- COVER IMAGE/LINK (to Audible store page) -->
			<component class="cover-wrapper" :is="tag" :href="tag === 'a' ? storePageURL : null" target="_blank" rel="noopener noreferrer" ref="coverLink">
				<img crossorigin="anonymous" class="cover" :data-splide-lazy="makeCoverUrl(book.cover, 150)" alt="">
			</component>
		</template>
		
		<div v-if="prepworkDone" style="font-weight: normal; text-align: left; padding: 10px; font-size: 13px; line-height: 17px">
			
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
			
			<div style="padding-top: 10px;">
				
				<!-- BOOK PART OF SAME SERIES AS THE ONE USER IS LOOKING AT -->
				<div 
				v-if="inSameSeries"
				style="background: #047844;" 
				class="carousel-gallery-link not-link" 
				v-tippy="{ maxWidth: 300 }" :content="'This carousel book is in the same series as the one you have book details open on right now: <strong>' + detailsBook.title || detailsBook.titleShort + '</strong>'"
				>
					from this series
				</div>
				
				<!-- LINK TO BOOK IN LIBRARY -->
				<router-link 
				v-if="inLibrary"
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
				v-if="inSeries.asin"
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
				v-if="inWishlist"
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
	</tippy>
		
</div>
</template>

<script>

import makeFullUrl from '@output-mixins/makeFullUrl';
import makeCoverUrl from '@output-mixins/makeCoverUrl';

export default {
  name: 'carousel-slide',
  props: [ 'detailsBook', 'book', 'index', "mobileWidth"],
  mixins: [
    makeFullUrl,
    makeCoverUrl,
	],
	
	data: function() {
		return {
			prepworkDone: false,
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
		};
	},
	
	computed: {
		tag() {
			return this.mobileWidth ? 'div' : 'a';
		},
	},
	
	methods: {
		
		// Process the heavy stuff on first hover
		onShow( tippy ) {
			
			this.tippy = tippy;
			
			if ( !this.prepworkDone ) {
				this.findBookFromLibrary();
				this.findBookFromSeries();
				this.findSameSeries();
				this.findInWishlist();
				// this.timeStamp = new Date().getTime();
				this.storePageURL = this.makeUrl('book', this.book.asin);
				this.prepworkDone = true;
			}
			
			this.scrollContainer = document.querySelector('.list-view-inner-wrap') || window;
			this.scrollContainer.addEventListener('scroll', this.scrollHide, { passive: true });
			
      this.$updateQueries({ carousel: true });
			
			return !!tippy.props.content;
			
		},
		
		onHide() {
			
			if ( !this.scrollContainer ) this.scrollContainer = document.querySelector('.list-view-inner-wrap') || window;
			this.scrollContainer.addEventListener('scroll', this.scrollHide, { passive: true });
			
		},
		
		scrollHide() {
			
			const tippy = this.tippy;
			if ( tippy && tippy.state.isVisible ) {
				tippy.hide();
				tippy.reference.blur();
			}
			
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
			if ( this.inWishlist ) console.log( this.book.asin, this.book.title )
			
		},
			
	},
	
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';

.cover-wrapper {
	display: inline-block;
}

.carousel-gallery-link {
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
</style>
