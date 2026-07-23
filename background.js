import _ from 'lodash';
import helpers from "@contscript-mixins/misc/content-script-helpers.js";

var window = window ?? self;
window._ = _;

// await chrome.scripting.registerContentScripts([
//   {
//     id: 'inpage',
//     matches: ['http://*/*', 'https://*/*'],
//     js: ['audible-library-extractor-content-script.js'],
//     runAt: 'document_start',
//     world: 'MAIN',
//   },
// ]);

var domainExtension = false;
var galleryUrl;

const audibleLibraryUrlPattern = /^https?:\/\/[^/]*\.audible\.[a-z.]+\/library\//i;

function isAudibleLibraryTab( url ) { return !!(url && audibleLibraryUrlPattern.test( url )); }

function openAudibleLibraryTab( newTab ) {

  const createTab = () => {
    newTab.url = "https://audible"+ (domainExtension || '.com') +"/library/titles?ipRedirectOverride=true&overrideBaseCountry=true";
    chrome.tabs.create(newTab);
  };
  
  if ( !domainExtension ) {
    chrome.storage.local.get(['metadata']).then(data => {
      domainExtension = data?.metadata?.extras?.['domain-extension'];
      createTab();
    });
  }
  else {
    createTab();
  }
  
}

function openGalleryTab( newTab ) {
  
  newTab.url = galleryUrl || "./gallery.html";
  chrome.tabs.create(newTab);
  
}

chrome.storage.local.get(['audibledata', 'metadata']).then(data => {
  galleryUrl = data?.metadata?.extras?.galleryUrl;
  if ( !data.audibledata ) {
    chrome.storage.local.get(null).then(allData => {
      const migrated = helpers.methods.migrateStorageData( allData );
      if ( migrated ) {
        chrome.storage.local.set({ audibledata: allData.audibledata, metadata: allData.metadata });
        if ( migrated.remove ) chrome.storage.local.remove( migrated.remove );
        galleryUrl = allData?.metadata?.extras?.galleryUrl;
      }
      makeContextMenu();
    });
  }
  else {
    makeContextMenu();
  }
});

// https://developer.chrome.com/extensions/tabs
// https://developer.chrome.com/extensions/tabs#event-onUpdated
// chrome.tabs.onUpdated.addListener(tabId => {
//   // Error silencing: sometimes when you close a tab right after its created,
//   // the action.show() will throw an error because the tab doesn't exist anymore
//   chrome.tabs.get(tabId).then(data => {
//     if (!chrome.runtime.lastError) {
//       chrome.action.setIcon({
//         tabId: tabId,
//         path: 'assets/icons-gray/16.png'
//       }).then(function() {
//         chrome.action.show(tabId);
//       });
//     }
//   });
// });


// Extension icon click action....
// https://developer.chrome.com/extensions/pageAction
// https://developer.chrome.com/extensions/pageAction#event-onClicked
chrome.action.onClicked.addListener(tabId => {
  // https://developer.chrome.com/extensions/tabs
  // https://developer.chrome.com/extensions/tabs#method-query
  chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    var tab = tabs[0];

    if ( isAudibleLibraryTab( tab.url ) ) {
      // Sends message to the content script...
      // https://developer.chrome.com/apps/messaging#simple
      // https://developer.chrome.com/extensions/tabs#method-sendMessage
      chrome.tabs.sendMessage(tab.id, {
        iconClicked: true,
        tab: tab
      });
    }
    else {
      chrome.storage.local.get(['audibledata']).then(data => {
        var audibledata = data.audibledata || {};
        var newTab = {
          active: true,
          index: tab.index + 1,
          openerTabId: tab.id
        };
        if ( audibledata.library || audibledata.wishlist ) {
          openGalleryTab( newTab );
        }
        else {
          openAudibleLibraryTab( newTab );
        }
      });
    }

  });
});

