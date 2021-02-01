<template>
  <div id="ale-background" v-if="books">
    <img
      v-for="(book, index) in books"
      :key="book.cover+index"
      :src="makeCoverUrl(book.cover, 200)"
      :class="{ 'flip-out': book.flipOut }"
      alt=""
    />
  </div>
</template>

<script>
import makeCoverUrl from "@output-mixins/makeCoverUrl";

export default {
  name: "aleBackground",
  mixins: [makeCoverUrl],
  data: function() {
    return {
      books: null,
      booksLength: null,
      windowWidth: null,
      timer1: null,
      timer2: null
    };
  },

  mounted: function() {
    const vue = this;
    this.windowWidth = window.innerWidth;

    this.$nextTick(function() {
      setTimeout(function() {
        vue.books = vue.getBooks();
        vue.flipAnimationRandomizer();
      }, 1500);
    });

    this.$root.$on("afterWindowResize", this.onWindowResize);
  },
  beforeDestroyed: function() {
    this.$root.$off("afterWindowResize", this.onWindowResize);
    clearInterval(this.timer1);
    clearInterval(this.timer2);
  },

  methods: {
    getBooks: function() {
      // 15 (>1300)
      // 12 (<1300)
      // 8 (<1000)
      // 6 (<760)
      // 4 (<530)
      function calculateBgLength(n) {
        return 6 * n;
      }
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
      })(this.$store.state.library.books);
      
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
        const newIndex = vue.randomNumber(0, vue.$store.state.library.books.length-1);
        const newBook = vue.$store.state.library.books[ newIndex ];
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

<style lang="scss">
@import "~@/_variables.scss";

#ale-background {
  position: fixed;
  z-index: -1;
  left: -3.05%;
  right: -3.05%;
  top: 0;
  opacity: 0.25;
  text-align: center;
  font-size: 0px;
  line-height: 0px;
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
  -khtml-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none; 
  user-select: none; 

  &:after {
    content: "";
    position: absolute;
    z-index: 1;
    top: 40%;
    right: 0;
    bottom: 0;
    left: 0;
    @include themify($themes) {
      background: -moz-linear-gradient(
        top,
        rgba(themed(backColor), 0) 0%,
        rgba(themed(backColor), 0.6) 24%,
        themed(backColor) 78%,
        themed(backColor) 100%
      );
      background: -webkit-linear-gradient(
        top,
        rgba(themed(backColor), 0) 0%,
        rgba(themed(backColor), 0.6) 24%,
        themed(backColor) 78%,
        themed(backColor) 100%
      );
      background: linear-gradient(
        to bottom,
        rgba(themed(backColor), 0) 0%,
        rgba(themed(backColor), 0.6) 24%,
        themed(backColor) 78%,
        themed(backColor) 100%
      );
    }
  }

  img {
    position: relative;
    z-index: 0;
    width: 6%;
    margin: 2px;
    transition: all 900ms;
    opacity: 1;
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
  }
}
// In ios, the gradient "mask" flickers when a cover animates behind it.
// Fix: hide it on IOS and use mask-image instead..
@supports (-webkit-touch-callout: none) {
  #ale-background:after {
    display: none !important;
  }
  #ale-background {
    opacity: 0.25;
    -webkit-mask-image: -webkit-gradient(
      linear,
      left 40%,
      left bottom,
      from(rgba(0, 0, 0, 1)),
      to(rgba(0, 0, 0, 0))
    ) !important;
  }
}

.theme-dark #ale-background:after {
  -webkit-animation: color-change-dark 400ms linear;
  animation: color-change-dark 400ms linear;
}
.theme-light #ale-background:after {
  -webkit-animation: color-change-light 400ms linear;
  animation: color-change-light 400ms linear;
}

@media (max-width: 1300px) {
  #ale-background img {
    width: 7.55%;
  }
}
@media (max-width: 1000px) {
  #ale-background img {
    width: 11.37%;
  }
}
@media (max-width: 760px) {
  #ale-background img {
    width: 15.09%;
  }
}
@media (max-width: 530px) {
  #ale-background img {
    width: 17.95%;
  }
}
</style>
