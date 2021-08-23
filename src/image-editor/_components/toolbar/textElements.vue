<template>
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
  
  <spacer v-if="store.textElements.length" size="mini" :line="false" />
  
  <p v-if="store.textElements.length" class="gb-field-message gb-field-message--small gb-field-message--info gb-field-message--dark"><i aria-hidden="true" class="gb-field-message__icon gb-base-icon" style="font-size: 16px;">info</i><span class="gb-field-message__message">You can make room for text by adjusting canvas padding.</span></p>
  
  <div v-if="store.textElements.length" class="text-elements" v-for="(text, index) in store.textElements" :key="text.id" :class="{ active: text.active }"
  @mousedown="textElementClicked(index, text)">
    
    <spacer size="small" :line="false" />
    
    <div class="text-elements-inner-wrap" :style="{ zIndex: store.textElements.length - index }">
      
      <gb-icon class="remove-text" size="16px" name="close" @click="$store.commit('removeText', index)"></gb-icon>
      
      <div class="label-row">
        <span style="width: 30px;">Text:</span>
        <gb-input
          type="text"
          :full-width="true"
          :value="text.text"
          @input="changeTextElementThrottle( $event, index, text, 'text' )"
          @focus="$emit('inputFocused')"
          @blur="$emit('inputFocused')"
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
          @input="changeTextElementThrottle( $event, index, text, 'fontSize', $event )"
          @focus="$emit('inputFocused')"
          @blur="$emit('inputFocused')"
          size="mini"
        />
        <span style="display: inline-block; padding-left: 5px;">{{ text.fontSize }}</span>
      </div>
      
      <spacer size="default" :line="false" />
      
      <div class="label-row">
        
        <div class="align-text" style="padding-left: 0px;"
        v-tippy content="Text is aligned inside its own bounding box.">
          <gb-icon :class="{ active: text.alignment === 'left' }" size="16px" name="format_align_left" @click="$store.commit('changeText', { index: index, key: 'alignment', value: 'left', });"></gb-icon>
          <gb-icon :class="{ active: text.alignment === 'center' }" size="16px" name="format_align_center" @click="$store.commit('changeText', { index: index, key: 'alignment', value: 'center', });"></gb-icon>
          <gb-icon :class="{ active: text.alignment === 'right' }" size="16px" name="format_align_right" @click="$store.commit('changeText', { index: index, key: 'alignment', value: 'right', });"></gb-icon>
        </div>
        
        <div style="display: flex; justify-content: center; align-items: center; flex: 0;">
          <color-picker
          class="text-color-picker-placeholder"
          :value="text.color"
          @input="textColorChanged( $event, index )"
          :position="{ left: '-85px', top: '26px' }">
          </color-picker>
        </div>
        
        <gb-checkbox
        style="padding-left: 15px;"
        size="mini"
        :checked="text.bold"
        @change="changeTextElement( $event, index, text, 'bold' )"
        label="Bold"
        ></gb-checkbox>
        
        <gb-checkbox
        style="padding-left: 4px; white-space: nowrap;"
        size="mini"
        :checked="text.allCaps"
        @change="changeTextElement( $event, index, text, 'allCaps' )"
        label="All caps"
        ></gb-checkbox>
      </div>
      
    </div>
    
  </div>
  
  <spacer size="medium" :line="false" />
  
</div>
</template>

<script>

import spacer from "@editor-comps/toolbar/spacer.vue";
export default {
  name: "textElements",
  
  components: { spacer },
  data: function () {
    return {
      store: this.$store.state,
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
      
      this.$store.commit('addText', { 
        text: 'Lorem ipsum dolor sit amet',
        rotation: 0,
        floater: false,
        fullWidth: true,
        fontSize: 30,
        bold: false,
        allCaps: false,
        active: true,
        color: '#3a3a3a',
        alignment: 'center',
      });
      
    },
    
    textColorChanged: _.debounce(function(color, index) {
      this.$store.commit('changeText', { index: index, key: 'color', value: color, });
    }, 250, { leading: false, trailing: true }),
    
    changeTextElement: _.debounce( function(value, index, textElement, key, e) {
      let val = value;
      if ( e ) val = parseFloat(e.target.value);
      this.$store.commit('changeText', { index: index, key: key, value: val, });
      this.$nextTick(function() {
        this.$root.$emit('update-moveable-handles');
      });
    }, 250, { leading: false, trailing: true }),
    
    changeTextElementThrottle: _.throttle( function(value, index, textElement, key, e) {
      let val = value;
      if ( e ) val = parseFloat(e.target.value);
      this.$store.commit('changeText', { index: index, key: key, value: val, });
      this.$nextTick(function() {
        this.$root.$emit('update-moveable-handles');
      });
    }, 20, { leading: true, trailing: true }),
    
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
    position: absolute;
    top: 10px;
    right: 20px;
    top: -9px;
    right: 10px;
    background: #171e29;
  }
}

.align-canvas,
.align-text {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
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
    padding-left: 10px;
    flex: 1;
  }
}

</style>
