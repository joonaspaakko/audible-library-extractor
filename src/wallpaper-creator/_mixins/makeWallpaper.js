
import { zip, strToU8 } from 'fflate';

export default {
  data: function() {
    return {
      saveProgressWidth: -1,
    };
  },
  methods: {

    fetchWithRetry: async function( url, retries = 3 ) {
      for ( let i = 0; i < retries; i++ ) {
        try {
          const r = await fetch( url );
          return await r.arrayBuffer();
        }
        catch(e) {
          if ( i === retries - 1 ) throw e;
        }
      }
    },

    makeWallpaper: async function( params ) {
    
      // Don't allow multiple saves at once
      if ( this.store.saving ) return;

      // Update GUI state
      this.saveProgressWidth = 0;
      this.$store.commit("update", { key: "saving", value: true });

      // Let Vue render the saving state before blocking the thread with heavy work
      await this.$nextTick();

      try {

        const coversArray = this.coversArray();
        const zipData = {};
        
        // FETCH OPTIONS.JS
        zipData['options.js'] = [strToU8(`window.wallpaperOptions = ${JSON.stringify( this.editorOptions( coversArray.covers ) )};`), { level: 6 }];

        // FETCH INDEX.HTML 
        // The bundled wallpaper HTML file is renamed to index.html so it opens directly in a browser
        const indexRes = await fetch('single-file-animated-wallpaper.html');
        const indexBuffer = await indexRes.arrayBuffer();
        zipData['index.html'] = [new Uint8Array(indexBuffer), { level: 6 }];

        // FETCH COVERS
        // Capped at 10 concurrent requests — firing all at once causes ERR_INSUFFICIENT_RESOURCES on large libraries
        const books = coversArray.fetchCovers;
        const total = books.length;
        let fetched = 0;
        let activeCount = 0;
        let nextIndex = 0;
        
        // Downloads all covers concurrently (within the limit) and waits until every one is done
        await new Promise(( resolve, reject ) => {
          // Fills up to the concurrency limit, then stops until a slot opens up
          const fetchNext = () => {
            while ( activeCount < 10 && nextIndex < total ) {
              const book = books[nextIndex++];
              activeCount++;

              this.fetchWithRetry( book.cover )
                .then( buf => {
                
                  // Free up a slot so the while loop in fetchNext() can start another request
                  activeCount--;
                  
                  // Update progress
                  fetched++;
                  this.saveProgressWidth = (fetched / total) * 100;
                  
                  // JPEGs are already compressed so re-compressing wastes time
                  zipData['covers/' + book.asin + '.jpg'] = [new Uint8Array(buf), { level: 0 }];
                  
                  // Each completion opens a slot, so pull the next item from the queue
                  if ( fetched === total ) resolve();
                  else fetchNext();
                  
                })
                .catch( reject );
            }
          }
          fetchNext();
        });

        // GENERATE ZIP
        const data = await new Promise(( resolve, reject ) => {
          zip(zipData, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        const blob = new Blob([data], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const pageTitle = this.store.gallery.pageTitle ? '-' + _.kebabCase(this.store.gallery.pageTitle) : '';

        chrome.downloads.download({
          url: url,
          filename: "ale-animated-wallpaper"+ pageTitle +".zip",
          saveAs: true,
        });

      }
      catch(e) {
        console.error(e);
      }
      finally {
        // Brief delay so the UI doesn't snap back to idle before the download dialog appears
        setTimeout(() => {
          this.$store.commit("update", { key: "saving", value: false });
          this.saveProgressWidth = -1;
        }, 1000);
      }
    },
    
    coversArray: function() {
      
      let covers = this.store.covers;
      
      if ( this.store.excludeArchived ) covers = _.filter(covers, function(o) { return !o.inArchive; });
      
      return {
        fetchCovers: covers,
        covers: _.map( covers, function( book ) {
          return 'covers/' + book.asin + '.jpg';
        }),
      };
      
    },
    
    editorOptions: function( coversArray ) {
      
      let opts = {};
      
      opts.covers = {};
      opts.covers.all     = coversArray;
      opts.covers.size    = this.store.coverSize > 0 ? parseFloat(this.store.coverSize) : 0;
      opts.covers.perRow  = this.store.coversPerRow > -1 ? parseFloat(this.store.coversPerRow) : 0;
      opts.covers.padding = this.store.paddingSize > -1 ? parseFloat(this.store.paddingSize) : 0;
      opts.covers.dropOverflowingRow = this.store.awpDropOverflowingRow;
      opts.canvas = {};
      opts.canvas.width   = this.store.canvas.width > -1 ? parseFloat( this.store.canvas.width ) : 0;
      opts.canvas.height  = this.store.canvas.height > -1 ? parseFloat( this.store.canvas.height ) : 0;
      opts.canvas.overlayColor = this.store.awpOverlayColorEnabled ? this.store.awpOverlayColor : null; 
      opts.canvas.overlayBlendmode = this.store.awpOverlayColorEnabled ? this.store.awpBlendModes : null; 
      opts.canvas.grayscale = this.store.awpGrayscale;
      opts.canvas.grayscaleContrast = this.store.awpGrayscaleContrast;
      opts.canvas.background = this.store.canvas.background;
      opts.canvas.padding = {};
      opts.canvas.padding.left = this.store.canvas.padding.left > -1 ? parseFloat(this.store.canvas.padding.left) : 0;
      opts.canvas.padding.top = this.store.canvas.padding.top > -1 ? parseFloat(this.store.canvas.padding.top) : 0;
      opts.canvas.padding.right = this.store.canvas.padding.right > -1 ? parseFloat(this.store.canvas.padding.right) : 0;
      opts.canvas.padding.bottom = this.store.canvas.padding.bottom > -1 ? parseFloat(this.store.canvas.padding.bottom) : 0;
      opts.canvas.alignmentVertical = this.store.canvas.alignmentVertical;
      opts.prioritizeCoversPerRow = this.store.prioritizeCoversPerRow;
      opts.awpOverlayColorEnabled = this.store.awpOverlayColorEnabled;
      opts.awpBlendMode = this.store.awpBlendMode;
      opts.awpOverlayColor = this.store.awpOverlayColor;
      this.$emitter.emit('get-animation');
      opts.animation = this.store.animation;
      
      return opts;
            
    },
    
    makeIndexHTML: function( coversArray) {
      
      // const grayscale = this.store.awpGrayscale ? '#awp .cover img { filter: grayscale(1) contrast(0.8); }' : '';
      
      const overlayBlendmode = this.store.awpBlendMode !== 'normal' ? 'mix-blend-mode: '+ this.store.awpBlendMode +';' : '';
      const overlay = this.store.awpOverlayColorEnabled ? `
      #color-overlay { 
        will-change: transform;
        background: ${ this.store.awpOverlayColor }; 
        ${ overlayBlendmode }
        position: fixed;
        z-index: 99999;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        -webkit-touch-callout: none; 
        -webkit-user-select: none; 
        -khtml-user-select: none; 
        -moz-user-select: none; 
        -ms-user-select: none; 
        user-select: none; 
      }
      ` : '';
      
      let index = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>ALE • Animated Wallpaper</title>
        <style>
        html, body, #awp {
          overscroll-behavior: none;
          background-color: ${ this.store.canvas.background };
        }
        ${ overlay }
        </style>
        
        <link rel="stylesheet" href="animated-wallpaper.css">
        <script id="optionsData" type="application/json">
          ${ JSON.stringify( this.editorOptions( coversArray ) ) }
        </script>
      </head>
      <body>
        
        ${ this.store.awpOverlayColorEnabled ? '<div id="color-overlay"></div>' : '' }
        <div id="animated-wallpaper"></div>
        <script type="module" src="./assets/animated-wallpaper.js"></script>
        
      </body>
      </html>      
      `;
      
      return index;
      
    },
    
  }
};
