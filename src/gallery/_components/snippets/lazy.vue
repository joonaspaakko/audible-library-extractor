<template>
  <component :is="tag || 'div'" :class="{ mounted: intersected }">
    <slot v-if="intersected" />
  </component>
</template>

<script>

export default {
  name: "lazy",
  props: ['tag'],
  data: function() {
    return {
      observer: null, 
      intersected: false,
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      const vue = this;
      
      this.observer = new IntersectionObserver(function( entries ) {
        if ( entries[0].isIntersecting ) {
          vue.intersected = true;
          vue.observer.disconnect();
        }
      }, {
        threshold: 0,
        rootMargin: '100px',
      });
      
      this.observer.observe(this.$el);
      
    });
  },
  
  destroyed: function() {
    if ( this.observer ) this.observer.disconnect();
  },
  
};
</script>
