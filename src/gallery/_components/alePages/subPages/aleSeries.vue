<template>
  <div id="ale-series"
       class="box-layout-wrapper"
       v-if="listReady"
       :style="optionsOpenMargin"
       ref="wrapper">

    <ale-search :collectionSource="collectionSource"
                :pageTitle="pageTitle"
                :pageSubTitle="pageSubTitle"></ale-search>

    <div :style="galleryStyle"
         class="page-content">
      <lazy
          v-for="(item, index) in $store.getters.collection"
          class="single-box"
          :data-asin="item.asin"
          v-if="item.asin"
          :key="'series:'+item.asin"
      >
        <router-link :to="{ name: 'series', params: { series: item.asin }, query: { subPageSource: subPageSource.name } }">

          <h2>{{ item.name }}</h2>

          <div class="books-total"
               v-if="item.books && item.books.length"
               content="Total number of books I have in this series."
               v-tippy="{ placement: 'right' }">
            <span :class="{ 'my-books': item.allBooksMinusDupes && item.allBooksMinusDupes.length}">{{
                item.books.length
              }}</span><span v-if="item.allBooksMinusDupes && item.allBooksMinusDupes.length">&nbsp;of&nbsp;{{
              item.allBooksMinusDupes.length
            }}</span>
          </div>

        </router-link>
      </lazy>
    </div>

  </div>
</template>

<script>

import aleSearch from "@output-comps/alePages/aleGallery/aleSearch.vue";
import findSubPageSource from "@output-mixins/findSubPageSource.js";
import lazy from "@output-snippets/lazy.vue";

