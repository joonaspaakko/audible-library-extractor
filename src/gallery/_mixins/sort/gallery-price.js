export default {
  methods: {
    
    sortPrice: function(params) {
      
      // const seriesAsin = this.$route.params.series;
      // const seriesObj = _.find( this.$store.state.library.series, { asin: seriesAsin });
      return _.orderBy(
        params.books, 
        function( book ) {
          
          return book.price;
          
        },
        params.direction
      );
    },
  }
};
