<template>
  <div class="sort-specials-container" v-if="gallery.searchOptions.lists.showSortValues">
    <div class="sort-releaseDate" v-if="sortedBy('releaseDate')">
      {{ book.releaseDate ? book.releaseDate : 'Not available...' }}
    </div>
    <div class="sort-dateAdded" v-if="sortedBy('dateAdded')">
      {{ book.dateAdded ? book.dateAdded : 'Not available...' }}
    </div>
    <div class="sort-length" v-if="sortedBy('length')">
      {{ book.length ? book.length : 'Not available...' }}
    </div>
    <div class="sort-booknumbers" v-else-if="sortedBy('bookNumbers')">
      <div>{{ book.bookNumbers ? book.bookNumbers.join(', ') : 'Not available...' }}</div>
    </div>
    <div class="sort-authors" v-else-if="sortedBy('authors.name')">
      <div>{{ book.authors ? book.authors[0].name : 'Not available...' }}</div>
    </div>
    <div class="sort-narrators" v-else-if="sortedBy('narrators.name')">
      <div>{{ book.narrators ? book.narrators[0].name : 'Not available...' }}</div>
    </div>
    <div class="sort-title" v-else-if="sortedBy('title')">
      <div>{{ book.title ? book.title : 'Not available...' }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'sortSpecials',
  props: ['book', 'gallery'],
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
    
  },
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';

.sort-releaseDate,
.sort-dateAdded,
.sort-title,
.sort-authors,
.sort-narrators,
.sort-length {
  > div {
    white-space: nowrap;
    overflow: hidden;
    -ms-text-overflow: ellipsis;
    text-overflow: ellipsis;
  }
  width: $thumbnailSize - (2*6);
  margin: 6px;
  margin-bottom: -(6px+2px);
  padding: 3px 6px;
  padding-bottom: (3px+2px);
  font-weight: 700;
  border-radius: 2px 2px 0 0;
  color: #fff;
  @include themify($themes) {
    background: themed(audibleOrange);
  }
}

.sort-booknumbers {
  position: absolute;
  z-index: 10;
  top: 6px;
  right: 6px;
  // bottom: 0;
  // left: 0;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  > div {
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
}

</style>
