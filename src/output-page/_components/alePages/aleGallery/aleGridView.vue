<template>
  <div id="ale-books" class="grid-view" :class="{ 'sort-values-on': $store.getters.sortValues && ($store.getters.sortBy !== 'bookNumbers') }" ref="booksWrapper">
    
    <book-details
    v-if="detailsBook"
    :key="'details:' + detailsBook.asin"
    :book.sync="detailsBook"
    :booksWrapper="$refs.booksWrapper"
    :index="detailsBookIndex"
    />
    
    <lazy
    v-for="(book, index) in $store.getters.collection"
    class="ale-book"
    :class="{ 'details-open': detailsBook && detailsBook.asin === book.asin }"
    :data-asin="book.asin"
    :key="'book:'+book.asin"
    >
      <book :book="book" :index="index" :sortValuesEnabled="$store.getters.sortValues"></book>
    </lazy>
    
  </div>
</template>

<script>

import slugify from "@output-mixins/slugify.js";
import lazy from "@output-snippets/lazy.vue";

export default {
  name: "aleBooks",
  components: {
    bookDetails: () => import( /* webpackChunkName: "book-Details" */ "./aleGridView/bookDetails"),
    book: () => import( /* webpackChunkName: "book" */ "./aleGridView/book"),
    lazy,
  },
  mixins: [slugify],
  data: function() {
    return {
      detailsBook: null,
      detailsBookIndex: -1,
      mounts: {
        
      },
    };
  },
  
  // computed: {
  //   keySuffix: function() {
  //     return '|sortVals:'+this.$store.getters.sortValues +
  //            '|sort:'+this.$store.getters.sortBy +
  //            '|sort:'+_.values( this.mounts ) +
  //            '|filters:'+this.$store.getters.filterKeys;
  //   },
  // },
  
  created: function() {
    const vue = this;
    const routeName = this.$route.name;
    console.log('test', this.$store.getters.collection )
    // if ( routeName === 'ale-category' ) {
    //   const parentCat = this.$route.params.parent;
    //   const childCat = this.$route.params.child;
    //   if ( parentCat ) {

    //     vue.gallery.customResults = _.filter( vue.library.books, function( book ) {
    //       if ( book.categories ) {
    //         var match = false;
    //         if ( childCat ) {
    //           if ( vue.slugify( book.categories[0].name ) === parentCat && vue.slugify( book.categories[1].name ) === childCat ) {
    //             return true;
    //           }
    //         }
    //         else {
    //           if ( vue.slugify( book.categories[0].name ) === parentCat ) {
    //             return true;
    //           }
    //         }
    //       }
    //     });

    //   }
    // }

    this.$root.$on("book-clicked", this.toggleBookDetails);
    // $("body, html").on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", this.scrollStopAnimate);
    // this.$root.$on('afterWindowResize', this.onWindowResize );
  },

  beforeDestroy: function() {
    this.$root.$off("book-clicked", this.toggleBookDetails);
    // $("body, html").off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", this.scrollStopAnimate);
    // this.$root.$off('afterWindowResize', this.onWindowResize );
  },

  mounted: function() {
    
    console.log('%c' + 'GRID Mounted' + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;');
    
    // Open book details on load
    if (_.get(this.$route, "query.book")) this.toggleBookDetails({
      book: _.find(this.$store.getters.collection, { asin: this.$route.query.book })
    });
    
  },

  methods: {
    
    toggleBookDetails: function(e) {
      
      if (!e.book) {
        
        this.detailsBook = null;
        this.detailsBookIndex = -1;
        if (_.get(this.$route, "query.book") !== undefined) this.$updateQuery({ query: 'book', value: null });
      
      } else {
        
        if (!e.index) e.index = _.findIndex( this.$store.getters.collection, { asin: e.book.asin });
        const sameBook = _.get(this.detailsBook, "asin") === e.book.asin;
        this.detailsBook = null;
        this.detailsBookIndex = e.index;
        this.$nextTick(function() {
          if (!sameBook) this.detailsBook = e.book;
          else {
            if (this.$route.query !== undefined) this.$updateQuery({ query: 'book', value: null });
          }
        });
        
      }
    }
    
  }
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

#ale-books.grid-view {
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

.ale-book {
  position: relative;
  z-index: 0;
  text-align: center;
  display: inline-block;
  // font-size: 0;

  &.details-open .ale-play-sample,
  &:hover .ale-play-sample {
    display: inline-block;
  }

  &.details-open {
    .details-inner-wrap {
      @include themify($themes) {
        border-color: themed(audibleOrange);
        box-shadow: 0 0 0 3px themed(audibleOrange), 0 2px 10px rgba(#000, 0.7);
      }
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

  &.mounted:after {
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
  
.theme-light .ale-book:after {
  background-image: url("../../../images/table-loader-light.gif");
}
.theme-dark .ale-book:after {
  background-image: url("../../../images/table-loader-dark.gif");
}

@media (max-width: 616px) {
  .ale-book {
    width: $thumbnailSize - 25;
    height: $thumbnailSize - 25;
  }
  .sort-values-on .ale-book {
    height: $thumbnailSize - 25 + 27;
  }

  #ale-search {
    > .icons {
      padding-left: 0;
      .icon-wrap {
        &:first-child {
          margin-left: 0;
        }
      }
    }
  }
}

@media (max-width: 423px) {
  #ale-search {
    padding: 8px 15px;
    [type="search"] {
      width: 100%;
    }
    > .icons {
      font-size: 0.9em;
    }
  }
}

@media (max-width: 504px) {
  #ale-books.grid-view {
    .ale-book {
      width: 40vw;
      height: 40vw;
    }
  }
}
</style>
