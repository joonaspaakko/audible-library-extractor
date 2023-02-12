<template>
  <div 
    class="cover"
    :class="{ active: selectedBook }"
    @mouseover="coverHover"
    @mouseleave="coverHover"
    :style="{ transform: store.reverseCoverFlow ? 'rotate(180deg)' : null }"
    @click="toggleCoverActions"
  >
  
    <div v-if="!store.saving" class="cover-padding-preview"></div>
    
    <div v-if="store.showAuthorAndTitle && !book.placeholderCover && (book.author || book.title)" class="author-and-title" :style="{ width: store.coverSize + 'px', color: store.authorAndTitleColor }">
      <div class="author" :style="{ fontSize: store.authorAndTitleSize + 'px', 'line-height': (store.authorAndTitleSize + 4) + 'px' }"><strong>{{ book.author }}</strong></div>
      <div class="title" :style="{ fontSize: store.authorAndTitleSize + 'px', 'line-height': (store.authorAndTitleSize + 4) + 'px' }">{{ book.title }}</div>
    </div>
    
    <div v-if="book.placeholderCover" data-coverImages class="placeholder"></div>
    <div v-else style="position: relative; display: inline-block;">
      
      <img 
        data-coverImages class="cover-img panzoom-exclude" :src="book.cover" alt="" draggable="false" data-no-dragscroll 
        :style="{ 
          filter: (store.awpGrayscale) ? 'grayscale(1) contrast('+ store.awpGrayscaleContrast +')' : null,
        }"
      />
      
      <div v-if="!store.animatedWallpaperMode && store.showFavorites && book.favorite" class="cover-heart-icon">
        <mdi-cards-heart />
      </div>
      <div v-if="!store.animatedWallpaperMode && store.showMyRating && book.myRating" class="cover-star-icons">
        <material-symbols-star-rate-rounded v-for="number in book.myRating" :key="number" />
      </div>
      
      <reread-marker v-if="book?.reread"></reread-marker>
      
      <div class="selected-cover" v-if="selectedBook" :style="{ 
        borderRadius: (this.store.coverSize * store.borderRadius) + 'px',
        border: (this.store.coverSize/30)+'px solid #222',
      }"></div>
      
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
  
  computed: {
    selectedBook() {
      return (this.store.coverActions?.asin === this.book.asin) && this.book.asin; 
    }
  },

  methods: {
    coverHover( e ) {
      
      const hover = (e.type === 'mouseover');
      this.$store.commit('update', { key: 'panningAlert', value: hover });
      
    },
    
    toggleCoverActions() {
      
      const coverActionsAsin = _.get(this.store, 'coverActions.asin');
      
      this.$store.commit('update', { 
        key: 'coverActions', 
        value: coverActionsAsin === this.book.asin ? null : this.book,
      });
      
    }
  },
  
};
</script>

<style scoped lang="scss">

.grid-inner-wrap.hide-author-and-title .author-and-title { display: none !important; }

.author-and-title {
  text-align: center;
}

.cover-star-icons,
.cover-heart-icon {
  position: absolute;
  z-index: 50;
  svg { color: #ff0000; }
}
.cover-star-icons {
  left: 0px;
  right: 0px;
  bottom: 0px;
  // background: #333;
  border-radius: 2px;
  // border-radius: 999999px;
  text-align: center;
  svg { color: #f8991c; }
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
  // &, .cover-img {
  //   transition: all 300ms ease;
  // }
  &.active .cover-img {
    filter: grayscale(1) invert(1) brightness(1.1);
    // box-shadow: 0 0 4px 4px red !important;
  }
}

.selected-cover {
  position: absolute;
  z-index: 5;
  top   : 0;
  right : 0;
  bottom: 0;
  left  : 0;
  // border: 4px solid #63e2b8;
  &:before {
    // content: '';
    // background: rgba(255,0,0,1);
    // mix-blend-mode: color-burn;
    // position: absolute;
    // top: 0;
    // right: 0;
    // bottom: 0;
    // left: 0;
  }
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