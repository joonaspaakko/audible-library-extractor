// import _ from "lodash";
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";

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
        chrome.storage.local.get([
          'imageEditorChunks', 
          'imageEditorChunksLength', 
          'imageEditorTimeCode', 
          'imageEditorPageTitle', 
          'imageEditorPageSubTitle'
      ]).then(data => {
          // chrome.storage.local.remove(['imageEditorChunks', 'imageEditorChunksLength']);
          // console.log( 'data', data );
          if ( _.get(data, 'imageEditorChunksLength', 0) > 0 ) {
          
            // let coversArray = require('./getCovers.json');
            let coversArray = _.flatten( data.imageEditorChunks );
            coversArray = _.filter( coversArray, function( book ) { return book.cover; });
            coversArray = vue.mappy( coversArray );
            
            let changes = [
              { key: "covers", value: coversArray },
              { key: "archived", value: vue.archivedLength },
            ];
            
            // time code changes when wallpaper creator is opened through the gallery
            if ( _.get(data, 'imageEditorTimeCode') ) changes.push({ key: "timeCode", value: data.imageEditorTimeCode });
            // console.log( coversArray );
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
    
    mappy: function( array ) {
      
      let vue = this;
      return _.map(array, function( book ) {
                
        let obj = {};
        obj.asin = book.asin;
        if ( book.titleShort || book.title ) obj.title = book.titleShort || book.title;
        if ( book.authors ) obj.author = book.authors[0].name;
        if ( book.myRating ) obj.myRating = parseFloat(book.myRating);
        if ( book.favorite ) obj.favorite = book.favorite;
        
        const isArchived =  _.includes(book.collectionIds, '__ARCHIVE');
        obj.inArchive = !!isArchived;
        if ( obj.inArchive ) ++vue.archivedLength;
        
        obj.cover = vue.makeCoverUrl(book.cover);
        
        return obj;
        
      });
    },
    
  }
};
