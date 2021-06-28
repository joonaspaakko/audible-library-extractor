<template>
  <div
  id="ale-bookdetails"
  ref="bookDetails"
  v-shortkey.once="['esc']"
  @shortkey="closeBookDetails()"
  :class="{ 'spreadsheet-details': $store.state.sticky.viewMode === 'spreadsheet' }"
  > 
    <div v-if="$store.state.sticky.viewMode !== 'spreadsheet'" class="arrow" ref="arrow"></div>
    <div
    id="book-info-container"
    v-shortkey.once="{ left: ['arrowleft'], up: ['arrowup'], right: ['arrowright'], down: ['arrowdown'], tab: ['tab'], tabShift: ['tab', 'shift'] }"
    @shortkey="openAdjacentBookDetails"
    >
    
      <div class="inner-wrap" :style="{ maxWidth: getMaxWidth }">
        
        <font-awesome class="book-details-info" :icon="['fas', 'info-circle']" v-tippy="{ placement: 'left', flipBehavior: ['left', 'right'], allowHTML: true }" content="<div style='text-align: left;'><h3 style='margin: 0; padding-top: 10px; padding-left: 15px;'>Shortcuts</h3><ul><li><strong>Close:</strong> Esc</li><li><strong>Previous book:</strong> shift+tab, left arrow, up arrow (spreadsheet)</li><li><strong>Next book:</strong> tab, right arrow, down arrow (spreadsheet)</li><li><strong>Previous row:</strong> up arrow (Grid view)</li><li><strong>Next row:</strong> down arrow (Grid view)</li></ul></div>" />
        
        <div class="top">
          <div class="information" ref="information">
            <div class="cover-wrap">
              <a :href="makeUrl('book', book.asin)" target="_blank">
                <div class="progressbar">
                  <div class="progress" :style="progressbarWidth(book)">
                    <!-- <div class="progress-tooltip" v-if="book.progress && book.length" :content="progressTooltip( book )" v-tippy="{ placement: 'top',  arrow: true, theme: general.tippyTheme, showOnInit: true, trigger: 'manual', hideOnClick: false, boundary: progressToolTipBoundaryEl() }"></div> -->
                  </div>
                </div>
                <img 
                  class="cover"
                  v-if="book.cover && $store.state.windowWidth > 688"
                  :src="makeCoverUrl(book.cover)"
                />
              </a>
            </div>
            <div class="progress-info" v-html="progressInfo(book)"></div>
            
            <div class="basic-details">
              <book-info-toolbar :book="book"></book-info-toolbar>
              <book-basic-info :book="book"></book-basic-info>
            </div>
            
            <books-in-series :book="book"></books-in-series>
            
          </div> <!-- .information -->

          <book-summary :detailsEl="$el" :book="book" v-if="book.summary || bookSummaryJSON" :bookSummary="bookSummaryJSON"></book-summary>
        </div>

        <carousel v-if="!loading && peopleAlsoBought" :books="peopleAlsoBought" :key="this.maxWidth">
          <!-- People who bought this also bought: -->
          Listeners also enjoyed
        </carousel>

        <carousel v-if="!loading && book.moreLikeThis" :books="book.moreLikeThis" :key="this.maxWidth">
          More listens like this
        </carousel>
      </div>
      <!-- .inner-wrap -->
    </div>
    <!-- #book-info-container -->
  </div>
  <!-- #ale-bookdetails -->
</template>

<script>
// import sortBookNumbers from '@output-mixins/sort/bookNumbers';
import timeStringToSeconds from "@output-mixins/timeStringToSeconds";
import secondsToTimeString from "@output-mixins/secondsToTimeString";
import progressbarWidth from "@output-mixins/progressbarWidth";
import makeCoverUrl from "@output-mixins/makeCoverUrl";

import carousel from "./bookDetails/carousel";
import booksInSeries from "./bookDetails/booksInSeries";
import bookSummary from "./bookDetails/bookSummary";

