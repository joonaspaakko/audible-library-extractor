<template>
  <div class="left" id="editor-canvas-left" ref="left" v-dragscroll="store.canvasPanning">
    <div class="show-blank-canvas" v-show="store.saving"></div>
    <gb-toast class="floating-alert" :closable="false" color="red" width="200" v-show="panningAlert">Sort covers manually by dragging <strong>or</strong> press space bar while dragging to move the canvas</gb-toast>
    <div class="grid" ref="grid">
      <div
      class="editor-canvas"
      :class="{ 'show-cover-padding-preview': store.slidingAround === 'paddingSize', saving: store.saving }"
      ref="canvas"
      id="editor-canvas-content"
      :style="canvasStyle"
      >
        <div
          class="canvas-padding-preview"
          :style="{ borderWidth: store.canvas.padding + 'px' }"
          v-show="store.slidingAround === 'canvas.padding'"
          v-if="!store.saving"
        ></div>
      
        <Moveable 
        editable="true"
        v-if="store.textElements.length"
        v-for="text in store.textElements" :key="text.id"
        class="text-element"
        :class="{ 'no-panning': !store.canvasPanning }"
        @mouseover="coverHover" 
        @mouseleave="coverHover"
        @drag="moveableDrag"
        @rotate="moveableRotate"
        @scale="moveableScale"
        v-bind="moveableOpts" 
        :style="{
          fontSize: text.fontSize + 'px',
          lineHeight: text.lineHeight + 'px',
          fontWeight: text.bold ? 'bold' : 'normal',
        }">
          {{ text.text }}
        </Moveable>
        
        <div style="position: relative; z-index: 5; overflow: hidden; height: 100%; width: 100%">
          <div class="grid-inner-wrap" :class="{ 'no-panning': !store.canvasPanning }">
            
            <draggable v-model="usedCovers" :disabled="!store.draggable" group="covers" @start="$store.commit('update', { key: 'canvasPanning', value: false })" @end="draggingEnded">
              <div 
              class="cover"
              @mouseover="coverHover" 
              @mouseleave="coverHover"  
              v-for="book in store.usedCovers" :key="book.asin"
              :style="coverPadding"
              >
                <div v-if="!store.saving" class="cover-padding-preview"></div>
                <div v-if="store.showAuthorAndTitle" class="author-and-title" :style="{ width: store.coverSize + 'px' }">
                  <div class="author"><strong>{{ book.authors ? book.authors[0].name : '' }}</strong></div>
                  <div class="title">{{ book.titleShort || book.title }}</div>
                </div>
                <img :src="makeCoverUrl(book.cover)" alt="" :style="coverStyle" draggable="false" />
              </div>
            </draggable>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import centerCanvas from "@editor-mixins/centerCanvas.js";
import zoomToFit from "@editor-mixins/zoomToFit.js";

import makeCoverUrl from "@output-mixins/makeCoverUrl";
import Moveable from 'vue-moveable';

