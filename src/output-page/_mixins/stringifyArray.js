
export default {
	methods: {
		stringifyArray: function( array, key, delim ) {
			if ( key ) return _.map( array, key ).join( delim || ', ' );
			else return array.join(', ');
		},
	}
}
