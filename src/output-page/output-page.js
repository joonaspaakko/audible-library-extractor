
import Vue from 'vue'
import App from './App'

Vue.config.devtools = false;
Vue.config.productionTip = false;

import VueRouter from 'vue-router'
Vue.use(VueRouter)
import VueFuse from 'vue-fuse'
Vue.use(VueFuse)
import VueLazyload from 'vue-lazyload'
Vue.use(VueLazyload, {
  error:   "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500' width='500' height='500'%3E%3Cdefs%3E%3Cstyle%3E.c%7Bfill:%23e1e1e1;%7D%3C/style%3E%3C/defs%3E%3Cpath class='c' d='M0 0h500v500H0z'/%3E%3C/svg%3E",
  loading: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500' width='500' height='500'%3E%3Cdefs%3E%3Cstyle%3E.c%7Bfill:%23e1e1e1;%7D%3C/style%3E%3C/defs%3E%3Cpath class='c' d='M0 0h500v500H0z'/%3E%3C/svg%3E",
  attempt: 3,
  lazyComponent: true,
})
import VueAudio from 'vue-audio-better'
Vue.use(VueAudio)
Vue.use(require('vue-shortkey'));

global.Url = require('domurl');
global.$ = require('jquery');
global.DOMPurify = require('dompurify');

import { 
  filter, 
  find, 
  each, 
  orderBy, 
  isEmpty, 
  pick, 
  flatten, 
  values, 
  sampleSize, 
  map, 
  findIndex, 
  union, 
  keys, 
  remove, 
  includes, 
  startCase, 
  kebabCase, 
  has,
  isArray,
  shuffle,
  reverse,
  clone,
  isEqual,
  chunk,
  debounce,
} from 'lodash';

global.Eventbus = new Vue();

const aleGallery = () => import(/* webpackChunkName: "gallery" */ './_components/alePages/aleGallery');
const aleSpreadsheet = () => import(/* webpackChunkName: "spreadsheet" */ './_components/alePages/aleSpreadsheet');
const aleCategories = () => import(/* webpackChunkName: "categories" */ './_components/alePages/aleCategories');
const aleSeries = () => import(/* webpackChunkName: "series" */ './_components/alePages/aleSeries');
import aleLibraryView from './_components/aleLibraryView'

const routes = [
  { path: '/', redirect: '/gallery'},
  { name: 'ale-gallery', path: '/gallery', component: aleGallery, props: true },
  { name: 'ale-spreadsheet', path: '/spreadsheet', component: aleSpreadsheet, props: true },
  { path: '/categories', component: aleLibraryView, props: true, 
    children: [
      { name: 'ale-categories', path: '', component: aleCategories, props: true },
      { name: 'ale-category', path: ':parent/:child?', component: aleGallery, props: true },
    ] 
  },
  { path: '/series', component: aleLibraryView, props: true, 
    children: [
      { name: 'ale-all-series', path: '', component: aleSeries, props: true },
      { name: 'ale-series', path: ':series', component: aleGallery, props: true },
    ] 
  },
];

const router = new VueRouter({
  routes, 
  scrollBehavior(to, from, savedPosition) {
    if ( savedPosition && to.name === 'ale-categories' ) {
      return savedPosition;
    } else {
      
      if (from && to.name === from.name && _.isEqual(to.params, from.params)) {
        return;
      }
      else {
        return { x: 0, y: 0 };
      }
      
    }
  },
});

import VueRouterBackButton from 'vue-router-back-button'
Vue.use(VueRouterBackButton, { router })

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faSort, 
  faMicroscope, 
  faFilter, 
  faChevronLeft, 
  faChevronRight, 
  faChevronDown, 
  faChevronUp, 
  faBook, 
  faArchive, 
  faBookReader, 
  faSortUp, 
  faSortDown, 
  faCheck, 
  faSquare, 
  faLock, 
  faUnlockAlt, 
  faTable, 
  faTh, 
  faBars, 
  faSun, 
  faMoon, 
  faSave, 
  faFileCsv, 
  faRandom, 
  faSearch, 
  faList, 
  faHome, 
  faPlay, 
  faTimesCircle, 
  faSpinner, 
  faCheckCircle, faInfoCircle, faExclamationTriangle, faExclamationCircle,
  faArrowUp, faAngleRight, faAngleLeft, faAngleDown,
  faEye, faEyeSlash, faCaretDown, faCaretUp, faUpload,
} from '@fortawesome/free-solid-svg-icons' 

library.add(
  faSort,
  faMicroscope,
  faFilter,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faBook,
  faArchive,
  faBookReader,
  faSortUp,
  faSortDown,
  faCheck,
  faSquare,
  faLock,
  faUnlockAlt,
  faTable,
  faTh,
  faBars,
  faSun,
  faMoon,
  faSave,
  faFileCsv,
  faRandom,
  faSearch,
  faList,
  faHome,
  faPlay,
  faTimesCircle,
  faSpinner, 
  faCheckCircle, faInfoCircle, faExclamationTriangle, faExclamationCircle,
  faArrowUp, faAngleRight, faAngleLeft, faAngleDown,
  faEye, faEyeSlash, faCaretDown, faCaretUp, faUpload,
);
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
Vue.component('font-awesome', FontAwesomeIcon);


import VueTippy, { TippyComponent } from "vue-tippy";
Vue.use(VueTippy, {
  arrow: true,
  onShow: (options) => {
    return !!options.props.content
  },
});
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

        // console.log(_.map(data.library.books, 'length'))
        startVue( data.library );
        
      }
      else {
        alert("No existing data found: scan your library again.");
      }
    });
  } catch(e) {}

}
else {
  
  startVue( JSON.parse( $('#library-data').text() ) );
  
}

function startVue( libraryData ) {
  
  var ale = new Vue({
    router,
    el: '#audible-library-extractor',
    components: {
      VueFuse
    },
    data: {
      library: libraryData
    },
    render: h => {
      return h(App); 
    }
  });
  
}
