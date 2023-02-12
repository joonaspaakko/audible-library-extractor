export default {
  data: function() {
    return {
      store: this.$store.state
    };
  },
  methods: {
    
    zoomToFit: function( alsoCenter ) {
      return;
      let vue = this;
      let workingArea = document.querySelector("#editor-canvas-left");
      let content = workingArea.querySelector("#editor-canvas-content");
      
      var cWidth = parseFloat(this.$store.state.canvas.width);
      var cHeight = parseFloat(this.$store.state.canvas.height);

      var canvasWidth = cWidth || content.clientWidth;
      var canvasHeight = cHeight || content.clientHeight;
      
      // Whitespace around the canvas when fitted
      let padding = 100;
      
      let size = {
        from: [
          canvasWidth,
          canvasHeight,
        ],
        to: [
          workingArea.clientWidth - padding,
          workingArea.clientHeight - padding,
        ],
      };
      
      size = vue.calculateNewSize( size.from, size.to );
      const newScale = Math.round(size.percentage.fit) / 100;
      this.$store.commit('update', { key: 'canvas.zoom', value: newScale });
      
      if ( alsoCenter ) this.centerCanvas();
      
    },
    
    calculateNewSize: function( inputSize, targetSize ) {
      function mathMax( array ) { return array[0] > array[1] ? array[0] : array[1]; }
      function mathMin( array ) { return array[0] < array[1] ? array[0] : array[1]; }
      var sizeArray = [ targetSize[0] / inputSize[0], targetSize[1] / inputSize[1] ];
      var ratioFit  = mathMin( sizeArray );
      var ratioFill = mathMax( sizeArray );
      return {
        pixels: {
          fit:  { width: inputSize[0]*ratioFit,  height: inputSize[1]*ratioFit  },
          fill: { width: inputSize[0]*ratioFill, height: inputSize[1]*ratioFill }
        },
        percentage: {
          fit:  (100 / inputSize[0]) * (inputSize[0]*ratioFit),
          fill: (100 / inputSize[0]) * (inputSize[0]*ratioFill)
        }
      };
    },
    
  }
};
