// import _ from "lodash";
import makeCoverUrl from "@output-mixins/makeCoverUrl";
import browser from "webextension-polyfill";

export default {
  data: function() {
    return {
      archivedLength: 0,
    };
  },
  mixins: [makeCoverUrl],
  created: function () {
    this.getCovers();
  },
  methods: {
    getCovers: function () {
      
      let vue = this;
      
      console.log('TEST 1234')
      // Clear certain parts of the data when coming in from the gallery
      if ( window.location.href.indexOf('src=gallery') > -1 ) {
        this.$store.commit('clearTiers');
        this.$store.commit('update', [{ key: 'covers', value: [] }, { key: 'usedCovers', value: [] }]);
        // Remove URL param
        var newURL = location.href.split("?")[0];
        window.history.pushState({}, document.title, newURL);
      }
      else {
        
        if ( this.$store.state.covers.length ) { vue.dataReady = true; }
        else { vue.noCovers = true; }
        return;
        
      }
      
      try {
        browser.storage.local.get([
          'imageEditorChunks', 
          'imageEditorChunksLength', 
          'imageEditorTimeCode', 
          'imageEditorPageTitle', 
          'imageEditorPageSubTitle'
      ]).then(data => {
          // browser.storage.local.remove(['imageEditorChunks', 'imageEditorChunksLength']);
          console.log( 'data', data );
          if ( _.get(data, 'imageEditorChunksLength', 0) > 0 ) {
            vue.fetchArchive(function( archive ) {  
              // let coversArray = require('./getCovers.json');
              let coversArray = _.flatten( data.imageEditorChunks );
              coversArray = _.filter( coversArray, function( book ) { return book.cover; });
              coversArray = vue.mappy( coversArray, archive );
              
              let changes = [
                { key: "covers", value: coversArray },
                { key: "archived", value: vue.archivedLength },
              ];
              
              // time code changes when wallpaper creator is opened through the gallery
              if ( _.get(data, 'imageEditorTimeCode') ) changes.push({ key: "timeCode", value: data.imageEditorTimeCode });
              console.log( coversArray );
              let coverAmount = vue.$store.state.canvasPreset === 'wallpaper' ? 300 : 50;
              const fromLocalstorage = data.imageEditorTimeCode === vue.$store.state.timeCode;
              if ( !fromLocalstorage ) {
                
                coverAmount = coversArray.length > coverAmount ? coverAmount : coversArray.length;
                changes.push({ key: "coverAmount", value: coverAmount });
                
              }
              else if ( !vue.$store.state.coverAmount || coversArray.length < vue.$store.state.coverAmount ) {
                coverAmount = coversArray.length;
                changes.push({ key: "coverAmount", value: coverAmount });
              }
              
              changes.push({ key: "usedCovers", value: coversArray.slice( 0, coverAmount ) });
              
              if ( data.imageEditorPageTitle    ) changes.push({ key: 'gallery.pageTitle', value: data.imageEditorPageTitle });
              if ( data.imageEditorPageSubTitle ) changes.push({ key: 'gallery.pageSubTitle', value: data.imageEditorPageSubTitle });
              
              vue.$store.commit("update", changes);
              
              if ( coversArray.length ) { vue.dataReady = true; }
              else { vue.noCovers = true; }
              
            }); 
          }
          
        });
      } catch(e) {
        
        // let coversArray = require('./getCovers.json');
        // coversArray = this.mappy( coversArray );
        // vue.$store.commit("update", [
        //   { key: "covers", value: coversArray },
        //   { key: "usedCovers", value: coversArray.slice( 0, vue.$store.state.coverAmount ) },
        // ]);
        
        // if ( coversArray.length ) { vue.dataReady = true; }
        // else { vue.noCovers = true; }
        
      }
      
    },
    
    mappy: function( array, archive ) {
      
      let vue = this;
      return _.map(array, function( book ) {
                
        let obj = {};
        obj.asin = book.asin;
        if ( book.titleShort || book.title ) obj.title = book.titleShort || book.title;
        if ( book.authors ) obj.author = book.authors[0].name;
        if ( book.myRating ) obj.myRating = parseFloat(book.myRating);
        if ( book.favorite ) obj.favorite = book.favorite;
        obj.cover = vue.makeCoverUrl(book.cover);
        if ( _.includes( archive, book.asin ) ) {
          obj.inArchive = true;
          ++vue.archivedLength;
        }
        return obj;
        
      });
    },
    
    fetchArchive: function( callback ) {
      
      let archivedBooks = [];
      
      try {
        browser.storage.local.get(['collections-chunk-length']).then(ccData => {
          const ccLength = _.get(ccData, 'collections-chunk-length');
          if ( ccLength ) {
            
            let collectionChunkKeys = _.map( _.range(0, ccLength), function( index ) {
              return 'collections-chunk-'+index;
            });
            
            browser.storage.local.get( collectionChunkKeys ).then(cData => {
              
              const collections = _.flatMap(cData);
              const archive = _.find(collections, {id: '__ARCHIVE'});
              archivedBooks = _.get( archive, 'books', []);
              
              callback( archivedBooks );
              
            });
            
          } else {
            callback( archivedBooks );
          }
        });
      } catch( e ) {
        console.log( e );
        callback([])
      }
      
    },
    
  }
};
