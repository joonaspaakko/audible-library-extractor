
// import ajaxios from './_misc/ajaxios.js';
export default {
  // mixins: [ajaxios],
  methods: {
    getDataFromCollections: function( hotpotato, collectionsFetched ) {
      
      this.progress.text = 'Looking for collections...';
      this.progress.step = 0;
      this.progress.maxLength = 0;
      // this.progress.bar  = true;
      // this.progress.step = -1;
      
      const vue = this;
      waterfall([
        
        function( callback ) {
          vue.scrapingPrep( vue.collectionsUrl, function( prep ) {
            callback(null, prep);
          });
        }, // returns {pageNumbers, urlObj}
        
        // I wouldn't expect the collections page (audible.com/library/collections) to have more than 
        // 1 page with the highest page size (50), but just in case this functions is ready to make multiple calls...
        function( prep, callback ) {
          
          vue.amapxios({
            requests: _.map(prep.pageNumbers, function( page ) { 
              prep.urlObj.query.page = page;
              return prep.urlObj.toString(); 
            }),
            step: function( response, stepCallback ) {
              
              setTimeout( function() {
                getInitialCollectionDataFromPage( vue, response, stepCallback );
              }, 500);
              
            },
            flatten: true,
            done: function( collections ) {
              
              // console.log('%c' + 'responses' + '', 'border: 1px solid #00bb1e; color: #00bb1e; padding: 2px 5px; border-radius: 8px;', collections);
              setTimeout( function() {
                
                // vue.progress.maxLength = 0;
                // vue.progress.bar = true;
                
                callback(null, collections);
                
              }, 1000);
              
            }
          });
          
        },
        
        // Adds maximum page size and pages to each collection
        function( collections, callback ) {
          
          asyncMap( collections, 
            function( collection, stepCallback) {
              
              vue.progress.text = 'Fetching books in collections...';
              // vue.progress.maxLength = requests.length;
              // vue.progress.bar  = true;
              
              vue.scrapingPrep(vue.collectionsUrl + '/' + collection.id, function( prep ) {
                
                collection.pageNumbers = prep.pageNumbers;
                collection.pageSize = prep.pageSize;
                collection.url = prep.urlObj.toString();
                
                getBooks( vue, collection, stepCallback );
                
              });
            },
            function( err, responses) {
              if ( !err ) callback( null, responses, collections);
              else console.log( err );
            }
          );
          
        },        
      
      ], function( err, responses, collections ) {
        
        // Pushes books back to the original array of collections without any duplicate ids
        _.each( _.flatten( responses ), function( collection ) {
          const targetCollection = _.find( collections, { id: collection.id });
          if ( targetCollection ) targetCollection.books = targetCollection.books.concat( collection.books );
          delete targetCollection.pageNumbers;
          delete targetCollection.pageSize;
          delete targetCollection.url;
        });
        
        hotpotato.collections = collections;
        
        collectionsFetched( null, hotpotato);
        
      });
      
    },
    
  },
};

function getInitialCollectionDataFromPage( vue, response, completeStep ) {
  // console.log( response.data )
  // console.log('%c' + ' ' + '', 'background: #1ccd93; color: #fff; padding: 2px 5px; border-radius: 8px;', response);
  const audible = $($.parseHTML(response.data)).find('div.adbl-main')[0];
  response.data = null;
  const collections = [];
  const collectionRows = audible.querySelectorAll('#adbl-lib-col-main > .adbl-library-collection-row');
  // console.log( collectionRows ) 
  $(collectionRows).each(function () {
    
    const _thisRow = this;
    
    // Ignores empty collections - Assumes it's empty if it doesn't have any product images
    if ( _thisRow.querySelector('.product-image-grid-container:not(.empty-product-image-grid)') ) {
      
      let collection = {};
      
      collection.id  = _thisRow.getAttribute('data-collection-id'); // Collection page is formed using the id: audible.com/library/collections/{id}
      collection.title = _thisRow.querySelector('.bc-size-headline3').textContent;
      const description = _thisRow.querySelector('ul .bc-text.bc-size-body.bc-color-secondary');
      if ( description ) collection.description = description.textContent;
      collection.books = [];
      
      collections.push( collection );
      ++vue.progress.maxLength;
      
    }
  });
  
  completeStep( collections );
  
}


function getBooks( vue, request, parentStepCallback ) {
  
  vue.progress.text = 'Fetching books in collections...';
  // vue.progress.bar  = true;
  // vue.progress.maxLength = 0;
  
  console.log('%c' + ' prep ' + '', 'background: green; color: #fff; padding: 2px 5px; border-radius: 8px;', request );
  
  let requestUrls = [];
  _.each( request.pageNumbers, function( page ) {
    const requestDolly = _.cloneDeep( request );
    const pageSize = request.pageSize ? '&pageSize='+ request.pageSize : '';
    requestDolly.url += '/?page=' + page + pageSize,
    requestUrls.push( requestDolly );
  });
  
  console.log('%c' + 'rewuestUrls' + '', 'background: #ff8d00; color: #fff; padding: 2px 5px; border-radius: 8px;', requestUrls);
        
  vue.amapxios({
    requests: requestUrls,
    step: function( response, stepCallback, request ) {
      
      const audible = $($.parseHTML(response.data)).find('div.adbl-main')[0];
      response.data = null;
      
      let asinArray = [];
      
      const bookRows = audible.querySelectorAll('#adbl-library-content-main > .adbl-library-content-row');
      $(bookRows).each(function () {
        
        // this.querySelector('input[name="asin"]')
        const bookASIN = this.getAttribute('id').replace('adbl-library-content-row-', '');
        // const bookTitle = this.querySelector( ':scope > div.bc-row-responsive.bc-spacing-top-s2 > div.bc-col-responsive.bc-spacing-top-none.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a > span' ).textContent.trim();
        request.books.push( bookASIN );
        
      });
      
      stepCallback( request );
      
    },
    flatten: true,
    done: function( collections ) {
      
      setTimeout( function() {
        
        ++vue.progress.step; // Counting collections, not books
        parentStepCallback(null, collections );
        
      }, 1000);
      
    }
  });
  
}
