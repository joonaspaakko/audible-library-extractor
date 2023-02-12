<template>
  <div class="color-picker-placeholder">
    <n-color-picker 
      size="small" 
      :default-value="value" 
      :swatches="store.colorPicker_swatches" 
      @update:value="colorChanged"
      :style="{
        width: size + 'px',
        height: size + 'px',
      }"
    />
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
  
  .n-color-picker-trigger,
  .n-color-picker-trigger__fill  {
    border: none !important;
    border-radius: 999999999999px;
    overflow: hidden;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    box-sizing: border-box;
  }
  
  .n-color-picker-trigger { 
    position: relative;
    border: 1px solid #fff !important;
  }
  
  .n-color-picker-trigger__value { display: none; }
  
}

</style>
