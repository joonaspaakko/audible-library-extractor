
export default {
	methods: {
		sortDateAdded: function( params ) {
			
			// It worked out pretty well from the beginning with this, because even
      // before I had any aspirations to add any kinda sorting, I had chosen to
      // extract the book data in the order they were purchased/added. Turns out
      // that after I started working on this thing, Audible's desktop library
      // got a facelift and this new style library is missing the date of when
      // the book was added, unlike the old library. Fortunately I could still get
      // the date from the store page of the book... However, unfortunately that
      // means books that either don't have the store page anymore or books that
      // got replaced by a re-release or something are going to be missing the date
      // it was added. So that's why in here, I'm simply reversing the array on an
      // ascended sort and just passing the on the data as is on a descending sort.
      if ( params.direction === 'asc' ) {
        return _.reverse( _.clone(params.books) );
      }
			else {
				return params.books;
			}
			
		}
	}
}
