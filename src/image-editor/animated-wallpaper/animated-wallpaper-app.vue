<template>
<div id="awp" :style="!editorCovers ? canvasStyle : null">
  <!-- <style>body { background: #151515; }</style> -->
  <div class="cover" ref="cover" v-show="afterMounted" :class="{ 'fade-in': !afterMounted }" v-for="(cover, index) in covers.visible" :key="index">
    <img :src="cover" alt="" draggable="false" class="cover-one">
    <img :src="cover" alt="" draggable="false" class="cover-two hide">
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
      canvas: {
        style: null,
        padding: {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        },
        width: 0,
        height: 0,
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
      cycleInterval: null,
      animations: [
        { in: true, duration: 1100, class: 'bounce-in-fwd'  },
        { in: true, duration: 1200, class: 'fade-in'        },
        { in: true, duration: 600,  class: 'fade-in-top'    },
        { in: true, duration: 600,  class: 'fade-in-br'     },
        { in: true, duration: 600,  class: 'fade-in-right'  },
        { in: true, duration: 600,  class: 'fade-in-tr'     },
        { in: true, duration: 600,  class: 'fade-in-bottom' },
        { in: true, duration: 600,  class: 'fade-in-tl'     },
        { in: true, duration: 600,  class: 'fade-in-left'   },
        { in: true, duration: 600,  class: 'fade-in-bl'     },
        
        { in: true, out: true, duration: 400, swap: true, class: 'flip-horizontal-bottom'  },
        { in: true, out: true, duration: 400, swap: true, class: 'flip-horizontal-top'     },
        { in: true, out: true, duration: 400, swap: true, class: 'flip-vertical-right'     },
        { in: true, out: true, duration: 400, swap: true, class: 'flip-vertical-left'      },
        { in: true, out: true, duration: 400, swap: true, class: 'flip-diagonal-2-tl'      },
        { in: true, out: true, duration: 400, swap: true, class: 'flip-diagonal-2-br'      },
        { in: true, out: true, duration: 400, swap: true, class: 'flip-diagonal-1-bl'      },
        { in: true, out: true, duration: 400, swap: true, class: 'flip-diagonal-1-tr'      },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-2-hor-top-2'        },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-2-hor-top-1'        },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-2-ver-right-2'      },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-2-ver-right-1'      },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-2-hor-bottom-2'     },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-2-hor-bottom-1'     },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-2-ver-left-2'       },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-2-ver-left-1'       },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-scale-down-hor'     },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-scale-down-ver'     },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-scale-down-diag-1'  },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-scale-down-diag-2'  },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-scale-2-hor-bottom' },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-scale-2-hor-top'    },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-scale-2-ver-left'   },
        { in: true, out: true, duration: 500, swap: true, class: 'flip-scale-2-ver-right'  },
      ],
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
    
    this.prepareData();
    
    let vue = this;
    
    window.addEventListener('resize', _.debounce( function() {
      
      vue.startAutoPlay();
      
    }, 400, { leading: false, trailing: true }) );
    
  },
  
  mounted: function() {
    
    let vue = this;
    vue.afterMounted = true;
    vue.startAutoPlay();
    
  },
  
  methods: {
    
    startAutoPlay: function() {
      
      this.fitCoversToViewport();
      
      this.$nextTick(function() {
        
        this.animation.sequentialCounter = 0;
        clearInterval( this.cycleInterval );
        
        let vue = this;
        let visibleCoverElements = vue.$refs.cover;
        
        let cycleDelay = (typeof vue.animation.cycleDelay === 'function') ? vue.toMS(vue.animation.cycleDelay({ 
          perRow: this.covers.perRow, 
          rows: this.covers.rows, 
          total: this.covers.total, 
          animationZone: this.animation.animationZone, 
          animationCovers: this.animation.covers,
          percentage: function( total, percentage ) { return (percentage / 100) * total; },
        })) : vue.toMS( vue.animation.cycleDelay );
        
        let animationZone = (vue.animation.animationZone / 100) * cycleDelay;
        
        var playOnce = function() {
          
          var pickedCoverElements = vue.pickCoversToAnimate( visibleCoverElements, cycleDelay );
          let animationDelay;
           
          let sequentialDelays = vue.splitUnevenly(animationZone, pickedCoverElements.length, 0 );
          var spreadCounter = 0;
          var animateWithDelay = function() {
            setTimeout(function() {
              
              animationDelay = vue.animation.randomDelay ? sequentialDelays[spreadCounter] : (animationZone/pickedCoverElements.length);
              vue.animateCover( pickedCoverElements[spreadCounter] );
              ++spreadCounter;
              if ( spreadCounter < pickedCoverElements.length ) animateWithDelay();
              
            }, animationDelay );
          };
          animateWithDelay();
          
        };
        if ( vue.animation.onLoad ) playOnce();
        this.cycleInterval = setInterval(function() { playOnce(); }, cycleDelay );
        
      });
      
    },
    
    animateCover: function( currentTarget ) {
      
      ++this.animationCounter;
      
      let vue = this;
      let coverWrapper = currentTarget;
      
      let imageOne = coverWrapper.querySelector('img.cover-one');
      let imageTwo = coverWrapper.querySelector('img.cover-two');
      if ( imageOne && imageTwo ) {
        
        let newImageFromArray = this.covers.all[0];
        
        // Move from top to the bottom of the array
        var top = this.covers.all.splice(0,1);
        this.covers.all.push( top[0] );
        
        this.loadImage( newImageFromArray, function( loadedImage ) {
          
          let imageOut = imageOne;
          let imageIn  = imageTwo;
          
          imageIn.classList.remove( 'hide' );
          
          imageIn.src = loadedImage.src;
          
          let animations = vue.getAnimations();
          
          // imageIn.style.width  = vue.covers.size + 'px';
          // imageIn.style.height = vue.covers.size + 'px';
          
          coverWrapper.style.zIndex = vue.animationCounter;  

          if ( animations.out && animations.out.swap ) {
            imageOut.classList.add( 'out' );
            imageIn.classList.add( 'in' );
            // imageIn.setAttribute('draggable', false);
            coverWrapper.classList.add( animations.out.class );
            // coverWrapper.appendChild( imageIn );
            
            // reset
            setTimeout(function() {
              imageIn.classList.remove('in');
              imageOut.classList.remove( 'out' );
              imageIn.classList.add('hide');
              // imageOut.remove();
              coverWrapper.className = 'cover';
              imageOut.src = imageIn.src;
              coverWrapper.style.zIndex = null;
            }, animations.out.duration );
            
          }
          else {

            coverWrapper.setAttribute('data-animation-class', animations.in.class);
            imageOut.classList.add( 'out' );
            imageIn.classList.add( 'in', animations.in.class );
            // coverWrapper.appendChild( imageIn );

            // reset
            setTimeout(function() {
              coverWrapper.removeAttribute('data-animation-class');
              imageIn.classList.remove('in');
              imageIn.classList.remove( animations.in.class );
              imageIn.classList.add('hide');
              // imageOut.remove();
              imageOut.classList.remove('out');
              imageOut.src = imageIn.src;
              coverWrapper.style.zIndex = null;
            }, animations.in.duration );
            
          }
          
        });
        
      }
      
    },
    
  },
  
};
</script>

<style lang="scss">

body { 
  margin: 0px;
  font-size: 0px; 
  overflow: hidden;
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
}

@import "animations.scss";

</style>
