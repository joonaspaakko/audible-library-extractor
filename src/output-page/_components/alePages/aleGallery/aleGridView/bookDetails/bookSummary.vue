<template>
  <div
  class="book-summary-wrapper"
  ref="summaryWrapper"
  :class="{ expanded: summary.readmore.toggle }"
  :style="{
    maxHeight: summary.maxHeight,
    paddingBottom: summary.readmore.toggle ? '40px' : '0px'
  }"
  >
    <div class="book-summary" ref="summary">
      
      <div class="summary-meta-top" ref="summaryMetaTop">
          
        <h2 class="book-title">
          <a :href="makeUrl('book', book.asin)" target="_blank" rel="noopener nofollow noreferrer">
            {{ book.title }}
          </a>
        </h2>
        
        <div class="categories" v-if="book.categories">
          <arrayToHTML v-if="book.categories" label="Categories" :array="book.categories" delim=" > " ></arrayToHTML>
        </div>
        
        <div class="inline-children smoll-text">
          <div class="release-date" v-if="book.releaseDate">
            <span class="strong-label">Released:</span>
            <span>{{ book.releaseDate }}</span>
          </div>
          
          <div class="store-page-changed" v-if="book.storePageChanged" v-tippy="{ maxWidth: 300 }" content="There is a store page for the book, but it's for a different version of the book. <br><br>This is the reason why some data is unavailable.">
            <font-awesome :icon="['fas', 'shopping-bag']" />
            changed
          </div>
          <div class="store-page-missing" v-else-if="book.storePageMissing" v-tippy="{ maxWidth: 300 }" content="Store page was either removed or it became unavailable in your region since the purchase. In some cases there may still be a store page for a different version of the book. <br><br>This is the reason why some data is unavailable.">
            <font-awesome :icon="['fas', 'shopping-bag']" />
            missing
          </div>
          
        </div>
        
      </div>
      
      <div class="summary-inner-wrap" v-if="summaryHTML" v-html="summaryHTML"></div>
      
    </div>

    <div
    class="summary-read-more"
    ref="readMoreBtn"
    @click="summaryReadMoreclick"
    v-if="summary.maxHeight"
    >
      <span>{{ summary.readmore.toggle ? "Read less" : "Read more" }}</span>
      <font-awesome fas :icon="summary.readmore.toggle ? 'chevron-up' : 'chevron-down'" />
    </div>
  </div>
</template>

<script>
import makeUrl from "@output-mixins/makeFullUrl";
import arrayToHTML from "@output-comps/snippets/arrayToHTML";

