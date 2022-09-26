<template>
  <div 
  class="cover"
  @mouseover="coverHover"
  @mouseleave="coverHover"
  >
  
    <div v-if="!store.saving" class="cover-padding-preview"></div>
    
    <div v-if="store.showAuthorAndTitle && !book.placeholderCover && (book.author || book.title)" class="author-and-title" :style="{ width: store.coverSize + 'px', color: store.authorAndTitleColor }">
      <div class="author" :style="{ fontSize: store.authorAndTitleSize + 'px', 'line-height': (store.authorAndTitleSize + 4) + 'px' }"><strong>{{ book.author }}</strong></div>
      <div class="title" :style="{ fontSize: store.authorAndTitleSize + 'px', 'line-height': (store.authorAndTitleSize + 4) + 'px' }">{{ book.title }}</div>
    </div>
    
    <div v-if="book.placeholderCover" data-coverImages class="placeholder"></div>
    <div v-else style="position: relative; display: inline-block;">
      
      <img data-coverImages class="cover-img" :src="book.cover" alt="" draggable="false" data-no-dragscroll 
      :style="{ filter: (store.awpGrayscale) ? 'grayscale(1) contrast('+ store.awpGrayscaleContrast +')' : null }"
      />
      
      <div v-if="!store.animatedWallpaperMode && store.showFavorites && book.favorite" class="cover-heart-icon">
        <gb-icon size="13px" name="favorite"></gb-icon>
      </div>
      <div v-if="!store.animatedWallpaperMode && store.showMyRating && book.myRating" class="cover-star-icons">
        <gb-icon size="13px" name="star" v-for="number in book.myRating" :key="number"></gb-icon>
      </div>
      
    </div>
    
  </div>  
</template>

<script>

export default {
  
  props: ['book'],
  data: function () {
    return {
      store: this.$store.state,
    };
  },
  
  mounted: function() {
    
  },

  methods: {
    coverHover: function( e ) {
      
      const hover = (e.type === 'mouseover');
      this.$store.commit('update', { key: 'panningAlert', value: hover });
      
    },
  },
  
};
</script>

<style scoped lang="scss">

.grid-inner-wrap.hide-author-and-title .author-and-title { display: none !important; }

.cover-star-icons,
.cover-heart-icon {
  position: absolute;
  z-index: 50;
  i { color: #ff0000; }
}
.cover-star-icons {
  left: 0px;
  right: 0px;
  bottom: 0px;
  // background: #333;
  border-radius: 2px;
  // border-radius: 999999px;
  text-align: center;
  i { color: #f8991c; }
}

.cover-padding-preview {
  display: none;
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  flex: 1;
  background: rgba(#ff394f, .45) !important;
}
.show-cover-padding-preview .cover-padding-preview { display: block; }

.cover {
  position: relative;
  display: inline-block;
  font-size: 0;
  line-height: 0;
}

.cover .placeholder,
.cover img {
  position: relative;
  z-index: 5;
  display: block;
  width: 0px;
  height: 0px;
  cursor: move !important;
}
</style>