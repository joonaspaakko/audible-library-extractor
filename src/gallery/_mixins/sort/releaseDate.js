export default {
  methods: {
    sortReleaseDate: function(params) {
      return _.orderBy(
        params.books,
        function(o) {
          if ( o.releaseDate ) {
            return new Date(o.releaseDate.split('-').join('/'));
          }
          else {
            return 0;
          }
        },
        params.direction
      );
    }
  }
};
