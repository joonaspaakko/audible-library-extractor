<template>
  <div id="ale-series" class="box-layout-wrapper">
    <ale-search :collectionSource="collectionSource"></ale-search>
    <lazy
    v-for="(item, index) in $store.getters.collection"
    class="single-box"
    :data-asin="item.asin"
    :key="'series:'+item.asin"
    >
      <router-link :to="{ name: 'series', params: { series: item.asin } }">
        
        <h2>{{ item.name }}</h2>

        <div class="books-total" v-if="item.books && item.books.length" content="Total number of books I have in this series." v-tippy="{ placement: 'right' }">
          {{ item.books.length }}
        </div>
      
      </router-link>
    </lazy>
    
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
      collectionSource: 'pageCollection',
    };
  },

  created: function() {
    
    const vue = this;
    let seriesCollection = [];
    let addedCounter = 1;
    
    let librarySeries = this.$store.state.library.series;
    
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
            
            // Only add if it's in the library series array as well...
            if ( _.find( librarySeries, { asin: series.asin }) ) {
              ++addedCounter;
              seriesCollection.push( newSeries );
            }
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
      let vue = this;
      const list = {
        scope: [
          { active: true,  key: 'name' },
          // { active: true,  key: 'bookNumbers' },
        ],
        filter: [
          // { active: false,  type: 'filterExtras', label: 'Books 1',    key: 'series1', group: 'radioHead',   condition: function( series ) { return series.books.length === 1; }},
          // { active: false,  type: 'filterExtras', label: 'Books > 1',  key: 'series-1',  group: 'radioHead', condition: function( series ) { return series.books.length > 1; }},
          // { active: false, type: 'filterExtras', label: 'Books > 5',  key: 'series-5',  group: 'radioHead', condition: function( series ) { return series.books.length > 5; }},
          // { active: false, type: 'filterExtras', label: 'Books > 10', key: 'series-10', group: 'radioHead', condition: function( series ) { return series.books.length > 10; }},
          // { active: false, type: 'filterExtras', label: 'Books > 20', key: 'series-20', group: 'radioHead', condition: function( series ) { return series.books.length > 20; }},
          // { active: false, type: 'filterExtras', label: 'Books > 30', key: 'series-30', group: 'radioHead', condition: function( series ) { return series.books.length > 30; }},
          
          
          
          // FIXME: series page not showing up initially.........?? only after you meddle with the filters...
          
          { active: true, type: 'filterExtras', label: 'Books in series', key: 'inSeries', range: [1, (function() {
            let series = _.get(vue.$store.state, vue.collectionSource);
            let max = _.maxBy( series, function( series ){ 
              if (series.books) return series.books.length;
            });
            return max ? max.books.length : 1; 
          }())], rangeMinDist: 1, rangeSuffix: '', 
          rangeMin: function() { 
            return 1; 
          }, 
          rangeMax: function() { 
            let series = _.get(vue.$store.state, vue.collectionSource);
            let max = _.maxBy( series, function( series ){ 
              if (series.books) return series.books.length;
            });
            return max ? max.books.length : 1; 
          }, 
          condition: function( series ) { 
            if ( series.books ) {
              let min = this.range[0];
              let max = this.range[1];
              console.log( min, series.books.length, max, this )
              return series.books.length >= min && series.books.length <= max; 
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
