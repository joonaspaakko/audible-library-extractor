<template>
  <div class="export-group">

    <h2><font-awesome fas icon="th" /> Stand-alone gallery</h2>

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
        <button class="save-btn save-gallery" :class="{ saving: bundling }" @click="saveButtonClicked" :disabled="bundling || !saveBtnEnabled">
          <span><strong v-if="bundling">Packaging:</strong> ALE-gallery.zip</span>
            <font-awesome v-if="bundling" :icon="['fas', 'spinner']" spin />
            <font-awesome v-else :icon="['fas', 'download']" />
            <div v-if="bundling && progressWidth" class="progress" :style="{ width: progressWidth }"></div>
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
  data: function() {
    return {
      files: [
        "output-page.js",
        "output-page.css",
        
        "chunks/487.css",
        "chunks/487.js",
        "chunks/487.js.LICENSE.txt",
        "chunks/564.js",
        "chunks/564.js.LICENSE.txt",
        "chunks/audio-player.css",
        "chunks/audio-player.js",
        "chunks/authors.css",
        "chunks/authors.js",
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
        "chunks/narrators.css",
        "chunks/narrators.js",
        "chunks/save-csv.js",
        "chunks/save-gallery.js",
        "chunks/save-locally.css",
        "chunks/save-locally.js",
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
        { checked: true, disabled: false, key: 'Collections', parent: 'Library' },
        { checked: true, disabled: false, key: 'Categories', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Series', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Authors', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Narrators', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Publishers', parent: ['Library', 'Wishlist'], subPage: true },
        { checked: true, disabled: false, key: 'Wishlist' },
      ],
      zip: null,
      cacheBuster: null,
      bundling: false,
      saveBtnEnabled: true,
      progressWidth: null,
    };
  },
  
  beforeMount: function() {
    
    if ( this.$store.state.sticky.exportSettingsGallery ) {
      let vue = this;
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
        if ( fileData !== '' ) zip.file("data/split-book-data/"+ book.asin +"."+ vue.cacheBuster +".js", fileData);
      });
    },
    
    saveButtonClicked: function() {
      if ( !this.bundling ) {
        
        const vue = this;
        vue.bundling = true;
        vue.cacheBuster = this.runCachebuster();
        vue.zip = new JSZip();
        const zip = vue.zip;
        
        let libraryData = this.excludeData( JSON.parse(JSON.stringify(this.$store.state.library)) );
        
        libraryData.extras.cacheID = vue.cacheBuster;
        
        let tempData = {
          books: !!libraryData.books,
          series: !!libraryData.series,
          collections: !!libraryData.collections,
          wishlist: !!libraryData.wishlist,
          extras: libraryData.extras,
        };
        
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
            '<link id="ale-css" rel="stylesheet" href="output-page.' + vue.cacheBuster + '.css">' +
          "</head>" +
          "<body>" +
          
            '<div id="audible-library-extractor" :data-version="'+ this.$store.state.version +'"></div>' +
            '<script id="ale-js" src="output-page.' + vue.cacheBuster +'.js"><\/script>' +
            "<noscript>This library requires javascript to work!</noscript>" +
            
          "</body>" +
          "</html>";
        
        zip.file("index.html", indexHTML);
        
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
        zip.file("data/library."+ vue.cacheBuster +".js", "window.tempDataJSON = " + JSON.stringify(tempData) + ";");
        if ( libraryData.books       ) zip.file("data/library."+     vue.cacheBuster +".js", "window.libraryJSON = " + JSON.stringify(libraryData.books) + ";");
        if ( libraryData.collections ) zip.file("data/collections."+ vue.cacheBuster +".js", "window.collectionsJSON = " + JSON.stringify(libraryData.collections) + ";");
        if ( libraryData.series      ) zip.file("data/series."+      vue.cacheBuster +".js", "window.seriesJSON = " + JSON.stringify(libraryData.series) + ";");
        if ( libraryData.wishlist    ) zip.file("data/wishlist."+    vue.cacheBuster +".js", "window.wishlistJSON = " + JSON.stringify(libraryData.wishlist) + ";");
        
        let files = this.files;
        
        // Make sure unnecessary files are excluded
        _.remove( this.files, function( file ) {
          return _.includes([
            "chunks/save-csv.js",
            "chunks/save-gallery.js",
            "chunks/save-locally.css",
            "chunks/save-locally.js",
          ], file);
        });
        
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
              zip.generateAsync({ type: "blob", streamFiles: true }, function updateCallback(metadata) {
                vue.progressWidth = metadata.percent + '%';
              }).then(function(content) {
                saveAs(content, "ALE-gallery.zip");
                setTimeout(function() { vue.bundling = false; vue.progressWidth = 0; }, 1000);
              });
            }
          });
        });
        
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
      
      return data;
      
    },

    runCachebuster: function() {
      return new Date().getTime();
    }
  }
  
};
</script>
