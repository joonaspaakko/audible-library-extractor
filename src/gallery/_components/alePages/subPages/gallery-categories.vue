<template>
  <div id="ale-categories" class="box-layout-wrapper" v-if="listReady">
    
    <gallery-page-title></gallery-page-title>
    
    <gallery-library-wishlist-switcher />
    
    <div
    class="single-box"
    :data-category="parent.name"
    v-for="(parent, parentCategoryIndex) in categories"
    :key="parent.name"
    >
    
      <h2>
        <router-link v-if="parent.slug" :to="{ name: 'category', params: { parent: parent.slug, child: undefined }, query: { subPageSource: subPageSource.name } }">
          {{ parent.name }}
        </router-link>
        <span v-else>{{ parent.name }}</span>
      </h2>

      <router-link v-if="parent.slug" class="books-total" :to="{ name: 'category', params: { parent: parent.slug, child: undefined }, query: { subPageSource: subPageSource.name } }">
        <div v-if="parent.books" v-html="parent.books.length" v-tippy="{ placement: 'right' }" content="Total number of books in this category."></div>
      </router-link>
      <div v-else-if="parent.books" v-html="parent.books.length" v-tippy="{ placement: 'right' }" content="Total number of books in this category."></div>
      
      <div class="child-categories" v-if="parent.sub">
        <div v-for="(child, index) in parent.sub" :key="child.name">
          <router-link v-if="(parent && parent.slug) && (child && child.slug)" :to="{ name: 'category', params: { parent: parent.slug, child: child.slug }, query: { subPageSource: subPageSource.name } }">
            {{ child.name }}
          </router-link>
          <span v-else></span>
          <span v-if="child.books" class="number-of-books">&nbsp;({{ child.books.length }})</span>
        </div>
      </div>
      
      <gallery-categories-page-random-thumbnails v-if="parent && parent.books" :parent="parent" :books="parent.books" :subPageSource="subPageSource" />
      
      <gallery-categories-page-tags v-if="parent.books" :parent="parent" :books="parent.books" :subPageSource="subPageSource" :parentCategoryIndex="parentCategoryIndex" />

    </div> <!-- .single-box -->
    
  </div>
</template>

<script>
import slugify from "@output-mixins/gallery-slugify.js";
import findSubPageSource from "@output-mixins/gallery-findSubPageSource.js";

export default {
  name: "aleCategories",
  mixins: [slugify, findSubPageSource],  
  data: function() {
    return {
      categories: null,
      listReady: false,
      pageTitle: 'Categories',
      pageSubTitle: null,
    };
  },
  
  methods: {
    
    makeCollection: function() {
      
      const vue = this;
      let categories = {};
      // Make category arrays
      categories.parent = [];
      _.each( vue.subPageSource.collection, function(book, index) {
        
        if ( book.categories ) {
          // Parent categories...
          const parentCategory = _.get( book, 'categories[0].name');
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
          const childCategory = _.get( book, 'categories[1].name');
          if ( childCategory ) {
            
            if ( !parentObj.sub ) parentObj.sub = [];
            
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

@import "@gallery/box-layout.scss";

.box-layout-wrapper .single-box .sample-covers img { 
  width: 100%; 
}

</style>
