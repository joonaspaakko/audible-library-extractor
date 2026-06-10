<template>
<div>
  <div
    :data-series-name="series.name" class="numbers-list-item" :class="numbersClass(seriesBook)"
    v-for="(seriesBook, index) in filteredBooks" :key="seriesBook.asin"
  > 
  
    <gallery-open-in-app v-if="$store.state.sticky.booksInSeriesOpenInApp" :size="14" :book="seriesBook" :muted="true" />
    <gallery-goodreads-link v-else :size="14" :book="seriesBook" :icon="true" :muted="true"  />
    
    <span class="icon" :content="iconTippyContent(seriesBook)" v-tippy="{ placement: 'left', flipBehavior: ['left', 'top', 'bottom'] }" v-html="booksInSeriesIcon(seriesBook)"></span>
    
    <gallery-books-in-series-link :series="series" :book="seriesBook" :index="index" />
    
  </div>
</div>
</template>

<script>
// ICON IMPORTS
import IconCircleMinus      from '~icons/fa6-solid/circle-minus?raw';
import IconCirclePlus       from '~icons/fa6-solid/circle-plus?raw';
import IconHandHoldingHeart from '~icons/fa6-solid/hand-holding-heart?raw';
import IconBan              from '~icons/fa6-solid/ban?raw';
import IconBoxArchive       from '~icons/fa6-solid/box-archive?raw';
import IconBook             from '~icons/fa6-solid/book?raw';
import IconBookOpenReader   from '~icons/fa6-solid/book-open-reader?raw';

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
        return IconCircleMinus;
      }
      else if ( book.plus && book.notInLibrary ) {
        return IconCirclePlus;
      }
      else if ( book.inWishlist ) {
        return IconHandHoldingHeart;
      }
      else if ( book.notInLibrary ) {
        return IconBan;
      }
      else {
        const classes = this.numbersClass(book);
        if ( classes.finished ) {
          return IconBoxArchive;
        }
        else if ( classes.reading ) {
          return IconBookOpenReader;
        }
        else {
          return IconBook;
        }
      }
    }
  }
};
</script>

<style lang="scss">

</style>