export default {
  name: "bookSummary",
  props: ["book", "detailsEl"],
  mixins: [makeUrl],
  components: { arrayToHTML },
  data: function() {
    return {
      summary: {
        readmore: {
          toggle: false,
          exists: false
        },
        maxHeight: null,
        maxHeightTemp: null
      }
    };
  },

  computed: {
    summaryHTML: function() {
      return this.book.summary || this.book.blurb;
    }
  },

  mounted: function() {
    this.$nextTick(function() {
      this.getSummaryMaxHeight();
    });
  },

  created: function() {
    this.$root.$on("afterWindowResize", this.getSummaryMaxHeight);
    this.$root.$on("resizeSummary", this.getSummaryMaxHeight);
  },

  beforeDestroy: function() {
    this.$root.$off("afterWindowResize", this.getSummaryMaxHeight);
    this.$root.$off("resizeSummary", this.getSummaryMaxHeight);
  },

  methods: {
    getSummaryMaxHeight: function() {
      if ( window.innerWidth <= 688 ) {
        if ( this.summaryHTML ) {
          this.summary.maxHeight = this.$refs.summaryMetaTop.offsetHeight + 260 + "px";
          this.summary.maxHeightTemp = this.summary.maxHeight;
        }
      } else {
        this.$nextTick(function() {
          const information = this.detailsEl.querySelector('.information');
          const informationH = information.offsetHeight;
          const summary = this.$refs.summary;
          const summaryH = summary.offsetHeight;
          const summaryTooSwoll = summaryH > informationH;
          // this.summary.readmore.exists = summaryTooSwoll ? true : false;
          this.summary.maxHeight = summaryTooSwoll ? informationH + "px" : null;
          this.summary.maxHeightTemp = informationH + "px";
        });
      }
    },

    summaryReadMoreclick: function() {
      const btnOffset = this.$refs.readMoreBtn.getBoundingClientRect().top;
      this.summary.readmore.toggle = !this.summary.readmore.toggle
        ? true
        : false;
      this.summary.maxHeight = this.summary.readmore.toggle
        ? "none"
        : this.summary.maxHeightTemp;
      if (!this.summary.readmore.toggle) {
        this.$nextTick(function() {
          scroll({
            top:
              this.$refs.readMoreBtn.getBoundingClientRect().top +
              window.pageYOffset -
              btnOffset
            // behavior: 'smooth',
          });
          // this.$refs.readMoreBtn.scrollIntoView({ behavior: 'smooth' });
          // this.$refs.summaryWrapper.scrollTop = 0;
        });
      }
    }

    // onWindowResize: function() {
    // 	// if ( !this.gallery.details.readmore.toggle ) {
    //     this.$nextTick(function() {
    //       this.getSummaryMaxHeight();
    //     console.log('%c' + 'getSummaryMaxHeight' + '', 'background: #dbff00; color: #000; padding: 2px 5px; border-radius: 8px;');
    //     });
    //   // }
    // },
  }
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";

.book-summary-wrapper {
  // transition: all 200ms linear;
  max-height: none;
  padding-bottom: 0px;
  overflow: hidden;
  position: relative;
  .summary-read-more {
    text-align: center;
    cursor: pointer;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    position: absolute;
    z-index: 5;
    right: 0;
    bottom: 0px;
    left: 0;
    [data-icon] {
      padding-left: 10px;
    }
    &:after {
      content: "";
      position: absolute;
      z-index: -1;
      right: 0;
      bottom: 0;
      left: 0;
      height: 75px;
    }
  }
  
  .store-page-missing,
  .store-page-changed,
  .store-page-info {
    border-radius: 999999px;
    padding: 2px 7px;
    background: #990017;
    color: #fff;
    svg { padding-right: 2px; }
  }
  
  .store-page-changed {
    background: #bd3f00;
  }
  
  .store-page-info {
    padding: 2px;
    background: #252525;
  }
  
}

// Normalizes the top margin in the summary area.
.summary-inner-wrap {
  p {
    margin-top: 1em;
    margin-bottom: 1em;
  }
  p:first-child {
    margin-top: 0;
  }
  margin-top: 1em;
}

.theme-light #ale-bookdetails .summary-read-more:after {
  background: -moz-linear-gradient(
    top,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 1) 51%,
    rgba(255, 255, 255, 1) 99%
  );
  background: -webkit-linear-gradient(
    top,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 1) 51%,
    rgba(255, 255, 255, 1) 99%
  );
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 1) 51%,
    rgba(255, 255, 255, 1) 99%
  );
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00f9f8f8', endColorstr='#f9f8f8',GradientType=0 );
}
.theme-dark #ale-bookdetails .summary-read-more:after {
  background: -moz-linear-gradient(
    top,
    rgba(21, 23, 27, 0) 0%,
    rgba(21, 23, 27, 1) 51%,
    rgba(21, 23, 27, 1) 99%
  );
  background: -webkit-linear-gradient(
    top,
    rgba(21, 23, 27, 0) 0%,
    rgba(21, 23, 27, 1) 51%,
    rgba(21, 23, 27, 1) 99%
  );
  background: linear-gradient(
    to bottom,
    rgba(21, 23, 27, 0) 0%,
    rgba(21, 23, 27, 1) 51%,
    rgba(21, 23, 27, 1) 99%
  );
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#0015171b', endColorstr='#15171b',GradientType=0 );
}

.book-summary {
  position: relative;
  z-index: 0;
  // overflow: hidden;
  // overflow-x: hidden;
  // overflow-y: auto;
  // flex-grow: 1;
  text-align: left;
  h2.book-title {
    font-size: 1.8em;
    line-height: 1.1em;
    margin: 0;
    margin-bottom: 10px;
    a {
      white-space: normal;
      text-decoration: none;
      @include themify($themes) {
        color: themed(frontColor);
      }
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .categories {
    line-height: 1.2em;
  }
  .inline-children {
    margin-top: 6px;
    > * {
      display: inline-block;
    }
  }
  .smoll-text {
    font-size: 0.8em;
    line-height: 1.2em;
  }
} // .summary

.expanded.book-summary-wrapper {
  max-height: none !important;
}

.expanded .summary-read-more:after {
  height: 30px;
}
</style>
