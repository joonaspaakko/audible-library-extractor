
export default {
	methods: {
		sortReleaseDate: function( params ) {
			
			return _.orderBy(params.books, function(o) {
        return o.releaseDate ? new Date( o.releaseDate.split('-') ) :  new Date( '1800', '01', '01' );
      }, params.direction);
			
		}
	}
}
