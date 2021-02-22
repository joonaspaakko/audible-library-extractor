global.browser = require("webextension-polyfill");

// https://developer.chrome.com/extensions/tabs
// https://developer.chrome.com/extensions/tabs#event-onUpdated
// Permissions: "tabs"
browser.tabs.onUpdated.addListener(tabId => {
  // Error silencing: sometimes when you close a tab right after its created,
  // the pageAction.show() will throw an error because the tab doesn't exist anymore
  browser.tabs.get(tabId).then(data => {
    if (!browser.runtime.lastError) browser.pageAction.show(tabId);
  });
});

// Extension icon click action....
// https://developer.chrome.com/extensions/pageAction
// https://developer.chrome.com/extensions/pageAction#event-onClicked
browser.pageAction.onClicked.addListener(tabId => {
  // https://developer.chrome.com/extensions/tabs
  // https://developer.chrome.com/extensions/tabs#method-query
  // Permissions: "tabs"
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

// Probe: url
// https://www.audible.com/library?ipRedirectOverride=true&overrideBaseCountry=true
