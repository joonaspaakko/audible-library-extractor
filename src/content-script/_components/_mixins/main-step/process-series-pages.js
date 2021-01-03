
export default {
  methods: {
    getDataFromSeriesPages: function( hotpotato, seriesFetched ) {
      
      this.$root.$emit('update-big-step', {
        title: 'Series Order',
        stepAdd: 1,
      });
      
      const vue = this;
      
      // For now it's always a full scan
      // let booksInSeries = hotpotato.config.partialScan ? _.filter(hotpotato.books, 'isNew') : hotpotato.books;
      let booksInSeries = hotpotato.books;
      
      if ( booksInSeries.length > 0 ) {
        
        booksInSeries = _.filter( booksInSeries, 'series' );
        let requests = [];
        
        _.each( booksInSeries, function( book ) {
          _.each( book.series, function( series ) {
            
            requests.push({ 
              url: vue.seriesUrl + '/'+ series.asin, 
              asin: series.asin, 
              books: [], 
              length: 0,
            });
            
          });
        });
        
        requests = _.uniqBy( requests, 'asin');
        
        this.$root.$emit('update-progress', {
          text: 'Preparing books in series...',
          step: 0,
          max: 0,
          bar: true,
        });
        
        asyncMap( requests, 
          function( request, stepCallback ) {
            vue.scrapingPrep(request.url, function( prep ) {
              
              vue.$root.$emit('update-progress', { max: requests.length });
              
              request.pageNumbers = prep.pageNumbers;
              request.pageSize = prep.pageSize;
              
              getBooks( vue, request, stepCallback );
              
            });
          },
          function( err, responses ) {
            
            // Each series page is fetched as a separate request.
            // This merges the books arrays and cleans up the returning object a little
            _.each( _.flatten(responses), function( series ) {
              const targetSeries = _.find( requests, { asin: series.asin });
              if ( targetSeries ) targetSeries.books = targetSeries.books.concat( series.books );
              targetSeries.length += series.length;
              delete targetSeries.pageNumbers;
              delete targetSeries.pageSize;
              delete targetSeries.url;
            });
            
            hotpotato.series = requests;
            
            if ( !err ) { 
              
              vue.$nextTick(function() {
                setTimeout(function() {
                    
                  vue.$root.$emit('reset-progress');
                  seriesFetched( null, hotpotato );
                  
                }, 1000);
              });
              
            }
            else console.log( err );
          }
        );
        
      }
      else {
        vue.$nextTick(function() {
          setTimeout(function() {
              
            vue.$root.$emit('reset-progress');
            seriesFetched( null, hotpotato );
            
          }, 1000);
        });
      }
      
    },
    
  },
};

function getBooks( vue, request, parentStepCallback ) {
  
  let requestUrls = [];
  
  _.each( request.pageNumbers, function( page ) {
    const requestDolly = _.cloneDeep( request );
    const pageSize = request.pageSize ? '&pageSize='+ request.pageSize : '';
    requestDolly.url += '/?page=' + page + pageSize,
    requestUrls.push( requestDolly );
  });
  
  vue.amapxios({
    requests: requestUrls,
    step: function( response, stepCallback, request ) {
      
      const audible = $($.parseHTML(response.data)).find('div.adbl-main')[0];
      response.data = null;
      
      const bookRows = audible.querySelectorAll('.adbl-impression-container > .productListItem');
      
      let series = { 
        asin: request.asin,
        books: [], 
        length: bookRows.length,
      };
      
      $(bookRows).each(function () {
        
        // this.querySelector('input[name="asin"]')
        const inLibrary = this.querySelector('.adblBuyBoxInLibraryButton');
        // const ableToPlay = this.querySelector('.adblBuyBoxMinervaPlayNow');
        if ( inLibrary ) {
          series.books.push( this.querySelector('div[data-asin]').getAttribute('data-asin') );
        }
        
      });
      
      // request.books = asinArray;
      
      vue.$root.$emit('update-progress', {
        text: 'Fetching series order from books in series...',
      });
      
      stepCallback( series );
      
    },
    flatten: true,
    done: function( series ) {
      
      vue.$root.$emit('update-progress-step'); // Counting series, not books
      parentStepCallback(null, series);
      
    }
  });
  
}
