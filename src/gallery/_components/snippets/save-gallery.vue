<template>
<gallery-modal :preventClose="githubSyncing" @closeModal="$emit('closeComp')">
  
  <div class="export-group" :class="{ bundling: bundling }">

    <!-- GUI dark/light mode debugging -->
    <!-- <gallery-light-switch /> -->
    
    <div class="top-wrapper">
      <div class="icon-wrapper" :style="{ fontSize: iconSize/1.2  + 'px', lineHeight: iconSize/1.2  + 'px', paddingRight: iconSize / 2.5 + 'px' }">
        <ep-grid/>
      </div>
      <div class="text-wrapper" ref="textWrapper">
        <h2>Stand-alone gallery</h2>
        
        <div class="description">
          Create a shareable website version of your library. Publish it online instantly, or download the files for manual hosting.
        </div>
      </div>
    </div>
    
    <h3>Include:</h3>

    <div class="options opt-groups">
      <div class="opt-group" v-for="(group, groupIndex) in chunkSource" :key="groupIndex" :class="[ 'group-' + groupIndex ]">
        <label 
          v-for="(item, itemIndex) in group" 
          :key="item.key" 
          :class="[ 
            'item-' + itemIndex, 
            item.disabled ? 'disabled' : null, 
            item.spacer ? 'hide-spacer': null
          ]" 
          :data-extra="item.extra"  
          v-tippy :content="item.tippy"
        >
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
    
    <!-- <h3>Output:</h3>
    
    <div>Hosted online</div>
    <div v-tippy content="Only use this option if you wish to view the gallery locally on your computer. Don't upload this online, unless you're really into slow load times.">Local viewing</div> -->

    <div class="buttons-footer">
      
      <div v-if="$store.state.devMode" style="color: #999; font-weight: bold; margin-bottom: 5px;">
        Saving the standalone gallery is only possible <br> in "production" builds (<code>yarn vite build</code>)
      </div>
        
      <div class="btn-wrapper">
        
        <github v-if="!$store.state.standalone" v-model:active="githubApiProcessActive" :getFiles="saveButtonClicked" @syncing-changed="githubSyncing = $event" />

        <div v-if="!githubApiProcessActive" class="non-github-api-wrapper">
          
          <div class="divider">
            <span>OR</span>
          </div>
          
          <div class="zip-export-wrapper">
            <div class="zip-inner-wrapper">
              
              <div class="icon">
                <fluent-folder-zip-20-filled />
              </div>
              
              <div class="github-instructions">
                Export your gallery as a ZIP file that you can host the files yourself. If choose to upload your files to Github manually:  <a target="_blank" rel="noopener noreferrer" href="https://joonaspaakko.gitbook.io/audible-library-extractor/sharing/uploading-to-github">upload instructions</a>, <a target="_blank" rel="noopener noreferrer" href="https://joonaspaakko.gitbook.io/audible-library-extractor/sharing/uploading-to-github/updating-gallery-in-github">update instructions</a>.
              </div>
              
              <button class="export-zip-btn" :class="{ saving: bundling }" @click="saveButtonClicked({ zip: true })" :disabled="!$store.state.devMode && (bundling || !saveBtnEnabled)">
                <line-md-downloading-loop v-if="bundling" />
                <fa6-solid-download v-else />
                <span><strong v-if="bundling">Packaging:</strong> ALE-gallery.zip</span>
                <button class="cancel-packaging" v-if="bundling" @click="cancelZipping">cancel</button>
                <div>
                  <div v-if="bundling && progressWidth" class="progress" :style="{ width: progressWidth }"></div>
                </div>
              </button>
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  </div>
  
</gallery-modal>
</template>


<script>
import modal from '@output-snippets/gallery-modal.vue';
// import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";
import { zip, strToU8 } from 'fflate';
import { storageSet } from '@utils/chrome-storage.js';
import { downloadBlob } from '@utils/download.js'; 

