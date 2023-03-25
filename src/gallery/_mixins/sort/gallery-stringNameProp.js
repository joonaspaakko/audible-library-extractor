export default {
  methods: {
    sortStringNameProp: function(params) {
      const keyMinusName = params.sortKey.replace(".name", "");
      return _.orderBy(
        params.books,
        function(o) {
          return o[keyMinusName]
            ? o[keyMinusName][0].name.toLowerCase()
            : null;
        },
        params.direction
      );
    }
  }
};
