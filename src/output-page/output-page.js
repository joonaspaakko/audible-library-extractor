
import Vue from 'vue';
import App from './output-page-app';

Vue.config.devtools = false;
Vue.config.productionTip = false;

import store from './store.js';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

Vue.use(require('vue-shortkey'));

import VueAudio from 'vue-audio-better';
Vue.use( VueAudio );

import VueLazyload from 'vue-lazyload';
Vue.use(VueLazyload, {
  error:   "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500' width='500' height='500'%3E%3Cdefs%3E%3Cstyle%3E.c%7Bfill:%23e1e1e1;%7D%3C/style%3E%3C/defs%3E%3Cpath class='c' d='M0 0h500v500H0z'/%3E%3C/svg%3E",
  loading: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500' width='500' height='500'%3E%3Cdefs%3E%3Cstyle%3E.c%7Bfill:%23e1e1e1;%7D%3C/style%3E%3C/defs%3E%3Cpath class='c' d='M0 0h500v500H0z'/%3E%3C/svg%3E",
  lazyComponent: true,
  attempt: 3,
  preload: 1,
  // preload: 1.1,
  // throttleWait: 30,
  // observer: true,
});


global.Url = require('domurl');
global.$ = require('jquery');
global.DOMPurify = require('dompurify');

import smoothscroll from 'smoothscroll-polyfill';
smoothscroll.polyfill();

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
  throttle,
  assign,
} from 'lodash';

global.Eventbus = new Vue();

const aleGallery = () => import(/* webpackChunkName: "gallery" */ './_components/alePages/aleGallery');
const aleSpreadsheet = () => import(/* webpackChunkName: "spreadsheet" */ './_components/alePages/aleSpreadsheet');
const aleCategories = () => import(/* webpackChunkName: "categories" */ './_components/alePages/aleCategories');
const aleSeries = () => import(/* webpackChunkName: "series" */ './_components/alePages/aleSeries');
import aleLibraryView from './_components/aleLibraryView'

const routes = [
  { path: '/', redirect: '/gallery'},
  { name: 'gallery', path: '/gallery', component: aleGallery, props: true },
  { name: 'spreadsheet', path: '/spreadsheet', component: aleSpreadsheet, props: true },
  { path: '/categories', component: aleLibraryView, props: true, 
    children: [
      { name: 'categories', path: '', component: aleCategories, props: true },
      { name: 'category', path: ':parent/:child?', component: aleGallery, props: true },
    ] 
  },
  { path: '/series', component: aleLibraryView, props: true, 
    children: [
      { name: 'all-series', path: '', component: aleSeries, props: true },
      { name: 'series', path: ':series', component: aleGallery, props: true },
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
  faPlayCircle, 
  faTimesCircle, 
  faSpinner, 
  faCheckCircle, faInfoCircle, faExclamationTriangle, faExclamationCircle,
  faArrowUp, faAngleRight, faAngleLeft, faAngleDown,
  faEye, faEyeSlash, faCaretDown, faCaretUp, faUpload,
  faHeart,
  faPlus,
  faDotCircle,
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
  faPlayCircle,
  faTimesCircle,
  faSpinner, 
  faCheckCircle, faInfoCircle, faExclamationTriangle, faExclamationCircle,
  faArrowUp, faAngleRight, faAngleLeft, faAngleDown,
  faEye, faEyeSlash, faCaretDown, faCaretUp, faUpload,
  faHeart,
  faPlus,
  faDotCircle,
);
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
Vue.component('font-awesome', FontAwesomeIcon);


import VueTippy, { TippyComponent } from "vue-tippy";
Vue.use(VueTippy, {
  placement: 'top',
  arrow: true,
  theme: 'dark',
  onShow: (options) => {
    return !!options.props.content
  },
  boundary: 'viewport',
  flipDuration: 0,
});

Vue.component("tippy", TippyComponent);
import "tippy.js/themes/light-border.css";

import helpers from '@contscript-mixins/misc/helpers.js';

const standalone = $('html.standalone-gallery').length > 0;
if ( !standalone ) {

  try {
    // https://developer.chrome.com/apps/storage
    // Permission: "storage"
    browser.storage.local.get(null).then( data => {
      
      if ( !_.isEmpty( data ) && data.chunks ) {
        
        helpers.methods.glueFriesBackTogether( data ); 
         // This "data.config" is used in the content script, but unnecessary here.
         // It's getting deleted to avoid passing it on to the locally saved gallery.
        delete data.config;
        startVue( data );
        
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
    store: store,
    render: h => {
      return h( App, {
        props: {
          isStandalone: standalone,
          library: libraryData,
        }
      }); 
    }
  });
  
  global.ale = ale;
  
}
