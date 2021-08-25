
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import _ from 'lodash';

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
          let indexHTML = this.makeIndexHTML( coversArray.covers );
          
          zip.file('index.html', indexHTML);
          // var coversArray = _.map( books, function( book ) {
          //   return '          <li><a href="#"><img src="'+ ('covers/' + book.title + '.jpg') +'"/></a></li>';
          // });
          // zip.file("index.html", indexHTML( _.shuffle(coversArray).join('\n') ) );
          var filesArray = [];
          filesArray = filesArray.concat( coversArray.fetchCovers );
          
          var dependencies = [
            'animated-wallpaper/animated-wallpaper.js',
            'animated-wallpaper/animated-wallpaper.css',
          ];
          filesArray = filesArray.concat( dependencies );
          
          let count = 0;
          _.each( filesArray , function(book) {
            let coverUrl = _.get( book, 'cover' );
            let getFile = !!coverUrl ? coverUrl : book;
            
            JSZipUtils.getBinaryContent( getFile, function(err, data) {
              
              if (err) throw err;
              
              if ( data && !coverUrl ) {
                var path = book;
                var fileName = path.substring(path.lastIndexOf('/') + 1);
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
                  }, 1000);
                  
                }).catch(function( e ) {
                  console.log( e );
                  setTimeout(function() { 
                    vue.$store.commit("update", { key: "saving", value: false });
                    vue.saveProgressWidth = -1; 
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
      
      opts.animationPreset = this.store.animationPreset;
      opts.covers = {};
      opts.covers.all     = coversArray;
      opts.covers.size    = this.store.coverSize > 0 ? parseFloat(this.store.coverSize) : 0;
      opts.covers.perRow  = this.store.coversPerRow > -1 ? parseFloat(this.store.coversPerRow) : 0;
      opts.covers.padding = this.store.paddingSize > -1 ? parseFloat(this.store.paddingSize) : 0;
      opts.canvas = {};
      opts.canvas.width   = this.store.canvas.width > -1 ? parseFloat( this.store.canvas.width ) : 0;
      opts.canvas.height  = this.store.canvas.height > -1 ? parseFloat( this.store.canvas.height ) : 0;
      opts.canvas.overlayColor = this.store.awpOverlayColorEnabled ? this.$store.state.awpOverlayColor : null; 
      opts.canvas.grayscale = this.store.awpGrayscale ? 'grayscale(1) contrast(0.8)' : null;
      opts.canvas.padding = {};
      opts.canvas.padding.left = this.editorCanvasPaddingLeft > -1 ? parseFloat(this.editorCanvasPaddingLeft) : 0;
      opts.canvas.padding.top = this.editorCanvasPaddingTop > -1 ? parseFloat(this.editorCanvasPaddingTop) : 0;
      opts.canvas.padding.right = this.editorCanvasPaddingRight > -1 ? parseFloat(this.editorCanvasPaddingRight) : 0;
      opts.canvas.padding.bottom = this.editorCanvasPaddingBottom > -1 ? parseFloat(this.editorCanvasPaddingBottom) : 0;
      return opts;
            
    },
    
    makeIndexHTML: function( coversArray) {
      
      var index = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>ALE • Animated Wallpaper</title>
        <link rel="stylesheet" href="animated-wallpaper.css">
        <script id="optionsData" type="application/json">
          ${ JSON.stringify( this.editorOptions( coversArray ) ) }
        </script>
      </head>
      <body>

        <div id="animated-wallpaper"></div>
        <script src="animated-wallpaper.js"></script>
        
      </body>
      </html>      
      `;
      
      return index;
      
    },
    
  }
};
