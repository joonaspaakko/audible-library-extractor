export default {
  methods: {
    sortName: function(params) {
      return _.orderBy(
        params.books,
        function(o) {
          if ( o.name ) return o.name;
        },
        params.direction
      );
    }
  }
};
