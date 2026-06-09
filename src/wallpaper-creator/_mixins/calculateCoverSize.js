
export default {
  methods: {
    
    calculateCoverSize: function( params ) {

      params = params || {};

      // RESERVED PADDING: left/right space claimed by snapped text elements. Folded in here so
      // every caller (toolbar sliders, canvas mount, etc.) agrees on the available width. Without
      // this, the toolbar's padding sliders compute a wider coverSize than canvas.vue's reserved
      // watcher, and the two fight each other, jittering left/right text elements.
      const reserved = this.$store.getters.reservedPadding;

      let canvasWidth = parseFloat( params.canvasWidth  ?? this.store.canvas.width ) -
                        parseFloat( params.paddingLeft  ?? this.store.canvas.padding.left )  - reserved.left -
                        parseFloat( params.paddingRight ?? this.store.canvas.padding.right ) - reserved.right;
      let coverSize = (canvasWidth / (params.coversPerRow || this.store.coversPerRow)) - (parseFloat(params.paddingSize || this.store.paddingSize)*2);
      return coverSize;

    },
    
  }
};
