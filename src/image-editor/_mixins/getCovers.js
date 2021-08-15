import _ from "lodash";

export default {
  created: function () {
    this.getCovers();
  },
  methods: {
    getCovers: function () {
      
      let vue = this;
      
      try {
        
        browser.storage.local.get(['imageEditorChunks', 'imageEditorChunksLength']).then(data => {
          browser.storage.local.remove(['imageEditorChunks', 'imageEditorChunksLength']);
          
          // browser.storage.local.get(['collections-chunk-length']).then(collectionsChunkLength => {
          //   if ( collectionsChunkLength ) {
          //     let collections = [];
          //     _.each(_.range(0, collectionsChunkLength), function( index ) {
          //       collections = collections.concat( data['collections-chunk-'+index] );
          //     });
              
          //     let archive = _.find( collections, { id: '__ARCHIVE' });
          //     if ( archive ) {
                
          //     }
              
          //   }
          // });
          
          if ( data.imageEditorChunksLength ) {
            
            // let coversArray = require('./getCovers.json');
            let coversArray = _.flatten( data.imageEditorChunks );
            
            let changes = [
              { key: "covers", value: coversArray },
            ];
            
            if ( !vue.$store.state.coverAmount || coversArray.length < vue.$store.state.coverAmount ) {
              changes.push({ key: "coverAmount", value: coversArray.length });
            }
            
            changes.push({ key: "usedCovers", value: coversArray.slice( 0, vue.$store.state.coverAmount ) });
            
            vue.$store.commit("update", changes);
            
            vue.dataReady = true;
            
          }
          else {
            
            
          }
          
          
        });
        
      } catch(e) {}
      
    },
  }
};
