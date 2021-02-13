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
  filter,
  find,
  each,
  orderBy,
  isEmpty,
  flatten,
  sampleSize,
  map,
  findIndex,
  union,
  keys,
  remove,
  includes,
  startCase,
  kebabCase,
  isArray,
  shuffle,
  clone,
  isEqual,
  debounce,
  throttle,
  assign,
  get,
  values,
} from "lodash";

// VUE ROUTER
import VueRouter from "vue-router";
Vue.use(VueRouter);

const aleGallery = () => import( /* webpackPreload: true */ /* webpackChunkName: "gallery" */ "./_components/alePages/aleGallery");
const aleCategories = () => import( /* webpackChunkName: "categories" */ "./_components/alePages/aleCategories");
const aleCollections = () => import( /* webpackChunkName: "collections" */ "./_components/alePages/aleCollections");
const aleSeries = () => import( /* webpackChunkName: "series" */ "./_components/alePages/aleSeries");
import aleLibraryView from "./_components/aleLibraryView";

const routes = [
  { path: "/", redirect: "/library" },
  { name: "gallery", path: "/library", component: aleGallery },
  {
    path: "/categories",
    component: aleLibraryView,
    children: [
      { name: "categories", path: "", component: aleCategories },
      { name: "category", path: ":parent/:child?", component: aleGallery }
    ]
  },
  {
    path: "/series",
    component: aleLibraryView,
    children: [
      { name: "all-series", path: "", component: aleSeries },
      { name: "series", path: ":series", component: aleGallery }
    ]
  },
  {
    path: "/collections",
    component: aleLibraryView,
    children: [
      { name: "collections", path: "", component: aleCollections },
      { name: "collection", path: ":collection", component: aleGallery }
    ]
  },
  {
    path: "/wishlist",
    component: aleLibraryView,
    children: [
      { name: "wishlist", path: "", component: aleGallery },
    ]
  },
];

const router = new VueRouter({
  routes,
  base: '/output-page/',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition && (to.name === "categories" || to.name === "all-series" || to.name === "collections") ) {
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

// import VueRouterBackButton from "vue-router-back-button";
// Vue.use(VueRouterBackButton, { router });

// FONT AWESOME
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faChevronDown,
  // faChevronLeft,
  // faChevronRight,
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
  faFileCsv,
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
  // faSpinner,
  faSquare,
  faSun,
  faTable,
  faTh,
  faTimesCircle,
  // faUnlockAlt,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faChevronDown,
  // faChevronLeft,
  // faChevronRight,
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
  faFileCsv,
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
  // faSpinner,
  faSquare,
  faSun,
  faTable,
  faTh,
  faTimesCircle,
  // faUnlockAlt,
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
      
      _.each( list.filter, function( filter ) {
        filter.active = false;
        _.each( paramFilters, function( paramFilter ) {
          if ( filter.key === paramFilter ) filter.active = true;
        });
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


// APP prep
const standalone = document.querySelector("html.standalone-gallery");
if (!standalone) {
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
} else {
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
