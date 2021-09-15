export default {
  methods: {
    sortFavorites: function(params) {
      return _.orderBy( params.books, function(o) { return o.favorite }, params.direction );
    }
  }
};
