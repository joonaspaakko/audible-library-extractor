<template>
  <font-awesome
    class="favorite"
    v-if="book.favorite"
    :class="{ 'top-right': topRight }"
    fas
    icon="heart"
    content="This book is one of my favorites!"
    v-tippy="{
      placement: 'top',
      arrow: true,
      theme: general.tippyTheme
    }"
    :style="{ width: (size || 30) + 'px', height: 'auto' }"
  />
</template>

<script>
export default {
  name: "favoriteBook",
  props: ["book", "general", "topRight", "size"]
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
