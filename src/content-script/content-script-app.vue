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
        // { storePageRequestUrl: "https://www.audible.com/pd/B06Y46VB4L" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B078X15P2P" },
          // { storePageRequestUrl: "https://www.audible.com/pd/0593104056" },
          // { storePageRequestUrl: "https://www.audible.com/pd/0785253173" },
          // { storePageRequestUrl: "https://www.audible.com/pd/0807093904" },
          // { storePageRequestUrl: "https://www.audible.com/pd/1549173499" },
          // { storePageRequestUrl: "https://www.audible.com/pd/1614967156" },
          // { storePageRequestUrl: "https://www.audible.com/pd/1645550192" },
          // { storePageRequestUrl: "https://www.audible.com/pd/1974921719" },
          // { storePageRequestUrl: "https://www.audible.com/pd/1974921778" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00CMDZUR6" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00D6OQ70O" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00D6SYSWO" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00D8DIE0E" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00D8DIVQ6" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00D8J59NI" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00D8K5EFA" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00D9A16QK" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00D9BQOZW" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00D97SJJK" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DB3TXFQ" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DB4ZAP2" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DB6KIKC" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DCCAM7Y" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DD2WFGY" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DDVRFIS" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DDX6EF6" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DEL13V2" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DEOXKR4" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DGBT1L4" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DGCGP1W" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DGCH98K" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DI952QC" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DIATCXA" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DJBVBMI" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DL2DAXS" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DL6HROW" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00DMOB2TO" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00E825RDQ" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00ENL862G" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00FL2DWNO" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00FX74JKC" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00GBI17ES" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00GIQZWPI" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00GT2KCXI" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00HJCEGKM" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00HQJUL8O" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00HU7V80W" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00IP11BUY" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00IXWH5KA" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00JBCTMVQ" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00KN2BK40" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00KN11F3W" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00KTKZUWY" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00LPMHE4C" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00MAKI55U" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00MEQS4F6" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00OBVT4ME" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00P1RW1CC" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00Q3MX9PW" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00Q5DHLBM" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00R6PULB0" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00REUDYY8" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00XP35LM6" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002UZL7R8" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V0K2D2" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V0KMVY" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V0PXAY" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V0RCTY" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V0852C" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V087T8" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V1M02W" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V1ODL8" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V5BBDC" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V5CRYE" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V5IVHG" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V8L2UQ" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V8LJGS" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V8MCV4" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002V9Z7KG" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B002VA8O5A" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B003MB94D8" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B0038FYKBY" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B004E8IAMY" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B004NF9AKO" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B004RCJTTA" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B004SI1E00" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B004TAFWT6" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B0040I0LI4" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B00443X056" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B005E1GBDK" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B005FM5AZI" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B005IZ9C5Q" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B006YD81BC" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B007SY8QKM" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B008FR70AI" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B009PRFDA6" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B0095Y0R8C" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01AYGLFTO" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01BFO1MLK" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01BFOTLG8" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01BMLELYG" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01CT0SQBS" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01D0FJOAI" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01ELX0V2S" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01ETLC4T0" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01F2BZ3OY" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01II2R39W" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01K4ZNTFS" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01KOW9NEM" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01L9UTO24" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01MF66KQ6" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01MQNGLJQ" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01MTRYFQH" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01N5OU58Z" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B01N9Z0D30" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B011LUCFZU" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B014V81SLQ" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B0159LVSNC" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B016QSUEJ6" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B06WWLTWTS" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B06XDX2FST" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B06XWZJK47" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B06Y4F5KH3" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07CV165L5" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07D5H12L6" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07D7GJ6ZL" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07DJZ7WK1" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07DSJKKLM" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07FKQFK92" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07HKS62RH" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07HKSVJQY" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07LC1LF9T" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07NWWFC9S" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07P6S3QGD" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07RZMZDQH" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07SZJ35BW" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07YL79YNK" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B07YSSLLXC" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B071ZM4FHX" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B072JYZGWH" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B072888W6M" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B073JR7W68" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B073PJ2227" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B074SXVWNQ" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B0758LTFB4" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B077K4XXKV" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B078P67ZQK" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B08PDWTPWF" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B08S7SLKT9" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B09CLKN4BV" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B09D41K1JC" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B09F18K5XN" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B09JQV7HTT" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B09JYBNLCG" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B09NLF95YY" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B09SKGV1FC" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B09SKPYNT1" },
          // { storePageRequestUrl: "https://www.audible.com/pd/B094WGCVY7" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B016WNPN3W" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B004GI55Q6" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B002V0KA3O" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B002V1CDYC" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B007PSX35O" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B01H45E0CC" },
        // { storePageRequestUrl: "https://www.audible.com/pd/B08ZBT2HB5" },
      ],
      doSeriesTest: [
        // { series: [{asin: 'B018T5ESBE'}] },
        // { series: [{asin: 'B007D0J4H0'}] },
        // { series: [{asin: 'B00DBL75N0'}] },
        // { series: [{asin: 'B00DLM6CUG'}] },
        // { series: [{asin: 'B00DMOAB2I'}] },
        // { series: [{asin: 'B005NAD2U2'}] },
        // { series: [{asin: 'B005NAZT7Q'}] },
        // { series: [{asin: 'B006K1LRQO'}] },
        // { series: [{asin: 'B006K1O85G'}] },
        // { series: [{asin: 'B006K1OHNO'}] },
        // { series: [{asin: 'B007B4S7OE'}] },
        // { series: [{asin: 'B007SXTNLE'}] },
        // { series: [{asin: 'B007ZTL4TU'}] },
        // { series: [{asin: 'B00713SI1W'}] },
        // { series: [{asin: 'B008CQVVIO'}] },
        // { series: [{asin: 'B0083DGAGO'}] },
        // { series: [{asin: 'B015WWM7GU'}] },
        // { series: [{asin: 'B016OQVUQQ'}] },
        // { series: [{asin: 'B07HGLKLZG'}] },
        // { series: [{asin: 'B07MJTWRBW'}] },
        // { series: [{asin: 'B07S6SDQB6'}] },
        // { series: [{asin: 'B0793R8X2P'}] },
        // { series: [{asin: 'B086FRQ2L5'}] },
        // { series: [{asin: 'B09D4N723K'}] },
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
    if ( this.doStorePageTest && this.doStorePageTest.length > 0 ) vue.init_storePageTest();
    if ( this.doSeriesTest && this.doSeriesTest.length > 0 ) vue.init_seriesPageTest();
    
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
