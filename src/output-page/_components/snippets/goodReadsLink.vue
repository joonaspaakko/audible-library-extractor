<template>
  <a
  v-if="goodreadsUrl"
  :href="goodreadsUrl"
  target="_blank"
  :class="{ 'top-right': topRight }"
  >
    <div
      v-if="icon"
      class="gr-icon"
      :style="{ width: (size || 30) + 'px', height: (size || 30) + 'px' }"
      v-tippy content="Search for the book in Goodreads"
    >
      <img src="@output-images/goodreads.svg" alt="" />
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
      this.goodreadsUrl = this.makeGoodReadsUrl();
    }
  }
};
</script>
