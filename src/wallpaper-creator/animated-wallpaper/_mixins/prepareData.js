import _ from "lodash";
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";

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
  
  created: function() {
    if ( this.editorCovers ) {
      this.$emitter.on('get-animation', this.sendAnimation);
    }
  },
  beforeUnmount: function() {
    if ( this.editorCovers ) {
      this.$emitter.off('get-animation', this.sendAnimation);
    }
  },
  
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
      this.updateStoreAnimation();
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
    "$store.state.awpCycleDelay": function( value ) {
      this.animation.cycleDelay = value;
      this.startAutoPlay();
    },
    "$store.state.awpAnimationZone": function( value ) {
      this.animation.animationZone = value;
      this.startAutoPlay();
    },
    "$store.state.awpAnimateOnLoad": function( value ) {
      this.animation.onLoad = value;
      this.startAutoPlay();
    },
    "$store.state.awpAnimation": function( value ) {
      this.animation.use = value;
      this.startAutoPlay();
    },
    "$store.state.awpCoversPerCycle": function( value ) {
      this.$store.commit('update', { key: 'awpAnimatedCoversLength', value: null });
      this.animation.covers = value;
      this.startAutoPlay();
    },
    "$store.state.awpRandomCovers": function( value ) {
      this.animation.randomCovers = value;
      this.startAutoPlay();
    },
    "$store.state.awpRandomDelay": function( value ) {
      this.animation.randomDelay = value;
      this.startAutoPlay();
    },
    "$store.state.awpSequential": function( value ) {
      this.animation.sequential = value;
      this.startAutoPlay();
    },
  },
  
  methods: {
    
    sendAnimation: function() {
      this.$store.commit('update', { key: 'animation', value: this.animation });
    },
  
    // FIXME: I don't know what the heck I was thinking structuring the data this way... 
    // I should've just mirrored the wallpaper data structure in vuex and merged stuff all at once...
    prepareData: function( callback ) {
      
      let vue = this;
      if ( this.editorCovers ) {
        
        // Basically: override local storage presets to avoid issues when presets change... I could've handled this differently...
        let presetsArray = _.map(this.presets, function( p ) { return { label: _.lowerCase(p.name), value: p.name, description: p.description } });
        if ( this.$store.state.animationPresets && this.$store.state.animationPreset ) {
          let lsAnimationPresetExists = _.find( this.presets, { name: this.$store.state.animationPreset });
          if ( !lsAnimationPresetExists ) this.$store.commit('update', { key: 'animationPreset', value: presetsArray[0].value });
        }
        else {
          this.$store.commit('update', { key: 'animationPreset', value: presetsArray[0].value });
        }
        this.$store.commit('update', { key: 'animationPresets', value: presetsArray });
        this.loadAnimationPreset( this.$store.state.animationPreset );
        
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
        this.covers.allOriginal = JSON.parse(JSON.stringify( this.covers.all )); 
        this.canvas.overlayColor = this.$store.state.awpOverlayColor; 
        this.prioritizeCoversPerRow = this.$store.state.prioritizeCoversPerRow; 
        this.canvas.grayscale = this.$store.state.awpGrayscale;
        this.canvas.grayscaleContrast = this.$store.state.awpGrayscaleContrast;
        this.canvas.background = this.$store.state.canvas.background;
        this.canvas.alignmentVertical = this.$store.state.canvas.alignmentVertical;
        this.covers.dropOverflowingRow = this.$store.state.awpDropOverflowingRow;
        
        if ( !localStorage.getItem("aleImageEditorSettings") ) {
          this.updateStoreAnimation();
        }
        else {
          this.animation.animationZone = this.$store.state.awpAnimationZone;
          this.animation.cycleDelay = this.$store.state.awpCycleDelay;
          this.animation.use = this.$store.state.awpAnimation;
          this.animation.onLoad = this.$store.state.awpAnimateOnLoad;
          this.animation.covers = this.$store.state.awpCoversPerCycle;
          this.$store.commit('update', { key: 'awpAnimatedCoversLength', value: null });
          this.animation.randomCovers = this.$store.state.awpRandomCovers;
          this.animation.randomDelay = this.$store.state.awpRandomDelay;
          this.animation.sequential = this.$store.state.awpSequential;
          let animationsArray = _.map( this.animations, 'class');
          this.$store.commit('update', { key: 'awpAnimations', value: animationsArray });
        }
        
        callback();
        
      }
      else {
        
        this.loadJSON(( standaloneOpts ) => {
          
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
          this.covers.allOriginal = JSON.parse(JSON.stringify( this.covers.all )); 
          this.canvas.overlayColor = standaloneOpts.canvas.overlayColor;
          this.canvas.grayscale = standaloneOpts.canvas.grayscale;
          this.canvas.grayscaleContrast = standaloneOpts.canvas.grayscaleContrast;
          this.canvas.background = standaloneOpts.canvas.background;
          this.canvas.alignmentVertical = standaloneOpts.canvas.alignmentVertical;
          this.prioritizeCoversPerRow = standaloneOpts.prioritizeCoversPerRow;
          this.awpOverlayColorEnabled = standaloneOpts.awpOverlayColorEnabled;
          this.awpBlendMode = standaloneOpts.awpBlendMode;
          this.awpOverlayColor = standaloneOpts.awpOverlayColor;
          this.animation = standaloneOpts.animation;
          
          
          if ( callback ) callback();
          
        });
      
      }
      // else {
        // this.covers.all = require('../../_mixins/getCovers.json');
        // this.covers.all = this.mappy( this.covers.all );
        // this.loadAnimationPreset( 'piano-swipe-fade' );
        
        // this.covers.allOriginal = JSON.parse(JSON.stringify( this.covers.all )); 
      // }
      
    },
    
    loadAnimationPreset: function( presetName ) {
      this.animation = JSON.parse(JSON.stringify(_.find( this.presets, { name: presetName })));
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
    
    updateStoreAnimation: function() {

      let animationsArray = _.map( this.animations, 'class');
      this.$store.commit('update', [
        { key: 'awpAnimationZone', value: this.animation.animationZone },
        { key: 'awpCycleDelay', value: this.animation.cycleDelay },
        { key: 'awpAnimation', value: this.animation.use || animationsArray },
        { key: 'awpAnimations', value: animationsArray },
        { key: 'awpAnimateOnLoad', value: this.animation.onLoad },
        { key: 'awpCoversPerCycle', value: this.animation.covers },
        { key: 'awpRandomCovers', value: this.animation.randomCovers },
        { key: 'awpRandomDelay', value: this.animation.randomDelay },
        { key: 'awpSequential', value: this.animation.sequential },
      ]);
      
    },
    
    loadJSON: function( callback, afterError )  {
      
      let scrpt = document.createElement("script");
      scrpt.src = "options.js";
      scrpt.type="text/javascript";
      scrpt.onload = () => {
        
        const standaloneOpts = window.wallpaperOptions; window.wallpaperOptions = null;
        try { scrpt.remove(); } catch(e) {}
        scrpt = null;
        if ( callback ) callback( standaloneOpts );
        
      };
      // Tries again if there's an error loading the files, but only once...
      scrpt.onerror = () => {
        scrpt = null;
        setTimeout(() => {
          if ( !afterError ) this.loadJSON( callback, 'afterError'); // Try twice...
          else {
            try { scrpt.remove(); } catch(e) {}
          }
        }, 1000);
      };
      document.head.appendChild(scrpt);
      
    },
    
  }
};
