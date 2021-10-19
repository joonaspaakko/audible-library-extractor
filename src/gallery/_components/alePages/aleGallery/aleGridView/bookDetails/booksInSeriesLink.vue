<template>
  <div class="linky">
    <span v-if="seriesName && linkDisabled" class="series-not-link">{{ seriesName }}</span>
    <a v-else-if="!seriesName && book.notInLibrary && book.asin" class="clickety-click cursor-alias" target="_blank" rel="noopener noreferrer" :href="makeUrl('book', book.asin)"
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
    :content="seriesName ? null : (book.notInLibrary ? '<strong>Not available:</strong> ' : '') + ( book.title !== book.titleShort ? book.title : '')" v-tippy="{ maxWidth: 350, placement: 'right', flipBehavior: ['right', 'top', 'bottom'] }"
    >
      <span v-if="seriesName">
        {{ seriesName }}
      </span>
      <span v-if="!seriesName" class="numbers">{{ book.bookNumbers }}</span>
      <span v-if="!seriesName" class="title">{{ book.titleShort || book.title }}</span>
    </router-link>
  </div>
</template>

<script>
import makeUrl from "@output-mixins/makeFullUrl";

export default {
  name: "booksInSeriesLink",
  props: ["series","book", "index", "seriesName"],
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
      query: { subPageSource: 'books' }, 
    };
    
    if ( this.seriesName ) {
      this.routerLink.query.closeBookDetails = true;
    }
    else {
      this.routerLink.query.book = this.book.asin;
    }
    
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

.series-not-link {
  @include themify($themes) {
    color: rgba(themed(frontColor), 0.85);
  }
}

</style>
