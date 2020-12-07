
// import ajaxios from './_misc/ajaxios.js';
export default {
  // mixins: [ajaxios],
  methods: {
    getDataFromCollections: function( books, collectionsFetched ) {
      
      this.progress.text = 'Looking for collections...';
      // this.progress.bar  = true;
      // this.progress.step = -1;
      
      const vue = this;
      waterfall([
        
        function( callback ) {
          vue.scrapingPrep( vue.collectionsUrl, function( o ) {
            delete o.urlObj.query.ale;
            callback(null, o);
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
              
              console.log('%c' + 'responses' + '', 'border: 1px solid #00bb1e; color: #00bb1e; padding: 2px 5px; border-radius: 8px;', collections);
              setTimeout( function() {
                
                vue.progress.step = -1;
                vue.progress.maxLength = 0;
                vue.progress.bar = false;
                
                callback(null, collections);
                
              }, 1000);
              
            }
          });
          
        },
        
        // Adds maximum page size and pages to each collection
        function( collections, callback ) {
          
          console.log('%c' + ' collections ' + '', 'background: #01ffff; color: #000; padding: 2px 5px; border-radius: 8px;', collections);
          
          asyncMap( collections, 
            function( collection, stepCallback) {
              vue.scrapingPrep(vue.collectionsUrl + '/' + collection.id, function( prep ) {
                
                collection.pageNumbers = prep.pageNumbers;
                collection.pageSize = prep.pageSize;
                
                stepCallback(null, collection);
                
              });
            },
            function( err, collections) {
              if ( !err ) callback( null, collections, vue);
              else console.log( err );
            }
          );
          
        },
        
        getBooks,
        
      
      ], function( err, collections, collectionBooks ) {
        
        console.log('%c' + 'bliiiip' + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;', collectionBooks);
        
        // Pushes books back to the original array of collections without any duplicate ids
        _.each( collectionBooks, function( collection ) {
          const targetCollection = _.find( collections, { id: collection.id });
          console.log('%c' + 'targetcollection' + '', 'background: #7d0091; color: #fff; padding: 2px 5px; border-radius: 8px;', targetCollection);
          if ( targetCollection ) targetCollection.books = targetCollection.books.concat( collection.books );
          delete collection.pageNumbers;
          delete collection.pageSize;
        });
        
        collectionsFetched( null, { books: books, collections: collections });
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
  console.log( collectionRows ) 
  $(collectionRows).each(function () {
    
    const _thisRow = this;
    
    // FIXME: add progression to collections
    // FIXME: add waterfall just like in scrapingPrep.js
    
    // Ignores empty collections - Assumes it's empty if it doesn't have any product images
    
    if ( _thisRow.querySelector('.product-image-grid-container:not(.empty-product-image-grid)') ) {
      
      let collection = {};
      
      // const bookInMemory    = _.find(vue.library.books, ['asin', bookASIN]);
      // const fullScan_ALL_partialScan_NEW = vue.partialScan && !bookInMemory || !vue.partialScan;
      // const book            = (vue.partialScan && bookInMemory) ? bookInMemory : {};
      
      collection.id  = _thisRow.getAttribute('data-collection-id'); // Collection page is formed using the id: audible.com/library/collections/{id}
      collection.title = _thisRow.querySelector('.bc-size-headline3').textContent;
      const description = _thisRow.querySelector('ul .bc-text.bc-size-body.bc-color-secondary');
      if ( description ) collection.description = description.textContent;
      collection.books = [];
      
      collections.push( collection );
      // ++vue.progress.maxLength;
      
    }
  });
  
  console.log('%c' + '  ' + '', 'background: #7d0091; color: #fff; padding: 2px 5px; border-radius: 8px;', collections);
  completeStep( collections );
  
  
  // return scrapingPrepDrill( vue.collectionsUrl + '/' + collection.id, collections, function( collection, urlObj, pageRange ) {
  //   return getBooksFromCollections( collection, urlObj, pageRange );
  // });
  
}

function getBooks( collections, vue, callback ) {
  
  
  vue.progress.text = 'Fetching books in collections...';
  // vue.progress.bar  = true;
  vue.progress.maxLength = 0;
  
  const collectionUrls = [];
          
  _.each(collections, function( collection ) { 
    _.each( collection.pageNumbers, function( page ) {
      const pageSize = collection.pageSize ? '&pageSize='+ collection.pageSize : '';
      collectionUrls.push( { 
        id: collection.id, 
        url: vue.collectionsUrl + '/' + collection.id + '/?page=' + page + pageSize + '&sortBy=PURCHASE_DATE.dsc' // sort by date added
      });
    });
    return collection; 
  });
            
  vue.amapxios({
    requests: collectionUrls,
    step: function( response, stepCallback, request ) {
      
      const audible = $($.parseHTML(response.data)).find('div.adbl-main')[0];
      response.data = null;
      
      let asinArray = [];
      
      const bookRows = audible.querySelectorAll('#adbl-library-content-main > .adbl-library-content-row');
      $(bookRows).each(function () {
        
        // this.querySelector('input[name="asin"]')
        const bookASIN = this.getAttribute('id').replace('adbl-library-content-row-', '');
        // const bookTitle = this.querySelector( ':scope > div.bc-row-responsive.bc-spacing-top-s2 > div.bc-col-responsive.bc-spacing-top-none.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a > span' ).textContent.trim();
        asinArray.push( bookASIN );
        ++vue.progress.maxLength;
        
      });
      
      request.books = asinArray;
      stepCallback( request );
      
    },
    flatten: true,
    done: function( collectionBooks ) {
      
      setTimeout( function() {
        
        vue.progress.text = '';
        vue.progress.step = -1;
        vue.progress.maxLength = 0;
        vue.progress.bar = false;
        
        callback(null, collections, collectionBooks);
      }, 1000);
      
    }
  });
  
}