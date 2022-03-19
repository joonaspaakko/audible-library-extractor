
export default {
  methods: {
    sortByLength: function(params) {
      var vue = this;
      return _.orderBy(
        params.books, 
        function( book ) {
          
          if ( params.sortKey === 'narratorsNumber' ) {
            if ( book.narrators ) {
              let hasFullCast = _.find( book.narrators, function( narrator ) { return narrator.name.match('full cast') });
              if ( hasFullCast && book.narrators.length === 1 ) {
                return 99999999;
              }
              else {
                return book.narrators.length -(hasFullCast ? 1 : 0);
              }
            }
            else {
              return 0;
            }
          }
          else {
            return book[params.sortKey].length || 0;
          }
          
        },
        params.direction
      );
    }
  }
};
