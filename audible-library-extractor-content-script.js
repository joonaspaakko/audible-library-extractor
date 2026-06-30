// chrome.storage.local.clear(); console.log( 'Chrome storage CLEARED' );
chrome.runtime.sendMessage({ pageAction: true });

import $ from "jquery"; window.$ = $;
import _ from "lodash"; window._ = _;
import axios from "axios"; window.axios = axios;
import { exponentialDelay, isNetworkOrIdempotentRequestError } from 'axios-retry'; window.exponentialDelay = exponentialDelay; window.isNetworkOrIdempotentRequestError = isNetworkOrIdempotentRequestError;
import axiosRetry from 'axios-retry'; window.axiosRetry = axiosRetry;
import { format as dateFormat } from "date-fns"; window.dateFormat = dateFormat;
import DOMPurify from "dompurify"; window.DOMPurify = DOMPurify;
import map from "async-es/map"; window.asyncMap = map;
import mapLimit from "async-es/mapLimit"; window.asyncMapLimit = mapLimit;
import waterfall from "async-es/waterfall"; window.waterfall = waterfall;
import Url from "domurl"; window.Url = Url;

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
String.prototype.decodeHTMLEntities = function() {
  return $("<textarea/>").html(this).text();
};

window.each = function( array, callback ) {
  if ( !array ) return null;
  for (var i = 0; i < array.length; i++) {
    callback( array[i], i );
  }
};

import { createApp } from 'vue';
import mitt from 'mitt';
import App from "@contscript/content-script-app.vue";
import AleLauncherButton from "@contscript-comps/layout/ale-launcher-button.vue";
import store from "@contscript/store.js";
import helpers from "@contscript-mixins/misc/content-script-helpers.js";

// Get local storage settings on load
store.commit("fromLocalStorage");
// Set settings to local storage on mutate
store.subscribe(function(mutation, state) {
  
  let payload = _.get(mutation, "payload");
      payload = _.castArray( payload );
  
  if ( mutation.type === "updateSetting" ) {
    localStorage.setItem( state.localStorageName, JSON.stringify( state.sticky ));
    return;
  }
  
  const storingSticky = _.find( payload, o => _.get(o, 'key', '').match(/^sticky./) );
  if ( storingSticky ) localStorage.setItem( state.localStorageName, JSON.stringify( state.sticky ));
  
});

// Shared across both the launcher button's own Vue app and the overlay/scraping-
// progress app mounted later: the launcher button's "start-extraction" emit is how
// the overlay app gets told to mount and begin extracting.
const compEmitter = new mitt();

function dataChecker( data, targetStore ) {

  targetStore = targetStore || store;

  // Storage data is dropped immediately. I just want to know if the data exists
  // in load so I can enable/disable things based on that info.
  // Later it's fetched again if needed.
  const audibledata = data.audibledata || {};
  const metadata = data.metadata || {};

  targetStore.commit('update', [
    { key: 'storageHasData.library', 		 value: !!audibledata.library },
    { key: 'storageHasData.isbn', 			 value: !!audibledata.library && checkISBNs( audibledata.library ) },
    { key: 'storageHasData.wishlist', 	 value: !!audibledata.wishlist },
    { key: 'storageHasData.collections', value: !!audibledata.collections },
    { key: 'storageHasData.userReviews', value: !!audibledata.userReviews },
    { key: 'storageConfig', value: metadata.config || {} },
    { key: 'dataVersion', value: metadata.version || null },
  ]);

  function checkISBNs( libraryChunks ) {
    return _.some( libraryChunks, chunk => _.some( chunk, 'isbns' ) );
  }

}

let overlayMounted = false;