export default {
  name: "aleSeries",
  components: {
    aleSearch,
    lazy,
  },
  mixins: [findSubPageSource],
  data: function () {
    return {
      collectionSource: 'pageCollection',
      pageTitle: 'Series',
      pageSubTitle: null,
      listReady: false,
    };
  },

  computed: {
    optionsOpenMargin: function () {

      if (this.$store.state.searchOptOpenHeight) {

        return {
          marginBottom: 0
        };

      } else {
        return false;
      }

    },
    galleryStyle: function () {

      if (this.$store.state.searchOptOpenHeight) {

        return {
          overflow: 'hidden',
          height: this.$store.state.searchOptOpenHeight - (this.$refs.wrapper.offsetTop * 2) + 'px',
        };

      } else {
        return false;
      }

    },
  },

  methods: {

    makeCollection: function () {
      const vue = this;
      const seriesCollection = [];
      const librarySeries = this.$store.state.library.series;
      let addedCounter = 1;

      // Processed in reverse order so that the "added" order is based on the first book added to the library of each series.
      _.eachRight(vue.subPageSource.collection, function (book) {
        if (book.series) {
          _.each(book.series, function (series) {
            // Find an existing entry in our series collection
            const seriesAdded = _.find(seriesCollection, {asin: series.asin});
            // Find the series in our library
            const thisSeriesFromLibrary = _.find(librarySeries ?? [], {asin: series.asin});

            // If we have an existing series in our series collection (which we're building over time), use it
            // Otherwise, create a new series to add and increment our counter
            const thisSeries = seriesAdded ?? {
              name: series.name,
              asin: series.asin,
              books: [],
              added: addedCounter++,
              authors: book.authors,
              narrators: book.narrators,
              publishers: book.publishers,
              minRating: _.toNumber(book.myRating),
            };

            // If we this series in our library, we can add some extra goodies to the series
            if (thisSeriesFromLibrary) {
              // The assumption is that in most situations you won't be buying multiple versions of a book, so duplicates are removed,
              // because multiple versions of books make it so that some series will always be considered incomplete...
              // I was thinking this could be cool in the "My books in the series list" too, but it's too unreliable for that purpose.

              // Logic - Remove duplicate books from series:
              // - Compare book numbers and remove duplicates prioritizing books in the library
              // - Needs to be an exact match: "0.3, 0.5, 1" !== "1"
              // - Any kind of bundles will be ignored, even if you have separate book copies from the bundle.
              // - Of course identical bundle numbers are considered duplicates
              // Simply put:
              // 1. Book in library: always keep
              // 2. Not in Library: remove if it exists in the library and if there are multiple books (not in library) make sure only one is kept
              thisSeriesFromLibrary.allBooksMinusDupes = vue.removeDuplicates(thisSeriesFromLibrary.allBooks);
              const myBooks = thisSeriesFromLibrary.allBooksMinusDupes.filter(ab => thisSeriesFromLibrary.books.some(asin => asin === ab.asin));
              const maxSeriesBookNumber = thisSeriesFromLibrary.allBooksMinusDupes.length;
              const myMaxBookNumber = _.max(myBooks.map(b => _.toNumber(b.bookNumbers)));

              thisSeries.allBooksMinusDupes = thisSeriesFromLibrary.allBooksMinusDupes;
              thisSeries.missingLatest = myMaxBookNumber < maxSeriesBookNumber;
              thisSeries.myMaxBookNumber = myMaxBookNumber;
              thisSeries.maxBookNumber = maxSeriesBookNumber;
              thisSeries.minRating = _.min(
                  [thisSeries.minRating, book.myRating]
                  .map(_.toNumber)
                  .filter(rating => !_.isNaN(rating))
              );
            }

            // Add the book we're processing to the series book list
            thisSeries.books.push(book.title || book.shortTitle);

            // If this is a new series, add it to the series collection
            if (!seriesAdded) {
              seriesCollection.push(thisSeries);
            }
          });
        }
      });

      _.reverse(seriesCollection);

      this.$store.commit("prop", {key: "pageCollection", value: seriesCollection});
      this.updateListRenderingOptions();
      this.listReady = true;
    },

    updateListRenderingOptions: function () {
      let vue = this;
      let list = {
        scope: [
          {active: true, key: 'name', tippy: 'Search series by name'},
          {active: true, key: 'books', tippy: 'Search series by book titles'},
          {active: true, key: 'authors.name', tippy: 'Search series by authors'},
          {active: true, key: 'narrators.name', tippy: 'Search series by narrators'},
          {active: true, key: 'publishers.name', tippy: 'Search series by publishers'},
        ],
        filter: [
          {
            active: false,
            type: 'filterExtras',
            label: 'Number of books',
            key: 'inSeries',
            range: [1, (function () {
              let series = _.get(vue.$store.state, vue.collectionSource);
              let max = _.maxBy(series, function (series) {
                if (series.books) return series.books.length;
              });
              return max ? max.books.length : 1;
            }())],
            rangeMinDist: 0,
            rangeSuffix: '',
            rangeMin: function () {
              return 1;
            },
            rangeMax: function () {
              let series = _.get(vue.$store.state, vue.collectionSource);
              let max = _.maxBy(series, function (series) {
                if (series.books) return series.books.length;
              });
              return max ? max.books.length : 1;
            },
            condition: function (series) {
              if (series.books) {
                let min = this.range[0];
                let max = this.range[1];
                return series.books.length >= min && series.books.length <= max;
              }
            }
          },
          {
            excludeFromWishlist: true,
            type: 'divider',
            key: 'divider1.0'
          },
          {
            excludeFromWishlist: true,
            active: false,
            type: 'filterExtras',
            label: 'Rating (min)',
            tippy: 'Based on the book you rated lowest in the series',
            key: 'min-rating',
            condition: function (series) {
              return (series.minRating || 0) >= this.range[0];
            },
            range: true,
            rangeMin: () => 1,
            rangeMax: () => 5,
            rangeMinDist: 0,
            rangeSuffix: '',
            tooltipFormatter: function (val) {
              switch (val) {
                case 1:
                  return val + ' (Not for me)';
                  break;
                case 2:
                  return val + ' (It’s okay)';
                  break;
                case 3:
                  return val + ' (Pretty good)';
                  break;
                case 4:
                  return val + ' (It’s great)';
                  break;
                case 5:
                  return val + ' (I love it)';
                  break;
              }
            },
          },
          {
            excludeFromWishlist: true,
            type: 'divider',
            key: 'divider1.1'
          },
          {
            excludeFromWishlist: true,
            active: false,
            type: 'filterExtras',
            label: 'Incomplete series',
            key: 'series-incomplete',
            tippy: "Series where I don't own all the books",
            condition: function (series) {
              return series.allBooksMinusDupes.length > series.books.length;
            }
          },
          {
            excludeFromWishlist: true,
            type: 'divider',
            key: 'divider1.2'
          },
          {
            excludeFromWishlist: true,
            active: false,
            type: 'filterExtras',
            label: 'Missing latest book',
            key: 'missing-latest',
            condition: (series) => series?.missingLatest,
          },
        ],
        sort: [
          {
            active: false,
            key: 'randomize',
            label: 'Randomize',
            type: 'sortExtras',
            tippy: "Ignores sorting and randomizes instead unless there's an active search."
          },
          {type: 'divider', key: 'divider1'},
          // active: true = arrow down / descending
          {
            active: true,
            current: true,
            key: 'added',
            label: 'Added',
            type: 'sort',
            tippy: '<div style="text-align: left;"><small>&#9650;</small> Old at the top <br><small style="display: inline-block; transform: rotate(180deg);">&#9650;</small> New at the top</div>'
          },
          {active: true, current: false, key: 'name', label: 'Name', type: 'sort', tippy: "Sort by series name"},
          {
            active: false,
            current: false,
            key: 'amount',
            label: 'Number of books',
            type: 'sort',
          },
          {
            excludeFromWishlist: true,
            active: false,
            current: false,
            key: 'amountTotal',
            label: 'Total number of books',
            type: 'sort',
          },
          {
            excludeFromWishlist: true,
            active: false,
            current: false,
            key: 'missing',
            label: 'Missing',
            tippy: 'Number of missing books',
            type: 'sort',
          },
        ],
      };

      if (this.subPageSource.wishlist) {
        list.filter = _.filter(list.filter, function (o) {
          return !o.excludeFromWishlist;
        });
        list.sort = _.filter(list.sort, function (o) {
          return !o.excludeFromWishlist;
        });
      }

      this.$setListRenderingOpts(list);

    },

    // Basically drops out all other versions of books you already own (tries to anyways)
    removeDuplicates: function (books) {

      let dollybooks = _.clone(books);
      // const inLibrary = _.filter( dollybooks, function( book ) { return !book.notInLibrary;  });
      // const notInLibrary = _.filter( dollybooks, function( book ) { return book.notInLibrary;  });

      var n = 0;
      _.each(dollybooks, function (book) {
        book.order = ++n;
      });

      dollybooks = _.groupBy(dollybooks, 'bookNumbers');

      _.each(dollybooks, function (chunk, i) {

        if (chunk.length === 1) {
          dollybooks[i] = [chunk[0]];
        } else {
          var inLibrary = _.filter(chunk, function (o) {
            return !o.notInLibrary
          });
          if (inLibrary.length > 0) {
            dollybooks[i] = inLibrary;
          } else {
            dollybooks[i] = [chunk[0]];
          }
        }

      });

      dollybooks = _.map(dollybooks, function (o) {
        return o;
      });
      dollybooks = _.flatten(dollybooks);
      dollybooks = _.orderBy(dollybooks, 'order', 'asc');

      return dollybooks;

    },
  },

};
</script>

<style lang="scss"
       scoped>
@import "~@/_variables.scss";
@import "~@/box-layout.scss";

.single-box {
  min-height: 35px !important;
  display: flex !important;
  align-content: center !important;
  align-items: center !important;
  padding: 0px !important;
  margin-top: 5px !important;

  > a {
    padding: 7px 14px !important;
    display: inline-block !important;
    width: 100%;
    box-sizing: border-box;
  }

  h2 {
    display: inline-block;
    width: 100%;
    margin-bottom: 0 !important;
    font-size: 1.20em !important;
    line-height: 1.30em !important;
  }

  .books-total {
    border: none !important;
    background: transparent !important;
    padding: 0 6px !important;
    width: auto !important;
    height: 23px !important;
    line-height: 23px !important;
    font-size: .9em !important;
    top: 6px !important;
    right: 4px !important;
  }
}

.theme-dark .books-total .my-books {
  color: $audibleOrange !important;
}

.theme-light .books-total .my-books {
  font-weight: bold;
}

</style>