// LISTENS FOR A MESSAGES form the content script
chrome.runtime.onMessage.addListener( async (message, sender) => {
  if (message.action === "refresh") {
    chrome.tabs.update( sender.tab.id, { url: message.url });
  }
  else if (message.action === "newPage") {
    
    chrome.tabs.create({
      url: message.url,
      active: true,
      index: sender.tab.index + 1,
    });
    
  }
  else if (message.action === "openGallery") {

    chrome.tabs.create({
      url: galleryUrl || "./gallery.html",
      active: true,
      index: sender.tab.index + 1,
    });

  }
  else if (message.action === "openOutput") {
    
    // Close the tab where extraction started
    // setTimeout(function() {
      // chrome.tabs.reload( sender.tab.id );
      chrome.tabs.update( sender.tab.id, { url: message.url });
    // }, 2000);
    
    // Open the output page
    chrome.tabs.create({
      url: galleryUrl || "./gallery.html",
      active: true,
      index: sender.tab.index + 1,
    });
    
    makeContextMenu();
    
  }
  else if (message.action === "openImageEditor") {
    
    // Open the output page
    chrome.tabs.create({
      url: "./wallpaper-creator.html?src=gallery",
      active: true,
      index: sender.tab.index + 1,
    });
    
  }
  else if (message.action === "changeGalleryUrl") {
    
    galleryUrl = message.url;
    makeContextMenu();
    
  }
  else if ( message.action === 'rebuild-context-menu' ) {
    makeContextMenu();
  }
});

// CONTEXT MENU
function makeContextMenu() {
  
  // https://developer.chrome.com/apps/storage
  // Permission: "storage"
  chrome.storage.local.get(['audibledata', 'metadata']).then(data => {

    const audibledata = data.audibledata || {};
    const libraryExists = !!audibledata.library;
    const wishlistExists = !!audibledata.wishlist;
    domainExtension = data?.metadata?.extras?.['domain-extension'];
    data = null;
    
    // https://developer.chrome.com/docs/extensions/reference/contextMenus/
    // Permissions: contextMenus
    chrome.contextMenus.removeAll();
    
    const audibleLink = {
      id: 'ale-to-audible',
      title: "1. Audible"+ domainExtension +"/library",
      contexts: ["all"]
    };
    if ( !domainExtension ) {
      audibleLink.title = "1. Audible.com/library (placeholder)"
    }
    chrome.contextMenus.create( audibleLink );
    
    const galleryLink = {
      id: 'ale-to-gallery',
      title: "2. Extension gallery",
      contexts: ["all"]
    };
    if ( !(libraryExists || wishlistExists) ) {
      galleryLink.enabled = false;
      galleryLink.title   = galleryLink.title + ' ' + '(available after extraction)';
    }
    chrome.contextMenus.create( galleryLink );
  
    chrome.contextMenus.create({
      id: 'separator-1',
      type: "separator",
      contexts: ["all"]
    });
    
    chrome.contextMenus.create({
      id: 'ale-to-docs',
      title: "3. Documentation",
      contexts: ["all"]
    });
    
    chrome.contextMenus.create({
      id: 'ale-to-github',
      title: "4. Github project page",
      contexts: ["all"]
    });
    
    chrome.contextMenus.create({
      id: 'ale-to-github-issues',
      title: "5. Github issues",
      contexts: ["all"]
    }); 
    chrome.contextMenus.create({
      id: 'ale-to-github-discussions',
      title: "6. Github discussions",
      contexts: ["all"]
    });
    
  });
  
}

chrome.contextMenus.onClicked.addListener(contextEvents);
  
function contextEvents( info, tab ) {
  
  var newTab = {
    active: true,
    index: tab.index + 1,
    openerTabId: tab.id
  };
  
  if ( info.menuItemId === 'ale-to-audible' ) {
    openAudibleLibraryTab( newTab );
  }
  else if ( info.menuItemId === 'ale-to-gallery' ) {
    openGalleryTab( newTab );
  }
  else if ( info.menuItemId === 'ale-to-docs' ) {
    newTab.url = "https://joonaspaakko.gitbook.io/audible-library-extractor/";
    chrome.tabs.create(newTab);
  }
  else if ( info.menuItemId === 'ale-to-github' ) {
    newTab.url = "https://github.com/joonaspaakko/audible-library-extractor";
    chrome.tabs.create(newTab);
  }
  else if ( info.menuItemId === 'ale-to-github-issues' ) {
    newTab.url = "https://github.com/joonaspaakko/audible-library-extractor/issues";
    chrome.tabs.create(newTab);
  }
  else if ( info.menuItemId === 'ale-to-github-discussions' ) {
    newTab.url = "https://github.com/joonaspaakko/audible-library-extractor/discussions";
    chrome.tabs.create(newTab);
  }
    
}