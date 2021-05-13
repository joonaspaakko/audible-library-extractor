
export default {
  methods: {
    sortByLength: function(params) {
      var vue = this;
      return _.orderBy(
        params.books, 
        function( book ) {
          
          return params.sortKey === 'narratorsNumber' && book.narrators ? book.narrators.length : 0;
          
        },
        params.direction
      );
    }
  }
};
