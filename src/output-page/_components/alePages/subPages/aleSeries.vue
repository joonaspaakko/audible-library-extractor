<template>
  <div id="ale-series" class="box-layout-wrapper" v-if="$store.state.pageCollection && $store.state.pageCollection.length && listReady">
    
    <ale-search :collectionSource="collectionSource" :pageTitle="pageTitle" :pageSubTitle="pageSubTitle"></ale-search>
    
    <lazy
    v-for="(item, index) in $store.getters.collection"
    class="single-box"
    :data-asin="item.asin"
    v-if="item.asin"
    :key="'series:'+item.asin"
    >
      <router-link :to="{ name: 'series', params: { series: item.asin }, query: { subPageSource: subPageSource.name } }">

        <h2>{{ item.name }}</h2>

        <div class="books-total" v-if="item.books && item.books.length" content="Total number of books I have in this series." v-tippy="{ placement: 'right' }">
          <span :class="{ 'my-books': item.allBooks && item.allBooks.length}">{{ item.books.length }}</span><span v-if="item.allBooks && item.allBooks.length">&nbsp;of&nbsp;{{ item.allBooks.length }}</span>
        </div>

      </router-link>
    </lazy>

  </div>
</template>

<script>

import findSubPageSource from "@output-mixins/findSubPageSource.js";
import lazy from "@output-snippets/lazy.vue";
import aleSearch from "@output-comps/alePages/aleGallery/aleSearch.vue";

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
  
  methods: {

    makeCollection: function () {
      
      const vue = this;
      let seriesCollection = [];
      let addedCounter = 1;
      let librarySeries = this.$store.state.library.series;

      // Processed in reverse order so that the "added" order is based on the first book added to the library of each series.
      _.eachRight(vue.subPageSource.collection, function (book) {

        if (book.series) {

          _.each(book.series, function (series) {
            
            const seriesAdded = _.find(seriesCollection, {asin: series.asin});
            const thisSeriesFromLibrary = !!librarySeries ?_.find(librarySeries, { asin: series.asin }) : false;
            
            let myBooks, maxSeriesBookNumber, myMaxBookNumber;
            if ( vue.subPageSource.library ) {
              myBooks = thisSeriesFromLibrary.allBooks.filter(ab => thisSeriesFromLibrary.books.some(asin => asin === ab.asin));
              maxSeriesBookNumber = _.max(thisSeriesFromLibrary.allBooks.map(b => _.toNumber(b.bookNumbers)));
              myMaxBookNumber = _.max(myBooks.map(b => _.toNumber(b.bookNumbers)));
            }

            // Series not in the collection so add it with the book...
            if (!seriesAdded) {
              const newSeries = {
                name: series.name,
                asin: series.asin,
                added: addedCounter,
                books: [book.title || book.shortTitle],
              };

              // Only add if it's in the library series array as well...
              if ( vue.subPageSource.library && !!thisSeriesFromLibrary ) {
                
                ++addedCounter;
                newSeries.minRating = _.toNumber(book.myRating),
                newSeries.allBooks = thisSeriesFromLibrary.allBooks,
                newSeries.missingLatest = myMaxBookNumber !== maxSeriesBookNumber,
                seriesCollection.push(newSeries);
                
              } else if ( vue.subPageSource.wishlist ) {
                ++addedCounter;
                seriesCollection.push(newSeries);
              }
            }
            // Series already exists in the collection so just add the book...
            else {
              
              seriesAdded.books.push(book.title || book.shortTitle);
              
              if ( vue.subPageSource.library ) {
                seriesAdded.minRating = _.min(
                  [seriesAdded.minRating, book.myRating]
                    .map(_.toNumber)
                    .filter(rating => !_.isNaN(rating))
                );
                seriesAdded.allBooks = thisSeriesFromLibrary.allBooks;
                seriesAdded.missingLatest = myMaxBookNumber !== maxSeriesBookNumber;
              }

              return false;
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
          {active: true, key: 'name', tippy: 'Search narrators by name'},
          {active: true, key: 'books', tippy: 'Search narrators by book titles'},
        ],
        filter: [
          {
            excludeFromWishlist: true,
            active: false,
            type: 'filterExtras',
            label: 'Incomplete',
            key: 'series-incomplete',
            tippy: `Series where you don't have all the books`,
            condition: function (series) {
              return series.allBooks.length > series.books.length;
            }
          },
          {
            excludeFromWishlist: true,
            active: false,
            type: 'filterExtras',
            label: 'Missing latest',
            key: 'missing-latest',
            tippy: `Series where you are missing the latest book`,
            condition: function (series) {
              return series.missingLatest && series.allBooks.length > series.books.length;
            }
          },
          {
            excludeFromWishlist: true,
            active: true,
            type: 'filterExtras',
            label: 'Rating (min)',
            tippy: 'Based on the book you rated lowest in the series',
            key: 'min-rating',
            condition: function (series) {
              return (series.minRating || 0) >= this.range[0];
            },
            range: [0, 5],
            rangeMin: () => 1,
            rangeMax: () => 5,
            rangeMinDist: 0,
            rangeSuffix: ''
          },
          {
            excludeFromWishlist: true,
            active: true,
            type: 'filterExtras',
            label: 'Books in series',
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
            tippy: 'Sort by the total number of books in the series'
          },
          {
            excludeFromWishlist: true,
            active: false,
            current: false,
            key: 'missing',
            label: 'Missing',
            tippy: 'Sort by the number of books you are missing in the series',
            type: 'sort',
          },
        ],
      };
      
      if ( this.subPageSource.wishlist ) {
        list.filter = _.filter( list.filter, function( o ) { return !o.excludeFromWishlist; });
        list.sort = _.filter( list.sort, function( o ) { return !o.excludeFromWishlist; });
      }

      this.$setListRenderingOpts(list);

    }
  },
};
</script>

<style lang="scss" scoped>
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
