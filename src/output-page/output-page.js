// INTERSECTION OBSERVER POLYFILL
require('intersection-observer');
IntersectionObserver.prototype.POLL_INTERVAL = 180;

// CLOSEST() POLYFILL
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;

    do {
      if (Element.prototype.matches.call(el, s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// PROMISE POLYFILL
import 'es6-promise/auto';

// VUE 
import Vue from "vue";
import App from "./output-page-app";

Vue.config.devtools = false;
Vue.config.productionTip = false;

// VUE SHORTKEY
Vue.use(require("vue-shortkey"));

// VUE AUDIO
import VueAudio from "vue-audio-better";
Vue.use(VueAudio);

// DOMURL
global.Url = require("domurl");

// LODASH
import {
  debounce,
  isEqual,
  filter,
  findIndex,
  find,
  each,
  isEmpty,
  assign,
  isArray,
  map,
  get,
  sampleSize,
  pick,
  union,
  reverse,
  maxBy,
  orderBy,
  includes,
  throttle,
  eachRight,
  flatten,
  keys,
  remove,
  startCase,
  kebabCase,
  cloneDeep,
  shuffle,
  minBy,
  range,
} from "lodash";

// VUE ROUTER
import VueRouter from "vue-router";
Vue.use(VueRouter);
import aleLibraryView from "./_components/aleLibraryView";
import VueRouterBackButton from "vue-router-back-button";

var routesPrep = function( libraryData ) {
  if ( libraryData ) {
    
    function inArray(array, value) { return array.indexOf( value  ) > -1; }
  
    let routes = [];
    
    // Home page redirect
    if ( libraryData.books ) {
      routes.push({ path: "/", redirect: "/library" },);
    }
    else if ( libraryData.wishlist ) {
      routes.push({ path: "/", redirect: "/wishlist" },);
    }
    
    const aleGallery = () => import( /* webpackPreload: true */ /* webpackChunkName: "gallery" */ "./_components/alePages/aleGallery");
    
    // LIBRARY
    if ( libraryData.books ) {
      routes.push({ name: "gallery", path: "/library", component: aleGallery, meta: { gallery: true, title: 'Library' } });
    }
    
    // SUB PAGES
    var subPages = {
      categories: {
        path: "/categories",
        component: aleLibraryView,
        children: [
          { name: "categories", path: "", component: () => import( /* webpackChunkName: "categories" */ "./_components/alePages/aleCategories"), meta: { subPage: true, title: 'Categories' } },
          { name: "category", path: ":parent/:child?", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Categories' } }
        ],
      },
      series: {
        path: "/series",
        component: aleLibraryView,
        children: [
          { name: "all-series", path: "", component: () => import( /* webpackChunkName: "series" */ "./_components/alePages/aleSeries"), meta: { subPage: true, title: 'Series' } },
          { name: "series", path: ":series", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Series' } }
        ],
      },
      authors: {
        path: "/authors",
        component: aleLibraryView,
        children: [
          { name: "authors", path: "", component: () => import( /* webpackChunkName: "authors" */ "./_components/alePages/aleAuthors"), meta: { subPage: true, title: 'Authors' } },
          { name: "author", path: ":author", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Authors' } }
        ],
      },
      narrators: {
        path: "/narrators",
        component: aleLibraryView,
        children: [
          { name: "narrators", path: "", component: () => import( /* webpackChunkName: "narrators" */ "./_components/alePages/aleNarrators"), meta: { subPage: true, title: 'Narrators' } },
          { name: "narrator", path: ":narrator", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Narrators' } }
        ],
      },
      publishers: {
        path: "/publishers",
        component: aleLibraryView,
        children: [
          { name: "publishers", path: "", component: () => import( /* webpackChunkName: "narrators" */ "./_components/alePages/alePublishers"), meta: { subPage: true, title: 'Publishers' } },
          { name: "publisher", path: ":publisher", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Publishers' } }
        ],
      },
    };
    
    // Standalone-gallery SUBPAGES
    let subPageStates = _.get( libraryData, 'extras.subPageStates' );
    if ( subPageStates ) {
      _.each(subPageStates, function( item ) {
        if ( item.enabled ) routes.push( subPages[ item.key ] );
      });
    }
    // Extension-gallery SUBPAGES
    else if ( libraryData.books ) {
      _.each(subPages, function( subPage ) {
        routes.push( subPage );
      });
    }
    
    // COLLECTIONS
    if ( libraryData.collections ) {
      routes.push({
        path: "/collections",
        component: aleLibraryView,
        children: [
          { name: "collections", path: "", component: () => import( /* webpackChunkName: "collections" */ "./_components/alePages/aleCollections"), meta: { title: 'Collections' } },
          { name: "collection", path: ":collection", component: aleGallery, meta: { gallery: true, title: 'Collections' } }
        ]
      });
    }
    
    // WISHLIST
    if ( libraryData.wishlist ) {
      routes.push({
        path: "/wishlist",
        component: aleLibraryView,
        children: [
          { name: "wishlist", path: "", component: aleGallery, meta: { gallery: true, title: 'Wishlist' } },
        ]
      });
    }
    
    routes.push({
      path: '*',
      name:'404', 
      component: aleLibraryView
    });

    const router = new VueRouter({
      routes,
      scrollBehavior(to, from, savedPosition) {
        if (savedPosition ) {
          return savedPosition;
        } else {
          if (from && to.name === from.name && _.isEqual(to.params, from.params)) {
            return;
          } else {
            return { x: 0, y: 0 };
          }
        }
      }
    });
    
    Vue.use(VueRouterBackButton, { router });
    
    return router;
  
  }
};


// FONT AWESOME
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faShoppingBag,
  faFolderOpen,
  faIndent,
  faListOl,
  faBookmark,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faArchive,
  // faArrowUp, faAngleRight, faAngleLeft, faAngleDown,
  faBars,
  faBook,
  faBookReader,
  faCheck,
  faInfoCircle,
  faCircle,
  // faCheckCircle, faExclamationTriangle, faExclamationCircle,
  // faDotCircle,
  // faEye, faEyeSlash, faCaretDown, faCaretUp, faUpload,
  // faFileCsv,
  faFilter,
  faHeart,
  faHome,
  faList,
  faLock,
  faMicroscope,
  faMoon,
  faPlay,
  faPlayCircle,
  // faPlus,
  faPlusCircle,
  // faRandom,
  faSave,
  faSearch,
  faSort,
  faSortDown,
  faSortUp,
  faSpinner,
  faSquare,
  faSun,
  faTable,
  faTh,
  faTimesCircle,
  faUnlockAlt,
  faUsers,
  faUserFriends,
  faRedoAlt,
  faTimes,
  faDownload,
  faFileCsv,
  faShareSquare,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faGoodreads,
} from "@fortawesome/free-brands-svg-icons";

library.add(
  faShoppingBag,
  faFolderOpen,
  faIndent,
  faListOl,
  faBookmark,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faArchive,
  // faArrowUp, faAngleRight, faAngleLeft, faAngleDown,
  faBars,
  faBook,
  faBookReader,
  faCheck,
  faInfoCircle,
  faCircle,
  // faCheckCircle, faExclamationTriangle, faExclamationCircle,
  // faDotCircle,
  // faEye, faEyeSlash, faCaretDown, faCaretUp, faUpload,
  // faFileCsv,
  faFilter,
  faHeart,
  faHome,
  faList,
  faLock,
  faMicroscope,
  faMoon,
  faPlay,
  faPlayCircle,
  // faPlus,
  faPlusCircle,
  // faRandom,
  faSave,
  faSearch,
  faSort,
  faSortDown,
  faSortUp,
  faSpinner,
  faSquare,
  faSun,
  faTable,
  faTh,
  faTimesCircle,
  faUnlockAlt,
  faUsers,
  faUserFriends,
  faRedoAlt,
  faTimes,
  faDownload,
  faGithub,
  faFileCsv,
  faShareSquare,
  faGoodreads,
  faBan,
);
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
Vue.component("font-awesome", FontAwesomeIcon);

// VUE TIPPY
import VueTippy, { TippyComponent } from "vue-tippy";
Vue.use(VueTippy, {
  placement: "top",
  arrow: true,
  theme: "dark",
  maxWidth: 650,
  delay: [500,0],
  onShow: options => {
    return !!options.props.content;
  },
  boundary: "viewport",
  flipDuration: 0
});
Vue.component("tippy", TippyComponent);
import "tippy.js/themes/light-border.css";

import helpers from "@contscript-mixins/misc/helpers.js";

// VUEX store
import store from "./store.js";

// UPDATING VUEX QUERIES
const updateVuexQuery = {};
updateVuexQuery.install = function (Vue) {
  Vue.prototype.$updateQuery = function( config ) {
    
    config      = config || {};
    let query   = config.query;
    let value   = config.value;
    let history = config.history;
    let queries = config.queries || this.$route.query;
    
    let queryClone = JSON.parse( JSON.stringify( queries ) );
    
    // Toggle
    if ( value === undefined ) {
      if ( queryClone[ query ] ) delete queryClone[ query ];  
      else queryClone[ query ] = true;
    }
    // Truthy value adds the value
    // Falsy value removes the query
    else {
      if ( !value ) delete queryClone[ query ]; 
      else queryClone[ query ] = value;
    }
    
    // push() writes a history state...
    if ( history ) {
      this.$router.push({ query: queryClone }).catch(() => {}); 
    }
    // replace() doesn't...
    else {
      this.$router.replace({ query: queryClone }).catch(() => {}); 
    }
    
  };
}
Vue.use( updateVuexQuery );


// GLOBAL METHODS
const globalMethods = {};
globalMethods.install = function (Vue) {
  Vue.prototype.$setListRenderingOpts = function( list ) {
    
    if ( this.$route.query.sortValues ) {
      const sortValuesIndex = _.findIndex( list.sort, { key: 'sortValues' });
      list.sort[ sortValuesIndex ].active = this.$route.query.sortValues;
    }
    
    if ( this.$route.query.sort ) {
      let currentSorter = _.find( list.sort, { current: true });
      currentSorter.current = false;
      const sortIndex = _.findIndex( list.sort, { key: this.$route.query.sort });
      if ( sortIndex > -1 ) {
        list.sort[ sortIndex ].current = true;
        list.sort[ sortIndex ].active = this.$route.query.sortDir === 'desc' ? true : false;
      }
    }
    
    if ( this.$route.query.filter ) {
      
      let paramFilters = decodeURIComponent(this.$route.query.filter).split(',');
      
      _.each( _.filter(list.filter, { type: 'filter' }), function( filter ) {
        filter.active = false;
        _.each( paramFilters, function( paramFilter ) {
          if ( filter.key === paramFilter ) filter.active = true;
        });
      });
      
    }
    
    if ( this.$route.query.filterExtras ) {
      
      let paramFilterExtras = decodeURIComponent(this.$route.query.filterExtras);
      paramFilterExtras = paramFilterExtras.split(',');
      
      _.each( paramFilterExtras, function( key ) {
        
        let splitColon = key.split(':');
        let targetKey = splitColon[0];
        let targetItem = _.find(list.filter, { type: 'filterExtras', key: targetKey });
        
        targetItem.active = true;
        
        if ( splitColon.length > 1 ) {
          let splitDash = splitColon[1].split('-');
          let min = splitDash[0];
          let max = splitDash[1];
          targetItem.range = [min, max];
        }
        
      });
      
    }
    
    if ( this.$route.query.scope ) {
      
      let paramScope = decodeURIComponent(this.$route.query.scope).split(',');
      
      _.each( list.scope, function( scope ) {
        scope.active = false;
        _.each( paramScope, function( paramScope ) {
          if ( scope.key === paramScope ) scope.active = true;
        });
      });
      
    }
    
    this.$store.commit("prop", { key: "listRenderingOpts", value: list });
    
  };
}
Vue.use( globalMethods );


const standalone = document.querySelector("html.standalone-gallery");

// APP prep
// For testing purposes: offloading JSON
var offLoadJSON = false;
// var offLoadJSON = require('./anesone-data.json');
if ( offLoadJSON ) {
  startVue( offLoadJSON );
}
// In the extension environment...
else if (!standalone) {
  try {
    // https://developer.chrome.com/apps/storage
    // Permission: "storage"
    browser.storage.local.get(null).then(data => {
      if (!_.isEmpty(data) && data.chunks) {
        helpers.methods.glueFriesBackTogether(data);
        // This "data.config" is used in the content script, but unnecessary here.
        // It's getting deleted to avoid passing it on to the locally saved gallery.
        delete data.config;
        startVue(data);
      } else {
        alert("No existing data found: scan your library again.");
      }
    });
  } catch (e) {}
} 
// As a standalone website...
else {
  startVue( JSON.parse(document.querySelector("#library-data").textContent) );
}

function vuexPrep( libraryData ) {
  
  // window.localStorage.clear();

  // Overwrite sticky defaults with local storage values
  store.commit("fromLocalStorage");
  // Listen for sticky commits and push them to local storage
  store.subscribe(function(mutation, state) {
    if ( mutation.type === "stickyProp" ) {
      localStorage.setItem("aleSettings", JSON.stringify( state.sticky ));
    }
  });
  
  store.commit("prop", { key: "library", value: libraryData, freeze: true });
  store.commit("prop", { key: "standalone", value: standalone });
  store.commit("prop", { key: "displayMode", value: window.matchMedia("(display-mode: standalone)").matches });
  store.commit("prop", { key: "urlOrigin", value: "https://audible" + libraryData.extras["domain-extension"] });

}

function startVue( libraryData ) {
  
  vuexPrep( libraryData );
  const router = routesPrep( libraryData );
  
  new Vue({
    router,
    el: "#audible-library-extractor",
    store: store,
    render: h => {
      return h(App, {
        // props: {
        //   isStandalone: standalone,
        //   library: libraryData,
        // }
      });
    }
  });
  
}
