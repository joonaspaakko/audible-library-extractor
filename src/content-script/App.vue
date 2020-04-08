<template>
  <div>
    <ale-overlay>
      <ale-splashscreen></ale-splashscreen>
      <ale-progress :progress="progress" ></ale-progress>
    </ale-overlay>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      progress: this.$root.$data.progress
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
