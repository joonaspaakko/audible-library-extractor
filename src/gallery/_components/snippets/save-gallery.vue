<template>
<modal @closeModal="$emit('closeComp')">
  
  <div class="export-group">

    
    <div class="top-wrapper">
      <div class="icon-wrapper" :style="{ fontSize: iconSize/1.2  + 'px', lineHeight: iconSize/1.2  + 'px', paddingRight: iconSize / 2.5 + 'px' }">
        <ep-grid/>
      </div>
      <div class="text-wrapper" ref="textWrapper">
        <h2>Stand-alone gallery</h2>

        <div class="description">
          This saves the gallery as a stand-alone web page that can be uploaded online and shared or viewed as is by unpacking the zip file and opening the index.html file in a web browser.
        </div>
      </div>
    </div>
    
    <h3>Include:</h3>

    <div class="options opt-groups">
      <div class="opt-group" v-for="(group, groupIndex) in chunkSource" :key="groupIndex" :class="[ 'group-' + groupIndex ]">
        <label :class="[ 'item-' + itemIndex, item.disabled ? 'disabled' : null ]" :data-extra="item.extra"  v-for="(item, itemIndex) in group" :key="item.key" v-tippy :content="item.tippy">
          <input type="checkbox" :disabled="item.disabled" v-model="item.checked" @change="sourceChecked($event, item)"> 
          <div class="visual-checkbox">
            <span class="icon">
              <fa-solid-check/>
            </span>
          </div>
          <span>{{ item.key }}</span>
        </label>
      </div>
    </div>

    <div class="buttons-footer">
      <div class="btn-wrapper">
        
        <div v-if="$store.state.devMode" style="color: #999; font-weight: bold; margin-bottom: 5px;">
          Saving the standalone gallery is only possible <br> in "production" builds (<code>npm run build</code>)
        </div>
        <button class="save-btn save-gallery" :class="{ saving: bundling }" @click="saveButtonClicked" :disabled="!$store.state.devMode && (bundling || !saveBtnEnabled)">
          <span><strong v-if="bundling">Packaging:</strong> ALE-gallery.zip</span>
            <fa6-solid-circle-notch v-if="bundling" spin />
            <fa6-solid-download v-else />
            <div v-if="bundling && progressWidth" class="progress" :style="{ width: progressWidth }"></div>
            <button class="cancel-packaging" v-if="bundling" @click="cancelZipping">cancel</button>
        </button>
        <div>
          <a class="github-btn" target="_blank" rel="noopener noreferrer" href="https://joonaspaakko.gitbook.io/audible-library-extractor/sharing/uploading-to-github">
            <span>Upload instructions</span>
            <octicon-mark-github-16/>
          </a>
          <a class="github-btn" target="_blank" rel="noopener noreferrer" href="https://joonaspaakko.gitbook.io/audible-library-extractor/sharing/uploading-to-github/updating-gallery-in-github">
            <span>Update instructions</span>
            <octicon-mark-github-16/>
          </a>
        </div>
        <!--
        <div class="file-desc">
          You can upload the files to Github for free. See instructions <a href="https://joonaspaakko.gitbook.io/audible-library-extractor/sharing/uploading-to-github" target="_blank" rel="noopener noreferrer">here</a>.
        </div>
        -->
      </div>
    </div>
  </div>
  
</modal>
</template>


<script>
import modal from '@output-snippets/modal.vue';
// import makeCoverUrl from "@output-mixins/makeCoverUrl";

