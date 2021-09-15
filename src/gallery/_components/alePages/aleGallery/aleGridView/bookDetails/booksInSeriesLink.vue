<template>
  <div class="linky">
    <a v-if="book.notInLibrary && book.asin" class="clickety-click cursor-alias" target="_blank" :href="makeUrl('book', book.asin)"
    :content="book.title !== book.titleShort ? book.title : false" v-tippy="{ maxWidth: 350, placement: 'right', flipBehavior: ['right', 'top', 'bottom'] }"
    >
      <span class="numbers">{{ book.bookNumbers }}</span>
      <span class="title">{{ book.titleShort || book.title  }}</span>
    </a>
    <router-link v-else 
    class="clickety-click" :class="{ 'link-disabled': linkDisabled }"
    :event="linkDisabled ? '' : 'click'" 
    @click.native="linkDisabled && openBook($event)" 
    :to="linkDisabled ? '' : routerLink"
    :content="(book.notInLibrary ? '<strong>Not available:</strong> ' : '') + ( book.title !== book.titleShort ? book.title : '')" v-tippy="{ maxWidth: 350, placement: 'right', flipBehavior: ['right', 'top', 'bottom'] }"
    >
      <span class="numbers">{{ book.bookNumbers }}</span>
      <span class="title">{{ book.titleShort || book.title }}</span>
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
    
    this.linkDisabled = this.book.notInLibrary || this.seriesPage && this.$route.params.series === this.series.asin;
    
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
  flex: 1;
}
</style>
