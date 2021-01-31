<template>
  <div id="ale-categories" class="box-layout-wrapper" v-if="categories">
    
    <div
    class="single-box"
    :data-category="parent.name"
    v-for="(parent, index) in categories"
    :key="parent.name"
    >
    
      <h2>
        <router-link :to="{ name: 'category', params: { parent: parent.slug } }">
          {{ parent.name }}
        </router-link>
      </h2>

      <router-link class="books-total" :to="{ name: 'category', params: { parent: parent.slug } }">
        <div v-html="parent.books.length"v-tippy="{ placement: 'right' }" content="Total number of books in this category."></div>
      </router-link>

      <div class="child-categories">
        <div v-for="(child, index) in parent.sub" :key="child.name">
          <router-link :to="{ name: 'category', params: { parent: parent.slug, child: child.slug } }">
            {{ child.name }}
          </router-link>
          <span class="number-of-books">({{ child.books.length }})</span>
        </div>
      </div>
      
      <!-- FIXME: on mobile the covers that get squished are cropped...
       -->
      <div class="sample-covers">
        <div
        class="sample-cover"
        v-for="(book, index) in getRandomBooks(parent.books, 5)"
        :key="book.asin"
        >
          <router-link :to="{ 
            name: 'category', 
            params: { 
              parent: book.categories ? slugify(book.categories[0].name) : null, 
              child: book.categories ? slugify(book.categories[1].name) : null 
            }, 
            query: { book: book.asin } 
          }">
            <img :src="makeCoverUrl(book.cover)" alt="" />
          </router-link>
        </div>
      </div>
      
    </div> <!-- .single-box -->
    
  </div>
</template>

<script>
import slugify from "@output-mixins/slugify";
import makeCoverUrl from "@output-mixins/makeCoverUrl";

export default {
  name: "aleCategories",
  mixins: [slugify, makeCoverUrl],
  
  data: function() {
    return {
      categories: null,
    };
  },
  
  created: function() {

    const vue = this;
    let categories = {};
    // Make category arrays
    categories.parent = [];
    _.each( this.$store.state.library.books, function(book, index) {
      if (book.categories) {
        // Parent categories...
        const parentCategory = book.categories[0].name;
        // If parent category object doesn't exist, make it
        let parentObj = _.find(categories.parent, ["name", parentCategory]);
        if (!parentObj) {
          parentObj = categories.parent.push({
            name: parentCategory,
            slug: vue.slugify(parentCategory),
            books: []
          });
        }
        parentObj = _.find(categories.parent, ["name", parentCategory]);
        // Push books to array
        parentObj.books.push(book);

        // Child categories...
        if (book.categories[1]) {
          if (!parentObj.sub) parentObj.sub = [];
          const childCategory = book.categories[1].name;
          // If child category object doesn't exist, make it
          let childObj = _.find(parentObj.sub, ["name", childCategory]);
          if (!childObj) {
            childObj = parentObj.sub.push({
              name: childCategory,
              slug: vue.slugify(childCategory),
              books: []
            });
          }
          childObj = _.find(parentObj.sub, ["name", childCategory]);
          // Push books to array
          childObj.books.push(book);
        }
      }
    });

    // Sort all category arrays
    categories.parent = _.orderBy(categories.parent, "name", "asc");
    _.each(categories.parent, function(category, index) {
      category.sub = _.orderBy(category.sub, "name", "asc");
    });
    
    this.categories = categories.parent;
    this.$store.commit("prop", { key: "pageCollection", value: [] });
    this.$store.commit("prop", { key: "mutatingCollection", value: [] });
    
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
