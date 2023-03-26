<template>
<div id="awp"
:class="{ 
  'loader-bg': !afterMounted, 
  'reveal-covers': showLoadInClass,
  'dropped-overflowing-row': covers.dropOverflowingRow,
  'in-editor': editorCovers,
  'not-in-editor': !editorCovers,
}"
 :style="!editorCovers ? canvasStyle : null"
>
  
  <div v-if="awpOverlayColorEnabled && !editorCovers" id="color-overlay" :style="{
    background: awpOverlayColor, 
    mixBlendMode: awpBlendMode !== 'normal' ? awpBlendMode : null,
  }"></div>
  
  <div id="awp-inner-wrap" v-if="afterMounted">
    <component is="style">
      {{ editorCovers ? '#awp' : '#awp-inner-wrap' }} {
        {{ editorCovers ? '' : 'display: flex;' }}
        align-items: {{ canvas.alignmentVertical }} !important;
      }
      #awp .cover {
        margin: {{ covers.padding }}px;
        width: {{ covers.size }}px;
        height: {{ covers.size }}px;
      }
      #awp .cover > img {
        background-color: {{ canvas.background }};
        {{ canvas.grayscale ? 'filter: grayscale(1) contrast('+ canvas.grayscaleContrast +');' : '' }}
      }
      
      html, body, #awp {
        overscroll-behavior: {{ !editorCovers ? 'none' : 'auto' }};
        background-color: {{ !editorCovers ? canvas.background : 'transparent' }};
      }
    </component>
    <div>
      <div class="cover" ref="cover" v-for="(cover, index) in covers.visible" :key="index">
        <img :src="cover" alt="" draggable="false" class="cover-one">
        <img :src="cover" alt="" draggable="false" class="cover-two hide">
      </div>
    </div>
  </div>
</div>
</template>

<script>

import _ from "lodash";
import utilities from '@wallpaper-mixins/utilities.js';
import presets from '@wallpaper-mixins/presets.js';
import fitCoversToViewport from '@wallpaper-mixins/fitCoversToViewport.js';
import getAnimations from '@wallpaper-mixins/getAnimations.js';
import pickCoversToAnimate from '@wallpaper-mixins/pickCoversToAnimate.js';
import prepareData from '@wallpaper-mixins/prepareData.js';

