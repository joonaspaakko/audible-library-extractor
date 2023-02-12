
// import JSZip from 'jszip';
// import JSZipUtils from 'jszip-utils';
// import _ from 'lodash';

import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg } from 'html-to-image';
import download from "downloadjs";

export default {
  data: function() {
    return {
    };
  },
  methods: {
    
    makeImage: function () {
      
      
      var vue = this;
      if (!vue.store.saving) {
        
        this.setCoverLimitToVisible();
        vue.$emitter.emit('hide-moveable-controls');
        vue.$store.commit("update", { key: "saving", value: true });

        vue.$nextTick(function () {
          
          let vue = this;
          let format = vue.store.compressImage ? 'toJpeg' : 'toPng';
          let quality = vue.store.compressImage ? parseFloat(vue.store.compressQuality) : null;
          let mimetype = vue.store.compressImage ? 'image/jpeg' : 'image/png';
          let extension = vue.store.compressImage ? '.jpg' : '.png';
          let scale = vue.store.canvas.zoomOutputs ? vue.store.canvas.outputScale : 1;
          let canvas = document.querySelector(".editor-canvas");
          let filename = "ALE image"+extension;
          
          htmlToImage[ format ]( canvas, {
            quality: quality, 
            pixelRatio: scale,
          }).then(function( dataUrl ) {
            
            download( dataUrl, filename );
            setTimeout(function () {
              vue.$store.commit("update", { key: "saving", value: false });
              vue.$nextTick(function() {
                // vue.$emitter.emit('canvas-center');
              });
            }, 500);
            
          });
          
        });
      }
    },
    
    setCoverLimitToVisible: function() {
      
      let coverSize = parseFloat(this.store.coverSize)+(parseFloat(this.store.paddingSize)*2);
      let canvasBounds = document.querySelector('#editor-canvas-left .canvas-bounds');

      let canvas = {
        padding: {
          left  : parseFloat(this.store.canvas.padding.left),
          top   : parseFloat(this.store.canvas.padding.top),
          right : parseFloat(this.store.canvas.padding.right),
          bottom: parseFloat(this.store.canvas.padding.bottom),
        },
      };
      
      canvas.width  = canvasBounds.offsetWidth - canvas.padding.left - canvas.padding.right;
      canvas.height = canvasBounds.offsetHeight - canvas.padding.top - canvas.padding.bottom;
      
      let coverAmount = parseFloat(this.store.coverAmount);
      let maxRows = canvas.height > coverSize ? Math.ceil( canvas.height / coverSize ) : 1;
      let coversPerWidth = canvas.width > coverSize ? Math.floor( canvas.width / coverSize ) : 1;
      if ( coverAmount < coversPerWidth ) coversPerWidth = coverAmount;
      
      let horizontalFit = coversPerWidth;
      let verticalFit = maxRows;
      let newAmount = horizontalFit * verticalFit;
      
      if ( this.store.usedCovers.length > newAmount ) {
        this.$store.commit('update', [
          { key: 'usedCovers', value: this.store.covers.slice(0, newAmount) },
          { key: 'coverAmount', value: newAmount },
        ]);
      }
      
    },
        
  }
};
