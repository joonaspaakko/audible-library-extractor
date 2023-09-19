<template>
  <cont-overlay>
    <cont-menu-screen v-if="ui === 'menu-screen'" :domainExtension="domainExtension" :wishlistUrl="wishlistUrl" />
    <cont-scraping-progress v-else-if="ui === 'scraping'" :domainExtension="domainExtension" />
  </cont-overlay>
</template>

<script>

// Calls
import amapxios from "./_components/_mixins/calls/amapxios.js";
import scrapingPrep from "./_components/_mixins/calls/scrapingPrep.js";

// Misc
import getDataFromCarousel from "./_components/_mixins/misc/fetch-store-page-carousel-data.js";
// Misc - Helpers
import helpers from "./_components/_mixins/misc/content-script-helpers.js";

// Steps
import getDataFromLibraryPages from "./_components/_mixins/main-step/process-library-pages.js";
// import getDataFromLibraryPagesFin from "./_components/_mixins/main-step/process-library-pages-fin.js";
import getDataFromStorePages from "./_components/_mixins/main-step/process-store-pages.js";
import getISBNsFromGoogleBooks from "./_components/_mixins/main-step/process-isbns.js";
import getDataFromSeriesPages from "./_components/_mixins/main-step/process-series-pages.js";
import getDataFromCollections from "./_components/_mixins/main-step/process-collections.js";
import getDataFromWishlist from "./_components/_mixins/main-step/process-wishlist.js";
import getDataFromPurchaseHistory from "./_components/_mixins/main-step/process-purchase-history.js";

// Outside
import timeStringToSeconds from "@output-mixins/gallery-timeStringToSeconds.js";
import secondsToTimeString from "@output-mixins/gallery-secondsToTimeString.js";

// import eruda from "eruda";
// import erudaMemory from "eruda-memory";
// import erudaDom from "eruda-dom";