import makeUrl from "@output-mixins/makeFullUrl";

import bookBasicInfo from "@output-comps/snippets/book-basic-info";
import bookInfoToolbar from "@output-comps/snippets/book-info-toolbar";
import arrayToHTML from "@output-comps/snippets/arrayToHTML";


export default {
  name: "bookDetails",
  components: {
    bookBasicInfo,
    bookInfoToolbar,
    carousel,
    booksInSeries,
    arrayToHTML,
    bookSummary
  },
  mixins: [
    // sortBookNumbers,
    timeStringToSeconds,
    secondsToTimeString,
    progressbarWidth,
    makeCoverUrl,
    makeUrl
  ],
  props: ["book", "index", "booksWrapper"],
  data: function() {
    return {
      maxWidth: "unset",
      scrollTop: 0,
      loading: true,
      clickedBook: null,
      peopleAlsoBoughtJSON: null,
      bookSummaryJSON: null,
    };
  },

  created: function() {
    
    this.loadJSON();
    
    this.clickedBook = document.querySelector('.ale-book[data-asin="'+ this.book.asin +'"]') || document.querySelector('.ale-row[data-asin="'+ this.book.asin +'"]');
    this.resetScroll();
    this.scrollTop = window.pageYOffset;
    this.$root.$on("afterWindowResize", this.onWindowResize);
  },
  
  mounted: function() {
    
    this.maxWidth = this.repositionBookDetails() + "px";
    // this.changeUrl();
    this.$updateQuery({ query: 'book', value: this.book.asin });
    this.loading = false;
    
  },

  beforeDestroy: function() {
    this.$root.$off("afterWindowResize", this.onWindowResize);
    this.peopleAlsoBoughtJSON = null;
    this.bookSummaryJSON = null;
  },

  computed: {
    peopleAlsoBought: function () {
      return this.book.peopleAlsoBought || this.peopleAlsoBoughtJSON;
    },
    getMaxWidth: function() {
      if ( this.$store.state.sticky.viewMode === 'spreadsheet' ) {
        return this.maxWidth;
      }
      else {
        return window.innerWidth > 800 ? this.maxWidth : "800px";
      }
    },
    
  },
  methods: {
    
    loadJSON: function( afterError )  {
      
      if ( this.$store.state.standalone ) {
        
        let vue = this;
        let scrpt = document.createElement("script");
        scrpt.src = "data/split-book-data/"+ vue.book.asin +"."+ this.$store.state.library.extras.cacheID +".js";
        scrpt.type="text/javascript";
        scrpt.onload = function() {
          
          vue.bookSummaryJSON = window.bookSummaryJSON;
          window.bookSummaryJSON = true;
          
          vue.peopleAlsoBoughtJSON = window.peopleAlsoBoughtJSON;
          window.peopleAlsoBoughtJSON = true;
          
          scrpt.remove();
          
        };
        // Tries again if there's an error loading the files, but only once...
        scrpt.onerror = function() {
          scrpt.remove();
          setTimeout(function() {
            if ( !afterError ) vue.loadJSON( 'afterError'); // Try twice...
          }, 1000);
        };
        document.head.appendChild(scrpt);
        
      }

    },
    
    onWindowResize: function( msg ) {
      this.maxWidth = this.repositionBookDetails() + "px";
      if ( msg.widthChanged ) { this.resetScroll(); }
    },

    changeUrl: function() {
      if (_.get(this.$route, "query.book") !== this.book.asin) {
        this.$router.replace({ query: { book: this.book.asin } });
      }
    },

    resetScroll: function() {
      this.$nextTick(function() {
        
        let topNav = document.querySelector('#ale-navigation.regular');
        const navigationHeight = topNav ? document.querySelector('#ale-navigation.regular').offsetHeight : 0;
        const offset = 25;
        if ( this.$store.state.sticky.viewMode === 'grid' ) {
          scroll({ top: this.clickedBook.offsetTop - navigationHeight - offset });
        }
        else {
          document.querySelector('.list-view-inner-wrap').scroll({ top: this.clickedBook.offsetTop - navigationHeight - offset });
        }
      });
    },

    repositionBookDetails: function() {
      const gridView = document.querySelector(".ale-books");
      const domBooks = gridView.querySelector(".ale-book") ? gridView.querySelectorAll(".ale-book") : gridView.querySelector('table tbody').querySelectorAll(".ale-row");

      const target = {};
      target.el = domBooks[this.index];
      target.index = this.index;
      target.width = target.el.getBoundingClientRect().width;
      target.siblings = domBooks; // + target.el

      const wrapper = {};
      wrapper.el = gridView;
      wrapper.width = wrapper.el.getBoundingClientRect().width;
      const info = {};
      info.cols = Math.floor(wrapper.width / target.width) || 1;
      
      if (info.cols < 2) {
        info.rowEndEl = target.el;
      } else {
        info.currentRow = Math.floor(target.index / info.cols) + 1;
        info.rowEnd = info.currentRow * info.cols;
        // Rolls back if the last element is not at the end of the row
        info.getRowEndEl = function(index) {
          let el = target.siblings[index];
          if (!el) {
            el = info.getRowEndEl(--index);
          }
          return el;
        };
        info.rowEndEl = info.getRowEndEl(info.rowEnd - 1);
      }
      
      let lastRowEndEl = document.querySelector('.target-row-end');
      if ( lastRowEndEl ) lastRowEndEl.classList.remove('target-row-end');
      info.rowEndEl.classList.add("target-row-end");
      info.rowEndEl.parentNode.insertBefore(
        this.$refs.bookDetails,
        info.rowEndEl.nextSibling
      );

      if ( this.$store.state.sticky.viewMode !== 'spreadsheet' ) this.repositionBookDetailsArrow(target.el);
      
      return (this.$store.state.sticky.viewMode === 'spreadsheet') ? wrapper.width-60 : (target.width * info.cols);
    },

    repositionBookDetailsArrow: function(clickedEl) {
      const leftOffset =
        clickedEl.getBoundingClientRect().left + window.scrollX;
      const targetCenter = leftOffset + clickedEl.offsetWidth / 2;

      this.$refs.arrow.style.left = targetCenter + "px";
    },

    openAdjacentBookDetails: function(e) {
      const vue = this;
      // These rely on how the book details will close if the sent book is null,
      // meaning that when you come to the end of the line it will just close the details.
      if ( this.$store.state.sticky.viewMode === 'grid' ) {
        switch (e.srcKey) {
          
          case "left":
          case "tabShift":
            this.$root.$emit("book-clicked", {
              book: this.$store.getters.collection[this.index - 1]
            });
            break;
          case "right":
          case "tab":
            this.$root.$emit("book-clicked", {
              book: this.$store.getters.collection[this.index + 1]
            });
            break;
            
          case "up":
          case "down":

            let wrapper = {};
            wrapper.el = document.querySelector(".ale-books");
            wrapper.width = wrapper.el.offsetWidth;
            
            let target = {};
            target.el = this.clickedBook;
            target.index = this.index;
            target.width = target.el.offsetWidth;
            
            const cols = Math.floor(wrapper.width / target.width);
            
            let getClosestTargetBook = function(index) {
              let el = vue.$store.getters.collection[ index ];
              if (!el) {
                el = getClosestTargetBook(--index);
              }
              return el;
            };
            
            this.$root.$emit("book-clicked", {
              book: e.srcKey === 'up' ? 
                vue.$store.getters.collection[ this.index-cols ] : 
                getClosestTargetBook( this.index+cols )
              
            });
            break;
            
        }
      }
      else {
        switch (e.srcKey) {
          
          case "left":
          case "up":
          case "tabShift":
            this.$root.$emit("book-clicked", {
              book: this.$store.getters.collection[this.index - 1]
            });
            break;
          case "right":
          case "down":
          case "tab":
            this.$root.$emit("book-clicked", {
              book: this.$store.getters.collection[this.index + 1]
            });
            break;
            
        }
      }
    },

    closeBookDetails: function() {
      this.$emit("update:book", null);
      if (this.$route.query !== undefined) this.$router.replace({ query: { book: undefined } });
    },

    // progressToolTipBoundaryEl: function() {
    //   return $("#ale-bookdetails .information .cover-wrap")[0];
    // },

    progressTooltip: function(book) {
      if (book.progress.toLowerCase().trim() === "finished") {
        const length = this.timeStringToSeconds(book.length);
        return "Finished: ( " + this.secondsToTimeString(length) + " )";
      } 
      else {
        const progress = this.timeStringToSeconds(book.progress);
        const length = this.timeStringToSeconds(book.length);

        const difference = length - progress;
        return ( "Progress: " + this.secondsToTimeString(difference) + " / " + this.secondsToTimeString(length) );
      }
    },

    progressInfo: function(book) {
      if (book.progress && book.length) {
        if (book.progress.toLowerCase().trim() === "finished") {
          const length = this.timeStringToSeconds(book.length);
          return (
            '<div class="stretch-center" style="flex: 1;"><strong>Finished!</strong> ( ' +
            this.secondsToTimeString(length, true) +
            " )</div>"
          );
        } else {
          const progress = this.timeStringToSeconds(book.progress);
          const length = this.timeStringToSeconds(book.length);
          const difference = length - progress;
          return (
            "<strong>Progress: </strong>" +
            "<div>" +
            this.secondsToTimeString(difference, true) +
            " / " +
            this.secondsToTimeString(length, true) +
            "</div>"
          );
        }
      } else {
        return '<div class="stretch-center" style="flex: 1;"><strong>Length:</strong> ' + (book.length || 'unkown') + "</div>";
      }
    },
    
  }
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";

#ale-bookdetails {
  -webkit-user-select: text;
  -khtml-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;

  @include themify($themes) {
    border-top: 3px solid themed(audibleOrange);
    border-bottom: 3px solid rgba(themed(frontColor), 0.15);
    background: rgba(themed(backColor), 0.9);
    box-shadow: themed(shadowSmall);
    color: themed(frontColor);
  }
  width: 100vw;
  box-sizing: border-box;
  // font-size: 14px;
  padding: 40px 35px;
  margin-top: 12px;
  margin-bottom: 35px;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;

  .arrow {
    @include themify($themes) {
      border-color: transparent transparent themed(audibleOrange) transparent;
    }
    position: absolute;
    top: -9px;
    left: 50%;
    margin-left: -21px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 21px 7px 21px;
  }

  .book-info-container {
    padding: 0 20px;
  }

  .inner-wrap {
    display: flex;
    flex-direction: column;
    justify-content: start;
    justify-items: start;
    align-content: start;
    align-items: start;
    margin: 0 auto;
    max-width: $containerSize;
    width: 100%;
    position: relative;
    z-index: 0;
    > .top {
      position: relative;
      z-index: 1;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: start;
      justify-items: start;
      align-content: start;
      align-items: start;
    }
  }

  a {
    white-space: nowrap;
  }

  .information {
    @include themify($themes) {
      // border: 1px solid rgba( themed(frontColor), .1);
      background-color: rgba(themed(frontColor), 0.01);
      box-shadow: 0 3px 15px rgba(darken(themed(backColor), 30), 0.8);
    }
    border-radius: 3px;
    overflow: hidden;
    background-clip: padding-box;
    flex-basis: 280px;
    max-width: 280px;
    flex-shrink: 0;
    margin-right: 31px;
    border-radius: 3px;
    text-align: left;
    line-height: 1.6em;

    > div {
      margin-bottom: 20px !important;
    }

    .cover-wrap {
      min-height: 5px;
      position: relative;
      padding: 0;
      overflow: hidden;
      margin-bottom: 0px !important;
      img {
        display: block;
        width: 280px;
        height: 280px;
      }
      .progressbar {
        position: absolute;
        z-index: 5;
        right: 0;
        bottom: 0;
        left: 0;
        @include themify($themes) {
          background: rgba(darken(themed(backColor), 1), 0.65);
        }
        .progress {
          height: 5px;
          @include themify($themes) {
            background: themed(audibleOrange);
          }
        }
        .progress-tooltip {
          width: 1px;
          height: 100%;
          float: right;
        }
      }
    }

    div.progress-info {
      font-size: 0.9em;
      text-align: center;
      margin-bottom: 15px;
      padding: 3px 13px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      @include themify($themes) {
        background: rgba(themed(frontColor), 0.01);
        border-top: 1px solid rgba(themed(frontColor), 0.15);
        border-bottom: 1px solid rgba(themed(frontColor), 0.15);
      }
      > div {
        width: 100%;
        text-align: center;
      }
    }

    .basic-details {
      padding: 0 20px;
      > div {
        &:first-child {
          padding-top: 0;
        }
        padding-top: 10px;
      }
    }

    // padding-top: 20px;
    // padding-bottom: 20px;

    .series a {
      white-space: normal;
    }
    .series .book-number {
      font-size: 0.8em;
      white-space: nowrap;
    }

    .strong-label {
      margin: 10px 0 5px 0;
    }
  }
  
} // #ale-bookdetails

