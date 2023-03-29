<template>
  <contenteditable 
    ref="contedit"
    class="fitty-element" 
    :data-fitty-element="index"
    tag="div" 
    :contenteditable="true" 
    v-model="labelText" 
    :no-nl="false" 
    :no-html="true" 
    @returned="enterPressed" 
    @vue:mounted="contenteditable_mounted"
    v-click-outside-element="clickedOutside"
    @focus="focused = true"
    @blur="focused = false"
  />
</template>

<script>


import contenteditable from 'vue-contenteditable';
import fitty from 'fitty';

export default {
  components: { 
    contenteditable,
  },
  props: ['tier', 'index', 'visibleTiers'],
  data: function () {
    return {
      store: this.$store.state,
      focused: false,
      fittyEl: null,
    };
  },
  
  computed: {
    
    labelSize() {
      return (this.store.coverSize || 0) / 4;
    },
    
    labelText: {
      get() {
        return this.tier.text || this.tier.key;
      },
      set( value ) {
        
        this.$store.commit('updateTierlistLabel', { 
          index: this.index, 
          key: this.tier.key, 
          value: value, 
        });
        
      },
    },
  },
  
  watch: {
    'visibleTiers'() {
      
      this.applyFitty('redraw');
      
    },
    'store.coverSize'() {
      
      this.applyFitty('redraw');
      
    },
  },
  
  methods: {
    
    editableFocus( e ) {
      console.log( e );
    },
    
    applyFitty( redraw ) {
      
      this.$nextTick(() => {
        
        const fittyEl = this.$refs.contedit.$el;
        fittyEl.style.fontSize = this.labelSize+'px';
        
        if ( _.get(this.fittyEl, '0') ) {
          // Using unsubscribe() instead of fit() in order to update maxSize
          this.fittyEl[0].unsubscribe();
        }
        this.fittyEl = fitty('[data-fitty-element="'+this.index+'"]', {
          maxSize: this.labelSize, 
          // Necessary to make sure text doesn't overflow... Better to let user be the judge of how
          // small is too small. They can always force a line break or reduce the amount of text to
          // make legible.
          minSize: 0,
        });
        
      });
      
    },
    
    updateText( e, tier, index ) {
      console.log( e.target.innerHTML )
      this.$store.commit('updateTierlistLabel', { 
        index: index, 
        key: tier.key, 
        value: e.target.innerHTML 
      });
    },
    
    contenteditable_mounted() {
      console.log('mounted contedit')
      this.applyFitty();
    },
    
    enterPressed() {
      
    },
    
    clickedOutside() {
      if ( this.focused ) document.activeElement.blur();
    }
    
  },
  
};
</script>

<style scoped lang="scss">

.fitty-element {
  display: inline-block !important;
  white-space: nowrap !important;
  // white-space: normal !important;
  max-width: 100%;
  outline: none;
  direction: ltr;
  text-align: center;
  box-sizing: border-box;
  border-width: none;
  &:focus {
    color: red;
  }
}

</style>
