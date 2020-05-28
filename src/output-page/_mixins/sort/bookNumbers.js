
export default {
	methods: {
		sortBookNumbers: function( params ) {
			
			return _.orderBy( params.books, function(o) {
				
				if ( o.bookNumbers ) {
					// const seriesObj = _.filter(o.series, ['name', seriesName ]);
					const seriesObj = _.filter(o.series, ['name', (params.seriesName ? params.seriesName : o.series[0].name) ]);
					const number = seriesObj[0].bookNumber;
					const numbers = _.isArray( number ) ? number[0] : number;
					// If the number is a string, we assume it's a number range
					// and once again use the first number from that range
					const dashSplit = typeof numbers == 'string' ? numbers.split('-') : [numbers];
					if ( dashSplit.length > 1 ) {
						return parseFloat( dashSplit[0] );
					}
					else {
						return numbers;
					}
				}
				else {
					// sorts books not in series with 0 and books in series with 9999999
					// if ( !o.series ) {
						// return 0;
					// }
					// else {
						return (params.missingNumber || 9999999);
					// }
				}
				
			}, params.direction);
			
		}
	}
}
