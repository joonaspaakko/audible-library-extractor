<template>
  <div class="color-picker-placeholder" :class="{ 'color-picker-placeholder--labeled': label }">
    <n-color-picker
      ref="picker"
      size="small"
      :default-value="value"
      :swatches="store.colorPicker_swatches"
      @update:value="colorChanged"
      :style="{
        width: size + 'px',
        height: size + 'px',
      }"
    />
    <span v-if="label" class="color-picker-label" @click="openPicker">{{ label }}</span>
  </div>
</template>

<script>

import { 
  NColorPicker, 
} from 'naive-ui';

export default {
  name: "ColorPicker",  
  props: {
    size: {
      type: Number,
      default: 27
    },
    storeKey: {
      type: String,
      default: ''
    },
    defaultValue: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
  },
  components: { 
    NColorPicker,
  },
  data: function () {
    return {
      store: this.$store.state,
    };
  },
  computed: {
    value() {
      return this.defaultValue || _.get( this.store, this.storeKey );
    }
  },
  methods: {
    
    openPicker( event ) {
      const trigger = event.currentTarget.closest( '.color-picker-placeholder' ).querySelector( '.n-color-picker-trigger' );
      if ( trigger ) trigger.click();
    },

    colorChanged( value ) {
      if ( this.defaultValue ) {
        this.$emit('input', value);
      }
      else {
        const key = this.storeKey;
        console.log( key, value )
        this.$store.commit('update', { key, value });
      }
    },
    
  },
};
</script>

<style lang="scss">

.color-picker-placeholder {
  align-self: center;
  display: inline-flex;
  justify-content: center;
  align-items: center;  
  
  .n-color-picker,
  .n-color-picker__fill  {
    border: none !important;
    border-radius: 999999999999px;
    overflow: hidden;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    box-sizing: border-box;
  }

  .n-color-picker {
    position: relative;
    border: 1px solid #fff !important;
    flex-shrink: 0;
    aspect-ratio: 1;
    width: 15px;
    height: 15px;
  }

  .n-color-picker__value { display: none; }

}

.color-picker-placeholder--labeled {
  gap: 6px;

  .n-color-picker,
  .n-color-picker__fill {
    border-radius: 4px;
  }

  .color-picker-label {
    color: inherit;
    white-space: nowrap;
    padding: var(--n-label-padding);
    cursor: pointer;
  }
}

</style>
