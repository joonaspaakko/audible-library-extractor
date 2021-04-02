<template>
  <div class="details-inner-wrap">
    
    <sort-values v-if="sortValuesEnabled" :book="book"></sort-values>

    <div class="ale-cover">
      <div class="ale-play-sample" v-if="book.sample" @click="playSample(book, index)">
        <div><font-awesome fas icon="play" /></div>
      </div>

      <div
        class="ale-click-wrap"
        @click="$root.$emit('book-clicked', { book })"
      >
        
        <div class="blurb-tooltip" v-if="book.blurb" v-tippy="{ placement: 'left', flipBehavior: ['left', 'right', 'top', 'bottom'], maxWidth: 300 }" :content="book.blurb"></div>
      
        <div class="info-icons-wrapper">
          <!-- FAVORITE -->
          <div class="favorite-marker" v-if="book.favorite">
            <span><font-awesome fas icon="heart" /></span>
            <span>favorite</span>
          </div>

          <!-- BOOK IS FINISHED -->
          <div class="finished-marker" v-if="book.progress === 'Finished'">
            <span><font-awesome fas icon="check" /></span>
            <span>finished</span>
          </div>

          <!-- FROM PLUS CATALOG -->
          <div class="plus-catalog-marker" v-if="book.fromPlusCatalog">
            <span v-if="book.unavailable"><font-awesome fas icon="lock" /></span>
            <span v-else><font-awesome fas icon="plus-circle" /></span>
            <span>catalog</span>
          </div>
        </div>
      
        <div class="ale-info-indicator">
          <div><font-awesome fas icon="book" /></div>
        </div>
        
        <div v-if="!book.cover" class="placeholder-cover">
          <div class="cover-content">
            <div class="title" v-if="book.titleShort || book.title">{{ book.titleShort || book.title }}</div>
            <div class="author" v-if="book.authors">{{ book.authors[0].name }}</div>
          </div>
        </div>
        <img v-else class="ale-cover-image" :src="makeCoverUrl(book.cover, 280)" alt="" />
      </div>
    </div>
  </div>
</template>

<script>
import makeCoverUrl from "@output-mixins/makeCoverUrl";

