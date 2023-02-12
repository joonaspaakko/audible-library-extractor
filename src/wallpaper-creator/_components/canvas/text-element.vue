<template>
  <div>
    <content-editable 
      tag="span" 
      :contenteditable="contentIsEditable" 
      data-no-dragscroll
      v-model="text" :noNL="true" :noHTML="true" 
      @returned="moveableBlur" 
      @blur.native="moveableBlur"
      @dblclick.native="doubleClick"
      @mousedown.native="activateControls"
      ref="contenteditable"
      class="text-element-child"
      :class="[ textClass, 'panzoom-exclude']"
      :style="{
        fontFamily: textObj.fontFamily,
        fontSize: textObj.fontSize + 'px',
        lineHeight: textObj.fontSize + 'px',
        fontWeight: textObj.bold ? 'bold' : 'normal',
        textTransform: textObj.allCaps ? 'uppercase' : 'none',
        justifyContent: textObj.alignment === 'left' ? 'flex-start' : textObj.alignment === 'center' ? 'center' : textObj.alignment === 'right' ? 'flex-end' : null,
        justifyItems: textObj.alignment === 'left' ? 'flex-start' : textObj.alignment === 'center' ? 'center' : textObj.alignment === 'right' ? 'flex-end' : null,
        alignContent: textObj.verticalAlignment === 'left' ? 'flex-start' : textObj.verticalAlignment === 'center' ? 'center' : textObj.verticalAlignment === 'right' ? 'flex-end' : null,
        alignItems: textObj.verticalAlignment === 'left' ? 'flex-start' : textObj.alignmeverticalAlignmentnt === 'center' ? 'center' : textObj.verticalAlignment === 'right' ? 'flex-end' : null,
        color: textObj.color,
      }"
    />
    <Moveable 
      :target="'.'+textClass"
      ref="moveable"
      class="panzoom-exclude"
      v-bind="moveableOpts" 
      @drag="moveableDrag"
      @resize="moveableResize"
      @resizeStart="moveableResizeStart"
      @rotate="moveableRotate"
      data-no-dragscroll
      :zoom="1"
      @vue:mounted="moveableMounted"
    ></Moveable>
  </div> 
</template>

<script>
import Moveable from "vue3-moveable";
import ContentEditable from 'vue-contenteditable';

