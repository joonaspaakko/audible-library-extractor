<template>
  <div>
    <router-view v-if="$route.name !== '404'" :key="$route.name+$store.state.viewRefresh"></router-view>
    <div v-else id="nothing-here-404">
      <h3>404: There's nothing here</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: "aleLibraryView",
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";

#nothing-here-404 {
  text-align: center;
  font-size: 2em;
  line-height: 2em;
  @include themify($themes) {
    color: themed(frontColor);
  }
}
</style>
