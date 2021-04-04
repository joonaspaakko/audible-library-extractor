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
  console.log( 'pageAction clicked');
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