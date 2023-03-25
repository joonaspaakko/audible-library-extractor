<template>
  <a
  v-if="goodreadsUrl || muted"
  :href="goodreadsUrl"
  target="_blank" rel="noopener noreferrer"
  class="good-reads-icon"
  :class="{ 'muted': muted, 'placeholder': !goodreadsUrl }"
  >
    <div
      v-if="icon"
      class="gr-icon"
      :style="{ width: (size || 30) + 'px', height: (size || 30) + 'px' }"
      v-tippy content="Search for the book in Goodreads"
    >
      <!-- <svg height="512" viewBox="0 0 24 24" width="512"><path d="M5.111 18.907h.129c.585 0 1.176 0 1.762.005.074 0 .143-.019.166.098.328 1.636 1.383 2.559 2.9 2.995 1.241.356 2.495.366 3.749.084 1.558-.347 2.582-1.327 3.136-2.831.369-1.008.494-2.053.508-3.117.005-.272.014-2.203-.009-2.475l-.041-.014c-.037.07-.079.136-.115.206-1.019 2.02-2.826 3.159-4.861 3.239-4.75.188-7.812-2.672-7.932-8.259-.023-1.111.083-2.198.383-3.267.95-3.333 3.44-5.541 7.097-5.569 2.826-.019 4.681 1.814 5.359 3.295.023.052.06.108.11.089V.498h2.043c0 13.139.005 15.572.005 15.572-.005 3.68-1.232 6.736-4.75 7.603-3.205.792-7.332.225-9.039-2.681-.369-.633-.544-1.327-.599-2.086zm6.747-17.194C9.437 1.69 6.854 3.621 6.554 7.985c-.189 2.766.683 5.728 3.298 6.966 1.273.605 3.427.703 4.995-.408 2.195-1.556 2.891-4.547 2.527-7.219-.448-3.333-2.205-5.625-5.516-5.611z" fill="#4e342e"/></svg> -->
      <img v-if="!muted" src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iNTEyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik01LjExMSAxOC45MDdoLjEyOWMuNTg1IDAgMS4xNzYgMCAxLjc2Mi4wMDUuMDc0IDAgLjE0My0uMDE5LjE2Ni4wOTguMzI4IDEuNjM2IDEuMzgzIDIuNTU5IDIuOSAyLjk5NSAxLjI0MS4zNTYgMi40OTUuMzY2IDMuNzQ5LjA4NCAxLjU1OC0uMzQ3IDIuNTgyLTEuMzI3IDMuMTM2LTIuODMxLjM2OS0xLjAwOC40OTQtMi4wNTMuNTA4LTMuMTE3LjAwNS0uMjcyLjAxNC0yLjIwMy0uMDA5LTIuNDc1bC0uMDQxLS4wMTRjLS4wMzcuMDctLjA3OS4xMzYtLjExNS4yMDYtMS4wMTkgMi4wMi0yLjgyNiAzLjE1OS00Ljg2MSAzLjIzOS00Ljc1LjE4OC03LjgxMi0yLjY3Mi03LjkzMi04LjI1OS0uMDIzLTEuMTExLjA4My0yLjE5OC4zODMtMy4yNjcuOTUtMy4zMzMgMy40NC01LjU0MSA3LjA5Ny01LjU2OSAyLjgyNi0uMDE5IDQuNjgxIDEuODE0IDUuMzU5IDMuMjk1LjAyMy4wNTIuMDYuMTA4LjExLjA4OVYuNDk4aDIuMDQzYzAgMTMuMTM5LjAwNSAxNS41NzIuMDA1IDE1LjU3Mi0uMDA1IDMuNjgtMS4yMzIgNi43MzYtNC43NSA3LjYwMy0zLjIwNS43OTItNy4zMzIuMjI1LTkuMDM5LTIuNjgxLS4zNjktLjYzMy0uNTQ0LTEuMzI3LS41OTktMi4wODZ6bTYuNzQ3LTE3LjE5NEM5LjQzNyAxLjY5IDYuODU0IDMuNjIxIDYuNTU0IDcuOTg1Yy0uMTg5IDIuNzY2LjY4MyA1LjcyOCAzLjI5OCA2Ljk2NiAxLjI3My42MDUgMy40MjcuNzAzIDQuOTk1LS40MDggMi4xOTUtMS41NTYgMi44OTEtNC41NDcgMi41MjctNy4yMTktLjQ0OC0zLjMzMy0yLjIwNS01LjYyNS01LjUxNi01LjYxMXoiIGZpbGw9IiM0ZTM0MmUiLz48L3N2Zz4=" alt="" />
      <img v-else alt="" src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iNTEyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik01LjExMSAxOC45MDdoLjEyOWMuNTg1IDAgMS4xNzYgMCAxLjc2Mi4wMDUuMDc0IDAgLjE0My0uMDE5LjE2Ni4wOTguMzI4IDEuNjM2IDEuMzgzIDIuNTU5IDIuOSAyLjk5NSAxLjI0MS4zNTYgMi40OTUuMzY2IDMuNzQ5LjA4NCAxLjU1OC0uMzQ3IDIuNTgyLTEuMzI3IDMuMTM2LTIuODMxLjM2OS0xLjAwOC40OTQtMi4wNTMuNTA4LTMuMTE3LjAwNS0uMjcyLjAxNC0yLjIwMy0uMDA5LTIuNDc1bC0uMDQxLS4wMTRjLS4wMzcuMDctLjA3OS4xMzYtLjExNS4yMDYtMS4wMTkgMi4wMi0yLjgyNiAzLjE1OS00Ljg2MSAzLjIzOS00Ljc1LjE4OC03LjgxMi0yLjY3Mi03LjkzMi04LjI1OS0uMDIzLTEuMTExLjA4My0yLjE5OC4zODMtMy4yNjcuOTUtMy4zMzMgMy40NC01LjU0MSA3LjA5Ny01LjU2OSAyLjgyNi0uMDE5IDQuNjgxIDEuODE0IDUuMzU5IDMuMjk1LjAyMy4wNTIuMDYuMTA4LjExLjA4OVYuNDk4aDIuMDQzYzAgMTMuMTM5LjAwNSAxNS41NzIuMDA1IDE1LjU3Mi0uMDA1IDMuNjgtMS4yMzIgNi43MzYtNC43NSA3LjYwMy0zLjIwNS43OTItNy4zMzIuMjI1LTkuMDM5LTIuNjgxLS4zNjktLjYzMy0uNTQ0LTEuMzI3LS41OTktMi4wODZ6bTYuNzQ3LTE3LjE5NEM5LjQzNyAxLjY5IDYuODU0IDMuNjIxIDYuNTU0IDcuOTg1Yy0uMTg5IDIuNzY2LjY4MyA1LjcyOCAzLjI5OCA2Ljk2NiAxLjI3My42MDUgMy40MjcuNzAzIDQuOTk1LS40MDggMi4xOTUtMS41NTYgMi44OTEtNC41NDcgMi41MjctNy4yMTktLjQ0OC0zLjMzMy0yLjIwNS01LjYyNS01LjUxNi01LjYxMXoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=" />
    </div>
    <span v-else>Search in Goodreads</span>
  </a>
