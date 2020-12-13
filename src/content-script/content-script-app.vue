<template>
  <overlay>
    
    <splashscreen :storageHasData="storageHasData"></splashscreen>
    <scraping-progress :showProgress="showProgress"></scraping-progress>
    
  </overlay>
</template>

<script>

// Components
import overlay from './_components/layout/overlay';
import splashscreen from './_components/layout/splashscreen';
import scrapingProgress from './_components/layout/scrapingProgress';

// Calls
import amapxios from './_components/_mixins/extract/calls/amapxios.js';
import scrapingPrep from './_components/_mixins/extract/calls/scrapingPrep.js';

// Misc
import getDataFromCarousel from './_components/_mixins/extract/misc/fetch-store-page-carousel-data.js';
// Misc - Helpers
import shortenLength from './_components/_mixins/extract/misc/helpers.js';
import getSummary from './_components/_mixins/extract/misc/helpers.js';
import fixDates from './_components/_mixins/extract/misc/helpers.js';
import getSeries from './_components/_mixins/extract/misc/helpers.js';
import getArray from './_components/_mixins/extract/misc/helpers.js';

// Steps
import getDataFromLibraryPages from './_components/_mixins/extract/main-step/process-library-pages.js';
import getDataFromStorePages from './_components/_mixins/extract/main-step/process-store-pages.js';
import getISBNsFromGoogleBooks from './_components/_mixins/extract/main-step/process-isbns.js';
import getDataFromSeriesPages from './_components/_mixins/extract/main-step/process-series-pages.js';
import getDataFromCollections from './_components/_mixins/extract/main-step/process-collections.js';
import getDataFromWishlist from './_components/_mixins/extract/main-step/process-wishlist.js';

// Outside 
import timeStringToSeconds from '@output-mixins/timeStringToSeconds.js';
import secondsToTimeString from '@output-mixins/secondsToTimeString.js';

