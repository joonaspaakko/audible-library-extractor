export default {
  methods: {
    sortMissing: function(params) {
      return _.orderBy(
        params.books, // actually series
        [series => series.allBooksMinusDupes ? series.allBooksMinusDupes.length - series.books.length : (series.allBooks ? series.allBooks.length - series.books.length : 0), series => series.myRating],
        [params.direction, "desc"]
      );
    }
  }
};
