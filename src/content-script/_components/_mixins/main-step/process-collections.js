
export default {
  methods: {
    getDataFromCollections: function(hotpotato, collectionsFetched) {
      if ( !_.find(hotpotato.config.steps, { name: "collections" }) ) {
        
        this.$store.commit('resetProgress');
        collectionsFetched(null, hotpotato);
        
      } else {
        
        this.$store.commit('update', [
          { key: 'bigStep.step', value: 0 },
        ]);
        
        this.$store.commit('update', [
          { key: 'bigStep.title', value: 'Collections' },
          { key: 'bigStep.step', add: 1 },
          { key: 'progress.text', value: 'Fetching collections...' },
          { key: 'progress.step', value: 0 },
          { key: 'progress.max', value: 0 },
          { key: 'progress.bar', value: true },
        ]);

        const vue = this;
        waterfall(
          [
            
            function( callback ) {
              vue.uniteBooksInCollections( hotpotato, callback )
            },
            
            vue.fetchCollectionDetails,
            
            
            // // https://www.audible.com/library/collections
            // // Find out the max items per page and max pages
            // // Returns _something_ along these lines:
            // // {
            // //   maxSize: 50,
            // //   pages: 4, 
            // // }
            // vue.getFirstLevelCollectionPages,

            // // Returns a list of all pages:
            // // https://www.audible.com/library/collections?pageSize=50&page=1
            // // https://www.audible.com/library/collections?pageSize=50&page=2
            // // https://www.audible.com/library/collections?pageSize=50&page=3
            // // https://www.audible.com/library/collections?pageSize=50&page=4
            // vue.getFirstLevelCollectionData,
            
            // // Adds maximum page size and pages to each collection
            // // Note: doesn't scrape these pages, just uses information on the first page of 
            // //       each collection to figure out how many pages they have.
            // // Returns something like:
            // // https://www.audible.com/library/collections/__FAVORITES?pageSize=50&page1
            // // https://www.audible.com/library/collections/__FAVORITES?pageSize=50&page2
            // // https://www.audible.com/library/collections/dWwhq9p4EWg4QlhbOzCK?pageSize=50&page1
            // // https://www.audible.com/library/collections/dWwhq9p4EWg4QlhbOzCK?pageSize=50&page2
            // // https://www.audible.com/library/collections/dWwhq9p4EWg4QlhbOzCK?pageSize=50&page3
            // // https://www.audible.com/library/collections/dWwhq9p4EWg4QlhbOzCK?pageSize=50&page4
            // // https://www.audible.com/library/collections/259b-ZMcADLvn-It6RE-XuB?pageSize=20&page1
            // vue.getAllCollectionBookPages,
            
          ],
          function(err, responses ) {
            
            // Pushes books back to the original array of collections without any duplicate ids
            // _.each(responses, function(collection) {
            //   const targetCollection = _.find(collections, { id: collection.id });
            //   if ( targetCollection ) {
            //     targetCollection.books = targetCollection.books.concat( collection.books );
            //     delete targetCollection.pageNumbers;
            //     delete targetCollection.pageSize;
            //     delete targetCollection.url;
            //   }
            // });

            hotpotato.collections = responses;
            vue.$store.commit('resetProgress');
            
            vue.$nextTick(function() {
              collectionsFetched(null, hotpotato);
            });
            
          }
        );
      }
    },
    
    /**
     * At this point what the extraction has is a bunch of books with an array of collection ids...
     * So this function creates a new array with the collectionIds and adds books under those collections
     * @param {object} hotpotato ...
     * @param {function} waterfallback ...
     */
    uniteBooksInCollections: function( hotpotato, waterfallback ) {
      
      const booksInCollections = _.filter( hotpotato.books, 'collectionIds' );
      const collections = [];
      const vue = this;
      
      _.each(booksInCollections ,function( book ) {
        _.each( book.collectionIds, function( collectionId ) {
          
          let collection = _.find( collections, { id: collectionId });
          
          // Create new collection object if it doesn't exist (no duplicates)
          if ( !collection ) {
            collection = {
              id: collectionId,
              url: vue.collectionsUrl + '/' + collectionId, // Removed after title and description have been fetched
              books: [],
            };
            collections.push( collection );
            vue.$store.commit('update', { key: 'progress.max', add: 1 });
          }
          
          // Add book to the collection object
          if ( collection ) collection.books.push( book.asin );
          
          
        });
      });
      
      waterfallback( null, collections );
      
    },
    
    fetchCollectionDetails: function( collections, waterfallback ) {
      
      const vue = this;
      this.amapxios({
        requests: collections,
        step: function(response, stepCallback, request) {
          
          const audible = $($.parseHTML(response.data)).find("div.adbl-main")[0];
          
          // TITLE
          let title = audible.querySelector('#center-3 > div.bc-container > div > div > span > ul > li:nth-child(1) > span.bc-text.bc-size-headline2');
          if ( title ) title = title.textContent;
          if ( title ) request.title = title;
          
          // DESCRIPTION
          let description = audible.querySelector('#center-3 > div.bc-container > div > div > span > ul > li.bc-list-item.summaryLabel.bc-spacing-s0_5 > span');
          if ( description ) description = description.textContent;
          if ( description ) request.description = description;
          
          vue.$store.commit('update', { key: 'progress.step', add: 1 });
          
          stepCallback( request );
          
        },
        flatten: true,
        done: function(collections) {
          
          _.each( collections, function( collection ) {
            if ( collection.url ) delete collection.url;
          });
          
          waterfallback(null, collections );
          
        }
      });
      
      
    },
    
    getFirstLevelCollectionData: function(requests, callback) {
      
      const vue = this; 
      
      vue.$store.commit('update', [
        { key: 'progress.text', value: 'Fetching collections...' },
        { key: 'progress.step', value: 0 },
        { key: 'progress.max', value: 0 },
        { key: 'progress.bar', value: true },
      ]);
      
      vue.amapxios({
        requests: requests,
        step: function(response, stepCallback) {
          vue.scrapeFirstLevelCollectionData(response, stepCallback);
        },
        flatten: true,
        done: function(collections) {
          callback(null, collections);
        }
      });
    },
    
    /**
     * 
     * @param {obj} response ...
     * @param {function} completeStep callback
     */
    scrapeFirstLevelCollectionData: function(response, completeStep) {
      
      const vue = this;
      const audible = $($.parseHTML(response.data)).find("div.adbl-main")[0];
      response.data = null;
      const collections = [];
      const collectionRows = audible.querySelectorAll("#adbl-lib-col-main > .adbl-library-collection-row");

      each( collectionRows, function( _thisRow ) {

        // If preview grid container is empty, ignore the collection
        const previewGridHasItems = _thisRow.querySelector(".product-image-grid-container:not(.empty-product-image-grid)");
        if ( previewGridHasItems ) {
          
          let collection = {};
          
          // ID
          const id =_thisRow.getAttribute("data-collection-id");
          collection.id = DOMPurify.sanitize( id ); // Collection page is formed using the id: audible.com/library/collections/{id}
          // TITLE
          const title = _thisRow.querySelector(".bc-size-headline3")
          if ( title ) collection.title = DOMPurify.sanitize( title.textContent );
          // DESCRIPTION
          const description = _thisRow.querySelector("ul .bc-text.bc-size-body.bc-color-secondary");
          if ( description ) collection.description = DOMPurify.sanitize( description.textContent );
          collection.books = [];
  
          collections.push(collection);
          
        }
        
        vue.$store.commit('update', { key: 'progress.max', add: 1 });
        
      });

      completeStep(collections);
      
    },
    
    getAllCollectionBookPages: function( collections, waterfallback ) {
      
      const vue = this;
      _.each(collections, function(collection) {
        collection.url = vue.collectionsUrl + "/" + collection.id + '?pageSize=50';
      });
      
      vue.amapxios({
        requests: collections,
        step: function(response, stepCallback, request) {
          
          vue.scrapingPrep({
            url: response.request.responseURL || request.url, 
            skipFirstCall: true,
            response: response,
            done: function(prep) {
              
              vue.$store.commit('update', { key: 'progress.max', add: 1 });
              
              request.pageNumbers = prep.pageNumbers;
              request.pageSize = prep.pageSize;
              request.url = prep.urlObj.toString();
              
              stepCallback(request);
              
            }
          });
          
        },
        flatten: true,
        done: function( responses, err ) {
          
          let requestUrls = [];
          
          if (!err) {       
            
            _.each( responses, function( request ) {
              _.each(request.pageNumbers, function(page) {
                const requestDolly = JSON.parse(JSON.stringify(request));
                let url = new Url( DOMPurify.sanitize(requestDolly.url) );
                url.query.page = page;
                url.query.pageSize = request.pageSize;
                requestDolly.url = url.toString();
                requestUrls.push(requestDolly);
              });
            });
            
          } else console.log(err);
          
          waterfallback(null, requestUrls, responses);
          
        }
      });
      
    },
    
    /**
     * Fetches all pages for the first level of collections
     * @param {function} callback 
     */
    getFirstLevelCollectionPages: function( callback ) {
      
      this.scrapingPrep({
        url: this.collectionsUrl, 
        done: function(prep) {
          
          const requestURLS = _.map(prep.pageNumbers, function(page) {
            prep.urlObj.query.page = page;
            return prep.urlObj.toString();
          });
          
          callback(null, requestURLS);
          
        }
      });
      
    },
    
  }
};

