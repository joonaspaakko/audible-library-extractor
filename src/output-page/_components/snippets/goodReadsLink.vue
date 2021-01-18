<template>
  <a
  v-if="goodreadsUrl"
  :href="goodreadsUrl"
  target="_blank"
  class="search-goodreads"
  :class="{ 'top-right': topRight }"
  >
    <div
      v-if="icon"
      class="gr-icon"
      :style="{ width: (size || 30) + 'px', height: (size || 30) + 'px' }"
      v-tippy content="Search for the book in Goodreads"
    >
      <img src="images/goodreads.svg" alt="" />
    </div>
    <span v-else>Search in Goodreads</span>
  </a>
</template>

<script>
import makeGoodReadsUrl from "../../_mixins/goodReadsSearchUrl";

export default {
  name: "goodReadsLink",
  props: ["book", "icon", "topRight", "size"],
  mixins: [makeGoodReadsUrl],
  data: function() {
    return {
      goodreadsUrl: null
    };
  },
  created: function() {
    if (this.book) {
      this.goodreadsUrl = this.makeGoodReadsUrl(this.book);
    }
  }
};
</script>

<style lang="scss" scoped>
.top-right {
  position: absolute;
  z-index: 3;
  top: 15px;
  right: 15px;
}

.gr-icon {
  cursor: pointer;
  display: flex;
  align-content: center;
  justify-content: center;
  align-items: center;
  justify-items: center;
  img {
    display: inline-block;
    max-width: 60%;
    height: auto;
  }
  background: #fff;
  border-radius: 10px;
}
</style>
