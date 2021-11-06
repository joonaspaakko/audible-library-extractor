<template>
  <overlay>
    <menu-screen
    v-if="ui === 'menu-screen'"
    :storageHasData.sync="storageHasData"
    :storageConfig.sync="storageConfig"
    :dataVersion.sync="dataVersion"
    :domainExtension="domainExtension"
    :wishlistUrl="wishlistUrl"
    ></menu-screen>
    <scraping-progress v-else-if="ui === 'scraping'"></scraping-progress>
  </overlay>
</template>

<script>
import _ from "lodash";
import $ from "jquery";
import axios from "axios";
import { exponentialDelay, isNetworkOrIdempotentRequestError } from 'axios-retry';
import axiosRetry from 'axios-retry';
import browser from "webextension-polyfill";
import { format as dateFormat } from "date-fns";
import DOMPurify from "dompurify";
import map from "async-es/map";
import Url from "domurl";
import waterfall from "async-es/waterfall";

global._ = _;
global.$ = $;
global.asyncMap = map;
global.axios = axios;
global.axiosRetry = axiosRetry;
global.exponentialDelay = exponentialDelay;
global.isNetworkOrIdempotentRequestError = isNetworkOrIdempotentRequestError;
global.browser = browser;
global.dateFormat = dateFormat;
global.DOMPurify = DOMPurify;
global.Url = Url;
global.waterfall = waterfall;

axiosRetry(axios, {
  retries: 1,
  retryDelay: function(retryCount) { return 1000 * retryCount; },
  retryCondition: function(error) {
    return (error && error.response && error.response.status == "429");
  }
});

String.prototype.trimAll = function() {
  if (this) {
    return this.trim().replace(/\s+/g, " ");
  } else {
    return null;
  }
};
String.prototype.trimToColon = function() {
  if (this) {
    return this.substring(this.indexOf(":") + 1).trim();
  } else {
    return null;
  }
};

// Components
import overlay from "./_components/layout/overlay";
import menuScreen from "./_components/layout/menuScreen";
import scrapingProgress from "./_components/layout/scrapingProgress";

// Calls
import amapxios from "./_components/_mixins/calls/amapxios.js";
import scrapingPrep from "./_components/_mixins/calls/scrapingPrep.js";

// Misc
import getDataFromCarousel from "./_components/_mixins/misc/fetch-store-page-carousel-data.js";
// Misc - Helpers
import helpers from "./_components/_mixins/misc/helpers.js";

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
import timeStringToSeconds from "@output-mixins/timeStringToSeconds.js";
import secondsToTimeString from "@output-mixins/secondsToTimeString.js";

// import eruda from "eruda";
// import erudaMemory from "eruda-memory";
// import erudaDom from "eruda-dom";

