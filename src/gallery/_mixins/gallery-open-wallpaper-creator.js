export default {
  methods: {

    // Chunks a book array into the shape the wallpaper creator expects, stashes it,
    // and opens the editor. Pass any book array: the current page's filtered
    // collection, or a whole unfiltered source picked from the fallback prompt.
    openWallpaperCreator: function( books, pageTitle, pageSubTitle ) {
      try {

        let covers = _.filter( books, 'asin' );
        covers = JSON.parse(JSON.stringify( covers ));
        covers = _.chunk( covers, 50 );

        let imageEditor = {
          chunks: covers,
          chunksLength: covers.length,
          timeCode: new Date().getTime(),
        };

        if ( pageTitle    ) imageEditor.pageTitle = pageTitle;
        if ( pageSubTitle ) imageEditor.pageSubTitle = pageSubTitle;

        chrome.storage.local.set({ imageEditor }).then(() => {
          chrome.runtime.sendMessage({ action: "openImageEditor" });
        });

      }
      catch (e) {}
    },

  }
};
