const standalone = document.querySelector("html.standalone-gallery");

// VUE 
import { createApp } from "vue";
import App from "./gallery-app.vue";
const app = createApp(App);

import "normalize.css/normalize.css";

app.config.devtools = false;
app.config.productionTip = false;

// VUE SHORTKEY
import shortkey from 'vue3-shortkey';
app.use(shortkey);
// VUE ROUTER
import loadRoutes from '@output-modules/gallery-load-routes.js';
// UPDATING VUEX QUERIES
import updateRouterQueries from './_plugins/gallery-update-router-query.js';
app.use( updateRouterQueries );
// For emitting custom events between components
import mitt from 'mitt';
app.config.globalProperties.$compEmitter = new mitt();
// VUEX store
import store from "@output-modules/store/gallery-store-index.js";
app.use(store);
// VUE TIPPY
import VueTippy from "vue-tippy";
import tippySettings from './_plugins/gallery-tippy-settings.js';
app.use(VueTippy, tippySettings);
import 'tippy.js/dist/tippy.css';
// FONTAWESOME
import '@fortawesome/fontawesome-free/css/all.css';
// LONG PRESS
import longPress from './_plugins/gallery-long-press.js';
app.directive('longpress', longPress);

import Vue3TouchEvents from "vue3-touch-events";
app.use(Vue3TouchEvents);

// GLOBAL METHODS
import setListRenderingOptions from './_plugins/gallery-set-list-rendering-options.js'
app.use( setListRenderingOptions );

// HELPER METHODS (from content script)
import helpers from "@contscript-mixins/misc/content-script-helpers.js";

// APP PREP
// For testing side loading JSON
var sideLoadJSON = false;
// import sideLoadJSON from './test-data-2.json';
if ( sideLoadJSON ) {
  startVue( sideLoadJSON );
}
// In the extension environment...
else if ( !standalone ) {
  try {
    // https://developer.chrome.com/apps/storage
    // Permission: "storage"
    chrome.storage.local.get(null).then(data => {
      if (!_.isEmpty(data) && data.chunks) {
        helpers.methods.glueFriesBackTogether(data);
        startVue(data);
      } else {
        alert("No existing data found: extract your library again.");
      }
    });
  } catch (e) {}
} 
// As a standalone website...
else {
  
  loadJSON();
  function loadJSON( afterError ) {
    let scrpt = document.createElement("script");
    let cacheID = document.querySelector('#audible-library-extractor').getAttribute('data-cache-id');
    scrpt.src = "data/temp-data."+ cacheID +".js";
    scrpt.type = "text/javascript";
    scrpt.onload = function() {
      
      let tempData = window.tempDataJSON;
      window.bookSummaryJSON = true;
      
      scrpt = null;
      startVue( tempData );
      
    };
    // Tries again if there's an error loading the files, but only once...
    scrpt.onerror = function() {
      scrpt = null;
      setTimeout(function() {
        if ( !afterError ) loadJSON('afterError'); // Try twice...
      }, 1000);
    };
    document.head.appendChild(scrpt);
  }
  
}

import vuexPrep from '@output-modules/gallery-vuex-prep.js';

function startVue( libraryData ) {
  
  let standaloneRouteData;
  _.set(libraryData, 'extras.pages', {});
  if ( standalone ) {
    standaloneRouteData = JSON.parse(JSON.stringify(libraryData));
    var cleanUp = ['books', 'series', 'collections', 'podcasts', 'wishlist'];
    _.each(cleanUp, function( key ) {
      if ( _.get(libraryData, key) === true ) {
        delete libraryData[ key ];
        _.set( libraryData, 'extras.pages.' + key, true );
      }
    });
  }
  
  vuexPrep( libraryData );
  
  let router = loadRoutes( standaloneRouteData || libraryData, store );
  
  app.use( router );
  app.mount('#audible-library-extractor');
  
}
