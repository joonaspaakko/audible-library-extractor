export default {
  methods: {
    sortPurchaseDate: function( params ) {
      return _.orderBy(
        params.books,
        function( o ) {
          return o.purchaseDate ? new Date( o.purchaseDate ).getTime() : 0;
        },
        params.direction
      );
    }
  }
};
