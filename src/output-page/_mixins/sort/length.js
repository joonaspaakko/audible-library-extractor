
export default {
	methods: {
		sortLength: function( params ) {
			
			return _.orderBy(params.books, function( o ) {
				if ( o.length ) {
					
					return timeStringToSeconds( o.length );
					
					function timeStringToSeconds( string ) {
						const hasMinutes = string.match('min'); //sometimes 'min', sometimes 'mins'
						var numbers = string.match(/\d+/g);
						// If the array numbers.length is 2, then we the array must contain hours and minutes
						if ( numbers.length === 2 ) {
							numbers = (+numbers[0]) * 60 * 60 + (+numbers[1]) * 60;
						}
						// If the array numbers.length is below 2...
						// ...and the original string doesn't contain the word 'min',
						// then we'll assume the unit is hours...
						else if ( !hasMinutes ) {
							numbers = (+numbers[0]) * 60 * 60;
						}
						// If the array numbers is below 2...
						// ...and the original string contains the word 'min',
						// then we'll assume the unit is minutes...
						else {
							numbers = (+numbers[0]) * 60;
						}
						return numbers;
					}
					
				}
				else { return 0; }
			}, params.direction);
			
		}
	}
}
