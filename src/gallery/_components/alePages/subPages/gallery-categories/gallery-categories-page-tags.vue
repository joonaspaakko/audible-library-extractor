<template>
	<div 
		v-if="tagGroups.length"
		class="category-tags-wrapper" 
		:class="{ 'tags-open': showTags, 'tags-closed': !showTags }"
	>
		
		<div class="tags-toggle-btn" @click="showTags = !showTags">
			Tags ({{ tagGroups.length }}) 
			<mdi-chevron-right v-if="!showTags" />
			<mdi-chevron-down v-else />
		</div>
		
		<div class="category-tags" v-if="showTags">
			<div class="category-tag" v-for="tag in tagGroups" :key="tag.name">
				
				<router-link 
					:to="{ 
						name: 'category', 
						params: { 
							parent: parent.slug, 
						}, 
						query: { 
							subPageSource: subPageSource.name,
							filterExtras: encodeURIComponent(`tags:${tag.name}`),
							tagTitle: tag.name,
						}, 
					}"
				>
					{{ tag.name }}
				</router-link>
				
				<span v-if="tag.length" class="number-of-books">&nbsp;({{ tag.length }})</span>
				
			</div>
		</div>
		
		
	</div>
</template>

<script>
export default {
	props: ['parent','books', 'subPageSource', 'parentCategoryIndex'],
	data() {
		return {
			showTags: false,
			tagGroups: [],
		}
	},
	
	watch: {
		showTags( open ) {
			
			let currentlyOpen = this.getOpenTags();
			
			// Remove
			_.remove(currentlyOpen, tag => tag == this.parentCategoryIndex);
			// Add			
			if ( open )  {
				currentlyOpen = currentlyOpen.concat([ this.parentCategoryIndex ]);
			}
			
      this.$updateQueries({ tagsOpen: currentlyOpen.join(',') });
			
		},
	},
	
	created() {
		
		// Reopen previously open tags on page load
		let currentlyOpen = this.getOpenTags();
		this.showTags = _.includes( currentlyOpen, _.toString(this.parentCategoryIndex) );
		
		// Compile tag groups from all books → book.tags
		this.getTagGroups();
		
	},
	
	methods: {
		
		getOpenTags() {
			
			let currentlyOpen = this.$route.query.tagsOpen || '';
					currentlyOpen = currentlyOpen.split(',');
					currentlyOpen = _.compact(currentlyOpen);
					
			return currentlyOpen;
			
		},
		
		getTagGroups() {
			
			let tags = [];
			
			// Combine tags from all books (in this main category) into a single mega array with duplicate tags
			// [ { name: action }, { name: action }, { name: fiction } ]
			const taggedBooks = this.books.filter( book => _.first(book.tags) );
			taggedBooks.forEach(book => {
				tags = tags.concat( book.tags );
			});
			
			// Group the array with duplicate tags by the tag name
			// { action: [ { name: action }, { name: action } ], fiction: [ { name: fiction } ] }
			let groups = _.groupBy( tags, 'name' );
					// Mutate the group value from an array to an object with name and length/number of books with the tag.
					// { action: { name: action, length: 2 }, fiction: { name: fiction, length: 1 } }
					groups = _.map( groups, (group) => {
						return {
							name: _.get(group, '0.name'),
							length: group.length,
						};
					});
					
					// Convert back into array (for simpler rendering)
					// [ { name: action, length: 2 }, { name: fiction, length: 1 } ]
					groups = _.map( groups, (group) => {
						return {
							name: group.name,
							length: group.length,
						}
					});
					
					// Sort by name
					groups = _.sortBy( groups, 'name' );
					
			// [ { name: action, length: 2 }, { name: fiction, length: 1 } ]
			this.tagGroups = groups;
			
		}
	},
}
</script>

<style lang="scss" scoped>

	@import "@gallery/box-layout.scss";
	
	.category-tags-wrapper {
		@include themify($themes) {
			// margin-top: 15px;
			// border-top: 1px dashed rgba(themed(frontColor), .4);
			padding-top: 15px;
			margin-bottom: 0;
			position: relative;
			z-index: 0;
			gap: 10px;
			display: flex;
			flex-direction: column;
			&.tags-closed .tags-toggle-btn:before {
				cursor: pointer;
				content: '';
				z-index: 1;
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
			}
		}
	}
	
	.tags-toggle-btn {
		@include themify($themes) {
			-webkit-touch-callout: none;
			-webkit-user-select: none;
			-khtml-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			user-select: none;
			-webkit-user-drag: none;
			user-drag: none;
			cursor: pointer;
			color: rgba(themed(frontColor), .65);
			padding-left: 0;
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
			align-items: center;
		}
	}
	
	.category-tags {
		margin-bottom: 0 !important;
	}

</style>