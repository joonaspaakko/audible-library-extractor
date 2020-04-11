<template>
<div id="ale-search">
	<VueFuse
    :placeholder="placeholder"
    event-name="fuseResultsEvent"
    :list="library.books"
    :keys="aliciaKeys"
    :threshold="0.24"
    :distance="400"
  />
</div> <!-- #ale-search -->
</template>

<script>
import VueFuse from 'vue-fuse'

export default {
  name: 'aleBookdetails',
  components: {
    VueFuse
  },
  props: ['library', 'gallery'],
	data : function() {
		return {
		}
	},
  created () {
    this.$on('fuseResultsEvent', results => {
      this.gallery.fuseResults = results;
    })
  },
  computed: {
    
		placeholder: function() {
      
      var placeholderKeys = (function( keys ) {
        var truncKeys = [];
        $.each( keys, function( i, key ) {
          truncKeys.push( key.replace('.name','') );
        });
        return truncKeys.join(', ');
      }( this.aliciaKeys ));
      
      return 'Search: ' + placeholderKeys;
    },
    
    aliciaKeys: function() {
      return [
        'title',
        'authors.name',
        'categories.name',
        'series.name',
        'narrators.name',
        'genres.name',
      ];
    },
    
  }
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

#ale-search {
  position: relative;
  z-index: 10;
  margin: 0 auto;
  margin-top: 100px;
  max-width: 600px;
  text-align: center;
  [type="search"] {
    outline: none;
    display: inline-block;
    width: 80%;
    background: #fff;
    border: none;
    border-radius: 999999px;
    padding: 8px 15px;
    font-size: 14px;
    font-family: "Helvetica Neue", sans-serif;
    @include themify($themes) {
      box-shadow: 0 5px 20px rgba(themed(outerColor), 0.9);
    }
  }
}

</style>
