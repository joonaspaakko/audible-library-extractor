<template>
  <div 
    class="left" id="editor-canvas-left" ref="left" 
    :data-saving-image="store.saving"
    v-shortkey="store.events.textRemove ? ['backspace'] : null" @shortkey="store.events.textRemove ? removeTextElement($event) : null"
  >
  <!-- v-dragscroll="dragscrollEnabled" -->
    
    <tier-list-toolbar v-if="store.tierListMode" :draggableCovers="draggableCovers" />
    
    <div class="cover-actions" v-if="store.coverActions">
      <button v-if="$store.getters.rereadExist" class="remove-all-reread" @click="$store.commit('updateBookCover', { key: 'reread', value: false, book: store.coverActions, all: true })">
        <fa-solid-trash-alt/>
        &nbsp;
        Clear all re-read books
      </button>
      <button class="reread" @click="$store.commit('updateBookCover', { key: 'reread', value: !store.coverActions.reread, book: store.coverActions })">
        <ic-outline-check-circle style="color: #80f900;" v-if="store.coverActions.reread" />
        <mdi-checkbox-blank-circle style="color: #333; border-radius: 9999px; box-shadow: inset 0 0 7px white" v-else />
        &nbsp;
        Re-read book
      </button>
    </div>
    
    <div class="show-blank-canvas" v-show="store.saving"></div>
    
    <n-config-provider :theme="darkTheme" class="float-alert-wrapper">
      
      <div class="float-alert" v-if="!store.animatedWallpaperMode">
        <n-alert v-if="overlayHidden && showOverlay" title="Ovelay temporarily hidden so you can sort covers manually" type="warning" />
      </div>
      
      <div class="float-alert">
        <n-alert v-if="store.panningAlert" title="Sort covers manually by dragging or hold space bar while dragging to move the canvas" type="info" />
      </div>
      
      <div class="float-alert">
        <n-alert v-if="$store.getters.textElementActive" title="You can also move text using arrow keys. Shift modifier increases the step to 10px" type="info" />
      </div>
      
    </n-config-provider>
    
    <div 
      ref="grid"  
      class="grid" 
      :class="{ 
        'grabbing': grabbing,
        'force-panning': store.canvasPanning 
      }" 
      v-shortkey="store.events.textNudge ? {upShift: ['shift','arrowup'], up: ['arrowup'], rightShift: ['shift','arrowright'], right: ['arrowright'], downShift: ['shift','arrowdown'], down: ['arrowdown'], leftShift: ['shift','arrowleft'], left: ['arrowleft']} : null" 
      @shortkey="store.events.textNudge ? arrowNudge($event) : null"
    >
      <div
        class="editor-canvas"
        id="editor-canvas-content"
        @mouseenter="overlayHidden = true"
        @mouseleave="overlayHidden = false"
        :class="{ 'show-cover-padding-preview': store.slidingAround === 'paddingSize', saving: store.saving, 'hide-overlay-on-hover': showOverlay }"
        ref="canvas"
        :style="canvasStyle"
      >
        
        <div class="legend" :style="{
          right:  store.reread.label.offset.right+'px',
          bottom: store.reread.label.offset.bottom+'px',
        }">
          <reread-marker v-if="!store.animatedWallpaperMode && $store.getters.rereadExist && store.reread.label.show" :isStatic="true">relisten</reread-marker>
        </div>
        
        <div id="canvas-bg-color" v-if="store.canvas.background" :style="{ backgroundColor: store.canvas.background }"></div>
        <div id="awp-overlay" v-if="store.awpOverlayColorEnabled" :style="{ 
          backgroundColor: store.awpOverlayColor, 
          mixBlendMode: store.awpBlendMode,
          backgroundImage: store.overlayTexture ? 'url(assets/images/wallpaper-creator-textures/'+ store.overlayTexture +'.png)' : null,
        }"></div>
        <div class="canvas-bounds" :class="{ 'prevent-dragging': store.animatedWallpaperMode }"></div>
        
        <div
          class="canvas-padding-preview"
          :style="{ 
            borderLeftWidth  : store.canvas.padding.left + 'px',
            borderTopWidth   : store.canvas.padding.top + 'px',
            borderRightWidth : store.canvas.padding.right + 'px',
            borderBottomWidth: store.canvas.padding.bottom + 'px',
          }"
          v-show="store.slidingAround && store.slidingAround !== 'paddingSize'"
          v-if="!store.saving"
        ></div>
        <div class="text-elements" v-if="store.textElements.length && !store.animatedWallpaperMode">
          <text-element class="panzoom-exclude" data-no-dragscroll v-for="(text, index) in store.textElements" :key="text.id" :textObj="text" :textIndex="index" />
        </div>
        
        <div style="position: relative; z-index: 5; height: 100%; width: 100%" :class="{ 'awp-float': store.animatedWallpaperMode }">
          <div class="grid-inner-wrap">
            
            <animatedWallpaper v-if="store.animatedWallpaperMode" style="cursor: grab;"
              :editorCovers="store.covers"
              :editorCoverPadding="store.paddingSize"
              :editorCoverSize="store.coverSize"
              :editorCoversPerRow="store.coversPerRow"
              :editorCanvasWidth="store.canvas.width"
              :editorCanvasHeight="store.canvas.height"
              :editorCanvasPaddingLeft="store.canvas.padding.left"
              :editorCanvasPaddingTop="store.canvas.padding.top"
              :editorCanvasPaddingRight="store.canvas.padding.right"
              :editorCanvasPaddingBottom="store.canvas.padding.bottom"
            />
            
            <div v-else style="width: 100%; height: 100%; display: flex; flex-direction: row;" :style="canvasAlignmentVertical"> 
              
              <tier-list v-if="store.tierListMode" style="width: 100%;" @start="draggingStarted" @end="draggingEnded" @move="draggingMoved" />
              
              <draggable 
                class="drag-container"
                :class="{ 'tier-container': store.tierListMode, 'tier-container-collapse': !$store.getters.containerTierVisible }" 
                v-if="!store.tierListMode || store.tierListMode && !store.saving"
                v-model="draggableCovers" 
                item-key="asin"
                group="covers" 
                @start="draggingStarted" 
                @end="draggingEnded" 
                @move="draggingMoved" 
                style="width: 100%;"
                :style="store.tierListMode ? { marginTop: (store.paddingSize*10)+'px', minHeight: store.coverSize+'px' } : canvasAlignment"
              >
                <template #item="{element}">
                  <cover :key="element.asin" :book="element"></cover>
                </template>
              </draggable>
              
            </div>
            
            <component v-if="!store.animatedWallpaperMode" is="style">
              .cover {
                padding: {{ ( paddingSizeNumber > -1 ?  store.paddingSize : 0) }}px !important;
                opacity: {{ store.coverOpacityEnabled ? store.coverOpacity : 1 }} !important;
              }
              .cover .cover-img {
                width: {{ store.coverSize > 0 ? store.coverSize : 0 }}px !important;
                height: {{ store.coverSize > 0 ? store.coverSize : 0 }}px !important;
              }
              .cover .cover-heart-icon {
                height: {{ coverIconSize }}px !important;
                top: {{ coverIconSize/2 }}px !important;
                right: {{coverIconSize/2 }}px !important;
              }
              .cover .cover-heart-icon svg,
              .cover .cover-star-icons svg {
                font-size: {{ coverIconSize }}px !important;
                line-height: {{ coverIconSize }}px !important;
                filter: drop-shadow( 0 1px 3px rgba(0,0,0, .8) );
              }
              .cover .cover-star-icons {
                height: {{ coverIconSize-4 }}px !important;
              }
              .cover .cover-star-icons {
                /* {{ store.paddingSize }} - {{ paddingSizeNumber > 5 }} */
                bottom: {{ (paddingSizeNumber > 0) ? (paddingSizeNumber > 7 ? -paddingSizeNumber*1.2 : -paddingSizeNumber) : 12 }}px !important;
              }
              .cover img {
                border-radius: {{ Math.floor(store.borderRadius * 100) }}% !important;
              }
            </component>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import textElement from "@editor-comps/canvas/text-element.vue";
