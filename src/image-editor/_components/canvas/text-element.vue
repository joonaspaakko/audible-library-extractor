<template>
  <div class="text-element">
    <Moveable 
    ref="moveable"
    class="text-element"
    v-bind="moveableOpts" 
    @drag="moveableDrag"
    @resize="moveableResize"
    @resizeStart="moveableResizeStart"
    @rotate="moveableRotate"
    @dblclick.native="doubleClick"
    @mousedown.native="activateControls"
    :style="{
      fontSize: textObj.fontSize + 'px',
      lineHeight: textObj.fontSiz + 'px',
      fontWeight: textObj.bold ? 'bold' : 'normal',
      textTransform: textObj.allCaps ? 'uppercase' : 'none',
      justifyContent: textObj.alignment === 'left' ? 'flex-start' : textObj.alignment === 'center' ? 'center' : textObj.alignment === 'right' ? 'flex-end' : null,
      justifyItems: textObj.alignment === 'left' ? 'flex-start' : textObj.alignment === 'center' ? 'center' : textObj.alignment === 'right' ? 'flex-end' : null,
      color: textObj.color,
    }"
    >
      <contenteditable tag="span" :contenteditable="contenteditable" 
      v-model="text" :noNL="true" :noHTML="true" 
      @returned="moveableBlur" 
      @blur.native="moveableBlur"
      ref="contenteditable"
      class="text-element-child"
      />
    </Moveable>
  </div>
</template>

<script>
import Moveable from 'vue-moveable';

export default {
  name: "textElement",
  components: { Moveable },
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
        elementGuidelines: null,
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
      elementGuidelines: null,
      contenteditable: false,
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
  },
  
  watch: {
    'store.usedCovers': function() {
      this.setElementGuidelines();
    },
  },
  
  mounted: function() {
    
    this.setElementGuidelines();
    
    // console.log( parseFloat(this.store.canvas.padding.top) )
    // this.$nextTick(function() {
    //   this.$refs.moveable.request("draggable", { deltaY: -(parseFloat(this.store.canvas.padding.top)/2), isInstant: true }); 
    // });
    
    // console.log("getRect: ", this.$refs.moveable.getRect());
    // console.log("isMoveableElement: ", this.$refs.moveable.isMoveableElement(document.body));
    this.$root.$on('update-moveable-handles', this.updateHandles);
    this.$root.$on('nudge-up', this.nudgeUp);
    this.$root.$on('nudge-right', this.nudgeRight);
    this.$root.$on('nudge-down', this.nudgeDown);
    this.$root.$on('nudge-left', this.nudgeLeft);
  },

  beforeDestroy: function () {
    this.$root.$off('update-moveable-handles', this.updateHandles);
    this.$root.$off('nudge-up', this.nudgeUp);
    this.$root.$off('nudge-right', this.nudgeRight);
    this.$root.$off('nudge-down', this.nudgeDown);
    this.$root.$off('nudge-left', this.nudgeLeft);
  },

  methods: {
    
    nudgeUp: function( distance ) {
      if ( this.textObj.active ) {
        this.$refs.moveable.request("draggable", { deltaY: -Math.abs(distance), isInstant: true }); 
      }
    },
    nudgeRight: function( distance ) {
      if ( this.textObj.active ) {
        this.$refs.moveable.request("draggable", { deltaX: distance, isInstant: true }); 
      }
    },
    nudgeDown: function( distance ) {
      if ( this.textObj.active ) {
        this.$refs.moveable.request("draggable", { deltaY: distance, isInstant: true }); 
      }
    },
    nudgeLeft: function( distance ) {
      if ( this.textObj.active ) {
        this.$refs.moveable.request("draggable", { deltaX: -Math.abs(distance), isInstant: true }); 
      }
    },
    
    activateControls: function() {
      
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
      
      this.moveableOpts.elementGuidelines = this.$parent.$refs.coverImages;
      this.moveableOpts.elementGuidelines.push( document.querySelector(".canvas-bounds") );
      
    },
    
    moveableScale({ target, transform, scale }) {
      target.style.transform = transform;
    },
    
    moveableRotate({ target, dist, transform }) {
      target.style.transform = transform;
    },
    
    moveableDrag({ target, transform }) {
      target.style.transform = transform;
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
    },
    
    arrowNudge: function( e ) {
      
      console.log( this.textObj.text, this.textObj.active )
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
      this.contenteditable = true;
      this.$store.commit('update', [
        { key: 'events.textNudge', value: false },
        { key: 'events.textRemove', value: false },
        { key: 'events.canvasPanning', value: false },
      ]);
      this.$nextTick(function() {
        let vue = this;
        setTimeout(function() {
          console.log( vue.store.events.textNudge )
          vue.$refs.contenteditable.$el.focus();
          document.execCommand('selectAll',false,null);
          
        },500);
      });

    },
    
    moveableBlur: function() {
      
      this.moveableOpts.draggable = true;
      this.moveableOpts.rotatable = true;
      this.moveableOpts.resizable = true;
      this.contenteditable = false;
      this.$store.commit('update', [
        { key: 'events.textNudge', value: true },
        { key: 'events.textRemove', value: true },
        { key: 'events.canvasPanning', value: true },
      ]);
      this.$nextTick(function() {
        this.$refs.moveable.$el.click();
      });

    },
    
    
  },
  
};
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;600&display=swap');
.text-element {
  white-space: nowrap;
  font-size: 30px;
  line-height: 35px;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  // letter-spacing: 1px;
  position: absolute;
  z-index: 999999;
  cursor: move !important; 
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