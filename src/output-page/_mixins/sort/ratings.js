
export default {
	methods: {
		sortRatings: function( params ) {
			
			return _.orderBy(params.books, function( o ) {
				if ( o[ params.sortKey ] ) {
					const numberInput = o[ params.sortKey ];
					return Number( numberInput );
				}
				else { return 0; }
			}, params.direction);
			
		}
	}
}
