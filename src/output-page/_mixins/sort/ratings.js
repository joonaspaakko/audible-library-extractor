export default {
  methods: {
    sortRatings: function(params) {
      return _.orderBy(
        params.books,
        function(o) {
          console.log( params.sortKey )
          if (o[params.sortKey]) {
            const numberInput = o[params.sortKey];
            return Number(numberInput);
          } else {
            return 0;
          }
        },
        params.direction
      );
    }
  }
};
