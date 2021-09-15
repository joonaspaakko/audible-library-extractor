<template>
  <div class="spacer" :style="spacerStyle">
    <div v-if="line" class="line" :style="lineStyle"></div>
  </div>
</template>

<script>
export default {
  name: "spacer",
  props: ["size", "line", "color"],
  data: function () {
    return {};
  },
  computed: {
    spacerStyle: function () {
      let padding = 5;
      if (this.size == "mini") padding = 2;
      if (this.size == "small") padding = 5;
      else if (this.size == "default") padding = 10;
      else if (this.size == "normal") padding = 10;
      else if (this.size == "medium") padding = 15;
      else if (this.size == "large") padding = 20;
      else if (this.size == "largest") padding = 25;
      else if (this.size == "huge") padding = 25;
      return { paddingTop: padding + "px", paddingBottom: padding + "px" };
    },
    lineStyle: function () {
      return { background: this.color || "#323d4f" };
    },
  },
};
</script>

<style scoped lang="scss">
.spacer {
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  .line {
    height: 1px;
    flex: 1;
  }
}
</style>
