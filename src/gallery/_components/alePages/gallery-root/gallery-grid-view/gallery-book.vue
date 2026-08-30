<template>
  <div class="details-inner-wrap" :class="{ 'not-in-library': book.notInLibrary }">
    
    <gallery-sort-values v-if="sortValuesEnabled" :book="book" />
    
    <div class="ale-cover">
      
      <div class="ale-cover-icon ale-play-sample" v-if="!coverButtonsHidden && sticky.bookDetailSettings.playButton" @click="playSample(book, index)">
        <div><fa6-solid-play/></div>
      </div>
      <div class="ale-cover-icon cloud-player-icon" v-else-if="!coverButtonsHidden && book.asin && sticky.bookDetailSettings.cloudPlayer">
        <gallery-open-web-player :size="20" :book="book" :icon="true" :tooltip="false" />
      </div>
      <div class="ale-cover-icon app-link-icon" v-else-if="!coverButtonsHidden && book.asin && sticky.bookDetailSettings.appLink && $store.state.standalone">
        <gallery-open-in-app :size="20" :book="book" />
      </div>

      <div
        class="ale-click-wrap"
        @mousedown="onPressStart"
        @touchstart="onPressStart"
        @click="openBook"
      >

        <div class="info-icons-wrapper" v-if="!indicatorsHidden">
          <!-- FAVORITE -->
          <div class="favorite-marker" v-if="book.favorite && sticky.bookDetailSettings.favorite">
            <span><fa-solid-heart/></span>
            <span>favorite</span>
          </div>

          <!-- BOOK IS FINISHED -->
          <div class="finished-marker" v-if="book.progress === 'Finished' && sticky.bookDetailSettings.finished">
            <span><ph-check-fat-fill/></span>
            <span>finished</span>
          </div>

          <!-- FROM PLUS CATALOG -->
          <div class="plus-catalog-marker" v-if="book.fromPlusCatalog && sticky.bookDetailSettings.plusCatalog">
            <span v-if="book.unavailable"><fa6-solid-unlock-keyhole/></span>
            <span v-else><fa-solid-plus-circle/></span>
            <span>catalog</span>
          </div>
          
          <!-- IN KINDLE -->
          <div class="kindle-marker" v-if="book.whispersync === 'owned' && sticky.bookDetailSettings.whispersync">
            
            <span><fa6-solid-headphones-simple/></span>
            <span>In my kindle</span>
            <!-- <span v-if="book.whispersync !== 'owned'"><font-awesome fas icon="lock" /></span>
            <span v-else><font-awesome :icon="['fab', 'amazon']" /></span>
            <span v-if="book.whispersync !== 'owned'">Available in kindle</span>
            <span v-else>In your kindle</span> -->
          </div>

          <!-- PRE-ORDERED -->
          <div class="preorder-marker" v-if="(book.isPreorder || book.preorder) && sticky.bookDetailSettings.preorder">
            <span><fa6-solid-clock/></span>
            <span>preorder</span>
          </div>
        </div>
      
        <div class="ale-info-indicator" :class="{ 'not-in-library': book.notInLibrary, 'open-details-icon': !book.notInLibrary }">
          <div>
            <!-- <fa6-solid-link v-if="book.notInLibrary" />
            <fa6-solid-book v-else /> -->
            <fa6-solid-ban v-if="book.notInLibrary" />
            <fa6-solid-book v-else />
          </div>
        </div>
        
        <div v-if="!book.cover || false" class="placeholder-cover">
          <div class="cover-content">
            <div class="title" v-if="book.titleShort || book.title">{{ book.titleShort || book.title }}</div>
            <div class="author" v-if="book.authors">{{ book.authors[0].name }}</div>
          </div>
        </div>
        <div v-else class="cover-img-wrapper">
          <transition name="fade">
            <img v-show="imageLoaded" @load="imageLoaded = true" class="ale-cover-image" :class="{ loaded: imageLoaded }" crossorigin="anonymous" draggable="false" @touchstart.prevent :src="makeCoverUrl(book.cover)" alt="" />
          </transition>
        </div>
      </div>
    </div>

    <!-- WHOLE-CARD CLICK TARGET (details modes)
         The cover's ale-click-wrap can't stretch past the cover: .ale-cover clips to its
         own bounds with overflow hidden. So in the details modes, where the whole card
         opens the book, lay a transparent overlay over the entire card to catch clicks on
         the text and the padding gaps too. It sits below the cover icons (z-index 999), so
         the play sample / cloud player buttons stay clickable, and carries the same press
         and click handlers so the blurb peek gesture works anywhere on the card. -->
    <div
      v-if="detailsMode && detailsMode !== 'off'"
      class="card-click-overlay"
      @mousedown="onPressStart"
      @touchstart="onPressStart"
      @click="openBook"
    ></div>

    <!-- Title/author/length card text. Stacked lays it under the cover, list beside it;
         the layout is driven by the wrapper class, this just renders the lines. The
         card-click-overlay above sits over this, so the strip itself needs no handler. -->
    <div v-if="detailsMode && detailsMode !== 'off'" class="book-details-strip">
      <div class="book-title" v-if="book.titleShort || book.title" v-html="book.titleShort || book.title"></div>
      <div class="book-author" v-if="book.authors && book.authors[0]">
        <fa6-solid-user-pen v-if="detailsMode === 'list'" class="strip-icon" />{{ book.authors[0].name }}
      </div>
      <div class="book-narrator" v-if="detailsMode === 'list' && book.narrators && book.narrators[0]">
        <fa6-solid-microphone class="strip-icon" />{{ book.narrators[0].name }}
      </div>
      <!-- Discontinued books have no length. Render a non-breaking space so the row still
           exists and the block stays top-aligned with other cards rather than re-centering. -->
      <div class="book-length" v-html="book.length || '&nbsp;'"></div>
    </div>

  </div>
