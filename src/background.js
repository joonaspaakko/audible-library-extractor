global.browser = require("webextension-polyfill");

import {
  get,
} from "lodash";

var domainExtension = false;
var activeIcons = [];

browser.runtime.onMessage.addListener(function(msg, sender) {
  if ( msg.pageAction == true && !browser.runtime.lastError ) {
    browser.pageAction.setIcon({
      tabId: sender.tab.id,
      path: 'assets/icons/16.png'
    }).then(function() {
      activeIcons.push( sender.tab.id );
      browser.pageAction.show( sender.tab.id );
    });
  }
});

// https://developer.chrome.com/extensions/tabs
// https://developer.chrome.com/extensions/tabs#event-onUpdated
// browser.tabs.onUpdated.addListener(tabId => {
//   // Error silencing: sometimes when you close a tab right after its created,
//   // the pageAction.show() will throw an error because the tab doesn't exist anymore
//   browser.tabs.get(tabId).then(data => {
//     if (!browser.runtime.lastError) {
//       browser.pageAction.setIcon({
//         tabId: tabId,
//         path: 'assets/icons-gray/16.png'
//       }).then(function() {
//         browser.pageAction.show(tabId);
//       });
//     }
//   });
// });


// Extension icon click action....
// https://developer.chrome.com/extensions/pageAction
// https://developer.chrome.com/extensions/pageAction#event-onClicked
browser.pageAction.onClicked.addListener(tabId => {
  // https://developer.chrome.com/extensions/tabs
  // https://developer.chrome.com/extensions/tabs#method-query
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    var tab = tabs[0];
    // Sends message to the content script...
    // https://developer.chrome.com/apps/messaging#simple
    // https://developer.chrome.com/extensions/tabs#method-sendMessage
    browser.tabs.sendMessage(tab.id, {
      iconClicked: true,
      tab: tab
    });
  });
});

// LISTENS FOR A MESSAGES form the content script
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "openOutput") {
    
    // Close the tab where extraction started
    setTimeout(function() {
      chrome.tabs.reload( sender.tab.id );
    }, 2000);
    
    // Open the output page
    browser.tabs.create({
      url: "./gallery/index.html",
      active: true,
      index: sender.tab.index + 1,
    });
    
    makeContextMenu();
    
  }
  else if (message.action === "openImageEditor") {
    
    // Open the output page
    browser.tabs.create({
      url: "./wallpaper-creator/index.html",
      active: true,
      index: sender.tab.index + 1,
    });
    
  }
});

// CONTEXT MENU
browser.tabs.onActivated.addListener((activeInfo) => {
  
  if ( !browser.runtime.lastError ) {
    if ( activeIcons.indexOf(activeInfo.tabId) >-1 ) {
      // browser.pageAction.show(tabId);
    }
    else {
      browser.pageAction.setIcon({
        tabId: activeInfo.tabId,
        path: 'assets/icons-gray/16.png'
      }).then(function() {
        browser.pageAction.show(activeInfo.tabId);
      });
    }
    
  }
  
});

makeContextMenu();

function makeContextMenu() {
  
  // https://developer.chrome.com/apps/storage
  // Permission: "storage"
  browser.storage.local.get(['chunks', 'extras']).then(data => {
    
    const dataChunks = _.get(data, 'chunks', []);
    const storageHasData = dataChunks.length > 0;
    const libraryExists = dataChunks.lastIndexOf('books') > -1;
    const wishlistExists = dataChunks.lastIndexOf('wishlist') > -1;
    domainExtension = _.get(data, 'extras.domain-extension');
    data = null;
    
    // https://developer.chrome.com/docs/extensions/reference/contextMenus/
    // Permissions: contextMenus
    browser.contextMenus.removeAll();
    
    if ( domainExtension ) {
      browser.contextMenus.create({
        id: 'ale-to-audible',
        title: "1. Audible"+ domainExtension +"/library",
        contexts: ["all"]
      });
    }
    
    if ( libraryExists || wishlistExists ) {
      browser.contextMenus.create({
        id: 'ale-to-gallery',
        title: "2. Extension gallery",
        contexts: ["all"]
      });
    }
    
    browser.contextMenus.create({
      id: 'separator-1',
      type: "separator",
      contexts: ["all"]
    });
    
    
    browser.contextMenus.create({
      id: 'ale-to-docs',
      title: "3. Documentation",
      contexts: ["all"]
    });
    
    browser.contextMenus.create({
      id: 'ale-to-github',
      title: "4. Github project page",
      contexts: ["all"]
    });
    
    browser.contextMenus.create({
      id: 'ale-to-github-issues',
      title: "5. Github issues",
      contexts: ["all"]
    });
    
  });
  
}

browser.contextMenus.onClicked.addListener(contextEvents);
  
function contextEvents( info, tab ) {
  
  var newTab = {
    active: true,
    index: tab.index + 1,
    openerTabId: tab.id
  };
  
  if ( info.menuItemId === 'ale-to-audible' ) {
    if ( !domainExtension ) {
      browser.storage.local.get(['extras']).then(data => {
        domainExtension = _.get(data, 'extras.domain-extension');
        newTab.url = "https://audible"+ (domainExtension || '.com') +"/library/titles";
        browser.tabs.create(newTab);
      });
    }
    else {
      newTab.url = "https://audible"+ domainExtension +"/library/titles";
      browser.tabs.create(newTab);
    }
  }
  else if ( info.menuItemId === 'ale-to-gallery' ) {
    newTab.url = "./gallery/index.html";
    browser.tabs.create(newTab);
  }
  else if ( info.menuItemId === 'ale-to-docs' ) {
    newTab.url = "https://joonaspaakko.gitbook.io/audible-library-extractor/";
    browser.tabs.create(newTab);
  }
  else if ( info.menuItemId === 'ale-to-github' ) {
    newTab.url = "https://github.com/joonaspaakko/audible-library-extractor";
    browser.tabs.create(newTab);
  }
  else if ( info.menuItemId === 'ale-to-github-issues' ) {
    newTab.url = "https://github.com/joonaspaakko/audible-library-extractor/issues";
    browser.tabs.create(newTab);
  }
    
}