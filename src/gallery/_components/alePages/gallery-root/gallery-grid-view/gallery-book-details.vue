<template>
  <div
    id="ale-bookdetails"
    ref="bookDetails"
    v-if="book"
    v-shortkey.once="['esc']"
    @shortkey="closeBookDetails"
    :class="{ 
      'spreadsheet-details': sticky.viewMode === 'spreadsheet', 
      'mobile-width': mobileWidth,
      'links-lead-to-library': !sticky.detailLinksToAudible && animate_detailLinksToAudible,
    }"
  > 
    
    <div v-if="sticky.viewMode !== 'spreadsheet'" class="arrow" ref="arrow"></div>
    <div
      id="book-info-container"
      v-shortkey="{ left: ['arrowleft'], up: ['arrowup'], right: ['arrowright'], down: ['arrowdown'], tab: ['tab'], tabShift: ['tab', 'shift'] }"
      @shortkey="openAdjacentBookDetails"
    >
    
      <!-- MISSING BOOK (not in library) -->
      <div v-if="book.notInLibrary" class="inner-wrap" :style="{ maxWidth: getMaxWidth }">
        
        <fa6-solid-ban style="font-size: 30px; color: #ff404e; margin-bottom: 20px;" v-tippy="{ trigger: 'mouseenter click' }" content="Not in my library..." /> 
        
        <gallery-book-details-title :book="book" :tempAsin="tempAsin" />
        <gallery-book-info-toolbar style="margin-top: 15px;" :book="book" :tempAsin="tempAsin" v-if="sticky.bookDetailSettings.sidebar.iconToolbar"></gallery-book-info-toolbar>
        
      </div>
      <!-- REGULAR BOOK (in library) -->
      <div v-else class="inner-wrap" :style="{ maxWidth: getMaxWidth }">
        
        <div class="details-toolbar">
          <div 
            class="audible-vs-local-links" 
            @click="detailLinksToAudible()"
            v-tippy="{ trigger: 'manual' }"
            :content="sticky.detailLinksToAudible ? 'Links lead to Audible' : 'Links lead to my library'"
            ref="detailLinksToAudible"
          >
            <ion-library-sharp v-if="!sticky.detailLinksToAudible" />
            <fa6-brands-audible v-else />
          </div>
          <gallery-details-first-hider v-if="mobileWidth" />
          <gallery-sidebar-flipper />
          <uil-cog class="book-details-info" @click="$store.commit('prop', { key: 'globalSettingsOpen', value: true })" />
        </div>
        
        <div class="top details-wrap" :class="{ 'reverse-direction': sticky.bookDetailSettings.reverseDirection }">
          <div class="information" ref="information" v-if="sticky.bookDetailSettings.sidebar.show && !(!sticky.bookDetailSettings.reverseDirection && sticky.bookDetailSettings.hideFirstSection && mobileWidth)">
            
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
          <gallery-book-summary v-if="!loading && !(sticky.bookDetailSettings.reverseDirection && sticky.bookDetailSettings.hideFirstSection && mobileWidth)" :book="book" :bookSummary="splitData.bookSummary" :mobileWidth="mobileWidth"></gallery-book-summary>
        </div>

        <div class="carousel-wrap" v-if="sticky.bookDetailSettings.carousel && !loading">
          <gallery-carousel v-if="(splitData.peopleAlsoBought && splitData.peopleAlsoBought !== true) && !(store.standalone && !store.siteOnline)" :detailsBook="book" :books="splitData.peopleAlsoBought" :key="maxWidth" :mobileWidth="mobileWidth">
            <!-- People who bought this also bought: -->
            <!-- Name changed: -->
            Listeners also enjoyed
          </gallery-carousel>
          
          <!-- Twas removed by Audible at some point... -->
          <!-- <gallery-carousel v-if="!loading && book.moreLikeThis" :books="book.moreLikeThis" :key="maxWidth">
            More listens like this
          </gallery-carousel> -->
        </div>
        
      </div>
      <!-- .inner-wrap -->
    </div>
    <!-- #book-info-container -->
  </div>
  <!-- #ale-bookdetails -->
</template>

