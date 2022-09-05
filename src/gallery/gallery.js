const standalone = document.querySelector("html.standalone-gallery");

// VUE 
import Vue from "vue";
import VueCompositionAPI from '@vue/composition-api';
Vue.use(VueCompositionAPI);

// DOMURL
global.Url = require("domurl");

// LODASH
import _ from "lodash";
global._ = _;

import App from "./gallery-app.vue";
import "normalize.css/normalize.css";

Vue.config.devtools = false;
Vue.config.productionTip = false;

// VUE SHORTKEY
Vue.use(require("vue-shortkey"));
// VUE ROUTER
import VueRouter from "vue-router";
Vue.use(VueRouter);
import loadRoutes from '@output-modules/load-routes.js';
// UPDATING VUEX QUERIES
import updateRouterQueries from './_plugins/update-router-query.js';
Vue.use( updateRouterQueries );
// VUEX store
import store from "@output-modules/store/index.js";
// VUE TIPPY
import VueTippy, { TippyComponent } from "vue-tippy";
import tippySettings from './_plugins/tippy-settings.js';
Vue.use(VueTippy, tippySettings);
Vue.component("tippy", TippyComponent);
import "tippy.js/themes/light-border.css";
// FONT AWESOME
import fontawesomeWrapper from './_plugins/font-awesome-wrapper.js';
Vue.component("font-awesome", fontawesomeWrapper);
// LONG PRESS
import longPress from './_plugins/long-press.js';
Vue.directive('longpress', longPress);
// GLOBAL METHODS
import setListRenderingOptions from './_plugins/set-list-rendering-options.js'
Vue.use( setListRenderingOptions );

// HELPER METHODS (from content script)
import helpers from "@contscript-mixins/misc/helpers.js";

// APP PREP
// For testing side loading JSON
var sideLoadJSON = false;
// var sideLoadJSON = require('./test-data.json');
// var sideLoadJSON = require('./test-data-2.json');
if ( sideLoadJSON ) {
  startVue( sideLoadJSON );
}
// In the extension environment...
else if (!standalone) {
  try {
    // https://developer.chrome.com/apps/storage
    // Permission: "storage"
    browser.storage.local.get(null).then(data => {
      if (!_.isEmpty(data) && data.chunks) {
        helpers.methods.glueFriesBackTogether(data);
        startVue(data);
      } else {
        alert("No existing data found: scan your library again.");
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

import vuexPrep from '@output-modules/vuex-prep.js';

function startVue( libraryData ) {
  
  let standaloneRouteData;
  libraryData.extras.pages = libraryData.extras.pages || {};
  if ( standalone ) {
    standaloneRouteData = JSON.parse(JSON.stringify(libraryData));
    var cleanUp = ['books', 'series', 'collections', 'wishlist'];
    _.each(cleanUp, function( key ) {
      if ( _.get(libraryData, key) === true ) {
        delete libraryData[ key ];
        _.set( libraryData, 'extras.pages.books', true );
        libraryData.extras.pages.books = true;
      }
    });
    // if ( libraryData.books       === true ) { delete libraryData.books;       libraryData.extras.pages.books = true;       }
    // if ( libraryData.series      === true ) { delete libraryData.series;      libraryData.extras.pages.series = true;      }
    // if ( libraryData.collections === true ) { delete libraryData.collections; libraryData.extras.pages.collections = true; }
    // if ( libraryData.wishlist    === true ) { delete libraryData.wishlist;    libraryData.extras.pages.wishlist = true;    }
  }
  
  vuexPrep( libraryData );
  let router = loadRoutes( standaloneRouteData || libraryData );
  
  new Vue({
    router,
    el: "#audible-library-extractor",
    store: store,
    render: h => {
      return h(App, {
        // props: {
        //   version: version
        // }
      });
    }
  });
  
}
