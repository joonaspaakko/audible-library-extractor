<template>
  <div>
    
    <h2 class="book-title">
      <a :href="audibleURL" target="_blank" rel="noopener noreferrer">
        <span v-if="!$store.state.sticky.bookDetailSettings.titleShort" v-html="book.title || book.titleShort"></span>
        <span v-else v-html="book.titleShort || book.title"></span>
      </a>
    </h2>
    
    <div class="subblementary-book-title" v-if="showSubtitle" v-html="book.subtitle || book.title"></div>
    
  </div>
</template>

<script>
import makeUrl from "@output-mixins/gallery-makeFullUrl.js";

export default {
  name: "bookDetailsTitle",
  props: ["book", "tempAsin"],
  mixins: [ makeUrl ],
  computed: {
    showSubtitle() {
      
      const preferSubtitle = this.$store.state.sticky.bookDetailSettings.titleShort;
      const hasSubtitle = !!this.book.subtitle;
      const noTitleDuplicate = !!this.book.title && !!this.book.titleShort && this.book.title !== this.book.titleShort;
      
      return preferSubtitle && ( hasSubtitle || noTitleDuplicate );
      
    },
    audibleURL() {
      if ( this.tempAsin ) {
        const seriesObj = _.get(this.book, 'series.0');
        return this.makeUrl('series', seriesObj);
      }
      else {
        return this.makeUrl('book', this.book.asin);
      }
    },
  },
};
</script>

<style lang="scss">

h2.book-title {
  display: inline-block;
  width: 100%;
  font-size: 1.8em;
  line-height: 1.1em;
  margin: 0;
  padding-bottom: 3px;
  a {
    white-space: normal;
    text-decoration: none;
    @include themify($themes) {
      color: themed(frontColor);
    }
    &:hover {
      text-decoration: underline;
    }
  }
}

.subblementary-book-title {
  // margin-top: -2px;
  position: relative;
  //top: -3px;
  font-size: 1.25em;
  line-height: 1.45em;
  font-weight: 400;
}
</style>