<script>
// import sortBookNumbers from '@output-mixins/sort/bookNumbers';
import timeStringToSeconds from "@output-mixins/gallery-timeStringToSeconds.js";
import secondsToTimeString from "@output-mixins/gallery-secondsToTimeString.js";
import progressbarWidth from "@output-mixins/gallery-progressbarWidth.js";
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";
import makeUrl from "@output-mixins/gallery-makeFullUrl.js";
import loadSplitBookData from "@output-mixins/gallery-load-split-book-data.js";

export default {
  name: "bookDetails",
  props: ['asin'],
  mixins: [
    // sortBookNumbers,
    timeStringToSeconds,
    secondsToTimeString,
    progressbarWidth,
    makeCoverUrl,
    makeUrl,
    loadSplitBookData,
  ],
  data: function() {
    return {
      store: this.$store.state,
      sticky: this.$store.state.sticky,
      book: null,
      index: null,
      maxWidth: "unset",
      loading: true,
      clickedBook: null,
      splitData: {
         peopleAlsoBought: null,
         bookSummary: null,
      }, 
      imageLoaded: false,
      clientX: 0,
      clientY: 0,
      firstClientX: 0,
      firstClientY: 0,
      animate_detailLinksToAudible: true,
      panelObserver: null,
    };
  },
  
  watch: {
    // 'sticky.detailLinksToAudible'( value ) {
    //   if ( !value ) {
        
    //     this.animate_detailLinksToAudible = true;
    //     setTimeout(() => {
    //       this.animate_detailLinksToAudible = false;
    //     }, 3000);
        
    //   }
    // },
  },

  created: function() {

    // Index into the full sorted collection. The views are virtualized, so we
    // can no longer rely on chunkCollection (only a window of it is in the DOM).
    this.index = _.findIndex( this.$store.getters.collection, { asin: this.asin });
    this.book = this.$store.getters.collection[this.index];

    this.loadJSON();
    
  },
  
  mounted: function() {
    this.$nextTick(function() {

      this.findClickedBook();
      this.resetScroll();

      this.maxWidth = this.repositionBookDetails() + "px";
      this.$store.commit('prop', { key: 'timeStamp', value: new Date().getTime() });
      this.$compEmitter.on("afterWindowResize", this.onWindowResize);
      this.loading = false;

      this.observePanelHeight();

      this.scrollToCarousel();
      this.scrollToMyBooksInTheSeries();
      
      this.ensureArrowAimed();

    });
    
    // window.addEventListener('touchstart', this.touchStart);
    // window.addEventListener('touchmove', this.preventTouch, {passive: false});
      
  },

  beforeUnmount: function() {
    
    this.$compEmitter.off("afterWindowResize", this.onWindowResize);
    
    // this.closeBookDetails();
    
    this.$store.commit('prop', { key: 'bookDetailSettingsOpen', value: false });

    // The panel is now rendered in-flow by the view, so Vue owns its teardown.
    // (Previously it was insertBefore'd outside Vue and had to be removed by hand.)
    if ( this.panelObserver ) {
      this.panelObserver.disconnect();
      this.panelObserver = null;
    }

    // window.removeEventListener('touchstart', this.touchStart);
    // window.removeEventListener('touchmove', this.preventTouch, {passive: false});
      
  },

  computed: {
    getMaxWidth: function() {
      if ( this.sticky.viewMode === 'spreadsheet' ) {
        return this.maxWidth;
      }
      else {
        return window.innerWidth > 800 ? this.maxWidth : "800px";
      }
    },
    mobileWidth() {
       return this.store.windowWidth <= 688;
    },
    tempAsin() {
      return !!this.book.asin.match(/temp-asin/i);
    },
  },
  methods: {
    
    collapseBtnClicked: function( key ) {
      this.$store.commit('stickyProp', { key: key, value: !this.sticky[ key ] });
      this.$nextTick(() => {
        this.$compEmitter.emit("resizeSummary");
      });
    },
    
    onWindowResize: function( msg ) {
      if ( msg.widthChanged ) { 
        this.maxWidth = this.repositionBookDetails() + "px";
        this.resetScroll(); 
      }
    },

    changeUrl: function() {
      if (_.get(this.$route, "query.book") !== this.book.asin) {
        this.$router.replace({ query: { book: this.book.asin } });
      }
    },

    resetScroll: function() {
      this.$nextTick(function() {
        this.$nextTick(function() {

          // The clicked cover/row can be virtualized out momentarily; bail rather than throw.
          if ( !this.clickedBook ) return;

          // Spreadsheet: the list view already scrolls the open row into view via
          // virtualizer.scrollToIndex when the book opens. Running another scroll here
          // on every panel mount (which happens when the row scrolls back into the
          // virtual window) causes a jarring jump.
          if ( this.sticky.viewMode !== 'grid' ) return;

        });
      });
    },

    scrollToCarousel: function() {
      
      if ( !this.$route.query.carousel ) return;
      this.$updateQueries({ carousel: null });

    },
    
    scrollToMyBooksInTheSeries: function() {
      
      if ( !this.$route.query.scrollToSeries ) return;
      this.$updateQueries({ scrollToSeries: null });
      this.$store.commit('stickyProp', { key: 'booksInSeriesToggle', value: true });
      
      this.$nextTick(function() {
        
        const targetEl = this.$el.querySelector('.my-books-in-series-label');
        if ( targetEl ) {
          
          let scrollPosition = targetEl.getBoundingClientRect().top + window.scrollY;
          scrollPosition = scrollPosition - $store.state.topNavOffset - 25;
          
          if ( this.sticky.viewMode === 'grid' ) {
            scroll({ top: scrollPosition, behavior: 'smooth' });
          }
          else {
            const listInnerWrap = document.querySelector('.list-view-inner-wrap');
            listInnerWrap.scroll({ top: scrollPosition, behavior: 'smooth' });
          }
          
        }
        
      });
    },

    // Watch the panel's live height and feed it into the store so the virtualized
    // view can reserve a matching gap. One observer catches every cause of a height
    // change (summary/sidebar/series/settings collapse-expand, image loads, reflow).
    observePanelHeight: function() {

      const el = this.$refs.bookDetails;
      if ( !el || typeof ResizeObserver === 'undefined' ) return;

      let frame = null;
      const vue = this;
      this.panelObserver = new ResizeObserver(function() {
        if ( frame ) return;
        frame = requestAnimationFrame(function() {
          frame = null;
          const box = el.getBoundingClientRect();
          const height = box.height;
          // Ignore ~0 measurements (e.g. while the panel is detached/unmounting as
          // its row scrolls out of the virtual window) so the reserved gap doesn't
          // collapse and yank the scroll. The real reset happens on close.
          if ( height < 1 ) return;
          // Only react to height changes while the panel is actually within the
          // viewport. When its row is scrolled out of the virtual window the panel
          // unmounts and remounts, reporting transient (partly-settled) heights as it
          // re-renders. Feeding those into the reserved gap shrinks then re-grows it,
          // which shifts the rows below across the overscan boundary and bounces the
          // scroll back and forth in a narrow zone a few rows past book-details.
          // Offscreen, the last good gap already holds the right space, so leave it.
          const inViewport = box.bottom > 0 && box.top < window.innerHeight;
          if ( !inViewport ) return;
          const current = vue.$store.state.openDetails;
          if ( Math.round(current.gapHeight) === Math.round(height) ) return;
          vue.$store.commit('prop', { key: 'openDetails', value: { index: current.index, gapHeight: height } });
        });
      });
      this.panelObserver.observe( el );

    },

    findClickedBook: function() {
      this.clickedBook = document.querySelector('.ale-book[data-asin="'+ this.book.asin +'"]') || document.querySelector('.ale-row[data-asin="'+ this.book.asin +'"]');
      return this.clickedBook;
    },

    // Grid only: re-aim the details arrow once the clicked cover is actually laid out.
    // On a fresh reload the cover can mount a few frames after the panel, so poll
    // briefly until it has a real width, then position the arrow.
    ensureArrowAimed: function( attempt ) {
      if ( this.sticky.viewMode === 'spreadsheet' ) return;
      attempt = attempt || 0;

      this.findClickedBook();
      const ready = this.clickedBook && this.clickedBook.getBoundingClientRect().width > 0;

      if ( ready ) {
        this.repositionBookDetailsArrow( this.clickedBook );
        return;
      }

      // Give up after ~10 frames so we never loop forever.
      if ( attempt < 10 ) {
        const vue = this;
        requestAnimationFrame(function() { vue.ensureArrowAimed( attempt + 1 ); });
      }
    },

    repositionBookDetails: function() {

      // The panel is rendered in-flow by the view at the open row's reserved gap,
      // so we no longer move it around the DOM. This only computes the inner-wrap
      // max-width and re-aims the arrow at the clicked cover.

      // Spreadsheet: panel spans the table width (minus padding).
      if ( this.sticky.viewMode === 'spreadsheet' ) {
        const tableEl = document.querySelector(".ale-books");
        const tableWidth = tableEl ? tableEl.getBoundingClientRect().width : 0;
        return tableWidth - 60;
      }

      // Grid: panel inner-wrap spans the full row of covers (cols * cellWidth).
      const gridEl = document.querySelector(".ale-books.grid-view");
      const wrapperWidth = gridEl ? gridEl.getBoundingClientRect().width : 0;
      const target = this.clickedBook;
      const cellWidth = target ? target.getBoundingClientRect().width : 0;
      const cols = cellWidth ? ( Math.floor(wrapperWidth / cellWidth) || 1 ) : 1;

      if ( target ) this.repositionBookDetailsArrow(target);

      return cellWidth * cols;
    },
    
    repositionBookDetailsArrow: function(clickedEl) {
      if ( !this.$refs.arrow ) return;

      const parent = this.$refs.arrow.offsetParent || document.querySelector('.ale-books.grid-view');
      const parentLeft = parent ? parent.getBoundingClientRect().left : 0;
      const coverBox = clickedEl.getBoundingClientRect();
      const targetCenter = ( coverBox.left - parentLeft ) + coverBox.width / 2;

      this.$refs.arrow.style.left = targetCenter + "px";
    },
    
    openAdjacentBookDetails: _.throttle(function( e ) { 
      
      const vue = this;
      // GRID VIEW
      if ( this.sticky.viewMode === 'grid' ) {
        switch (e.srcKey) {
          case "left":
          case "tabShift":
            vue.keyboardMove('prev');
            break;
          case "right":
          case "tab":
            vue.keyboardMove('next');
            break;
          case "up":
          case "down":
            vue.keyboardMove_inGrid_vertically( e );
            break;
        }
      }
      // SPREADSHEET VIEW
      else {
        switch (e.srcKey) {
          case "left":
          case "up":
          case "tabShift":
            vue.keyboardMove('prev');
            break;
          case "right":
          case "down":
          case "tab":
            vue.keyboardMove('next');
            break;
        }
      }
      
    }, 70, { leading: false, trailing: true }),
    
    keyboardMove( direction ) {

      const collection = this.$store.getters.collection;
      const prev = direction === 'prev';
      const nextIndex = prev ? this.index-1 : this.index+1;
      const nextBook = collection[ nextIndex ];
      const condition = prev ? (nextIndex > -1) : (nextIndex < collection.length);
      if ( condition ) {
        this.$compEmitter.emit("book-clicked", nextBook.asin);
      }
      
    },
    
    keyboardMove_inGrid_vertically( e ) {

      const vue = this;
      const cols = this.$store.state.gridCols || 1;

      const collection = vue.$store.getters.collection;

      const getVerticalIndex = function() {
        
        const direction = e.srcKey;
        let index = -1;
        if ( direction === 'up' ) {
          index = vue.index - cols;
          if ( index < 0 ) index = 0;
        }
        else {
          index = vue.index + cols;
          const booksLength = collection.length-1;
          if ( index > booksLength ) index = booksLength;
        }
        return index;
        
      };
      
      // this.closeBookDetails();
      
      const nextIndex = getVerticalIndex();
      const nextBook = collection[ nextIndex ];
      const lastIndex = collection.length-1;
      const condition = e.srcKey === 'up' ?
                        !(vue.index === 0 && nextIndex == 0) :
                        !(vue.index === lastIndex && nextIndex === lastIndex);
      
      if ( condition ) {
        this.$compEmitter.emit("book-clicked", nextBook.asin);
      }
      
    },

    closeBookDetails: function() {
      
      if ( _.get(this.$route, "query.book") ) this.$compEmitter.emit('book-clicked', null);
      
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
        return '<div class="stretch-center" style="flex: 1;"><strong>Length:</strong> ' + (book.length || 'unknown') + "</div>";
      }
    },
    
    swipeHandler( direction ) {
      
      if ( !this.mobileWidth ) return;
      
      this.$store.commit('prop', { 
        key: 'sticky.bookDetailSettings.reverseDirection', 
        value: !this.$store.state.sticky.bookDetailSettings.reverseDirection 
      });
      
    },
    
    touchStart(e) {
      
      if ( !this.mobileWidth ) return;
      
      this.firstClientX = e.touches[0].clientX;
      this.firstClientY = e.touches[0].clientY;
      
    },

    preventTouch(e) {
    
      if ( !this.mobileWidth ) return;
    
      const minValue = 5; // threshold

      this.clientX = e.touches[0].clientX - this.firstClientX;
      this.clientY = e.touches[0].clientY - this.firstClientY;

      // Vertical scrolling does not work when you start swiping horizontally.
      if( Math.abs(this.clientX) > minValue ){ 
        e.preventDefault();
        e.returnValue = false;
        return false;
      }
    },
    
    detailLinksToAudible() {
      
      this.$store.commit('prop', { key: 'sticky.detailLinksToAudible', value: !this.sticky.detailLinksToAudible })
      
      const el = _.get( this.$refs, 'detailLinksToAudible' );
      el._tippy.show();
      
      setTimeout(() => {
        el._tippy.hide();
      }, 2000);
      
    },
  }
};
</script>