let debounceDelay = 400;

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
        background: null,
        grayscale: null,
        grayscaleContrast: null,
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
        alignmentVertical: null,
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
        dropOverflowingRow: false,
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
        
        { in: true, class: 'push-left'      },
        { in: true, class: 'push-right'     },
        { in: true, class: 'push-up'        },
        { in: true, class: 'push-down'      },
        { in: true, class: 'squish-left'    },
        { in: true, class: 'squish-right'   },
        { in: true, class: 'squish-up'      },
        { in: true, class: 'squish-down'    },
        
        { in: true, out: true, swap: true, class: 'flip-horizontal-bottom'  },
        { in: true, out: true, swap: true, class: 'flip-horizontal-top'     },
        { in: true, out: true, swap: true, class: 'flip-vertical-right'     },
        { in: true, out: true, swap: true, class: 'flip-vertical-left'      },
        { in: true, out: true, swap: true, class: 'flip-diagonal-2-tl'      },
        { in: true, out: true, swap: true, class: 'flip-diagonal-2-br'      },
        { in: true, out: true, swap: true, class: 'flip-diagonal-1-bl'      },
        { in: true, out: true, swap: true, class: 'flip-diagonal-1-tr'      },
        { in: true, out: true, swap: true, class: 'flip-2-hor-top-2'        },
        { in: true, out: true, swap: true, class: 'flip-2-ver-right-2'      },
        { in: true, out: true, swap: true, class: 'flip-2-hor-bottom-2'     },
        { in: true, out: true, swap: true, class: 'flip-2-ver-left-2'       },
        { in: true, out: true, swap: true, class: 'flip-scale-down-hor'     },
        { in: true, out: true, swap: true, class: 'flip-scale-down-ver'     },
        { in: true, out: true, swap: true, class: 'flip-scale-down-diag-1'  },
        { in: true, out: true, swap: true, class: 'flip-scale-down-diag-2'  },
      ],
      cycleCounter: 0,
      cycleCounterTimer: null,
      shuffleCounter: 0,
      coverTimer: null,
      awpOverlayColorEnabled: false,
      awpBlendMode: '',
      awpOverlayColor: '',
    };
  },
  
  computed: {
    
    canvasStyle: function () {
      var style = {};
      style.paddingLeft   = this.canvas.padding.left   > -1 ? this.canvas.padding.left   + "px" : 0 + "px";
      style.paddingTop    = this.canvas.padding.top    > -1 ? this.canvas.padding.top    + "px" : 0 + "px";
      style.paddingRight  = this.canvas.padding.right  > -1 ? this.canvas.padding.right  + "px" : 0 + "px";
      style.paddingBottom = this.canvas.padding.bottom > -1 ? this.canvas.padding.bottom + "px" : 0 + "px";
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
    
    this.prepareData(() => {
      
      debounceDelay = 0;
      this.startAutoPlay();
      
    });
    
    
    window.addEventListener('resize', this.windowResized);
    
  },
  
  beforeUnmount: function() {
    
    window.removeEventListener('resize', this.windowResized);
    clearInterval( this.cycleInterval );
    clearInterval( this.cycleCounterTimer );
    clearInterval( this.coverTimer );
    
  },
  
  methods: {
    
    windowResized: function() {
      this.startAutoPlay();
    },
    
    startAutoPlay: _.debounce( function() {
      
      debounceDelay = 400;
      
      var vue = this;
      this.showLoadInClass = false;
      this.afterMounted = false;
      clearInterval( this.cycleInterval );
      clearInterval( this.cycleCounterTimer );
      clearInterval( this.coverTimer );
      this.sequentialCounter = 0;
      this.cycleCounter = 0;
      this.shuffleCounter = 0;
      if ( vue.editorCovers ) vue.$store.commit('update', [
        { key: 'awpAnimationStarted', value: false },
        { key: 'awpShowAnimationZone', value: false },
      ]);
      
      this.$nextTick(function() {
        
        this.fitCoversToViewport();
        
        let cycleDelay = vue.toMS( vue.animation.cycleDelay );
        let animationZone = (vue.animation.animationZone / 100) * cycleDelay;
        
        this.imageLoader( this.covers.visible, function() {
          
          vue.showLoadInClass = true;
          vue.afterMounted = true;
          
          vue.$nextTick(function() {
            
            let visibleCoverElements = vue.$refs.cover;
            // Failsafe for randomized animations, so no running animation is interrupted by a new one... Although this could also fail if there aren't enough covers to go around, but that's kinda unlikely...
            visibleCoverElements = _.filter( visibleCoverElements, function( cover ) { return !cover.classList.contains('animating-cover'); }); 
      
            if ( visibleCoverElements[0] ) {
              
              let playOnce = function( onLoad ) {
                
                if ( vue.editorCovers ) vue.$store.commit('update', [
                  { key: 'awpAnimationStarted', value: true },
                  { key: 'awpShowAnimationZone', value: true },
                ]);
                
                let pickedCoverElements = vue.pickCoversToAnimate( visibleCoverElements, cycleDelay );
                let animationDelay;
                
                if ( pickedCoverElements[0] ) {
                  
                  let sequentialDelays = vue.splitUnevenly(animationZone, pickedCoverElements.length, 0 );
                  let spreadCounter = 0;
                  let animateWithDelay = function() {
                    vue.coverTimer = setTimeout(function() {
                      
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
                if ( vue.editorCovers ) vue.$store.commit('update', { key: 'awpAnimationStarted', value: true });
              }
              
              vue.cycleInterval = setInterval(function() { playOnce(); }, cycleDelay );
            }
            
          });
        });
        
      });
      
    }, debounceDelay, { leading: false, trailing: true }),
    
    animateCover: function( currentTarget ) {
      
      ++this.animationCounter;
      
      let vue = this;
      let coverWrapper = currentTarget;
      coverWrapper.className = 'cover';
      
      let imageOne = coverWrapper.querySelector('.cover-one');
      let imageTwo = coverWrapper.querySelector('.cover-two');
      
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
          
          
          let animation = vue.getAnimations();
          
          if ( animation ) {
            if ( animation.swap ) {
              imageOut.classList.add( 'out' );
              imageIn.classList.add( 'in' );
              coverWrapper.classList.add( animation.class );
            }
            else {
              imageOut.classList.add( 'out' );
              imageIn.classList.add( 'in', animation.class );
              coverWrapper.setAttribute('data-animation-class', animation.class);
            }
            
            coverWrapper.addEventListener('animationend', endAnimation, { passive: true, once: true });
            function endAnimation() {
              imageOut.src = imageIn.src;
              coverWrapper.style.zIndex = null;
              coverWrapper.removeAttribute('data-animation-class');
              imageIn.classList.remove( animation.class );
              coverWrapper.className = 'cover'; 
            }
          }
          
        });
        
      }
      
    },
    
  },
  
};
</script>

<style lang="scss" scope>

html, body, #animated-wallpaper, #awp {
  margin: 0px;
  width: 100%;
  height: 100%;
}

#awp {
  position: relative;
  z-index: 5;
  overflow: hidden;
  font-size: 0px; 
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

#awp.dropped-overflowing-row {
  align-items: center;
}

#awp-inner-wrap {
  display: inline-block;
}

.not-in-editor {
  #awp-inner-wrap {
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
}

#color-overlay { 
  will-change: transform;
  position: fixed;
  z-index: 99999;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
}

@import "loader-bg.scss";
@import "animations.scss";

</style>