export default {
  name: "saveGallery",
  // mixins: [makeCoverUrl],
  components: {
    modal,
  },
  data: function() {
    return {
      files: [
        "gallery.js",
        "gallery.js.LICENSE.txt",
        "gallery.css",
        
        "images/info/book-cover-cloud-player-button.jpg", 
        "images/info/sidebar.jpg", 
        "images/info/sidebar-toolbar.jpg", 
        "images/info/sidebar-series-list.jpg", 
        "images/info/sidebar-main-info.jpg", 
        "images/info/sidebar-cover.jpg", 
        "images/info/sidebar-collections-list.jpg", 
        "images/info/sample-play-button.jpg", 
        "images/info/prefer-short-title.jpg", 
        "images/info/cover-whispersync-indicator.jpg", 
        "images/info/cover-plus-calatog-indicator.jpg", 
        "images/info/cover-favorite-finished-indicators.jpg", 
        "images/info/carousel.jpg", 
        "images/info/blurb-hover-corner.jpg", 
        
        "fonts/inconsolata-v21-latin-regular.woff",
        "fonts/inconsolata-v21-latin-regular.woff2",
        "fonts/roboto-v29-latin-700.woff",
        "fonts/roboto-v29-latin-700.woff2",
        "fonts/roboto-v29-latin-regular.woff",
        "fonts/roboto-v29-latin-regular.woff2",
        
        "favicons/android-chrome-192x192.png",
        "favicons/android-chrome-512x512.png",
        "favicons/apple-touch-icon.png",
        "favicons/browserconfig.xml",
        "favicons/favicon-16x16.png",
        "favicons/favicon-32x32.png",
        "favicons/favicon.ico",
        "favicons/mstile-150x150.png",
        "favicons/safari-pinned-tab.svg",
        "app.webmanifest"
      ],
      dataSources: [
        { checked: true, disabled: false, key: 'Library' },
        { checked: true, disabled: false, key: 'Categories', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Authors', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Publishers', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Collections', parent: 'Library' },
        { checked: true, disabled: false, key: 'Series', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Narrators', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Wishlist' },
        { checked: true, disabled: true, key: 'Export archived books', extra: true, tippy: 'If unchecked, the "archive" collection and all archived books are excluded from the export and "My books in the series" will list archived books as not owned. This option is disabled if the archive is empty.' },
        
      ],
      zip: null,
      cacheBuster: null,
      bundling: false,
      saveBtnEnabled: true,
      progressWidth: null,
      iconSize: 20,
    };
  },

  created: function() {
    
    this.files = this.files.concat( window.chunksFilePaths );
    
    let vue = this;

    if ( this.$store.state.sticky.exportSettingsGallery ) {
      _.each(this.$store.state.sticky.exportSettingsGallery, function( stickySource ) {
        var source = _.find(vue.dataSources, { key: stickySource.key });
        source.checked = stickySource.checked;
        source.disabled = stickySource.disabled;
      });
    }

    let librarySource = _.find( this.dataSources, { key: 'Library' });
    librarySource.disabled =  !this.$store.state.library.books;
    let wishlistSource = _.find( this.dataSources, { key: 'Wishlist' });
    wishlistSource.disabled =  !this.$store.state.library.wishlist;
    
    let collections = this.$store.state.library.collections;
    let archive = collections ? _.find( collections, { id: '__ARCHIVE' }) : null;
    if ( archive && archive.books.length > 0  ) {
      let archivedSource = _.find( this.dataSources, { key: 'Export archived books' });
      if ( archivedSource ) archivedSource.disabled = false;
    }
    
  },

  mounted: function() {

    let vue = this;
    
    this.iconSize = this.$refs.textWrapper.offsetHeight;

    if ( vue.$store.getters.saveStandaloneAfter ) {
      this.$nextTick(function() {
        try {

          let newConfig = JSON.parse(JSON.stringify( vue.$store.state.extractSettings ));
          let saveStandaloneAfter = _.find( newConfig.extraSettings, { name: 'saveStandaloneAfter' });
          saveStandaloneAfter.deactivated = true;

          this.$store.commit('prop', { key: 'extractSettings', value: newConfig });
          browser.storage.local.set({config: newConfig }).then(function() {
            vue.saveButtonClicked();
          });

        } catch (e) {}
      });
    }

  },

  beforeUnmount: function() {
    this.zip = null;
    this.cacheBuster = null;
  },

  computed: {
    chunkSource: function() {
      return _.chunk(this.dataSources, 4);
    },
  },

  methods: {
    
    cancelZipping: function() {
      window.location.reload();
    },
    
    // Book ASIN is used to identify the correct file later
    divideLargerDatapoints: function( zip, books ) {
      let vue = this;
      _.each( books, function( book ) {
        let fileData = '';
        if ( book.peopleAlsoBought && book.asin ) {
          fileData += "window.peopleAlsoBoughtJSON = " + JSON.stringify(book.peopleAlsoBought) + "; \n";
          delete book.peopleAlsoBought;
        }
        if ( book.summary && book.asin ) {
          fileData += "window.bookSummaryJSON = " + JSON.stringify(book.summary) + "; \n";
          delete book.summary;
        }
        if ( fileData !== '' ) {
          zip.file("data/split-book-data/"+ book.asin +"."+ vue.cacheBuster +".js", fileData);
        }
      });
    },

    saveButtonClicked: async function () {
      const vue = this;

      if ( this.bundling || this.$store.state.devMode ) return;

      try {
        vue.bundling = true;
        vue.$store.commit("prop", { key: 'bundlingGallery', value: true });
        
        vue.cacheBuster = this.runCachebuster();
        vue.zip = new JSZip();
        const zip = vue.zip;

        // I've had a few build errors so might as well make sure it never happens because this file doesn't exist...
        zip.file(".nojekyll", '');
        
        let libraryData = this.excludeData( JSON.parse(JSON.stringify(this.$store.state.library)) );
        
        libraryData.extras.cacheID = vue.cacheBuster;
        
        let tempData = {
          books: !!libraryData.books,
          series: !!libraryData.series,
          collections: !!libraryData.collections,
          wishlist: !!libraryData.wishlist,
          extras: libraryData.extras,
        };

        let loadServiceWorker = `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.${vue.cacheBuster}.js')
            .then(function(registration) {
              console.log('Registration successful, scope is:', registration.scope);
            })
            .catch(function(error) {
              console.log('Service worker registration failed, error:', error);
            });
          }
        `;
        
        const useServiceWorker = false;
        loadServiceWorker = useServiceWorker ? '<script>'+ loadServiceWorker +'<\/script>' : '';
        
        const indexHTML =
          "<!DOCTYPE html>" +
          '<html lang="en" class="theme-dark standalone-gallery" style="background: #171717; min-height: 100%;">' +
          "<head>" +
            '<meta charset="UTF-8">' +
            // '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1">' +
            '<meta http-equiv="X-UA-Compatible" content="ie=edge">' +
            '<meta http-equiv="Cache-control" content="no-cache, no-store, must-revalidate">' +
            '<meta http-equiv="Pragma" content="no-cache">' +
            '<meta name="apple-mobile-web-app-capable" content="yes">' +
            '<meta name="mobile-web-app-capable" content="yes">' +
            '<link rel="apple-touch-icon" sizes="180x180" href="favicons/apple-touch-icon.png">' +
            '<link rel="icon" type="image/png" sizes="32x32" href="favicons/favicon-32x32.png">' +
            '<link rel="icon" type="image/png" sizes="16x16" href="favicons/favicon-16x16.png">' +
            '<link rel="manifest" href="app.webmanifest">' +
            '<link rel="mask-icon" href="favicons/safari-pinned-tab.svg" color="#f29a33">' +
            '<link rel="shortcut icon" href="favicons/favicon.ico">' +
            '<meta name="msapplication-TileColor" content="#222222">' +
            '<meta name="msapplication-config" content="favicons/browserconfig.xml">' +
            '<meta name="theme-color" content="#f29a33">' +
            "<title>My Audible Library</title>" +
            loadServiceWorker +
            '<link id="ale-css" rel="stylesheet" href="gallery.' + vue.cacheBuster + '.css">' +
          "</head>" +
          "<body>" +
          
            '<div id="audible-library-extractor" data-version="'+ this.$store.state.version +'" data-cache-id="'+ vue.cacheBuster +'"></div>' +
            '<script id="ale-js" src="gallery.' + vue.cacheBuster +'.js"><\/script>' +
            "<noscript>This library requires javascript to work!</noscript>" +
            
          "</body>" +
            "</html>";

        zip.file("index.html", indexHTML);
        
        zip.file("ALE-Documentation.url", `[InternetShortcut]\nURL=https://joonaspaakko.gitbook.io/audible-library-extractor/`);

        // Split "peopleAlsoBought" into separate files and exclude from book data because 
        // it's a good amount of data that isn't necessarily needed immediately or all at once
        
        if ( libraryData.wishlist && libraryData.books ) {
          // Just to make sure no data file is created twice...
          // Books are excluded during wishlist extraction if they exist in the library already, 
          // but there are certain cases where that can change later....
          this.divideLargerDatapoints(zip, _.unionBy(libraryData.books, libraryData.wishlist, 'asin'));
        }
        else {
          if ( libraryData.wishlist ) this.divideLargerDatapoints(zip,libraryData.wishlist);
          if ( libraryData.books    ) this.divideLargerDatapoints(zip,libraryData.books);
        }
        
        // Split page data into separate files...
        zip.file("data/temp-data."+ vue.cacheBuster +".js", "window.tempDataJSON = " + JSON.stringify(tempData) + ";");
        
        if ( libraryData.books       ) {
          zip.file("data/library."+ vue.cacheBuster +".js", "window.libraryJSON = " + JSON.stringify(libraryData.books) + ";");
        }
        if ( libraryData.collections ) {
          zip.file("data/collections."+ vue.cacheBuster +".js", "window.collectionsJSON = " + JSON.stringify(libraryData.collections) + ";");
        }
        if ( libraryData.series      ) {
          zip.file("data/series."+ vue.cacheBuster +".js", "window.seriesJSON = " + JSON.stringify(libraryData.series) + ";");
        }
        if ( libraryData.wishlist    ) {
          zip.file("data/wishlist."+ vue.cacheBuster +".js", "window.wishlistJSON = " + JSON.stringify(libraryData.wishlist) + ";");
        }
        
        // Make sure unnecessary files are excluded
        _.remove( vue.files, function( file ) {
          return _.includes([
            "chunks/save-csv.js",
            "chunks/save-gallery.js",
            "chunks/save-gallery.css",
            "chunks/save-locally.css",
            "chunks/save-locally.js",
          ], file);
        });

        // Service worker file
        // if ( useServiceWorker ) {
        //   zip.file( `service-worker.${vue.cacheBuster}.js`, this.serviceWorker( libraryData ) );
        // }
        
        for (let url of vue.files) {
          
          const data = await JSZipUtils.getBinaryContent(url);

          if ( url === "gallery.js" ) {
            url = url.replace(".js", "." + vue.cacheBuster + ".js");
          } else if ( url === "gallery.css" ) {
            url = url.replace(".css", "." + vue.cacheBuster + ".css");
          }
          // else if ( url.match(/\.woff2?$/) ) {
          //   url = url.replace(/^\.\.\//, '');
          // }

          zip.file(url, data, {binary: true});
          
        }

        const content = await zip.generateAsync({type: "blob", streamFiles: true}, function updateCallback(metadata) {
          vue.progressWidth = metadata.percent + '%';
        });

        saveAs(content, "ALE-gallery.zip");
        
      }
      finally {
        setTimeout(function () {
          vue.bundling = false;
          vue.$store.commit("prop", { key: 'bundlingGallery', value: false });
          vue.progressWidth = 0;
        }, 1000);
      }
    },

    sourceChecked: function( e, item ) {

      let vue = this;

      // Toggle children with parent
      let children = _.filter( this.dataSources, function( source ) {
        return _.isArray(source.parent) ? _.includes(source.parent, item.key) : source.parent === item.key;
      });
      _.each( children, function( child ) {

        if ( _.isArray(child.parent) ) {

          let parents = _.map( child.parent, function( parent ) {
            return _.find( vue.dataSources, { key: parent });
          });
          let parentsEnabled = _.filter( parents, function( parent) {
            return parent.checked && !parent.disabled;
          }).length > 0;

          child.disabled = (!e.target.checked && !parentsEnabled);

        }
        else {
          child.disabled = !e.target.checked;
        }


      });

      // Disable download button if the chosen data sources aren't going to work...
      let checkedSources = _.filter( this.dataSources, { checked: true, disabled: false });
      this.saveBtnEnabled = !!checkedSources.length;

      this.$store.commit('stickyProp', { key: 'exportSettingsGallery', value: this.dataSources });

    },

    excludeData: function( data ) {

      let vue = this;

      _.each( this.dataSources, function( item ) {

        var lowercaseKey = item.key.toLowerCase();
        var itemDisabled = !item.checked || item.disabled;
        switch ( item.key ) {
          case "Library":
            if ( itemDisabled ) {
              delete data.books;
              delete data.series;
              delete data.collections;
            }
            break;

          case "Series":
            if ( itemDisabled ) {
              delete data.series;
            }
            break;

          case "Collections":
            if ( itemDisabled ) delete data.collections;
            break;

          case "Wishlist":
            if ( itemDisabled ) {
              delete data.wishlist;
            }
            break;
            
          case "Export archived books":
            if ( itemDisabled ) {
              let collections = data.collections;
              let archive = collections ? _.find( collections, { id: '__ARCHIVE' }) : null;
              if ( archive && archive.books.length > 0 && data.books ) {
                _.remove( data.books, 'archived');
                
                // Removes archived books from series
                if ( data.series ) {
                  _.each( data.series, function( series ) {
                    if ( series.books.length > 0 ) {
                      _.remove( series.books, function( book ) {
                        return _.includes( archive.books, book );
                      });
                    }
                    if ( series.allBooks.length > 0 ) {
                      _.each( series.allBooks, function( book ) {
                        const inArchive = _.includes( archive.books, book.asin );
                        if ( inArchive ) book.notInLibrary = true;
                      });
                    }
                  });
                  _.remove( data.series, function( series) {
                    return series.books.length === 0;
                  });
                }
                
                // Makes sure archived won't show up in any other collection either...
                _.each( collections, function( collection ) {
                  _.remove( collection.books, function( book ) {
                    return _.includes( archive.books, book );
                  });
                });
              }
              if ( archive ) _.remove( collections, function( collection ) {
                return collection.id === '__ARCHIVE' || !collection.books || collection.books.length === 0;
              });
            }
            break;
            
        }

        if ( item.subPage ) {

          data.extras.subPageStates = data.extras.subPageStates || [];
          data.extras.subPageStates.push({
            key: lowercaseKey,
            enabled: !itemDisabled
          });

        }

      });

      return data;

    },

    serviceWorker: function() {

      let vue = this;

      return `
      importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');

      workbox.setConfig({
        debug: false,
      });

      const {registerRoute} = workbox.routing;
      const {
        NetworkFirst,
        StaleWhileRevalidate,
        CacheFirst
      } = workbox.strategies;
      const CacheableResponsePlugin = workbox.cacheableResponse.CacheableResponsePlugin;
      const ExpirationPlugin = workbox.expiration.ExpirationPlugin;

      // Cache page navigations (html) with a Network First strategy
      registerRoute(
        // Check to see if the request is a navigation to a new page
        ({ request }) => request.mode === 'navigate',
        // Use a Network First caching strategy
        new NetworkFirst({
          // Put all cached files in a cache named 'pages'
          cacheName: 'pages',
          plugins: [
            // Ensure that only requests that result in a 200 status are cached
            new CacheableResponsePlugin({
              statuses: [200],
            }),
          ],
        }),
      );

      // Cache CSS, JS, and Web Worker requests with a Stale While Revalidate strategy
      registerRoute(
        // Check to see if the request's destination is style for stylesheets, script for JavaScript, or worker for web worker
        ({ request }) =>
          request.destination === 'style' ||
          request.destination === 'script' ||
          request.destination === 'worker',
        // Use a Stale While Revalidate caching strategy
        new StaleWhileRevalidate({
          // Put all cached files in a cache named 'assets'
          cacheName: 'assets',
          plugins: [
            // Ensure that only requests that result in a 200 status are cached
            new CacheableResponsePlugin({
              statuses: [200],
            }),
          ],
        }),
      );

      // Cache images with a Cache First strategy
      registerRoute(
        // Check to see if the request's destination is style for an image
        ({ url, request }) =>
          (request.destination === 'image' && url.origin !== 'https://m.media-amazon.com') ||
          (request.destination === 'image' && url.origin === 'https://m.media-amazon.com' && !url.href.match(/_SL200_/) && !url.href.match(/_SL150_/)),
        // Use a Cache First caching strategy
        new CacheFirst({
          // Put all cached files in a cache named 'images'
          cacheName: 'images',
          plugins: [
            // Ensure that only requests that result in a 200 status are cached
            new CacheableResponsePlugin({
              statuses: [200],
            }),
            // Don't cache more than 50 items, and expire them after 30 days
            new ExpirationPlugin({
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
            }),
          ],
        }),
      );

      // Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
      registerRoute(
        ({url}) => url.origin === 'https://fonts.googleapis.com',
        new StaleWhileRevalidate({
          cacheName: 'google-fonts-stylesheets',
        })
      );

      // Cache the underlying font files with a cache-first strategy for 1 year.
      registerRoute(
        ({url}) => url.origin === 'https://fonts.gstatic.com',
        new CacheFirst({
          cacheName: 'google-fonts-webfonts',
          plugins: [
            new CacheableResponsePlugin({
              statuses: [0, 200],
            }),
            new ExpirationPlugin({
              maxAgeSeconds: 60 * 60 * 24 * 365,
              maxEntries: 30,
            }),
          ],
        })
      );
      `;
    },

    runCachebuster: function() {
      return new Date().getTime();
    }
  }

};
</script>

<style lang="scss" scoped>
.cancel-packaging {
  cursor: pointer;
  border: 1px dashed rgba(#fff, .4);
  background: transparent;
  color: #fff;
  float: right;
  padding: 1px 6px;
  border-radius: 3px;
}

.opt-groups {
  flex-direction: column !important;
  .opt-group {
    flex-direction: row !important;
    justify-content: space-between !important;
    margin: 0 !important;
    
    > div {
      padding-top: 0px !important;
    }
    
    .item-0 { width: 100px; }
    .item-1 { width: 100px; }
    .item-2 { width: 100px; }
    .item-3 { width: 100px; }
    [data-extra] { width: auto; }
  }
}

.opt-group label {
  display: inline-flex !important;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  // margin-bottom: 8px;
  padding: 6px !important;
}

.opt-group {
  position: relative;
  z-index: 0;
}

.opt-group input {
  opacity: 0;
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
}

.opt-group .visual-checkbox {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width:  17px;
  height: 17px;
  background: #292929;
  border-radius: 4px;
  margin-right: 5px;
}

.opt-group .visual-checkbox .icon {
  display: none;
  color: #00ed00;
}

.opt-group label input:checked ~ .visual-checkbox .icon {
  display: inline-block;
}

.opt-group > .disabled {
  opacity: .6;
  cursor: default !important;
  .visual-checkbox .icon {
    color: inherit;
  }
}

.top-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding-bottom: 35px;
  border-bottom: 2px solid rgba(#000, .15);
  margin-bottom: 5px;
}

</style>
