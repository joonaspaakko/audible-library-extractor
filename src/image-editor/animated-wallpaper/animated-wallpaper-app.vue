<template>
<div id="awp">
  <!-- <style>body { background: #151515; }</style> -->
  <div class="cover" v-show="mounted" :class="{ 'fade-in': !afterMounted }" v-for="(cover, index) in covers.visible" :key="index">
    <img :style="covers.style" :src="cover" alt="" draggable="false">
  </div>
</div>
</template>

<script>

import getCovers from '@wallpaper-mixins/getCovers.js';
import utilities from '@wallpaper-mixins/utilities.js';
import presets from '@wallpaper-mixins/presets.js';
import fitCoversToViewport from '@wallpaper-mixins/fitCoversToViewport.js';
import getAnimations from '@wallpaper-mixins/getAnimations.js';
import pickCoversToAnimate from '@wallpaper-mixins/pickCoversToAnimate.js';

export default {
  name: "awp",
  mixins: [
    getCovers, 
    utilities,
    presets,
    fitCoversToViewport,
    getAnimations,
    pickCoversToAnimate,
  ],
  data: function () {
    return {
      loadPreset: 'piano-swipe-fade',
      animation: null,
      canvasPadding: 0,
      covers: {
        style: null,
        all: [],
        total: 0,
        perRow: 10,
        rows: null,
        size: null,
        sizeOriginal: 160,
        padding: 0,
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
  
  created: function() {
    
    this.animation = _.find( this.presets, { name: this.loadPreset });
    
    this.getCovers();
    this.covers.all = _.shuffle( this.covers.all );
    
    let vue = this;
    this.fitCoversToViewport();
    window.addEventListener('resize', _.debounce( function() {
      
      vue.mounted = false;
      vue.covers.visible = null;
      
      vue.$nextTick(function() {
        
        vue.fitCoversToViewport();
        
        vue.$nextTick(function() {
          vue.mounted = true;
          vue.startAutoPlay();
        });
        
      });
      
    }, 400, { leading: false, trailing: true }) );
    
  },
  
  mounted: function() {
    let vue = this;
    vue.mounted = true;
    this.$nextTick(function() {
      vue.afterMounted = true;
      vue.startAutoPlay();
    });
  },
  
  methods: {
    
    startAutoPlay: function() {
      
      this.animation.sequentialCounter = 0;
      clearInterval( this.cycleInterval );
      
      let vue = this;
      let visibleCoverElements = document.querySelectorAll('.cover');
      
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
      
    },
    
    animateCover: function( currentTarget ) {
      
      ++this.animationCounter;
      
      let vue = this;
      let coverWrapper = currentTarget;
      
      let image = coverWrapper.querySelectorAll('img');
      if ( image.length <= 1 ) {
        
        let newImageFromArray = this.covers.all[0];
        
        // Move from top to the bottom of the array
        var top = this.covers.all.splice(0,1);
        this.covers.all.push( top[0] );
        
        this.loadImage( newImageFromArray, function( imageIn ) {
          
          let imageOut = image[0];
          let animations = vue.getAnimations();
          
          imageIn.style.width  = vue.covers.size + 'px';
          imageIn.style.height = vue.covers.size + 'px';
          
          coverWrapper.style.zIndex = vue.animationCounter;  

          if ( animations.out && animations.out.swap ) {
            imageOut.classList.add( 'out' );
            imageIn.classList.add( 'in' );
            imageIn.setAttribute('draggable', false);
            coverWrapper.classList.add( animations.out.class );
            coverWrapper.appendChild( imageIn );
            
            // reset
            setTimeout(function() {
              imageIn.classList.remove('in');
              imageOut.remove();
              coverWrapper.className = 'cover';
              coverWrapper.style.zIndex = null;
            }, animations.out.duration );
            
          }
          else {

            coverWrapper.setAttribute('data-animation-class', animations.in.class);
            imageOut.classList.add( 'out' );
            imageIn.classList.add( 'in', animations.in.class );
            imageIn.setAttribute('draggable', false);
            coverWrapper.appendChild( imageIn );

            // reset
            setTimeout(function() {
              coverWrapper.removeAttribute('data-animation-class');
              imageIn.classList.remove('in');
              imageIn.classList.remove( animations.in.class );
              imageOut.remove();
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
