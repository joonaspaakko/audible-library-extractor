<template>
  <div id="ale-narrators" class="box-layout-wrapper" v-if="collectionSource.length && listReady">
    <ale-search :collectionSource="collectionSource"></ale-search>
    
    <lazy
    v-for="(item, index) in $store.getters.collection"
    class="single-box"
    :data-name="item.name"
    v-if="item.name"
    :key="'narrators:'+item.name"
    >
      <router-link :to="{ name: 'narrator', params: { narrator: item.url } }">
        
        <h2>{{ item.name }}</h2>
        
        <div class="books-total" v-if="item.books && item.books.length" content="Total number of books with this narrator." v-tippy="{ placement: 'right' }">
          {{ item.books.length }}
        </div>
      
      </router-link>
    </lazy>
    
  </div>
</template>

<script>

import lazy from "@output-snippets/lazy.vue";
import aleSearch from "./aleGallery/aleSearch";
import slugify from "@output-mixins/slugify";

export default {
  name: "aleNarrators",
  components: {
    aleSearch,
    lazy,
  },
  mixins: [slugify],
  data: function() {
    return {
      collectionSource: 'pageCollection',
      listReady: false,
    };
  },

  created: function() {
    
    const vue = this;
    let narratorsCollection = [];
    let addedCounter = 1;
    
    // Processed in reverse order so that the "added" order is based on the first book added to the library of each narrator.
    _.eachRight(this.$store.state.library.books, function(book) {
      
      if (book.narrators) {
        
        _.each(book.narrators, function(narrator) {
          
          let narratorsAdded = _.find(narratorsCollection, { name: narrator.name });
          
          // Narrator not in the collection so add it with the book...
          if ( !narratorsAdded ) {
            const newSeries = {
              name: narrator.name,
              url: vue.slugify(narrator.name),
              added: addedCounter,
              books: [book.asin],
            };
            
            narratorsCollection.push( newSeries );
            ++addedCounter;
            
          }
          // Series already exists in the collection so just add the book...
          else {
            narratorsAdded.books.push( book.asin );
            return false;
          }
          
        });
      }
      
    });
    
    _.reverse( narratorsCollection );
    
    this.$store.commit("prop", { key: "pageCollection", value: narratorsCollection });
    this.updateListRenderingOptions();
    
    this.listReady = true;
    
  },
  
  methods: {
    updateListRenderingOptions: function() {
      let vue = this;
      const list = {
        scope: [
          { active: true,  key: 'name' },
          // { active: true,  key: 'bookNumbers' },
        ],
        filter: [
          
          { active: true, type: 'filterExtras', label: 'Number of books', key: 'books', range: [1, (function() {
            let narrators = _.get(vue.$store.state, vue.collectionSource);
            let max = _.maxBy( narrators, function( narrator ){ 
              if (narrator.books) return narrator.books.length;
            });
            return max ? max.books.length : 1; 
          }())], rangeMinDist: 1, rangeSuffix: '', 
          rangeMin: function() { 
            return 1; 
          }, 
          rangeMax: function() { 
            let narrators = _.get(vue.$store.state, vue.collectionSource);
            let max = _.maxBy( narrators, function( narrator ){ 
              if (narrator.books) return narrator.books.length;
            });
            return max ? max.books.length : 1; 
          }, 
          condition: function( narrator ) { 
            if ( narrator.books ) {
              let min = this.range[0];
              let max = this.range[1];
              return narrator.books.length >= min && narrator.books.length <= max; 
            } 
          } },
        ],
        sort: [
          { active: false,                 key: 'randomize', label: 'Randomize',       type: 'sortExtras', tippy: "Ignores sorting and randomizes instead unless there's an active search." },
          { type: 'divider', key: 'divider1' },
          // active: true = arrow down / descending
          { active: true,  current: true,  key: 'added',     label: 'Added',   			   type: 'sort', tippy: '<div style="text-align: left;"><small>&#9650;</small> Old at the top <br><small style="display: inline-block; transform: rotate(180deg);">&#9650;</small> New at the top</div>' },
          { active: true,  current: false, key: 'name',      label: 'Name',        		 type: 'sort' },
          { active: false,  current: false, key: 'amount',    label: 'Number of books', type: 'sort' },
        ],
      };
       
      this.$setListRenderingOpts( list );
      
    }
  },
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";
@import "~@/box-layout.scss";
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
