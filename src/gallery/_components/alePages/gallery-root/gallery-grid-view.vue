<template>
  <div class="ale-books grid-view" :class="{ 'sort-values-on': $store.getters.sortValues && ($store.getters.sortBy !== 'bookNumbers' && $store.getters.sortBy !== 'seriesOrder' ) }" ref="booksWrapper">
    
    <gallery-lazy
      v-for="(book, index) in $store.state.chunkCollection"
      class="ale-book"
      :class="{ 'details-open': !!$route.query.book && $route.query.book === book.asin, 'image-loaded': imageLoaded }"
      :data-asin="book.asin"
      :key="'book:'+book.asin"
    >
      <gallery-book :book="book" :index="index" :sortValuesEnabled="$store.getters.sortValues" v-model:imageLoaded="imageLoaded"></gallery-book>
    </gallery-lazy>
    
  </div>
</template>

<script>
import loaderLight from "@output-images/gallery-table-loader-light.gif";
import loaderDark  from "@output-images/gallery-table-loader-dark.gif";
import slugify from "@output-mixins/gallery-slugify.js";

export default {
  name: "aleBooks",
  mixins: [slugify],
  data: function() {
    return {
      imageLoaded: false,
    };
  },
};
</script>

<style lang="scss">


.ale-books.grid-view {
  max-width: 728px;
  margin: 0 auto 350px auto;
  text-align: center;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-size: 0px;
  line-height: 0px;
  > div {
    font-size: 14px;
    line-height: 1.55em;
  }
}


body:not(.is-mobile) .ale-book:hover .ale-play-sample {
  display: inline-block;
}

.theme-dark .ale-book.details-open .details-inner-wrap {
  background: lighten( $darkBackColor, 9);
}
.theme-light  .ale-book.details-open .details-inner-wrap {
  background: #202020;
}

.ale-book {
  position: relative;
  z-index: 0;
  text-align: center;
  display: inline-block;
  // font-size: 0;

  &.details-open .ale-play-sample {
    display: inline-block;
  }

  &.details-open .details-inner-wrap {
    @include themify($themes) {
      border-color: themed(audibleOrange);
      box-shadow: 0 0 0 3px themed(audibleOrange), 0 2px 10px rgba(#000, 0.7);
    }
    .ale-info-indicator.not-in-library { display: none; }
    .placeholder-cover, 
    .ale-cover-image {
      -webkit-filter: unset !important;
      filter: unset !important;
    }
    .ale-info-indicator {
      display: none !important;
    }
  }
  

  // Lazyload placeholder
  &:before {
    content: "";
    position: absolute;
    z-index: -1;
    top: 5px;
    right: 5px;
    bottom: 5px;
    left: 5px;
    border-radius: 5px;
    @include themify($themes) {
      background-color: themed(backColor);
      border: 1px solid rgba(themed(outerColor), 0.3);
    }
  }
  &:after {
    content: "";
    position: absolute;
    z-index: -1;
    top: 5px;
    right: 5px;
    bottom: 5px;
    left: 5px;
    border-radius: 5px;
    @include themify($themes) {
      background-color: themed(backColor);
      border: 1px solid rgba(themed(outerColor), 0.3);
    }
    background-repeat: no-repeat;
    background-position: center center;
    // Image set a few lines down...
  }

  &.mounted.image-loaded:before,
  &.mounted.image-loaded:after {
    display: none !important;
  }
}


.ale-book {
  width: $thumbnailSize + 2;
  height: $thumbnailSize + 2;
}
// For showing sort values correctly...
.sort-values-on .ale-book {
  height: $thumbnailSize + 2 + 27;
}

.ale-book:after {
  z-index: 0 !important;
}
.theme-light .ale-book:after {
  background-image: url(@output-images/gallery-table-loader-light.gif);
}
.theme-dark .ale-book:after {
  background-image: url("@output-images/gallery-table-loader-dark.gif");
}

// @media (max-width: 767px) {
//   .ale-book {
//     width: $thumbnailSize + 2 - 20px;
//     height: $thumbnailSize + 2 - 20px;
//   }
//   // For showing sort values correctly...
//   .sort-values-on .ale-book {
//     height: $thumbnailSize + 2 - 20px + 27;
//   }
// }

@media (max-width: 767px) {
  .ale-book {
    width: calc( 26.3vw - 20px);
    height: calc( 26.3vw - 20px);
  }
  .sort-values-on .ale-book {
    height: calc(26.3vw - 20px + 27px);
  }
}

@media (max-width: 630px) {

  .ale-book {
    width: calc( 34.4vw - 24px);
    height: calc( 34.4vw - 24px);
  }
  .sort-values-on .ale-book {
    height: calc(34.4vw - 24px + 27px);
  }
  
}

@media (max-width: 616px) {
  
  #ale-search {
    .icon-wrap {
      &:first-child {
        margin-left: 0;
        > div {
          padding-left: 0 7px;
        }
      }
    }
  }
}

@media (max-width: 504px) {
  
  #ale-search-wrap {
    padding-left: 10px;
    padding-right: 10px;
  }
  #ale-search {
    > .icons { 
      padding-left: 0px;
      .icon-wrap:first-child > div { padding-left: 0px; }
    }
    > .icons {
      font-size: 0.9em;
    }
  }
}

@media (max-width: 504px) {
  
  .ale-book {
    width: calc( 50vw - 25px);
    height: calc( 50vw - 25px);
  }
  .sort-values-on .ale-book {
    height: calc(50vw - 25px + 27px);
  }
}

</style>
