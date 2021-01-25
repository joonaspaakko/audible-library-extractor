<template>
  <div id="ale-series" class="box-layout-wrapper">
    
    <ale-search collectionSource="pageCollection">
      
      <lazy
      v-for="(item, index) in $store.getters.collection"
      class="single-box"
      :data-asin="item.asin"
      :key="'series:'+item.asin"
      >
        <h2>
          <router-link :to="{ name: 'series', params: { series: item.asin } }">
            {{ item.name }}
          </router-link>
        </h2>

        <router-link class="child-category" :to="{ name: 'series', params: { series: item.asin } }">
          <div class="books-total" v-if="item.books && item.books.length" content="Total number of books I have in this series." v-tippy="{ placement: 'right' }">
            {{ item.books.length }}
          </div>
        </router-link>
        
      </lazy>
      
    </ale-search>
    
  </div>
</template>

<script>

import lazy from "@output-snippets/lazy.vue";
import aleSearch from "./aleGallery/aleSearch";

export default {
  name: "aleSeries",
  components: {
    aleSearch,
    lazy,
  },
  data: function() {
    return {
      series: null,
    };
  },

  created: function() {
    
    const vue = this;
    const seriesCollection = [];
    let addedCounter = 1;
    // Processed in reverse order so that the "added" order is based on the first book added to the library of each series.
    _.eachRight(this.$store.state.library.books, function(book) {
      
      if (book.series) {
        
        _.each(book.series, function(series) {
          
          const seriesAdded = _.find(seriesCollection, { asin: series.asin });
          
          // Series not in the collection so add it with the book...
          if ( !seriesAdded ) {
            const newSeries = {
              name: series.name,
              asin: series.asin,
              added: addedCounter,
              books: [ book ],
            };
            ++addedCounter;
            seriesCollection.push( newSeries );
          }
          // Series already exists in the collection so just add the book...
          else {
            seriesAdded.books.push( book );
            return false;
          }
          
        });
      }
      
    });
    
    _.reverse( seriesCollection );
    
    this.$store.commit("prop", { key: "pageCollection", value: seriesCollection });
    this.updateListRenderingOptions();
    
  },
  
  methods: {
    updateListRenderingOptions: function() {
      const list = {
        scope: [
          { active: true,  key: 'name' },
          // { active: true,  key: 'bookNumbers' },
        ],
        filter: [
          { active: true, type: 'filter', label: 'Books 1',    key: 'series1',   condition: function( series ) { return series.books.length <= 1; }},
          { active: true, type: 'filter', label: 'Books > 1',  key: 'series>1',  condition: function( series ) { return series.books.length >= 2; }},
          { active: true, type: 'filter', label: 'Books > 5',  key: 'series>5',  condition: function( series ) { return series.books.length >= 5; }},
          { active: true, type: 'filter', label: 'Books > 10', key: 'series>10', condition: function( series ) { return series.books.length >= 10; }},
          { active: true, type: 'filter', label: 'Books > 20', key: 'series>20', condition: function( series ) { return series.books.length >= 20; }},
          { active: true, type: 'filter', label: 'Books > 30', key: 'series>30', condition: function( series ) { return series.books.length >= 30; }},
        ],
        sort: [
          { active: false,                 key: 'randomize', label: 'Randomize',       type: 'sortExtras', tippy: "Ignores sorting and randomizes instead unless there's an active search." },
          { key: 'divider' },
          // active: true = arrow down / descending
          { active: true,  current: true,  key: 'added',     label: 'Added',   			   type: 'sort', tippy: 'Arrow down = new first <br/> Arrow up = old first' },
          { active: true,  current: false, key: 'name',      label: 'Name',        		 type: 'sort' },
          { active: true,  current: false, key: 'amount',    label: 'Number of books', type: 'sort' },
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
  padding: 10px 14px !important;
    margin-top: 10px !important; 
  h2 { 
    margin-bottom: 0 !important; 
    font-size: 1.35em !important;
    line-height: 1.4em !important;
  }
  .books-total {
    width: 25px !important;
    height: 25px !important;
    line-height: 25px !important;
    top: 7px !important;
  }
}
</style>
