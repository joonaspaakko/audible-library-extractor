export default {
  methods: {
    sortIsbns: function(params) {
      return _.orderBy(
        params.books,
        function(o) {
          if ( o.isbns ) {
            
            if ( params.sortKey === 'isbn10' ) {
              const isbn10 = _.find(o.isbns, ["type", "ISBN_10"]);
              if (isbn10) return ''+isbn10.identifier;
              else return null;
            }
            else if ( params.sortKey === 'isbn13' ) {
              const isbn13 = _.find(o.isbns, ["type", "ISBN_13"]);
              if (isbn13) return ''+isbn13.identifier;
              else return null;
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