export default {
  name: "ToolbarTextElements",
  components: { Moveable, ContentEditable },
  props: ['textObj', 'textIndex'],
  data: function () {
    return {
      store: this.$store.state,
      moveableOpts: {
        draggable: true,
        throttleDrag: 1,
        resizable: true,
        throttleResize: 1,
        keepRatio: false,
        scalable: false,
        throttleScale: 1,
        rotatable: true,
        throttleRotate: 45,
        pinchable: false,
        origin: false,
        elementGuidelines: [],
        snappable: true,
        snapThreshold: 10,
        isDisplaySnapDigit: false,
        snapGap: true,
        snapElement: true,
        snapVertical: true,
        snapHorizontal: true,
        snapCenter: false,
        snapDigit: 0,
        padding: { left: 0, top: 0, right: 0, bottom: 0 },
        // renderDirections: ["nw", "ne", "sw", "se"],
      },
      frame: {
        translate: [0,0],
      },
      contentIsEditable: false,
    };
  },
  
  computed: {
    text: {
      get () {
        return this.textObj.text;
      },
      set: _.debounce( function(value) {
        this.$store.commit('changeText', { index: this.textIndex, key: 'text', value: value,  });
      }, 250, { leading: false, trailing: true }),
    },
    textClass() {
      return 'text-element-' + this.textIndex;
    },
  },
  
  watch: {
    'store.usedCovers': function() {
      this.setElementGuidelines();
    },
    'store.tiers': {
      handler: function (val, oldVal) {
        this.setElementGuidelines();
      },
      deep: true
    },
  },
  
  mounted: function() {
    
    if ( this.textObj.width  ) this.$refs.moveable.$el.style.width  = this.textObj.width;
    if ( this.textObj.height ) this.$refs.moveable.$el.style.height = this.textObj.height;
    if ( this.textObj.transform ) this.$refs.moveable.$el.style.transform = this.textObj.transform;
    
    this.setElementGuidelines();
    this.$emitter.on('update-moveable-handles', this.updateHandles);
    this.$emitter.on('nudge-up', this.nudgeUp);
    this.$emitter.on('nudge-right', this.nudgeRight);
    this.$emitter.on('nudge-down', this.nudgeDown);
    this.$emitter.on('nudge-left', this.nudgeLeft);
  },

  beforeUnmount: function () {
    this.$emitter.off('update-moveable-handles', this.updateHandles);
    this.$emitter.off('nudge-up', this.nudgeUp);
    this.$emitter.off('nudge-right', this.nudgeRight);
    this.$emitter.off('nudge-down', this.nudgeDown);
    this.$emitter.off('nudge-left', this.nudgeLeft);
  },

  methods: {
    
    updateText: _.debounce( function( config ) {
      
      if ( _.isArray(config) ) {
        let vue = this;
        _.each( config, function( o ) {
          o.index = vue.textIndex;
        });
      }
      else {
        config.index = this.textIndex;
      }
      
      this.$store.commit('changeText', config );
      
    }, 550, { leading: false, trailing: true }),
    
    nudgeUp: function( distance ) {
      if ( this.textObj.active ) {
        this.$refs.moveable.request("draggable", { deltaY: -Math.abs(distance), isInstant: true }); 
        this.updateText({ key: 'transform', value: this.$refs.moveable.$el.style.transform });
      }
    },
    nudgeRight: function( distance ) {
      if ( this.textObj.active ) {
        this.$refs.moveable.request("draggable", { deltaX: distance, isInstant: true }); 
        this.updateText({ key: 'transform', value: this.$refs.moveable.$el.style.transform });
      }
    },
    nudgeDown: function( distance ) {
      if ( this.textObj.active ) {
        this.$refs.moveable.request("draggable", { deltaY: distance, isInstant: true }); 
        this.updateText({ key: 'transform', value: this.$refs.moveable.$el.style.transform });
      }
    },
    nudgeLeft: function( distance ) {
      if ( this.textObj.active ) {
        this.$refs.moveable.request("draggable", { deltaX: -Math.abs(distance), isInstant: true }); 
        this.updateText({ key: 'transform', value: this.$refs.moveable.$el.style.transform });
      }
    },
    
    activateControls: function() {
      console.log('activateControls')
      if ( document.activeElement ) document.activeElement.blur();
      
      this.updateHandles();
      
      let targetIndex = this.textIndex;
      this.$store.commit("activateText", targetIndex);
      
      let transformBoxes = document.querySelectorAll('.moveable-control-box');
      if ( transformBoxes.length ) {
        transformBoxes.forEach(function( controlEl, controlIndex ) {
          controlEl.style.display = (targetIndex === controlIndex) ? 'block' : 'none';
        });
      }
      
    },
    
    updateHandles: function() {
      this.$refs.moveable.updateRect();
      // this.$refs.moveable.updateTarget();
    },
    
    setElementGuidelines: function() {
      this.$nextTick(function() {
        
        let coverImages = document.querySelectorAll('[data-coverImages], [data-tier-list-label]');
        if ( !coverImages ) return;
            coverImages = [...coverImages];
        // console.log( coverImages );
        const guidelinesFirstRow = coverImages.slice( 0, this.store.coversPerRow );
        const guidelinesLastRow = coverImages.slice( coverImages.length - this.store.coversPerRow, coverImages.length );
        this.moveableOpts.elementGuidelines = this.moveableOpts.elementGuidelines.concat( guidelinesFirstRow );
        this.moveableOpts.elementGuidelines = this.moveableOpts.elementGuidelines.concat( guidelinesLastRow );
        this.moveableOpts.elementGuidelines.push( document.querySelector(".canvas-bounds") );
      
      });
    },
    
    moveableRotate({ target, dist, transform }) {
      // console.log( transform )
      target.style.transform = transform;
      this.updateText({ key: 'transform', value: transform });
    },
    
    moveableDrag({ target, transform }) {
      target.style.transform = transform;
      this.updateText({ key: 'transform', value: transform });
    },
    
    moveableResizeStart: function( e ) {
      e.setOrigin(["%", "%"]);
      e.dragStart && e.dragStart.set(this.frame.translate);
    },
    
    moveableResize({ drag, target, width, height }) {
      this.frame.translate = drag.beforeTranslate;
      target.style.width = `${width}px`;
      target.style.height = `${height}px`;
      target.style.transform = drag.transform;
      this.updateText([
        { key: 'width', value: `${width}px` },
        { key: 'height', value: `${height}px` },
        { key: 'transform', value: drag.transform },
      ]);
    },
    
    arrowNudge: function( e ) {
      
      if ( this.textObj.active ) {
        let shiftModifier = e.srcKey.match('Shift');
        let distance = (shiftModifier ? 10 : 1);
        switch (e.srcKey) {
          case 'up':
            case 'upShift':
            // console.log('up');
            this.$refs.moveable.request("draggable", { deltaY: -Math.abs(distance), isInstant: true }); 
            break
          case 'right':
          case 'rightShift':
            // console.log('right');
            this.$refs.moveable.request("draggable", { deltaX: distance, isInstant: true }); 
            break
          case 'down':
          case 'downShift':
            // console.log('down');
            this.$refs.moveable.request("draggable", { deltaY: distance, isInstant: true }); 
            break
          case 'left':
          case 'leftShift':
            // console.log('left');
            this.$refs.moveable.request("draggable", { deltaX: -Math.abs(distance), isInstant: true }); 
            break
        }
      }
    },
    
    doubleClick: function() {
      
      this.moveableOpts.draggable = false;
      this.moveableOpts.rotatable = false;
      this.moveableOpts.resizable = false;
      this.contentIsEditable = true;
      this.$store.commit('update', [
        { key: 'events.textNudge', value: false },
        { key: 'events.textRemove', value: false },
        { key: 'events.canvasPanning', value: false },
      ]);
      this.$nextTick(function() {
        let vue = this;
        setTimeout(function() {
          
          vue.$refs.contenteditable.$el.focus();
          document.execCommand('selectAll',false,null);
          
        }, 100);
      });

    },
    
    moveableBlur: function() {
      
      this.moveableOpts.draggable = true;
      this.moveableOpts.rotatable = true;
      this.moveableOpts.resizable = true;
      this.contentIsEditable = false;
      this.$store.commit('update', [
        { key: 'events.textNudge', value: true },
        { key: 'events.textRemove', value: true },
        { key: 'events.canvasPanning', value: true },
      ]);
      this.$nextTick(function() {
        this.$refs.moveable.$el.click();
      });

    },
    
    // So that moveable's controls don't scale wiht the canvas
    moveableMounted( moveable ) {
      
      this.$nextTick(function() {
        document.body.appendChild( moveable.el );
        this.updateHandles();
      });
      
    },
    
  },
  
};
</script>

