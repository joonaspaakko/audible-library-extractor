// import _ from "lodash";
import fillCanvasWithCovers from './fillCanvasWithCovers.js';

export default {
  mixins: [ fillCanvasWithCovers ],
  
  data: function() {
    return {
      store: this.$store.state
    };
  },

  watch: {
    "$store.state.coverAmount": function () {
      // if (this.$store.getters.widthOrHeight_Unset) {
      //   this.$nextTick(function () {
      //     this.centerCanvas();
      //   });
      // }
    },
    "$store.state.canvas.width": function () {
      this.$nextTick(function () {
        this.centerCanvas();
      });
    },
    "$store.state.canvas.height": function () {
      this.$nextTick(function () {
        // this.fillCanvasWithCovers();
        this.centerCanvas();
      });
    },
    "$store.state.coverSize": function () {
      // if (this.$store.getters.widthOrHeight_Unset) {
        this.$nextTick(function () {
          this.centerCanvas();
        });
      // }
    },
    "$store.state.paddingSize": function () {
      // if (this.$store.getters.widthOrHeight_Unset) {
      //   this.$nextTick(function () {
      //     this.centerCanvas();
      //   });
      // }
    },
    "$store.state.canvas.padding.left": function () {
      // if (this.$store.getters.widthOrHeight_Unset) {
        this.$nextTick(function () {
          this.centerCanvas();
        });
      // }
    },
    "$store.state.canvas.padding.top": function () {
      // if (this.$store.getters.widthOrHeight_Unset) {
        this.$nextTick(function () {
          this.centerCanvas();
        });
      // }
    },
    "$store.state.canvas.padding.right": function () {
      // if (this.$store.getters.widthOrHeight_Unset) {
        this.$nextTick(function () {
          this.centerCanvas();
        });
      // }
    },
    "$store.state.canvas.padding.bottom": function () {
      // if (this.$store.getters.widthOrHeight_Unset) {
        this.$nextTick(function () {
          this.centerCanvas();
        });
      // }
    },
    "$store.state.canvas.zoom": function () {
      this.$nextTick(function () {
        this.centerCanvas();  
      });
    },
    // "$store.state.coversPerRow": _.debounce( function() {
    //   this.$nextTick(function () {
    //     this.fillCanvasWithCovers();  
    //   });
    // }, 200, { leading: false, trailing: true }),
  },
  methods: {

    calculateUsedCovers: function() {
      if (this.store.canvas.fit) {
        var paddingSize = parseFloat(this.store.paddingSize) * 2;
        var coverSize = parseFloat(this.store.coverSize) + paddingSize;
        let canvasPaddingX = parseFloat(this.store.canvas.padding.left) + parseFloat(this.store.canvas.padding.right);
        let canvasPaddingY = parseFloat(this.store.canvas.padding.top) + parseFloat(this.store.canvas.padding.bottom);
        
        var horizontalFit = Math.floor(
          (parseFloat(this.store.canvas.width) - canvasPaddingX) / coverSize
        );
        var verticalFit = Math.floor(
          (parseFloat(this.store.canvas.height) - canvasPaddingY) / coverSize
        );
        if (verticalFit < 1) verticalFit = 1;
        let newAmount = horizontalFit * verticalFit;
        this.$store.commit('update', { 
          key: 'usedCovers', 
          value: this.store.covers.slice(0, newAmount > this.store.coverAmount ? this.store.coverAmount : newAmount)
        });
      } else {
        this.$store.commit('update', { 
          key: 'usedCovers', 
          value: this.store.covers.slice(0, this.store.coverAmount)
        });
      }
    },

    centerCanvas: _.debounce( function() {
      
      return;
      
      let workingArea = document.querySelector("#editor-canvas-left");
      let content = workingArea.querySelector("#editor-canvas-content");

      var padding = 500 * 2;
      var cWidth = parseFloat(this.$store.state.canvas.width);
      var cHeight = parseFloat(this.$store.state.canvas.height);

      var canvasWidth = cWidth || content.clientWidth;
      var canvasHeight = cHeight || content.clientHeight;
      
      let vue = this;
      let scale = function( size ) {
        let scale = vue.$store.state.canvas.zoom;
        return (scale > 0 && scale != 1) ? size * scale : size;
      };

      // Scaled here because the user sees a scaled canvas if zoomed.
      // - GET scaled size for comparison
      // - SET regular size
      let canvasOverflowsHorizontally = scale(canvasWidth) > workingArea.clientWidth;
      let canvasOverflowsVertically = scale(canvasHeight) > workingArea.clientHeight;
      
      this.$store.commit('update', [
        { key: 'canvas.scaled.width', value: Math.ceil(scale(canvasWidth)) },
        { key: 'canvas.scaled.height', value: Math.ceil(scale(canvasHeight)) },
        { key: 'canvas.autoHeight', value: content.offsetHeight },
      ]);

      let x = canvasOverflowsHorizontally ? "left" : "center";
      let y = canvasOverflowsVertically ? "top" : "center";
      let newOrigin = y + " " + x;
      if (this.$store.state.canvas.transformOrigin != newOrigin) {
        this.$store.commit("update", { key: "canvas.transformOrigin", value: newOrigin });
      }
      
      // if ( this.store.canvas.alignmentVertical === 'center' || this.store.canvas.alignmentVertical === 'flex-end' ) {
      //   let canvasAlignmentVertical = this.store.canvas.alignmentVertical;
      //   this.$store.commit('update', { key: 'canvas.alignmentVertical', value: 'flex-start' });
      //   this.$nextTick(function() {
      //     // setTimeout(function() {
            
      //       adjustScroll();
      //       vue.$store.commit('update', { key: 'canvas.alignmentVertical', value: canvasAlignmentVertical });
            
      //     // },10);
      //   });
      // }
      // else {
      //   adjustScroll();
      // }
      adjustScroll();
      
      function adjustScroll() {
        if (canvasOverflowsVertically) {
          workingArea.scrollTop = padding / 2; // Align canvas top with the top of the viewport
        } else {
          workingArea.scrollTop = ((canvasHeight + padding) - workingArea.clientHeight) / 2; // Center
        }
  
        if (canvasOverflowsHorizontally) {
          workingArea.scrollLeft = padding / 2; // Align canvas top with the left of the viewport
        } else {
          workingArea.scrollLeft = ((canvasWidth + padding) - workingArea.clientWidth) / 2; // Center
        }
      }
      
    
    }, 200, { leading: true, trailing: true }),
    
  }
};
