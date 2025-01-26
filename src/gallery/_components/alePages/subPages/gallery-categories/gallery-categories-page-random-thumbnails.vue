<template>
	<div class="sample-covers" v-if="parent && parent.books">
		<div class="sample-cover" v-for="(book, index) in randomBooks" :key="book.asin">
			<router-link :to="{ 
				name: 'category', 
				params: { 
					parent: book.categories[0] ? slugify(book.categories[0].name) : null, 
					child:  book.categories[1] ? slugify(book.categories[1].name) : null 
				}, 
				query: { book: book.asin, subPageSource: subPageSource.name }
			}">
				<img crossorigin="anonymous" :src="makeCoverUrl(book.cover)" alt="" />
			</router-link>
		</div>
	</div>
</template>

<script>

import slugify from "@output-mixins/gallery-slugify.js";
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";

export default {
	mixins: [slugify, makeCoverUrl],
	props: ['parent', 'book', 'subPageSource'],
	
	data() {
		return {
			coversMax: 5
		}
	},
	
	computed: {
    randomBooks() {
      
      // Filter out books that can't be used a thumbnail
      let booksWithCategories = _.filter(this.parent.books, function( book ) { 
        return _.first(book.categories) && book.cover 
      });
      
      // Return a small number of random books to display from each parent category.
      return _.sampleSize(booksWithCategories, this.coversMax);
      
    },
	},
}
</script>

<style lang="scss" scoped>

	@import "@gallery/box-layout.scss";
	
</style>