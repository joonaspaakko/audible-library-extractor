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
      v-tippy content="Open in app"
    >
      <img src="@output-images/audible-logo.svg" alt="" />
    </div>
    <span v-else>Search in Goodreads</span>
  </a>
</template>

<script>

export default {
  name: "openInApp",
  props: ["book", "icon", "topRight", "size"],
  data: function() {
    return {
      url: null
    };
  },
  created: function() {
    if (this.book) {
      this.url = 'https://smart.link/o3waqx4wg1gdn?asin=' + this.book.asin;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";

.gr-icon.audible-app-link {
  // width: 35px;
  // height: 35px;
  border-radius: 999999px;
  background: $audibleOrange;
  background: #ffc338;
  background: -moz-linear-gradient(top, #ffc338 0%, #f29a33 100%);
  background: -webkit-linear-gradient(top, #ffc338 0%, #f29a33 100%);
  background: linear-gradient(to bottom, #ffc338 0%, #f29a33 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffc338', endColorstr='#f29a33',GradientType=0 );
  border: 1px solid #f29a33;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.2);
  img {
    width: 100%;
    height: auto;
    max-width: 80%;
  }
}

</style>
