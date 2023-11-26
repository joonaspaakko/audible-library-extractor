
import sortName from "@output-mixins/sort/gallery-name.js";
import sortIsbns from "@output-mixins/sort/gallery-isbns.js";
import sortTitle from "@output-mixins/sort/gallery-title.js";
import sortAmount from "@output-mixins/sort/gallery-amount.js";
import sortLength from "@output-mixins/sort/gallery-length.js";
import sortRatings from "@output-mixins/sort/gallery-ratings.js";
import sortByLength from "@output-mixins/sort/gallery-byLength.js";
import sortProgress from "@output-mixins/sort/gallery-progress.js";
import sortDateAdded from "@output-mixins/sort/gallery-dateAdded.js";
import sortFavorites from "@output-mixins/sort/gallery-favorites.js";
import sortWhispersync from "@output-mixins/sort/gallery-whispersync.js";
import sortBookNumbers from "@output-mixins/sort/gallery-bookNumbers.js";
import sortReleaseDate from "@output-mixins/sort/gallery-releaseDate.js";
import sortStringNameProp from "@output-mixins/sort/gallery-stringNameProp.js";
import sortMissing from "@output-mixins/sort/gallery-missing.js";
import sortPrice from "@output-mixins/sort/gallery-price.js";

export default {
  mixins: [
    sortName,
    sortIsbns,
    sortTitle,
    sortAmount,
    sortLength,
    sortRatings,
    sortProgress,
    sortByLength,
    sortDateAdded,
    sortFavorites,
    sortWhispersync,
    sortBookNumbers,
    sortReleaseDate,
    sortStringNameProp,
    sortMissing,
    sortPrice,
  ],
  methods: {

    filterBooks: function (books) {
      const filterRules = _.filter(this.$store.state.listRenderingOpts.filter, {type: 'filter', active: true});
      const regularFilters = _.find(this.$store.state.listRenderingOpts.filter, {type: 'filter'});
      const filterExtraRules = _.filter(this.$store.state.listRenderingOpts.filter, { type: 'filterExtras', active: true });

      if (filterRules || filterExtraRules) {
        
        function conditionCheck(book) {
          let filterConditions = _.map(filterRules, function (filter) {
            return !!filter.condition(book);
          });
          let filterExtrasConditions = _.map(filterExtraRules, function (filter) {
            return !!filter.condition(book);
          });

          return (regularFilters ? _.includes(filterConditions, true) : true) && !_.includes(filterExtrasConditions, false);
        }

        return _.filter(books, conditionCheck);
      } else {
        return books;
      }
    },

    sortBooks: function (books) {
      const sortByItem = _.find(this.$store.state.listRenderingOpts.sort, function (o) {
        if (o.key === 'randomize' && o.active) return true;
        else if (o.current) return true;
      });

      if (sortByItem) {

        const sortOptions = {
          books: books,
          direction: sortByItem.active ? "desc" : "asc",
          sortKey: sortByItem.key
        };

        switch (sortOptions.sortKey) {
          case "randomize":
            books = _.shuffle(books);
            break;
          case "bookNumbers":
            // sortOptions.seriesName = this.gallery.searchOptions.lists.numberSortSeriesName;
            sortOptions.missingNumber = 0;
            books = this.sortBookNumbersOriginal(sortOptions);
            break;
          case "seriesOrder":
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
          case "categories":
          case "tags.name":
            books = this.sortStringNameProp(sortOptions);
            break;
          case "narratorsNumber":
            books = this.sortByLength(sortOptions);
            break;
          case "title":
          case "series":
          case "format":
          case "isNew":
          case "language":
          case "fromPlusCatalog":
          case "unavailable":
          case "favorite":
          case "downloaded":
          case "storePageMissing":
          case "storePageChanged":
          case "archived":
            books = this.sortTitle(sortOptions);
            break;
          case "whispersync":
            books = this.sortWhispersync(sortOptions);
            break;
          case "length":
            books = this.sortLength(sortOptions);
            break;
          case "myRating":
          case "rating":
          case "ratings":
            books = this.sortRatings(sortOptions);
            break;
          case "progress":
            books = this.sortProgress(sortOptions);
            break;
          case "favorite":
            books = this.sortFavorites(sortOptions);
            break;
          case "name":
            books = this.sortName(sortOptions);
            break;
          case "amount":
          case "amountTotal":
            books = this.sortAmount(sortOptions);
            break;
          case "isbn10":
          case "isbn13":
            books = this.sortIsbns(sortOptions);
            break;
          case "missing":
            books = this.sortMissing(sortOptions);
            break;
          case "price":
            books = this.sortPrice(sortOptions);
            break;
        }
      }
      
      // console.log('%c' + 'sorted books!' + '', 'background: #7d0091; color: #fff; padding: 2px 5px; border-radius: 8px;', _.clone(books));

      return books;
    }
  }
};
