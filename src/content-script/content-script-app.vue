<template>
  <overlay>
    
    <splashscreen v-if="ui === 'splash'" :storageHasData="storageHasData" ></splashscreen>
    <scraping-progress v-if="ui === 'scraping'"></scraping-progress>
    
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
      libraryUrl: window.location.origin + '/library/titles', 
      seriesUrl: window.location.origin + '/series', 
      collectionsUrl: window.location.origin + '/library/collections', 
      wishlistUrl:  window.location.origin + '/wl', 
      domainExtension: window.location.hostname.substring( window.location.hostname.lastIndexOf('.'), window.location.hostname.length ),
      newBooks: [],
      library: {
        books: [],
        storePageMissing: []
      },
      ui: 'splash',
    }
  },
  beforeMount: function() {
    
    const vue = this;
    
    vue.$root.$on('do-next-step', function( o ) {
      vue[ 'init_step_'+o.step ]( o.config );
    });
    
    // vue.init_storePageTest();
    
  },
  methods: {
    
    init_step_extract: function( config ) {
      
      const vue = this;
      vue.ui = 'scraping';
      vue.$nextTick(function() {
        
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
        
        waterfall( waterfallArray, function(err, hotpotato) {
          
          vue.$root.$emit('update-big-step', {
            title: 'Closing this page and opening the gallery page in a new tab',
            step: 0, 
            max: 0,
          });
          
          if ( _.find( hotpotato.config, { name: 'isbn' }) ) {
            const booksWithISBN = _.filter( hotpotato.books, 'isbn');
            vue.$root.$emit('update-progress', {
              text: 'Found ISBNs for' + booksWithISBN.length + '/' + hotpotato.books.length + ' books',
              step: 0,
              max: 0,
            });
          }
            
          setTimeout(function() {
            if ( hotpotato.config ) delete hotpotato.config;
            vue.goToOutputPage( hotpotato );
          }, 4500);
          
        });
        
      });
      
    },
    init_step_update: function() {
      
      const vue = this;
      browser.storage.local.get(null).then( data => {
        
        vue.library.books = vue.processStoredData( data ).library.books;
        
        // Update test...
        // vue.library.books.splice(0, 10);
        // vue.library.books.splice(100, 1);
        
        vue.partialScan = true;
        vue.localStorageBooksLength = vue.library.books.length;
        vue.ui = 'scraping';
        
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
    init_step_output: function() {
      
      this.goToOutputPage({ useStorageData: true });
      
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
    
    goToOutputPage: function( hotpotato ) {
      
      const vue = this;
      browser.storage.local.get(null).then( hotpotato => {
        console.log('poteeetto', hotpotato );
        
        vue.addedOrder( hotpotato.books );
        vue.makeFrenchFries( hotpotato );
        console.log('poteeetto-1', hotpotato );
        vue.glueFriesBackTogether( hotpotato );
        console.log('poteeetto-2', hotpotato );
        // FIXME: somewhere down the line I ended up adding one extra "undefined" value to each array...
      });
      
      // if ( hotpotato.useStorageData ) {
      //   browser.runtime.sendMessage({ action: 'openOutput' });
      // }
      // else {
        
        // browser.storage.local.set( hotpotato ).then(() => {
          // browser.runtime.sendMessage({ action: 'openOutput' });
        // });
        
      // }
      
    },
    
    // Since the added date is no longer available in the Audible library or store pages,
    // I'm adding a prop called "added", which obviously isn't the same as the date it was added, 
    // but can be sorted in the same fashion... given that the array is in that same order, 
    // which it should be. Old at the bottom (low number), new at the top (high number).
    addedOrder: function( books ) {
      
      let id = books.length + 1;
      _.each( books, function( book ) {
        --id;
        book.added = id;
      });
      
    },
    
    // Chunkifies for 
    makeFrenchFries: function( hotpotato ) {
      
      hotpotato['domain-extension'] = this.domainExtension;
      
      hotpotato.chunks = []; 
      
      _.each( hotpotato, function( item, key ) {
        if ( key !== 'chunks' && _.isArray( item ) ) {
          
          const chunks = _.chunk( item, 50);
          hotpotato.chunks.push( key ); 
          hotpotato[ key+'-chunk-length' ] = chunks.length; 
          _.each( chunks, function( chunk, i ) {
            hotpotato[ key+'-chunk-'+i ] = chunk;
          });
          delete hotpotato[ key ]; // The original array is not needed anymore
          
        }
      });
      
    },
    
    // It's vegan glue...
    glueFriesBackTogether: function( data ) {
      
      if ( data && _.isEmpty( data ) ) {
        return null;
      }
      else {
        
        _.each( data.chunks, function( chunkName ) {
          
          const chunksLength = data[ chunkName+'-chunk-length' ];
          const chunkNumbers = _.range(0,chunksLength+1);
          console.log('%c' + chunksLength + '', 'background: #7d0091; color: #fff; padding: 2px 5px; border-radius: 8px;', chunkNumbers);
          data[ chunkName ] = [];
          _.each( chunkNumbers, function( n ) {
            console.log('%c' + n + '', 'background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;', chunkName+'-chunk-'+n);
            data[ chunkName ] = data[ chunkName ].concat( data[ chunkName+'-chunk-'+n ] );
            delete data[ chunkName+'-chunk-'+n ];
            
          });
          delete data[ chunkName+'-chunk-length' ];
          
        });
        delete data.chunks;
        
      }
      
    },
    
  },
}
</script>
