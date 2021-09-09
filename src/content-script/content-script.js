// browser.storage.local.clear(); console.log( 'Chrome storage CLEARED' );

import Vue from "vue";
import App from "./content-script-app";

Vue.config.productionTip = false;
Vue.config.devtools = false;

browser.runtime.sendMessage({ pageAction: true });

let overlayBtnHeading = $('<span>', {
  id: 'audible-library-extractor-btn',
  class: 'bc-heading bc-color-base bc-lens-heading bc-text-bold',
  css: {
    display: 'inline-block',
  }
}); 

let overlayBtnLink = $('<a>', {
  class: 'bc-link bc-tab-heading bc-inline-block bc-tab-lens bc-size-title1 bc-color-secondary', 
  tabindex: '0',
  role: 'tab',
  'aria-selected': false,
  href: '#',
  text: 'Audible Library Extractor',
  css: { 
    lineHeight: '17px',
    fontSize: '17px',
    paddingLeft: '20px',
  },
});

overlayBtnHeading.append( overlayBtnLink );
overlayBtnHeading.insertAfter('.adbl-library-refinement-section > div:nth-child(1) .library-pilter-button:last');

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
  
  $('<div>', { id: 'audible-library-extractor'}).prependTo("body");
  
  // Storage data is dropped immediately. I just want to know if the data exists
  // in load so I can enable/disable things based on that info.
  // Later it's fetched again if needed.
  let storageHasData = !$.isEmptyObject(data);
  if ( storageHasData && !!data.chunks && data.chunks.length === 0 ) storageHasData = false;
  
  Vue.directive("visible", function(el, binding) {
    el.style.visibility = !!binding.value ? "visible" : "hidden";
  });
  
  new Vue({
    el: "#audible-library-extractor",
    render: h => {
      return h(App, {
        props: {
          storageHasData: storageHasData ? ({ 
            books: data.chunks.indexOf('books') > -1, 
            isbn: data.chunks.indexOf('books') > -1 ? checkISBNs( data ) : false,
            wishlist: data.chunks.indexOf('wishlist') > -1,
            collections: data.chunks.indexOf('collections') > -1,
          }) : {},
          storageConfig: data.config || {},
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