<template>
  <!-- <router-view :library="library" :general="general" :key="$route.fullPath"></router-view> -->
  <router-view :library="library" :general="general" :key="$route.fullPath"></router-view>
</template>

<script>

export default {
  name: 'aleLibraryView',
  props: ['library', 'general'],
  data: function() {
    return {
    }
  },
  
  created: function() {
    
    const vue = this;
    Eventbus.$emit('routeUpdate', {
      from: 'ale-categories',
      route: vue.$route,
    });
    
  },
}
</script>

<style lang="scss">
// @import '~@/_variables.scss';

</style>
