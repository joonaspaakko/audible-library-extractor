<template>
  <div class="information" ref="information">
    
    <div class="collapse-btn" 
      v-if="!mobileWidth"
      v-tippy :content="(!sticky.bookDetailsCollapsedCover ? 'Collapse' : 'Expand') + ' cover image.'"
      :style="{ top: '5px' }"
      @click="collapseBtnClicked('bookDetailsCollapsedCover')"
    >
      <gallery-vertical-chevron :up="!sticky.bookDetailsCollapsedCover" />
    </div>
    
    <div class="cover-wrap" :class="{ 'cover-height': !sticky.bookDetailsCollapsedCover && book.cover && !mobileWidth }">
      <a :href="makeUrl('book', book.asin)" target="_blank" rel="noopener noreferrer">
        <div class="progressbar">
          <div class="progress" :style="progressbarWidth(book)">
            <!-- <div class="progress-tooltip" v-if="book.progress && book.length" :content="progressTooltip( book )" v-tippy="{ placement: 'top',  arrow: true, theme: general.tippyTheme, showOnInit: true, trigger: 'manual', hideOnClick: false, boundary: progressToolTipBoundaryEl() }"></div> -->
          </div>
        </div>
        
        <!-- 
          Reasons for commenting out transition:
            - Caused an issue with calculating summary max height
            - The added "delay" to showing the image and pushing rest of the sidebar contents
              down didn't really look that great
              
        -->
        <!-- <transition name="fade"> -->
          <img 
            v-if="!sticky.bookDetailsCollapsedCover && book.cover && !mobileWidth"
            v-show="imageLoaded"
            @load="imageLoaded = true"
            crossorigin="anonymous"
            class="cover"
            :class="{ loaded: imageLoaded }"
            :src="makeCoverUrl(book.cover)"
          />
        <!-- </transition> -->
      </a>
    </div>
    <div class="progress-info" v-html="progressInfo(book)"></div>
    
    <div class="basic-details">
      
      <div class="collapse-btn" 
      v-tippy :content="(!sticky.bookDetailsCollapsedDetails ? 'Collapse' : 'Expand') + ' book details.'"
      :style="{ top: !sticky.bookDetailsCollapsedDetails ? '25px' : '-10px' }" 
      @click="collapseBtnClicked('bookDetailsCollapsedDetails')">
        <gallery-vertical-chevron :up="!sticky.bookDetailsCollapsedDetails" />
      </div>
      
      <gallery-book-info-toolbar :book="book" v-if="sticky.bookDetailSettings.sidebar.iconToolbar"></gallery-book-info-toolbar>
      <gallery-book-basic-info :book="book" v-if="!sticky.bookDetailsCollapsedDetails"></gallery-book-basic-info>
    </div>
    
    <gallery-collections-drawer :book="book" v-if="sticky.bookDetailSettings.sidebar.seriesList" />
    
    <gallery-books-in-series :book="book" v-if="sticky.bookDetailSettings.sidebar.collectionsList" />
    
  </div> <!-- .information -->
</template>

<script>
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";
import makeUrl from "@output-mixins/gallery-makeFullUrl.js";
import progressbarWidth from "@output-mixins/gallery-progressbarWidth.js";

export default {
  name: "BookDetailsSidebar",
  props: ["book", "mobileWidth"],
  mixins: [ 
    makeCoverUrl,
    makeUrl,
    progressbarWidth,
  ],
  data() {
    return {
      store: this.$store.state,
      sticky: this.$store.state.sticky,
      imageLoaded: false,
    }
  },
  
  methods: {
    
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
    
  },
};
</script>

<style lang="scss">


.information {
  @include themify($themes) {
    // border: 1px solid rgba( themed(frontColor), .1);
    $bgColor: lighten(themed(backColor), 7.5);
    background: mix(blue, $bgColor, 2%);
    box-shadow: 0 3px 15px rgba(darken(themed(backColor), 30), 0.8);
  }
  position: relative;
  border-radius: 3px;
  // overflow: hidden;
  display: inline-block;
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
    -webkit-touch-callout: none; 
    -webkit-user-select: none; 
    -khtml-user-select: none; 
    -moz-user-select: none; 
    -ms-user-select: none; 
    user-select: none; 
    min-height: 5px;
    position: relative;
    padding: 0;
    overflow: hidden;
    margin-bottom: 0px !important;
    
    img {
      display: block;
      width: 280px;
      height: 280px;
      object-fit: contain;
      
      &.fade-enter-active, &.fade-leave-active {
        transition: opacity .5s ease;
      }
      
      &.fade-enter-from, &.fade-leave-to {
        opacity: 0;
      }
      
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
    margin-bottom: 15px !important;
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
    position: relative;
    padding: 0 20px;
    > div {
      &:first-child {
        padding-top: 0;
      }
      margin-top: 10px;
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


// Makes the collapse/expand buttons easier to work with by making it so that 
// you can be hovering slightly outside of the information panel and still 
// show the buttons.
.information:before {
  content: '';
  position: absolute;
  z-index: 4;
  left: -50vw;
  width: 50vw;
  height: 100%;
  // background:rgba(red, .5 ); // for testing
}

.collapse-btn { display: none; }
.information:hover .collapse-btn { display: flex; }

.collapse-btn {
  outline: none !important;
  position: absolute;
  z-index: 5;
  top: 5px;
  left: -23px;
  width: 22px;
  height: 28px;
  justify-items: center;
  justify-content: center;
  align-items: center;
  align-content: center;
  border-radius: 4px 0 0 4px;
  cursor: pointer;
  @include themify($themes) {
    color: rgba( themed(frontColor), .55);
    background: rgba( themed(backColor), .35);
    border: 1px solid rgba( themed(frontColor), .1);
    border-right: none;
  }
  &:hover {
    @include themify($themes) {
      color: rgba( themed(frontColor), 1) !important;
      background: rgba( themed(backColor), .95) !important;
    }
  }
}
</style>
