<template>
  <div id="ale-authors" class="box-layout-wrapper" v-if="listReady" :style="optionsOpenMargin" ref="wrapper">
    <gallery-search :collectionSource="collectionSource"></gallery-search>
    
    <div :style="galleryStyle" class="page-content">
      <gallery-lazy
        v-for="(item, index) in $store.getters.collection"
        class="single-box"
        :data-name="item.name"
        :key="'authors:'+item.name"
      >
        <router-link :to="{ name: 'author', params: { author: item.url }, query: { subPageSource: subPageSource.name } }">
          
          <h2>{{ item.name }}</h2>
          
          <div class="books-total" v-if="item.books && item.books.length" content="Total number of books with this author." v-tippy="{ placement: 'right' }">
            {{ item.books.length }}
          </div>
        
        </router-link>
      </gallery-lazy>
    </div>
    
  </div>
</template>

<script>

import slugify from "@output-mixins/gallery-slugify.js";
import findSubPageSource from "@output-mixins/gallery-findSubPageSource.js";

export default {
  name: "aleAuthors",
  mixins: [slugify, findSubPageSource],
  data: function() {
    return {
      collectionSource: 'pageCollection',
      listReady: false,
      pageTitle: 'Authors',
      pageSubTitle: null,
    };
  },
  
  computed: {
    optionsOpenMargin: function() {
      
      if ( this.$store.state.searchOptOpenHeight ) {
        
        return {
          marginBottom: 0
        };
        
      }
      else {
        return false;
      }
      
    },
    galleryStyle: function() {
      
      if ( this.$store.state.searchOptOpenHeight ) {
        
        return {
          overflow: 'hidden',
          height: this.$store.state.searchOptOpenHeight- (this.$refs.wrapper.offsetTop*2) + 'px',
        };
        
      }
      else {
        return false;
      }
      
    },
  },
  
  methods: {
    
    makeCollection: function() {
      
      const vue = this;
      let authorsCollection = [];
      let addedCounter = 1;
      
      // Processed in reverse order so that the "added" order is based on the first book added to the library of each author.
      _.eachRight(vue.subPageSource.collection, function(book) {
        if ( book.authors ) {
          
          _.each(book.authors, function(author) {
            if ( author.name && author.url ) {
              
              let authorsAdded = _.find(authorsCollection, { name: author.name });
              
              // Author not in the collection so add it with the book...
              if ( !authorsAdded ) {
                const newSeries = {
                  name: author.name,
                  url: author.url,
                  added: addedCounter,
                  books: [ book.title || book.shortTitle ],
                  narrators: book.narrators,
                  publishers: book.publishers,
                  series: book.series,
                };
                
                authorsCollection.push( newSeries );
                ++addedCounter;
                
              }
              // Series already exists in the collection so just add the book...
              else {
                authorsAdded.books.push( book.title || book.shortTitle );
                return false;
              }
              
            }
          });
          
        }
      });
      
      _.reverse( authorsCollection );
      
      this.$store.commit("prop", { key: "pageCollection", value: authorsCollection });
      this.updateListRenderingOptions();
      
      this.listReady = true;
      
    },
    
    updateListRenderingOptions: function() {
      let vue = this;
      const list = {
        scope: [
          { active: true,  key: 'name', tippy: 'Search authors by name', weight: 5 },
          { active: true,  key: 'books', tippy: 'Search authors by book titles', weight: 1 },
          { active: true,  key: 'narrators.name', tippy: 'Search authors by narrators', weight: 1 },
          { active: true,  key: 'publishers.name', tippy: 'Search authors by publishers', weight: 1 },
          { active: true,  key: 'series.name', tippy: 'Search authors by series', weight: 1 },
        ],
        filter: [
          { active: false, type: 'filterExtras', label: 'Number of books', key: 'books', range: [1, (function() {
            let authors = _.get(vue.$store.state, vue.collectionSource);
            let max = _.maxBy( authors, function( author ){ 
              if (author.books) return author.books.length;
            });
            return max ? max.books.length : 1; 
          }())], rangeMinDist: 0, rangeSuffix: '', 
          rangeMin: function() { 
            return 1; 
          }, 
          rangeMax: function() { 
            let authors = _.get(vue.$store.state, vue.collectionSource);
            let max = _.maxBy( authors, function( author ){ 
              if (author.books) return author.books.length;
            });
            return max ? max.books.length : 1; 
          }, 
          condition: function( author ) { 
            if ( author.books ) {
              let min = this.range[0];
              let max = this.range[1];
              return author.books.length >= min && author.books.length <= max; 
            } 
          } },
        ],
        sort: [
          { active: false,                 key: 'randomize', label: 'Randomize',       type: 'sortExtras', tippy: "Ignores sorting and randomizes instead unless there's an active search." },
          { type: 'divider', key: 'divider1' },
          // active: true = arrow down / descending
          { active: true,  current: true,  key: 'added',     label: 'Added',   			   type: 'sort', tippy: '<div style="text-align: left;"><small>&#9650;</small> Old at the top <br><small style="display: inline-block; transform: rotate(180deg);">&#9650;</small> New at the top</div>' },
          { active: true,  current: false, key: 'name',      label: 'Name',        		 type: 'sort', tippy: "Sort by author's name" },
          { active: false,  current: false, key: 'amount',    label: 'Number of books', type: 'sort' },
        ],
      };
       
      this.$setListRenderingOpts( list );
      
    }
  },
};
</script>

<style lang="scss" scoped>

@import "@gallery/box-layout.scss";
.single-box {
  min-height: 35px !important;
  display: flex !important;
  align-content: center !important;
  align-items: center !important;
  padding: 0px !important;
  margin-top: 5px !important; 
  > a {
    padding: 7px 14px !important;
    display: inline-block !important; 
    width: 100%;
    box-sizing: border-box;
  }
  h2 { 
    display: inline-block;
    width: 100%;
    margin-bottom: 0 !important; 
    font-size: 1.20em !important;
    line-height: 1.30em !important;
  }
  .books-total {
    width: 23px !important;
    height: 23px !important;
    line-height: 23px !important;
    font-size: .9em !important;
    top: unset !important;
    border-width: 2px !important;
    top: 4px !important;
    right: 4px !important;
  }
}
</style>
