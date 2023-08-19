// chrome.storage.local.clear(); console.log( 'Chrome storage CLEARED' );
chrome.runtime.sendMessage({ pageAction: true });

import $ from "jquery"; window.$ = $;
import _ from "lodash"; window._ = _;
import axios from "axios"; window.axios = axios;
import { exponentialDelay, isNetworkOrIdempotentRequestError } from 'axios-retry'; window.exponentialDelay = exponentialDelay; window.isNetworkOrIdempotentRequestError = isNetworkOrIdempotentRequestError;
import axiosRetry from 'axios-retry'; window.axiosRetry = axiosRetry;
import { format as dateFormat } from "date-fns"; window.dateFormat = dateFormat;
import DOMPurify from "dompurify"; window.DOMPurify = DOMPurify;
import map from "async-es/map"; window.asyncMap = map;
import mapLimit from "async-es/mapLimit"; window.asyncMapLimit = mapLimit;
import waterfall from "async-es/waterfall"; window.waterfall = waterfall;
import Url from "domurl"; window.Url = Url;

String.prototype.trimAll = function() {
  if (this) {
    return this.trim().replace(/\s+/g, " ");
  } else {
    return null;
  }
};
String.prototype.trimToColon = function() {
  if (this) {
    return this.substring(this.indexOf(":") + 1).trim();
  } else {
    return null;
  }
};
String.prototype.decodeHTMLEntities = function() {
  return $("<textarea/>").html(this).text();
};

window.each = function( array, callback ) {
  if ( !array ) return null;
  for (var i = 0; i < array.length; i++) {
    callback( array[i], i );
  }
};

import { createApp } from 'vue';
import App from "@contscript/content-script-app.vue";
import store from "@contscript/store.js";

// Get local storage settings on load
store.commit("fromLocalStorage");
// Set settings to local storage on mutate
store.subscribe(function(mutation, state) {
  
  let payload = _.get(mutation, "payload");
      payload = _.castArray( payload );
  
  if ( mutation.type === "updateSetting" ) {
    localStorage.setItem( state.localStorageName, JSON.stringify( state.sticky ));
    return;
  }
  
  const storingSticky = _.find( payload, o => _.get(o, 'key', '').match(/^sticky./) );
  if ( storingSticky ) localStorage.setItem( state.localStorageName, JSON.stringify( state.sticky ));
  
});

const app = createApp(App);

// For emitting custom events between components
import mitt from 'mitt';
app.config.globalProperties.$compEmitter = new mitt();


app.config.globalProperties.$dataChecker = function( data, store ) {
  
  store = this.$store || store;
  
  // Storage data is dropped immediately. I just want to know if the data exists
  // in load so I can enable/disable things based on that info.
  // Later it's fetched again if needed.
  const dataChunks = _.get(data, 'chunks', []);
  const storageHasData = dataChunks.length > 0;
  store.commit('update', [
    { key: 'storageHasData.books', 			 value: dataChunks.indexOf('books') > -1 },
    { key: 'storageHasData.isbn', 			 value: dataChunks.indexOf('isbn') > -1 ? checkISBNs( data ) : false },
    { key: 'storageHasData.wishlist', 	 value: dataChunks.indexOf('wishlist') > -1 },
    { key: 'storageHasData.collections', value: dataChunks.indexOf('collections') > -1 },
    { key: 'storageConfig', value: data.config || {} },
    { key: 'dataVersion', value: data.version || null },
  ]);
  
  function checkISBNs( data ) {
    
    let foundISBNs = false;
    _.each( _.range( 0, data['books-chunk-length'] ), function( index ) {
      
      const booksChunk = data['books-chunk-'+index];
      const isbns = _.find( booksChunk, 'isbns' );
      if ( isbns ) {
        foundISBNs = true;
        return false;
      }
      
    });
    
    return foundISBNs;
    
  }
  
};

import Toaster from "@meforma/vue-toaster";
app.use(Toaster);

