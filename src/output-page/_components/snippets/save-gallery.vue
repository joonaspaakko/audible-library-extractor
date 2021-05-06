<template>
  <div class="export-group">

    <h2><font-awesome fas icon="th" /></i> Stand-alone gallery</h2>

    <div class="description">
      This saves the gallery as a stand-alone web page that can be uploaded online and shared or viewed as is by unpacking the zip file and opening the index.html file in a web browser.
    </div>
    
    <h3>Pages:</h3>

    <div class="options opt-groups">
      <div class="opt-group" v-for="(group, index) in chunkSource" :key="index">
        <label v-for="item in group" :key="item.key">
          <input type="checkbox" :disabled="item.disabled" v-model="item.checked" @change="sourceChecked($event, item)"> {{ item.key }}
        </label>
      </div>
    </div>

    <div class="buttons-footer">
      <div class="btn-wrapper">
        <button class="save-btn" :class="{ saving: bundling }" @click="saveButtonClicked" :disabled="bundling || !saveBtnEnabled">
          <span>ALE-gallery.zip</span>
            <font-awesome v-if="bundling" :icon="['fas', 'spinner']" spin />
            <font-awesome v-else :icon="['fas', 'download']" />
        </button>
        <div>
          <a class="github-btn" target="_blank" href="https://joonaspaakko.gitbook.io/audible-library-extractor/sharing/uploading-to-github"> 
            <span>Upload instructions</span>
            <font-awesome :icon="['fab', 'github']" />
          </a>
          <a class="github-btn" target="_blank" href="https://joonaspaakko.gitbook.io/audible-library-extractor/sharing/updating-gallery-in-github"> 
            <span>Update instructions</span>
            <font-awesome :icon="['fab', 'github']" />
          </a>
        </div>
        <!--
        <div class="file-desc">
          You can upload the files to Github for free. See instructions <a href="https://joonaspaakko.gitbook.io/audible-library-extractor/sharing/uploading-to-github" target="_blank">here</a>.
        </div>
        -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "saveGallery",
  mounted: function() {
    
    if ( this.$store.state.sticky.exportSettingsGallery ) {
      this.dataSources = this.$store.state.sticky.exportSettingsGallery;
    }
    
  },
  data: function() {
    return {
      files: [
        "output-page.js",
        "output-page.css",
        
        "chunks/18.css",
        "chunks/18.js",
        "chunks/128.js",
        "chunks/128.js.LICENSE.txt",
        "chunks/833.js",
        "chunks/audio-player.css",
        "chunks/audio-player.js",
        "chunks/book-Details.css",
        "chunks/book-Details.js",
        "chunks/book.css",
        "chunks/book.js",
        "chunks/categories.css",
        "chunks/categories.js",
        "chunks/collections.css",
        "chunks/collections.js",
        "chunks/gallery.css",
        "chunks/gallery.js",
        "chunks/grid-view.css",
        "chunks/grid-view.js",
        "chunks/series.css",
        "chunks/series.js",
        "chunks/sort-values.css",
        "chunks/sort-values.js",
        "chunks/splide.js",
        "chunks/splide.js.LICENSE.txt",
        "chunks/spreadsheet-view.css",
        "chunks/spreadsheet-view.js",
        "chunks/view-mode-switcher.css",
        "chunks/view-mode-switcher.js",
        
        "favicons/android-chrome-192x192.png",
        "favicons/android-chrome-512x512.png",
        "favicons/apple-touch-icon.png",
        "favicons/browserconfig.xml",
        "favicons/favicon-16x16.png",
        "favicons/favicon-32x32.png",
        "favicons/favicon.ico",
        "favicons/mstile-150x150.png",
        "favicons/safari-pinned-tab.svg",
        "favicons/app.webmanifest"
      ],
      dataSources: [
        { checked: true, disabled: false, key: 'Library' },
        { checked: true, disabled: false, key: 'Categories', parent: 'Library', subPage: true },
        { checked: true, disabled: false, key: 'Series', parent: 'Library', subPage: true },
        { checked: true, disabled: false, key: 'Authors', parent: 'Library', subPage: true },
        { checked: true, disabled: false, key: 'Narrators', parent: 'Library', subPage: true },
        { checked: true, disabled: false, key: 'Collections', parent: 'Library' },
        { checked: true, disabled: false, key: 'Wishlist' },
      ],
      zip: null,
      cacheBuster: null,
      bundling: false,
      saveBtnEnabled: true,
    };
  },
  
  beforeDestroy: function() {
    this.zip = null;
    this.cacheBuster = null;
  },
  
  computed: {
    chunkSource: function() {
      return _.chunk(this.dataSources, 2);
    },
  },
  
  methods: {
    saveButtonClicked: function() {
      if ( !this.bundling ) {
        
        const vue = this;
        vue.bundling = true;
        vue.cacheBuster = this.runCachebuster();
  
        const libraryData = this.excludeData( JSON.parse(JSON.stringify(this.$store.state.library)) );
        
        vue.zip = new JSZip();
        const zip = vue.zip;
  
        const indexHTML =
          "<!DOCTYPE html>" +
          '<html lang="en" class="theme-light standalone-gallery">' +
          "<head>" +
            '<meta charset="UTF-8">' +
            // '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1">' +
            '<meta http-equiv="X-UA-Compatible" content="ie=edge">' +
            '<meta name="apple-mobile-web-app-capable" content="yes">' +
            '<meta name="mobile-web-app-capable" content="yes">' +
            '<link rel="apple-touch-icon" sizes="180x180" href="favicons/apple-touch-icon.png">' +
            '<link rel="icon" type="image/png" sizes="32x32" href="favicons/favicon-32x32.png">' +
            '<link rel="icon" type="image/png" sizes="16x16" href="favicons/favicon-16x16.png">' +
            '<link rel="manifest" href="favicons/app.webmanifest">' +
            '<link rel="mask-icon" href="favicons/safari-pinned-tab.svg" color="#f29a33">' +
            '<link rel="shortcut icon" href="favicons/favicon.ico">' +
            '<meta name="msapplication-TileColor" content="#222222">' +
            '<meta name="msapplication-config" content="favicons/browserconfig.xml">' +
            '<meta name="theme-color" content="#f29a33">' +
            "<title>My Audible Library</title>" +
            '<script id="library-data" type="application/json">' + libraryData + "<\/script>" +
            '<link id="ale-css" rel="stylesheet" href="output-page.' + vue.cacheBuster + '.css">' +
          "</head>" +
          "<body>" +
          
            '<div id="audible-library-extractor"></div>' +
            '<script id="ale-js" src="output-page.' + vue.cacheBuster +'.js"><\/script>' +
            "<noscript>This library requires javascript to work!</noscript>" +
            
          "</body>" +
          "</html>";
        
        zip.file("index.html", indexHTML);
        
        
        // If I can't fetch these files locally, then what's the point...
        
        // const asins = _.map( this.$store.state.library.books, function( o ) {
        //   if ( o.asin ) return o.asin;
        // });
        // zip.file("data/library/asins.json", JSON.stringify(asins));
        // _.each( this.$store.state.library.books, function( book ) {
        //   zip.file("data/library/book."+ book.asin +".json", JSON.stringify( book ));
        // });
        
        // zip.file("data/collections.json", JSON.stringify(this.$store.state.library.collections));
        // zip.file("data/series.json",      JSON.stringify(this.$store.state.library.series));
        // zip.file("data/wishlist.json",    JSON.stringify(this.$store.state.library.wishlist));
        // zip.file("data/extras.json",      JSON.stringify(this.$store.state.library.extras));
        
        let files = this.files;
        
        // Just thinking out loud...
        // let books = this.$store.state.library.wishlist.concat( this.$store.state.library.books );
        // books = _.map( books, function( o ) {
        //   if ( o.cover ) return vue.makeCoverUrl( o.cover );
        // });
        // books = _.union( books );
        // files = files.concat( books );
        
        let count = 0;
        _.each(files, function(url) {
          JSZipUtils.getBinaryContent(url, function(err, data) {
            if (err) throw err;
  
            if (url === "output-page.js") {
              url = url.replace(".js", "." + vue.cacheBuster + ".js");
            } else if (url === "output-page.css") {
              url = url.replace(".css", "." + vue.cacheBuster + ".css");
            }
  
            zip.file(url, data, { binary: true });
  
            count++;
            if (count == files.length) {
              zip.generateAsync({ type: "blob" }).then(function(content) {
                setTimeout(function() {
                  vue.bundling = false;
                }, 1000);
                saveAs(content, "ALE-gallery.zip");
              });
            }
          });
        });
        
      }
    },
    
    sourceChecked: function( e, item ) {
      
      // Toggle children with parent
      let children = _.filter( this.dataSources, { parent: item.key });
      _.each( children, function( item ) {
        item.disabled = !e.target.checked;
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
            if ( itemDisabled ) delete data.series;
            break;
            
          case "Collections":
            if ( itemDisabled ) delete data.collections;
            break;
            
          case "Wishlist":
            if ( itemDisabled ) {
              delete data.wishlist;
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
      
      return JSON.stringify( data );
      
    },

    runCachebuster: function() {
      return new Date().getTime();
    }
  }
  
};
</script>
