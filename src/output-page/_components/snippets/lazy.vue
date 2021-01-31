<template>
  <div v-if="!tag" :class="{ mounted: intersected }">
    <slot v-if="intersected" />
  </div>
  <td v-else-if="tag === 'td'" :class="{ mounted: intersected }">
    <slot v-if="intersected" />
  </td>
</template>

<script>
import makeUrl from "@output-mixins/makeFullUrl";

export default {
  name: "lazy",
  props: ['row', 'tag'],
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
