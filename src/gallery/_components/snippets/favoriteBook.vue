<template>
  <fa6-solid-heart
  class="favorite" :class="{ 'top-right': topRight }"
  v-tippy content="This book is one of my favorites!"
  :style="{ width: (size || 30) + 'px', height: 'auto' }"
  />
</template>

<script>
export default {
  name: "favoriteBook",
  props: ["topRight", "size"]
};
</script>

<style lang="scss" scoped>
.favorite {
  color: #ee0b49;
  &.top-right {
    position: absolute;
    z-index: 2;
    top: 5px;
    right: 5px;
  }
}
</style>
