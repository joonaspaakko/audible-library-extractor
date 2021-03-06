global.browser = require("webextension-polyfill");

var activeIcons = [];

const get = (obj, path, defValue) => {
  if (!path) return undefined
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g)
  const result = pathArray.reduce((prevObj, key) => prevObj && prevObj[key], obj)
  return result === undefined ? defValue : result
}

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
      url: "./output-page/index.html",
      active: true,
      index: sender.tab.index + 1,
      openerTabId: sender.tab.id
    });
    
    makeContextMenu();
    
  }
});

// CONTEXT MENU
var domainExtension;
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
  browser.storage.local.get(null).then(data => {
    
    // https://developer.chrome.com/docs/extensions/reference/contextMenus/
    // Permissions: contextMenus
    browser.contextMenus.removeAll();
    
    var dataExists = typeof data === 'object' && data.chunks && data.chunks.length > 0;
    domainExtension = get( data, 'extras.domain-extension' );
    data = null;
    
    if ( dataExists ) {
      browser.contextMenus.create({
        id: 'ale-to-gallery',
        title: "1. Extension gallery",
        contexts: ["page", "browser_action", "page_action"]
      });
    }
    
    if ( domainExtension ) {
      browser.contextMenus.create({
        id: 'ale-to-audible',
        title: "2. Audible"+ domainExtension +"/library",
        contexts: ["page", "browser_action", "page_action"]
      });
    }
    
    browser.contextMenus.create({
      id: 'ale-to-docs',
      title: "3. Documentation",
      contexts: ["page", "browser_action", "page_action"]
    });
    
    browser.contextMenus.create({
      id: 'ale-to-github',
      title: "4. Github project page",
      contexts: ["page", "browser_action", "page_action"]
    });
    
    browser.contextMenus.create({
      id: 'ale-to-github-issues',
      title: "5. Github issues",
      contexts: ["page", "browser_action", "page_action"]
    });
    
  });
  
}


browser.contextMenus.onClicked.addListener((info, tab) => {
      
  var newTab = {
    active: true,
    index: tab.index + 1,
    openerTabId: tab.id
  };
  
  if ( info.menuItemId === 'ale-to-gallery' ) {
    newTab.url = "./output-page/index.html";
    browser.tabs.create(newTab);
  }
  else if ( info.menuItemId === 'ale-to-audible' ) {
    newTab.url = "https://audible"+ domainExtension +"/library/titles";
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
  
});
