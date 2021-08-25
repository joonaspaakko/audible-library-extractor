<template>
<div id="awp" :style="!editorCovers ? canvasStyle : null" :class="{ 'loader-bg': !afterMounted, 'reveal-covers': showLoadInClass }">
  <div v-if="afterMounted" style="width: 100%; height: 100%;">
    <!-- <style>body { background: #151515; }</style> -->
    <div class="cover" ref="cover" v-for="(cover, index) in covers.visible" :key="index">
      <img :src="cover" alt="" draggable="false" class="cover-one">
      <img :src="cover" alt="" draggable="false" class="cover-two hide">
    </div>
  </div>
  <component is="style">
    #awp .cover {
      margin: {{ (this.covers.padding > -1 ? this.covers.padding : 0) }}px;
    }
    #awp .cover img {
      width: {{ this.covers.size }}px;
      height: {{ this.covers.size }}px;
    }
  </component>
</div>
</template>

<script>

import utilities from '@wallpaper-mixins/utilities.js';
import presets from '@wallpaper-mixins/presets.js';
import fitCoversToViewport from '@wallpaper-mixins/fitCoversToViewport.js';
import getAnimations from '@wallpaper-mixins/getAnimations.js';
import pickCoversToAnimate from '@wallpaper-mixins/pickCoversToAnimate.js';
import prepareData from '@wallpaper-mixins/prepareData.js';

