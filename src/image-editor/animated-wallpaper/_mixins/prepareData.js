import _ from "lodash";
import makeCoverUrl from "@output-mixins/makeCoverUrl";

export default {
  mixins: [
    makeCoverUrl, 
  ],
  props: [
    'editorCoverSize',
    'editorCoverPadding',
    'editorCanvasWidth',
    'editorCanvasHeight',
    'editorCovers',
    'editorCoversPerRow',
    'editorCanvasPaddingLeft',
    'editorCanvasPaddingTop',
    'editorCanvasPaddingRight',
    'editorCanvasPaddingBottom',
  ],
  
  watch: {
    "editorCoversPerRow": function( value ) {
      this.covers.perRow = value;
      this.startAutoPlay();
    },
    "editorCoverPadding": function( value ) {
      this.covers.padding = value;
      this.startAutoPlay();
    },
    "editorCanvasPaddingLeft": function( value ) {
      this.canvas.padding.left = value;
      this.startAutoPlay();
    },
    "editorCanvasPaddingTop": function( value ) {
      this.canvas.padding.top = value;
      this.startAutoPlay();
    },
    "editorCanvasPaddingRight": function( value ) {
      this.canvas.padding.right = value;
      this.startAutoPlay();
    },
    "editorCanvasPaddingBottom": function( value ) {
      this.canvas.padding.bottom = value;
      this.startAutoPlay();
    },
    "editorCanvasWidth": function( value ) {
      this.canvas.width = value;
      this.startAutoPlay();
    },
    "editorCanvasHeight": function( value ) {
      this.canvas.height = value;
      this.startAutoPlay();
    },
    "$store.state.awpGrayscale": function( value ) {
      this.canvas.grayscale = value;
      this.startAutoPlay();
    },
    "$store.state.awpGrayscaleContrast": function( value ) {
      this.canvas.grayscaleContrast = value;
      this.startAutoPlay();
    },
    "$store.state.excludeArchived": function( value ) {
      this.covers.allOriginal = value ? _.filter(this.editorCovers, function(o) { return !o.inArchive; }) : this.editorCovers;
      this.covers.allOriginal = _.map( this.covers.allOriginal, 'cover');
      this.covers.all = this.covers.allOriginal;
      this.startAutoPlay();
    },
    "$store.state.animationPreset": function( value ) {
      this.loadAnimationPreset( this.$store.state.animationPreset );
      this.startAutoPlay();
    },
    "$store.state.background": function( value ) {
      this.canvas.background = value;
      this.startAutoPlay();
    },
    "$store.state.awpDropOverflowingRow": function( value ) {
      this.covers.dropOverflowingRow = value;
      this.startAutoPlay();
    },
    "$store.state.canvas.alignmentVertical": function( value ) {
      this.canvas.alignmentVertical = value;
    },
  },
  
  methods: {
  
    
    prepareData: function() {
      
      let vue = this;
      
      let standaloneOpts = document.querySelector('#optionsData');
      if ( standaloneOpts ) {
        
        standaloneOpts = JSON.parse(standaloneOpts.textContent);
        this.covers.size = standaloneOpts.covers.size;
        this.covers.sizeOriginal = standaloneOpts.covers.size;
        this.covers.perRow = standaloneOpts.covers.perRow;
        this.covers.padding = standaloneOpts.covers.padding;
        this.covers.dropOverflowingRow = standaloneOpts.covers.dropOverflowingRow;
        this.canvas.width = standaloneOpts.canvas.width;
        this.canvas.height = standaloneOpts.canvas.width;
        this.canvas.padding.left = standaloneOpts.canvas.padding.left;
        this.canvas.padding.top = standaloneOpts.canvas.padding.top;
        this.canvas.padding.right = standaloneOpts.canvas.padding.right;
        this.canvas.padding.bottom = standaloneOpts.canvas.padding.bottom;
        this.covers.all = standaloneOpts.covers.all;
        this.canvas.overlayColor = standaloneOpts.canvas.overlayColor;
        this.canvas.grayscale = standaloneOpts.canvas.grayscale;
        this.canvas.grayscaleContrast = standaloneOpts.canvas.grayscaleContrast;
        this.canvas.background = standaloneOpts.canvas.background;
        this.canvas.alignmentVertical = standaloneOpts.canvas.alignmentVertical;
        this.prioritizeCoversPerRow = standaloneOpts.prioritizeCoversPerRow;
        this.loadAnimationPreset( standaloneOpts.animationPreset );
        
      }
      else if ( this.editorCovers ) {
        
        let presetsArray = _.map(this.presets, function( p ) { return { label: _.lowerCase(p.name), value: p.name, description: p.description } });
        if ( !this.$store.state.animationPresets ) {
          this.$store.commit('update', [
            { key: 'animationPreset', value: presetsArray[0].value },
            { key: 'animationPresets', value: presetsArray },
          ]);
        }
        
        if ( this.editorCoverSize > 0 ) this.covers.size = parseFloat(this.editorCoverSize);
        if ( this.editorCoverSize > 0 ) this.covers.sizeOriginal = parseFloat(this.editorCoverSize);
        this.covers.perRow = this.editorCoversPerRow;
        this.covers.padding = this.editorCoverPadding > -1 ? parseFloat(this.editorCoverPadding) : 0;
        this.canvas.width = this.editorCanvasWidth;
        this.canvas.height = this.editorCanvasHeight;
        this.canvas.padding.left = this.editorCanvasPaddingLeft;
        this.canvas.padding.top = this.editorCanvasPaddingTop;
        this.canvas.padding.right = this.editorCanvasPaddingRight;
        this.canvas.padding.bottom = this.editorCanvasPaddingBottom;
        let covers = this.editorCovers;
        if ( this.$store.state.excludeArchived ) covers = _.filter(covers, function(o) { return !o.inArchive; });
        this.covers.all = this.mappy( covers );
        this.canvas.overlayColor = this.$store.state.awpOverlayColor; 
        this.prioritizeCoversPerRow = this.$store.state.prioritizeCoversPerRow; 
        this.canvas.grayscale = this.$store.state.awpGrayscale;
        this.canvas.grayscaleContrast = this.$store.state.awpGrayscaleContrast;
        this.canvas.background = this.$store.state.canvas.background;
        this.canvas.alignmentVertical = this.$store.state.canvas.alignmentVertical;
        this.covers.dropOverflowingRow = this.$store.state.awpDropOverflowingRow;
        this.loadAnimationPreset( this.$store.state.animationPreset );
        console.log(  this.canvas.background );
      }
      else {
        this.covers.all = require('../../_mixins/getCovers.json');
        this.covers.all = this.mappy( this.covers.all );
        this.loadAnimationPreset( 'piano-swipe-fade' );
      }
      
      this.covers.allOriginal = JSON.parse(JSON.stringify( this.covers.all )); 
      
    },
    
    loadAnimationPreset: function( presetName ) {
      this.animation = _.find( this.presets, { name: presetName });
    },  
    
    mappy: function( array ) {
      
      let vue = this;
      if ( array && array.length > 0 ) {
        return _.map( array, function( book ) {
          return book.cover.match('https://') ? book.cover : vue.makeCoverUrl(book.cover);;
        });
      }
      else {
        return [];
      }
      
    },
    
  }
};