.theme-light #ale-bookdetails {
  .information {
    background: #fff;
  }
  background: -moz-linear-gradient(
    top,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 1) 49%,
    rgba(255, 255, 255, 1) 100%
  );
  background: -webkit-linear-gradient(
    top,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 1) 49%,
    rgba(255, 255, 255, 1) 100%
  );
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 1) 49%,
    rgba(255, 255, 255, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#fff', endColorstr='#fff',GradientType=0 );
}
.theme-dark #ale-bookdetails {
  background: -moz-linear-gradient(
    top,
    rgba(21, 23, 27, 0.9) 0%,
    rgba(21, 23, 27, 1) 49%,
    rgba(21, 23, 27, 1) 100%
  );
  background: -webkit-linear-gradient(
    top,
    rgba(21, 23, 27, 0.9) 0%,
    rgba(21, 23, 27, 1) 49%,
    rgba(21, 23, 27, 1) 100%
  );
  background: linear-gradient(
    to bottom,
    rgba(21, 23, 27, 0.9) 0%,
    rgba(21, 23, 27, 1) 49%,
    rgba(21, 23, 27, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#e615171b', endColorstr='#15171b',GradientType=0 );
}

@media (max-width: 688px) {
  #ale-bookdetails {
    .inner-wrap {
      .top {
        display: flex;
        flex-direction: column;
        .information {
          max-width: none;
          width: 100%;
          margin-right: 0;
          margin-bottom: 40px;
          flex: auto;
        }
      }
    }
  }
}



#ale-bookdetails.spreadsheet-details {
  @include themify($themes) {
    border-top: 2px solid rgba( themed(audibleOrange), .5);
  }
  font-size: 14px;
  line-height: 1.55em;
  width: 100%;
  left: unset;
  right: unset;
  margin: 2px 0 0 0;
  text-align: left;
  padding-left: 0px;
  
  .inner-wrap {
    padding-left: 30px;
    position: -webkit-sticky;
    position: sticky;
    left: 0px;
    z-index: 2;
    margin: 0px;
  }
}

.book-details-info {
  position: absolute;
  z-index: 2;
  top: -25px;
  right: 0px;
  font-size: 18px;
  @include themify($themes) {
    color: rgba(themed(frontColor), 0.1);
  }
}
</style>
