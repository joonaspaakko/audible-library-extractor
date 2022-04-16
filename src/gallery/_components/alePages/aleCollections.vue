<template>
  <div id="ale-collections" class="box-layout-wrapper" v-if="collections">
    
    <page-title v-if="pageTitle || pageSubTitle" :pageTitle="pageTitle" :pageSubTitle="pageSubTitle"></page-title>
    
    <div
    class="single-box"
    v-for="(collection, index) in collections"
    :data-collection-id="collection.id"
    :key="collection.id"
    >
      <div class="sample-covers-square">
        <div
        class="sample-cover"
        v-for="(book, index) in getRandomBooks(collection.books, 4)"
        :key="book.asin"
        >
          <router-link :to="{ 
          name: 'collection', 
          params: { collection: collection.id },
          query: { book: book.asin }
          }">
            <img crossorigin="anonymous" :src="makeCoverUrl(book.cover)" alt="" />
          </router-link>
        </div>
      </div>
    
      <router-link class="collection-title" :to="{ name: 'collection', params: { collection: collection.id } }">
        <h2>
            {{ collection.title }}
        </h2>
      </router-link>

      <router-link v-if="collection.books && collection.books.length" class="books-total" :to="{ name: 'collection', params: { collection: collection.id } }" >
        <div v-html="collection.books.length" v-tippy="{ placement: 'right' }" content="Total number of books in this collection."></div>
      </router-link>
      
    </div> <!-- .single-box -->
    
  </div>
</template>

<script>
import slugify from "@output-mixins/slugify";
import makeCoverUrl from "@output-mixins/makeCoverUrl";
import pageTitle from "@output-snippets/page-title.vue";

export default {
  name: "aleCategories",
  mixins: [slugify, makeCoverUrl],components: { 
    pageTitle,
  },
  data: function() {
    return {
      collections: null,
      pageTitle: null,
      pageSubTitle: null,
    };
  },
  
  created: function() {
    
    this.pageTitle = 'Collections';
    this.pageSubTitle = null;
    
    const vue = this;
    let collections = [];
    _.each( this.$store.state.library.collections, function( collection ) {
      
      let newCollection = {
        id: collection.id,
        title: collection.title,
      };
      
      newCollection.books = _.filter( vue.$store.state.library.books, function( book ) {
        return _.includes( collection.books, book.asin );
      });
      
      collections.push( newCollection );
      
    });
    
    // Make sure favorites are always at the top
    this.collections = _.orderBy(collections, function( o ) { return o.title; }, "asc");
    
    this.$store.commit("prop", [
      { key: "pageCollection", value: [] }, 
      { key: "mutatingCollection", value: [] }
    ]);
    
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

.single-box {
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  padding: 0px !important;
  margin-top: 20px !important;
  &:first-child { margin-top: 0 !important; }
}

.sample-covers-square {
  @include themify($themes) { border: 1px solid rgba( themed(frontColor), .1); }
  border-radius: 11px;
  overflow: hidden;
  width: 80px;
  height: 80px;
  display: inline-block;
  .sample-cover {
    float: left;
    width: 50%;
    height: 50%;
    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
}


.collection-title {
  display: inline-block;
  align-self: stretch;
  flex: 1;
  display: flex;
  justify-content: flex-start;
  justify-items: flex-start;
  align-content: center;
  align-items: center;
  padding: 10px 30px;
  h2 { 
    margin: 0 !important; 
    font-size: 22px !important;
    line-height: 23px !important;
  }
  
}

.books-total { top: unset !important; }

</style>