</template>

<script>
import makeGoodReadsUrl from "../../_mixins/gallery-goodReadsSearchUrl.js";

export default {
  name: "goodReadsLink",
  props: ["book", "icon" , "size", "muted"],
  mixins: [makeGoodReadsUrl],
  data: function() {
    return {
      goodreadsUrl: null
    };
  },
  created: function() {
    if (this.book) {
      this.goodreadsUrl = this.makeGoodReadsUrl();
    }
  }
};
</script>


<style lang="scss" scoped>


.gr-icon {
  background: #e6e1c4 !important;
}

.theme-light .gr-icon {
  // path {
  //   fill: #fff;
  // }
  border: 1px solid rgba(#4e342e, .2);
}

img {
  width: auto;
  height: 100%;
  max-height: 90%;
}


.muted {
  display: inline-flex;
  justify-items: center;
  justify-content: center;
  align-items: center;  
  align-content: center;
  .gr-icon { border: 0px; }
}
.muted > div {
  
  outline: none;
  
  @include themify($themes) {
    color: rgba( themed(frontColor), .7) !important;
    // border: 1px solid rgba( themed(frontColor), .15) !important;
    background: rgba( themed(frontColor), .10) !important;
  }
  
  border-radius: 9999999px;
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

.muted:active > div,
.muted:focus > div {
  @include themify($themes) {
    background: darken( themed(audibleOrange), 5) !important;
  }
}

.muted.placeholder { visibility: hidden; }



.theme-light .good-reads-icon.muted > div {
  background: rgba( $lightFrontColor, .40) !important;
  color: $lightBackColor !important;
  img { opacity: 1 !important; }
  box-shadow: unset !important;
}

</style>
