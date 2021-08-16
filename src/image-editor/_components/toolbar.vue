<template>
  <div class="right toolbar">

    <div class="button-container">
      <gb-button
        class="save-btn"
        :circular="true"
        :disabled="store.saving"
        @click="makeImage"
        color="blue"
        size="large"
        left-icon="camera_alt"
        v-tippy :content="'Save as a ' + (store.compressImage ? '.jpg' : '.png')"
      >
      </gb-button>
    </div>

    <div class="zoom-container" v-show="!store.saving">
      <input
        class="zoom-zoom"
        type="range"
        min="0.01"
        max="3"
        v-model="store.canvas.zoom"
        step=".01"
        @dblclick="$store.commit('update', { key: 'canvas.zoom', value: 1 })"
        @focus="inputFocused"
        @blur="inputBlurred"
      />
      <gb-heading
        v-tippy content="Click to reset to 100% zoom"
        class="zoom-text"
        :class="{ highlight: store.canvas.zoom != 1 }"
        tag="h6"
        :uppercase="true"
        @click="$store.commit('update', { key: 'canvas.zoom', value: 1 })"
      >
        {{ zoomPercentage }}%
      </gb-heading>
      
      <div class="zoom-to-fit" @click="zoomToFit('and-center')" v-tippy content="Fit canvas inside the viewport">
        <gb-icon size="16px" name="zoom_out_map"></gb-icon>
      </div>
      
    </div>
    

    <div class="toolbar-inner" :class="{ saving: store.saving, 'hide-hints': !store.showHints }">
      <div v-show="!store.saving">
        
        <div>
          
          <gb-heading tag="h6" :uppercase="true">
            <span style="padding-right: 10px;">Text elements</span>
            
            <gb-button
              class="make-text-element"
              :circular="true"
              @click="makeTextElement"
              color="blue"
              size="mini"
              left-icon="add_circle"
              v-tippy content="Add new text element"
            >
            </gb-button>
            
          </gb-heading>
          
          <p v-if="store.textElements.length" class="gb-field-message gb-field-message--small gb-field-message--info gb-field-message--dark"><i aria-hidden="true" class="gb-field-message__icon gb-base-icon" style="font-size: 16px;">info</i><span class="gb-field-message__message">You can make room for text by adjusting canvas padding.</span></p>
          
          <div class="text-elements" v-for="(text, index) in store.textElements" :key="text.id" :class="{ active: text.active }">
            
            <spacer size="small" :line="false" />
            
            <div class="text-elements-inner-wrap">
              
              <gb-icon class="remove-text" size="16px" name="close" @click="$store.commit('removeText', index)"></gb-icon>
              
              <div class="label-row">
                <span style="width: 30px;">Text:</span>
                <gb-input
                  type="text"
                  :full-width="true"
                  :value="text.text"
                  @input="changeTextElement( $event, index, text, 'text' )"
                  @focus="inputFocused"
                  @blur="inputBlurred"
                  size="mini"
                ></gb-input>
              </div>
              <spacer size="mini" :line="false" />
              <div class="label-row">
                <span style="width: 30px;">Size:</span>
                <input
                  style="margin-left: 10px"
                  :full-width="true"
                  :value="parseFloat(text.fontSize)"
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  @input="changeTextElement( $event, index, text, 'fontSize', $event )"
                  @focus="inputFocused"
                  @blur="inputBlurred"
                  size="mini"
                />
                <span style="display: inline-block; padding-left: 5px;">{{ text.fontSize }}</span>
              </div>
              
              <spacer size="small" :line="false" />
              
              <div class="label-row">
                
                <div class="align-text" style="padding-left: 0px;">
                  <gb-icon :class="{ active: text.alignment === 'left' }" size="16px" name="format_align_left" @click="$store.commit('changeText', { index: index, key: 'alignment', value: 'left', });"></gb-icon>
                  <gb-icon :class="{ active: text.alignment === 'center' }" size="16px" name="format_align_center" @click="$store.commit('changeText', { index: index, key: 'alignment', value: 'center', });"></gb-icon>
                  <gb-icon :class="{ active: text.alignment === 'right' }" size="16px" name="format_align_right" @click="$store.commit('changeText', { index: index, key: 'alignment', value: 'right', });"></gb-icon>
                </div>
                
                <gb-checkbox
                style="padding-left: 10px;"
                size="mini"
                v-model="text.bold"
                label="Bold"
                ></gb-checkbox>
                
                <gb-checkbox
                style="padding-left: 0px;"
                size="mini"
                v-model="text.allCaps"
                label="All caps"
                ></gb-checkbox>
              </div>
              
            </div>
            
          </div>
          
          <spacer size="large" :line="true" />
          
        </div>
        
        
        
        <div>
          
          <gb-heading tag="h6" :uppercase="true">
            Reduce file size
          </gb-heading>
          <spacer size="mini" :line="false" />
          <gb-toggle
          size="small"
          v-model="store.compressImage"
          label="Compress image"
          ></gb-toggle>
          <spacer size="mini" :line="false" />
          
          <div class="label-row" v-if="store.compressImage">
            <span class="compress-quality-text">Quality ({{ qualityPercentage }}%):</span>
            <input
              class="zoom-zoom"
              type="range"
              step=".01"
              min="0.50"
              max="0.99"
              v-model="store.compressQuality"
              @focus="inputFocused"
              @blur="inputBlurred"
            />
          </div>
          <p v-if="qualityPercentage < 80" class="gb-field-message gb-field-message--mini gb-field-message--warning gb-field-message--dark"><i aria-hidden="true" class="gb-field-message__icon gb-base-icon" style="font-size: 15px;">warning</i><span class="gb-field-message__message">Make sure to pay extra attention to the saved image quality when setting the quality below 80%.</span></p>
          <p v-if="store.compressImage" class="gb-field-message gb-field-message--small gb-field-message--info gb-field-message--dark"><i aria-hidden="true" class="gb-field-message__icon gb-base-icon" style="font-size: 16px;">info</i><span class="gb-field-message__message">Compressed image is saved as a jpeg, which doesn't support transparency.</span></p>
        </div>
        
        <spacer size="large" :line="true" />
        
        <div>
          <gb-heading tag="h6" :uppercase="true">
            Limit cover images
          </gb-heading>
          <spacer size="mini" :line="false" />
          <gb-input
            type="number"
            :min="1"
            :max="store.covers.length"
            :value="parseFloat(store.coverAmount)"
            @input="inputChanged('coverAmount', $event)"
            @focus="inputFocused"
            @blur="inputBlurred"
            size="mini"
            name="coverNumberTippy"
            :warning="store.coverAmount < store.covers.length ? 'Using ' + store.coverAmount +'/'+ store.covers.length : null"
          ></gb-input>
          <tippy to="coverNumberTippy">
            Excess covers are removed from the tail end.
            <br />
            <span class="highlight">
              <strong>{{ store.coverAmount }}</strong> out of a possible
              <strong>{{ store.covers.length }}</strong>.
            </span>
          </tippy>
        </div>
        
        <spacer size="small" :line="false" />
        
        <gb-button
        :disabled="store.showAuthorAndTitle"
        :full-width="true"
        color="black"
        size="small"
        @click="fillCanvasWithCovers"
        :rounded="true"
        v-tippy content="Adds or removes enough covers to fit inside the canvas. <br>Covers are added and removed from the tail end."
        >Fit cover amount to canvas</gb-button>
        
        <spacer size="large" :line="true" />
        
        <gb-toggle
        size="small"
        v-model="store.showAuthorAndTitle"
        label="Show author and title"
        ></gb-toggle>
      
        <spacer size="large" :line="true" />

        <div>
          <gb-heading tag="h6" :uppercase="true">
            Background color
            <color-picker
              class="color-picker-placeholder"
              v-model="store.canvas.background"
              :position="{ left: '-180px', top: '40px' }"
            >
            </color-picker>
          </gb-heading>
        </div>

        <spacer size="mini" :line="false" />
        
        <div>
          <gb-heading tag="h6" :uppercase="true">Canvas size</gb-heading>
          <spacer size="mini" :line="false" />
          
          <!-- <gb-select
          v-model="selectedCanvasPreset" 
          size="mini" 
          placeholder="Size presets" 
          :full-width="true" 
          :options="canvasPresets"
          @change="canvasPresetSelected"
          ></gb-select> -->
          
          <div class="label-row" style="padding-left: 58px">
            <input
              v-tippy content="The sliders have a maximum value, but the text inputs do not."
              type="range"
              min="1"
              max="1920"
              v-model="store.canvas.width"
              step="1"
              @focus="inputFocused"
              @blur="inputBlurred"
            />
          </div>
          <div class="label-row" v-tippy content="Width is always required">
            <span style="width: 50px">Width:</span>
            <gb-input
              type="number"
              :min="1"
              :value="parseFloat(store.canvas.width)"
              @input="inputChanged('canvas.width', $event)"
              @focus="inputFocused"
              @blur="inputBlurred"
              size="mini"
            ></gb-input>
          </div>
          <spacer size="mini" :line="false" />
          <div class="label-row" style="padding-left: 58px">
            <input
              v-tippy content="The sliders have a maximum value, but the text inputs do not."
              type="range"
              min="0"
              max="1080"
              v-model="store.canvas.height"
              @focus="inputFocused"
              @blur="inputBlurred"
              step="1"
            />
          </div>
          <div class="label-row" v-tippy content="Set the height to 0 when you don't need to limit it to a certain height.">
            <span :class="{ 'offset-height-text': store.canvas.height == 0 }">Height:</span>
            <gb-input
              type="number"
              :min="0"
              :value="parseFloat(store.canvas.height)"
              @input="inputChanged('canvas.height', $event)"
              @focus="inputFocused"
              @blur="inputBlurred"
              size="mini"
              :info="store.canvas.height > 0 ? null : '0 = automatic height'"
            ></gb-input>
          </div>
        </div>
        
        <spacer size="small" :line="false" />
        
        <gb-button
        :full-width="true"
        color="black"
        size="small"
        @click="fitCanvasToContent"
        :rounded="true"
        v-tippy content="Resizes canvas to fit covers perfectly."
        >Fit canvas to covers</gb-button>

        <spacer size="small" :line="false" />

        <div class="canvas-padding">
          <gb-heading tag="h6" :uppercase="true">Canvas padding</gb-heading>
          <spacer size="mini" :line="false" />
          <input
            type="range"
            min="0"
            max="500"
            v-model="canvasPadding"
            step="1"
            @input="slidingAround('canvas.padding.', $event)"
            @focus="inputFocused"
            @blur="inputBlurred"
          />
          <div class="label-row">
            
          <gb-input
            style="padding-left: 0px;"
            type="number"
            :min="0"
            :value="parseFloat(store.canvas.padding.left)"
            @input="inputChanged('canvas.padding.left', $event)"
            @focus="inputFocused"
            @blur="inputBlurred"
            size="mini"
            description="left"
          ></gb-input>
          
          <gb-input
            type="number"
            :min="0"
            :value="parseFloat(store.canvas.padding.top)"
            @input="inputChanged('canvas.padding.top', $event)"
            @focus="inputFocused"
            @blur="inputBlurred"
            size="mini"
            description="top"
          ></gb-input>
          
          <gb-input
            type="number"
            :min="0"
            :value="parseFloat(store.canvas.padding.right)"
            @input="inputChanged('canvas.padding.right', $event)"
            @focus="inputFocused"
            @blur="inputBlurred"
            size="mini"
            description="right"
          ></gb-input>
          
          <gb-input
            type="number"
            :min="0"
            :value="parseFloat(store.canvas.padding.bottom)"
            @input="inputChanged('canvas.padding.bottom', $event)"
            @focus="inputFocused"
            @blur="inputBlurred"
            size="mini"
            description="bottom"
          ></gb-input>
          </div>
        </div>

        <spacer size="large" :line="true" />
        
        <div>
          <gb-heading tag="h6" :uppercase="true">Cover size</gb-heading>
          <spacer size="mini" :line="false" />
          <input type="range" min="1" max="500" v-model="coverSize" step="1" 
          @focus="inputFocused"
          @blur="inputBlurred"
          v-tippy content="The native cover size is 500px. You can make it larger using
            the input field below, but it's not recommended since upsizing 
            degrades the quality."
          />
          <gb-input
            v-tippy content="The native cover size is 500px. You can make it larger but it's not recommended since upsizing 
            degrades the quality."
            type="number"
            :min="1"
            :value="parseFloat(store.coverSize)"
            @input="inputChanged('coverSize', $event)"
            @focus="inputFocused"
            @blur="inputBlurred"
            size="mini"
          ></gb-input>
        </div>

        <spacer size="small" :line="false" />
        
        <div>
          <gb-heading tag="h6" :uppercase="true">Cover padding</gb-heading>
          <spacer size="mini" :line="false" />
          <input
            type="range"
            min="0"
            max="200"
            v-model="coverPadding"
            step="1"
            @input="slidingAround('paddingSize', $event)"
            @focus="inputFocused"
            @blur="inputBlurred"
          />
          <gb-input
            type="number"
            :min="0"
            :value="parseFloat(store.paddingSize)"
            @input="inputChanged('paddingSize', $event)"
            @focus="inputFocused"
            @blur="inputBlurred"
            size="mini"
          ></gb-input>
        </div>

        <spacer size="large" :line="true" />

        <div>
          <gb-toggle
          v-tippy content="The image will be saved with the zoomed size if enabled."
          size="small"
          v-model="store.canvas.zoomOutputs"
          label="Output with zoom"
          :warning="outputWidthZoomSize"
          ></gb-toggle>
        </div>
        <spacer size="mini" :line="false" />

      </div>
    </div>
  </div>
