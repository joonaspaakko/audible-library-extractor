
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
// import _ from 'lodash';
import { saveAs } from "file-saver";

export default {
  data: function() {
    return {
      saveProgressWidth: -1,
    };
  },
  methods: {
    
    makeWallpaper: function( params ) {
      let vue = this;
      if ( !vue.store.saving ) { 
        
        vue.saveProgressWidth = 0;
        vue.$store.commit("update", { key: "saving", value: true });
        vue.$nextTick(function () {
          
          var zip = new JSZip();
          var coversFolder = zip.folder("covers");
          
          let coversArray = this.coversArray();
          // let indexHTML = this.makeIndexHTML( coversArray.covers );
          
          // zip.file('index.html', indexHTML);
          console.log( coversArray ); 
          zip.file('options.js', `window.wallpaperOptions = ${JSON.stringify( this.editorOptions( coversArray.covers ) )};`);
          
          // var coversArray = _.map( books, function( book ) {
          //   return '          <li><a href="#"><img src="'+ ('covers/' + book.title + '.jpg') +'"/></a></li>';
          // });
          // zip.file("index.html", indexHTML( _.shuffle(coversArray).join('\n') ) );
          var filesArray = [];
          filesArray = filesArray.concat( coversArray.fetchCovers );
          
          const filePaths = _.get(window, 'chunksFilePaths', []);
          
          var dependencies = [
            // 'animated-wallpaper/animated-wallpaper.js',
            // 'animated-wallpaper/animated-wallpaper.css',
            'single-file-animated-wallpaper.html',
          ];
          
          // _.each(filePaths, function( path ) {
          //   const foundMatch = path.match(/animated-wallpaper.+\.(js|css)$/);
          //   if ( foundMatch ) dependencies.push(path);
          // });
          
          filesArray = filesArray.concat( dependencies );
          
          // console.log( filesArray )
          // return;
          
          let count = 0;
          _.each( filesArray , function(book) {
            let coverUrl = _.get( book, 'cover' );
            let getFile = !!coverUrl ? coverUrl : book;
            
            JSZipUtils.getBinaryContent( getFile, function(err, data) {
              
              if (err) throw err;
              
              if ( data && !coverUrl ) {
                var path = book;
                var fileName = path.substring(path.lastIndexOf('/') + 1);
                // Make sure the single file html output is index.html
                fileName = fileName.replace('single-file-animated-wallpaper.html', 'index.html'); 
                zip.file(fileName, data, { binary: true });
              }
              else if ( data ) {
                coversFolder.file(book.asin + '.jpg', data, { binary: true });
              }
              
              count++;
              if (count == filesArray.length) {
                zip.generateAsync({ type: "blob", streamFiles: true }, function updateCallback(metadata) {
                  vue.saveProgressWidth = metadata.percent;
                }).then(function(content) {
                  
                  let pageTitle = vue.store.gallery.pageTitle ? '-' + _.kebabCase(vue.store.gallery.pageTitle) : '';
                  saveAs(content, "ale-animated-wallpaper"+ pageTitle +".zip");
                  setTimeout(function() { 
                    vue.$store.commit("update", { key: "saving", value: false });
                    vue.saveProgressWidth = -1; 
                    vue.$nextTick(function() {
                      // vue.$emitter.emit('canvas-center');
                    });
                  }, 1000);
                  
                }).catch(function( e ) {
                  setTimeout(function() { 
                    vue.$store.commit("update", { key: "saving", value: false });
                    vue.saveProgressWidth = -1; 
                    vue.$nextTick(function() {
                      // vue.$emitter.emit('canvas-center');
                    });
                  }, 1000);
                });
              }
              
            });
          });
          
        });
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
