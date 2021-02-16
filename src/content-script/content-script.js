// browser.storage.local.clear(); console.log( 'Chrome storage CLEARED' );

import Vue from "vue";
import App from "./content-script-app";

Vue.config.productionTip = false;
Vue.config.devtools = false;

let overlayBtnHeading = $('<h2>', {
  id: 'audible-library-extractor-btn',
  class: 'bc-heading bc-color-base bc-lens-heading bc-text-bold',
}); 

let overlayBtnLink = $('<a>', {
  class: 'bc-link bc-tab-heading bc-inline-block bc-tab-lens bc-size-title1 bc-color-secondary', 
  tabindex: '0',
  role: 'tab',
  'aria-selected': false,
  href: '#',
  text: 'Audible Library Extractor'
});

overlayBtnHeading.append( overlayBtnLink );
overlayBtnHeading.appendTo('.bc-tabs [role="tablist"]');

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
  const storageHasData = $.isEmptyObject(data) ? false : true;
  
  Vue.directive("visible", function(el, binding) {
    el.style.visibility = !!binding.value ? "visible" : "hidden";
  });
  
  new Vue({
    el: "#audible-library-extractor",
    render: h => {
      return h(App, {
        props: {
          storageHasData: storageHasData,
          storageConfig: data.config
        }
      });
    }
  });
}
