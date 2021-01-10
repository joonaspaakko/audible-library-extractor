import sortTitle from "@output-mixins/sort/title";
import sortLength from "@output-mixins/sort/length";
import sortRatings from "@output-mixins/sort/ratings";
import sortProgress from "@output-mixins/sort/progress";
import sortDateAdded from "@output-mixins/sort/dateAdded";
import sortBookNumbers from "@output-mixins/sort/bookNumbers";
import sortReleaseDate from "@output-mixins/sort/releaseDate";
import sortStringNameProp from "@output-mixins/sort/stringNameProp";

export default {
  mixins: [
    sortTitle,
    sortLength,
    sortRatings,
    sortProgress,
    sortDateAdded,
    sortBookNumbers,
    sortReleaseDate,
    sortStringNameProp
  ],
  methods: {
    filterBooks: function(books) {
      
      const filterRules = _.filter( this.$store.state.listRenderingOpts.filter, ["active", true] );

      if (filterRules) {
        return _.filter(books, function(book) {
          let result = false;
          _.each(filterRules, function(filter) {
            result = filter.condition(book);
            if (result) return false;
          });
          return result;
        });
      } else {
        return books;
      }
      
    },

    sortBooks: function(books) {
      const sortByItem = _.find( this.$store.state.listRenderingOpts.sort, "current" );
      const sortOptions = {
        books: books,
        direction: sortByItem.active ? "desc" : "asc",
        sortKey: sortByItem.key
      };

      const randomize = _.find( this.$store.state.listRenderingOpts.sortExtras, { key: "randomize" } );
      if (randomize.active) sortOptions.sortKey = randomize.key;

      switch (sortOptions.sortKey) {
        case "randomize":
          books = _.shuffle(books);
          break;
        case "bookNumbers":
          // sortOptions.seriesName = this.gallery.searchOptions.lists.numberSortSeriesName;
          sortOptions.missingNumber = 0;
          books = this.sortBookNumbers(sortOptions);
          break;
        case "added":
          books = this.sortDateAdded(sortOptions);
          break;
        case "releaseDate":
          books = this.sortReleaseDate(sortOptions);
          break;
        case "authors.name":
        case "narrators.name":
        case "publishers.name":
          books = this.sortStringNameProp(sortOptions);
          break;
        case "title":
          books = this.sortTitle(sortOptions);
          break;
        case "length":
          books = this.sortLength(sortOptions);
          break;
        case "rating":
        case "ratings":
          books = this.sortRatings(sortOptions);
          break;
        case "progress":
          books = this.sortProgress(sortOptions);
          break;
      }

      return books;
    }
  }
};
