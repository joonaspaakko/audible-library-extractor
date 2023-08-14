<template>
  <div
  class="book-summary-wrapper"
  ref="summaryWrapper"
  :class="{ expanded: summary.readmore.toggle }"
  :style="{
    maxHeight: summary.maxHeight ? summary.maxHeight + 'px' : null,
    paddingBottom: summary.readmore.toggle ? '50px' : '0px',
  }"
  >
    <!-- paddingBottom: '65px', -->
    
    <div class="book-summary" ref="summary">
      
      <div class="summary-meta-top" ref="summaryMetaTop">
        
        <gallery-book-details-title :book="book" />        
        
        <div class="categories" v-if="book.categories">
          <gallery-array-to-html v-if="book.categories" label="categories" :noLabel="true" :array="book.categories" :chevron="true" />
        </div>
        
        <div class="inline-children smoll-text">
          
          <gallery-book-tags v-if="book.tags" :book="book"></gallery-book-tags>
          
          <div class="info-tags">
            <div class="info-tag store-page-changed" v-if="book.storePageChanged" v-tippy="{ maxWidth: 300 }" content="There is a store page for the book, but it's for a different version of the book. <br><br>This is the reason why some data is unavailable.">
              <fa6-solid-basket-shopping/>
              changed
            </div>
            <div class="info-tag store-page-missing" v-else-if="book.storePageMissing" v-tippy="{ maxWidth: 300 }" content="Store page was possibly removed or it became unavailable in your region since it was added. In some cases there may still be a store page for a different version of the book. <br><br>This is the reason why some data is unavailable.">
              <fa6-solid-basket-shopping/>
              missing
            </div>
            
            <div class="info-tag plus-catalog" :class="{ 'plus-catalog-unavailable': book.unavailable }" v-if="book.fromPlusCatalog" v-tippy="{ maxWidth: 300 }" :content="book.unavailable ? 'Used to be in the plus catalog but you no longer have access to it' : 'In the plus catalog'">
              <fa6-solid-circle-plus/>
              Plus catalog
            </div>
            
            <div class="info-tag whispersync" :class="{ owned: book.whispersync === 'owned' }" v-if="book.whispersync" v-tippy="{ maxWidth: 300 }" :content="book.whispersync === 'owned' ? 'I own the Kindle version' : 'Kindle book available for purchase...'">
              <fa6-solid-headphones-simple/>
              whispersync
            </div>
          </div>
          
          <div class="release-date" v-if="book.releaseDate" v-tippy content="YYYY-MM-DD">
            <span class="strong-label">Released: </span>
            <span>{{ book.releaseDate }}</span>
          </div>
          
        </div>
        
        <div class="meta-padding"></div>
        
      </div>
      
      <div class="summary-inner-wrap" ref="summaryInnerWrap" v-if="summaryHTML" v-html="summaryHTML"></div>
      
    </div>
    
    <div
    class="summary-read-more"
    ref="readMoreBtn"
    @click="summaryReadMoreclick"
    v-if="showReadMore"
    >
      <!-- 
        FIXME: doesn't always show up on mobile. Flipping the phone sideways and then back to portrait I'm guessing readoes the math and this is able to show up
        // This is the summary I noticed the issue with...
        // https://joonaspaakko.github.io/ale-test-new/#/library?book=B01B8AN3SQ
      -->
      <span>{{ summary.readmore.toggle ? "Read less" : "Read more" }}</span>
      <gallery-vertical-chevron class="read-more-icon" :up="summary.readmore.toggle" />
    </div>
  </div>
</template>

<script>
import makeUrl from "@output-mixins/gallery-makeFullUrl.js";

