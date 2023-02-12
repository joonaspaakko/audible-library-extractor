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
      labelSize: 0,
      focused: false,
    };
  },
  
  computed: {
    
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
    'store.coversPerRow'() {
      
      this.applyFitty('redraw');
      
    },
  },
  
  mounted: function() {
    
    this.labelSize = (this.store.coverSize/4);

  },
  
  methods: {
    
    editableFocus( e ) {
      console.log( e );
    },
    
    applyFitty( redraw ) {
      
      this.$nextTick(() => {
        
        console.log( 'test', this.$refs.contedit.$el );
        
        this.$refs.contedit.$el.style.fontSize = this.labelSize+'px';
        
        fitty('[data-fitty-element="'+this.index+'"]', {
          maxSize: this.labelSize,
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
