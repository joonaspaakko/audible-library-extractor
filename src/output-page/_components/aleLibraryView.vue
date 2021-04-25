<template>
  <router-view :key="$route.name+$store.state.viewRefresh"></router-view>
</template>

<script>
export default {
  name: "aleLibraryView"
};
</script>
