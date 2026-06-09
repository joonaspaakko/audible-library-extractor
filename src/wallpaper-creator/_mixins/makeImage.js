
import { domToPng, domToJpeg } from 'modern-screenshot';
import download from "downloadjs";
import { fetchAsDataUrl } from '@utils/image-fetcher.js';

export default {
  data: function() {
    return {
    };
  },
  methods: {
    
    makeImage: function () {

      var vue = this;
      if ( !vue.store.saving ) {

        this.setCoverLimitToVisible();
        vue.$emitter.emit('hide-moveable-controls');
        vue.$store.commit("update", { key: "saving", value: true });

        vue.$nextTick(function () {

          let vue = this;
          let format = vue.store.compressImage ? domToJpeg : domToPng;
          let quality = vue.store.compressImage ? parseFloat(vue.store.compressQuality) : undefined;
          let extension = vue.store.compressImage ? '.jpg' : '.png';
          let scale = vue.store.canvas.zoomOutputs ? vue.store.canvas.outputScale : 1;
          let canvas = document.querySelector(".editor-canvas");
          let filename = "ALE image"+extension;

          // TRACK PROGRESS
          const totalCovers = vue.store.usedCovers.length;
          let fetchedCovers = 0;
          vue.saveProgressWidth = totalCovers > 0 ? 0 : -1;

          // THROTTLE IMAGE FETCHES (avoids ERR_INSUFFICIENT_RESOURCES on large libraries)
          // modern-screenshot calls fetchFn(url) for each image as it walks the DOM, so we
          // can't drive the loop ourselves. Instead we run a semaphore: a rate limiter caps
          // requests per time window, but this caps how many are IN FLIGHT at once, which is
          // what actually exhausts the browser's socket pool.
          // inFlight: urls currently being fetched. pending: queued fetchFn calls waiting for a slot.
          const inFlight = new Set();
          const pending  = [];

          // Starts as many queued fetches as there is room for, then stops.
          // Called again on every completion so a freed slot immediately pulls the next url.
          function flush() {
            while ( inFlight.size < 10 && pending.length > 0 ) {
              const { url, resolve, reject } = pending.shift();
              inFlight.add(url);
              fetchAsDataUrl( url )
                .then( dataUrl => {
                  
                  inFlight.delete(url); // free the slot, let the next queued url start, then hand the result back to modern-screenshot
                  flush();
                  fetchedCovers++;
                  vue.saveProgressWidth = (fetchedCovers / totalCovers) * 100;
                  resolve(dataUrl);
                  
                })
                .catch( err => {
                  
                  inFlight.delete(url); // free the slot even on failure so one bad cover can't stall the queue
                  flush();
                  fetchedCovers++;
                  vue.saveProgressWidth = (fetchedCovers / totalCovers) * 100;
                  reject(err);
                  
                });
            }
          }

          // The function modern-screenshot calls per image. We don't fetch immediately,
          // we queue the url and let flush() start it once a slot opens up.
          function fetchFn( url ) {
            return new Promise(( resolve, reject ) => {
              pending.push({ url, resolve, reject });
              flush();
            });
          }

          format( canvas, {
            quality,
            scale,
            fetchFn,
            width: canvas.offsetWidth,
            height: canvas.offsetHeight,
            // PANZOOM SETS AN INLINE TRANSFORM ON THIS ELEMENT
            // modern-screenshot clones inline styles into an isolated SVG, where the
            // [data-saving-image] CSS reset can't reach, so the pan/zoom transform would
            // leak into the export and inflate it. Neutralize it on the clone directly.
            style: { transform: 'none', transformOrigin: 'top left' },
          }).then(function( dataUrl ) {

            // An oversized canvas makes toDataURL return an empty "data:," string rather
            // than throwing, which would otherwise save a 0 byte file without warning.
            if ( !dataUrl || dataUrl.length < 10 ) {
              console.error('ALE: image export failed, the canvas is likely too large to render. Try fewer covers or a smaller canvas.');
              vue.$store.commit("update", { key: "saving", value: false });
              vue.saveProgressWidth = -1;
              return;
            }

            download( dataUrl, filename );
            setTimeout(function () {
              vue.$store.commit("update", { key: "saving", value: false });
              vue.saveProgressWidth = -1;
            }, 500);

          }).catch(function( err ) {
            console.error('ALE: image export failed.', err);
            vue.$store.commit("update", { key: "saving", value: false });
            vue.saveProgressWidth = -1;
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