export default {
  name: "awp",
  mixins: [
    utilities,
    presets,
    fitCoversToViewport,
    getAnimations,
    pickCoversToAnimate,
    prepareData,
  ],
  data: function () {
    return {
      loadPreset: 'random-simple-flips',
      animation: null,
      sequentialCounter: 0,
      canvas: {
        overlayColor: null,
        style: null,
        padding: {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        },
        width: 0,
        height: 0,
        grayscale: null,
      },
      covers: {
        style: null,
        all: [],
        allOriginal: [],
        total: 0,
        perRow: 10,
        rows: null,
        size: 160,
        sizeOriginal: 160,
        padding: 0,
        paddingStyle: null,
        visible: null,
      },
      animationCounter: 0,
      mounted: false,
      afterMounted: false,
      showLoadInClass: false,
      cycleInterval: null,
      animations: [
        { in: true, class: 'bounce-in-fwd'  },
        { in: true, class: 'fade-in'        },
        { in: true, class: 'fade-in-top'    },
        { in: true, class: 'fade-in-br'     },
        { in: true, class: 'fade-in-right'  },
        { in: true, class: 'fade-in-tr'     },
        { in: true, class: 'fade-in-bottom' },
        { in: true, class: 'fade-in-tl'     },
        { in: true, class: 'fade-in-left'   },
        { in: true, class: 'fade-in-bl'     },
        
        { in: true, out: true, swap: true, class: 'flip-horizontal-bottom'  },
        { in: true, out: true, swap: true, class: 'flip-horizontal-top'     },
        { in: true, out: true, swap: true, class: 'flip-vertical-right'     },
        { in: true, out: true, swap: true, class: 'flip-vertical-left'      },
        { in: true, out: true, swap: true, class: 'flip-diagonal-2-tl'      },
        { in: true, out: true, swap: true, class: 'flip-diagonal-2-br'      },
        { in: true, out: true, swap: true, class: 'flip-diagonal-1-bl'      },
        { in: true, out: true, swap: true, class: 'flip-diagonal-1-tr'      },
        { in: true, out: true, swap: true, class: 'flip-2-hor-top-2'        },
        { in: true, out: true, swap: true, class: 'flip-2-hor-top-1'        },
        { in: true, out: true, swap: true, class: 'flip-2-ver-right-2'      },
        { in: true, out: true, swap: true, class: 'flip-2-ver-right-1'      },
        { in: true, out: true, swap: true, class: 'flip-2-hor-bottom-2'     },
        { in: true, out: true, swap: true, class: 'flip-2-hor-bottom-1'     },
        { in: true, out: true, swap: true, class: 'flip-2-ver-left-2'       },
        { in: true, out: true, swap: true, class: 'flip-2-ver-left-1'       },
        { in: true, out: true, swap: true, class: 'flip-scale-down-hor'     },
        { in: true, out: true, swap: true, class: 'flip-scale-down-ver'     },
        { in: true, out: true, swap: true, class: 'flip-scale-down-diag-1'  },
        { in: true, out: true, swap: true, class: 'flip-scale-down-diag-2'  },
        { in: true, out: true, swap: true, class: 'flip-scale-2-hor-bottom' },
        { in: true, out: true, swap: true, class: 'flip-scale-2-hor-top'    },
        { in: true, out: true, swap: true, class: 'flip-scale-2-ver-left'   },
        { in: true, out: true, swap: true, class: 'flip-scale-2-ver-right'  },
      ],
      cycleCounter: 0,
      cycleCounterTimer: null,
      shuffleCounter: 0,
    };
  },
  
  computed: {
    
    canvasStyle: function () {
      var style = {};
      style.paddingLeft   = this.canvas.padding.left   > -1 ? this.canvas.padding.left   + "px" : 0 + "px";
      style.paddingTop    = this.canvas.padding.top    > -1 ? this.canvas.padding.top    + "px" : 0 + "px";
      style.paddingRight  = this.canvas.padding.right  > -1 ? this.canvas.padding.right  + "px" : 0 + "px";
      style.paddingBottom = this.canvas.padding.bottom > -1 ? this.canvas.padding.bottom + "px" : 0 + "px";
      style.filter = this.canvas.grayscale;
      return style;
    },

    // coverPadding: function () {
    //   var style = {};
    //   style.margin = (this.covers.padding > -1 ? this.covers.padding : 0) + "px";
    //   return style;
    // },
    
    // coverStyle: function() {
    //   let style = {};
    //   style.width  = this.covers.size + 'px';
    //   style.height = this.covers.size + 'px';
    //   this.covers.style = style;
    // },
    
  },
  
  created: function() {
    
    this.prepareData();
    
    let vue = this;
    window.addEventListener('resize', this.windowResized);
    
  },
  
  mounted: function() {
    
    this.startAutoPlay();
    
  },
  
  beforeDestroy: function() {
    
    window.removeEventListener('resize', this.windowResized);
    clearInterval( this.cycleInterval );
    clearInterval( this.cycleCounterTimer );
    
  },
  
  methods: {
    
    windowResized: _.debounce( function() {
      this.startAutoPlay();
    }, 400, { leading: false, trailing: true }),
    
    startAutoPlay: function() {
      
      clearInterval( this.cycleInterval );
      clearInterval( this.cycleCounterTimer );
      this.sequentialCounter = 0;
      this.cycleCounter = 0;
      this.shuffleCounter = 0;
      
      var vue = this;
      this.afterMounted = false;
      
      this.$nextTick(function() {
        
        this.fitCoversToViewport();
        this.imageLoader( this.covers.visible, function() {
          
          vue.showLoadInClass = true;
          vue.afterMounted = true;
          
          vue.$nextTick(function() {
            
            let visibleCoverElements = vue.$refs.cover;
            // Failsafe for randomized animations, so no running animation is interrupted by a new one... Although this could also fail if there aren't enough covers to go around, but that's kinda unlikely...
            visibleCoverElements = _.filter( visibleCoverElements, function( cover ) { return !cover.classList.contains('animating-cover'); }); 
      
            if ( visibleCoverElements[0] ) {
              let cycleDelay = (typeof vue.animation.cycleDelay === 'function') ? vue.toMS(vue.animation.cycleDelay({ 
                perRow: vue.covers.perRow, 
                rows: vue.covers.rows, 
                total: vue.covers.total, 
                animationZone: vue.animation.animationZone, 
                animationCovers: vue.animation.covers,
                percentage: function( total, percentage ) { return (percentage / 100) * total; },
              })) : vue.toMS( vue.animation.cycleDelay );
              
              let animationZone = (vue.animation.animationZone / 100) * cycleDelay;
              
              var playOnce = function( onLoad ) {
                
                if ( vue.editorCovers ) vue.$store.commit('update', [
                  { key: 'awpAnimationZone', value: vue.animation.animationZone },
                  { key: 'awpCycleDelay', value: cycleDelay },
                ]);
                
                var pickedCoverElements = vue.pickCoversToAnimate( visibleCoverElements, cycleDelay );
                let animationDelay;
                
                if ( pickedCoverElements[0] ) {
                  
                  let sequentialDelays = vue.splitUnevenly(animationZone, pickedCoverElements.length, 0 );
                  var spreadCounter = 0;
                  var animateWithDelay = function() {
                    setTimeout(function() {
                      
                      animationDelay = vue.animation.randomDelay ? sequentialDelays[spreadCounter] : (animationZone/pickedCoverElements.length);
                      let animatedEl = pickedCoverElements[spreadCounter];
                      if ( animatedEl ) vue.animateCover( pickedCoverElements[spreadCounter] );
                      ++spreadCounter;
                      if ( spreadCounter < pickedCoverElements.length ) animateWithDelay();
                      
                    }, animationDelay );
                  };
                  animateWithDelay();
                  
                }
                
              };
              
              if ( vue.animation.onLoad ) {
                playOnce('onLoad');
              }
              else {                  
                if ( vue.editorCovers ) vue.$store.commit('update', { key: 'awpCycleDelay', value: cycleDelay });
              }
              
              vue.cycleInterval = setInterval(function() { playOnce(); }, cycleDelay );
            }
            
          });
        });
        
      });
      
    },
    
    animateCover: function( currentTarget ) {
      
      ++this.animationCounter;
      
      let vue = this;
      let coverWrapper = currentTarget;
      coverWrapper.className = 'cover';
      
      let imageOne = coverWrapper.querySelector('img.cover-one');
      let imageTwo = coverWrapper.querySelector('img.cover-two');
      
      if ( imageOne && imageTwo ) {
        
        if ( this.shuffleCounter > this.covers.all.length-1 ) this.shuffleCounter = 0;
        let newImageFromArray = this.covers.all[this.shuffleCounter ];
        ++this.shuffleCounter;
        
        // Move from top to the bottom of the array
        var top = this.covers.all.splice(0,1);
        this.covers.all.push( top[0] );
        
        this.loadImage( newImageFromArray, function( loadedImage ) {
          
          let imageOut = imageOne;
          let imageIn  = imageTwo;
          
          coverWrapper.classList.add( 'animating-cover' );
          coverWrapper.style.zIndex = vue.animationCounter;  
          imageIn.classList.remove( 'hide' );
          imageIn.src = loadedImage.src;
          loadedImage = null;
          
          let animations = vue.getAnimations();
          
          if ( animations.out && animations.out.swap ) {
            imageOut.classList.add( 'out' );
            imageIn.classList.add( 'in' );
            coverWrapper.classList.add( animations.out.class );
          }
          else {
            imageOut.classList.add( 'out' );
            imageIn.classList.add( 'in', animations.in.class );
            coverWrapper.setAttribute('data-animation-class', animations.in.class);
          }
          
          coverWrapper.addEventListener('animationend', endAnimation, { passive: true, once: true });
          function endAnimation() {
            imageOut.src = imageIn.src;
            coverWrapper.style.zIndex = null;
            coverWrapper.removeAttribute('data-animation-class');
            imageIn.classList.remove( animations.in.class );
            coverWrapper.className = 'cover'; 
          }
          
        });
        
      }
      
    },
    
  },
  
};
</script>

<style lang="scss">

html, body, #awp {
  margin: 0px;
  width: 100%;
  height: 100%;
}

body { 
  font-size: 0px; 
  overflow: hidden;
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
}

#awp {
  position: relative;
  z-index: 5;
}

@import "loader-bg.scss";
@import "animations.scss";

</style>
