<template>
  <div id="ale-background" v-if="books">
    <div 
    v-for="(book, index) in books"
    :key="book.cover+index"
    class="image-wrapper"
    :class="{ 'flip-out': book.flipOut }"
    >
      <img
      crossorigin="anonymous"
      :src="makeCoverUrl(book.cover, 200)"
      alt=""
    />
    </div>
    <div class="dimmer-overlay"></div>
  </div>
</template>

<script>
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";

export default {
  name: "aleBackground",
  mixins: [makeCoverUrl],
  data: function() {
    return {
      coverSource: null,
      books: null,
      booksLength: null,
      windowWidth: null,
      timer1: null,
      timer2: null
    };
  },

  mounted: function() {
    
    this.windowWidth = window.innerWidth;
    this.books = this.getBooks();
    this.flipAnimationRandomizer();

    this.$compEmitter.on("afterWindowResize", this.onWindowResize);
  },
  beforeUnmounted: function() {
    this.$compEmitter.off("afterWindowResize", this.onWindowResize);
    clearInterval(this.timer1);
    clearInterval(this.timer2);
  },

  methods: {
    
    bgGridSize: function() {
      
      // 15 (>1300)
      // 12 (<1300)
      // 8 (<1000)
      // 6 (<760)
      // 4 (<530)
      let bgLength = calculateBgLength(15);
      if (this.windowWidth < 530) {
        bgLength = calculateBgLength(5);
      } else if (this.windowWidth < 760) {
        bgLength = calculateBgLength(6);
      } else if (this.windowWidth < 1000) {
        bgLength = calculateBgLength(8);
      } else if (this.windowWidth < 1300) {
        bgLength = calculateBgLength(12);
      }
      
      function calculateBgLength(n) { return 6 * n; }
      
      return bgLength;
      
    },
    
    getBooks: function() {
      
      const bgLength = this.bgGridSize();
      
      this.coverSource = this.$store.state.library.books ? this.$store.state.library.books : this.$store.state.library.wishlist;
      
      let books = (function(books) {
        const booksLength = books.length;
        if ( booksLength <= bgLength ) {
          const fits = Math.floor(bgLength / booksLength);
          const difference = bgLength - booksLength * fits;
          const loopLength = fits;
          let clonedBooks = [];
          for (let i = 0; i < loopLength; i++) {
            clonedBooks = clonedBooks.concat(books);
          }
          if (difference > 0)
            clonedBooks = clonedBooks.concat(books.splice(-1, difference));
          return clonedBooks;
        } else {
          return _.sampleSize(books, bgLength);
        }
      })( _.filter( this.coverSource, 'cover') );
      
      // Reduce the number of properties to bear necessities
      books = _.map( books, function( book ) {
        let newObject = _.pick(book, ['cover']);
        newObject.flipOut = false;
        return newObject;
      });
      
      this.booksLength = books.length;
      
      return books;
    },

    flipAnimationRandomizer: function() {
      const vue = this;

      clearInterval(vue.timer1);
      clearInterval(vue.timer2);

      vue.timer1 = setInterval(function() {
        vue.coverSwitcheroo();
      }, vue.randomNumber(1500, 3000));
      vue.timer2 = setInterval(function() {
        vue.coverSwitcheroo();
      }, vue.randomNumber(3500, 5000));
    },

    coverSwitcheroo: function() {
      
      const vue = this;
      const targetIndex = this.randomNumber(0, this.booksLength-1);
      const targetBook = this.books[ targetIndex ];
      
      targetBook.flipOut = true;
      setTimeout(function() {
        const covers = _.filter( vue.coverSource, 'cover');
        const newIndex = vue.randomNumber(0, covers.length-1);
        const newBook = covers[ newIndex ];
        targetBook.cover = newBook.cover;
        targetBook.flipOut = false;
      }, 850);
      
    },

    randomNumber: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },

    onWindowResize: function(msg) {
      if (msg.widthChanged) {
        this.windowWidth = msg.width;
        this.books = this.getBooks();
      }
    }
  }
};
</script>

<style lang="scss" scoped>


#ale-background {
  position: fixed;
  z-index: -1;
  left: -3.05%;
  right: -3.05%;
  top: 0;
  text-align: center;
  font-size: 0px;
  line-height: 0px;
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 
  
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%,rgba(0,0,0,1) 19%,rgba(0,0,0,0) 92%,rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%,rgba(0,0,0,1) 19%,rgba(0,0,0,0) 92%,rgba(0,0,0,0) 100%);

  .image-wrapper {
    display: inline-block;
    position: relative;
    z-index: 0;
    width: 6%;
    margin: 2px;
    transition: all 900ms;
    opacity: .25;
    transform: rotateY(0deg);
    animation: 1000ms showImage;
    &.flip-out {
      opacity: 0;
      transform: rotateY(180deg);
      transition-duration: 1000ms;
    }
    @-webkit-keyframes showImage {
      0% {
        opacity: 0;
        // transform: rotateY(-180deg);
      }
      100% {
        opacity: .25;
        // transform: rotateY(0deg);
      }
    }
    @keyframes showImage {
      0% {
        opacity: 0;
        // transform: rotateY(-180deg);
      }
      100% {
        opacity: .25;
        // transform: rotateY(0deg);
      }
    }
    img {
      display: inline-block; 
      width: 100%;
    }
  }
}

@media (max-width: 1300px) {
  #ale-background .image-wrapper {
    width: 7.55%;
  }
}
@media (max-width: 1000px) {
  #ale-background .image-wrapper {
    width: 11.37%;
  }
}
@media (max-width: 760px) {
  #ale-background .image-wrapper {
    width: 15.09%;
  }
}
@media (max-width: 530px) {
  #ale-background .image-wrapper {
    width: 17.95%;
  }
}
</style>
