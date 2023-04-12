export default {
  methods: {
    prepSeriesSubPage: function() {
      
      if (this.$route.name === "series") {
        
        
        const seriesASIN = this.$route.params.series;
        const series = _.find( this.$store.state.library.series, { asin: seriesASIN });
        const seriesHasBooks = series && series.books && series.books.length > 0 && this.subPageSource.name == 'library';
        
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
        let books = [];
        if ( seriesHasBooks ) {
          
          const allBooks = _.get(series, 'allBooks');
          let fakeAdded_counter = -1;
          books = _.map(allBooks, ( book ) => {
            
            ++fakeAdded_counter;
            
            if ( book.notInLibrary ) {
              
              const notInLib_book = _.merge({
                added: fakeAdded_counter,
                series: [
                  {
                    asin: series.asin,
                    name: series.name,
                    bookNumbers: book.bookNumbers,
                  }
                ]
              }, book);
              
              if ( !notInLib_book.asin ) notInLib_book.asin = series.asin + '-' + fakeAdded_counter + '-temp-asin';
              
              return notInLib_book;
            }
            else {
              
              let b =  _.find( this.subPageSource.collection, { asin: book.asin });
                  b = _.cloneDeep( b );
                  
              b.added = fakeAdded_counter;
              
              return b;
            }
            
          });
          
          console.log( _.cloneDeep(books) );
          // let books = _.filter( this.subPageSource.collection, function( book ) {
          //   return _.includes( series.books, book.asin );
          // });
        }
        else {
          books = _.filter( this.subPageSource.collection, function( book ) {
            return _.find( book.series, { asin: seriesASIN });
          });
        }
        
        
        // Set page title
        if ( books.length > 0 ) {
          const seriesAlt = _.find( _.get(books, '0.series'), { asin: seriesASIN });
          if ( seriesAlt ) {
            this.pageTitle = seriesAlt.name;
          }
          if ( !seriesHasBooks ) {
            this.pageSubTitle = "Couldn't find series order: using number sort";
          }
        }
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: books });
        this.collectionSource = 'pageCollection';
        
      }
    }
  }
};