<style lang="scss" scoped>

.details-toolbar {
  @extend .no-selection;
  position: absolute;
  z-index: 2;
  top: -30px;
  right: 0px;
  display: flex;
  flex-direction: row;
  gap: 30px;
}

.audible-vs-local-links, 
.book-details-info {
  font-size: 18px;
  cursor: pointer;
  transition: color 200ms cubic-bezier(0, 0, 0, .1);
  @include themify($themes) {
    color: rgba(themed(frontColor), 0.4);
    &.active,
    &:hover {
      color: themed(frontColor);
    }
  }
}

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
    align-items: center;
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
      &.reverse-direction {
        flex-direction: row-reverse;
        .information {
          margin-left: 31px;
          margin-right: 0;
          &:before {
            left: -35px !important;
            width: 20px !important;
          }
        }
      }
      justify-content: start;
      justify-items: start;
      align-content: start;
      align-items: start;
    }
  }

  a {
    white-space: nowrap;
  }
  
  
  .cover-wrap.cover-height {
    width: 280px;
    height: 280px;
  }
  &.mobile-width .cover-wrap {
    width: auto;
    height: auto;
  }
  

  .information {
    @include themify($themes) {
      // border: 1px solid rgba( themed(frontColor), .1);
      $bgColor: color.adjust(themed(backColor), $lightness: 7.5%);
      background: color.mix(blue, $bgColor, 2%);
      box-shadow: 0 3px 15px rgba(color.adjust(themed(backColor), $lightness: -30%), 0.8);
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
          background: rgba(color.adjust(themed(backColor), $lightness: -1%), 0.65);
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
  
} // #ale-bookdetails

.theme-light #ale-bookdetails {
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

#ale-bookdetails.mobile-width {
  .inner-wrap {
    .top {
      display: flex;
      flex-direction: column;
      &.reverse-direction {
        flex-direction: column-reverse;
        .information {
          margin-left: 0;
          margin-top: 20px;
        }
      }
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

.carousel-wrap {
  width: 100%;
}

.links-lead-to-library {
  :deep(.book-tags),
  :deep(.basic-info),
  :deep(.categories) {
    a {
      @include themify($themes) {
        color: color.complement(themed(audibleOrange)) !important;
        // &:before {
        //   content: '\02022';
        //   padding: 0 .1em 0 0;
        //   color: complement(themed(audibleOrange)) !important;
        //   font-size: 1.9em;
        //   line-height: 0px;
        //   position: relative;
        //   top: .2em;
        // }
      }
    }
    a:visited {
      @include themify($themes) {
        color: color.complement(color.adjust(color.adjust(themed(audibleOrange), $saturation: -5%), $lightness: -15%)) !important;
        // &:before {
        //   color: complement(darken(color.adjust(themed(audibleOrange), $saturation: -5%), 15)) !important;
        // }
      }
    }
    a:hover {
      @include themify($themes) {
        // color: themed(frontColor) !important;
      }
    }
  }
}

</style>
