<template>
  <div id="ale-collections" class="box-layout-wrapper" v-if="collections">
    
    <gallery-page-title></gallery-page-title>
    
    <div class="hide-premade-btn-wrapper">
      <div @click="$store.commit('prop', { key: 'sticky.collectionsHidePremade', value: !$store.state.sticky.collectionsHidePremade })">
        {{ $store.state.sticky.collectionsHidePremade ? 'show' : 'hide' }} premade collections
      </div>
    </div>
    
    <div v-for="chunk in filteredCollections" :key="chunk.key" :class="[ chunk.key + '-collection' ]">
      
      <!-- 
        Lazified this just in case some user is one of those people who make collections for every series.
        I don't really see people having like over 50 collections otherwise.
      -->
      <gallery-lazy
        :tag="collection.isSpecial ? 'span' : 'div'"
        class="single-box"
        v-for="(collection, index) in chunk.items"
        :data-collection-id="collection.id"
        :key="collection.id"
        :class="{ 'is-special': collection.isSpecial }"
      >
        <div class="sample-covers-square">
          <div
          class="sample-cover"
          v-for="book in getRandomBooks(collection.books, 4)"
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
        
      </gallery-lazy> <!-- .single-box -->
      
    </div>
    
    
  </div>
</template>

<script>
import slugify from "@output-mixins/gallery-slugify.js";
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";

export default {
  name: "aleCollections",
  mixins: [slugify, makeCoverUrl],
  data: function() {
    return {
      collections: null,
      pageTitle: null,
      pageSubTitle: null,
    };
  },
  
  computed: {
    
    filteredCollections() {
      const vue = this;
      const array = _.filter( this.collections, function( chunk ) {
        if ( chunk.key === 'audible' ) {
          return !vue.$store.state.sticky.collectionsHidePremade
        }
        else {
          return true;
        }
      });
      return array;
    },
    
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
    collections = _.orderBy(collections, [
      function( o ) { return vue.isSpecial(o) },
      'title',
    ], 
    [
      "desc",
      "asc",
    ]);
    
    this.collections = this.chunkify(collections);
    
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
    
    chunkify( collections ) {
      
      const specialBoysLength = _.filter( collections, { isSpecial: true }).length;
      const specialBoysChunk = collections.splice(0, specialBoysLength);
      
      return [
        {
          key: 'audible',
          items: specialBoysChunk,
        },
        {
          key: 'user',
          items: collections,
        },
      ];
      
    },
    
  }
};
</script>

<style lang="scss" scoped>

@import "@gallery/box-layout.scss";

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
  @include themify($themes) { 
    border: 1px solid rgba( themed(frontColor), .1); 
    background: rgba( themed(backColor), .5);
  }
  border-radius: 11px;
  overflow: hidden;
  width: 80px;
  height: 80px;
  min-width: 80px;
  min-height: 80px;
  display: inline-block;
  position: relative;
  .sample-cover {
    float: left;
    width: 50%;
    height: 50%;
    padding: 3px;
    box-sizing: border-box;
    img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 6px;
      overflow: hidden;
      &:hover {
        position: absolute;
        top   : 0px;
        right : 0px;
        bottom: 0px;
        left  : 0px;
        padding: 2px;
        box-sizing: border-box;
        border-radius: 11px;
        overflow: hidden;
      }
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
.audible-collection {
  position: relative;
  margin-bottom: 62px;
  &:after {
    content: '';
    position: absolute;
    z-index: 0;
    right: 0;
    bottom: -33px;
    left: 0;
    height: 2px;
    @include themify($themes) {
      background: rgba(themed(frontColor), .25);
    }
  }
}

.hide-premade-btn-wrapper {
  @include themify($themes) {
    // position: relative;
    // z-index: 0;
    // height: 10px;
    text-align: right;
    > div {
      // position: absolute;
      // top: -30px;
      // right: 0px;
      display: inline-block;
      @extend .no-selection;
      cursor: pointer;
      background: themed(backColor);
      color: themed(frontColor);
      padding: 4px 12px;
      margin-bottom: 15px;
      border-radius: 5px;
      border: 1px solid rgba( themed(frontColor), .3);
      font-weight: bold;
    }
  }
}



.theme-dark .hide-premade-btn-wrapper > div {
  background: lighten(rgba( #121517, .98 ), 5);
  box-shadow: $shadowMedium rgba(0,0,0,0.45);
  color: $darkFrontColor;
  border: 1px solid rgba( lighten( $darkBackColor, 62), .25 );
}
.theme-light .hide-premade-btn-wrapper > div {
  background: rgba( lighten( $lightBackColor, 5), .98 );
  box-shadow: $shadowSmall  rgba(0,0,0,0.2), $shadowMedium  rgba(0,0,0,0.2);
  color: $lightFrontColor;
  border: 1px solid rgba( $lightFrontColor, .25 );
}

</style>