<style>
.moveable-control-box {
  width: 0px !important;
  height: 0px !important;
}
</style>

<style scoped lang="scss">

/* work-sans-regular - latin */
@font-face {
  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('@fonts/work-sans-v11-latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('@fonts/work-sans-v11-latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* work-sans-700 - latin */
@font-face {
  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 700;
  src: local(''),
       url('@fonts/work-sans-v11-latin-700.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('@fonts/work-sans-v11-latin-700.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* arvo-700 - latin */
@font-face {
  font-family: 'Arvo';
  font-style: normal;
  font-weight: 700;
  src: local(''),
       url('@fonts/arvo-v14-latin-700.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('@fonts/arvo-v14-latin-700.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* arvo-regular - latin */
@font-face {
  font-family: 'Arvo';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('@fonts/arvo-v14-latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('@fonts/arvo-v14-latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* concert-one-regular - latin */
@font-face {
  font-family: 'Concert One';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('@fonts/concert-one-v12-latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('@fonts/concert-one-v12-latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* courgette-regular - latin */
@font-face {
  font-family: 'Courgette';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('@fonts/courgette-v8-latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('@fonts/courgette-v8-latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* indie-flower-regular - latin */
@font-face {
  font-family: 'Indie Flower';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('@fonts/indie-flower-v12-latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('@fonts/indie-flower-v12-latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* merriweather-regular - latin */
@font-face {
  font-family: 'Merriweather';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('@fonts/merriweather-v25-latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('@fonts/merriweather-v25-latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* merriweather-700 - latin */
@font-face {
  font-family: 'Merriweather';
  font-style: normal;
  font-weight: 700;
  src: local(''),
       url('@fonts/merriweather-v25-latin-700.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('@fonts/merriweather-v25-latin-700.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* patrick-hand-regular - latin */
@font-face {
  font-family: 'Patrick Hand';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('@fonts/patrick-hand-v14-latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('@fonts/patrick-hand-v14-latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}


.text-element-child {
  white-space: nowrap;
  font-size: 30px;
  line-height: 35px;
  font-family: 'Work Sans', sans-serif;
  font-family: 'Merriweather', serif;
  font-family: 'Arvo', serif;
  font-family: 'Concert One', cursive; // no bold
  font-family: 'Courgette', cursive; // no bold
  font-family: 'Indie Flower', cursive; // no bold
  font-family: 'Patrick Hand', cursive; // no bold
  font-weight: 400;
  // letter-spacing: 1px;
  position: absolute;
  z-index: 999999;
  cursor: move !important; 
  width: 100%;
  display: inline-flex !important;
  justify-content: center;
  justify-items: center;
  align-content: center;
  align-items: center;
  position: absolute;
  span {
    border-radius: 4px;
    white-space: nowrap;
    outline: none;
    box-sizing: border-box;
    &:focus {
      border: 2px solid red;
    }
  }
}


</style>