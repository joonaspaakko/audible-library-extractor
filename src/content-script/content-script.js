// browser.storage.local.clear(); console.log( 'Chrome storage CLEARED' );

import Vue from "vue";
import App from "./content-script-app";
import store from "./store.js";

Vue.config.productionTip = false;
Vue.config.devtools = false;

browser.runtime.sendMessage({ pageAction: true });

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
  },
});

let librarySpot = $('.library-header-divider').next().find('> h1');
librarySpot.css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});
overlayBtnLink.appendTo( librarySpot );

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
  browser.storage.local.get(null).then(data => {
    audibleLibraryExtractor(data);
  });
});

// LISTENING FOR MESSAGES FROM BACKGROUND.JS
// - Clicking the extension icon sends a message "iconClicked"
// https://developer.chrome.com/apps/messaging#simple
// https://developer.chrome.com/apps/runtime#event-onMessage
browser.runtime.onMessage.addListener(message => {
  if (message.iconClicked) {
    // https://developer.chrome.com/apps/storage
    // Permission: "storage"
    browser.storage.local.get(null).then(data => {
      audibleLibraryExtractor(data);
    });
  }
});

function audibleLibraryExtractor(data) {
  
  store.commit("fromLocalStorage");
  
  $('<div>', { id: 'audible-library-extractor'}).prependTo("body");
  
  // Storage data is dropped immediately. I just want to know if the data exists
  // in load so I can enable/disable things based on that info.
  // Later it's fetched again if needed.
  const dataChunks = _.get(data, 'chunks', []);
  const storageHasData = dataChunks.length > 0;
  
  Vue.directive("visible", function(el, binding) {
    el.style.visibility = !!binding.value ? "visible" : "hidden";
  });
  
  new Vue({
    el: "#audible-library-extractor",
    store,
    render: h => {
      return h(App, {
        props: {
          storageHasDataInit: storageHasData ? ({ 
            books: dataChunks.indexOf('books') > -1, 
            isbn: dataChunks.indexOf('books') > -1 ? checkISBNs( data ) : false,
            wishlist: dataChunks.indexOf('wishlist') > -1,
            collections: dataChunks.indexOf('collections') > -1,
          }) : {},
          storageConfigInit: data.config || {},
          dataVersionInit: data.version || {},
        }
      });
    }
  });
  
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
//   const helpers = require("@contscript-mixins/misc/helpers.js").default;
//   // https://developer.chrome.com/apps/storage
//   // Permission: "storage"
//   browser.storage.local.get(null).then(data => {
    
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