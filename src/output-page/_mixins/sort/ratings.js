
export default {
	methods: {
		sortRatings: function( params ) {
			
			return _.orderBy(params.books, function( o ) {
				if ( o[ params.sortKey ] ) {
					var text = o[ params.sortKey ];
					if ( params.sortKey === 'ratings' ) text = text.match(/\d/g).join('');
					return Number( text );
				}
				else { return 0; }
			}, params.direction);
			
		}
	}
}