export default {
  components: {
    overlay,
    splashscreen,
    scrapingProgress,
  },
  mixins: [
    timeStringToSeconds,
    secondsToTimeString,
    amapxios,
    scrapingPrep,
    getDataFromLibraryPages,
    getDataFromStorePages,
    getISBNsFromGoogleBooks,
    getDataFromCarousel,
    getDataFromSeriesPages,
    getDataFromCollections,
    getDataFromWishlist,
    shortenLength,
    getSummary,
    fixDates,
    getSeries,
    getArray,
  ],
  props: ['storageHasData'],
  data: function() {
    return {
      partialScan: false,
      localStorageBooksLength: 'n/a',
      nextStep: null,
      libraryUrl: window.location.origin + '/library/titles', 
      seriesUrl: window.location.origin + '/series', 
      collectionsUrl: window.location.origin + '/library/collections', 
      wishlistUrl:  window.location.origin + '/wl', 
      newBooks: [],
      library: {
        domainExtension: window.location.hostname.replace('www.audible',''),
        books: [],
        storePageMissing: []
      },
      showProgress: false,
    }
  },
  beforeMount: function() {
    
    const vue = this;
    
    vue.$root.$on('nextStep', function( o ) {
      vue.nextStep = o.step;
      vue[ 'init_'+o.step ]( o.config );
    });
    
    // vue.init_storePageTest();
    
  },
  methods: {
    
    init_extract: function( config ) {
      
      const vue = this;
      this.showProgress = true;
      
      const waterfallArray = [ 
        function( callback ) { callback( null, { config: config } ); }, 
        vue.getDataFromLibraryPages, // Can be scraped alone
        vue.getDataFromStorePages,   // Requires library page data
        vue.getDataFromSeriesPages,  // Requires library page data
        vue.getDataFromCollections,  // Can be scraped alone
        vue.getISBNsFromGoogleBooks, // Requires library page data
        vue.getDataFromWishlist,     // Can be scraped alone
      ];
      
      vue.$root.$emit('update-big-step', {
        max: config ? _.filter( config, {value: true}).length : waterfallArray.length-1, // First function is just a kind of a failsafe and doesn't count
      });
      
      waterfall( waterfallArray, function(err, result) {
        
        vue.$root.$emit('update-big-step', {
          title: 'Closing this page and opening the gallery page in a new tab',
          step: 0, 
          max: 0,
        });
        
        console.log('%c' + 'books?' + '', 'background: #ff8d00; color: #fff; padding: 2px 5px; border-radius: 8px;', result);
        
      });
      
    },
    init_update: function() {
      
      const vue = this;
      browser.storage.local.get(null).then( data => {
        
        vue.library.books = vue.processStoredData( data ).library.books;
        
        // Update test...
        // vue.library.books.splice(0, 10);
        // vue.library.books.splice(100, 1);
        
        vue.partialScan = true;
        vue.localStorageBooksLength = vue.library.books.length;
        vue.showProgress = true;
        
        vue.scrapingPrep(vue.libraryUrl, function (pageNumbers, url) {
          // vue.getInitialLibraryData1(pageNumbers, url);
          vue.getDataFromLibraryPages({ pageNumbers: pageNumbers, url: url, onFinished: function() {
            
            setTimeout( function() {
              // vue.getBookData1();
            }, 1000);
            
          } });
        });
        
      });
      
    },
    init_output: function() {
      
      this.goToOutputPage( true );
      
    },
    
    // init_storePageTest: function() {
      
    //   console.log('============= STORE PAGE TEST ============= ' );
      
    //   const vue = this;
      
    //   vue.ajaxios({
    //     request: [
    //       'https://www.audible.com/pd/The-Martian-Audiobook/B082BHJMFF',
    //       'https://www.audible.com/pd/Aliens-of-Extraordinary-Ability-Audiobook/B07TXLC1NF',
    //       'https://www.audible.com/pd/The-Dire-King-Audiobook/B0751GMDXN'
    //     ],
    //     step: function (response) {

    //       var book = { test: true };
          
    //       if (response.status >= 400) {
    //         book.storePageMissing = true;
    //         vue.library.storePageMissing.push(book);
    //       }
    //       else {
    //         vue.getStorePageData(response, book );
    //       }
          
    //       return book;

    //     },
    //     done: function(responses) {

    //       const books = _.flatten( responses );
    //       console.log( books );
    //       console.log(' DONE');

    //     }
    //   });
      
    // },
    
    processStoredData: function( oldLibraryData ) {
      
      if ( _.isEmpty( oldLibraryData ) ) {
        oldLibraryData = null;
      }
      else {
        
        // Merge storage book chunks into one array
        return (function( data ) {
          const chunkKeys = [];
          const chunkLength = data[ 'books-chunk-length' ];
          for (var i = 0; i < chunkLength; i++) {
            chunkKeys.push( 'books-chunk-'+i  );
          }
          const chunks = _.pick(data, chunkKeys);
          const books = _.flatten( _.values( chunks ) );            
          return {
            library: {
              domainExtension: data[ 'domain-extension' ],
              storePageMissing: data[ 'storage-page-missing' ],
              booksChunkLength: data[ 'books-chunk-length' ],
              books: books,
            }
          };
        }( oldLibraryData ));
        
      }
      
    },
    
    goToOutputPage: function( straightFromStorage ) {

      
      const vue = this;
      
      if ( straightFromStorage ) {
        browser.runtime.sendMessage({ action: 'openOutput' });
      }
      else {
        
        // Since the added date is no longer shown in the library or store pages,
        // a property called "added" is added and also filled with what are basically index numbers 
        let booksLength = vue.library.books.length + 1;
        vue.library.books = _.map(vue.library.books, function( obj ) {
          --booksLength;
          return _.extend(obj, {
            added: booksLength
          });
        });

        const bookChunks = _.chunk( vue.library.books, 50);
        const data = (function( chunks) {
          const obj = {
            'domain-extension': vue.library.domainExtension,
            'storage-page-missing': vue.library.storePageMissing,
            'books-chunk-length': 0
          };
          chunks.forEach((chunk, i ) => {
            obj[ 'books-chunk-'+i ] = chunk;
            ++obj[ 'books-chunk-length' ];
          });
          return obj;
        }( bookChunks, vue ));
        
        // console.log( data ); 
        
        browser.storage.local.set( data ).then(() => {
          browser.runtime.sendMessage({ action: 'openOutput' });
        });
        
      }
      
      
    }
    
  },
}
</script>
