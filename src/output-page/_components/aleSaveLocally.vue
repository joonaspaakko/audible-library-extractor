<template>
  <div
    id="ale-save-locally"
    class="icon"
    @click="saveButtonClicked"
    content="<strong>Save the gallery locally,</strong> so you can share it with others. <br>Free Github hosting: <a target='_blank' href='https://github.com/joonaspaakko/audible-library-extractor#save-gallery-locally'>instructions</a>"
    v-tippy="{ interactive: true, allowHTML: true }"
  >
    <font-awesome fas icon="save" />
  </div>
</template>

<script>
// import jsZip from 'jszip';
// import { saveAs } from 'file-saver';
// import JSZipUtils from 'jszip-utils';

import makeCoverUrl from "@output-mixins/makeCoverUrl";

export default {
  name: "aleSaveLocally",
  mixins: [makeCoverUrl],
  
  data: function() {
    return {
      zip: null,
      cacheBuster: null
    };
  },
  beforeDestroy: function() {
    this.zip = null;
    this.cacheBuster = null;
  },

  methods: {
    saveButtonClicked: function() {
      const vue = this;
      vue.cacheBuster = this.runCachebuster();

      const libraryData = JSON.stringify(this.$store.state.library);
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
      
      let files = [
        "output-page.js",
        "output-page.css",
        
        "chunks/312.js",
        "chunks/482.css",
        "chunks/482.js",
        "chunks/499.js",
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
      ];
      
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
              saveAs(content, "ALE-gallery.zip");
            });
          }
        });
      });
    },

    runCachebuster: function() {
      return new Date().getTime();
    }
  }
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

.tippy-popper {
  a {
    color: #fff;
    text-decoration: underline;
  }
  a:visited {
    color: darken(#fff, 30);
  }
}
</style>
