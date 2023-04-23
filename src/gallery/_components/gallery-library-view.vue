<template>
  <div v-if="$store.state.showRoute">
    <router-view v-if="$route.name !== '404'" :key="$route.name+'-'+$store.state.routeParams+'-'+$store.state.refreshViewTimeStamp"></router-view>
    <div v-else id="nothing-here-404">
      <h3 v-if="$store.getters.searchIsActive && !$store.state.searchCollection.length">Search: no results</h3>
      <h3 v-else>404: There's nothing here</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: "aleLibraryView",
  mounted() {
    // console.log('%c' + 'LIBRARY VIEW MOUNTED' + '', 'background: #ff8d00; color: #fff; padding: 2px 5px; border-radius: 8px;');
  },
};
</script>

<style lang="scss" scoped>

</style>
