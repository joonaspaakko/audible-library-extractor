<template>
  <div id="ale-collections" class="box-layout-wrapper" v-if="collections">
    
    <page-title v-if="pageTitle || pageSubTitle" :pageTitle="pageTitle" :pageSubTitle="pageSubTitle"></page-title>
    
    <!-- 
      Lazified this just in case some user is one of those people who make collections for every series.
      I don't really see people having like over 50 collections otherwise.
    -->
    <lazy
    :tag="collection.isSpecial ? 'span' : 'div'"
    class="single-box"
    v-for="(collection, index) in collections"
    :data-collection-id="collection.id"
    :key="collection.id"
    :class="{ 'is-special': collection.isSpecial }"
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
      
    </lazy> <!-- .single-box -->
    
  </div>
</template>

<script>
import slugify from "@output-mixins/slugify";
import makeCoverUrl from "@output-mixins/makeCoverUrl";
import pageTitle from "@output-snippets/page-title.vue";
import lazy from "@output-snippets/lazy.vue";

export default {
  name: "aleCategories",
  mixins: [slugify, makeCoverUrl],
  components: { 
    pageTitle,
    lazy
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
        isSpecial: vue.isSpecial(collection),
      };
      
      newCollection.books = _.filter( vue.$store.state.library.books, function( book ) {
        return _.includes( collection.books, book.asin );
      });
      
      collections.push( newCollection );
      
    });
    
    // "Special" Audible created collections bubble to the top.
    // After that it's alphabetical sorting based on the title.
    // TODO: Should've maybe split collections to 2 arrays so it'd be easier to handle the special boys.
    this.collections = _.orderBy(collections, [
      function( o ) { return vue.isSpecial(o) },
      'title',
    ], 
    [
      "desc",
      "asc",
    ]);
    
    this.$store.commit("prop", [
      { key: "pageCollection", value: [] }, 
      { key: "mutatingCollection", value: [] }
    ]);
    
  },

  methods: {
    getRandomBooks: function(books, number) {
      return _.sampleSize(books, number);
    },
    isSpecial( obj ) {
      return _.get(obj,'id','').indexOf('__') === 0;
    },
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
  min-height: 82px;
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

.single-box { position: relative; z-index: 0; };
.is-special { display: flex; }
span:last-of-type {
  margin-bottom: 62px;
  &:after {
    content: '';
    position: absolute;
    z-index: 0;
    bottom: -33px;
    height: 2px;
    width: 100%;
    @include themify($themes) {
      background: rgba(themed(frontColor), .25);
    }
  }
}

</style>
