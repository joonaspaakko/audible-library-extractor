import Vue from 'vue'
import App from './App'

const axios = require('axios');
const Url = require('domurl');
const _ = require('lodash');
global.$ = require('jquery');

global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser


chrome.storage.local.get(['library'], function( data ) {
  if ( !_.isEmpty( data.library ) ) {
    startVue( data.library );
  }
});

function startVue( libraryData ) {
  
  var ale = new Vue({
    el: '#audible-library-extractor',
    data: {
      library: libraryData
    },
    render: h => { return h(App); }
  });
  
}
