
export default {
  methods: {
    prepSeriesSubPage: function() {
      console.log('%c' + (this.$route.name === "series") + ' ('+ this.$route.name +')' + '', 'background: #7d0091; color: #fff; padding: 2px 5px; border-radius: 8px;');
      if (this.$route.name === "series") {
        
        console.log('%c' + 'build series collection' + '', 'background: #1ccd93; color: #fff; padding: 2px 5px; border-radius: 8px;');
        
        // FIXME: sorting doesn't work.... and when bookdetails is open on load, its position can't be calculated...
        
        // Add book number sorting + activate sort values
        this.$store.commit('addListRenderingOpts', { 
          listName: 'sort', 
          option: { active: false,  current: true, key: 'bookNumbers',     label: 'Book number',  		 type: 'sort', tippy: "If you are sorting numbers without a specific series selected the sorting may be inaccurate." },
          activate: true,
          showSortValues: true,
        });
        
        const seriesASIN = this.$route.params.series;
        const series = _.find( this.$store.state.library.series, { asin: seriesASIN });
        
        // Build series sub page array 
        let books = _.filter( this.$store.state.library.books, function( book ) {
          return _.includes( series.books, book.asin );
        });
        console.log( books )
        // Init arrays
        this.$store.commit("prop", { key: 'mutatingCollection', value: books });
        
      }
    }
  }
};
