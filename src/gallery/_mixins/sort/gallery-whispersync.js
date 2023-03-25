export default {
  methods: {
    sortWhispersync: function(params) {
      const vue = this;
      return _.orderBy(
        params.books,
        function(o) {
          const sortValue = o[params.sortKey];
          if (sortValue) {
            if ( sortValue === 'owned' ) return 2;
            else if ( sortValue === 'available' ) return 1;
          } else {
            return 0;
          }
        },
        params.direction
      );
    }
  }
};
