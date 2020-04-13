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
	<div class="icons">
    <div class="scope">
      <font-awesome-icon fas icon="microscope" />
    </div>
    <div class="filter">
      <font-awesome-icon fas icon="filter" />
    </div>
		<div class="sort">
			<font-awesome-icon fas icon="sort" />
		</div>
	</div>
	
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
  display: flex;
  flex-direction: row;
  position: relative;
  z-index: 10;
  margin: 0 auto;
  margin-top: 100px;
  max-width: 600px;
  text-align: center;
  background: #fff;
  padding: 8px 20px;
  border-radius: 999999px;
  @include themify($themes) {
    box-shadow: 0 5px 20px rgba(themed(outerColor), 0.9);
  }
  [type="search"] {
    outline: none;
    display: inline-block;
    width: 100%;
    border: none;
    font-family: inherit;
    font-weight: 400;
  }
  .icons {
    // padding-left: 10px;
    @include themify($themes) {
      color: rgba( #222, .65) ;
    }
    display: flex;
    flex-direction: row;
    
    > div {
      padding-left: 20px;
    }
    
    .filter {
      font-size: .92em;
    }
  }
}

</style>