function getBooks(vue, request, parentStepCallback) {
  let requestUrls = [];
  _.each(request.pageNumbers, function(page) {
    let requestDolly = _.cloneDeep(request);
    
    let url = new Url( requestDolly.url );
    
    if ( request.pageSize ) url.query.pageSize = request.pageSize;
    else delete url.query.pageSize;
    
    url.query.page = page;
    
    requestDolly.url = url.toString();
    requestUrls.push(requestDolly);
  });

  vue.amapxios({
    requests: requestUrls,
    step: function(response, stepCallback, request) {
      
      const audible = $($.parseHTML(response.data)).find("div.adbl-main")[0];
      response.data = null;
      
      const bookRows = audible.querySelectorAll("#adbl-library-content-main > .adbl-library-content-row");
      $(bookRows).each(function() {
        // this.querySelector('input[name="asin"]')
        const bookASIN = this.getAttribute("id").replace("adbl-library-content-row-","");
        // const bookTitle = this.querySelector( ':scope > div.bc-row-responsive.bc-spacing-top-s2 > div.bc-col-responsive.bc-spacing-top-none.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a > span' ).textContent.trim();
        request.books.push( DOMPurify.sanitize(bookASIN) );
      });

      stepCallback(request);
      
    },
    flatten: true,
    done: function(collections) {
      vue.$store.commit('update', { key: 'progress.step', add: 1 }); // Counting collections, not books
      parentStepCallback(null, collections);
    }
  });
}
