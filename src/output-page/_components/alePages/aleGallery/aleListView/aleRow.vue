<template>
  <tr class="ale-row-inner">
    <td
      v-for="col in columns"
      :key="col.key"
      class="ale-col"
      :class="col.class"
      :name="col.name"
    >
      <div class="ale-col-inner">
        <span v-if="col.key === 'title'" class="icons-n-stuff">
          <span class="info-icon"
            ><font-awesome fas icon="chevron-down" class="pointer"
          /></span>
          <sampleButton
            :book="book"
            :index="rowIndex"
            :size="16"
          ></sampleButton>
          <!-- Just not incredibly performant -->
          <!-- <div class="thumbnail-wrapper">
            <img v-if="!imageLoading" :src="coverUrl27" alt="">
          </div> -->
        </span>

        <span class="text-container"> {{ col.text || "&nbsp" }}</span>
      </div>
    </td>

    <tippy
      v-if="book.title"
      :to="'rowTippy-' + book.asin"
      :arrow="false"
      maxWidth="800"
      placement="top-start"
      :theme="general.tippyTheme"
      :interactive="true"
      trigger="focus"
      :hideOnClick="false"
      @show="onShow"
      @hide="onHide"
    >
      <div class="tippy-content-wrapper" v-if="!tippyLoading">
        <div class="book-cover">
          <a :href="bookUrl" target="_blank">
            <img :src="coverUrl" alt="" />
          </a>
        </div>
        <div class="book-information">
          <div class="corner-actions">
            <favorite-book
              :size="25"
              :book="book"
              :general="general"
            ></favorite-book>
            <sampleButton
              :size="25"
              :book="book"
              :index="rowIndex"
            ></sampleButton>
            <good-reads-link
              :size="25"
              :book="book"
              :general="general"
              :icon="true"
            ></good-reads-link>
          </div>

          <h2 class="title">
            <a :href="bookUrl">
              {{ bookTitle }}
            </a>
          </h2>

          <book-basic-info :book="book" :general="general"></book-basic-info>

          <div class="summary" v-html="book.blurb"></div>
        </div>
      </div>
    </tippy>
  </tr>
</template>

<script>
import makeCoverUrl from "@output-mixins/makeCoverUrl";
import stringifyArray from "@output-mixins/stringifyArray";
import makeFullUrl from "@output-mixins/makeFullUrl";

import goodReadsLink from "@output-comps/snippets/goodReadsLink";
import favoriteBook from "@output-comps/snippets/favoriteBook";
import sampleButton from "@output-comps/snippets/sampleButton";
import bookBasicInfo from "@output-comps/snippets/book-basic-info";

export default {
  name: "aleListItem",
  props: ["book", "general", "rowIndex", "keys"],
  mixins: [stringifyArray, makeCoverUrl, makeFullUrl],
  components: {
    goodReadsLink,
    favoriteBook,
    sampleButton,
    bookBasicInfo
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
      tippyLoading: true
    };
  },

  created: function() {
    this.bookUrl = this.makeFullUrl(this.book.url);
    this.coverUrl = this.makeCoverUrl(this.book.cover);
    if (this.coverUrl)
      this.coverUrl27 = this.coverUrl.replace("_SL500_", "_SL27_");
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
    onShow: function(instance) {
      const vue = this;
      vue.tippyLoading = false;
      this.$emit("updateTippyEl", instance);
    },
    onHide: function() {
      // this.$emit('updateTippyEl', null);
    },

    prepareColumns: function() {
      const vue = this;
      return _.map(this.keys, function(key) {
        const col = {};

        col.key = key;
        col.class = "col-" + _.kebabCase(key);

        switch (key) {
          case "authors":
          case "narrators":
          case "categories":
          case "series":
          case "publishers":
            col.text = vue.stringifyArray(
              vue.book[key],
              "name",
              key === "categories" ? " > " : null
            );
            break;

          case "title":
            // col.name = 'rowTippy-'+vue.book.asin;
            col.text = vue.bookTitle;
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
            col.text = allNumbers;
            break;

          default:
            col.text = vue.book[key];
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

.tippy-content-wrapper {
  display: flex;
  flex-direction: row;
  padding: 7+5px 7+1px;
  > div {
    padding-left: 20px;
    &:first-child {
      padding-left: 0;
    }
  }
  .book-cover {
    position: relative;
    z-index: 0;
    img {
      width: 150px;
    }
  }
  .book-information {
    max-width: 750px;
    text-align: left;
    .title {
      margin: 0px;
      margin-bottom: 10px;
      font-size: 1.2em;
    }
    .summary {
      margin-top: 10px;
    }
  }

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
}

.ale-row-inner {
  .icons-n-stuff .thumbnail-wrapper {
    display: inline-block;
    width: 27px;
    height: 27px;
  }
}
</style>
