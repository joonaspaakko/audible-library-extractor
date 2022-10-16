// import _ from "lodash";

export default {
  data: function() {
    return {
      store: this.$store.state
    };
  },
  methods: {

    fillCanvasWithCovers: function( useFit ) {
      
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
      
      let maxRows = canvas.height > coverSize ? Math[ useFit ? 'floor' : 'ceil' ]( canvas.height / coverSize ) : 1;
      let coversPerWidth = canvas.width > coverSize ? Math.floor( canvas.width / coverSize ) : 1;
      let horizontalFit = coversPerWidth;
      let verticalFit = maxRows;
      let newAmount = horizontalFit * verticalFit;
      
      this.$store.commit('update', [
        { key: 'usedCovers', value: this.store.covers.slice(0, newAmount) },
        { key: 'coverAmount', value: newAmount },
      ]);
      
    },
     
  }
};
