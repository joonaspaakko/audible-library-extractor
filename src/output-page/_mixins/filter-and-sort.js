
export default {
	methods: {
		
		filterAndSort: function( books ) {
			
			let filteredBooks = filterBooks( books, this.$store.state.filterRules );
			
			return sortedBooks( filteredBooks, { 
				sortby: this.$store.state.sortBy, 
				sortDirection: this.$store.state.sortDirection 
			});
			
			
			function filterBooks( books, filterRules ) {
				
				if ( filterRules ) {
					return _.filter(books, function( book ) {
						var result = false;
						_.each( filterRules, function( condition, i ) {
							if ( condition( book ) ) {
								result = true;
								return false;
							}
						});
						return result;
					});
				}
				else {
					return books;
				}
				
			}
			
			function sortedBooks( books, opt ) {
			
				if ( opt.sortBy ) {
					
					const sortOptions = {
						books: books,
						direction: opt.sortDirection,
						sortKey: opt.sortBy
					};
					
					switch ( opt.sortBy ) {
						case 'randomize':
							books = _.shuffle( books );
							break;
						case 'bookNumbers':
							// sortOptions.seriesName = this.gallery.searchOptions.lists.numberSortSeriesName;
							sortOptions.missingNumber = 0;
							books = this.sortBookNumbers( sortOptions );
							break;
						case 'added':
							books = this.sortDateAdded( sortOptions );
							break;
						case 'releaseDate':
							books = this.sortReleaseDate( sortOptions );
							break;
						case 'authors':
						case 'narrators':
						case 'publishers':
							books = this.sortStringNameProp( sortOptions );
							break;
						case 'title':
							books = this.sortTitle( sortOptions );
							break;
						case 'length':
							books = this.sortLength( sortOptions );
							break;
						case 'rating':
						case 'ratings':
							books = this.sortRatings( sortOptions );
							break;
						case 'progress':
							books = this.sortProgress( sortOptions );
							break;
					}
					
				}
				
				return books;
				
			}
			
		},
		
	}
}
