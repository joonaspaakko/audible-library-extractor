
export default {
  methods: {
    getDataFromCollections: function(hotpotato, collectionsFetched) {
      if ( !_.find(hotpotato.config.steps, { name: "collections" }) ) {
        
        this.$root.$emit("reset-progress");
        collectionsFetched(null, hotpotato);
        
      } else {
        this.$root.$emit("update-big-step", {
          title: "Collections",
          stepAdd: 1
        });

        const vue = this;
        waterfall(
          [
            function(callback) {
              vue.scrapingPrep(vue.collectionsUrl, function(prep) {
                callback(null, prep);
              });
            }, // returns {pageNumbers, urlObj}

            // I wouldn't expect the collections page (audible.com/library/collections) to have more than
            // 1 page with the highest page size (50), but just in case this functions is ready to make multiple calls...
            function(prep, callback) {
              vue.$root.$emit("update-progress", {
                text: "Fetching collections...",
                step: 0,
                max: 0,
                bar: true
              });
              
              vue.amapxios({
                requests: _.map(prep.pageNumbers, function(page) {
                  prep.urlObj.query.page = page;
                  return prep.urlObj.toString();
                }),
                step: function(response, stepCallback) {
                  getInitialCollectionDataFromPage(vue, response, stepCallback);
                },
                flatten: true,
                done: function(collections) {
                  callback(null, collections);
                }
              });
            },

            // Adds maximum page size and pages to each collection
            function(collections, callback) {
              asyncMap(
                collections,
                function(collection, stepCallback) {
                  vue.scrapingPrep(
                    vue.collectionsUrl + "/" + collection.id,
                    function(prep) {
                      collection.pageNumbers = prep.pageNumbers;
                      collection.pageSize = prep.pageSize;
                      collection.url = prep.urlObj.toString();
                      getBooks(vue, collection, stepCallback);
                    }
                  );
                },
                function(err, responses) {
                  if (!err) {
                    callback(null, _.flatten(responses), collections);
                  } else console.log(err);
                }
              );
            }
          ],
          function(err, responses, collections) {
            
            // Pushes books back to the original array of collections without any duplicate ids
            _.each(responses, function(collection) {
              const targetCollection = _.find(collections, { id: collection.id });
              if ( targetCollection ) targetCollection.books = targetCollection.books.concat( collection.books );
              delete targetCollection.pageNumbers;
              delete targetCollection.pageSize;
              delete targetCollection.url;
            });
            
            hotpotato.collections = collections;

            vue.$nextTick(function() {
              vue.$root.$emit("reset-progress");
              collectionsFetched(null, hotpotato);
            });
          }
        );
      }
    }
  }
};

function getInitialCollectionDataFromPage(vue, response, completeStep) {
  const audible = $($.parseHTML(response.data)).find("div.adbl-main")[0];
  response.data = null;
  const collections = [];
  const collectionRows = audible.querySelectorAll("#adbl-lib-col-main > .adbl-library-collection-row");

  $(collectionRows).each(function() {
    const _thisRow = this;

    // Ignores empty collections - Assumes it's empty if it doesn't have any product images
    if ( _thisRow.querySelector(".product-image-grid-container:not(.empty-product-image-grid)") ) {
      let collection = {};

      collection.id = DOMPurify.sanitize( _thisRow.getAttribute("data-collection-id") ); // Collection page is formed using the id: audible.com/library/collections/{id}
      collection.title = DOMPurify.sanitize( _thisRow.querySelector(".bc-size-headline3").textContent );
      const description = _thisRow.querySelector("ul .bc-text.bc-size-body.bc-color-secondary");
      if (description) collection.description = DOMPurify.sanitize( description.textContent );
      collection.books = [];

      collections.push(collection);
      vue.$root.$emit("update-progress-max");
    }
  });

  completeStep(collections);
}

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
      vue.$root.$emit("update-progress-step"); // Counting collections, not books
      parentStepCallback(null, collections);
    }
  });
}
