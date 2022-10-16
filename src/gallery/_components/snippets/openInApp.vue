<template>
  <a
  v-if="url || muted"
  :href="url"
  target="_blank" rel="noopener noreferrer"
  class="audible-app-link"
  :class="{ 'muted': muted, 'placeholder': !book.asin }"
  :tabindex="muted ? 0 : -1"
  >
    <div
      class="gr-icon"
      :style="{ width: (size || 30) + 'px', height: (size || 30) + 'px' }"
      v-tippy="{ 
        placement: (muted ? 'left' : 'top'), 
        flipBehavior: (muted ? ['left', 'top', 'bottom', 'right'] : ['top', 'bottom', 'right', 'left']) 
      }" content="Open in app"
    >
      <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTEuNSA5My43IiB3aWR0aD0iMTUxLjUiIGhlaWdodD0iOTMuNyI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPjxnPjxnPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTc1LjggODAuN2w3NS43LTQ3LjJ2MTIuOEw3NS44IDkzLjcgMCA0Ni4zVjMzLjVsNzUuOCA0Ny4yeiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTc1LjggMjEuNWE0OC4xNyA0OC4xNyAwIDAgMC00MC43IDIxLjkgMTIuOTQgMTIuOTQgMCAwIDEgMS44LTEuNmMyMS4zLTE3LjcgNTItMTMuNyA2OC43IDguNmwxMS4xLTcuMWE0OS44MiA0OS44MiAwIDAgMC00MC45LTIxLjgiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik03NS44IDQzLjRhMjcuNzIgMjcuNzIgMCAwIDAtMjIuNCAxMS41IDIyLjcgMjIuNyAwIDAgMSAxMy41LTQuNGM4LjIgMCAxNS41IDQuMiAyMC40IDExLjNsMTAuNi02LjZhMjUuNzkgMjUuNzkgMCAwIDAtMjIuMS0xMS44TTI0LjYgMjQuMkM1NS44LS40IDk5LjkgNi4zIDEyMy40IDM5bC4yLjIgMTEuNS03LjFhNzAuODIgNzAuODIgMCAwIDAtMTE4LjYgMCA2MC42MyA2MC42MyAwIDAgMSA4LjEtNy45Ii8+PC9nPjwvZz48L3N2Zz4=" alt="" />
    </div>
  </a>
</template>

<script>

export default {
  name: "openInApp",
  props: ["book", "size", "muted"],
  data: function() {
    return {
      url: null
    };
  },
  created: function() {
    if ( _.get(this.book, 'asin') ) {
      this.url = 'https://smart.link/o3waqx4wg1gdn?asin=' + this.book.asin;
    }
  }
};
</script>

<style lang="scss" scoped>


.audible-app-link {
  
  > div {
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
  
  // width: 35px;
  // height: 35px;
  &.muted {
    display: inline-flex;
    justify-items: center;
    justify-content: center;
    align-items: center;  
    align-content: center;
  }
  &.muted > div {
    
    outline: none;
    
    @include themify($themes) {
      color: rgba( themed(frontColor), .7) !important;
      // border: 1px solid rgba( themed(frontColor), .15) !important;
      background: rgba( themed(frontColor), .10) !important;
    }
    
    // width: 13px;
    // height: 13px;
    // display: inline-block;
    vertical-align: middle;
    margin-right: 6px;
    padding: 2px;
    border: none;
    display: flex;
    justify-items: center;
    justify-content: center;
    align-items: center;  
    align-content: center;
    // opacity: .5;
    img {
      opacity: .6;
      display: inline-block;
      position: relative;
      // top: 1px;
      max-width: unset;
    }
  }
  
  &.muted:active > div,
  &.muted:focus > div {
    @include themify($themes) {
      background: darken( themed(audibleOrange), 5) !important;
    }
  }
  
  &.muted.placeholder { visibility: hidden; }
  
}


.theme-light .audible-app-link.muted > div {
  background: rgba( $lightFrontColor, .40) !important;
  color: $lightBackColor !important;
  img { opacity: 1 !important; }
  box-shadow: unset !important;
}

</style>
