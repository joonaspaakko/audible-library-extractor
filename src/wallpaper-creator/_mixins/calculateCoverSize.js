
export default {
  methods: {
    
    calculateCoverSize: function( params ) {
      
      params = params || {};
      
      let canvasWidth = parseFloat(params.canvasWidth || this.store.canvas.width) - 
                        parseFloat(params.paddingLeft || this.store.canvas.padding.left) - 
                        parseFloat(params.paddingRight || this.store.canvas.padding.right);
      let coverSize = (canvasWidth / (params.coversPerRow || this.store.coversPerRow)) - (parseFloat(params.paddingSize || this.store.paddingSize)*2);
      return coverSize;
      
    },
    
  }
};
