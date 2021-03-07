
export default {
  methods: {
    prepSeriesSubPage: function() {
      
      if (this.$route.name === "series") {
        
        // Add book number sorting + activate sort values
        this.$store.commit('addListRenderingOpts', { 
          listName: 'sort', 
          option: { active: false,  current: false, key: 'seriesOrder', label: 'Series order', type: 'sort', tippy: 'The infinite symbol (∞) means the book is in a series but does not have a number.' },
          activate: (this.$route.query.sort && this.$route.query.sort !== 'seriesOrder') ? false : true,
          sortValues: true,
        });
        
        const seriesASIN = this.$route.params.series;
        const series = _.find( this.$store.state.library.series, { asin: seriesASIN });
        
        // Build series sub page array 
        let books = _.filter( this.$store.state.library.books, function( book ) {
          return _.includes( series.books, book.asin );
        });
        
        // Set page title
        if ( books.length > 0 ) {
          const series = _.find( books[0].series, { asin: seriesASIN });
          if ( series ) {
            this.pageTitle = series.name;
          }
        }
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: books });
        this.collectionSource = 'pageCollection';
        
      }
    }
  }
};