export default {
  name: "editorCanvas",
  mixins: [centerCanvas, zoomToFit, makeCoverUrl],
  components: { draggable, Moveable },
  data: function () {
    return {
      store: this.$store.state,
      panningAlert: false,
      moveableOpts: {
        draggable: true,
        throttleDrag: 5,
        padding: { left: 10, top: 10, right: 10, bottom: 10 },
        rotatable: true,
        throttleRotate: 90,
        scalable: true,
        keepRatio: true,
        pinchable: true, // ["draggable", "resizable", "scalable", "rotatable"]
        origin: false,
      }
    };
  },
  
  mounted: function() {
    this.zoomToFit();
  },

  computed: {

    usedCovers: {
      get() {
        return this.store.usedCovers;
      },
      set(value) {
        this.$store.commit('update', { key: 'usedCovers', value: value  });
      }
    },
    
    canvasStyle: function () {
      var style = {};
      style.background = this.store.canvas.background || "transparent";
      if (this.store.canvas.width > 0) {
        style.width = this.store.canvas.width + "px";
      }
      else {
        style.width = 0 + "px";
      }
      if (this.store.canvas.height > 0) style.height = this.store.canvas.height + "px";
      if (this.store.saving) style.borderColor = "transparent";
      if (this.store.saving) style.outlineColor = "transparent";
      if (this.store.canvas.padding > -1 ) {
        style.padding = this.store.canvas.padding + "px";
      }
      else {
        style.padding = 0 + "px";
      }
      if (this.store.saving && !this.store.canvas.zoomOutputs) style.transform = null;
      else if (this.store.canvas.zoom > 0 && this.store.canvas.zoom != 1) {
        style.transform = "scale(" + this.store.canvas.zoom + ")";
      }
      if (this.store.canvas.transformOrigin) style.transformOrigin = this.store.canvas.transformOrigin;
        
      return style;
    },
    coverStyle: function () {
      var style = {};
      if (this.store.coverSize > -1) {
        style.width = this.store.coverSize + "px";
      }
      else {
        style.width = 0 + "px";
      }
      if (this.store.coverSize > -1) {
        style.height = this.store.coverSize + "px";
      }
      else {
        style.height = 0 + "px";
      }
      return style;
    },
    coverPadding: function () {
      var style = {};
      if (this.store.paddingSize > -1) {
        style.padding = this.store.paddingSize + "px";
      }
      else {
        style.padding = 0 + "px";
      } 
      return style;
    },
  },
  
  methods: {
    
    moveableScale({ target, transform, scale }) {
      console.log('onScale scale', scale);
      target.style.transform = transform;
    },
    
    moveableRotate({ target, dist, transform }) {
      console.log('onRotate', dist, transform);
      target.style.transform = transform;
    },
    
    moveableDrag({ target, transform }) {
      if ( this.store.canvasPanning ) this.$store.commit('update', { key: 'canvasPanning', value: false });
      target.style.transform = transform;
      
    },
    
    // Since only the visible covers are sorted, this mutates the source array "covers" to include the same sorting
    draggingEnded: function( e ) {
      
      let allCovers = JSON.parse(JSON.stringify(this.store.covers));
      allCovers.splice(0, this.store.usedCovers.length ); // Remove visible covers
      allCovers = this.store.usedCovers.concat( allCovers ); // merge used covers with remaining covers
      this.$store.commit('update', { key: 'covers', value: allCovers  });
      
    },
    
    coverHover: function( e ) {
      
      const hover = (e.type === 'mouseover');
      
      this.panningAlert = hover;
      
      if ( this.store.draggable ) {
        if ( hover ) {
          this.$store.commit('update', { key: 'canvasPanning', value: false });
        }
        else {
          this.$store.commit('update', { key: 'canvasPanning', value: true });
        }
      }
      
    },
  },
  
};
</script>

<style scoped lang="scss">
.left {
  position: relative;
  cursor: grab;
  overflow: hidden;
  flex: 1;
  background-image: url("data:image/png;base64,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");
  box-shadow: inset 0 0 15px darken( rgba(#171e29, .3), 20);
  display: block !important;
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

.no-panning .cover { cursor: move !important; }

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
  
  .editor-canvas { 
    box-shadow: 2px 2px 25px rgba(#000, .4);
    box-sizing: border-box;
    overflow: hidden;
    transform-origin: center center;
    position: relative; 
    margin: 1000px;
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
    }
  }
  .grid-inner-wrap {
    display: inline-block;
    text-align: center;
    position: relative;
    z-index: 5;
  }

  .cover {
    position: relative;
    display: inline-block;
    font-size: 13px;
    line-height: 17px;
  }

  .cover img {
    position: relative;
    z-index: 5;
    display: block;
    width: 0px;
    height: 0px;
  }
  
  
  .text-element {
    display: inline-block !important;
    position: absolute;
    z-index: 999999;
    
    &.no-panning { cursor: move !important; }
  }
}

.grid-inner-wrap.hide-author-and-title .author-and-title { display: none !important; }

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

.cover-padding-preview {
  display: none;
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  flex: 1;
  background: rgba(#ff394f, .45) !important;
}
.show-cover-padding-preview .cover-padding-preview { display: block; }

</style>

<style lang="scss">
.moveable-line {
  //  display: none !important;
}

.floating-alert {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 9999999999;
}
.gb-base-toast {
  padding: 3px 6px !important;
  .gb-base-toast__slot {
    font-size: 13px !important;
  }
}
</style>