export default {
  mixins: [
    timeStringToSeconds,
    secondsToTimeString,
    amapxios,
    scrapingPrep,
    getDataFromLibraryPages,
    // getDataFromLibraryPagesFin,
    getDataFromStorePages,
    getISBNsFromGoogleBooks,
    getDataFromCarousel,
    getDataFromSeriesPages,
    getDataFromCollections,
    getDataFromWishlist,
    getDataFromPurchaseHistory,
    helpers,
  ],
  data: function() {
    return {
      store: this.$store.state,
      libraryUrl: window.location.origin + "/library/titles",
      libraryUrlFin: window.location.origin + "/library/titles?isFinished=true",
      seriesUrl: window.location.origin + "/series",
      collectionsUrl: window.location.origin + "/library/collections",
      wishlistUrl: window.location.origin + "/library/wishlist",
      podcastsUrl: window.location.origin + "/library/podcasts",
      purchaseHistoryUrl: window.location.origin + "/account/purchase-history", // tf=orders&df=2021
      domainExtension: window.location.hostname.replace('www.audible', ''),
      newBooks: [],
      library: {
        books: [],
        storePageMissing: []
      },
      ui: "menu-screen",
      doStorePageTest: [
        // { storePageRequestUrl: "https://www.audible.com/pd/B08N8452GZ" },
      ],
      doSeriesTest: [
        // { series: [{asin: 'B006XE41AC'}] },
      ],
    };
  },
  
  beforeMount: function() {
    
    const vue = this;
    
    this.$compEmitter.on("start-extraction", (o) => {
      this["init_step_" + o.step](o.config);
    });
    
    // vue.init_purchaseHistoryTest();
    if ( _.get( this.doStorePageTest, 'length', 0 ) > 0 ) this.init_storePageTest();
    if ( _.get( this.doSeriesTest,    'length', 0 ) > 0 ) this.init_seriesPageTest();
    
    // this.scrapingPrep(this.libraryUrl, function(prep) {
    //   console.log('PREP?', prep)
    // });
    
  },
  
  // mounted: function() {
  //   this.$nextTick(function() {
  //     // this.startConsole();
  //   });
  // },
  
  methods: {
    init_step_extract: function( config ) {
      
      const vue = this;
      chrome.storage.local.get(null).then(hotpotato => {
        
        if ( hotpotato.chunks && hotpotato.chunks.length ) vue.glueFriesBackTogether(hotpotato);
        
        vue.ui = "scraping";
        vue.$nextTick(function() {
          
          hotpotato = hotpotato || {};
          if ( hotpotato.books ) config.oldBooksLength = hotpotato.books.length;
          hotpotato.config = config;
          
          const waterfallArray = [
            function(callback) { callback(null, hotpotato); },
            vue.getDataFromLibraryPages,    // Can be scraped alone
            // vue.getDataFromLibraryPagesFin, // Requires library page data
            vue.getDataFromStorePages,      // Requires library page data
            vue.getDataFromSeriesPages,     // Requires store page data (for fallback)
            function(hotpotato, callback) { 
              
              if ( !_.find(hotpotato.config.steps, { name: "books" }) ) {
                callback(null, hotpotato); 
                return;
              }
              
              vue.saveExtractionSoFar( hotpotato, ( hotpotato ) => {
                callback(null, hotpotato); 
              });
              
            },
            vue.getDataFromCollections,     // Can be scraped alone (but requires library data in the gallery...)
            function(hotpotato, callback) { 
              
              vue.saveExtractionSoFar( hotpotato, ( hotpotato ) => {
                
                // Not extracting wishlist, skipping the check below...
                if ( !_.find(hotpotato.config.steps, { name: "wishlist" }) ) {
                  vue.$store.commit("resetProgress");
                  callback(null, hotpotato);
                  return; 
                }
                
                vue.$store.commit('update', { key: 'checkingWishlistAccess', value: true });
                vue.$store.commit('update', { key: 'noWishlistAccess', value: false });
                
                vue.checkAccess({
                  to: vue.wishlistUrl,
                  success: function( e ) {
                    callback(null, hotpotato);
                  },
                  failed: function( e ) {
                    
                    vue.$store.commit('update', { key: 'noWishlistAccess', value: true });
                    
                  },
                  finally: function() {
                    vue.$store.commit('update', {  key: 'checkingWishlistAccess', value: false });
                  },
                });
                
              });    
            },
            vue.getDataFromWishlist,        // Can be scraped alone
            vue.getDataFromStorePages,      // Requires wishlist data
            function(hotpotato, callback) { 
              
              // Not extracting wishlist, skipping save...
              if ( !_.find(hotpotato.config.steps, { name: "wishlist" }) ) {
                vue.$store.commit("resetProgress");
                callback(null, hotpotato);
                return; 
              }
              
              vue.saveExtractionSoFar( hotpotato, ( hotpotato ) => {
                callback(null, hotpotato); 
              });    
            },
            // vue.getDataFromWishlist,        // Can be scraped alone
            // vue.getDataFromStorePages,      // Requires wishlist data
            vue.getISBNsFromGoogleBooks,    // Requires library page data
          ];
          
          const maxSteps = config.steps ? _.filter(config.steps, function(o) { return o.value; }).length : waterfallArray.length - 1 // First function is just a kind of a failsafe and doesn't count
          vue.$store.commit('update', { key: 'bigStep.max', value: maxSteps });
          
          waterfall(waterfallArray, function(err, hotpotato) {
            
            vue.$store.commit('resetProgress');
            vue.$store.commit('update', [
              { key: 'bigStep.title', value: 'Opening the gallery after packing up the data...' },
              { key: 'bigStep.step', value: 0 },
              { key: 'bigStep.max', value: 0 },
              { key: 'subStep.step', value: 0 },
              { key: 'subStep.max', value: 0 },
            ]);
            
            // const configISBN = _.find(hotpotato.config.steps, { name: "isbn" });
            // const foundISBNs = _.filter(hotpotato.books, 'isbns');
            // if (configISBN && configISBN.value ||foundISBNs.length > 0 ) {
            //   vue.$root.$emit("update-progress", {
            //     text: "Currently " + foundISBNs.length + "/" + hotpotato.books.length + " books have ISBNs",
            //     step: 0,
            //     max: 0
            //   });
            // }
            
            vue.goToOutputPage(hotpotato);
            
          });
        });
        
      });
      
    },

    init_step_update: function( config ) {
      config.partialScan = true;
      // Make sure library is the only step when doing a partial extraction...
      config.steps = [{ name: 'library', value: true }];
      this.init_step_extract(config);
    },

    init_step_output: function( config ) {
      
      let newData = {config: config, extras: { 'domain-extension': this.domainExtension }};
      chrome.storage.local.set( newData ).then(() => {
        this.goToOutputPage({ useStorageData: true });
      });
      
    },
    
    outputCleanup( hotpotato ) {
      
      let collections = hotpotato.collections;
      let archive = collections ? _.find( collections, { id: '__ARCHIVE' }) : null;
      if ( archive ) archive.description = '';
      
      let removeStragglers = function( key ) {
        
        if ( hotpotato[ key ] ) {
          _.each(hotpotato[ key ], function( book ) {
            
            if ( book.storePageRequestUrl ) delete book.storePageRequestUrl;
            if ( book.isNewThisRound ) delete book.isNewThisRound;
            if ( book.requestUrl ) delete book.requestUrl;
            // Add prop "archived" if a book is in the archive....
            // This helps simplify the filters related to archive
            if ( key === 'books' && book.asin && _.get(archive, 'books.0') ) {
              let bookInArchive = _.includes( archive.books, book.asin );
              if ( bookInArchive ) book.archived = true;
            }
            
            // Adding books that are no longer sold into series.
            if ( key === 'books' ) {              
              _.each( book.series, ( series ) => {
                const foundSeries = _.find(hotpotato.series, { asin: series.asin});
                const detachedFromSeries = !_.includes(foundSeries.books, book.asin);
                if ( detachedFromSeries ) {
                  foundSeries.detachedBooks = true;
                  foundSeries.books.push( book.asin );
                  const newAddition = _.pick(book, [ 'titleShort', 'title', 'cover', 'bookNumbers', 'asin' ]);
                  newAddition.bookNumbers = _.isArray(series.bookNumbers) ? series.bookNumbers.join(', ') : series.bookNumbers;
                  const firstNumber = _.first(series.bookNumbers);
                  const targetIndex = _.findLastIndex(foundSeries.allBooks, ( book ) => {
                    return book.bookNumbers == firstNumber || book.bookNumbers == newAddition.bookNumbers;
                  });
                  
                  // Found a book with the same number
                  if ( targetIndex > -1 ) {
                    foundSeries.allBooks.splice(targetIndex+1, 0, newAddition);
                  }
                  else {
                    foundSeries.allBooks.push(newAddition);
                  }
                }
              });
            }
            
          });
        }
        
      };
      
      removeStragglers('books'); // Library
      removeStragglers('wishlist'); 
      
      // Make sure library books are excluded from the wishlist no matter hwhat...
      if ( _.get(hotpotato, 'books.0') && _.get(hotpotato, 'wishlist.0') ) {
        _.remove( hotpotato.wishlist, function( book ) {
          if ( book.asin ) return _.find( hotpotato.books, { asin: book.asin });
        });
      }
      
    },
    
    saveExtractionSoFar( hotpotato, callback ) {
      
      let vue = this;
      
      this.outputCleanup( hotpotato );

      if ( hotpotato.config ) {
        if ( hotpotato.config.steps || hotpotato.config.extraSettings ) {
          let steps = hotpotato.config.steps;
          let extraSettings = hotpotato.config.extraSettings;
          hotpotato.config = {};
          if ( steps ) hotpotato.config.steps = steps;
          if ( extraSettings ) hotpotato.config.extraSettings = extraSettings; 
        }
        
      }
      
      this.addDataVersions( hotpotato );
      
      if (!hotpotato.chunks ) {
        if ( hotpotato.books    ) this.addedOrder(hotpotato.books);
        if ( hotpotato.books    ) this.languageCorrections(hotpotato.books);
        if ( hotpotato.wishlist ) this.addedOrder(hotpotato.wishlist);
        this.makeFrenchFries(hotpotato);
      }
      
      chrome.storage.local.clear().then(() => {
        chrome.storage.local.set(hotpotato).then(() => {
          
            if ( _.get(hotpotato, 'chunks.0') ) vue.glueFriesBackTogether(hotpotato);
            
            callback( hotpotato );
          
        });
      });
      
    },
    
    languageCorrections( books ) {
      _.each(books, (book, index) => {
        
        switch ( book.progress ) {
          case 'Beendet':
            book.progress = 'Finished';
            break;
        }
        
      });
    },

    goToOutputPage: function(hotpotato) {
      
      const pageAddress = window.location.origin + window.location.pathname;
      
      this.$store.commit('update', { key: 'sticky.openOnLoad', value: true });
      
      // No need to save anything...
      if ( hotpotato.useStorageData ) {
        chrome.runtime.sendMessage({ action: "openOutput", url: pageAddress });
      }
      else {
        this.saveExtractionSoFar( hotpotato, () => {
          chrome.runtime.sendMessage({ action: "openOutput", url: pageAddress });
        }); 
      }
      
    },
    
    addDataVersions: function( hotpotato ) {
      
      if ( !_.isObject( hotpotato.version ) ) hotpotato.version = {};
      
      let hasData = this.store.storageHasData;
      let version = chrome.runtime.getManifest().version;
      
      // If a step was just extracted and there was no existing data update data version...
      if ( _.find( _.get(hotpotato, 'config.steps'), { name: 'library', value: true })     && !hasData.books       ) hotpotato.version.library     = version;
      if ( _.find( _.get(hotpotato, 'config.steps'), { name: 'collections', value: true }) && !hasData.collections ) hotpotato.version.collections = version;
      if ( _.find( _.get(hotpotato, 'config.steps'), { name: 'wishlist', value: true })    && !hasData.wishlist    ) hotpotato.version.wishlist    = version;
      
    },
    
    init_purchaseHistoryTest: function() {
      
      const hotpotato = {
        config: { test: true, getStorePages: 'books' }
      };
      
      this.getDataFromPurchaseHistory(hotpotato, function(nullBoy, result) {
        console.log(
          "%c" + "Purchase history test" + "",
          "background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;",
          result
        );
      });
      
    },

    init_storePageTest: function() {
      
      const vue = this;
      console.log('%c' + 'asdfasdf' + '', 'background: green; color: #fff; padding: 2px 5px; border-radius: 8px;', this.doStorePageTest);
      const hotpotato = {
        config: { test: true, getStorePages: 'books', seriesTest: true },
        books: this.doStorePageTest,
      };
      
      console.log('%c' + 'asdfasdf' + '', 'background: orange; color: #fff; padding: 2px 5px; border-radius: 8px;', hotpotato);
      const waterfallArray = [
        function(callback) { callback(null, hotpotato); },
        vue.getDataFromStorePages,      // Requires library page data
        vue.getDataFromSeriesPages,     // Requires store page data (for fallback)
      ];
      
      console.log('waterfall', 'waterfall');
      waterfall(waterfallArray, function(err, hotpotato) {
        
        vue.$store.commit('resetProgress');
        vue.$store.commit('update', [
          { key: 'bigStep.title', value: 'Opening the gallery after packing up the data...' },
          { key: 'bigStep.step', value: 0 },
          { key: 'bigStep.max', value: 0 },
        ]);

        console.log(
          "%c" + "Store page test" + "",
          "background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;",
          hotpotato
        );
        
      });
            
    },
    
    init_seriesPageTest: function() {
      const vue = this;
      
      const hotpotato = {
        config: { seriesTest: true },
        books: this.doSeriesTest,
      };
      
      vue.getDataFromSeriesPages(hotpotato, function(nullBoy, result) {
        console.log(
          "%c" + "Series page test" + "",
          "background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;",
          result.series
        );
      });
    },
    
    // startConsole: function() {
      
    //   let el = document.createElement('div');
    //   el.style.zIndex = 999999999999999999;
    //   el.style.position = 'absolute';
    //   document.body.appendChild(el);
      
    //   eruda.init({
    //     container: el,
    //     tool: ['console'],
    //     autoScale: true,
    //     defaults: {
    //       displaySize: 40,
    //       transparency: .9,
    //       theme: 'Monokai Pro',
    //     },
    //   });
      
    //   eruda.add(erudaMemory);
    //   eruda.add(erudaDom);
      
    //   // eruda.show();
      
    // }
    
    
    checkAccess: function( config ) {
      
      config = config || {};
      
      // Check if it's possible to read the wishlist page
      axios.get( config.to )
      .then(function() {
        if ( config.success ) config.success();
      }).catch(function( e ) {
        if ( config.failed ) config.failed( e );
      }).then(function() {
        if ( config.finally ) config.finally();
      });
      
    },
  }
};
</script>
