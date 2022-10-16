<template>
  <cont-overlay>
    <cont-menu-screen v-if="ui === 'menu-screen'"
    :storageHasData.sync="storageHasData"
    :storageConfig.sync="storageConfig"
    :dataVersion.sync="dataVersion"
    :domainExtension="domainExtension"
    :wishlistUrl="wishlistUrl"
    ></cont-menu-screen>
    <cont-scraping-progress v-else-if="ui === 'scraping'"></cont-scraping-progress>
  </cont-overlay>
</template>

<script>
// // import _ from "lodash";
import $ from "jquery";
import axios from "axios";
import { exponentialDelay, isNetworkOrIdempotentRequestError } from 'axios-retry';
import axiosRetry from 'axios-retry';
import browser from "webextension-polyfill";
import { format as dateFormat } from "date-fns";
import DOMPurify from "dompurify";
import map from "async-es/map";
import mapLimit from "async-es/mapLimit";
import waterfall from "async-es/waterfall";
import Url from "domurl";

global._ = _;
global.$ = $;
global.axios = axios;
global.axiosRetry = axiosRetry;
global.exponentialDelay = exponentialDelay;
global.isNetworkOrIdempotentRequestError = isNetworkOrIdempotentRequestError;
global.browser = browser;
global.dateFormat = dateFormat;
global.DOMPurify = DOMPurify;
global.Url = Url;
global.asyncMapLimit = mapLimit;
global.asyncMap = map;
global.waterfall = waterfall;

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

window.each = function( array, callback ) {
  if ( !array ) return null;
  for (var i = 0; i < array.length; i++) {
    callback( array[i], i );
  }
};

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
        // { storePageRequestUrl: "https://www.audible.com/pd/B0B6QBNK4J" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B08JJPL532" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B08JJLSSMQ" },
        { storePageRequestUrl: "https://www.audible.com/pd/1721336850" },
      ],
      doSeriesTest: [
        // { series: [{asin: 'B006XE41AC'}] },
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
    if ( _.get( this.doStorePageTest, 'length', 0 ) > 0 ) vue.init_storePageTest();
    if ( _.get( this.doSeriesTest,    'length', 0 ) > 0 ) vue.init_seriesPageTest();
    
    // this.scrapingPrep(this.libraryUrl, function(prep) {
    //   console.log('PREP?', prep)
    // });
    
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
            vue.getDataFromStorePages,      // Requires library page data
            vue.getDataFromSeriesPages,     // Requires store page data (for fallback)
            vue.getDataFromCollections,     // Can be scraped alone (but requires library data in the gallery...)
            vue.getDataFromWishlist,        // Can be scraped alone
            vue.getDataFromStorePages,      // Requires wishlist data
            vue.getISBNsFromGoogleBooks,    // Requires library page data
          ];
          
          const maxSteps = config.steps ? _.filter(config.steps, function(o) { return o.value; }).length : waterfallArray.length - 1 // First function is just a kind of a failsafe and doesn't count
          vue.$store.commit('update', { key: 'bigStep.max', value: maxSteps });
          
          // vue.$root.$emit("update-big-step", {
          //   max: config.steps ? _.filter(config.steps, function(o) {
          //       return o.value;
          //     }).length
          //     : waterfallArray.length - 1 // First function is just a kind of a failsafe and doesn't count
          // });

          waterfall(waterfallArray, function(err, hotpotato) {
            
            vue.$store.commit('resetProgress');
            vue.$store.commit('update', [
              { key: 'bigStep.title', value: 'Opening the gallery after packing up the data...' },
              { key: 'bigStep.step', value: 0 },
              { key: 'bigStep.max', value: 0 },
              { key: 'subStep.step', value: 0 },
              { key: 'subStep.max', value: 0 },
            ]);
            // vue.$root.$emit("reset-progress");
            // vue.$root.$emit("update-big-step", {
            //   title: "Opening the gallery after packing up the data...",
            //   step: 0,
            //   max: 0
            // });
            // vue.$root.$emit("update-sub-step", {
            //   step: 0,
            //   max: 0,
            // });

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
      browser.storage.local.set( newData ).then(() => {
        this.goToOutputPage({ useStorageData: true });
      });
      
    },

    goToOutputPage: function(hotpotato) {
      
      // console.log('goToOutputPage', hotpotato);
      // console.log( this.$store.state.canceledRequests );
      // return;
      
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
        config: { test: true, getStorePages: 'books', seriesTest: true },
        books: this.doStorePageTest,
      };
      
      // vue.getDataFromStorePages(hotpotato, function(nullBoy, result) {
      //   console.log(
      //     "%c" + "Store page test" + "",
      //     "background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;",
      //     result
      //   );
      // });
      
      const waterfallArray = [
        function(callback) { callback(null, hotpotato); },
        vue.getDataFromStorePages,      // Requires library page data
        vue.getDataFromSeriesPages,     // Requires store page data (for fallback)
      ];
      
      waterfall(waterfallArray, function(err, hotpotato) {
        
        vue.$store.commit('resetProgress');
        vue.$store.commit('update', [
          { key: 'bigStep.title', value: 'Opening the gallery after packing up the data...' },
          { key: 'bigStep.step', value: 0 },
          { key: 'bigStep.max', value: 0 },
        ]);
        // vue.$root.$emit("reset-progress");
        // vue.$root.$emit("update-big-step", {
        //   title: "Opening the gallery after packing up the data...",
        //   step: 0,
        //   max: 0
        // });

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
    
  }
};
</script>
