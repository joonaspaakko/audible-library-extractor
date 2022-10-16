<template>
  <a
  v-if="url"
  :href="url"
  target="_blank" rel="noopener noreferrer"
  :class="{ 'top-right': topRight, 'no-bg': noBG }"
  >
    <div
      v-if="icon"
      class="gr-icon audible-cloudplayer-link"
      :style="{ width: (size || 30) + 'px', height: (size || 30) + 'px' }"
      v-tippy :content="tooltip ? 'Open web player' : ''"
    >
      <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTEuNSA5My43IiB3aWR0aD0iMTUxLjUiIGhlaWdodD0iOTMuNyI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPjxnPjxnPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTc1LjggODAuN2w3NS43LTQ3LjJ2MTIuOEw3NS44IDkzLjcgMCA0Ni4zVjMzLjVsNzUuOCA0Ny4yeiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTc1LjggMjEuNWE0OC4xNyA0OC4xNyAwIDAgMC00MC43IDIxLjkgMTIuOTQgMTIuOTQgMCAwIDEgMS44LTEuNmMyMS4zLTE3LjcgNTItMTMuNyA2OC43IDguNmwxMS4xLTcuMWE0OS44MiA0OS44MiAwIDAgMC00MC45LTIxLjgiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik03NS44IDQzLjRhMjcuNzIgMjcuNzIgMCAwIDAtMjIuNCAxMS41IDIyLjcgMjIuNyAwIDAgMSAxMy41LTQuNGM4LjIgMCAxNS41IDQuMiAyMC40IDExLjNsMTAuNi02LjZhMjUuNzkgMjUuNzkgMCAwIDAtMjIuMS0xMS44TTI0LjYgMjQuMkM1NS44LS40IDk5LjkgNi4zIDEyMy40IDM5bC4yLjIgMTEuNS03LjFhNzAuODIgNzAuODIgMCAwIDAtMTE4LjYgMCA2MC42MyA2MC42MyAwIDAgMSA4LjEtNy45Ii8+PC9nPjwvZz48L3N2Zz4=" alt="" />
    </div>
    <span v-else>Search in Goodreads</span>
  </a>
</template>

<script>

export default {
  name: "openWebPlayer",
  props: ["book", "icon", "topRight", "size", 'tooltip', 'noBG'],
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


.gr-icon.audible-cloudplayer-link {
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
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 100%;
    height: auto;
    max-width: 80%;
  }
}

.no-bg div {
  background: transparent !important;
  border: none !important;
}

</style>