</template>

<script>
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";

export default {
  name: "book",
  props: ["book", "index", "sortValuesEnabled", "detailsMode"],
  mixins: [ makeCoverUrl ],
  // Provided by the blurb-peek overlay mounted in the grid view; null elsewhere.
  inject: {
    blurbPeek: { default: null },
  },
  data: function() {
    return {
      store: this.$store.state,
      sticky: this.$store.state.sticky,
      smartLink: "https://smart.link/o3waqx4wg1gdn?asin=",
      imageLoaded: false,
    };
  },
  computed: {

    coverButtonsHidden: function() {
      return ( this.$store.state.sticky.coverSize || 180 ) < 110;
    },

    indicatorsHidden: function() {
      return ( this.$store.state.sticky.coverSize || 180 ) < 80;
    },

  },

  methods: {

    onPressStart: function( event ) {
      this.$haptic( 1 );
      if ( !this.book.asin || !this.blurbPeek ) return;
      this.blurbPeek.start( event );
    },

    openBook: function() {
      if ( !this.book.asin ) return;
      // The press that just ended was a blurb peek, not a tap: swallow the open.
      if ( this.blurbPeek && this.blurbPeek.consumeClick() ) return;
      this.$compEmitter.emit( 'book-clicked', this.book.asin );
    },

    // imageAlt: function(book, index) {
    //   return book.authors[0].name + " - " + book.title;
    // },

    playSample: function(book, index) {
      
      if ( !book.sample ) {
        window.open(`${this.$store.state.urlOrigin}/webplayer?asin=${book.asin}&isSample=true`, '_blank');
      }
      else {
        
        this.$store.commit('prop', { 
          key: 'audioPlayer.audio', 
          value: {
            from: "book",
            route: this.$route,
            book: book,
            index: index
          } 
        });
        
      }
      
    },
    
  }
};
</script>

<style lang="scss" scoped>

