<template>
<n-space vertical :size="spaceGapSize">
  
  <h6>
    
    <span>Text elements</span>
    
    <n-button 
      type="warning"
      @click="makeTextElement"
    >
      <fluent-text-add-20-filled/> &nbsp; ADD TEXT
    </n-button>
    
  </h6>
  
  <n-alert v-if="store.textElements.length" type="info">
    You can make room for text by adjusting canvas padding.
  </n-alert>
  
  <div
    v-if="store.textElements.length" 
    class="text-elements" 
    v-for="(text, index) in store.textElements" 
    :key="text.id" 
    :class="{ active: text.active }"
    @mousedown="textElementClicked(index, text)"
  >
    
    <n-space vertical size="medium" class="text-elements-inner-wrap" :style="{ zIndex: store.textElements.length - index }">
      
      <fa-regular-times-circle class="remove-text" style="font-size: 18px;" @click="$store.commit('removeText', index)" />
      
      <div class="label-row">
        <span style="display: inline-block; width: 37px;">Font:</span>
        <n-select 
          size="small"
          style="flex: 1; margin-left: 10px;" 
          :default-value="text.fontFamily" 
          :options="store.textElFonts" 
          @update:value="changeTextElement( $event, index, text, 'fontFamily' )" 
          :render-label="renderFontOption"
        />
      </div>
      
      <div class="label-row">
        <span style="display: inline-block; width: 37px;"
          v-tippy content="Alternatively double click text on the canvas to edit it directly"
        >Text: </span>
        <n-input 
          size="small"
          style="flex: 1; margin-left: 10px;" 
          :default-value="text.text" :min="1" :step="1" 
          @update:value="changeTextElement( $event, index, text, 'text' )" 
        />
      </div>
      
      <div class="label-row">
        <span style="display: inline-block; width: 37px;">Size:</span>
        <n-slider 
          @update:value="changeTextElement( $event, index, text, 'fontSize' )" 
          :value="text.fontSize" :min="1" :max="200" :step="1" :tooltip="false" 
        />
        <n-input-number 
          size="tiny"
          style="flex: 1; margin-left: 10px;" 
          :value="text.fontSize" :min="1" :step="1" 
          @update:value="changeTextElement( $event, index, text, 'fontSize' )" 
        />
      </div>
      
      <div class="label-row">
        
        <div style="display: flex; flex-direction: row;">
          <div class="align-text" style="padding-left: 0px;" v-tippy content="<strong>Horizontal alignment.</strong> Text is aligned inside its own bounding box.">
            <akar-icons-align-left :class="{ active: text.alignment === 'left' }" style="font-size: 14px;" name="format_align_left" @click="$store.commit('changeText', { index: index, key: 'alignment', value: 'left', });" />
            <akar-icons-align-horizontal-center :class="{ active: text.alignment === 'center' }" style="font-size: 14px;" name="format_align_center" @click="$store.commit('changeText', { index: index, key: 'alignment', value: 'center', });" />
            <akar-icons-align-right :class="{ active: text.alignment === 'right' }" style="font-size: 14px;" name="format_align_right" @click="$store.commit('changeText', { index: index, key: 'alignment', value: 'right', });" />
          </div>
          
          <div class="align-text" style="padding-left: 30px;" v-tippy content="<strong>Vertical alignment.</strong> Text is aligned inside its own bounding box.">
            <akar-icons-align-top :class="{ active: text.verticalAlignment === 'left' }" style="font-size: 14px;" name="vertical_align_top" @click="$store.commit('changeText', { index: index, key: 'verticalAlignment', value: 'left', });" />
            <akar-icons-align-vertical-center :class="{ active: text.verticalAlignment === 'center' }" style="font-size: 14px;" name="vertical_align_center" @click="$store.commit('changeText', { index: index, key: 'verticalAlignment', value: 'center', });" />
            <akar-icons-align-bottom :class="{ active: text.verticalAlignment === 'right' }" style="font-size: 14px;" name="vertical_align_bottom" @click="$store.commit('changeText', { index: index, key: 'verticalAlignment', value: 'right', });" />
          </div>
        </div>
        
      </div>
      
      <div class="label-row">
        
        
        <div style="display: flex; justify-content: center; align-items: center; flex: 0; align-self: flex-end;">
          <color-picker :default-value="text.color" @input="$store.commit('changeText', { index: index, key: 'color', value: $event })"></color-picker>
        </div>
        
        <n-checkbox 
          :checked="text.bold" 
          @update:checked="changeTextElement( $event, index, text, 'bold' )"
          style="padding-left: 15px;"
        >
          Bold
        </n-checkbox>

        <n-checkbox 
          :checked="text.allCaps" 
          @update:checked="changeTextElement( $event, index, text, 'allCaps' )"
          style="padding-left: 4px; white-space: nowrap;"
        >
          All caps
        </n-checkbox>
        
      </div>
      
    </n-space>
    
  </div>
  
