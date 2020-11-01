<template>
  <div id="ale-series" class="box-layout-wrapper" v-if="series" >
    
    <div class="single-box" v-for="(item, index) in series" :key="item.asin" :data-asin="item.asin">
      <h2>
        
        <router-link :to="{ 
          name: 'ale-series', 
          params: { series: item.asin } 
        }">
          {{ item.name }}
        </router-link> 
        
      </h2>
      
        <router-link class="child-category" :to="{ 
          name: 'ale-series', 
          params: { series: item.asin } 
        }">
          <div class="books-total" v-html="item.books.length" content="Total number of books I have in this series." v-tippy="{ placement: 'right',  arrow: true, theme: general.tippyTheme }"></div>
        </router-link>
    </div>
    
  </div>
</template>


<script>

import slugify from '../../_mixins/slugify'
import makeCoverUrl from '../../_mixins/makeCoverUrl'

export default {
  name: 'aleSeries',
  mixins: [ slugify, makeCoverUrl, ],
  props: ['library', 'general'],
  data: function() {
    return {
      series: null
    }
  },
  
  created: function() {
    
		const seriesCollection = [];
    _.each(this.library.books, function( book, index ) {
      if ( book.series ) {
        _.each( book.series, function( series, index ) {
          
          const foundSeries = _.find(seriesCollection, ['asin', series.asin]);
          // Series already exists in the collection so just add the book...
          if ( foundSeries ) {
            foundSeries.books.push( book );
          }
          // Series not in the collection so add it with the book...
          else {
            const newSeries = _.clone( series );
            newSeries.books = [ book ];
            seriesCollection.push( newSeries );
          }
          
        });
        
        
      }
    });
    
  
    // Sort series by name    
    this.series = _.orderBy(seriesCollection, 'name', 'asc');
    
    console.log( this.series );
    
  },
  
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';
@import '~@/box-layout.scss';
.box-layout-wrapper .single-box h2 { margin-bottom: 0; }
</style>
