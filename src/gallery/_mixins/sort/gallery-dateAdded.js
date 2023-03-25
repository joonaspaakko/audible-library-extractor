export default {
  methods: {
    sortDateAdded: function(params) {
      return _.orderBy(
        params.books,
        function(o) {
          return o.added;
        },
        params.direction
      );
    }
  }
};