// VUE-TIPPY
import VueTippy from "vue-tippy";
app.use(VueTippy, {
	directive: 'tippy', // => v-tippy
	component: 'tippy', // => <tippy/>
	componentSingleton: 'tippy-singleton', // => <tippy-singleton/>,
	defaultProps: {
		placement: 'auto-end',
		allowHTML: true,
		arrow: true,
		placement: "top",
		trigger: "mouseenter focus",
		theme: "light-border",
		zIndex: 9999999991,
		delay: [500,0],
		a11y: false,
		maxWidth: 670,
		onShow: options => {
			return !!options.props.content;
		},
		boundary: "viewport",
		flipDuration: 0
	}, // => Global default options * see all props
});
import 'tippy.js/dist/tippy.css';

// import Buefy from "buefy";
// import "buefy/dist/buefy.css";
// app.use(Buefy, {
//   defaultIconComponent: "font-awesome",
//   defaultIconPack: "fas"
// });

app.config.productionTip = false;
app.config.devtools = false;

let overlayBtnLink = $('<a>', {
  id: 'audible-library-extractor-btn',
  class: 'bc-link bc-tab-heading bc-inline-block bc-tab-lens bc-size-title1 bc-color-secondary', 
  tabindex: '0',
  role: 'tab',
  'aria-selected': false,
  href: '#',
  text: 'Audible Library Extractor',
  css: { 
    height: '33px',
    lineHeight: '33px',
    fontSize: '14px',
    padding: '0 4px 0 15px',
    borderRadius: '4px',
    textDecoration: 'none',
    background: '#f7991c',
    color: '#fff',
    boxShadow: '0 2px 4px rgb(0 0 0 / 10%), 0 2px 10px rgb(0 0 0 / 10%)',
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: '900',
    width: '232px',
    margin: '10px 0px -8px',
    // margin: '0 0 10px 0',
    // position: 'absolute',
    // top: '54px',
  },
});

let librarySpot = $('.library-header-divider').next().find('#lib-subheader-actions');

librarySpot.css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'center',
});
overlayBtnLink.appendTo( librarySpot );

$('#center-2 > div > div').css({ marginTop: '10px' });

librarySpot.parent().css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'flex-start',
});

let chevronIcon = $('<i>', {
  class: 'bc-icon bc-icon-fill-base bc-icon-chevron-right-s4 bc-icon-chevron-right bc-icon-size-large bc-color-base',
  ariaHidden: 'true',
});
chevronIcon[0].setAttribute( 'style', "font-weight: 900 !important" );
chevronIcon.css({
  verticalAlign: 'center',
  color: 'white',
  fontSize: '23px',
  width: '28px',
  height: '28px',
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});

chevronIcon.appendTo( overlayBtnLink );

$("#audible-library-extractor-btn").on("click", function(e) {
  e.preventDefault();
  
  // https://developer.chrome.com/apps/storage
  // Permission: "storage"
  chrome.storage.local.get(null).then(data => {
    audibleLibraryExtractor(data);
  });
});

// Open ALE on page load
if ( store.state.sticky.openOnLoad ) {
  // https://developer.chrome.com/apps/storage
  // Permission: "storage"
  chrome.storage.local.get(null).then(data => {
    store.commit('update', { key: 'sticky.openOnLoad', value: false });
    // chrome.runtime.sendMessage({ newAddress: url.toString() });
    audibleLibraryExtractor(data);
  });
}

// LISTENING FOR MESSAGES FROM BACKGROUND.JS
// - Clicking the extension icon sends a message "iconClicked"
// https://developer.chrome.com/apps/messaging#simple
// https://developer.chrome.com/apps/runtime#event-onMessage
chrome.runtime.onMessage.addListener(message => {
  if (message.iconClicked) {
    // https://developer.chrome.com/apps/storage
    // Permission: "storage"
    chrome.storage.local.get(null).then(data => {
      audibleLibraryExtractor(data);
    });
  }
});

