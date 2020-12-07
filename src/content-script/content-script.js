// browser.storage.local.clear(); console.log( 'Chrome storage CLEARED' );

import Vue from 'vue';
import App from './content-script-app';

Vue.config.productionTip = false;
Vue.config.devtools = false;

import _ from 'lodash';
import { format as dateFormat } from 'date-fns';
import $ from 'jquery';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import browser from 'webextension-polyfill';
import DOMPurify from 'dompurify';
import Url from 'domurl';
import waterfall from 'async-es/waterfall';
import map from 'async-es/map';

global._          = _;
global.$          = $;
global.axios      = axios;
global.axiosRetry = axiosRetry;
global.browser    = browser;
global.DOMPurify  = DOMPurify;
global.dateFormat = dateFormat;
global.Url        = Url;
global.waterfall  = waterfall;
global.asyncMap   = map;

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

// FONTAWESOME
import { library } from '@fortawesome/fontawesome-svg-core';
import { faShareSquare, faSyncAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faArrowAltCircleDown, } from '@fortawesome/free-regular-svg-icons';
library.add( faShareSquare, faSyncAlt, faArrowAltCircleDown, faTimes, );
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
Vue.component('font-awesome', FontAwesomeIcon);

// VUE-TIPPY
import VueTippy, { TippyComponent } from "vue-tippy";
Vue.use(VueTippy, {
  arrow: true,
  placement: 'top',
  trigger: "mouseenter focus",
  theme: 'light-border',
  zIndex: 9999999991,
  maxWidth: 370,
  onShow: (options) => { return !!options.props.content },
  boundary: 'viewport',
  flipDuration: 0,
});
Vue.component("tippy", TippyComponent);
import "tippy.js/themes/light-border.css";

String.prototype.trimAll = function() {
  if ( this ) { return this.trim().replace(/\s+/g,' '); }
  else { return null; }
}
String.prototype.trimToColon = function() {
  if ( this ) { return this.substring(this.indexOf(':') + 1).trim(); }
  else { return null; }
}

$(function() {
    
  let overlayBtnEl = DOMPurify.sanitize(
    `
    <span> </span>
    <h2 id="audible-library-extractor-btn" class="bc-heading bc-color-base bc-lens-heading bc-text-bold">
      <a class="bc-link bc-tab-heading bc-inline-block bc-tab-lens bc-size-title1 bc-color-secondary" tabindex="0" role="tab" aria-selected="false" href="/library/collections">
        Audible Library Extractor
      </a>
    </h2>
  `);
  
  $(overlayBtnEl).appendTo('.bc-tabs [role="tablist"]');
  
  $('#audible-library-extractor-btn').on("click", function( e ) {

    e.preventDefault();
    
    // https://developer.chrome.com/apps/storage
    // Permission: "storage"
    browser.storage.local.get(null).then( data => {
      audibleLibraryExtractor( data );
    });
      
  });
  
  // LISTENING FOR MESSAGES FROM BACKGROUND.JS
  // - Clicking the extension icon sends a message "iconClicked"
  // https://developer.chrome.com/apps/messaging#simple
  // https://developer.chrome.com/apps/runtime#event-onMessage
  browser.runtime.onMessage.addListener( message => {
    if ( message.iconClicked ) {
      // https://developer.chrome.com/apps/storage
      // Permission: "storage"
      browser.storage.local.get(null).then( data => {
        audibleLibraryExtractor( data );
      });
    }
  });
  
}); // on ready

function audibleLibraryExtractor( data ) {
  
  const appRootEl = DOMPurify.sanitize('<div id="audible-library-extractor"></div>');
  $(appRootEl).prependTo('body');
  
  const storageHasData = _.isEmpty( data ) ? false : true;
  
  new Vue({
    el: '#audible-library-extractor',
    render: h => { 
      return h(App, {
        props: {
          storageHasData: storageHasData,
        }
      }); 
    },
  });
  
}