</template>

<script>
import spacer from "./spacer.vue";
import zoomToFit from "@editor-mixins/zoomToFit.js";
import centerCanvas from "@editor-mixins/centerCanvas.js";

import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import _ from "lodash";

export default {
  name: "toolbar",
  components: { spacer },
  mixins: [zoomToFit, centerCanvas],
  data: function () {
    return {
      store: this.$store.state,
      slidingTimer: null,
      selectedCanvasPreset: '',
      canvasPresets: [
        { label: 'Wallpaper (1920x1080)', value: 'wallpaper-1920', size: '1920x1080' },
      ],
    };
  },
  computed: {
    
    outputWidthZoomSize: function() {
      if ( this.store.canvas.zoom > 0 &&
          this.store.canvas.zoom != 1 &&
          (this.store.canvas.scaled.width || this.store.canvas.scaled.height)
      ) {
        if ( this.store.canvas.scaled.width && !this.store.canvas.scaled.height ) {
          return 'Estimated width: ' + this.store.canvas.scaled.width + 'px';
        }
        else if ( this.store.canvas.scaled.width && this.store.canvas.scaled.height ) {
          return 'Estimated size: ' + this.store.canvas.scaled.width +'x'+ this.store.canvas.scaled.height + 'px';
        }
      }
      else {
        return null;
      }
    },
    
    canvasWidth: {
      get: function () {
        return this.store.canvas.width;
      },
      set: _.throttle( function (size) {
        this.$store.commit("update", {
          key: "canvas.width",
          value: size,
        });
      }, 200, { leading: false, trailing: true }),
    },
    canvasWidth: {
      get: function () {
        return this.store.canvas.height;
      },
      set: _.throttle( function (size) {
        this.$store.commit("update", {
          key: "canvas.height",
          value: size,
        });
      }, 200, { leading: false, trailing: true }),
    },
    coverSize: {
      get: function () {
        return this.store.coverSize;
      },
      set: _.throttle( function (size) {
        this.$store.commit("update", {
          key: "coverSize",
          value: size,
        });
      }, 200, { leading: false, trailing: true }),
    },
    canvasPadding: {
      get: function () {
        
        var values = [
          parseFloat(this.store.canvas.padding.left),
          parseFloat(this.store.canvas.padding.top),
          parseFloat(this.store.canvas.padding.right),
          parseFloat(this.store.canvas.padding.bottom),
        ];
        
        return _.maxBy( values );
      },
      set: _.throttle(
        function (padding) {
          this.$store.commit("update", [
            { key: 'canvas.padding.left', value: padding },
            { key: 'canvas.padding.top', value: padding },
            { key: 'canvas.padding.right', value: padding },
            { key: 'canvas.padding.bottom', value: padding },
          ]);
        }, 200, { leading: false, trailing: true }
      ),
    },

    coverPadding: {
      get: function () {
        return this.store.paddingSize;
      },
      set: _.throttle(
        function (padding) {
          this.$store.commit("update", { key: "paddingSize", value: padding });
        },
        200,
        { leading: false, trailing: true }
      ),
    },

    zoomPercentage: function () {
      var zoom = this.store.canvas.zoom == 0 ? 1 : this.store.canvas.zoom;
      return Math.floor(zoom * 100);
    },
    qualityPercentage: function () {
      let quality = parseFloat(this.store.compressQuality);
      return Math.floor(quality * 100);
    },
  },
  methods: {
    
    // canvasPresetSelected: function() {
      
    //   if ( this.selectedCanvasPreset ) {
        
    //     let vue = this;
    //     console.log( vue.selectedCanvasPreset )
    //     let preset = this.canvasPresets.filter(function( o ) {
    //       return vue.selectedCanvasPreset === o.value;
    //     });
        
    //     console.log( preset[0] )
    //     let size = preset[0].size.split('x');
        
    //     this.$store.commit('update', [
    //       { key: 'canvas.width', value: size[0] },
    //       { key: 'canvas.height', value: size[1] },
    //     ]);
        
    //     this.selectedCanvasPreset = ''; 
        
    //   }
      
    // },
    
    inputFocused: function() {
      this.$store.commit('update', [
        { key: 'events.textNudge', value: false },
        { key: 'events.textRemove', value: false },
        { key: 'events.canvasPanning', value: false },
      ]);
      // this.$nextTick(function() {
        
      // });
    },
    
    inputBlurred: function() {
      this.$store.commit('update', [
        { key: 'events.textNudge', value: true },
        { key: 'events.textRemove', value: true },
        { key: 'events.canvasPanning', value: true },
      ]);
      // this.$nextTick(function() {
        
      // });
    },
    
    changeTextElement: function( value, index, textElement, key, e ) {
      let val = value;
      if ( e ) val = parseFloat(e.target.value);
      this.$store.commit('changeText', { index: index, key: key, value: val, });
    },
    
    makeTextElement: function() {
      
      this.$store.commit('addText', { 
        text: 'Lorem ipsum dolor sit amet',
        rotation: 0,
        floater: false,
        fullWidth: true,
        fontSize: 30,
        bold: false,
        allCaps: false,
        active: true,
        alignment: 'center',
      });
      
    },
    
    fitCanvasToContent: function() {
      
      let update = [];
      let coverSize = parseFloat(this.store.coverSize)+(parseFloat(this.store.paddingSize)*2);
      let canvasPaddingX = parseFloat(this.store.canvas.padding.left) + parseFloat(this.store.canvas.padding.right);
      // let canvasPaddingY = parseFloat(this.store.canvas.padding.top) + parseFloat(this.store.canvas.padding.bottom);
      let innerWrap = document.querySelector('#editor-canvas-left .grid-inner-wrap');
      let canvas = {
        width:  innerWrap.offsetWidth,
        height: innerWrap.offsetHeight,
      };
      let coverAmount = parseFloat(this.store.coverAmount);
      let maxRows = canvas.height > coverSize ? Math.floor( canvas.height / coverSize ) : 1;
      let coversPerWidth = canvas.width > coverSize ? Math.floor( canvas.width / coverSize ) : 1;
      if ( coverAmount < coversPerWidth ) coversPerWidth = coverAmount;
      
      update.push({ key: 'canvas.width', value: (coverSize * coversPerWidth) + canvasPaddingX });
      if ( this.store.canvas.height > 0 ) update.push({ key: 'canvas.height', value: 0 });
      
      this.$store.commit('update', update);
      
    },
    
    fillCanvasWithCovers: function() {
      
      let coverSize = parseFloat(this.store.coverSize)+(parseFloat(this.store.paddingSize)*2);
      // let canvasPadding = parseFloat(this.store.canvas.padding)*2;
      // let canvasPaddingX = parseFloat(this.store.canvas.padding.left) + parseFloat(this.store.canvas.padding.right);
      // let canvasPaddingY = parseFloat(this.store.canvas.padding.top) + parseFloat(this.store.canvas.padding.bottom);
      let innerWrap = document.querySelector('#editor-canvas-left .grid-inner-wrap');
      
      let canvas = {
        width:  innerWrap.offsetWidth,
        height: innerWrap.parentNode.offsetHeight,
      };
      let coverAmount = parseFloat(this.store.coverAmount);
      let maxRows = canvas.height > coverSize ? Math.floor( canvas.height / coverSize ) : 1;
      let coversPerWidth = canvas.width > coverSize ? Math.floor( canvas.width / coverSize ) : 1;
      if ( coverAmount < coversPerWidth ) coversPerWidth = coverAmount;
      
      let horizontalFit = coversPerWidth;
      let verticalFit = maxRows;
      let newAmount = horizontalFit * verticalFit;
      
      this.$store.commit('update', [
        { key: 'usedCovers', value: this.store.covers.slice(0, newAmount) },
        { key: 'coverAmount', value: newAmount },
      ]);
      
    },
    
    slidingAround: _.throttle(
      function (key, value) {
        this.$store.commit("update", { key: "slidingAround", value: key });
      }, 250, { leading: true, trailing: true }
    ),

    inputChanged: function (key, value) {
      clearTimeout(this.slidingTimer);

      if ( key.match('canvas.padding.') || key === 'paddingSize' ) {
        this.slidingAround( key, value);
        let vue = this;
        vue.slidingTimer = setTimeout(function () {
          vue.$store.commit("update", { key: "slidingAround", value: null });
        }, 1000);
      }
      this.$store.commit("update", { key: key, value: value });      
      if ( key === 'coverAmount' ) {
        this.$store.commit('update', { 
          key: 'usedCovers', 
          value: this.store.covers.slice(0, this.store.coverAmount)
        });
        this.$nextTick(function() {
          this.zoomToFit('and-center');
        });
      }
    },

    makeImage: function () {
      var vue = this;

      if (!vue.store.saving) {
        vue.$store.commit("update", { key: "saving", value: true });

        vue.$nextTick(function () {
          
          let quality = vue.store.compressImage ? parseFloat(vue.store.compressQuality) : null;
          let mimetype = vue.store.compressImage ? 'image/jpeg' : 'image/png';
          let extension = vue.store.compressImage ? '.jpg' : '.png';
          
          html2canvas(document.querySelector(".editor-canvas"), {
            backgroundColor: vue.store.canvas.background || "rgba(255,255,255,0)",
            logging: false,
            useCORS: true,
          }).then(function (canvas) {
            // If I ever need base64 version of the image: canvas.toDataURL("image/png")
            canvas.toBlob(function (blob) {
              
              saveAs( blob, "ale image"+extension );
              setTimeout(function () {
                vue.$store.commit("update", { key: "saving", value: false });
                vue.$nextTick(function() {
                  vue.centerCanvas();
                });
              }, 500);
              
            }, mimetype, quality);
            
          });
        });
      }
    },

    canvasFitChanged: function () {
      var width = this.store.canvas.width;
      var height = this.store.canvas.height;
      this.$store.commit("update", [
        { key: "canvas.width", value: null },
        { key: "canvas.height", value: null },
      ]);
      this.$nextTick(function () {
        this.$store.commit("update", [
          { key: "canvas.width", value: width },
          { key: "canvas.height", value: height },
        ]);
      });
    },
  },
};
</script>