export default {
  name: "book",
  props: ["book", "index", "sortValuesEnabled"],
  mixins: [makeCoverUrl],
  components: {
    'sort-values': () => import( /* webpackChunkName: "sort-values" */ './aleSortValues.vue'),
  },

  methods: {
    // imageAlt: function(book, index) {
    //   return book.authors[0].name + " - " + book.title;
    // },

    playSample: function(book, index) {
      this.$root.$emit("play-audio", {
        from: "book",
        route: this.$route,
        book: book,
        index: index
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";
.details-inner-wrap {
  // max-width: $thumbnailSize+2;
  margin: 5px;
  border-radius: 5px;
  overflow: hidden;
  background-clip: padding-box;

  .info-icons-wrapper {
    position: absolute;
    z-index: 10;
    left: 3px;
    bottom: 4px;
    // left: 5px;
    // bottom: 5px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;

    // transition: left 150ms ease;
    
    > div {
      margin-top: 4px;
      &:first-child {
        margin: 0;
      }
      
      background: #333;
      color: #fff;
      // border-radius: 900px;

      border-radius: 500px;
      width: 11px;
      height: 11px;

      display: flex;
      justify-content: center;
      align-content: center;
      justify-items: center;
      align-items: center;

      // transition: all 150ms ease;
      overflow: hidden;
      > span {
        display: none;
        // transition: opacity 0ms ease;
        white-space: nowrap;
      }
    }

    .favorite-marker {
      background: red;
    }
    .finished-marker {
      background: #62bd25;
    }
    .plus-catalog-marker {
      background: $audibleOrange;
    }
  }
  &:hover .info-icons-wrapper {
    // left: 1px;
    > div {
      width: auto;
      padding: 0 6px;
      height: 15px;
      line-height: 15px;
      font-size: .7em;
      font-weight: 700;
      > span {
        // transition-duration: 150ms;
        display: inline-block;
        margin-left: 5px;
        &:first-child { margin-left: 0; }
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
    border: 1px solid rgba(themed(outerColor), 0.3);
  }
  .placeholder-cover,
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
    @-webkit-keyframes showImage {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    @keyframes showImage {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    -webkit-animation: 300ms showImage;
    animation: 300ms showImage;
  }
  
  .placeholder-cover {
    width: 100%;
    height: 100%;
    padding-bottom: 100%;
    @include themify($themes) {
      color: themed(frontColor);
      background-color: lighten( themed(backColor), 10);
    }
    position: relative;
    z-index: 1;
    &:after {
      content: '';
      position: absolute;
      z-index: 5;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTEuNSA5My43IiB3aWR0aD0iMTUxLjUiIGhlaWdodD0iOTMuNyI+PHBhdGggZD0iTTc1LjggODAuN2w3NS43LTQ3LjJ2MTIuOEw3NS44IDkzLjcgMCA0Ni4zVjMzLjV6IiBmaWxsPSIjZjc5YTFjIi8+PHBhdGggZD0iTTc1LjggMjEuNWE0OC4yIDQ4LjIgMCAwIDAtNDAuNyAyMS45IDEzLjcgMTMuNyAwIDAgMSAxLjgtMS42YzIxLjMtMTcuNyA1Mi0xMy43IDY4LjcgOC42bDExLjEtNy4xYTQ5LjcgNDkuNyAwIDAgMC00MC45LTIxLjgiIGZpbGw9IiNmNzlhMWMiLz48cGF0aCBkPSJNNzUuOCA0My40YTI3LjYgMjcuNiAwIDAgMC0yMi40IDExLjUgMjIuNSAyMi41IDAgMCAxIDEzLjUtNC40YzguMiAwIDE1LjUgNC4yIDIwLjQgMTEuM2wxMC42LTYuNmEyNS44IDI1LjggMCAwIDAtMjIuMS0xMS44TTI0LjYgMjQuMkM1NS44LS40IDk5LjkgNi4zIDEyMy40IDM5bC4yLjIgMTEuNS03LjFhNzAuOCA3MC44IDAgMCAwLTk4LTIwLjYgNzIuMiA3Mi4yIDAgMCAwLTIwLjYgMjAuNiA2MC41IDYwLjUgMCAwIDEgOC4xLTcuOSIgZmlsbD0iI2Y3OWExYyIvPjwvc3ZnPg==");
      background-position: center 45%; 
      background-repeat: no-repeat;
      background-size: 65%;
      opacity: .08;
    }
    .cover-content {
      position: absolute;
      z-index: 10;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      justify-items: center;
      align-items: center;
      align-content: center;
    }
    
    .title {
      margin-top: auto;
      font-weight: bold;
      opacity: .7;
      text-overflow: ellipsis;
      max-height: 70%;
      overflow: hidden;
    }
    .author {
      opacity: .7;
      @include themify($themes) {
        color: themed(audibleOrange);
      }
      margin-top: auto;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: calc( 100% - 20px);
      margin-left: auto;
      margin-right: auto;
    }
  }
  
}

.ale-info-indicator {
  position: absolute;
  z-index: 9;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  justify-content: center;
  align-content: center;
  align-items: center;
  justify-items: center;
  color: #fff;
  background: rgba(#000, 0.2);
  // transition: all 200ms ease-in-out;
  display: none;
  &:after {
    content: "";
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
    background: rgba(#fff, 0.25);
    z-index: 0;
    // transition: all 200ms ease-in-out;
  }
  > div {
    font-size: 120%;
    // transition: all 100ms ease-in-out;
    cursor: pointer;
    position: relative;
    z-index: 2;
    width: 10%;
    height: 10%;
    border-radius: 99999px;
    background: rgba(#000, 0.7);
    box-shadow: 0 0 2px 1px rgba(#000, 0.7);
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    justify-items: center;
  }
}

.ale-click-wrap:hover {
  .ale-info-indicator {
    display: flex;
    div {
      width: 50%;
      height: 50%;
      font-size: 140%;
    }
  }
  
  .placeholder-cover,
  .ale-cover-image {
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
    color: rgba(#fff, 1);
    background: rgba(#000, 0.9);
    border-radius: 999999px;
    border: 2px solid rgba($audibleOrange, 0.9);
    box-shadow: 0px 0px 9px rgba(#000, 0.9);
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

.blurb-tooltip {
  display: none;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 10;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 35px 35px 0 0;
  border-color: rgba(#000000, .7) transparent transparent transparent;
  outline: none;
  border-radius: 0 0 100% 0;
}
.ale-click-wrap:hover .blurb-tooltip { display: block; }
body.is-ios .blurb-tooltip { display: none !important; }

body.is-ios .ale-click-wrap {
  .ale-info-indicator {
    display: none !important;
  }
  .placeholder-cover,
  .ale-cover-image {
    filter: none !important;
  }
}
@media (max-width: 640px) {
  
  .ale-play-sample {
    bottom: 5px !important;
    right: 5px !important;
    > div {
      width: 15px;
      height: 15px;
    }
  }
  
}

</style>
