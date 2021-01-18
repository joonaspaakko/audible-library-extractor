<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: "aleLibraryView",
  beforeDestroy: function() {
    console.log('BEFORE DESTROY:', 'aleLibraryView')
  },
};
</script>
