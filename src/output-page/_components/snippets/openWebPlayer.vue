<template>
  <a
  v-if="url"
  :href="url"
  target="_blank"
  :class="{ 'top-right': topRight }"
  >
    <div
      v-if="icon"
      class="gr-icon audible-app-link"
      :style="{ width: (size || 30) + 'px', height: (size || 30) + 'px' }"
      v-tippy content="Open web player"
    >
      <img src="@output-images/audible-logo.svg" alt="" />
    </div>
    <span v-else>Search in Goodreads</span>
  </a>
</template>

<script>

export default {
  name: "openWebPlayer",
  props: ["book", "icon", "topRight", "size"],
  data: function() {
    return {
      url: null
    };
  },
  created: function() {
    if (this.book) {
      this.url = 'https://www.audible.com/webplayer?asin=' + this.book.asin;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";

.gr-icon.audible-app-link {
  border-radius: 999999px;
  $bgColor1: desaturate( complement(#ffc338), 16);
  $bgColor2: darken($bgColor1, 10);
  background: $bgColor1;
  background: -moz-linear-gradient(top, $bgColor1 0%, $bgColor2 100%);
  background: -webkit-linear-gradient(top, $bgColor1 0%, $bgColor2 100%);
  background: linear-gradient(to bottom, $bgColor1 0%, $bgColor2 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='$bgColor1', endColorstr='$bgColor2',GradientType=0 );
  border: 1px solid $bgColor2;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.2);
  img {
    width: 100%;
    height: auto;
    max-width: 80%;
  }
}

</style>
