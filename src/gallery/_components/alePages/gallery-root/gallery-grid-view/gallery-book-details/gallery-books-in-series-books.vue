<template>
<div>
  <div
    :data-series-name="series.name" class="numbers-list-item" :class="numbersClass(seriesBook)"
    v-for="(seriesBook, index) in filteredBooks" :key="seriesBook.asin"
  > 
  
    <gallery-open-in-app v-if="$store.state.sticky.booksInSeriesOpenInApp" :size="14" :book="seriesBook" :muted="true" />
    <gallery-goodreads-link v-else :size="14" :book="seriesBook" :icon="true" :muted="true"  />
    
    <span class="icon" :content="iconTippyContent(seriesBook)" v-tippy="{ placement: 'left', flipBehavior: ['left', 'top', 'bottom'] }">
      <i :class="booksInSeriesIcon(seriesBook)"></i>
    </span>
    
    <gallery-books-in-series-link :series="series" :book="seriesBook" :index="index" />
    
  </div>
</div>
</template>

<script>
export default {
  name: "booksInSeriesBooks",
  props: ["series", "book"],
  data: function() {
    return {
    };
  },
  
  computed: {
    filteredBooks() {
      const books =  _.filter( this.series.books, ( book ) => {
        if ( _.get(book, 'notInLibrary') ) {
          return this.$store.state.sticky.booksInSeriesAll;
        }
        else {
          if ( this.$store.state.sticky.booksInSeriesFinished ) {
            return true;
          }
          else {
            let progress = _.get(book, 'obj.progress');
            return progress ? !progress.match(/finished/i) : true;
          }
        }
        
      });
      
      return books;
      
    }
  },

  methods: {

    numbersClass: function(book) {
      var progress = _.get(book, 'obj.progress');
      return {
        finished: progress && progress.toLowerCase().match("finished") ? true : false,
        reading: progress && !progress.toLowerCase().match("finished") ? true : false,
        unfinished: !progress,
        current: this.book.asin === _.get(book, 'obj.asin'),
        'not-in-library': book.notInLibrary,
        'in-wishlist': book.inWishlist,
      };
    },

    iconTippyContent: function(book) {
      if ( book.free && book.notInLibrary ) {
        return 'This book is free...';
      }
      else if ( book.plus && book.notInLibrary ) {
        return 'In the plus catalog...';
      }
      else if ( book.notInLibrary ) {
        return 'Not in library...';
      }
      else if (book.inWishlist) {
        return 'In wishlist';
      }
      else {
        const classes = this.numbersClass(book);
        var tippyContent = "";
        if (classes.finished) {
          tippyContent = "Finished!";
        } else if (classes.unfinished) {
          tippyContent = "Not started...";
        } else if (classes.reading) {
          tippyContent = "Started...";
        }
        return tippyContent;
      }
    },

    booksInSeriesIcon: function(book) {
      if ( book.free && book.notInLibrary ) {
        return 'fa-solid fa-circle-minus';
      }
      else if ( book.plus && book.notInLibrary ) {
        return 'fa-solid fa-circle-plus';
      }
      else if ( book.notInLibrary ) {
        return 'fa-solid fa-ban';
      }
      else if (book.inWishlist) {
        return 'fa-solid fa-hand-holding-heart';
      }
      else {
        const classes = this.numbersClass(book);
        var iconClass = "";
        if (classes.finished) {
          iconClass = "fa-solid fa-archive";
        } else if (classes.unfinished) {
          iconClass = "fa-solid fa-book";
        } else if (classes.reading) {
          iconClass = "fa-solid fa-book-reader";
        }
        return iconClass;
      }
    }
  }
};
</script>

<style lang="scss">

</style>