<style scoped lang="scss">
$toolbar-bg: #171e29;
$toolbar-text: #8eabc5;
.toolbar {
  box-shadow: -4px 0 10px darken( rgba($toolbar-bg, .3), 20);
  position: relative;
  font-size: 14px;
  line-height: 18px;
  font-weight: 400;
  flex: 1;
  background: $toolbar-bg;
  box-sizing: border-box;
  color: $toolbar-text;
  max-width: 380px;
  z-index: 3001;
  ::-moz-selection { background: #0093ee !important; color: lighten( #0093ee, 30 ); }
  ::selection { background: #0093ee !important; color: lighten( #0093ee, 45 ); }
}

.toolbar-inner {
  overflow: auto;
  padding: 50px 65px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 0;
  width: 100%;
  padding-bottom: 300px;
  
  &.saving {
    background-repeat: no-repeat;
    background-position: center;
    background-image: url("data:image/gif;base64,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");
  }
}

.label-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  span {
    display: inline-block;
  }
  div {
    padding-left: 10px;
    flex: 1;
  }
}

.offset-height-text {
  width: 50px; 
  position: relative; 
  top: -11px;
}

.hint-text {
  color: darken($toolbar-text, 25) !important;
  padding: 3px 6px;
  border: 1px solid #323d4f;
  border-radius: 4px;
  background: #1a2431;
  display: block;
  margin-bottom: 0px;
  font-size: 13px;
  line-height: 18px;
  .highlight {
    color: #ffc02b !important;
    opacity: 0.5;
  }
  &:hover {
    color: darken($toolbar-text, 18) !important;
    .highlight {
      opacity: 0.65;
    }
  }
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
}

.hide-hints .hint-text { display: none !important; }

.toolbar {
  input[type="range"] {
    -webkit-appearance: none;
    margin: 10px 0;
    width: 100%;
  }
  input[type="range"]:focus {
    outline: none;
  }
  input[type="range"]:focus::-webkit-slider-thumb {
    border-color: #1c93ee !important;
  }
  input[type="range"]:focus::-moz-range-thumb {
    border-color: #1c93ee !important;
  }
  input[type="range"]:focus::-ms-thumb {
    border-color: #1c93ee !important;
  }
  input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: 9px;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 0px 0px 0px #171e29;
    background: #313d4f;
    border-radius: 0px;
    border: 3px solid #171e29;
  }
  input[type="range"]::-webkit-slider-thumb {
    box-shadow: 0px 0px 1px #000000;
    border: 3px solid #313d4f;
    height: 15px;
    width: 15px;
    border-radius: 50px;
    background: #171e29;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -6px;
  }
  input[type="range"]:focus::-webkit-slider-runnable-track {
    background: #313d4f;
  }
  input[type="range"]::-moz-range-track {
    width: 100%;
    height: 9px;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 0px 0px 0px #171e29;
    background: #313d4f;
    border-radius: 0px;
    border: 3px solid #171e29;
  }
  input[type="range"]::-moz-range-thumb {
    box-shadow: 0px 0px 1px #000000;
    border: 3px solid #313d4f;
    height: 15px;
    width: 15px;
    border-radius: 50px;
    background: #171e29;
    cursor: pointer;
  }
  input[type="range"]::-ms-track {
    width: 100%;
    height: 9px;
    cursor: pointer;
    animate: 0.2s;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
  input[type="range"]::-ms-fill-lower {
    background: #313d4f;
    border: 3px solid #171e29;
    border-radius: 0px;
    box-shadow: 0px 0px 0px #171e29;
  }
  input[type="range"]::-ms-fill-upper {
    background: #313d4f;
    border: 3px solid #171e29;
    border-radius: 0px;
    box-shadow: 0px 0px 0px #171e29;
  }
  input[type="range"]::-ms-thumb {
    box-shadow: 0px 0px 1px #000000;
    border: 3px solid #313d4f;
    height: 15px;
    width: 15px;
    border-radius: 50px;
    background: #171e29;
    cursor: pointer;
  }
  input[type="range"]:focus::-ms-fill-lower {
    background: #313d4f;
  }
  input[type="range"]:focus::-ms-fill-upper {
    background: #313d4f;
  }
}

.toolbar .zoom-container,
.toolbar .button-container {
  // box-shadow: 0 0 25px darken( rgba($toolbar-bg, .7), 20);
  // width: 100%;
  // background: #273142;
  // padding: 6px;
  position: absolute;
  z-index: 5;
  top: 20px;
  left: -27px;
  // right: 0;
  text-align: center;
  background: $toolbar-bg;
  padding: 10px;
  border-radius: 99999999px;
  box-shadow: -4px 0 7px darken( rgba($toolbar-bg, .4), 20);
}

.toolbar .zoom-container {
  z-index: 4;
  top: 50px;
  left: -17px;
  width: 30px;
  height: 185px;
  padding-top: 45px;
  .zoom-text {
    -webkit-touch-callout: none; 
    -webkit-user-select: none; 
    -khtml-user-select: none; 
    -moz-user-select: none; 
    -ms-user-select: none; 
    user-select: none; 
    cursor: pointer;
    position: relative;
    top: 105px;
    font-size: 11px !important;
    &.highlight {
      color: #ffc02b !important;
      opacity: 1;
    }
  }
  .zoom-zoom {
    position: relative;
    top: 118px;
    left: 9px;
    width: 120px;
    transform: rotate(-90deg);
    transform-origin: top left;
  }
  .zoom-to-fit {
    cursor: pointer;
    position: relative;
    top: 108px;
  }
}

.hide-hints-container {
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  opacity: .7;
  &.showing-hints {
    opacity: .5;
  }
}

.text-elements-inner-wrap {
  position: relative;
  z-index: 0;
  border: 1px solid #323d4f;
  border-radius: 10px;
  padding: 20px;
  
  .remove-text {
    position: absolute;
    top: 10px;
    right: 20px;
    top: -9px;
    right: 10px;
    background: $toolbar-bg;
  }
  .align-text {
    i {
      cursor: pointer;
      -webkit-touch-callout: none; 
      -webkit-user-select: none; 
      -khtml-user-select: none; 
      -moz-user-select: none; 
      -ms-user-select: none; 
      user-select: none; 
    }
    .active {
      color: #fbc03d;
    }
  }
}

.text-elements.active .text-elements-inner-wrap {
  border-color: #fbc03d;
}

.compress-quality-text {
  display: inline-block;
  cursor: pointer; 
  white-space: nowrap; 
  margin-right: 4px;
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
}

</style>


<style lang="scss">
/*.hide-hints */.spacer {
  // .line { display: none !important; }
  // padding-bottom: 0 !important;
}

// .gb-base-button__left-icon {
//   margin-right: 0px !important;
// }
// .gb-base-button__label {
//   display: none;
// }
// .gb-base-button--default {
//   border-radius: 999999px !important;
//   width: 50px;
//   height: 50px;
// }
// .gb-base-button--default .gb-base-button__focuser {
//   border-radius: 999999px !important;
//   border-width: 2px !important;
// }

.canvas-padding .gb-field-message {
  display: block;
  text-align: center;
}

[class^="gb-base-heading"] {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.color-picker-placeholder .color-block {
  position: relative;
  top: -2px;
  margin-left: 15px;
}
.color-picker-placeholder .color-block > div {
  border-radius: 999999999999px;
  overflow: hidden;
  border: 1px solid #323d4f;
  width: 27px;
  height: 27px;
}
</style>