export default {
  name: "bookSummary",
  props: ["book", "bookSummary", "mobileWidth"],
  mixins: [makeUrl],
  data: function() {
    return {
      summary: {
        readmore: {
          toggle: false,  
          exists: false
        },
        maxHeight: null,
        maxHeightTemp: null,
        fullHeight: null,
      }
    };
  },
  
  watch: {
    summaryHTML( fetched ) {
      if ( fetched ) {        
        this.getSummaryMaxHeight();
      }
    },
  },

  computed: {
    summaryHTML: function() {
      return this.book.summary || this.bookSummary || this.book.blurb;
    },
    showReadMore: function() {
      const summary = this.summary;
      // console.log( 'showReadmore - Has maxHeightTemp: ', summary.maxHeightTemp, 'summary.fullHeight > summary.maxHeightTemp', (summary.fullHeight > summary.maxHeightTemp) )
      if (  !summary.maxHeightTemp ) return;
      return summary.fullHeight > summary.maxHeightTemp;
    },
  },

  mounted: function() {
    this.getSummaryMaxHeight();
  },

  created: function() {
    this.$compEmitter.on("afterWindowResize", this.windowResized);
    this.$compEmitter.on("resizeSummary", this.getSummaryMaxHeight);
  },

  beforeUnmount: function() {
    this.$compEmitter.off("afterWindowResize", this.windowResized);
    this.$compEmitter.off("resizeSummary", this.getSummaryMaxHeight);
  },

  methods: {
    
    getSummaryMaxHeight() {

      if ( !this.summaryHTML ) return;
      this.$nextTick(function() {
          
        const minHeight = _.get(this.$refs, 'summaryMetaTop.offsetHeight', 0);
        const minHeightExtra = minHeight + 300;
        const summaryFullHeight = _.get(this.$refs, 'summary.offsetHeight', 0);
        // const summaryFullHeight = _.get(this.$refs, 'summary.scrollHeight', 0);
        this.summary.fullHeight = summaryFullHeight;
        
        // const wrapper = document.querySelector('#ale-bookdetails .details-wrap');
        const sidebar = document.querySelector('#ale-bookdetails .information');
        const sidebarHeight = _.get( sidebar, 'offsetHeight', 0 );
        
        let maxHeight = sidebarHeight;
        if ( this.mobileWidth || summaryFullHeight > minHeightExtra && minHeightExtra > sidebarHeight ) maxHeight = minHeightExtra; 
        
        this.summary.maxHeight = maxHeight;
        this.summary.maxHeightTemp = maxHeight;
        // console.log( minHeightExtra )
        // console.log('%c' + ' ' + '', 'background: #003191; color: #fff; padding: 2px 5px; border-radius: 8px;', _.clone(this.summary));
        
      });
      
    },
    
    windowResized() {
      this.getSummaryMaxHeight();
    },

    summaryReadMoreclick: function() {
      
      this.summary.readmore.toggle = !this.summary.readmore.toggle ? true : false;
      this.summary.maxHeight = this.summary.readmore.toggle ? "none" : this.summary.maxHeightTemp;
      
      // Scrolls up in an attempt to retain the scroll position in relation to the readmore button
      if ( !this.summary.readmore.toggle ) {
        const btnOffset = this.$refs.readMoreBtn.getBoundingClientRect().top;
        this.$nextTick(function() {
          scroll({
            top: (
              this.$refs.readMoreBtn.getBoundingClientRect().top +
              window.pageYOffset -
              btnOffset
            ),
          });
        });
      }
      
    },
    
  }
};
</script>

<style lang="scss">


.book-summary-wrapper .summary-meta-top .meta-padding {
  width: 100%;
  height: 5px;
}

.book-summary-wrapper {
  flex: 1;
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
  
  .inline-children {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
  }
  .inline-children > * { display: inline-block; }
  
  .release-date {
    padding-top: 5px;
  }
  
  .info-tag {
    outline: none;
    cursor: default;
    border-radius: 999999px;
    // margin-left: 5px;
    // &:first-of-type { margin-left: 0; }
    // padding: 1px 6px 1px 4px;
    padding: 3px 5px;
    margin: 6px 6px 0 0;
    color: #fff;
    svg { display: inline-block; padding-right: 3px; }
    display: inline-flex !important; 
    flex-direction: row;
    justify-items: center;
    justify-content: center;
    align-items: center;
    align-content: center;
    font-size: .9em;
    white-space: nowrap;
    
    &.store-page-changed {
      background: #bd3f00;
      [data-icon] {
        font-size: .85em;
        position: relative;
        top: -1px;
      }
    }
    
    &.store-page-missing {
      background: #990017;
      [data-icon] {
        font-size: .85em;
        position: relative;
        top: -1px;
      }
    }
    
    &.store-page-info {
      // padding: 2px;
      background: #252525;
    }
    
    &.plus-catalog {
        @include themify($themes) { background: themed(audibleOrange); }
      &.plus-catalog-unavailable {
        background: #bd3f00;
      }
    }
    
    &.whispersync {
      background: #106be6;
      // .owned {
      //   margin-left: 4px;
      //   display: inline-block;
      //   border-radius: 9999px;
      //   width: 7px;
      //   height: 7px;
      //   background: #61bd34;
      //   // background: #106be6;
      //   // background: #fff;
      //   border: 1px solid #fff;
      // }
      
      // &.owned svg {
      //   color: #f79a33;
      // }
      &.owned {
        background: #61bd34;
      }
    }
  }
  
  .summary-inner-wrap {
    margin-top: 1em;
  }
  
  // Normalizes the top margin in the summary area.
  .summary-inner-wrap p {
    margin-top: 1em;  
    margin-bottom: 1em;
    &:first-child {
      margin-top: 0;
    }
  }
  
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

.book-summary-wrapper .book-summary {
  position: relative;
  z-index: 0;
  // overflow: hidden;
  // overflow-x: hidden;
  // overflow-y: auto;
  // flex-grow: 1;
  text-align: left;
  // padding-bottom: 75px;
  .categories {
    line-height: 1.2em;
    margin-top: 4px;
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
.read-more-icon {
  position: relative;
  top: 3px;
  padding-left: 5px;
}

</style>
