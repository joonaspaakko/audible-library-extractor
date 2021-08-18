import _ from "lodash";

export default {
  methods: {
    fitCoversToViewport: function() {
      
      let canvasWidth = window.innerWidth - (this.canvasPadding*2);
      let canvasHeight = window.innerHeight - (this.canvasPadding*2);
      
      // PRIORITIZE COVER SIZE OVER COVERS PER ROW
      // The covers per row is adjusted to the nearest integer.
      // This makes it so the size of each cover stays pretty close  
      // to the original no matter what the screen size is.
      this.covers.perRow = Math.round( canvasWidth / (this.covers.sizeOriginal + this.covers.padding*2) );
      this.covers.size = canvasWidth / this.covers.perRow;
      
      // Rows are rounded up because it's better to fill than fit in this case...
      this.covers.rows = Math.ceil( canvasHeight / this.covers.size ); 
      this.covers.total = this.covers.rows * this.covers.perRow;
      if ( this.covers.all.length < this.covers.total ) this.addMoreCovers();
      this.covers.visible = this.getRandomCovers( this.covers.all, this.covers.total );
      this.coverStyle();
      
    },   
    
    coverStyle: function() {
      
      let style = {};
      style.width  = this.covers.size + 'px';
      style.height = this.covers.size + 'px';
      this.covers.style = style;
      
    },
    
    addMoreCovers: function() {
      
      let vue = this;
      this.covers.total
      const loopLength = Math.ceil( this.covers.total / this.covers.all.length );
      const loopRange = _.range( 0, loopLength );
      let covers = [];
      _.each( loopRange, function() {
        covers = covers.concat( vue.covers.all );
      });
      
      this.covers.all = _.shuffle( covers );
      
    },
    
  }
};
