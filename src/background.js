var window = window ?? self;
import browser from "webextension-polyfill";

import _ from "lodash";

var domainExtension = false;
var activeIcons = [];
var galleryUrl;

browser.storage.local.get(['extras']).then(data => {
  galleryUrl = _.get(data, 'extras.galleryUrl');
});

browser.runtime.onMessage.addListener(function(msg, sender) {
  if ( msg.pageAction == true && !browser.runtime.lastError ) {
    browser.action.setIcon({
      tabId: sender.tab.id,
      path: 'assets/icons/16.png'
    }).then(function() {
      activeIcons.push( sender.tab.id );
      // browser.action.show( sender.tab.id );
    });
  }
});

// https://developer.chrome.com/extensions/tabs
// https://developer.chrome.com/extensions/tabs#event-onUpdated
// browser.tabs.onUpdated.addListener(tabId => {
//   // Error silencing: sometimes when you close a tab right after its created,
//   // the action.show() will throw an error because the tab doesn't exist anymore
//   browser.tabs.get(tabId).then(data => {
//     if (!browser.runtime.lastError) {
//       browser.action.setIcon({
//         tabId: tabId,
//         path: 'assets/icons-gray/16.png'
//       }).then(function() {
//         browser.action.show(tabId);
//       });
//     }
//   });
// });


// Extension icon click action....
// https://developer.chrome.com/extensions/pageAction
// https://developer.chrome.com/extensions/pageAction#event-onClicked
browser.action.onClicked.addListener(tabId => {
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
browser.runtime.onMessage.addListener( async (message, sender) => {
  if (message.action === "openOutput") {
    
    // Close the tab where extraction started
    setTimeout(function() {
      browser.tabs.reload( sender.tab.id );
    }, 2000);
    
    // Open the output page
    browser.tabs.create({
      url: galleryUrl || "./gallery.html",
      active: true,
      index: sender.tab.index + 1,
    });
    
    makeContextMenu();
    
  }
  else if (message.action === "openImageEditor") {
    
    // Open the output page
    browser.tabs.create({
      url: "./wallpaper-creator/index.html?src=gallery",
      active: true,
      index: sender.tab.index + 1,
    });
    
  }
  else if (message.action === "changeGalleryUrl") {
    
    galleryUrl = message.url;
    makeContextMenu();
    
  }
});

// CONTEXT MENU
browser.tabs.onActivated.addListener((activeInfo) => {
  
  if ( !browser.runtime.lastError ) {
    if ( activeIcons.indexOf(activeInfo.tabId) >-1 ) {
      // browser.action.show(tabId);
    }
    else {
      browser.action.setIcon({
        tabId: activeInfo.tabId,
        path: 'assets/icons-gray/16.png'
      }).then(function() {
        // browser.action.show(activeInfo.tabId);
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
    
    const audibleLink = {
      id: 'ale-to-audible',
      title: "1. Audible"+ domainExtension +"/library",
      contexts: ["all"]
    };
    if ( !domainExtension ) {
      audibleLink.title = "1. Audible.com/library (placeholder)"
    }
    browser.contextMenus.create( audibleLink );
    
    const galleryLink = {
      id: 'ale-to-gallery',
      title: "2. Extension gallery",
      contexts: ["all"]
    };
    if ( !(libraryExists || wishlistExists) ) {
      galleryLink.enabled = false;
      galleryLink.title   = galleryLink.title + ' ' + '(available after extraction)';
    }
    browser.contextMenus.create( galleryLink );
  
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
    browser.contextMenus.create({
      id: 'ale-to-github-discussions',
      title: "6. Github discussions",
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
        newTab.url = "https://audible"+ (domainExtension || '.com') +"/library/titles?ipRedirectOverride=true&overrideBaseCountry=true";
        browser.tabs.create(newTab);
      });
    }
    else {
      newTab.url = "https://audible"+ domainExtension +"/library/titles?ipRedirectOverride=true&overrideBaseCountry=true";
      browser.tabs.create(newTab);
    }
  }
  else if ( info.menuItemId === 'ale-to-gallery' ) {
    newTab.url = galleryUrl || "./gallery.html";
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
  else if ( info.menuItemId === 'ale-to-github-discussions' ) {
    newTab.url = "https://github.com/joonaspaakko/audible-library-extractor/discussions";
    browser.tabs.create(newTab);
  }
    
}