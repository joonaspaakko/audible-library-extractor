import Vue from 'vue'
import App from './App'

import VueFuse from 'vue-fuse'
Vue.use(VueFuse)
import VueLazyload from 'vue-lazyload'
Vue.use(VueLazyload)

const _ = require('lodash');
global.$ = require('jquery');

global.Eventbus = new Vue();

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSort } from '@fortawesome/free-solid-svg-icons'
library.add(faSort);
import { faMicroscope } from '@fortawesome/free-solid-svg-icons'
library.add(faMicroscope);
import { faFilter } from '@fortawesome/free-solid-svg-icons'
library.add(faFilter);
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
library.add(faChevronDown);
import { faChevronUp } from '@fortawesome/free-solid-svg-icons'
library.add(faChevronUp);
import { faBook } from '@fortawesome/free-solid-svg-icons'
library.add(faBook);
import { faArchive } from '@fortawesome/free-solid-svg-icons'
library.add(faArchive);
import { faBookReader } from '@fortawesome/free-solid-svg-icons'
library.add(faBookReader);
import { faSortUp } from '@fortawesome/free-solid-svg-icons'
library.add(faSortUp);
import { faSortDown } from '@fortawesome/free-solid-svg-icons'
library.add(faSortDown);
import { faCheck } from '@fortawesome/free-solid-svg-icons'
library.add(faCheck);
import { faSquare } from '@fortawesome/free-solid-svg-icons'
library.add(faSquare);
import { faLock } from '@fortawesome/free-solid-svg-icons'
library.add(faLock);
import { faUnlockAlt } from '@fortawesome/free-solid-svg-icons'
library.add(faUnlockAlt);
import { faTable } from '@fortawesome/free-solid-svg-icons'
library.add(faTable);
import { faTh } from '@fortawesome/free-solid-svg-icons'
library.add(faTh);
import { faBars } from '@fortawesome/free-solid-svg-icons'
library.add(faBars);
import { faSun } from '@fortawesome/free-solid-svg-icons'
library.add(faSun);
import { faMoon } from '@fortawesome/free-solid-svg-icons'
library.add(faMoon);
import { faSave } from '@fortawesome/free-solid-svg-icons'
library.add(faSave);
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
library.add(faFileCsv);

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
Vue.component('font-awesome-icon', FontAwesomeIcon)

import VueTippy, { TippyComponent } from "vue-tippy";
Vue.use(VueTippy);
Vue.component("tippy", TippyComponent);
 
var standalone = $('html.standalone-gallery').length > 0;
if ( !standalone ) {

  try {
    // https://developer.chrome.com/apps/storage
    // Permission: "storage"
    browser.storage.local.get(null).then( data => {
      
      if ( !_.isEmpty( data ) ) {
        
        // Merge storage book chunks into one array
        data = (function( data ) {
          var chunkKeys = [];
          var chunkLength = data[ 'books-chunk-length' ];
          for (var i = 0; i < chunkLength; i++) {
            chunkKeys.push( 'books-chunk-'+i  );
          }
          var chunks = _.pick(data, chunkKeys);
          var books = _.values( chunks );
          books = _.flatten( books );
          return {
            library: {
              domainExtension: data[ 'domain-extension' ],
              storePageMissing: data[ 'storage-page-missing' ],
              booksChunkLength : data[ 'books-chunk-length' ],
              books: books
            }
          };
        }( data ));
        
        // Add indexes to each book object
        // _.map(data.library.books, function(obj, i) {
          //   return _.extend(obj, {
            //     index: i
            //   });
            // });
            
            startVue( data.library );
            
          }
        });
  } catch(e) {}

}
else {
  
  startVue( JSON.parse( $('#library-data').text() ) );
  
}

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