export default {
  components: {
    overlay,
    menuScreen,
    scrapingProgress
  },
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
  props: ["storageHasDataInit", "storageConfigInit", "dataVersionInit"],
  data: function() {
    return {
      storageHasData: {},
      storageConfig: {},
      libraryUrl: window.location.origin + "/library/titles",
      libraryUrlFin: window.location.origin + "/library/titles?isFinished=true",
      seriesUrl: window.location.origin + "/series",
      collectionsUrl: window.location.origin + "/library/collections",
      wishlistUrl: window.location.origin + "/wl",
      purchaseHistoryUrl: window.location.origin + "/account/purchase-history", // tf=orders&df=2021
      domainExtension: window.location.hostname.replace('www.audible', ''),
      newBooks: [],
      library: {
        books: [],
        storePageMissing: []
      },
      ui: "menu-screen",
      doStorePageTest: [
        // { storePageRequestUrl: "https://www.audible.com/pd/B07C7S798P" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B07V5K12WX" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B007PR4J4E" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B005FRGT44" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B089T5SW3N" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B089T5SW3N" },
      ],
    };
  },
  
  created: function() {
    
    this.storageHasData = JSON.parse(JSON.stringify(this.storageHasDataInit));
    this.storageConfig = JSON.parse(JSON.stringify(this.storageConfigInit));
    this.dataVersion = JSON.parse(JSON.stringify(this.dataVersionInit));
    
  },
  
  beforeMount: function() {
    const vue = this;

    vue.$root.$on("do-next-step", function(o) {
      vue["init_step_" + o.step](o.config);
    });
    
    
    // vue.init_purchaseHistoryTest();
    if ( this.doStorePageTest && this.doStorePageTest.length > 0 ) vue.init_storePageTest();
    // vue.init_seriesPageTest();
    
  },
  
  mounted: function() {
    this.$nextTick(function() {
      // this.startConsole();
    });
  },
  
  methods: {
    init_step_extract: function( config ) {
      
      const vue = this;
      browser.storage.local.get(null).then(hotpotato => {
        
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
            vue.getDataFromStorePages,      // Requires library page data
            vue.getDataFromSeriesPages,     // Requires store page data (for fallback)
            vue.getDataFromCollections,     // Can be scraped alone (but requires library data in the gallery...)
            vue.getDataFromWishlist,        // Can be scraped alone
            vue.getDataFromStorePages,      // Requires wishlist data
            vue.getISBNsFromGoogleBooks,    // Requires library page data
          ];
          
          vue.$root.$emit("update-big-step", {
            max: config.steps ? _.filter(config.steps, function(o) {
                return o.value;
              }).length
              : waterfallArray.length - 1 // First function is just a kind of a failsafe and doesn't count
          });

          waterfall(waterfallArray, function(err, hotpotato) {
            vue.$root.$emit("reset-progress");
            vue.$root.$emit("update-big-step", {
              title: "Opening the gallery after packing up the data...",
              step: 0,
              max: 0
            });

            // const configISBN = _.find(hotpotato.config.steps, { name: "isbn" });
            // const foundISBNs = _.filter(hotpotato.books, 'isbns');
            // if (configISBN && configISBN.value ||foundISBNs.length > 0 ) {
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
      browser.storage.local.set( newData ).then(() => {
        this.goToOutputPage({ useStorageData: true });
      });
      
    },

    goToOutputPage: function(hotpotato) {
      
      let vue = this;
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
            if ( key === 'books' && book.asin && archive && archive.books.length > 0 ) {
              let bookInArchive = _.includes( archive.books, book.asin );
              if ( bookInArchive ) book.archived = true;
            }
            
          });
        }
        
      };
      
      removeStragglers('books'); // Library
      removeStragglers('wishlist'); 
      
      // Make sure library books are excluded from the wishlist no matter hwhat...
      if ( hotpotato.books && hotpotato.books.length && hotpotato.wishlist && hotpotato.wishlist.length ) {
        _.remove( hotpotato.wishlist, function( book ) {
          if ( book.asin ) return _.find( hotpotato.books, { asin: book.asin });
        });
      }
      
      if ( hotpotato.useStorageData ) {
        browser.runtime.sendMessage({ action: "openOutput" });
      } else {
        
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
          if ( hotpotato.wishlist ) this.addedOrder(hotpotato.wishlist);
          this.makeFrenchFries(hotpotato);
        }

        browser.storage.local.clear().then(() => {
          browser.storage.local.set(hotpotato).then(() => {
            
            // If console is open don't open the gallery page....
            // if ( vue.erudaOpenStayInAudible() ) return;
            browser.runtime.sendMessage({ action: "openOutput" });
            
          });
        });
      }
      
    },
    
    addDataVersions: function( hotpotato ) {
      
      if ( !_.isObject( hotpotato.version ) ) hotpotato.version = {};
      
      let hasData = this.storageHasData;
      let version = browser.runtime.getManifest().version;
      
      // If a step was just extracted and there was no existing data update data version...
      if ( _.find( hotpotato.config.steps, { name: 'library', value: true })     && !hasData.books       ) hotpotato.version.library     = version;
      if ( _.find( hotpotato.config.steps, { name: 'collections', value: true }) && !hasData.collections ) hotpotato.version.collections = version;
      if ( _.find( hotpotato.config.steps, { name: 'wishlist', value: true })    && !hasData.wishlist    ) hotpotato.version.wishlist    = version;
      
    },
    
    // erudaOpenStayInAudible: function() {
      
    //   let erudaIsOpen = false;
      
    //   if ( !!eruda ) {
    //     let erudaStatus = eruda.get();
    //     if ( erudaStatus )erudaIsOpen = erudaStatus._isShow; 
    //   }
      
    //   if ( erudaIsOpen ) {
            
    //     this.$root.$emit("reset-progress");
    //     this.$root.$emit("update-big-step", {
    //       title: "Data has been saved, but since the console window is open, gallery won't be opened automatically.",
    //       step: 0,
    //       max: 0
    //     });
    //     this.$root.$emit("update-progress", {
    //       text: "You can still open the gallery manually without the need to do a new extract...",
    //       step: 0,
    //       max: 0
    //     });
        
    //   }
      
    //   return erudaIsOpen;
    // },
    
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
      
      const hotpotato = {
        config: { test: true, getStorePages: 'books' },
        books: this.doStorePageTest,
      };

      vue.getDataFromStorePages(hotpotato, function(nullBoy, result) {
        console.log(
          "%c" + "Store page test" + "",
          "background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;",
          result
        );
      });
      
    },
    
    init_seriesPageTest: function() {
      const vue = this;
      
      const hotpotato = {
        config: { seriesTest: true },
        books: [
          { series: [{asin: 'B005NB2IG0'}] },
          { series: [{asin: 'B077XNSN35'}] },
        ]
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
    
  }
};
</script>