.details-inner-wrap {
  // max-width: $thumbnailSize+2;
  margin: 5px;
  border-radius: 5px;
  overflow: hidden;
  background-clip: padding-box;
  position: relative;

  // Whole-card click target for the details modes. Fills the card above the text and the
  // padding gaps. The cover is lifted above it (below) so the cover keeps its own click
  // wrap and its play sample / cloud player buttons stay clickable, and this overlay only
  // catches the regions the cover does not cover (text, padding).
  .card-click-overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    cursor: pointer;
  }
  // Keep the cover and its buttons above the overlay.
  .ale-cover {
    position: relative;
    z-index: 6;
  }

  .info-icons-wrapper {
    position: absolute;
    z-index: 10;
    left: 3px;
    bottom: 4px;
    // left: 5px;
    // bottom: 5px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;

    // transition: left 150ms ease;
    
    > div {
      margin-top: 4px;
      &:first-child {
        margin: 0;
      }
      
      background: #333;
      color: #fff;
      // border-radius: 900px;

      border-radius: 500px;
      width: 11px;
      height: 11px;

      &, span {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      // transition: all 150ms ease;
      overflow: hidden;
      > span {
        display: none;
        // transition: opacity 0ms ease;
        white-space: nowrap;
      }
    }

    .favorite-marker {
      background: red;
    }
    .finished-marker {
      background: #62bd25;
    }
    .plus-catalog-marker {
      background: $audibleOrange;
    }
    .kindle-marker {
      background: #106be6;
      // svg { font-size: 16px; }
    }
    .preorder-marker {
      background: #8e44ec;
    }
  }
  &:hover .info-icons-wrapper {
    // left: 1px;
    > div {
      width: auto;
      padding: 0 6px 0 5px;
      height: 15px;
      line-height: 15px;
      height: 15px;
      font-size: .7em;
      font-weight: 700;
      svg {
        font-size: .87em;
        line-height: 0;
      }
      > span {
        // transition-duration: 150ms;
        display: flex;
        padding-left: 3px;
        &:first-child { padding-left: 0; }
      }
    }
  }
}

// DETAILS CARD TEXT
// The title/author/length block. This styles the lines themselves; the per-layout
// placement (stacked under the cover vs. list beside it) and the card background live in
// grid-view.vue, where the .details-stacked / .details-list ancestor classes are plain
// globals and need no scope workarounds.
.book-details-strip {
  text-align: left;
  line-height: 1.3;
  overflow: hidden;
  font-size: clamp(11px, calc(var(--cover-size, 180px) * 0.08), 20px);

  .book-title {
    font-size: 0.82em;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    @include themify($themes) {
      color: themed(frontColor);
    }
  }
  .book-author {
    font-size: 0.75em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    @include themify($themes) {
      color: rgba(themed(frontColor), .65);
    }
  }
  .book-narrator {
    font-size: 0.75em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    @include themify($themes) {
      color: rgba(themed(frontColor), .5);
    }
  }
  .book-length {
    font-size: 0.72em;
    @include themify($themes) {
      color: rgba(themed(frontColor), .45);
    }
  }
  .strip-icon {
    margin-right: 4px;
    font-size: 0.8em;
    opacity: 0.5;
    vertical-align: middle;
    position: relative;
    top: -0.05em;
  }
}