</n-space>
</template>

<script>

import { h } from 'vue';
import { 
  NConfigProvider, 
  darkTheme, 
  NButton,
  NSwitch, 
  NDivider,
  NSelect,
  NAlert,
  NInputNumber,
  NInput,
  NSlider,
  NSpace,
  NCheckbox,
} from 'naive-ui';

import spacer from "@editor-comps/toolbar/spacer.vue";
export default {
  name: "textElements",
  props: ['spaceGapSize'],
  components: { 
    spacer, 
    NConfigProvider,
    NButton,
    NSwitch,
    NDivider, 
    NSelect,
    NAlert,
    NInputNumber,
    NInput,
    NSlider,
    NSpace,
    NCheckbox,
  },
  data: function () {
    return {
      store: this.$store.state,
      textTextCounter: 0,
    };
  },
  
  methods: {
    
    makeTextElement: function() {
      
      let transformBoxes = document.querySelectorAll('.moveable-control-box');
      if ( transformBoxes.length ) {
        transformBoxes.forEach(function( controlEl, controlIndex ) {
          controlEl.style.display = 'none';
        });
      }
      
      let text = 'Lorem ipsum dolor sit amet';
      
      if ( this.textTextCounter === 0 || this.textTextCounter === 1 && this.store.gallery.pageTitle ) {
        text = this.store.gallery.pageTitle || text;
      }
      else if ( this.textTextCounter === 1 ) {
        text = this.store.gallery.pageSubTitle || text;
      }
      
      this.$store.commit('addText', { 
        text: text,
        rotation: 0,
        floater: false,
        fullWidth: true,
        fontSize: 30,
        bold: false,
        allCaps: false,
        active: true,
        color: '#3a3a3a',
        alignment: 'center',
        verticalAlignment: 'center',
        fontFamily: "'Work Sans', sans-serif",
      });
      
      if ( this.textTextCounter === 1 ) {
        this.textTextCounter = 0;
      }
      else {
        ++this.textTextCounter;
      }
      
    },
    
    textColorChanged: _.debounce(function(color, index) {
      this.$store.commit('changeText', { index: index, key: 'color', value: color, });
    }, 250, { leading: false, trailing: true }),
    
    changeTextElement: _.debounce( function(value, index, textElement, key, e) {
      let val = value;
      if ( e ) val = _.get(e, 'target.value') || val;
      this.$store.commit('changeText', { index: index, key: key, value: val, });
      this.$nextTick(function() {
        this.$emitter.emit('update-moveable-handles');
      });
    }, 250, { leading: false, trailing: true }),
    
    // Activate (show) moveable controls
    textElementClicked: function( index, textObj ) {
      
      let targetIndex = index;
      this.$store.commit("activateText", targetIndex);
      
      let transformBoxes = document.querySelectorAll('.moveable-control-box');
      if ( transformBoxes.length ) {
        transformBoxes.forEach(function( controlEl, controlIndex ) {
          controlEl.style.display = (targetIndex === controlIndex) ? 'block' : 'none';
        });
      }
      
    },
    
    renderFontOption( option ) {
      // return `<div style="font-family: ${option.value};">${option.label}</div>`;
      return h(
        'div', // type
        { style: { fontFamily: option.value } }, // props
        option.label
      );
    },
    
  },
};
</script>

<style scoped lang="scss">

.text-elements-inner-wrap {
  position: relative;
  z-index: 2;
  border: 1px solid #b9bfca;
  border-radius: 10px;
  padding: 20px;
  
  .remove-text {
    cursor: pointer;
    position: absolute;
    top: 10px;
    right: 20px;
    top: -18px;
    right: 10px;
    background: #171e29;
    padding: 7px;
    &:hover {
      color: #fbc03d;
    }
  }
}

.align-text {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  svg {
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

.text-elements.active .text-elements-inner-wrap {
  border-color: #fbc03d;
}

.label-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  span {
    display: inline-block;
  }
  div {
    flex: 1;
  }
}

// :global(.n-base-selection-input__content > div) {
//   font-family: "Open Sans", sans-serif !important;
// }

</style>
