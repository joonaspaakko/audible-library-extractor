<template>
<div class="details-inner-wrap" :data-title="book.title" ref="bookInnerWrap">

  <ale-sort-values :gallery="gallery" :book="book"></ale-sort-values>
  
  <div class="info-icons-wrapper">
    
    <!-- FAVORITE -->
    <div class="favorite-marker" v-if="book.favorite">
      <!-- <span><font-awesome fas icon="heart" /></span> -->
      <span>favorite</span>
    </div>
    
    <!-- BOOK IS FINISHED -->
    <div class="finished-marker" v-if="book.progress === 'Finished'">
      <!-- <span><font-awesome fas icon="check" /></span> -->
      <span>finished</span>
    </div>
    
    <!-- FROM PLUS CATALOG -->
    <div class="plus-catalog-marker" v-if="book.fromPlusCatalog">
      <!-- <span><font-awesome fas icon="plus" /></span> -->
      <span>plus catalog</span>
    </div>
    
  </div>
  
  <div class="ale-cover">
    
    <div class="ale-play-sample" @click="playSample( book, index )">
      <div><font-awesome fas icon="play" /></div>
    </div>
    
    <div class="ale-click-wrap" @click="$emit('book-clicked', { book })">
      
      <div class="ale-info-indicator">
        <div><font-awesome fas icon="book" /></div>
      </div>
      <img class="ale-cover-image" :src="makeCoverUrl(book.cover, 280)" :alt="imageAlt( book, index )">
      
    </div>
    
  </div>
  
</div>
</template>

<script>

import makeCoverUrl from '@output-mixins/makeCoverUrl';
import aleSortValues from './aleSortValues';

export default {
  name: 'book',
  props: ['book', 'gallery', 'index'],
  mixins: [ makeCoverUrl ],
  components: {
    aleSortValues,
  },
	data: function() {
		return {
		}
  },
  
  created: function() {
    
    // if ( this.book.favorite ) console.log( this.book );
    
  },
  
  methods: {
    
    imageAlt: function( book, index ) {
      return book.authors[0].name+ ' - ' +book.title;
    },
    
    playSample: function( book, index ) {
      this.$root.$emit('play-audio', {
        from: 'book',
        route: this.$route,
        book: book,
        index: index,
      });
    },
    
  },
  
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';
.details-inner-wrap {
  // max-width: $thumbnailSize+2;
  margin: 5px;
  border-radius: 5px;
  overflow: hidden;
  background-clip: padding-box;
  
  .info-icons-wrapper {
    position: absolute;
    z-index: 10;
    left: -2px;
    bottom: 10px;
    // left: 5px;
    // bottom: 5px;
    
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    
    // transition: left 150ms ease;
    
    > div {
      margin-top: 4px;
      &:first-child { margin: 0; }
      
      font-size: 10px;
      line-height: 17px;
      font-weight: 700;
      background: #333;
      color: #fff;
      // border-radius: 900px;
      
      border-radius: 500px;
      width: 17px;
      height: 10px;
      
      display: flex;
      justify-content: center;
      align-content: center;
      justify-items: center;
      align-items: center;
      
      // transition: all 150ms ease;
      overflow: hidden;
      > span { 
        display: inline-block;
        opacity: 0; 
        // transition: opacity 0ms ease;
        white-space: nowrap;
      }
    }
    
    .favorite-marker { background: red; }
    .finished-marker { background: #62bd25; }
    .plus-catalog-marker { background: $audibleOrange; }
    
  }
  &:hover .info-icons-wrapper {
    // left: 1px;
    > div {
      width: auto;
      height: 17px;
      padding: 0 6px;
      > span { 
        // transition-duration: 150ms;
        opacity: 1;
      }
    }
  }
  
}

.ale-cover {
  cursor: pointer;
  position: relative;
  border-radius: 5px;
  overflow: hidden;
  background-clip: padding-box;
  @include themify($themes) {
    border: 1px solid rgba( themed(outerColor), .3 );
  }
  img.ale-cover-image {
    display: block;
    width: 100%;
    height: auto;
    // width: $thumbnailSize;
    // height: $thumbnailSize;
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    @-webkit-keyframes showImage { 0% { opacity: 0; } 100% { opacity: 1; }  }
    @keyframes showImage { 0% { opacity: 0; } 100% { opacity: 1; }  }
    -webkit-animation: 300ms showImage;
    animation: 300ms showImage;
  }
}

.ale-info-indicator {
  position: absolute;
  z-index: 9;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  justify-items: center;
  color: #fff;
  background: rgba( #000, .20 );
  // transition: all 200ms ease-in-out;
  opacity: 0;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    justify-items: center;
    background: rgba( #fff, .25 );
    z-index: 0;
    // transition: all 200ms ease-in-out;
    opacity: 0;
  }
  > div {
    font-size: 120%;
    // transition: all 100ms ease-in-out;
    cursor: pointer;
    position: relative;
    z-index: 2;
    width: 10%;
    height: 10%;
    opacity: 0;
    border-radius: 99999px;
    background: rgba( #000, .70 );
    box-shadow:  0 0 2px 1px rgba( #000, .70 );
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    justify-items: center;
  }
}
.ale-click-wrap:hover {
  &:hover .ale-info-indicator,
  &:hover .ale-info-indicator div,
  &:hover .ale-info-indicator:after { opacity: 1; }
  
  &:hover .ale-info-indicator div { width: 50%; height: 50%; font-size: 140%; }
  
  &:hover .ale-cover > div > img {
    filter: blur(1px) grayscale(30%);
  }
}


.ale-play-sample {
  display: none;
  position: absolute;
  z-index: 999;
  bottom: 12px;
  right: 12px;
  padding: 6px;
  border-radius: 999999px;
  cursor: default;
  > div { 
    font-size: 8px;
    width: 20px;
    height: 20px;
    padding: 3px;
    color: rgba( #fff, 1 );
    background: rgba( #000, .9 );
    border-radius: 999999px;
    border: 2px solid rgba( $audibleOrange, .9 );
    box-shadow: 0px 0px 9px rgba( #000, .9 );
    cursor: pointer; 
    display: flex;
    justify-content: center;
    align-content: center;
    justify-items: center;
    align-items: center;
  }
}

.hidden {
  position: absolute;
  z-index: -1;
  top: 50%;
  right: 0;
  left: 0;
  display: inline-block;
  width: 100%;
  height: 0;
  overflow: hidden;
}

</style>
