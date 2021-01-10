<template>
  <div id="ale-categories" class="box-layout-wrapper" v-if="general.categories">
    <div
      class="single-box"
      :data-category="parent.name"
      v-for="(parent, index) in general.categories.parent"
      :key="parent.name"
    >
      <h2>
        <router-link
          :to="{
            name: 'ale-category',
            params: { parent: parent.slug }
          }"
        >
          {{ parent.name }}
        </router-link>
      </h2>

      <router-link
        :to="{
          name: 'ale-category',
          params: { parent: parent.slug }
        }"
      >
        <div
          class="books-total"
          v-html="parent.books.length"
          content="Total number of books in this category."
          v-tippy="{
            placement: 'right',
            arrow: true,
            theme: general.tippyTheme
          }"
        ></div>
      </router-link>

      <div class="child-categories">
        <div v-for="(child, index) in parent.sub" :key="child.name">
          <router-link
            :to="{
              name: 'ale-category',
              params: { parent: parent.slug, child: child.slug }
            }"
          >
            {{ child.name }}
          </router-link>
          <span class="number-of-books">({{ child.books.length }})</span>
        </div>
      </div>
      <div class="sample-covers">
        <div
          class="sample-cover"
          v-for="(book, index) in getRandomBooks(parent.books, 5)"
          :key="book.asin"
        >
          <router-link
            :to="{
              name: 'ale-category',
              params: {
                parent: book.categories
                  ? slugify(book.categories[0].name)
                  : null,
                child: book.categories ? slugify(book.categories[1].name) : null
              },
              query: {
                book: book.asin
              }
            }"
          >
            <img :src="makeCoverUrl(book.cover)" alt="" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import slugify from "../../_mixins/slugify";
import buildCategories from "../../_mixins/buildCategories";
import makeCoverUrl from "../../_mixins/makeCoverUrl";

export default {
  name: "aleCategories",
  mixins: [slugify, buildCategories, makeCoverUrl],
  props: ["library", "general"],

  created: function() {
    this.general.categories = this.buildCategories();
  },

  methods: {
    getRandomBooks: function(books, number) {
      return _.sampleSize(books, number);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";
@import "~@/box-layout.scss";
</style>
