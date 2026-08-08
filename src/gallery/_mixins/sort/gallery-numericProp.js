export default {
  methods: {
    sortNumericProp: function(params) {
      return _.orderBy(
        params.books,
        function(o) { return o[ params.sortKey ] || 0; },
        params.direction
      );
    }
  }
};
