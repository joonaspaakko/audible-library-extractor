
export default {
	methods: {
		sortBookNumbers: function( params ) {
			
			return _.orderBy( params.books, function(o) {
				
				// let allNumbers = _.filter( o.series, 'bookNumbers')
				// allNumbers = _.map( allNumbers, 'bookNumbers')
				// allNumbers = _.flatten( allNumbers );
				// if (_.isEmpty( allNumbers ) ) allNumbers = null;
				
				let anyNumbers = _.find( o.series, 'bookNumbers');
				if ( anyNumbers ) {
					console.log( anyNumbers )
					// console.log( 'params.seriesName: ' + params.seriesName );
					// console.log( o.series );
					const seriesObj = _.find(o.series, ['name', (params.seriesName ? params.seriesName : o.series[0].name)]);
					// console.log( seriesObj );
					const number = seriesObj.bookNumbers;
					const numbers = _.isArray( number ) ? number[0] : number;
					// If the number is a string, we assume it's a number range (Some collections/omnibusses have these: books 1-3) 
					// ...and once again use the first number from that range
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
