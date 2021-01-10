import Vue from "vue";
import App from "./output-page-app";

Vue.config.devtools = false;
Vue.config.productionTip = false;

// VUE ROUTER
import store from "./store.js";
import VueRouter from "vue-router";
Vue.use(VueRouter);

// VUE SHORTKEY
Vue.use(require("vue-shortkey"));

// VUE AUDIO
import VueAudio from "vue-audio-better";
Vue.use(VueAudio);

// VUE LAZY LOAD
import VueLazyload from "vue-lazyload";
Vue.use(VueLazyload, {
  error:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500' width='500' height='500'%3E%3Cdefs%3E%3Cstyle%3E.c%7Bfill:%23e1e1e1;%7D%3C/style%3E%3C/defs%3E%3Cpath class='c' d='M0 0h500v500H0z'/%3E%3C/svg%3E",
  loading:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500' width='500' height='500'%3E%3Cdefs%3E%3Cstyle%3E.c%7Bfill:%23e1e1e1;%7D%3C/style%3E%3C/defs%3E%3Cpath class='c' d='M0 0h500v500H0z'/%3E%3C/svg%3E",
  lazyComponent: true,
  attempt: 3,
  preload: 1
  // preload: 1.1,
  // throttleWait: 30,
  // observer: true,
});

// DOMURL
global.Url = require("domurl");

// LODASH
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
  get
} from "lodash";

// VUE ROUTER
const aleGallery = () => import( /* webpackChunkName: "gallery" */ "./_components/alePages/aleGallery");
// const aleSpreadsheet = () => import(/* webpackChunkName: "spreadsheet" */ './_components/alePages/aleSpreadsheet');
const aleCategories = () => import( /* webpackChunkName: "categories" */ "./_components/alePages/aleCategories");
const aleSeries = () => import(/* webpackChunkName: "series" */ "./_components/alePages/aleSeries");
import aleLibraryView from "./_components/aleLibraryView";

const routes = [
  { path: "/", redirect: "/gallery" },
  { name: "gallery", path: "/gallery", component: aleGallery, props: true },
  // { name: 'spreadsheet', path: '/spreadsheet', component: aleSpreadsheet, props: true },
  {
    path: "/categories",
    component: aleLibraryView,
    props: true,
    children: [
      { name: "categories", path: "", component: aleCategories, props: true },
      {
        name: "category",
        path: ":parent/:child?",
        component: aleGallery,
        props: true
      }
    ]
  },
  {
    path: "/series",
    component: aleLibraryView,
    props: true,
    children: [
      { name: "all-series", path: "", component: aleSeries, props: true },
      { name: "series", path: ":series", component: aleGallery, props: true }
    ]
  }
];

const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition && to.name === "categories") {
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
  // faBars,
  faBook,
  faBookReader,
  faCheck,
  // faCheckCircle, faInfoCircle, faExclamationTriangle, faExclamationCircle,
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
  // faPlayCircle,
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
  // faTable,
  // faTh,
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
  // faBars,
  faBook,
  faBookReader,
  faCheck,
  // faCheckCircle, faInfoCircle, faExclamationTriangle, faExclamationCircle,
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
  // faPlayCircle,
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
  // faTable,
  // faTh,
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
  startVue(JSON.parse($("#library-data").text()));
}

function vuexPrep( libraryData ) {
  
  window.localStorage.clear();

  // Overwrite sticky defaults with local storage values
  store.commit("fromLocalStorage");
  // Listen for sticky commits and push them to local storage
  store.subscribe(function(mutation, state) {
    if ( mutation.type === "stickyProp" ) {
      localStorage.setItem("aleSettings", JSON.stringify( state.sticky ));
    }
  });
  
  store.commit("prop", { key: "library", value: libraryData });
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