// Mirrors the old jQuery button's click handler: prepend the overlay container, run
// dataChecker against current storage, install the store, and mount the app that
// renders cont-overlay -> cont-scraping-progress. Only ever mounted once;
// content-script-app.vue's own "start-extraction" listener (registered in its
// beforeMount) does the rest once the shared compEmitter receives that event.
function mountOverlayApp( data ) {

  if ( overlayMounted ) return;
  overlayMounted = true;

  $('<div>', { id: 'audible-library-extractor' }).prependTo("body");

  const app = createApp(App);

  app.config.globalProperties.$compEmitter = compEmitter;
  app.config.globalProperties.$dataChecker = function( data, targetStore ) {
    dataChecker( data, targetStore || this.$store );
  };

  app.config.productionTip = false;
  app.config.devtools = false;

  app.directive("visible", function(el, binding) {
    el.style.visibility = !!binding.value ? "visible" : "hidden";
  });

  app.use( store );

  app.mount('#audible-library-extractor');

  dataChecker( data );

}

const buttonApp = createApp(AleLauncherButton);

buttonApp.use( store );
buttonApp.config.globalProperties.$compEmitter = compEmitter;
buttonApp.config.globalProperties.$dataChecker = function( data, targetStore ) {
  dataChecker( data, targetStore || this.$store );
};
buttonApp.config.globalProperties.$takeNextStep = function( step ) {
  takeNextStep( step );
};

let librarySpot = $('.library-header-divider').next().find('#lib-subheader-actions');

// position: relative so the button (positioned absolute below) anchors to this
// container instead of the page - it does NOT also grow this container's height,
// since the button is taken out of flow entirely.
librarySpot.css({
  position: 'relative',
});

$('#center-2 > div > div').css({ marginTop: '10px' });

librarySpot.parent().css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'flex-start',
});

// top: 100% + margin-top sits the button 15px below the search input regardless of
// the input's actual height (locale/zoom dependent) - position: absolute takes it out
// of flow so it doesn't push librarySpot's (and therefore the library header's) height.
let buttonMount = $('<div>', {
  id: 'audible-library-extractor-btn',
  css: {
    position: 'absolute',
    zIndex: 10,
    top: '100%',
    right: '12px',
    marginTop: '15px',
  },
}).appendTo( librarySpot );
const buttonVm = buttonApp.mount( buttonMount[0] );

// Run once on load (mirrors the old jQuery button's click handler, which used to run
// this on every click - now the storage format migration just needs to happen before
// dataChecker reads from storage, so doing it once up front is equivalent and cheaper).
chrome.storage.local.get(null).then(( data ) => {

  const migrated = helpers.methods.migrateStorageData( data );
  if ( migrated ) {
    chrome.storage.local.set({ audibledata: data.audibledata, metadata: data.metadata });
    if ( migrated.remove ) chrome.storage.local.remove( migrated.remove );
  }

  // Populates storageHasData (drives the tree's delete-icon, partial-extraction
  // styling, etc.) as soon as the page loads - not just once extraction starts, since
  // opening the tree/menu to look at settings needs it too.
  dataChecker( data );

});

function takeNextStep( step ) {

  const config = {
    steps: _.map( _.filter( store.state.sticky.extractSettings, ( o ) => o.value && o.kind === 'main' ), ( o ) => ({ name: o.name, value: o.value }) ),
    extraSettings: _.map( _.filter( store.state.sticky.extractSettings, { kind: 'extra' }), ( o ) => ({ name: o.name, value: o.value, deactivated: false }) ),
  };

  chrome.storage.local.get(null).then(( data ) => {

    mountOverlayApp( data );
    compEmitter.emit("start-extraction", { step, config });

  });

}

// Open ALE on page load
if ( store.state.sticky.openOnLoad ) {
  chrome.storage.local.get(null).then(() => {
    store.commit('update', { key: 'sticky.openOnLoad', value: false });
    takeNextStep('extract');
  });
}

// LISTENING FOR MESSAGES FROM BACKGROUND.JS
// - Clicking the extension icon sends a message "iconClicked"
// https://developer.chrome.com/apps/messaging#simple
// https://developer.chrome.com/apps/runtime#event-onMessage
chrome.runtime.onMessage.addListener(message => {
  if (message.iconClicked) {
    takeNextStep('extract');
  }
});
