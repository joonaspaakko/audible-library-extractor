export default {
  methods: {
    sortAmount: function(params) {
      return _.orderBy(
        params.books,
        function(o) {
          if ( o.books ) return o.books.length;
        },
        params.direction
      );
    }
  }
};
