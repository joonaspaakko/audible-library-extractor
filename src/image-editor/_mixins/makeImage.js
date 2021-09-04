
// import JSZip from 'jszip';
// import JSZipUtils from 'jszip-utils';
import _ from 'lodash';

import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
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
        
        vue.$root.$emit('hide-moveable-controls');
        vue.$store.commit("update", { key: "saving", value: true });

        vue.$nextTick(function () {
          
          let vue = this;
          let format = vue.store.compressImage ? 'toJpeg' : 'toPng';
          let quality = vue.store.compressImage ? parseFloat(vue.store.compressQuality) : null;
          let mimetype = vue.store.compressImage ? 'image/jpeg' : 'image/png';
          let extension = vue.store.compressImage ? '.jpg' : '.png';
          let zoom = vue.store.canvas.zoomOutputs ? vue.store.canvas.zoom : 1;
          let canvas = document.querySelector(".editor-canvas");
          let filename = "ale image"+extension;
          
          htmlToImage[ format ]( canvas, {
            quality: quality, 
            pixelRatio: zoom,
          }).then(function( dataUrl ) {
            
            download( dataUrl, filename );
            setTimeout(function () {
              vue.$store.commit("update", { key: "saving", value: false });
              vue.$nextTick(function() {
                vue.centerCanvas();
              });
            }, 500);
            
          });
          
          // html2canvas(document.querySelector(".editor-canvas"), {
          //   backgroundColor: vue.store.canvas.background || "rgba(255,255,255,0)",
          //   logging: false,
          //   useCORS: true,
          //   allowTaint: true
          // }).then(function (canvas) {
          //   // If I ever need base64 version of the image: canvas.toDataURL("image/png")
          //   canvas.toBlob(function (blob) {
              
          //     saveAs( blob, "ale image"+extension );
          //     setTimeout(function () {
          //       vue.$store.commit("update", { key: "saving", value: false });
          //       vue.$nextTick(function() {
          //         vue.centerCanvas();
          //       });
          //     }, 500);
              
          //   }, mimetype, quality);
            
          // });
        });
      }
    },
        
  }
};
