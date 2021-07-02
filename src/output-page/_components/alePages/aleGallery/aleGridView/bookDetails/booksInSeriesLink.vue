<template>
  <div class="linky">
    <a v-if="book.notInLibrary && book.asin" class="clickety-click" target="_blank" :href="makeUrl('book', book.asin)">
      <span class="numbers">{{ book.bookNumbers }}</span>
      <span class="title">{{ title }}</span>
    </a>
    <router-link v-else 
    class="clickety-click"
    :event="linkDisabled ? '' : 'click'" 
    @click.native="linkDisabled && openBook($event)"
    :to="routerLink"
    :content="(book.notInLibrary ? '<strong>Not available:</strong> ' : '') +  (this.book.titleLong || this.book.title)" v-tippy="{ maxWidth: 350, placement: 'right', flipBehavior: ['right', 'top', 'bottom'] }"
    >
      <span class="numbers">{{ book.bookNumbers }}</span>
      <span class="title">{{ title }}</span>
    </router-link>
  </div>
</template>

<script>
import makeUrl from "@output-mixins/makeFullUrl";
import { faBullseye } from '@fortawesome/free-solid-svg-icons';

export default {
  name: "booksInSeriesLink",
  props: ["series","book", "index"],
  mixins: [makeUrl],
  data: function() {
    return {
      seriesPage: false,
      routerLink: null,
      title: null,
      linkDisabled: false,
    };
  },
  
  created: function() {
    
    let vue = this;
    
    // Because these links lead to the series page, they are disabled
    // when on that page and instead a different book is opened...
    // Except when the link leads to another series...
    this.seriesPage = this.$route.name === 'series';
    
    this.routerLink = { 
      name: 'series', 
      params: { series: this.series.asin }, 
      query: { book: this.book.asin, subPageSource: 'books' }, 
    };
    
    this.title = this.book.title || this.book.titleLong;
    // If the series list contains duplicate titles, show long title instead as an attempt to make sure
    // the titles aren't all duplicates....
    if ( this.book.titleLong ) {
      var foundDuplicateTitle = _.find( this.series.books, function( book ) {
        return book.asin !== vue.book.asin && book.title === vue.book.title;
      });
      if ( !!foundDuplicateTitle ) this.title = this.book.titleLong;
    }
    
    this.linkDisabled = this.seriesPage && this.$route.params.series === this.series.asin;
    
  },

  methods: {
    
    openBook: function( e ) {
      e.preventDefault();
      if ( this.book && !this.book.notInLibrary && this.book.asin !== this.$route.query.book ) {
        this.$root.$emit('book-clicked', { book: this.book.obj });
      }
    },
    
  }
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";

.linky {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
