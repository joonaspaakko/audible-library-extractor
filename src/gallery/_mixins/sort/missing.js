export default {
  methods: {
    sortMissing: function(params) {
      return _.orderBy(
        params.books, // actually series
        [series => series.allBooks.length - series.books.length, series => series.myRating],
        [params.direction, "desc"]
      );
    }
  }
};