.details-list .book-details-strip {
  font-size: clamp(15px, calc(var(--cover-size, #{$detailsListCover}) * 0.17), 22px);
}

.smart-link {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  top: 0;
  left: 0;
  visibility: hidden;
  z-index: -1;
}

.ale-cover {
  cursor: pointer;
  position: relative;
  border-radius: 5px;
  overflow: hidden;
  background-clip: padding-box;
  @include themify($themes) {
    border: 1px solid rgba(themed(outerColor), 0.3);
  }
  .placeholder-cover,
  img.ale-cover-image {
    display: block;
    width: 100%;
    height: auto;
    // Fitting oversized images in the grid (The grid wasn't broken, the cover was just overflowing...)
    // Examle image https://m.media-amazon.com/images/I/41TXZZ024QL._SL500_.jpg
    // Book https://www.audible.com/pd/Krondor-Tear-of-the-Gods-Audiobook/0061124117
    object-fit: contain; 
    height: 100%;
    //  -----------
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    pointer-events: none;
    -webkit-touch-callout: none;
    
    &.fade-enter-active, &.fade-leave-active {
      transition: opacity .5s ease;
    }
    
    &.fade-enter-from, &.fade-leave-to {
      opacity: 0;
    }
    
  }
  
  .cover-img-wrapper {
    width: 100%;
    height: 100%;
    padding-bottom: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-content: center;
    justify-items: center;
    align-items: center;
    @include themify($themes) {
      background-color: color.adjust(themed(backColor), $lightness: 10%);
    }
    img {
      position: absolute;
      padding-top: 100%;
    }
  }
  
  .placeholder-cover {
    width: 100%;
    height: 100%;
    padding-bottom: 100%;
    @include themify($themes) {
      color: themed(frontColor);
      background-color: color.adjust(themed(backColor), $lightness: 10%);
    }
    position: relative;
    z-index: 1;
    &:after {
      content: '';
      position: absolute;
      z-index: 5;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTEuNSA5My43IiB3aWR0aD0iMTUxLjUiIGhlaWdodD0iOTMuNyI+PHBhdGggZD0iTTc1LjggODAuN2w3NS43LTQ3LjJ2MTIuOEw3NS44IDkzLjcgMCA0Ni4zVjMzLjV6IiBmaWxsPSIjZjc5YTFjIi8+PHBhdGggZD0iTTc1LjggMjEuNWE0OC4yIDQ4LjIgMCAwIDAtNDAuNyAyMS45IDEzLjcgMTMuNyAwIDAgMSAxLjgtMS42YzIxLjMtMTcuNyA1Mi0xMy43IDY4LjcgOC42bDExLjEtNy4xYTQ5LjcgNDkuNyAwIDAgMC00MC45LTIxLjgiIGZpbGw9IiNmNzlhMWMiLz48cGF0aCBkPSJNNzUuOCA0My40YTI3LjYgMjcuNiAwIDAgMC0yMi40IDExLjUgMjIuNSAyMi41IDAgMCAxIDEzLjUtNC40YzguMiAwIDE1LjUgNC4yIDIwLjQgMTEuM2wxMC42LTYuNmEyNS44IDI1LjggMCAwIDAtMjIuMS0xMS44TTI0LjYgMjQuMkM1NS44LS40IDk5LjkgNi4zIDEyMy40IDM5bC4yLjIgMTEuNS03LjFhNzAuOCA3MC44IDAgMCAwLTk4LTIwLjYgNzIuMiA3Mi4yIDAgMCAwLTIwLjYgMjAuNiA2MC41IDYwLjUgMCAwIDEgOC4xLTcuOSIgZmlsbD0iI2Y3OWExYyIvPjwvc3ZnPg==");
      background-position: center 45%; 
      background-repeat: no-repeat;
      background-size: 65%;
      opacity: .08;
    }
    .cover-content {
      position: absolute;
      z-index: 10;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      justify-items: center;
      align-items: center;
      align-content: center;
    }
    
    .title {
      margin-top: auto;
      font-weight: 700;
      opacity: .7;
      text-overflow: ellipsis;
      max-height: 70%;
      overflow: hidden;
    }
    .author {
      opacity: .7;
      @include themify($themes) {
        color: themed(audibleOrange);
      }
      margin-top: auto;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: calc( 100% - 20px);
      margin-left: auto;
      margin-right: auto;
    }
  }
  
}

.ale-info-indicator {
  position: absolute;
  z-index: 9;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  justify-content: center;
  align-content: center;
  align-items: center;
  justify-items: center;
  color: #fff;
  background: rgba(#000, 0.2);
  // transition: all 200ms ease-in-out;
  display: none;
  &:after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    justify-items: center;
    background: rgba(#fff, 0.25);
    z-index: 0;
    // transition: all 200ms ease-in-out;
  }
  > div {
    font-size: 120%;
    // transition: all 100ms ease-in-out;
    cursor: pointer;
    position: relative;
    z-index: 2;
    width: 10%;
    height: 10%;
    border-radius: 99999px;
    background: rgba(#000, 0.7);
    box-shadow: 0 0 2px 1px rgba(#000, 0.7);
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    justify-items: center;
  }
}

.ale-click-wrap {
  will-change: backdrop-filter;
  transform: translateZ(0);
}

.ale-click-wrap:hover {
  .ale-info-indicator {
    display: flex;
    div {
      width: 50%;
      height: 50%;
      font-size: 140%;
    }
  }
  .ale-info-indicator {
    -webkit-backdrop-filter: blur(1px) grayscale(30%);
    backdrop-filter: blur(1px) grayscale(30%);
  }
}

// SHARED BOUNDING BOX FOR THE COVER ICONS (play sample, cloud player, app link)
// fixed square box so the icon can't collapse in on itself.
.ale-cover-icon {
  display: none;
  position: absolute;
  z-index: 999;
  bottom: 0px;
  right: 0px;
  padding: 6px;
  cursor: default;

  // ICON BOX
  // the cloud player and app link bring their own gradient circle, so the box
  // here just keeps a fixed square so the icon can't collapse width wise.
  > div,
  > a {
    flex: 0 0 auto;
    width: 26px;
    height: 26px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-content: center;
    justify-items: center;
    align-items: center;
  }
  :deep(.gr-icon) {
    box-shadow: 0px 0px 9px rgba(#000, 0.5);
  }
}

// PLAY SAMPLE: stylized to match the gradient circular cloud player and app link icons.
.ale-play-sample {
  > div {
    font-size: 11px;
    color: rgba(#fff, 1);
    background: #ffc338;
    background: linear-gradient(to bottom, #ffc338 0%, #f29a33 100%);
    border: 1px solid #f29a33;
    border-radius: 999999px;
    box-shadow: 0px 0px 9px rgba(#000, 0.5);
    > svg {
      position: relative;
      left: 1px;
    }
  }
}

.hidden {
  position: absolute;
  z-index: -1;
  top: 50%;
  right: 0;
  left: 0;
  display: inline-block;
  width: 100%;
  height: 0;
  overflow: hidden;
}

body.is-mobile .ale-click-wrap .ale-info-indicator.open-details-icon {
  display: none !important;
}

@media (max-width: 640px) {
  
  .ale-cover-icon {
    padding: 4px;
    > div,
    :deep(> a > div) {
      width: 20px;
      height: 20px;
    }
    &.ale-play-sample > div {
      font-size: 9px;
    }
  }
  
}

// :global(.ale-book.details-open .ale-click-wrap),
div.not-in-library {
  // border: 3px solid #ff404e;
  // box-shadow: 0 0 0 3px #ff404e;
  :deep(.sort-values-container > *) {
    -webkit-filter: grayscale(1) !important;
    filter: grayscale(1) !important;
  }
  
  .ale-info-indicator {
      -webkit-backdrop-filter: grayscale(1) !important;
      backdrop-filter: grayscale(1) !important;
  }
  // .cover-img-wrapper:before {
  //   content: '';
  //   position: absolute;
  //   z-index: 4;
  //   top: 0;
  //   right: 0;
  //   bottom: 0;
  //   left: 0;
  //   background: rgba(#ff404e, 1);
  //   mix-blend-mode: overlay;
  // }
  
  
  .ale-info-indicator.not-in-library {
    display: flex;
    div {
      background: rgba(#000, .55);
      width: 25%;
      height: 25%;
      font-size: 120%;
    }
  }
}

</style>
