// browser.storage.local.clear(); console.log( 'Chrome storage CLEARED' );

import Vue from "vue";
import App from "./content-script-app";

Vue.config.productionTip = false;
Vue.config.devtools = false;

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: function(error) {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response.status == "429"
    );
  }
});

Vue.directive("visible", function(el, binding) {
  el.style.visibility = !!binding.value ? "visible" : "hidden";
});
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

$(function() {
  let overlayBtnEl = DOMPurify.sanitize(
    `
    <span> </span>
    <h2 id="audible-library-extractor-btn" class="bc-heading bc-color-base bc-lens-heading bc-text-bold">
      <a class="bc-link bc-tab-heading bc-inline-block bc-tab-lens bc-size-title1 bc-color-secondary" tabindex="0" role="tab" aria-selected="false" href="/library/collections">
        Audible Library Extractor
      </a>
    </h2>
  `
  );

  $(overlayBtnEl).appendTo('.bc-tabs [role="tablist"]');

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
}); // on ready

function audibleLibraryExtractor(data) {
  const appRootEl = DOMPurify.sanitize(
    '<div id="audible-library-extractor"></div>'
  );
  $(appRootEl).prependTo("body");

  // Storage data is dropped immediately. I just want to know if the data exists
  // in load so I can enable/disable things based on that info.
  // Later it's fetched again if needed.
  const storageHasData = $.isEmptyObject(data) ? false : true;

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
