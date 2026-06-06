<template>
  <div v-click-outside-element="clickedOutside">
    <content-editable 
      tag="span" 
      :contenteditable="contentIsEditable" 
      data-no-dragscroll
      v-model="text" :noNL="true" :noHTML="true" 
      @returned="moveableBlur" 
      @blur.native="moveableBlur"
      @dblclick.native="doubleClick"
      @mousedown.native="onMouseDown"
      @mouseup.native="onMouseUp"
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
      :className="textObj.active || snapOutlineVisible ? '' : 'moveable-hidden'"
      @dragStart="moveableDragStart"
      @drag="moveableDrag"
      @dragEnd="moveableDragEnd"
      @resize="moveableResize"
      @resizeStart="moveableResizeStart"
      @resizeEnd="moveableResizeEnd"
      @rotate="moveableRotate"
      @rotateEnd="moveableRotateEnd"
      data-no-dragscroll
      :zoom="1"
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
        throttleRotate: 90,
        pinchable: false,
        origin: false,
        elementGuidelines: [],
        snappable: true,
        snapThreshold: 10,
        isDisplaySnapDigit: false,
        snapGap: false,
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
      snapOutlineVisible: false,
      mouseIsDown: false,
      escHandler: null,
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
    'store.usedCovers':     function() { this.setElementGuidelines(); },
    'store.coversPerRow':   function() { this.setElementGuidelines(); },
    'store.canvas.width':   function() { this.setElementGuidelines(); },
    'store.canvas.height':  function() { this.setElementGuidelines(); },
    'store.textElements.length': function() { this.setElementGuidelines(); },
    'store.tiers': {
      handler: function() { this.setElementGuidelines(); },
      deep: true
    },
  },
  
  mounted: function() {

    this.$nextTick(function() {
      // Restore saved transform/size onto the actual target element
      let target = document.querySelector('.' + this.textClass);
      if ( target ) {
        if ( this.textObj.width     ) target.style.width     = this.textObj.width;
        if ( this.textObj.height    ) target.style.height    = this.textObj.height;
        if ( this.textObj.transform ) target.style.transform = this.textObj.transform;
      }

      // Move control box out of panzoom-scaled canvas but keep it inside the editor viewport
      let controlBox = this.$refs.moveable.getControlBoxElement();
      controlBox.dataset.textIndex = this.textIndex;
      ( document.querySelector( '#editor-canvas-left' ) || document.body ).appendChild( controlBox );
      this.$refs.moveable.updateRect();
    });

    this.setElementGuidelines();
    this.$emitter.on('update-moveable-handles', this.updateHandles);
    this.$emitter.on('hide-moveable-controls', this.deactivate);
    this.$emitter.on('text-drag-start', this.showSnapOutline);
    this.$emitter.on('text-drag-end', this.hideSnapOutline);
    this.$emitter.on('nudge-up', this.nudgeUp);
    this.$emitter.on('nudge-right', this.nudgeRight);
    this.$emitter.on('nudge-down', this.nudgeDown);
    this.$emitter.on('nudge-left', this.nudgeLeft);
    this.$emitter.on('canvas-resized', this.onCanvasResized);
    this.$emitter.on('snap-to-side', this.onSnapToSide);
  },

  beforeUnmount: function () {
    let controlBox = this.$refs.moveable.getControlBoxElement();
    if ( controlBox && controlBox.parentNode ) controlBox.parentNode.removeChild( controlBox );
    this.$emitter.off('update-moveable-handles', this.updateHandles);
    this.$emitter.off('hide-moveable-controls', this.deactivate);
    this.$emitter.off('text-drag-start', this.showSnapOutline);
    this.$emitter.off('text-drag-end', this.hideSnapOutline);
    this.$emitter.off('nudge-up', this.nudgeUp);
    this.$emitter.off('nudge-right', this.nudgeRight);
    this.$emitter.off('nudge-down', this.nudgeDown);
    this.$emitter.off('nudge-left', this.nudgeLeft);
    this.$emitter.off('canvas-resized', this.onCanvasResized);
    this.$emitter.off('snap-to-side', this.onSnapToSide);
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
        this.updateText({ key: 'transform', value: document.querySelector('.' + this.textClass).style.transform });
      }
    },
    nudgeRight: function( distance ) {
      if ( this.textObj.active ) {
        this.$refs.moveable.request("draggable", { deltaX: distance, isInstant: true });
        this.updateText({ key: 'transform', value: document.querySelector('.' + this.textClass).style.transform });
      }
    },
    nudgeDown: function( distance ) {
      if ( this.textObj.active ) {
        this.$refs.moveable.request("draggable", { deltaY: distance, isInstant: true });
        this.updateText({ key: 'transform', value: document.querySelector('.' + this.textClass).style.transform });
      }
    },
    nudgeLeft: function( distance ) {
      if ( this.textObj.active ) {
        this.$refs.moveable.request("draggable", { deltaX: -Math.abs(distance), isInstant: true });
        this.updateText({ key: 'transform', value: document.querySelector('.' + this.textClass).style.transform });
      }
    },
    
    onMouseDown: function() {
      this.mouseIsDown = true;
      this.activateControls();
    },

    onMouseUp: function() {
      this.mouseIsDown = false;
      if ( this.moveableDragging ) return;
      this.$emitter.emit('text-drag-end', this.textIndex);
    },

    activateControls: function() {
      if ( document.activeElement ) document.activeElement.blur();
      this.$store.commit("activateText", this.textIndex);
      const targetIndex = this.textIndex;
      document.querySelectorAll('.moveable-control-box').forEach(function( controlEl ) {
        controlEl.style.display = ( parseInt( controlEl.dataset.textIndex ) === targetIndex ) ? 'block' : 'none';
      });
      this.updateHandles();
    },

    clickedOutside: function( e ) {
      if ( !this.textObj.active ) return;
      if ( e.target.closest('.moveable-control-box') ) return;
      if ( e.target.closest('.text-elements.active') ) return;
      if ( e.target.closest('.n-internal-select-menu') ) return;
      if ( this.contentIsEditable ) {
        this.$refs.contenteditable.$el.blur();
        return;
      }
      this.$store.commit("activateText", -1);
    },

    deactivate: function() {
      this.$store.commit("activateText", -1);
    },

    updateHandles: function() {
      this.$refs.moveable.updateRect();
    },
    
    setElementGuidelines: function() {
      this.$nextTick(function() {

        const guidelines = [];

        const canvasBounds = document.querySelector('.canvas-bounds');
        if ( canvasBounds ) guidelines.push({ element: canvasBounds, refresh: true });

        const coverEls = [...document.querySelectorAll('.cover')];
        coverEls.forEach( el => guidelines.push({ element: el, refresh: true }) );

        const coverImages = [...document.querySelectorAll('[data-coverImages], [data-tier-list-label]')];
        coverImages.forEach( el => guidelines.push({ element: el, refresh: true }) );

        this.store.textElements.forEach( (t, i) => {
          if ( i === this.textIndex ) return;
          const el = document.querySelector('.text-element-' + i);
          if ( el ) guidelines.push({ element: el, refresh: true });
        });

        this.moveableOpts.elementGuidelines = guidelines;

      });
    },
    
    moveableDragStart: function() {
      this.moveableDragging = false;
    },

    moveableDrag: function({ target, transform, dist }) {
      if ( !this.moveableDragging && ( Math.abs( dist[0] ) > 3 || Math.abs( dist[1] ) > 3 ) ) {
        this.moveableDragging = true;
        this.$emitter.emit('text-drag-start', this.textIndex);
      }
      target.style.transform = transform;
      this.updateText({ key: 'transform', value: transform });
    },

    moveableDragEnd: function() {
      this.moveableDragging = false;
      if ( !this.mouseIsDown ) this.$emitter.emit('text-drag-end', this.textIndex);
      this.autoUpdateReservedSide();
    },

    // ROTATION ANGLE: reads the rotation out of a CSS transform string, normalized to 0..359.
    getAngle: function( transformStr ) {
      const rotateMatch = ( transformStr || '' ).match( /rotate\(\s*([-\d.]+)deg\s*\)/ );
      return rotateMatch ? ( ( parseFloat( rotateMatch[1] ) % 360 ) + 360 ) % 360 : 0;
    },

    // VERTICAL ORIENTATION: 90 / 270 degrees means the text reads vertically, so it reserves left/right.
    isVerticalAngle: function( angleDeg ) {
      return angleDeg === 90 || angleDeg === 270;
    },

    // TRANSLATE: reads the translate( x, y ) px values out of a CSS transform string.
    getTranslate: function( transformStr ) {
      const match = ( transformStr || '' ).match( /translate\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px\s*\)/ );
      return {
        tx: match ? parseFloat( match[1] ) : 0,
        ty: match ? parseFloat( match[2] ) : 0,
      };
    },

    // NEAREST SIDE: the side the element sits closest to, constrained to its orientation axis.
    // Vertical text can only reserve left/right, horizontal text only top/bottom.
    nearestSide: function( isVertical, elRect, canvasRect ) {
      const dx = ( elRect.left + elRect.width  / 2 ) - ( canvasRect.left + canvasRect.width  / 2 );
      const dy = ( elRect.top  + elRect.height / 2 ) - ( canvasRect.top  + canvasRect.height / 2 );
      return isVertical ?
        ( dx > 0 ? 'right'  : 'left' ) :
        ( dy > 0 ? 'bottom' : 'top'  );
    },

    // RESERVED VALUE: room the element needs on a side, in canvas units. Top/bottom reserve the
    // element's height, left/right reserve its width.
    measureReserved: function( side, elRect, scale ) {
      return ( side === 'top' || side === 'bottom' ) ?
        Math.round( elRect.height / scale ) :
        Math.round( elRect.width  / scale );
    },

    // After a free drag, re-pick the reserved side from the new position and re-measure the room.
    autoUpdateReservedSide: function() {
      const reserved = this.textObj.reservedPadding;
      if ( !reserved || !reserved.side ) return;

      const el = document.querySelector( '.' + this.textClass );
      const canvasEl = document.querySelector( '.editor-canvas' );
      if ( !el || !canvasEl ) return;

      const elRect     = el.getBoundingClientRect();
      const canvasRect = canvasEl.getBoundingClientRect();
      const scale      = canvasRect.width / this.store.canvas.width;

      const isVertical = this.isVerticalAngle( this.getAngle( this.textObj.transform ) );
      const newSide    = this.nearestSide( isVertical, elRect, canvasRect );
      const newValue   = this.measureReserved( newSide, elRect, scale );

      this.$store.commit( 'setTextReservedPadding', { index: this.textIndex, side: newSide, value: newValue } );
    },

    showSnapOutline: function( draggingIndex ) {
      if ( this.textIndex === draggingIndex ) return;
      this.snapOutlineVisible = true;
      this.updateHandles();
    },

    hideSnapOutline: function() {
      this.snapOutlineVisible = false;
    },

    moveableRotate({ target, transform }) {
      target.style.transform = transform;
      this.updateText({ key: 'transform', value: transform });

      // track which physical direction the top of the text is facing
      const angleDeg = this.getAngle( transform );
      let upDirection;
      if ( angleDeg < 45 || angleDeg >= 315 )       upDirection = 'top';
      else if ( angleDeg < 135 )                    upDirection = 'right';
      else if ( angleDeg < 225 )                    upDirection = 'bottom';
      else                                          upDirection = 'left';
      this.$store.commit( 'changeText', { index: this.textIndex, key: 'upDirection', value: upDirection } );
    },

    onSnapToSide: function({ index, side }) {
      if ( index !== this.textIndex ) return;
      this.snapToSide( side );
    },

    snapToSide: function( targetSide ) {
      const target   = document.querySelector( '.' + this.textClass );
      const canvasEl = document.querySelector( '.editor-canvas' );
      if ( !target || !canvasEl ) return;

      const canvasRect = canvasEl.getBoundingClientRect();
      const scale      = canvasRect.width / this.store.canvas.width;

      // parse current translate from DOM transform
      const { tx, ty } = this.getTranslate( target.style.transform );

      // STEP 1: rotate in place, then measure post-rotation bounding rect
      const targetAngle      = targetSide === 'right' ? 90 : targetSide === 'left' ? 270 : 0;
      const rotatedTransform = `translate(${ tx }px, ${ ty }px) rotate(${ targetAngle }deg)`;
      target.style.transform = rotatedTransform;
      this.$store.commit( 'changeText', { index: this.textIndex, key: 'transform', value: rotatedTransform } );
      this.$store.commit( 'changeText', { index: this.textIndex, key: 'upDirection', value: targetSide === 'bottom' ? 'top' : targetSide } );

      const elRect        = target.getBoundingClientRect();
      const reservedValue = this.measureReserved( targetSide, elRect, scale );

      // STEP 2: commit the reservation NOW so any cover reflow it triggers (left/right reservations
      // change coverSize, which shifts the canvas auto-height) settles before we position. Element
      // size does not change when we move it, so this measured value stays correct.
      this.$store.commit( 'setTextReservedPadding', { index: this.textIndex, side: targetSide, value: reservedValue } );

      // STEP 3: position flush to the edge once the reflowed dimensions are final, so we reach the
      // edge in a single click instead of needing a second.
      this.$nextTick( () => {
        this.positionAtSide( targetSide );
      });
    },

    positionAtSide: function( targetSide ) {
      const target   = document.querySelector( '.' + this.textClass );
      const canvasEl = document.querySelector( '.editor-canvas' );
      if ( !target || !canvasEl ) return;

      const canvasRect = canvasEl.getBoundingClientRect();
      const scale      = canvasRect.width / this.store.canvas.width;

      const { tx, ty }  = this.getTranslate( target.style.transform );
      const targetAngle = this.getAngle( target.style.transform );

      const canvasLeft = canvasRect.left;
      const canvasTop  = canvasRect.top;
      const canvasW    = canvasRect.width  / scale;
      const canvasH    = canvasRect.height / scale;

      const elRect = target.getBoundingClientRect();
      const elW    = elRect.width  / scale;
      const elH    = elRect.height / scale;

      // flush to edge, centered along it
      let targetOffsetLeft, targetOffsetTop;
      if ( targetSide === 'top' )         { targetOffsetLeft = ( canvasW - elW ) / 2; targetOffsetTop  = 0; }
      else if ( targetSide === 'bottom' ) { targetOffsetLeft = ( canvasW - elW ) / 2; targetOffsetTop  = canvasH - elH; }
      else if ( targetSide === 'left' )   { targetOffsetLeft = 0;                      targetOffsetTop  = ( canvasH - elH ) / 2; }
      else                                { targetOffsetLeft = canvasW - elW;          targetOffsetTop  = ( canvasH - elH ) / 2; }

      // convert canvas-space offsets to translate values via delta from current position
      const elOffsetLeft = ( elRect.left - canvasLeft ) / scale;
      const elOffsetTop  = ( elRect.top  - canvasTop  ) / scale;

      const newTx = Math.round( tx + ( targetOffsetLeft - elOffsetLeft ) );
      const newTy = Math.round( ty + ( targetOffsetTop  - elOffsetTop  ) );

      const newTransform = `translate(${ newTx }px, ${ newTy }px) rotate(${ targetAngle }deg)`;
      target.style.transform = newTransform;
      this.$store.commit( 'changeText', { index: this.textIndex, key: 'transform', value: newTransform } );

      this.$nextTick( () => {
        this.$refs.moveable && this.$refs.moveable.updateRect();
      });
    },

    // When a reserved element is freely rotated, its reading axis can flip from horizontal to
    // vertical. Move its reservation to the matching side on the new axis so the right dimension
    // is reserved.
    moveableRotateEnd: function() {
      const reserved = this.textObj.reservedPadding;
      if ( !reserved || !reserved.side ) return;

      const target = document.querySelector( '.' + this.textClass );
      if ( !target ) return;

      const isVertical        = this.isVerticalAngle( this.getAngle( target.style.transform ) );
      const currentIsVertical = reserved.side === 'left' || reserved.side === 'right';

      // only act if the orientation axis actually changed
      if ( isVertical === currentIsVertical ) return;

      const canvasEl = document.querySelector( '.editor-canvas' );
      if ( !canvasEl ) return;

      // flip to the nearest side on the new axis, preserving which half of canvas the element is on
      const elRect     = target.getBoundingClientRect();
      const canvasRect = canvasEl.getBoundingClientRect();
      const scale      = canvasRect.width / this.store.canvas.width;
      const newSide    = this.nearestSide( isVertical, elRect, canvasRect );
      const newValue   = this.measureReserved( newSide, elRect, scale );

      this.$store.commit( 'setTextReservedPadding', { index: this.textIndex, side: newSide, value: newValue } );
    },
    
    moveableResizeStart: function( e ) {
      e.setOrigin(["%", "%"]);
      e.dragStart && e.dragStart.set(this.frame.translate);
      this.$emitter.emit('text-drag-start', this.textIndex);
    },

    moveableResizeEnd: function() {
      this.$emitter.emit('text-drag-end', this.textIndex);
      this.recalculateReservedSide();
    },

    onCanvasResized: function({ oldWidth, oldHeight, newWidth, newHeight }) {
      const target = document.querySelector( '.' + this.textClass );
      if ( !target ) return;

      const ratioW = ( oldWidth  && oldWidth  !== newWidth  ) ? newWidth  / oldWidth  : 1;
      // In auto height mode (canvas.height = 0) the canvas height tracks content, so it shifts
      // whenever covers reflow. That is not a user canvas resize, so ignore the height ratio.
      // Otherwise reflow scales the element, which changes reserved padding, which reflows again,
      // looping and jittering left/right text elements while a padding slider is dragged.
      const autoHeight = this.store.canvas.height === 0;
      const ratioH = ( !autoHeight && oldHeight && oldHeight !== newHeight ) ? newHeight / oldHeight : 1;
      if ( ratioW === 1 && ratioH === 1 ) return;

      // READ FROM DOM — store may be behind due to debounced updateText
      const domW = parseFloat( target.style.width );
      const domH = parseFloat( target.style.height );
      const domTransform = target.style.transform;

      // SCALE SIZE
      if ( ratioW !== 1 && domW > 0 ) {
        const newW = Math.round( domW * ratioW ) + 'px';
        target.style.width = newW;
        this.$store.commit( 'changeText', { index: this.textIndex, key: 'width', value: newW } );
      }
      if ( ratioH !== 1 && domH > 0 ) {
        const newH = Math.round( domH * ratioH ) + 'px';
        target.style.height = newH;
        this.$store.commit( 'changeText', { index: this.textIndex, key: 'height', value: newH } );
      }

      // SCALE TRANSFORM TRANSLATION
      if ( domTransform ) {
        const updated = domTransform.replace(
          /translate\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px\s*\)/,
          ( _, tx, ty ) => {
            const newTx = Math.round( parseFloat( tx ) * ratioW );
            const newTy = Math.round( parseFloat( ty ) * ratioH );
            return `translate(${ newTx }px, ${ newTy }px)`;
          }
        );
        target.style.transform = updated;
        this.$store.commit( 'changeText', { index: this.textIndex, key: 'transform', value: updated } );
      }

      this.$nextTick( () => {
        this.$refs.moveable && this.$refs.moveable.updateRect();
        this.recalculateReservedSide();
      });
    },

    recalculateReservedSide: function() {
      const reserved = this.textObj.reservedPadding;
      if ( !reserved || !reserved.side ) return;

      const el = document.querySelector( '.' + this.textClass );
      const canvasEl = document.querySelector( '.editor-canvas' );
      if ( !el || !canvasEl ) return;

      const elRect     = el.getBoundingClientRect();
      const canvasRect = canvasEl.getBoundingClientRect();
      const scale      = canvasRect.width / this.store.canvas.width;
      const newValue   = this.measureReserved( reserved.side, elRect, scale );

      // BAIL IF UNCHANGED: re-committing the same value re-triggers the reservedPadding
      // watcher, which reflows covers, which fires canvas-resized again, looping forever.
      if ( newValue === reserved.value ) return;

      this.$store.commit( 'setTextReservedPadding', { index: this.textIndex, side: reserved.side, value: newValue } );
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

      this.escHandler = ( e ) => {
        if ( e.key === 'Escape' ) this.$refs.contenteditable.$el.blur();
      };
      document.addEventListener( 'keydown', this.escHandler );

    },
    
    moveableBlur: function() {

      if ( this.escHandler ) {
        document.removeEventListener( 'keydown', this.escHandler );
        this.escHandler = null;
      }

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
        this.updateHandles();
      });
      
    },
    
  },
  
};
</script>


<style>
.moveable-control-box.moveable-hidden {
  display: none !important;
}

.text-element-snap-outline {
  outline: 1px dashed rgba(255, 255, 255, 0.5) !important;
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