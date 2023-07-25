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
          
          
          this.$store.commit('addListRenderingOpts', { 
            listName: 'filter', 
            option: {
              type: 'divider',
              key: 'divider-series-filters'
            },
            splice: 3,
          });
          
          const seriesFilters = this.$store.state.sticky.seriesFilters;
          
          const routeFilters = (this.$route.query.filterExtras || '').split(',');
          
          this.$store.commit('addListRenderingOpts', { 
            listName: 'filter', 
            option: {
              active: _.includes( routeFilters, 'notInLibrary') || seriesFilters.notInLibrary,
              type: 'filterExtras',
              label: 'Not In Library',
              key: 'notInLibrary',
              group: 'filterExtras',
              condition: function(book) {
                return _.get( book, 'notInLibrary');
              },
              tippy: `This filter is persistent: if you open the gallery later or when you open another series sub page, this setting will carry over.`,
            },
            splice: 3,
          });
          
          this.$store.commit('addListRenderingOpts', { 
            listName: 'filter', 
            option: {
              active: _.includes( routeFilters, 'inLibrary') || seriesFilters.inLibrary,
              type: 'filterExtras',
              label: 'In Library',
              key: 'inLibrary',
              group: 'filterExtras',
              condition: function(book) {
                return !_.get( book, 'notInLibrary');
              },
              tippy: `This filter is persistent: if you open the gallery later or when you open another series sub page, this setting will carry over.`,
            },
            splice: 3,
          });
          // this.$store.commit('addListRenderingOpts', { 
          //   listName: 'filter', 
          //   option: {
          //     active: true,
          //     type: 'filterExtras',
          //     label: 'All in series',
          //     key: 'all-in-series',
          //     group: 'filterExtras',
          //     condition: function(book) {
          //       return true;
          //     }
          //   },
          //   splice: 3,
          // });
          
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
          const seriesBooks = _.get(series, 'books');
          
          let fakeAdded_counter = 0;
          books = _.map(allBooks, ( book ) => {
            
            ++fakeAdded_counter;
            
            const inLibrary = _.includes( seriesBooks, book.asin ) || !book.notInLibrary;
            const notInLibrary =  !inLibrary;
            
            // NOT in library
            if ( notInLibrary ) {
              
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
            // IN library
            else if ( inLibrary ) {
              
              let b =  _.find( this.subPageSource.collection, { asin: book.asin });
                  b = _.cloneDeep( b );
                  
              b.added = fakeAdded_counter;
              
              return b;
            }
            
          });
          
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
          
          // This is a bit weird just because like why aren't I just fetching a property called
          // series.title or series.name or something... But the point of this is to cater for
          // multiple situations...
          let title = null;
          _.each( books, ( book ) => {
            const titleSeries = _.find( _.get(book, 'series'), ( series ) => {
              series = series || {};
              return seriesASIN === series.asin && !!series.name;
            });
            if ( titleSeries ) {
              title = titleSeries.name;
              return false;
            }
          });
          
          if ( title ) this.$store.commit('prop', { key: 'pageTitle', value: title });
          if ( !seriesHasBooks ) this.$store.commit('prop', { key: 'pageSubTitle', value: "Couldn't find series order: using number sort" });
          
        }
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: books });
        this.collectionSource = 'pageCollection';
        
      }
    }
  }
};
