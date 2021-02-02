<template>
  <div class="book-info-toolbar">
    <!-- TODO: not sure if favorite book icon makes sense here...
               note: it's also visible in the spreadsheet tooltip book details
    -->
    <favorite-book   :size="size" :book="book" v-if="book.favorite" />
    <sampleButton    :size="size" :book="book" />
    <!-- <sampleButton    :size="size" :book="book" :index="rowIndex" /> -->
    <good-reads-link :size="size" :book="book" :icon="true" />
    <open-in-app     :size="size" :book="book" :icon="true" />
    <open-web-player :size="size" :book="book" :icon="true" />
  </div>
</template>

<script>
import goodReadsLink from "@output-comps/snippets/goodReadsLink";
import favoriteBook from "@output-comps/snippets/favoriteBook";
import sampleButton from "@output-comps/snippets/sampleButton";
import openInApp from "@output-comps/snippets/openInApp";
import openWebPlayer from "@output-comps/snippets/openWebPlayer";

export default {
  name: "book-info-toolbar",
  props: ["book"],
  components: {
    goodReadsLink,
    favoriteBook,
    sampleButton,
    openInApp,
    openWebPlayer,
  },
  data: function() {
    return {
      size: 20,
    };
  },
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

.book-info-toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  justify-items: space-between;
  padding: 0 10%;
  border-radius: 99999px;
  height: 30px;
  @include themify($themes) {
    background: darken(themed(backColor), 1);
    box-shadow: inset 0 3px 15px rgba(darken(themed(backColor), 30), 0.4);
  }
    
  .top-right {
    position: absolute;
    z-index: 3;
    top: 15px;
    right: 15px;
  }

  > * {
    &, & > * { 
      outline: none; 
      display: flex;
      align-content: center;
      justify-content: center;
      align-items: center;
      justify-items: center;
    }
    // margin-left: 7px; 
    // &:first-child { margin-left: 0; }
    padding: 4px 8px;
    display: inline-block;
  }
  
  .gr-icon {
    cursor: pointer;
    display: flex;
    align-content: center;
    justify-content: center;
    align-items: center;
    justify-items: center;
    img, svg {
      display: inline-block;
      max-width: 70%;
      height: auto;
    }
    background: #fff;
    border-radius: 10px;
  }
  
}

</style>
