const standalone = document.querySelector("html.standalone-gallery");

// VUE 
import Vue from "vue";
import VueCompositionAPI from '@vue/composition-api';
Vue.use(VueCompositionAPI);
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
  clone,
  cloneDeep,
  shuffle,
  minBy,
  range,
  unionBy,
  chunk,
} from "lodash";

// VUE ROUTER
import VueRouter from "vue-router";
Vue.use(VueRouter);
import aleLibraryView from "./_components/aleLibraryView";

let routesPrep = function( libraryData ) {
  if ( libraryData ) {
    
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
          { name: "categories", path: "", component: () => import( /* webpackChunkName: "categories" */ "./_components/alePages/subPages/aleCategories"), meta: { subPage: true, title: 'Categories' } },
          { name: "category", path: ":parent/:child?", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Categories' } }
        ],
      },
      series: {
        path: "/series",
        component: aleLibraryView,
        children: [
          { name: "all-series", path: "", component: () => import( /* webpackChunkName: "series" */ "./_components/alePages/subPages/aleSeries"), meta: { subPage: true, title: 'Series' } },
          { name: "series", path: ":series", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Series' } }
        ],
      },
      authors: {
        path: "/authors",
        component: aleLibraryView,
        children: [
          { name: "authors", path: "", component: () => import( /* webpackChunkName: "authors" */ "./_components/alePages/subPages/aleAuthors"), meta: { subPage: true, title: 'Authors' } },
          { name: "author", path: ":author", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Authors' } }
        ],
      },
      narrators: {
        path: "/narrators",
        component: aleLibraryView,
        children: [
          { name: "narrators", path: "", component: () => import( /* webpackChunkName: "narrators" */ "./_components/alePages/subPages/aleNarrators"), meta: { subPage: true, title: 'Narrators' } },
          { name: "narrator", path: ":narrator", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Narrators' } }
        ],
      },
      publishers: {
        path: "/publishers",
        component: aleLibraryView,
        children: [
          { name: "publishers", path: "", component: () => import( /* webpackChunkName: "publishers" */ "./_components/alePages/subPages/alePublishers"), meta: { subPage: true, title: 'Publishers' } },
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
    else if ( libraryData.books || libraryData.wishlist ) {
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
    
    // Tries to load relevant JSON data from a file before each route change on the standalone site
    if ( standalone ) {
      
      function loadScript(file) {
        return new Promise(function(resolve, reject) {
          let script = document.createElement('script');
          script.src = (file.prefix || "data/") + file.name +"."+ libraryData.extras.cacheID +".js";
          script.type = "text/javascript";
          script.onload = function() {
            resolve(file);
            script = null;
          };
          script.onerror = function() {
            reject(file);
            script = null;
          };
          document.body.appendChild(script);
        });
      }
      
      let getJSON = function( next, files, afterError ) {
        
        // Exclude JSON that's already been loaded
        files = _.filter( files, function( file ){ return window[file.name+'JSON'] !== true; });
        
        // save all Promises as array
        let promises = [];
        files.forEach(function(file) {
          promises.push(loadScript(file));
        });
        
        Promise.all(promises).catch(function() {
          if ( !afterError ) {
            setTimeout(function() {
              getJSON( next, files, 'afterError' );
            }, 1000);
          }
        }).finally(function() {
          
          let storageArray = _.map( files, function( file ) { 
            return {
              key: (file.keyOverride || file.name),
              value: window[file.name+'JSON'],
            }; 
          });
          store.commit("buildStandaloneData", storageArray);
          _.each( files, function( file ) { window[file.name+'JSON'] = true; });
          next();
          
        });
        
      };
      
      
      router.beforeEach((to, from, next) => {
                
        if ( 
          from.name !== to.name || 
          _.get(from, 'query.book') !== _.get(to, 'query.book') || 
          from.query.subPageSource !== to.query.subPageSource 
        ) {
          
          if ( to.meta.subPage ) {
            if ( to.query.subPageSource === 'wishlist' || !to.query.subPageSource && store.state.sticky.subPageSource === 'wishlist' ) {
              getJSON( next, [
                {name: 'wishlist'},
                {name: 'series'},
                {name: 'collections'},
              ]);
            }
            else {
              getJSON( next, [
                {name: 'library', keyOverride: 'books'}, 
                {name: 'series'},
                {name: 'collections'},
              ]);
            }
          }
          else {
            switch( to.name ) {
              case 'gallery':
                getJSON( next, [
                  {name: 'library', keyOverride: 'books'}, 
                  {name: 'series'},
                  {name: 'collections'},
                ]);
                break;
              case 'collections':
              case 'collection':
                getJSON( next, [
                  {name: 'library', keyOverride: 'books'}, 
                  {name: 'series'},
                  {name: 'collections'},
                ]);  
                break;
              case 'wishlist':
                getJSON( next, [
                  {name: 'wishlist'},
                  {name: 'series'},
                  {name: 'collections'},
                ]);
                break;
              default:
                next();
            }
          }
        
        }
        else { next(); }
      });
      
    }
    
    router.afterEach((to, from, next) => {
      if ( from.name !== to.name ) {
        
        const navForward = store.state.navHistory.forward;
        const navBack = store.state.navHistory.back;
        
        if ( 
          from.name && from.name !== navForward[ navForward.length-1]  && from.name !== navBack[ navBack.length-1 ] 
        ) {
          store.commit('navHistory', { key: 'back', value: from.name, pushOnly: true });
        }
        
        if ( !store.state.navHistory.btnNavigation ) store.commit('prop', { key: 'navHistory.forward', value: [] });
        store.commit('prop', { key: 'navHistory.btnNavigation', value: false });
        
      }
    });
    
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
  faMinusCircle,
  faHeadphonesAlt,
  faImages,
  faGraduationCap,
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
  faMinusCircle,
  faHeadphonesAlt,
  faImages,
  faGraduationCap,
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
  a11y: false,
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
      
      let paramFilterExtras = this.$route.query.filterExtras.split(',');
      paramFilterExtras = _.map( paramFilterExtras, function( param ) { return decodeURIComponent(param); });
      
      _.each( paramFilterExtras, function( key ) {
        
        let splitColon = key.split(':');
        let targetKey = splitColon[0];
        let targetItem = _.find(list.filter, { type: 'filterExtras', key: targetKey });
        
        if ( targetItem ) {
          targetItem.active = true;
          if ( splitColon.length > 1 ) {
            
            if ( targetItem.dropdownOpts ) {
              targetItem.value = splitColon[1].split('|');
            }
            else if ( targetItem.range ) {
              let splitDash = splitColon[1].split('-');
              let min = parseFloat( splitDash[0] );
              let max = parseFloat( splitDash[1] );
              targetItem.range = [min, max];
            }
          }
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

// APP prep
// For testing side loading JSON
var sideLoadJSON = false;
// var sideLoadJSON = require('./test-data.json');
// var sideLoadJSON = require('./test-data-2.json');
if ( sideLoadJSON ) {
  startVue( sideLoadJSON );
}
// In the extension environment...
else if (!standalone) {
  try {
    // https://developer.chrome.com/apps/storage
    // Permission: "storage"
    browser.storage.local.get(null).then(data => {
      if (!_.isEmpty(data) && data.chunks) {
        helpers.methods.glueFriesBackTogether(data);
        startVue(data);
      } else {
        alert("No existing data found: scan your library again.");
      }
    });
  } catch (e) {}
} 
// As a standalone website...
else {
  
  let vue = this;
  loadJSON();
  function loadJSON( afterError ) {
    let scrpt = document.createElement("script");
    let cacheID = document.querySelector('#audible-library-extractor').getAttribute('data-cache-id');
    scrpt.src = "data/temp-data."+ cacheID +".js";
    scrpt.type = "text/javascript";
    scrpt.onload = function() {
      
      let tempData = window.tempDataJSON;
      window.bookSummaryJSON = true;
      
      scrpt = null;
      startVue( tempData );
      
    };
    // Tries again if there's an error loading the files, but only once...
    scrpt.onerror = function() {
      scrpt = null;
      setTimeout(function() {
        if ( !afterError ) loadJSON('afterError'); // Try twice...
      }, 1000);
    };
    document.head.appendChild(scrpt);
  }
  
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
  
  
  store.commit("prop", [
    { key: "library", value: libraryData, freeze: standalone ? false : true },
    { key: "standalone", value: !!standalone },
    { key: "displayMode", value: window.matchMedia("(display-mode: standalone)").matches },
    { key: "urlOrigin", value: "https://audible" + libraryData.extras["domain-extension"] },
    { key: "extractSettings", value: libraryData.config },
  ]);
  
  if      ( !libraryData.extras.pages.wishlist ) store.commit("stickyProp", { key: "subPageSource", value: 'books'    });
  else if ( !libraryData.extras.pages.books    ) store.commit("stickyProp", { key: "subPageSource", value: 'wishlist' });
  
  if ( !libraryData.books && libraryData.wishlist ) store.commit("stickyProp", { key: "subPageSource", value: 'wishlist' });
  
  const { version } = require('../../package.json');
  store.commit("prop", { key: "version", value: version });

}

function startVue( libraryData ) {
  
  let standaloneRouteData;
  libraryData.extras.pages = libraryData.extras.pages || {};
  if ( standalone ) {
    standaloneRouteData = JSON.parse(JSON.stringify(libraryData));
    if ( libraryData.books       === true ) { delete libraryData.books;       libraryData.extras.pages.books = true;       }
    if ( libraryData.series      === true ) { delete libraryData.series;      libraryData.extras.pages.series = true;      }
    if ( libraryData.collections === true ) { delete libraryData.collections; libraryData.extras.pages.collections = true; }
    if ( libraryData.wishlist    === true ) { delete libraryData.wishlist;    libraryData.extras.pages.wishlist = true;    }
  }
  
  vuexPrep( libraryData );
  let router = routesPrep( standaloneRouteData || libraryData );
  
  new Vue({
    router,
    el: "#audible-library-extractor",
    store: store,
    render: h => {
      return h(App, {
        // props: {
        //   version: version
        // }
      });
    }
  });
  
}
