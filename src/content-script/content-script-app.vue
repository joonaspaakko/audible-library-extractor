<template>
  <overlay>
    
    <menu-screen v-if="ui === 'menu-screen'" :storageHasData="storageHasData" :storageConfig="storageConfig"></menu-screen>
    <scraping-progress v-if="ui === 'scraping'"></scraping-progress>
    
  </overlay>
</template>

<script>

import _ from 'lodash';
import $ from 'jquery';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import browser from 'webextension-polyfill';
import { format as dateFormat } from 'date-fns';
import DOMPurify from 'dompurify';
import map from 'async-es/map';
import Url from 'domurl';
import waterfall from 'async-es/waterfall';

global._          = _;
global.$          = $;
global.asyncMap   = map;
global.axios      = axios;
global.axiosRetry = axiosRetry;
global.browser    = browser;
global.dateFormat = dateFormat;
global.DOMPurify  = DOMPurify;
global.Url        = Url;
global.waterfall  = waterfall;

// Components
import overlay from './_components/layout/overlay';
import menuScreen from './_components/layout/menuScreen';
import scrapingProgress from './_components/layout/scrapingProgress';

// Calls
import amapxios from './_components/_mixins/calls/amapxios.js';
import scrapingPrep from './_components/_mixins/calls/scrapingPrep.js';

// Misc
import getDataFromCarousel from './_components/_mixins/misc/fetch-store-page-carousel-data.js';
// Misc - Helpers
import shortenLength from './_components/_mixins/misc/helpers.js';
import getSummary from './_components/_mixins/misc/helpers.js';
import fixDates from './_components/_mixins/misc/helpers.js';
import getSeries from './_components/_mixins/misc/helpers.js';
import getArray from './_components/_mixins/misc/helpers.js';
import addedOrder from './_components/_mixins/misc/helpers.js';
import makeFrenchFries from './_components/_mixins/misc/helpers.js';
import glueFriesBackTogether from './_components/_mixins/misc/helpers.js';


// Steps
import getDataFromLibraryPages from './_components/_mixins/main-step/process-library-pages.js';
import getDataFromStorePages from './_components/_mixins/main-step/process-store-pages.js';
import getISBNsFromGoogleBooks from './_components/_mixins/main-step/process-isbns.js';
import getDataFromSeriesPages from './_components/_mixins/main-step/process-series-pages.js';
import getDataFromCollections from './_components/_mixins/main-step/process-collections.js';
import getDataFromWishlist from './_components/_mixins/main-step/process-wishlist.js';

// Outside 
import timeStringToSeconds from '@output-mixins/timeStringToSeconds.js';
import secondsToTimeString from '@output-mixins/secondsToTimeString.js';

export default {
  components: {
    overlay,
    menuScreen,
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
  props: ['storageHasData', 'storageConfig'],
  data: function() {
    return {
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
      ui: 'menu-screen',
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
    
    init_step_extract: function( config, hotpotato ) {
      
      const vue = this;
      vue.ui = 'scraping';
      vue.$nextTick(function() {
        
        hotpotato = hotpotato || {};
        hotpotato.config = config;
        
        const waterfallArray = [ 
          function( callback ) { callback( null, hotpotato ); }, 
          vue.getDataFromLibraryPages, // Can be scraped alone
          vue.getDataFromStorePages,   // Requires library page data
          vue.getDataFromSeriesPages,  // Requires library page data
          vue.getDataFromCollections,  // Can be scraped alone
          vue.getISBNsFromGoogleBooks, // Requires library page data
          vue.getDataFromWishlist,     // Can be scraped alone
        ];
        
        vue.$root.$emit('update-big-step', {
          max: config.steps ? _.filter( config.steps, function( o ) { return o.value && !o.extra; }).length : waterfallArray.length-1, // First function is just a kind of a failsafe and doesn't count
        });
        
        waterfall( waterfallArray, function(err, hotpotato) {
          
          vue.$root.$emit('update-big-step', {
            title: 'Closing this page in 5 seconds and opening the gallery page in a new tab',
            step: 0, 
            max: 0,
          });
          
          const configISBN = _.find( hotpotato.config.steps, { name: 'isbn' });
          if ( configISBN && configISBN.value ) {
            const booksWithISBN = _.filter( hotpotato.books, 'isbns');
            vue.$root.$emit('update-progress', {
              text: 'Currently ' + booksWithISBN.length + '/' + hotpotato.books.length + ' books have ISBNs',
              step: 0,
              max: 0,
            });
          }
            
          setTimeout(function() {
            vue.goToOutputPage( hotpotato );
          }, 5500);
          
        });
        
      });
      
    },
    
    init_step_update: function( config ) {
      
      const vue = this;
      browser.storage.local.get(null).then( hotpotato => {
        
        if ( hotpotato.chunks ) vue.glueFriesBackTogether( hotpotato ); 
        config.partialScan = true;
        config.oldBooksLength = hotpotato.books.length;
        vue.init_step_extract( config, hotpotato);
        
      });
      
    },
    
    init_step_output: function( ) {
      this.goToOutputPage({ useStorageData: true });
    },
    
    goToOutputPage: function( hotpotato ) {
      
      if ( hotpotato.useStorageData ) {
        browser.runtime.sendMessage({ action: 'openOutput' });
      }
      else {
        
        hotpotato.config = { steps: hotpotato.config.steps };
        
        if ( !hotpotato.chunks ) {
          this.addedOrder( hotpotato.books );
          this.makeFrenchFries( hotpotato );
        }
        
        browser.storage.local.clear().then(() => {
          browser.storage.local.set( hotpotato ).then(() => {
            
            browser.runtime.sendMessage({ action: 'openOutput' });
            
          });
        });
        
      }
      
    },
  
    init_storePageTest: function() {
      
      const vue = this;
      
      const hotpotato = {
        config: { test: true },
        books: [
          // { storePageRequestUrl: 'https://www.audible.com/pd/Goon-Squad-Audiobook/B01MFBRCHN', },
          // { storePageRequestUrl: 'https://www.audible.com/pd/The-Martian-Audiobook/B082BHJMFF', },
          // { storePageRequestUrl: 'https://www.audible.com/pd/The-Dire-King-Audiobook/B0751GMDXN', },
          // { storePageRequestUrl: 'https://www.audible.com/pd/Aliens-of-Extraordinary-Ability-Audiobook/B07TXLC1NF', },
          { storePageRequestUrl: 'https://www.audible.com/pd/Nomad-Audiobook/B017J3ZQDG', },
        ],
      };
      
      vue.getDataFromStorePages(hotpotato, function( nullBoy, result ) {
        
        console.log('%c' + 'Store page test' + '', 'background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;', result);
        
      });
      
    },
  
  },
}
</script>
