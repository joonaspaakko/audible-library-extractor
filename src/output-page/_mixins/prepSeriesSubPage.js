import { _ } from "core-js";

export default {
  methods: {
    prepSeriesSubPage: function() {
      
      if (this.$route.name === "series") {
        
        
        const seriesASIN = this.$route.params.series;
        const series = _.find( this.$store.state.library.series, { asin: seriesASIN });
        const seriesHasBooks = series && series.books && series.books.length > 0;
        
        if ( seriesHasBooks ) {
          // Add book number sorting + activate sort values
          this.$store.commit('addListRenderingOpts', { 
            listName: 'sort', 
            option: { active: false,  current: false, key: 'seriesOrder', label: 'Series order', type: 'sort', tippy: "The infinite symbol (∞) means the book doesn't have a number" },
            activate: (this.$route.query.sort && this.$route.query.sort !== 'seriesOrder') ? false : true,
            sortValues: true,
            splice: 3,
          });
        }
        else {
          this.$store.commit("updateListRenderingOpts", {
            listName: 'sort',
            key: 'bookNumbers',
            active: false,
            sortValues: true,
          });
        }
        
        // Build series sub page array 
        let books = _.filter( this.findSubPageSource(), function( book ) {
          if ( seriesHasBooks ) {
            return _.includes( series.books, book.asin );
          }
          else {
            return _.find( book.series, { asin: seriesASIN });
          }
        });
        
        
        // Set page title
        if ( books.length > 0 ) {
          const series = _.find( books[0].series, { asin: seriesASIN });
          if ( series ) {
            this.pageTitle = series.name;
          }
          if ( !seriesHasBooks ) {
            this.pageSubTitle = "Couldn't find series order: Using number sort";
          }
        }
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: books });
        this.collectionSource = 'pageCollection';
        
      }
    }
  }
};
