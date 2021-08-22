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
      
      // PRIORITIZE COVER SIZE OVER COVERS PER ROW
      // The covers per row is adjusted to the nearest integer.
      // This makes it so the size of each cover stays pretty close  
      // to the original no matter what the screen size is.
      // this.covers.perRow = Math.round( canvas.width / (this.covers.sizeOriginal + this.covers.padding*2) );
      this.covers.size = (canvas.width / this.covers.perRow) - this.covers.padding*2;
      // console.log( 'COVER SIZE: ', this.covers.size )
      
      this.covers.rows = Math.ceil( canvas.height / this.covers.size ); 
      this.covers.total = this.covers.rows * this.covers.perRow;
      if ( !this.editorCovers && this.covers.all.length < this.covers.total ) this.addMoreCovers();
      // console.log( this.covers.total )
      this.covers.visible = this.getRandomCovers( this.covers.all, this.covers.total );
      
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
