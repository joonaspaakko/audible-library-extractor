<template>
  <div :class="{ mounted: intersected }">
    <slot v-if="intersected" />
  </div>
</template>

<script>
import makeUrl from "@output-mixins/makeFullUrl";

export default {
  name: "lazy",
  data: function() {
    return {
      observer: null, 
      intersected: false,
    };
  },
  mounted: function() {
    
    const vue = this;
    this.observer = new IntersectionObserver(function( entries ) {
      if ( entries[0].isIntersecting ) {
        vue.intersected = true;
        vue.observer.disconnect();
      }
    }, {
      threshold: 0,
      rootMargin: '200px',
    });
    
    this.observer.observe(this.$el);
    
  },
  
  destroyed: function() {
    this.observer.disconnect();
  },
  
};
</script>
