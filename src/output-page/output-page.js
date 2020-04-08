import Vue from 'vue'
import App from './App'

const axios = require('axios');
const Url = require('domurl');
const _ = require('lodash');
global.$ = require('jquery');

global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser


chrome.storage.local.get(null, function( data ) {
  
  
  if ( !_.isEmpty( data ) ) {
    
    // Merge storage book chunks into one array
    data = (function( data ) {
      console.log( data );
      var chunkKeys = [];
      var chunkLength = data[ 'books-chunk-length' ];
      for (var i = 0; i < chunkLength; i++) {
        chunkKeys.push( 'books-chunk-'+i  );
      }
      var chunks = _.pick(data, chunkKeys);
      var books = _.values( chunks );
      books = _.flatten( books );
      // delete chunkLength;
      // console.log( chunkLength );
      // var test = _.values( data );
      // console.log( test );
      return {
        library: {
          books: books,
          storePageMissing: data[ 'storage-page-missing' ]
        }
      };
    }( data ));
    
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