import calculateCoverSize from "@editor-mixins/calculateCoverSize.js";
import animatedWallpaper from "../animated-wallpaper/animated-wallpaper-app.vue";
import tierList from "@editor-comps/canvas/tier-list.vue";
import tierListToolbar from "@editor-comps/canvas/tier-list-toolbar.vue";
import cover from '@editor-comps/canvas/cover.vue';
import zoomies from '@editor-mixins/canvas-zoom.js';

import { 
  NConfigProvider, 
  darkTheme, 
  NAlert,
} from 'naive-ui';

export default {
  name: "editorCanvas",
  mixins: [
    calculateCoverSize,
    zoomies, 
  ],
  components: { 
    draggable, 
    textElement, 
    animatedWallpaper,
    tierList,
    tierListToolbar,
    cover,
    
    NConfigProvider,
    NAlert,
  },
  data: function () {
    return {
      store: this.$store.state,
      dragscrollEnabled: false,
      overlayHidden: false,
      darkTheme: darkTheme,
    };
  },
  
  mounted: function() {
    
    document.querySelector('#editor-canvas-left').addEventListener("mousedown", this.moveableControlsHide);
    this.$emitter.on('hide-moveable-controls', this.moveableControlsHide);
    document.querySelector('#editor-canvas-left').addEventListener("scroll", this.panningCanvas);
    
    let coverSize = this.calculateCoverSize({ coversPerRow: this.store.coversPerRow });
    this.$store.commit('update', { key: 'coverSize', value: coverSize });
    
    this.$nextTick(function() {
      
      this.dragscrollEnabled = true;
      this.moveableControlsHide();
        
    });
    
    if ( this.store.tierListMode ) {
      const tierContainer = this.$el.querySelector('.tier-container');
      const appContainer = document.querySelector('#app');
      appContainer.prepend( tierContainer )
    }
    
  },

  beforeUnmount: function () {
    document.querySelector('#editor-canvas-left').removeEventListener("mousedown", this.moveableControlsHide);
    this.$emitter.off('hide-moveable-controls', this.moveableControlsHide);
    document.querySelector('#editor-canvas-left').removeEventListener("scroll", this.panningCanvas);
    
    const tierContainer = document.querySelector('#app > .tier-container');
    if ( tierContainer ) tierContainer.remove();
    
  },

  computed: {
    
    showOverlay() {
      return !this.store.animatedWallpaperMode && this.store.awpOverlayColorEnabled;
    },
    
    paddingSizeNumber: function() {
      return parseFloat( this.store.paddingSize );
    },
    
    coverIconSize: function() {
      
      const coverMatchedSize = this.store.coverSize/7.3; 
      const min = 13;
      return coverMatchedSize < min ? min : coverMatchedSize;
      
    },
    
    draggableCovers: {
      get() {
        let covers = this.store.covers;
            covers = this.store.excludeArchived ? _.filter(covers, function(o) { return !o.inArchive; }) : covers;        
        return covers.slice(0, this.store.coverAmount);
      },
      set(value) {
        this.$store.commit('update', { key: 'covers', value: value  });
      }
    },
    usedCovers: {
      get() {
        let covers = this.store.covers;
            covers = this.store.excludeArchived ? _.filter(covers, function(o) { return !o.inArchive; }) : covers;        
        return covers.slice(0, this.store.coverAmount);
      },
      set(value) {
        this.$store.commit('update', { key: 'usedCovers', value: value  });
      }
    },
    
    canvasStyle: function () {
      var style = {};
      if (this.store.canvas.width > 0) {
        style.width = this.store.canvas.width + "px";
      }
      else {
        style.width = 0 + "px";
      }
      if (this.store.canvas.height > 0) style.height = this.store.canvas.height + "px";
      if (this.store.saving) style.borderColor = "transparent";
      if (this.store.saving) style.outlineColor = "transparent";
      
      style.paddingLeft   = this.store.canvas.padding.left   > -1 ? this.store.canvas.padding.left   + "px" : 0 + "px";
      style.paddingTop    = this.store.canvas.padding.top    > -1 ? this.store.canvas.padding.top    + "px" : 0 + "px";
      style.paddingRight  = this.store.canvas.padding.right  > -1 ? this.store.canvas.padding.right  + "px" : 0 + "px";
      style.paddingBottom = this.store.canvas.padding.bottom > -1 ? this.store.canvas.padding.bottom + "px" : 0 + "px";
      
      // if ( this.store.saving ) style.transform = null;
      // else if (this.store.canvas.zoom > 0 && this.store.canvas.zoom != 1) {
      //   style.transform = "scale(" + this.store.canvas.zoom + ")";
      // }
      // if (this.store.canvas.transformOrigin) style.transformOrigin = this.store.canvas.transformOrigin;
      
      return style;
    },
    // coverStyle: function () {
    //   var style = {};
    //   if (this.store.coverSize > -1) {
    //     style.width = this.store.coverSize + "px";
    //   }
    //   else {
    //     style.width = 0 + "px";
    //   }
    //   if (this.store.coverSize > -1) {
    //     style.height = this.store.coverSize + "px";
    //   }
    //   else {
    //     style.height = 0 + "px";
    //   }
    //   return style;
    // },
    // coverPadding: function () {
    //   var style = {};
    //   if (this.store.paddingSize > -1) {
    //     style.padding = this.store.paddingSize + "px";
    //   }
    //   else {
    //     style.padding = 0 + "px";
    //   } 
    //   return style;
    // },
    canvasAlignment: function() {
      let style = {};
      
      style.textAlign = this.store.canvas.alignment;
      style.position = this.store.canvas.height > 0 ? 'absolute' : null;
      // if ( this.store.canvas.height > 0 ) style.height = this.store.canvas.height + 'px';
      // if ( this.store.canvas.alignmentVertical === 'flex-start' ) {
      //   style.marginTop = 'auto';
      //   style.marginBottom = null;
      // }
      // else if ( this.store.canvas.alignmentVertical === 'center' ) {
      //   style.marginTop = 'auto';
      //   style.marginBottom = 'auto';
      // }
      // else if ( this.store.canvas.alignmentVertical === 'flex-end' ) {
      //   style.marginTop = null;
      //   style.marginBottom = 'auto';
      // }
      
      return style;
    },
    canvasAlignmentVertical: function() {
      let style = {};
      
      style.alignItems = this.store.canvas.alignmentVertical;
      style.alignContent = this.store.canvas.alignmentVertical;
      if ( this.store.canvas.alignment === 'left' ) {
        style.justifyItems = 'flex-start';
        style.justifyContent = 'flex-start';
      }
      else if ( this.store.canvas.alignment === 'center' ) {
        style.justifyItems = 'center';
        style.justifyContent = 'center';
      }
      else if ( this.store.canvas.alignment === 'right' ) {
        style.justifyItems = 'flex-end';
        style.justifyContent = 'flex-end';
      }
      
      if ( this.store.reverseCoverFlow ) style.transform = 'rotate(180deg)';
      
      return style;
    },
  },
  
  methods: {
    
    arrowNudge: function( e ) {
    
      let shiftModifier = e.srcKey.match('Shift');
      let distance = (shiftModifier ? 10 : 1);
      switch (e.srcKey) {
        case 'up':
        case 'upShift':
          // console.log('up');
          this.$emitter.emit('nudge-up', distance);
          break
        case 'right':
        case 'rightShift':
          // console.log('right');
          this.$emitter.emit('nudge-right', distance);
          break
        case 'down':
        case 'downShift':
          // console.log('down');
          this.$emitter.emit('nudge-down', distance);
          break
        case 'left':
        case 'leftShift':
          // console.log('left');
          this.$emitter.emit('nudge-left', distance);
          break
      }
    },
    
    panningCanvas: function() {
      this.$emitter.emit('update-moveable-handles');
    },
    
    removeTextElement: function() {
      
      var activeIndex = _.findIndex( this.store.textElements, 'active');
      if ( activeIndex > -1 ) this.$store.commit('removeText', activeIndex);
      
    },
    
    moveableControlsHide: function( e ) {
      
      let textElement = !e ? false : e.target.classList.contains('text-element') || e.target.classList.contains('text-element-child');
      if ( !textElement ) {
        
        this.$store.commit("activateText", -1);
        
        let transformBoxes = document.querySelectorAll('.moveable-control-box');
        if ( transformBoxes.length ) {
          transformBoxes.forEach(function( controlEl, controlIndex ) {
            controlEl.style.display = 'none';
          });
        }
      }
      
    },
    
    draggingStarted( e ) {
      
    },
    
    draggingEnded( e ) {
      
      e.from.parentElement.classList.remove('dragging-into');
      e.to.parentElement.classList.remove('dragging-into');
      
    },
    
    draggingMoved( e ) {
      
      const tierListRow = this.$el.querySelectorAll('.tier-list-row');
      _.each( tierListRow, ( row ) => {
        row.classList.remove('dragging-into');
      })
      
      e.to.parentElement.classList.add('dragging-into');     
      
    },
    
    // coverDoubleClick: function( book ) {
      
    //   this.$store.commit('updateBook', { 
    //     book, 
    //     changes: { 
    //       key: 'scale', 
    //       add: 1, 
    //       max: 3 
    //     }, 
    //   });
      
    // },
    
  },
  
};
</script>

