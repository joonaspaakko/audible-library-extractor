
export default {
  methods: {
    prepSeriesSubPage: function() {
      
      if (this.$route.name === "series") {
        
        // Add book number sorting + activate sort values
        this.$store.commit('addListRenderingOpts', { 
          listName: 'sort', 
          option: { active: false,  current: true, key: 'bookNumbers',     label: 'Book number',  		 type: 'sort', tippy: "If you are sorting numbers without a specific series selected the sorting may be inaccurate." },
          activate: true,
          sortValues: true,
        });
        
        const seriesASIN = this.$route.params.series;
        const series = _.find( this.$store.state.library.series, { asin: seriesASIN });
        
        // Build series sub page array 
        let books = _.filter( this.$store.state.library.books, function( book ) {
          return _.includes( series.books, book.asin );
        });
        
        // Set page title
        const seriesName = _.find( books[0].series, { asin: seriesASIN }).name;
        this.$store.commit("prop", { key: 'pageTitle', value: seriesName });
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: books });
        this.collectionSource = 'pageCollection';
        
      }
    }
  }
};
