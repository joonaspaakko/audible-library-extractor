import Vue from 'vue'
import App from './App'

import VueFuse from 'vue-fuse'
Vue.use(VueFuse)
import VueLazyload from 'vue-lazyload'
Vue.use(VueLazyload)

const axios = require('axios');
const Url = require('domurl');
const _ = require('lodash');
global.$ = require('jquery');

global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser
global.Event = new Vue();

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSort } from '@fortawesome/free-solid-svg-icons'
import { faMicroscope } from '@fortawesome/free-solid-svg-icons'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { faBook } from '@fortawesome/free-solid-svg-icons'
import { faArchive } from '@fortawesome/free-solid-svg-icons'
import { faBookReader } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faSort);
library.add(faMicroscope);
library.add(faFilter);
library.add(faChevronDown);
library.add(faBook);
library.add(faArchive);
library.add(faBookReader);
Vue.component('font-awesome-icon', FontAwesomeIcon)

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
          domainExtension: data[ 'domain-extension' ],
          storePageMissing: data[ 'storage-page-missing' ],
          booksChunkLength : data[ 'books-chunk-length' ],
          books: books
        }
      };
    }( data ));
    
    startVue( data.library );
    
  }
});

function startVue( libraryData ) {
  
  var ale = new Vue({
    el: '#audible-library-extractor',
    components: {
      VueFuse
    },
    data: {
      library: libraryData
    },
    render: h => { return h(App); }
  });
  
}
