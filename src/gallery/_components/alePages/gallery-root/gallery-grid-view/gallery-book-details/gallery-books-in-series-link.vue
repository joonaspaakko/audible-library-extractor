<template>
  <div class="linky" :class="{ 'cover-linky': cover }">
    <span v-if="seriesName && linkDisabled" class="series-not-link">{{ seriesName }}</span>
    <a v-else-if="!seriesName && book.notInLibrary && book.asin" class="clickety-click cursor-alias" target="_blank" rel="noopener noreferrer" :href="makeUrl('book', book.asin)"
    :content="book.title !== book.titleShort ? book.title : false" v-tippy="{ maxWidth: 350, placement: 'right', flipBehavior: ['right', 'top', 'bottom'] }"
    >
      <span v-if="cover" class="cover-wrap" :class="{ 'not-in-library': book.notInLibrary }">
        <img crossorigin="anonymous" draggable="false" :src="coverUrl" alt="" />
        <div class="cover-number" v-if="book.bookNumbers" :title="book.bookNumbers">{{ book.bookNumbers }}</div>
        <div class="cover-dots" v-if="coverDots.length">
          <div v-for="dot in coverDots" :key="dot.key" :class="dot.key"></div>
        </div>
      </span>
      <template v-else>
        <span class="numbers">{{ book.bookNumbers }}</span>
        <span class="title">{{ book.titleShort || book.title  }}</span>
        <fa6-solid-arrow-up-right-from-square class="external-link-icon" />
      </template>
    </a>
    <router-link v-else 
    class="clickety-click" :class="{ 'link-disabled': linkDisabled, 'same-series': sameSeries }"
    :event="linkDisabled ? '' : 'click'" 
    @click.native="linkDisabled && openBook($event)" 
    :to="linkDisabled ? '' : routerLink"
    :content="seriesName ? null : (book.notInLibrary ? '<strong>Not available:</strong> ' : '') + ( book.title !== book.titleShort ? book.title : '')" v-tippy="{ maxWidth: 350, placement: 'right', flipBehavior: ['right', 'top', 'bottom'] }"
    >
      <span v-if="seriesName" style="white-space: normal; padding-bottom: 3px; display: inline-block;">
        {{ seriesName }}
      </span>
      <span v-if="!seriesName && cover" class="cover-wrap" :class="{ 'not-in-library': book.notInLibrary }">
        <img crossorigin="anonymous" draggable="false" :src="coverUrl" alt="" />
        <div class="cover-number" v-if="book.bookNumbers" :title="book.bookNumbers">{{ book.bookNumbers }}</div>
        <div class="cover-dots" v-if="coverDots.length">
          <div v-for="dot in coverDots" :key="dot.key" :class="dot.key"></div>
        </div>
      </span>
      <template v-if="!seriesName && !cover">
        <span class="numbers">{{ book.bookNumbers }}</span>
        <span class="title">{{ book.titleShort || book.title }}</span>
      </template>
    </router-link>
  </div>
</template>

<script>
import makeUrl from "@output-mixins/gallery-makeFullUrl.js";
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";

export default {
  name: "booksInSeriesLink",
  props: ["series", "book", "index", "seriesName", "cover"],
  mixins: [makeUrl, makeCoverUrl],
  data: function() {
    return {
      seriesPage: false,
      routerLink: null,
      title: null,
      linkDisabled: false,
      sameSeries: null,
    };
  },

  computed: {
    coverUrl: function() {
      return this.makeCoverUrl( _.get(this.book, 'obj.cover') || this.book.cover );
    },
    coverDots: function() {
      const obj = this.book.obj || {};
      return _.compact([
        obj.favorite && { key: 'favorite-marker' },
        obj.progress === 'Finished' && { key: 'finished-marker' },
        obj.fromPlusCatalog && { key: 'plus-catalog-marker' },
        obj.whispersync === 'owned' && { key: 'kindle-marker' },
      ]);
    },
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
      query: { subPageSource: 'library', refresh: true }, 
    };
    
    if ( this.seriesName ) {
      this.routerLink.query.closeBookDetails = true;
    }
    else {
      this.routerLink.query.book = this.book.asin;
    }
        
    const sameSeries = this.seriesPage && this.$route.params.series === this.series.asin;
    this.linkDisabled = this.book.notInLibrary || sameSeries;
    this.sameSeries = sameSeries;
    
  },

  methods: {
    
    openBook: function( e ) {
      e.preventDefault();
      if ( this.book && !this.book.notInLibrary && this.book.asin !== this.$route.query.book ) {
        this.$compEmitter.emit('book-clicked', this.book.obj.asin);
      }
    },
    
  }
};
</script>

<style lang="scss" scoped>


.same-series { cursor: pointer !important; }
  
.linky {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  .title {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .external-link-icon {
    flex-shrink: 0;
    margin-left: auto;
    padding-left: 4px;
    font-size: 10px;
    @include themify($themes) {
      color: rgba(themed(frontColor), 0.4);
    }
  }
}
.series-name .linky {
  white-space: normal;
  overflow:visible;
}

.series-not-link {
  @include themify($themes) {
    color: rgba(themed(frontColor), 0.85);
  }
}

.cover-linky {
  white-space: normal;
  overflow: visible;
  flex: unset;
}
.cover-wrap {
  display: block;
  width: 100%;
  padding-bottom: 100%;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  @include themify($themes) {
    border: 1px solid rgba(themed(frontColor), 0.15);
  }
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    -webkit-user-drag: none;
  }
  &.not-in-library img {
    filter: grayscale(1);
  }

  .cover-number {
    position: absolute;
    z-index: 2;
    top: 4px;
    right: 4px;
    box-sizing: border-box;
    max-width: calc(100% - 8px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 2px 4px;
    font-size: 10px;
    font-weight: 700;
    line-height: 1.2;
    color: #fff;
    background: #c30d2d;
    box-shadow: -1px 1px 2px rgba(#000, 0.25);
    border-radius: 3px;

    .not-in-library & {
      background: #666;
    }
  }

  .cover-dots {
    position: absolute;
    z-index: 2;
    left: 3px;
    bottom: 3px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    > div {
      width: 8px;
      height: 8px;
      border-radius: 500px;
      margin-top: 3px;
      &:first-child { margin-top: 0; }
    }
    .favorite-marker { background: red; }
    .finished-marker { background: #62bd25; }
    .plus-catalog-marker {
      @include themify($themes) { background: themed(audibleOrange); }
    }
    .kindle-marker { background: #106be6; }
  }
}

</style>