<style scoped lang="scss">

.left {
  position: relative;
  overflow: scroll;
  flex: 1;
  background-image: url("data:image/png;base64,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");
  box-shadow: inset 0 0 15px darken( rgba(#171e29, .3), 20);
  // display: block !important;
}

.grid {
  cursor: grab !important;
  &.grabbing {
    cursor: grabbing !important;
  }
}

.grid.force-panning:before {
  content: '';
  position: fixed;
  z-index: 9999;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  // background: rgba(red, .4);
  backdrop-filter: blur(1px) grayscale(1);
}

.show-blank-canvas {
  position: fixed;
  z-index: 100000000;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: url("data:image/png;base64,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");
  box-shadow: inset 0 0 15px darken( rgba(#171e29, .3), 20);
  display: flex;
  justify-content: center;
  justify-items: center;
  align-content: center;
  align-items: center;
  font-size: 30px;
  &:before {
    content: '';
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(#000, .4);
  }
}

.grid {
  position: relative;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  margin: 0 auto;
  font-size: 0;
  height: 100%;
  width: 100%;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  
  .editor-canvas { 
    box-shadow: 2px 2px 25px rgba(#000, .4);
    box-sizing: border-box;
    // overflow: hidden;
    transform-origin: center center;
    position: relative; 
    // margin: 500px;
    display: inline-block;
    > div {
      display: flex;
      justify-content: center;
      justify-items: center;
      align-content: center;
      align-items: center;
    }
    &:before {
      content: '';
      position: absolute;
      z-index: 1;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      border: 1px dashed #ffffff;
    }
    & > .canvas-bounds {
      content: '';
      position: absolute;
      z-index: -1;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      &.prevent-dragging {
        z-index: 30;
      }
    }
    &:after {
      content: '';
      position: absolute;
      z-index: 0;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      border: 2px solid #383838;
    }
    &.saving:before,
    &.saving:after {  display: none; }
    
    &.saving {
      position: fixed;
      z-index: 99999999;
      margin: 0px;
      transform: unset !important;
    }
  }
  .grid-inner-wrap {
    position: relative;
    z-index: 5;
    display: flex;
    justify-items: center;
    justify-content: center;
    align-items: flex-start;
    align-content: flex-start;
    width: 100%;
    height: 100%;
    overflow: hidden;
    > div {
      cursor: default;
    }
  }
  
}

// .grid-inner-wrap.hide-author-and-title .author-and-title { display: none !important; }

.canvas-padding-preview {
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  flex: 1;
  border-style: solid !important;
  border-color: rgba(#ff394f, .45) !important;
}

.text-elements {
  position: absolute; 
  left: 0;
  top: 0;
  right: 0;
  justify-content: stretch !important;
  justify-items: stretch !important;
  align-content: flex-start !important;
  align-items: flex-start !important;
  width: 100%;
}

.awp-float,
.awp-float .grid-inner-wrap {
  display: flex !important;
  align-content: flex-start;
  align-items: flex-start;
}

#canvas-bg-color,
#awp-overlay {
  position: absolute;
  z-index: 666666;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  will-change: transform;
}

#canvas-bg-color {
  z-index: -1;
}

.hide-overlay-on-hover:hover #awp-overlay {
  display: none;
}

.float-alert-wrapper {
  position: fixed;
  z-index: 9999;
  bottom: 5px;
  left: 5px;
  transform: scale(.8);
  transform-origin: bottom left;
}
.float-alert {
  margin-top: 6px;
  background: rgb(22, 30, 41);
}

[data-saving-image="true"] #editor-canvas-content {
  transform: none !important;
  transform-origin: top left !important;
}

.cover-actions {
  position: absolute;
  z-index: 9999999;
  top: 0;
  right: 0;
  // left: 0;
  // background: rgba(#000, .7);
  padding: 10px 50px 0px 0px;
  border-radius: 0 0 0 36px;
  &, button {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  button {
    padding: 15px 25px;
    background: #161e29;
    box-shadow: 0 2px 15px #0798f1, 0 2px 20px 4px #161e29;
    color: #fff;
    font-size: 15px;
    border-radius: 999px;
    border: none;
    outline: none;
    border: 2px solid #31b1ff;
    cursor: pointer;
  }
  .remove-all-reread {
    svg {
      color: lighten(red, 15);
    }
  }
}

:global(.tier-container) {
  width: 324px !important;
  display: block !important;
  font-size: 0 !important;
  overflow: hidden auto !important;
  margin: 0 !important;
  box-shadow: -4px 0 10px darken( rgba(#171e29, .3), 20) !important;
  background: #171e29 !important;
  text-align: center !important;
  padding: 25px 0 !important;
  box-sizing: border-box !important;
}

:global(.tier-container .cover) {
  width:  118px !important;
  height: 118px !important;
  padding: 0 !important;
}
:global(.tier-container .cover img) {
  width:  118px !important;
  height: 118px !important;
  box-shadow: 0 0 5px rgba(#000, .5);
}
:global(.tier-container .cover) {
  margin: 5px !important;
}
:global(.tier-container .cover .cover-heart-icon) {
  top: 5px !important;
  right: 5px !important;
}
:global(.tier-container .cover .cover-heart-icon svg) {
  font-size: 19px !important;
  line-height: 19px !important;
}
:global(.tier-container .cover .cover-star-icons) {
  height: 15px !important;
}
:global(.tier-container .cover .cover-star-icons svg) {
  font-size: 19px !important;
  line-height: 19px !important;
}
:global(.tier-container .author-and-title) {
  font-size: 19px !important;
  line-height: 19px !important;
  color: #fff !important;
  width: 100% !important;
  display: none !important;
}


:global(.tier-container) {
  transition: all 300ms ease-in-out;
}
:global(.tier-container-collapse) {
  width: 0px !important;
}

:global(.tier-container .cover) {
  transition: all 250ms ease;
}
:global(.tier-container-collapse .cover) {
  opacity: 0 !important;
}

:global(.sortable-chosen) {
  // filter: grayscale(1);
}

.legend {
  position: absolute;
  bottom: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>

<style lang="scss">

// .moveable-control-box {
//   display: none;
// }

</style>