export default {
  name: "saveGallery",
  // mixins: [makeCoverUrl],
  components: {
    modal,
  },
  data: function() {
    return {
      files: [],
      dataSources: [
        { checked: true, disabled: false, key: 'Library' },
        { checked: true, disabled: false, key: 'Categories', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Authors', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Publishers', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Series', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Narrators', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Collections', parent: 'Library' },
        { checked: true, disabled: false, key: 'Podcasts', parent: 'Library' },
        { checked: true, disabled: false, key: `Archived`, extra: true, tippy: 'If unchecked, the "archive" collection and all archived books are excluded from the export.', parent: 'Library' },
        { checked: true, disabled: false, key: 'Wishlist' },
        { checked: true, disabled: false, key: 'My Reviews', parent: ['Library'] },
        { checked: true, disabled: false, key: 'spacer-1', spacer: true },
        // { checked: true, disabled: false, key: 'spacer-2', spacer: true },
        
      ],
      zip: null,
      cacheBuster: null,
      bundling: false,
      githubSyncing: false,
      saveBtnEnabled: true,
      progressWidth: null,
      iconSize: 20,
      githubApiProcessActive: false,
    };
  },

  created: function() {
    
    this.files = window.galleryFilePaths;
    
    if ( this.$store.state.sticky.exportSettingsGallery ) {
      _.each(this.$store.state.sticky.exportSettingsGallery, ( stickySource ) => {
        var source = _.find(this.dataSources, { key: stickySource.key });
        if ( source ) {
          source.checked = stickySource.checked;
          source.disabled = stickySource.disabled;
        }
      });      
    }

    let librarySource = _.find( this.dataSources, { key: 'Library' });
    librarySource.disabled =  !this.$store.state.audibledata.library;
    let wishlistSource = _.find( this.dataSources, { key: 'Wishlist' });
    wishlistSource.disabled =  !this.$store.state.audibledata.wishlist;
    let podcastsSource = _.find( this.dataSources, { key: 'Podcasts' });
    podcastsSource.disabled = _.isEmpty(this.$store.getters.podcasts);
    let myReviews = _.find( this.dataSources, { key: 'My Reviews' });
    myReviews.disabled = _.isEmpty(this.$store.state.audibledata.userReviews);

    // let archivedBookFound = _.find( this.$store.state.audibledata.library, o => _.includes(o.collectionIds, '__ARCHIVE') );
    // if ( !archivedBookFound ) {
    //   let archivedSource = _.find( this.dataSources, { key: 'Archived' });
    //   if ( archivedSource ) archivedSource.disabled = false;
    // }
    
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
          storageSet( 'metadata', 'config', newConfig ).then(function() {
            vue.saveButtonClicked({ zip: true });
          });

        } catch (e) {}
      });
    }

  },

  beforeUnmount: function() {
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
    //  Old code that makes 1 file per book (thousands of files). Keeping it for testing purposes...
    // divideLargerDatapoints: function( files, books ) {
    //    _.each(books, (book) => {
    //     let fileData = '';
    //     if (book.peopleAlsoBought && book.asin) {
    //       fileData += "window.peopleAlsoBoughtJSON = " + JSON.stringify(book.peopleAlsoBought) + "; \n";
    //       delete book.peopleAlsoBought;
    //     }
    //     if (book.summary && book.asin) {
    //       fileData += "window.bookSummaryJSON = " + JSON.stringify(book.summary) + "; \n";
    //       delete book.summary;
    //     }
    //     if (fileData !== '') {
    //       files.add("data/split-book-data/" + book.asin + "." + this.cacheBuster + ".js", fileData);
    //     }
    //   });
    // },
    
    // Book ASIN is used to identify the correct file later
    divideLargerDatapoints: function( files, books ) {
      const extractableKeys = ['peopleAlsoBought', 'summary'];
      const maxChunkKB = 1000 * 1024;

      let chunkIndex = 0;
      let chunkData = [];
      let currentSize = 0;

      _.each(books, (book) => {
      
        const extracted = _.pick(book, extractableKeys);

        if (_.isEmpty(extracted)) return;

        const entry = {
          asin: book.asin,
          ...extracted,
        };

        const entrySize = JSON.stringify(entry).length;

        if (chunkData.length > 0 && (currentSize + entrySize) > maxChunkKB) {
          files.add(`data/split-book-data/chunk-${chunkIndex}.${this.cacheBuster}.json`, JSON.stringify(chunkData));

          chunkIndex++;
          chunkData = [];
          currentSize = 0;
        }

        book.chunkId = chunkIndex;

        chunkData.push(entry);
        currentSize += entrySize;
        
        _.each(extractableKeys, key => _.unset(book, key));

      });

      // Save final chunk
      if ( chunkData.length > 0 ) files.add(`data/split-book-data/chunk-${chunkIndex}.${this.cacheBuster}.json`, JSON.stringify(chunkData));
      
    },

    saveButtonClicked: async function (action = {}) {
      const vue = this;

      if ( this.bundling || this.$store.state.devMode ) return;
      
      try {
        vue.bundling = true;
        vue.progressWidth = '0%';
        vue.$store.commit("prop", { key: 'bundlingGallery', value: true });
        
        vue.cacheBuster = this.runCachebuster();
        
        const files = (() => {
          
          const collector = [];
          
          return {
            add(path, content, options = {}) {
              
              collector.push({ path, content, ...options });
              
            },

            get() {
              
              return collector.map(item => {
                let data = item.content;

                if (typeof data === 'string') {
                  data = strToU8(data);
                }

                return {
                  ...item,
                  content: data
                };
              });
              
            }
          };
          
        })();

        // I've had a few build errors so might as well make sure it never happens because this file doesn't exist...
        files.add(".nojekyll", '');
        
        let libraryData = this.excludeData( JSON.parse(JSON.stringify(this.$store.state.audibledata)) );

        libraryData.extras.cacheID = vue.cacheBuster;

        let tempData = {
          library    : !!_.get(libraryData, 'library.0'),
          series     : !!_.get(libraryData, 'series.0'),
          collections: !!_.get(libraryData, 'collections.0'),
          podcasts   : !_.isEmpty(_.filter(libraryData?.library, 'podcastParent')),
          wishlist   : !!_.get(libraryData, 'wishlist.0'),
          extras     : libraryData.extras,
          userReviews: !!_.get(libraryData, 'userReviews.0'),
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
        
        const useServiceWorker = true;
        loadServiceWorker = useServiceWorker ? '<script>'+ loadServiceWorker +'<\/script>' : '';
        
        const getFile = function( name, ext ) {
          let regex = "^assets\\/"+ name +"\\..+\\."+ (ext || "js") +"$";
          regex = new RegExp(regex);
          return _.find(vue.files, file => file.match(regex));
        };
        
        const indexHTML =
          "<!DOCTYPE html>" +
          '<html lang="en" class="theme-dark standalone-gallery" style="background: #171717; min-height: 100%;">' +
          "<head>" +
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2048-2732.jpg" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2732-2048.jpg" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1668-2388.jpg" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2388-1668.jpg" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1536-2048.jpg" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2048-1536.jpg" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1668-2224.jpg" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2224-1668.jpg" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1620-2160.jpg" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2160-1620.jpg" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1290-2796.jpg" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2796-1290.jpg" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1179-2556.jpg" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2556-1179.jpg" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1284-2778.jpg" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2778-1284.jpg" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1170-2532.jpg" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2532-1170.jpg" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1125-2436.jpg" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2436-1125.jpg" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1242-2688.jpg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2688-1242.jpg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-828-1792.jpg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1792-828.jpg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1242-2208.jpg" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-2208-1242.jpg" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-750-1334.jpg" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1334-750.jpg" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-640-1136.jpg" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">' + 
            '<link rel="apple-touch-startup-image" href="favicons/apple-splash-dark-1136-640.jpg" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">' + 
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
            '<script type="module" src="https://esm.sh/@khmyznikov/pwa-install"><\/script>' +
            loadServiceWorker +
            '<link id="ale-css" rel="stylesheet" href="'+ getFile('gallery', 'css') +'">' +
          "</head>" +
          "<body>" +
          
            '<div id="audible-library-extractor" data-version="'+ this.$store.state.version +'" data-cache-id="'+ vue.cacheBuster +'"></div>' +
            '<pwa-install use-local-storage styles=\'{"--tint-color": "#f29a33"}\'></pwa-install>' +
            '<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"><\/script>' +
            // '<script type="module" src="'+ lodashJS +'"><\/script>' +
            '<script id="ale-js" src="'+ getFile('gallery', 'js') +'" type="module"><\/script>' +
            "<noscript>This library requires javascript to work!</noscript>" +
            
          "</body>" +
            "</html>";

        files.add("index.html", indexHTML);
        
        files.add("ALE-Documentation.url", `[InternetShortcut]\nURL=https://joonaspaakko.gitbook.io/audible-library-extractor/`);

        // Split "peopleAlsoBought" into separate files and exclude from book data because 
        // it's a good amount of data that isn't necessarily needed immediately or all at once
        
        if ( libraryData.wishlist && libraryData.library ) {
          // Just to make sure no data file is created twice...
          // Books are excluded during wishlist extraction if they exist in the library already,
          // but there are certain cases where that can change later....
          this.divideLargerDatapoints(files, _.unionBy(libraryData.library, libraryData.wishlist, 'asin'));
        }
        else {
          if ( libraryData.wishlist ) this.divideLargerDatapoints(files, libraryData.wishlist);
          if ( libraryData.library  ) this.divideLargerDatapoints(files, libraryData.library);
        }

        // Split page data into separate files...
        files.add("data/temp-data."+ vue.cacheBuster +".js", "window.tempDataJSON = " + JSON.stringify(tempData) + ";");

        if ( tempData.library     ) {
          files.add("data/library."+ vue.cacheBuster +".js", "window.libraryJSON = " + JSON.stringify(libraryData.library) + ";");
        }
        if ( tempData.collections ) {
          files.add("data/collections."+ vue.cacheBuster +".js", "window.collectionsJSON = " + JSON.stringify(libraryData.collections) + ";");
        }
        if ( tempData.series      ) {
          files.add("data/series."+ vue.cacheBuster +".js", "window.seriesJSON = " + JSON.stringify(libraryData.series) + ";");
        }
        if ( tempData.wishlist    ) {
          files.add("data/wishlist."+ vue.cacheBuster +".js", "window.wishlistJSON = " + JSON.stringify(libraryData.wishlist) + ";");
        }
        if ( tempData.userReviews    ) {
          files.add("data/userReviews."+ vue.cacheBuster +".js", "window.userReviewsJSON = " + JSON.stringify(libraryData.userReviews) + ";");
        }
        
        let assetFiles = _.cloneDeep(vue.files);
        
        assetFiles = assetFiles.concat([
          "favicons/android-chrome-192x192.png",
          "favicons/android-chrome-512x512.png",
          "favicons/apple-touch-icon.png",
          "favicons/browserconfig.xml",
          "favicons/favicon-16x16.png",
          "favicons/favicon-32x32.png",
          "favicons/favicon.ico",
          "favicons/mstile-150x150.png",
          "favicons/safari-pinned-tab.svg",
          "favicons/apple-splash-dark-2436-1125.jpg",
          "favicons/apple-splash-dark-2532-1170.jpg",
          "favicons/apple-splash-dark-2048-1536.jpg",
          "favicons/apple-splash-dark-1620-2160.jpg",
          "favicons/apple-splash-dark-2796-1290.jpg",
          "favicons/apple-splash-dark-750-1334.jpg",
          "favicons/apple-splash-dark-1179-2556.jpg",
          "favicons/apple-splash-dark-1792-828.jpg",
          "favicons/apple-splash-dark-1284-2778.jpg",
          "favicons/apple-splash-dark-1668-2224.jpg",
          "favicons/apple-splash-dark-1242-2688.jpg",
          "favicons/apple-splash-dark-2224-1668.jpg",
          "favicons/apple-splash-dark-2732-2048.jpg",
          "favicons/apple-splash-dark-1334-750.jpg",
          "favicons/apple-splash-dark-1136-640.jpg",
          "favicons/apple-splash-dark-2778-1284.jpg",
          "favicons/apple-splash-dark-1290-2796.jpg",
          "favicons/apple-splash-dark-2208-1242.jpg",
          "favicons/apple-splash-dark-2388-1668.jpg",
          "favicons/apple-splash-dark-2048-2732.jpg",
          "favicons/apple-splash-dark-2160-1620.jpg",
          "favicons/apple-splash-dark-1536-2048.jpg",
          "favicons/apple-splash-dark-1668-2388.jpg",
          "favicons/apple-splash-dark-1170-2532.jpg",
          "favicons/apple-splash-dark-1242-2208.jpg",
          "favicons/apple-splash-dark-1125-2436.jpg",
          "favicons/apple-splash-dark-640-1136.jpg",
          "favicons/apple-splash-dark-2556-1179.jpg",
          "favicons/apple-splash-dark-828-1792.jpg",
          "favicons/apple-splash-dark-2688-1242.jpg",
          "app.webmanifest"
        ]);
        // vue.files.push('app.webmanifest');

        // Service worker file
        if ( useServiceWorker ) {
          files.add( `service-worker.${vue.cacheBuster}.js`, this.serviceWorker( libraryData ) );
        }
        
        const total = assetFiles.length;
        let done = 0;

        for (let url of assetFiles) {
          const res = await fetch(url);
          const buffer = await res.arrayBuffer();
          files.add(url, new Uint8Array(buffer));

          done++;
          vue.progressWidth = ((done / total) * 100).toFixed(1) + '%';
        }

        if ( action.zip ) {

          const items = files.get();
          const zipData = {};

          for ( const item of items ) {
            zipData[item.path] = [item.content, { level: 6 }];
          }
          
          zip(zipData, (err, data) => {
            
            if (err) return console.error(err);

            downloadBlob( new Blob([data], { type: 'application/zip' }), "ALE-gallery.zip" );
            
          });

        }
        else {
          return { files: files.get(), hasBooks: tempData.library };
        }
        
        
      }
      finally {
        setTimeout(function () {
          vue.bundling = false;
          vue.$store.commit("prop", { key: 'bundlingGallery', value: false });
          vue.progressWidth = '0%';
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
              delete data.library;
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
            
          case "My Reviews":
            if ( itemDisabled ) delete data.userReviews;
            break;

          case "Wishlist":
            if ( itemDisabled ) {
              delete data.wishlist;
            }
            break;
            
          case "Podcasts":
            if ( itemDisabled ) {
              const books = _.get(data, 'library');
              _.remove( books, (book) => {
                return _.get(book, "format") === 'Podcast' || _.get(book, "podcastParent");
              });
            }
            break;
            
          case "Archived":
            if ( itemDisabled ) {
              
              let archivedBooks = _.filter( vue.$store.state.audibledata.library, o => _.includes(o.collectionIds, '__ARCHIVE') );
                  archivedBooks = _.map( archivedBooks, 'asin' );
              
              // Remove any book that is in the archive collection
              _.remove( data.library, o => _.includes(o.collectionIds, '__ARCHIVE'));
              
              if ( data.series ) {
                // Removes archived books from series
                _.each( data.series, function( series ) {
                  if ( series.books.length ) {
                    _.remove( series.books, function( book ) {
                      return _.includes( archivedBooks, book );
                    });
                  }
                  if ( series.allBooks.length ) {
                    _.each( series.allBooks, function( book ) {
                      const inArchive = _.includes( archivedBooks, book.asin );
                      if ( inArchive ) book.notInLibrary = true;
                    });
                  }
                });
                // Remove series that have no books
                _.remove( data.series, function( series) {
                  return series.books.length === 0;
                });
              }
              
              // Remove archived books from collections
              _.each( data.collections, function( collection ) {
                _.remove( collection.books, function( book ) {
                  return _.includes( archivedBooks, book );
                });
              });
              
              // Remove archive collection
              _.remove( data.collections, function( collection ) {
                return collection.id === '__ARCHIVE';
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
      importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

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
    
    .item-0 { width: 100px !important; }
    .item-1 { width: 100px !important; }
    .item-2 { width: 100px !important; }
    .item-3 { width: 100px !important; }
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

.opt-group label {
  position: relative;
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
  @include themify($themes) {
    // background: themed(backColor);
    border: 1px solid rgba(themed(frontColor), .25);
  }
  // border: 1px solid #666;
  border-radius: 4px;
  margin-right: 5px;
}

.opt-group .visual-checkbox .icon {
  display: none;
  color: #00ed00;
  svg {
    width: 80%;
  }
}

.opt-group label input:checked ~ .visual-checkbox .icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
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

.hide-spacer {
  visibility: hidden;
}

.bundling .save-gallery {
  span,
  button {
    margin-left: auto !important;
  }
}

.export-zip-btn {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 11px;
  font-size: 1em;
  font-weight: normal;
  white-space: nowrap;
  cursor: pointer;
  @include themify($themes) {
    background: themed(audibleOrange);
    color: #fff;
  }
  border-width: medium;
  border-style: none;
  border-color: currentcolor;
  border-image: initial;
  padding: 7px 14px;
  border-radius: 6px;
  
  &.saving {
    -webkit-animation: vibrate-1 0.3s linear infinite both;
    animation: vibrate-1 0.3s linear infinite both;
    .progress {
      position: absolute;
      z-index: 1;
      bottom: 0;
      right: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: rgba(#fff, .7);
    }
  }
}

.buttons-footer {
  right: 0 !important;
}

.btn-wrapper {
  width: 100% !important;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  @include themify($themes) {
    color: rgba( themed(frontColor), .15);
  }
  font-family: sans-serif;
  font-weight: 500;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  @include themify($themes) {
    border-bottom: 1px solid rgba( themed(frontColor), .15);
  }
}

.divider::before {
  margin-right: 12px;
}

.divider::after {
  margin-left: 12px;
}

.github-instructions {
  margin: 0;
  opacity: 0.8;
  font-size: 1em;
  a {
    text-decoration: underline !important;
  }
}

.zip-export-wrapper {
  font-size: 1em;
  border-radius: 13px;
  padding: 10px;
  @include themify($themes) {
    color: themed(frontColor);
    border: 1px solid rgba(themed(frontColor), .15);
    box-shadow: themed(shadowSmall);
  }
  .theme-light & {
    box-shadow: 1px 1px 20px rgba(#000, .04), 1px 1px 3px rgba(#000, .03);
  }
  
  .zip-inner-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 24px 16px;
    
    .icon {
      font-size: 2rem;
      // opacity: 0.7;
    }
  }
}

</style>
