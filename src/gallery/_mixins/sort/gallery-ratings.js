export default {
  methods: {
    sortRatings: function(params) {
      
      const key = params.sortKey;
      const sortArray = [];
      const directionArray = [ params.direction ];
      
      sortArray.push( function(o) {
        const value = _.get( o, key, 0 );
        return Number(value);
      });
      
      switch ( key ) {
        case 'myRating':
        case 'rating':
          sortArray.push( function(o) {
            const numberOfRatings = _.get( o, 'ratings', 0 );
            return Number(numberOfRatings);
          });
          directionArray.push( params.direction );
          break;
        case 'ratings':
          sortArray.push( function(o) {
            const rating = _.get( o, 'rating', 0 );
            return Number(rating);
          });
          directionArray.push( params.direction );
          break;
      }
      
      return _.orderBy(
        params.books,
        sortArray,
        directionArray
      );
    }
  }
};
