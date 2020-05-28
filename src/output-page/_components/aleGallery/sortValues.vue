<template>
  <div class="sort-values-container" v-if="gallery.searchOptions.lists.showSortValues && gallery.searchOptions.lists.sortIndex > -1">
    <div :class="'sort-'+activeSortKey" v-html="sortContents" v-if="sortContents"></div>
  </div>
</template>

<script>
export default {
  name: 'sortValues',
  props: ['book', 'gallery'],
	data: function() {
		return {
			notAvailable: 'N/A'
		}
	},
  methods: {
    
    sortedBy: function( key ) {
      return this.activeSortKey === key;
    },
    
  },
  computed: {
    
    activeSortKey: function() {
      
      const activeSortIndex = this.gallery.searchOptions.lists.sortIndex;
      const activeSortItem = this.gallery.searchOptions.lists.sort[ activeSortIndex ];
      return activeSortItem.key;
      
    },
    
    sortContents: function() {
      
      var sortKey = this.activeSortKey.replace('.name', '');
      if ( this.book[ sortKey ] ) {
        
        switch ( sortKey) {
          case 'bookNumbers':
            return this.book[ sortKey ].join(', ');
            break;
          case 'authors':
          case 'narrators':
            return this.book[ sortKey ][0].name;
            break;
          case 'rating':
            var ratings = this.book.ratings ? ' <small>('+ this.book.ratings.match(/\d/g).join('').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +')</small>' : '';
            return this.book[ sortKey ] + ratings;
            break;
          case 'ratings':
            var text = this.book[ sortKey ];
            var rating = this.book.rating ? ' <small>('+ this.book.rating +')</small>' : '';
            return text.match(/\d/g).join('').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + rating;
            break;
          default:
            return this.book[ sortKey ];
        }
        
      }
      else {
        switch ( sortKey ) {
          case 'bookNumbers':
              return false;
            break;
          default:
            return this.notAvailable;
        }
      }
      
    }
    
  },
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';

.sort-values-container {
  width: $thumbnailSize + 2;
  > div {
    white-space: nowrap;
    overflow: hidden;
    -ms-text-overflow: ellipsis;
    text-overflow: ellipsis;
    // margin: 6px;
    margin-left: 1px;
    margin-right: 1px;
    margin-bottom: -2px;
    padding: 3px 6px;
    padding-bottom: (3px+2px);
    font-weight: 700;
    border-radius: 2px 2px 0 0;
    color: #fff;
    @include themify($themes) {
      background: themed(audibleOrange);
    }
  }
}
.ale-book.details-open .sort-values-container > div {
  margin-left: 0px;
  margin-right: 0px;
}

.sort-values-container div.sort-bookNumbers {
  width: auto;
  margin: 0;
  padding: 0;
  position: absolute;
  z-index: 10;
  top: 6px;
  right: 6px;
  border-radius: none;
  // bottom: 0;
  // left: 0;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  font-weight: 700;
  // box-shadow: -4px 4px 8px rgba( #000, .8 );
  border-radius: 2px;
  padding: 3px 6px;
  // @include themify($themes) {
  //   color: themed(backColor);
  //   background: themed(frontColor);
  // }
  color: #fff;
  @include themify($themes) {
    background: themed(audibleOrange);
  }
}

</style>
