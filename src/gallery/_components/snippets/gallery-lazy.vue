<template>
  <component :is="tag || 'div'" :class="{ mounted: intersected }">
    <slot v-if="intersected" />
  </component>
</template>

<script>

export default {
  name: "lazy",
  props: ['tag', 'offset', 'delay'],
  data: function() {
    return {
      observer: null, 
      intersected: false,
    };
  },
  mounted() {
    this.$nextTick(function() {
      this.observe();
    });
  },
  
  destroyed() {
    if ( this.observer ) this.observer.disconnect();
  },
  
  methods: {
    
    observe() {
      
      const vue = this;
      this.observer = new IntersectionObserver(function( entries ) {
        if ( entries[0].isIntersecting ) {
          setTimeout(function() {
            
            vue.intersected = true;
            vue.observer.disconnect();
            
          }, vue.delay || 0);
        }
      }, {
        threshold: 0,
        rootMargin: (this.offset || 100) + 'px',
      });
      
      this.observer.observe(this.$el);
      
    },
    
  },
  
};
</script>
