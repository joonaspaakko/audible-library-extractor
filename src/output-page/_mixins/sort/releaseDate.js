export default {
  methods: {
    sortReleaseDate: function(params) {
      return _.orderBy(
        params.books,
        function(o) {
          if ( o.releaseDate ) {
            console.log( new Date(o.releaseDate.split('-').join('/')) )
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
