import _ from "lodash";
import makeCoverUrl from "@output-mixins/makeCoverUrl";

export default {
  mixins: [makeCoverUrl],
  created: function () {
    this.getCovers();
  },
  methods: {
    getCovers: function () {
      
      let vue = this;
      
      try {
        browser.storage.local.get(['imageEditorChunks', 'imageEditorChunksLength', 'imageEditorPageTitle', 'imageEditorPageSubTitle']).then(data => {
          // browser.storage.local.remove(['imageEditorChunks', 'imageEditorChunksLength']);
          
          if ( data.imageEditorChunksLength ) {
            vue.fetchArchive(function( archive ) {  
              
              // let coversArray = require('./getCovers.json');
              let coversArray = _.flatten( data.imageEditorChunks );
              coversArray = _.filter( coversArray, function( book ) { return book.cover; });
              coversArray = vue.mappy( coversArray, archive );
              
              let changes = [
                { key: "covers", value: coversArray },
                { key: "archived", value: vue.archivedLength },
              ];
              
              if ( !vue.$store.state.coverAmount || coversArray.length < vue.$store.state.coverAmount ) {
                changes.push({ key: "coverAmount", value: coversArray.length });
              }
              
              changes.push({ key: "usedCovers", value: coversArray.slice( 0, vue.$store.state.coverAmount ) });
              
              if ( data.imageEditorPageTitle    ) changes.push({ key: 'gallery.pageTitle', value: data.imageEditorPageTitle });
              if ( data.imageEditorPageSubTitle ) changes.push({ key: 'gallery.pageSubTitle', value: data.imageEditorPageSubTitle });
              
              vue.$store.commit("update", changes);
              
              vue.dataReady = true;
              
            }); 
          }
          
        });
      } catch(e) {
        
        let coversArray = require('./getCovers.json');
        coversArray = this.mappy( coversArray );
        vue.$store.commit("update", [
          { key: "covers", value: coversArray },
          { key: "usedCovers", value: coversArray.slice( 0, vue.$store.state.coverAmount ) },
        ]);
        vue.dataReady = true;
        
      }
      
    },
    
    mappy: function( array, archive ) {
      
      let vue = this;
      return _.map(array, function( book ) {
                
        let obj = {};
        obj.asin = book.asin;
        if ( book.titleShort || book.title ) obj.title = book.titleShort || book.title;
        if ( book.authors ) obj.author = book.authors[0].name;
        obj.cover = vue.makeCoverUrl(book.cover);
        if ( archive && _.includes( archive, book.asin ) ) {
          obj.inArchive = true;
          ++vue.archivedLength;
        }
        return obj;
        
      });
    },
    
    fetchArchive: function( callback ) {
      
      browser.storage.local.get(['collections-chunk-length']).then(ccData => {
        const ccLength = _.get(ccData, 'collections-chunk-length');
        if ( ccLength ) {
          let collectionChunkKeys = _.map( _.range(0, ccLength), function( index ) {
            return 'collections-chunk-'+index;
          });
          
          browser.storage.local.get( collectionChunkKeys ).then(cData => {
            
            let collections = _.flatMap(cData);
            let archive = _.find( collections, { id: '__ARCHIVE' });
            
            callback( archive.books );
            
          });
          
        }
      });
      
    },
    
  }
};
