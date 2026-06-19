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
// Mobile haptics - DISABLED
// The ios-haptics library (v0.1.5) relied on a bug where programmatically
// clicking an <input type="checkbox" switch /> would trigger haptic feedback.
// Apple patched this exploit in iOS 26.5, breaking the library.
// https://github.com/tijnjh/ios-haptics
// Keeping the $haptic function and all @mousedown handlers in place
// in case something changes...
app.config.globalProperties.$haptic = ( number ) => {
  // No-op - haptics disabled due to iOS 26.5+ restrictions
};
// VUE TIPPY
import VueTippy from "vue-tippy";
import tippySettings from './_plugins/gallery-tippy-settings.js';
app.use(VueTippy, tippySettings);
import 'tippy.js/dist/tippy.css';
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
      const migrated = helpers.methods.migrateStorageData( data );
      if ( migrated ) {
        chrome.storage.local.set({ audibledata: data.audibledata, metadata: data.metadata });
        if ( migrated.remove ) chrome.storage.local.remove( migrated.remove );
        chrome.runtime.sendMessage({ action: "rebuild-context-menu" });
      }

      // Remove stale root-level auth keys from storage (should be nested under 'auth')
      const knownStaleKeys = [ 'github_token', 'selectedRepo', 'imageEditorChunks', 'imageEditorChunksLength', 'imageEditorTimeCode', 'imageEditorPageTitle', 'imageEditorPageSubTitle' ];
      const toRemove = _.filter(_.keys(data), k => _.includes(knownStaleKeys, k) || _.startsWith(k, 'sb-'));
      if ( toRemove.length ) chrome.storage.local.remove( toRemove );
      _.each(toRemove, k => delete data[k]);

      if ( !_.isEmpty( _.get(data, 'audibledata') ) ) {
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
    const cacheID = document.querySelector('#audible-library-extractor').getAttribute('data-cache-id');
    // Validate cacheID contains only digits to prevent injection
    if (!/^\d+$/.test(cacheID)) {
      console.error('Invalid cacheID format');
      return;
    }
    fetch(`data/temp-data.${cacheID}.json`).then(res => {
      if ( !res.ok ) throw new Error(res.status);
      return res.json();
    })
    .then(tempData => {
      startVue( tempData );
    })
    .catch(() => {
      // Tries again if there's an error loading the files, but only once...
      setTimeout(function() {
        if ( !afterError ) loadJSON('afterError');
      }, 1000);
    });
  }
  
}

import vuexPrep from '@output-modules/gallery-vuex-prep.js';

function startVue( libraryData ) {
  
  let standaloneRouteData;
  _.set(libraryData, 'extras.pages', {});
  if ( standalone ) {
    standaloneRouteData = JSON.parse(JSON.stringify(libraryData));
    var cleanUp = ['library', 'series', 'collections', 'podcasts', 'wishlist'];
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
