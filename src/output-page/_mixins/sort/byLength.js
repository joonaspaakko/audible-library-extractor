
export default {
  methods: {
    sortByLength: function(params) {
      var vue = this;
      return _.orderBy(
        params.books, 
        function( book ) {
          
          switch (params.sortKey) {
            case 'narratorsNumber':
              if ( book.narrators ) return book.narrators.length;
              break;
          
            default:
              break;
          }
          
        },
        params.direction
      );
    }
  }
};