function audibleLibraryExtractor(data) {
  
  chrome.runtime.sendMessage({ action: "rebuild-context-menu" });
  
  $('<div>', { id: 'audible-library-extractor'}).prependTo("body");
  
  
  app.config.globalProperties.$dataChecker( data, store );
  
  app.directive("visible", function(el, binding) {
    el.style.visibility = !!binding.value ? "visible" : "hidden";
  });
  
  app.use( store );	
  
  app.mount('#audible-library-extractor');
    
}


// Thought about showing library size, but doing it efficiently by fetching just one extra page I 
// can't exclude anything, like podcasts... It might be fine... but  then I felt like ok I should also get
// finished and unfinished, but that would definitely require fetching all library pages...

// if ( window.location.href.lastIndexOf('piltersCurrentValue=All') > -1 ) getLibrarySize();

// function getLibrarySize() {
  
//   const pageSizeDropdown = $('select[name="pageSize"]');
//   const currentPageSize = pageSizeDropdown.length > 0 ? parseFloat( DOMPurify.sanitize(pageSizeDropdown.find("option:selected").text()) ) : null;
//   console.log( currentPageSize )
//   if ( !currentPageSize ) {
//     addLibrarySize( $("#adbl-library-content-main > .adbl-library-content-row").length );
//   }
//   else {
    
//     const pagination = $(".pagingElements");
//     const pagesLength = pagination.length > 0 ? parseFloat( DOMPurify.sanitize(pagination.find(".pageNumberElement:last").text()) ) : 1;
//     axios
//       .get( window.location.origin + "/library/titles?page=" + pagesLength )
//       .then(function(response) {
//         const audible = $($.parseHTML(response.data)).find("div.adbl-main");
//         const lastPageLength = audible.find("#adbl-library-content-main > .adbl-library-content-row").length;
//         console.log( currentPageSize, pagesLength-1, lastPageLength )
//         addLibrarySize( (currentPageSize * (pagesLength-1)) + lastPageLength );
        
//       });
//     ;
    
//   }
  
  
// }

// function addLibrarySize( size ) {
  
//   var allFilter = $('button[aria-label="Filter By All  selected"] span');
//   allFilter.text( allFilter.text() + ' ('+ size + ')' );
  
// }

// ADDING BOOK (STORE PAGE) DATA TO LIBRARY PAGES

// getBookData();
// function getBookData() {
//   const helpers = require("@contscript-mixins/misc/content-script-helpers.js").default;
//   // https://developer.chrome.com/apps/storage
//   // Permission: "storage"
//   chrome.storage.local.get(null).then(data => {
    
//     console.log( 'data-1', data );
//     if ( data.chunks ) helpers.methods.glueFriesBackTogether(data);
//     console.log( $("#adbl-library-content-main > .adbl-library-content-row").length )
//     $("#adbl-library-content-main > .adbl-library-content-row").each(function( i, row ) {
      
//       const bookASIN = DOMPurify.sanitize( row.getAttribute("id").replace("adbl-library-content-row-", ""));
//       const book = _.find( data.books, { asin: bookASIN });
      
//       console.log( book.whispersync );
//       let container = $('<div>', {
//         css: {
//           padding: '0 0 5px 0',
//         },
//       }).prependTo( row.querySelector('li.summaryLabel') );
      
//       if ( book.whispersync ) {
        
//         let whispersyncEl = $('<span>', {
//           text: 'whispersync',
//           css: {
//             fontSize: '12px',
//             lineHeight: '12px',
//             display: 'inline-block',
//             padding: "2px 6px",
//             borderRadius: "999999px",
//             color: '#fff',
//             background: '#106be6',
//             cursor: 'help',
//           },
//           title: 'Whispersync is available'
//         }).prependTo( container );
        
//         if ( book.whispersync === 'owned' ) {
//           whispersyncEl.css({
//             background: '#61bd34',
//           })
//           .attr('title', 'You own the Kindle version');
//         }
        
//       }
      
//     });
    
//   });
  
// }