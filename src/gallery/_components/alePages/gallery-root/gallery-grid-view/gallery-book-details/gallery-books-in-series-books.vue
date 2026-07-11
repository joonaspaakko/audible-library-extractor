<template>
<div class="cover-grid" v-if="$store.state.sticky.booksInSeriesCoverGrid">
  <div
    :data-series-name="series.name" class="cover-grid-item" :class="numbersClass(seriesBook)"
    :content="iconTippyContent(seriesBook)" v-tippy="{ placement: 'top' }"
    v-for="(seriesBook, index) in filteredBooks" :key="seriesBook.asin"
  >
    <gallery-books-in-series-link :series="series" :book="seriesBook" :index="index" :cover="true" />
    <div class="cover-open-link" v-if="$store.state.sticky.booksInSeriesLinkMode !== 'off'">
      <gallery-open-in-app v-if="$store.state.sticky.booksInSeriesLinkMode === 'app'" :size="10" :book="seriesBook" :muted="true" />
      <gallery-goodreads-link v-else :size="10" :book="seriesBook" :icon="true" :muted="true" />
      <span class="cover-open-link-label">{{ $store.state.sticky.booksInSeriesLinkMode === 'app' ? 'Open in app' : 'Goodreads' }}</span>
    </div>
  </div>
</div>
<div v-else>
  <div
    :data-series-name="series.name" class="numbers-list-item" :class="numbersClass(seriesBook)"
    v-for="(seriesBook, index) in filteredBooks" :key="seriesBook.asin"
  >

    <gallery-open-in-app v-if="$store.state.sticky.booksInSeriesLinkMode === 'app'" :size="14" :book="seriesBook" :muted="true" />
    <gallery-goodreads-link v-else-if="$store.state.sticky.booksInSeriesLinkMode === 'goodreads'" :size="14" :book="seriesBook" :icon="true" :muted="true"  />
    
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
import IconClock            from '~icons/fa6-solid/clock?raw';
import IconBan              from '~icons/fa6-solid/ban?raw';
import IconBoxArchive       from '~icons/fa6-solid/box-archive?raw';
import IconBook             from '~icons/fa6-solid/book?raw';
import IconBookOpenReader   from '~icons/fa6-solid/book-open-reader?raw';
import IconTriangleExclamation from '~icons/fa6-solid/triangle-exclamation?raw';

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
        if ( this.isUnavailable(book) && this.$store.state.sticky.booksInSeriesHideUnavailable ) {
          return false;
        }
        else if ( _.get(book, 'notInLibrary') ) {
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

    isUnavailable: function(book) {
      return book.notInLibrary && !_.get(book, 'obj.cover') && !book.cover;
    },

    numbersClass: function(book) {
      var progress = _.get(book, 'obj.progress');
      return {
        finished: progress && progress.toLowerCase().match("finished") ? true : false,
        reading: progress && !progress.toLowerCase().match("finished") ? true : false,
        unfinished: !progress,
        current: this.book.asin === _.get(book, 'obj.asin'),
        'not-in-library': book.notInLibrary,
        'not-available': this.isUnavailable(book),
        'in-wishlist': book.inWishlist,
        preorder: !!book.preorder,
      };
    },

    iconTippyContent: function(book) {
      if ( book.free && book.notInLibrary ) {
        return 'This book is free...';
      }
      else if ( book.plus && book.notInLibrary ) {
        return 'In the plus catalog...';
      }
      else if (book.inWishlist) {
        return 'In wishlist';
      }
      else if ( book.preorder ) {
        return book.preorder.releaseDate ? ( 'Pre-ordered. Releases ' + book.preorder.releaseDate ) : 'Pre-ordered';
      }
      else if ( this.isUnavailable(book) ) {
        return 'Not in your library and not purchasable on Audible...';
      }
      else if ( book.notInLibrary ) {
        return 'Not in library...';
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
      else if ( book.preorder ) {
        return IconClock;
      }
      else if ( this.isUnavailable(book) ) {
        return IconTriangleExclamation;
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
