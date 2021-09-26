export default {
  methods: {
    sortAmount: function(params) {
      return _.orderBy(
        params.books,
        function(o) {
          // console.log( params.sortKey )
          if ( params.sortKey === 'amountTotal' ) {
            if ( o.allBooksMinusDupes ) return o.allBooksMinusDupes.length;
            else if ( o.allBooks ) return o.allBooks.length;
          }
          else {
            if ( o.books ) return o.books.length
          }
        },
        params.direction
      );
    },
  }
};
