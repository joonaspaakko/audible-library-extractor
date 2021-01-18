<template>
  <div class="book-info-toolbar">
    <favorite-book   :size="25" :book="book" v-if="book.favorite" />
    <sampleButton    :size="25" :book="book" />
    <!-- <sampleButton    :size="25" :book="book" :index="rowIndex" /> -->
    <good-reads-link :size="25" :book="book" :icon="true" />
  </div>
</template>

<script>
import goodReadsLink from "@output-comps/snippets/goodReadsLink";
import favoriteBook from "@output-comps/snippets/favoriteBook";
import sampleButton from "@output-comps/snippets/sampleButton";

export default {
  name: "book-info-toolbar",
  props: ["book"],
  components: {
    goodReadsLink,
    favoriteBook,
    sampleButton,
  }
};
</script>

<style lang="scss" scoped>

.corner-actions {
  position: absolute;
  z-index: 3;
  top: 15px;
  right: 15px;
  display: inline-flex;
  flex-direction: row;
  > * {
    margin-left: 7px;
  }
}

</style>
