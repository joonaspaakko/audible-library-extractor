export default {
  methods: {
    sortTitle: function(params) {
      return _.orderBy(
        params.books,
        function(o) {
          const sortValue = o[params.sortKey];
          if (sortValue) {
            if (params.sortKey === "title") {
              // Audible library sorts with the particles, so...
              
              // var titleLowercase = o.title.toLowerCase();
              // const getThe = titleLowercase.match(/^the /);
              // const getA = titleLowercase.match(/^a /);
              // const getAn = titleLowercase.match(/^an /);
              // const replacements =
              //   (getThe && /^the /) || (getA && /^a /) || (getAn && /^an /);
              // if (replacements) titleLowercase = titleLowercase.replace(replacements, "");
              // return titleLowercase.toLowerCase();
              return o.title || o.titleShort;
            } else {
              return sortValue;
            }
          } else {
            return null;
          }
        },
        params.direction
      );
    }
  }
};
