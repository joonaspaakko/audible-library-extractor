
import ajaxios from './_misc/ajaxios.js';
export default {
  mixins: [ajaxios],
  methods: {
    getDataFromCollections: function( config, done ) {
      
      this.progress.text = 'Looking for collections...';
      this.progress.bar  = true;
      this.progress.step = 0;
      
      const vue = this;
      const requestURL = config.urlObj.toString();
      vue.ajaxios({
        request: _.map(config.pageNumbers, function( page ) { return requestURL + '&page=' + page }),
        step: function( response ) {
          
          return processCollectionsPage( vue, response );
          
        },
        flatten: true,
        done: function( collections ) {
          
          console.log('%c' + 'responses' + '', 'border: 1px solid #00bb1e; color: #00bb1e; padding: 2px 5px; border-radius: 8px;', books);
          setTimeout( function() {
            done(null, collections);
          }, 1000);
          
        }
      });
      
    },
    
  },
};

function processCollectionsPage( vue, response ) {
  
  const audible = $($.parseHTML(response.data)).find('div.adbl-main')[0];
  response.data = null;
  const collections = [];
  const collectionRow = audible.querySelectorAll('#adbl-lib-col-main > .adbl-library-collection-row');
  
  $(collectionRow).each(function () {
    
    const _thisRow = this;
    
    // Ignores empty collections - Assumes it's empty if it doesn't have any product images
    if ( _thisRow.querySelectorAll('.product-image-grid-container:not(.empty-product-image-grid)') ) {
      
      let collection = {};
      
      // const bookInMemory    = _.find(vue.library.books, ['asin', bookASIN]);
      // const fullScan_ALL_partialScan_NEW = vue.partialScan && !bookInMemory || !vue.partialScan;
      // const book            = (vue.partialScan && bookInMemory) ? bookInMemory : {};
      
      collection.id  = _thisRow.getAttribute('data-collection-id'); // Collection page is formed using the id: audible.com/library/collections/{id}
      collection.title = _thisRow.querySelector('.bc-size-headline3').textContent;
      const description = _thisRow.querySelector('ul .bc-text.bc-size-body.bc-color-secondary');
      if ( description ) collection.description = description.textContent;
      
      collections.push( collection );
      
    }
  });
  
  console.log('%c' + '  ' + '', 'background: #7d0091; color: #fff; padding: 2px 5px; border-radius: 8px;', collections);
  return collections;
  
}
