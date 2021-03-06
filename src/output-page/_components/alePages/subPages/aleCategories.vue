<template>
  <div id="ale-categories" class="box-layout-wrapper" v-if="listReady">
    
    <page-title v-if="pageTitle || pageSubTitle" :pageTitle="pageTitle" :pageSubTitle="pageSubTitle"></page-title>
    
    <library-wishlist-switcher />
    
    <div
    class="single-box"
    :data-category="parent.name"
    v-for="(parent, index) in categories"
    :key="parent.name"
    v-if="parent && parent.name"
    >
    
      <h2>
        <router-link v-if="parent.slug" :to="{ name: 'category', params: { parent: parent.slug }, query: { subPageSource: subPageSource.name } }">
          {{ parent.name }}
        </router-link>
        <span v-else>{{ parent.name }}</span>
      </h2>

      <router-link v-if="parent.slug" class="books-total" :to="{ name: 'category', params: { parent: parent.slug }, query: { subPageSource: subPageSource.name } }">
        <div v-if="parent.books" v-html="parent.books.length"v-tippy="{ placement: 'right' }" content="Total number of books in this category."></div>
      </router-link>
      <div v-else-if="parent.books" v-html="parent.books.length"v-tippy="{ placement: 'right' }" content="Total number of books in this category."></div>
      
      <div class="child-categories" v-if="parent.sub">
        <div v-for="(child, index) in parent.sub" :key="child.name" v-if="child && child.name">
          <router-link v-if="(parent && parent.slug) && (child && child.slug)" :to="{ name: 'category', params: { parent: parent.slug, child: child.slug }, query: { subPageSource: subPageSource.name } }">
            {{ child.name }}
          </router-link>
          <span v-else></span>
          <span v-if="child.books" class="number-of-books">({{ child.books.length }})</span>
        </div>
      </div>
      
      <div class="sample-covers">
        <div
        class="sample-cover"
        v-if="parent && parent.books"
        v-for="(book, index) in getRandomBooks(parent.books, 5)"
        :key="book.asin"
        >
          <router-link :to="{ 
            name: 'category', 
            params: { 
              parent: book.categories[0] ? slugify(book.categories[0].name) : null, 
              child:  book.categories[1] ? slugify(book.categories[1].name) : null 
            }, 
            query: { book: book.asin, subPageSource: subPageSource.name }
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
import pageTitle from "@output-snippets/page-title.vue";
import libraryWishlistSwitcher from "@output-snippets/library-wishlist-switcher.vue";
import findSubPageSource from "@output-mixins/findSubPageSource.js";

export default {
  name: "aleCategories",
  mixins: [slugify, makeCoverUrl, findSubPageSource],
  components: { 
    pageTitle,
    libraryWishlistSwitcher,
  },
  
  data: function() {
    return {
      categories: null,
      listReady: false,
      pageTitle: 'Categories',
      pageSubTitle: null,
    };
  },
  
  methods: {
    
    getRandomBooks: function(books, number) {
      let booksWithCategories = _.filter(books, function( book ) { return (book.categories && book.categories.length > 1) && book.cover });
      return _.sampleSize(booksWithCategories, number);
    },
    
    makeCollection: function() {
      
      const vue = this;
      let categories = {};
      // Make category arrays
      categories.parent = [];
      _.each( vue.subPageSource.collection, function(book, index) {
        
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
      
      this.listReady = true;
      
    },
    
  }
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";
@import "~@/box-layout.scss";

.box-layout-wrapper .single-box .sample-covers img { 
  width: 100%; 
}

</style>
