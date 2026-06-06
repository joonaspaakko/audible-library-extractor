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
        const newURL = location.href.split("?")[0];
        window.history.pushState({}, document.title, newURL);
      }
      else {
        
        if ( this.$store.state.covers.length ) { vue.dataReady = true; }
        else { vue.noCovers = true; }
        return;
        
      }
      
      try {
        chrome.storage.local.get('imageEditor').then(result => {
          const data = result.imageEditor || {};
          // chrome.storage.local.remove(['imageEditor']);
          if ( _.get(data, 'chunksLength', 0) > 0 ) {

            // let coversArray = require('./getCovers.json');
            let coversArray = _.flatten( data.chunks );
            coversArray = _.filter( coversArray, function( book ) { return book.cover; });
            coversArray = vue.mappy( coversArray );

            let changes = [
              { key: "covers", value: coversArray },
              { key: "archived", value: vue.archivedLength },
            ];

            // time code changes when wallpaper creator is opened through the gallery
            if ( _.get(data, 'timeCode') ) changes.push({ key: "timeCode", value: data.timeCode });
            let coverAmount = vue.$store.state.canvasPreset === 'wallpaper' ? 300 : 50;
            const resuming = data.timeCode === vue.$store.state.timeCode;
            if ( !resuming ) chrome.storage.local.remove(['imageEditor']);
            if ( !resuming ) {

              coverAmount = coversArray.length > coverAmount ? coverAmount : coversArray.length;
              changes.push({ key: "coverAmount", value: coverAmount });

            }
            else if ( !vue.$store.state.coverAmount || coversArray.length < vue.$store.state.coverAmount ) {
              coverAmount = coversArray.length;
              changes.push({ key: "coverAmount", value: coverAmount });
            }

            changes.push({ key: "usedCovers", value: coversArray.slice( 0, coverAmount ) });

            if ( data.pageTitle    ) changes.push({ key: 'gallery.pageTitle', value: data.pageTitle });
            if ( data.pageSubTitle ) changes.push({ key: 'gallery.pageSubTitle', value: data.pageSubTitle });
            
            vue.$store.commit("update", changes);
            
            if ( coversArray.length ) { vue.dataReady = true; }
            else { vue.noCovers = true; }
              
          }
          
        });
      } catch(e) {}
      
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
