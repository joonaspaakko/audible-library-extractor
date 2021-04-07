global.browser = require("webextension-polyfill");

browser.runtime.onMessage.addListener(function(msg, sender) {
  if ( msg.pageAction == true && !browser.runtime.lastError ) {
    browser.pageAction.show( sender.tab.id );
  }
});

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
    browser.tabs.remove(sender.tab.id);
    
    // Open the output page
    browser.tabs.create({
      url: "./output-page/index.html",
      active: true,
      index: sender.tab.index + 1,
      openerTabId: sender.tab.id
    });
    
  }
});

// CONTEXT MENU
var domainExtension;
browser.tabs.onActivated.addListener(() => {
  
  // https://developer.chrome.com/apps/storage
  // Permission: "storage"
  browser.storage.local.get(null).then(data => {
    
    // https://developer.chrome.com/docs/extensions/reference/contextMenus/
    // Permissions: contextMenus
    browser.contextMenus.removeAll();
    
    var dataExists = typeof data === 'object' && data !== null && !!data.chunks && data.chunks.length === 0;
    
    data = null;
    
    if ( dataExists ) {
      browser.contextMenus.create({
        id: 'ale-to-gallery',
        title: "Open gallery",
        contexts: ["browser_action", "page_action"]
      });
    }
    
    if ( domainExtension ) {
      browser.contextMenus.create({
        id: 'ale-to-audible',
        title: "Open Audible library",
        contexts: ["browser_action", "page_action"]
      });
    }
    
    browser.contextMenus.create({
      id: 'ale-to-github',
      title: "Github: project page",
      contexts: ["browser_action", "page_action"]
    });
    
    browser.contextMenus.create({
      id: 'ale-to-github-issues',
      title: "Github: issues",
      contexts: ["browser_action", "page_action"]
    });
    
  });
  
});

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
  if ( info.menuItemId === 'ale-to-github' ) {
    newTab.url = "https://github.com/joonaspaakko/audible-library-extractor";
    browser.tabs.create(newTab);
  }
  else if ( info.menuItemId === 'ale-to-github-issues' ) {
    newTab.url = "https://github.com/joonaspaakko/audible-library-extractor/issues";
    browser.tabs.create(newTab);
  }
  
});
