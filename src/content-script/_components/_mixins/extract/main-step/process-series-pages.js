
export default {
  methods: {
    getDataFromSeriesPages: function( hotpotato, seriesFetched ) {
      
      this.progress.text = 'Preparing to fetch series order...';
      this.progress.step = 0;
      this.progress.maxLength = 0;
      
      const vue = this;
      const booksInSeries = _.filter( hotpotato.books, 'series' );
      let requests = [];
      
      _.each( booksInSeries, function( book ) {
        _.each( book.series, function( series ) {
          
          requests.push({ 
            url: vue.seriesUrl + '/'+ series.asin, 
            seriesAsin: series.asin, 
            bookAsins: [], 
            seriesLength: 0,
          });
          
        });
      });
      
      requests = _.uniqBy( requests, 'seriesAsin');
      
      // vue.progress.maxLength = requests.length;
      
      asyncMap( requests, 
        function( request, stepCallback ) {
          vue.scrapingPrep(request.url, function( prep ) {
            
            if ( vue.progress.maxLength < 1 ) {
              vue.progress.text = 'Fetching books in series...'
              vue.progress.maxLength = requests.length;
              vue.progress.bar  = true;
            }
            
            request.pageNumbers = prep.pageNumbers;
            request.pageSize = prep.pageSize;
            
            getBooks( vue, request, stepCallback );
            
          });
        },
        function( err, responses ) {
          
          // Each series page is fetched as a separate request.
          // This merges the bookAsins arrays and cleans up the returning object a little
          _.each( _.flatten(responses), function( series ) {
            const targetSeries = _.find( requests, { seriesAsin: series.seriesAsin });
            if ( targetSeries ) targetSeries.bookAsins = targetSeries.bookAsins.concat( series.bookAsins );
            targetSeries.seriesLength += series.seriesLength;
            delete targetSeries.pageNumbers;
            delete targetSeries.pageSize;
            delete targetSeries.url;
          });
          
          hotpotato.series = requests;
          
          if ( !err ) seriesFetched( null, hotpotato );
          else console.log( err );
        }
      );
      
    },
    
  },
};

function getBooks( vue, request, parentStepCallback ) {
  
  
  let requestUrls = [];
  
  // FIXME: CONTINUE FROM HERE
  
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
      // response.data = null;
      
      const bookRows = audible.querySelectorAll('.adbl-impression-container > .productListItem');
      
      let series = { 
        seriesAsin: request.seriesAsin,
        bookAsins: [], 
        seriesLength: bookRows.length,
      };
      
      $(bookRows).each(function () {
        
        // this.querySelector('input[name="asin"]')
        const inLibrary = this.querySelector('.adblBuyBoxInLibraryButton');
        // const ableToPlay = this.querySelector('.adblBuyBoxMinervaPlayNow');
        if ( inLibrary ) {
          series.bookAsins.push( this.querySelector('div[data-asin]').getAttribute('data-asin') );
        }
        
      });
      
      // request.books = asinArray;
      
      stepCallback( series );
      
    },
    flatten: true,
    done: function( series ) {
      
      setTimeout( function() {
        console.log( series )
        ++vue.progress.step;
        parentStepCallback(null, series);
        
      }, 1000);
      
    }
  });
  
}
