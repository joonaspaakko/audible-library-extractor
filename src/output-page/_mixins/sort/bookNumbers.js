
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
					
					const seriesObj = _.find(o.series, ['name', (params.seriesName ? params.seriesName : o.series[0].name)]);
					const number = seriesObj.bookNumbers;
					const numbers = _.isArray( number ) ? number[0] : number;
					// If the number is a string, we assume it's a number range (Some collections/omnibusses have these: books 1-3) 
					// ...and once again use the first number from that range
					const dashSplit = typeof numbers == 'string' ? numbers.split('-') : [numbers];
					console.log('%c' + 'numbers' + '('+ o.titleShort +')', 'border: 1px solid red; color: white; padding: 2px 5px; border-radius: 8px;', parseFloat( dashSplit[0] ));
					return parseFloat( dashSplit[0] );
					
				}
				else {
					return (params.missingNumber >= 0 ? params.missingNumber : 9999999);
				}
				
			}, params.direction);
			
		}
	}
}
