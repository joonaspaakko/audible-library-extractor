import _ from "lodash";

export default {
  methods: {
    fitCoversToViewport: function() {
    
      let canvas = {};
      if ( !this.editorCovers ) {
        canvas.width  = window.innerWidth - this.canvas.padding.left - this.canvas.padding.right;
        canvas.height = window.innerHeight - this.canvas.padding.top - this.canvas.padding.bottom;
      }
      else {
        canvas.width  = this.canvas.width - this.canvas.padding.left - this.canvas.padding.right;
        canvas.height = this.canvas.height - this.canvas.padding.top - this.canvas.padding.bottom;
      }
      
      const coversPadding = this.covers.padding*2;
      
      // PRIORITIZE COVER SIZE OVER COVERS PER ROW
      // The covers per row is adjusted to the nearest integer.
      // This makes it so the size of each cover stays pretty close  
      // to the original no matter what the screen size is.
      if ( !this.editorCovers && !this.prioritizeCoversPerRow  ) {
        this.covers.perRow = Math.round( canvas.width / (this.covers.sizeOriginal + coversPadding ) );
        this.covers.size = (canvas.width / this.covers.perRow) - coversPadding;
      }
      else {
        this.covers.size = (canvas.width / this.covers.perRow) - coversPadding;
      }
      
      const roundBoe = this.covers.dropOverflowingRow ? 'floor' : 'ceil';
      this.covers.rows = Math[ roundBoe ]( canvas.height / (this.covers.size + coversPadding)  ); 
      this.covers.total = this.covers.rows * this.covers.perRow;
      if ( this.editorCovers ) this.$store.commit('update', { key: 'visibleAnimatedCovers', value: this.covers.total }); // Messaging the image editor...
      
      if ( this.covers.total > this.covers.allOriginal.length ) this.addMoreCovers();
      this.covers.all = _.shuffle( this.covers.all );
      
      this.covers.visible = this.getRandomCovers( this.covers.all, this.covers.total );
    
    },   
    
    // Makes sure you always have enough covers and also clears any prior additions them when fitCoversToViewport() runs...
    addMoreCovers: function() {
      
      let vue = this;
      this.covers.total
      const loopLength = Math.ceil( this.covers.total / vue.covers.allOriginal.length );
      const loopRange = _.range( 0, loopLength );
      let covers = [];
      _.each( loopRange, function() {
        covers = covers.concat( vue.covers.allOriginal );
      });
      
      let difference = Math.abs( this.covers.total - covers.length );
      if ( difference ) covers = _.dropRight(covers, difference);
      
      this.covers.all = covers;
      
    },
    
  }
};
