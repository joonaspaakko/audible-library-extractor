<template>
  <tr class="ale-row-inner" @click="$root.$emit('book-clicked', { book })">
    
    <lazy
    tag="td"
    v-for="col in columns"
    :key="col.key"
    class="ale-col"
    :class="col.class"
    :name="col.name"
    >
      <div class="ale-col-inner">
        
        <span v-if="col.key === 'title'" class="icons-n-stuff">
          <span class="info-icon"><font-awesome fas icon="chevron-down" class="pointer"/></span>
          <sampleButton :book="book" :index="rowIndex" :size="16"></sampleButton>
          <div class="thumbnail-wrapper">
            <img v-if="!imageLoading" :src="coverUrl27" alt="">
          </div>
        </span>

        <span class="text-container"> {{ col.text || "&nbsp;" }}</span>
      </div>
    </lazy>
    
  </tr>
</template>

<script>
import makeCoverUrl from "@output-mixins/makeCoverUrl";
import stringifyArray from "@output-mixins/stringifyArray";
import makeFullUrl from "@output-mixins/makeFullUrl";

import lazy from "@output-snippets/lazy.vue";
import sampleButton from "@output-comps/snippets/sampleButton";

export default {
  name: "aleListItem",
  props: ["book", "rowIndex", "keys"],
  mixins: [stringifyArray, makeCoverUrl, makeFullUrl],
  components: {
    lazy,
    sampleButton,
  },
  data: function() {
    return {
      bookUrl: "",
      coverUrl: "",
      coverUrl27: "",
      bookTitle: "",
      goodreadsUrl: "",
      columns: null,
      imageLoading: true,
    };
  },

  created: function() {
    
    this.bookUrl = this.makeFullUrl(this.book.url);
    this.coverUrl = this.makeCoverUrl(this.book.cover);
    if (this.coverUrl) this.coverUrl27 = this.coverUrl.replace("_SL500_", "_SL27_");
    this.bookTitle = this.book.title || this.book.titleShort;
    this.columns = this.prepareColumns();
    
  },

  mounted: function() {
    const vue = this;
    this.$nextTick(function() {
      // setTimeout(function() {
      this.imageLoading = false;
      // }, 600);
    });
  },

  methods: {

    prepareColumns: function() {
      
      const vue = this;
      return _.map(this.keys, function(key) {
        
        let col = {};
        col.key = key;
        col.class = "col-" + _.kebabCase(key);
        
        switch (key) {
          case "authors":
          case "narrators":
          case "categories":
          case "series":
          case "publishers":
            col.text = vue.stringifyArray(
              vue.book[ key ],
              "name",
              key === "categories" ? " > " : null
            );
            break;

          case "title":
            col.text = vue.book[ key ] || vue.book.titleShort;
            col.class += " sticky-col";
            break;

          case "bookNumbers":
            let allNumbers = _.filter(vue.book.series, "bookNumbers");
            allNumbers = _.map(allNumbers, "bookNumbers");
            allNumbers = _.flatten(allNumbers);
            if (_.isEmpty(allNumbers)) allNumbers = null;
            else if (_.isArray(allNumbers)) {
              allNumbers = allNumbers.join(", ");
            }
            col.text = vue.book.series ? (allNumbers || '∞') : '';
            break;
          
          case "isbn10":
            const isbn10 = _.find( vue.book.isbns, { type: "ISBN_10" });
            if ( isbn10 ) col.text = isbn10.identifier;
            break;
          case "isbn13":
            const isbn13 = _.find( vue.book.isbns, { type: "ISBN_13" });
            if ( isbn13 ) col.text = isbn13.identifier;
            break;

          default:
            col.text = vue.book[ key ];
            col.name = "";
            break;
        }

        if (!col.text) col.text = null;
        
        return col;
        
      });
    }
  }
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

.ale-row-inner {
  .icons-n-stuff .thumbnail-wrapper {
    display: inline-block;
    width: 27px;
    height: 27px;
  }
}
</style>
