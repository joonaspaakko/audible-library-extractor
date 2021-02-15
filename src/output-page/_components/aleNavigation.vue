<template>
  <div id="ale-navigation" :class="{ 'mobile-nav': $store.state.windowWidth < 630, 'mobile-nav-open': mobileMenuOpen }">
    <div class="inner-wrap">
      
      <div class="inner-wrap-wrapper">
        
        <div class="text-button gallery-page">
          <router-link :to="{ name: 'gallery' }" @click.native="mobileMenuOpen = false">
            <div class="icon">
              <font-awesome fas icon="home" />
              <span>Library</span>
              <!-- <font-awesome fas icon="th" />
              <span>Gallery</span> -->
            </div>
          </router-link>
        </div>

        <div class="text-button categories-page">
          <router-link :to="{ name: 'categories' }" @click.native="mobileMenuOpen = false">
            <div class="icon">
              <font-awesome fas icon="list" />
              <span>Categories</span>
            </div>
          </router-link>
        </div>

        <div class="text-button series-page">
          <router-link :to="{ name: 'all-series' }" @click.native="mobileMenuOpen = false">
            <div class="icon">
              <font-awesome fas icon="list" />
              <span>Series</span>
            </div>
          </router-link>
        </div>
        
        <div class="text-button collections-page" v-if="$store.state.library.collections">
          <router-link :to="{ name: 'collections' }" @click.native="mobileMenuOpen = false">
          <div class="icon">
            <font-awesome fas icon="list" />
            <span>Collections</span>
          </div>
          </router-link>
        </div>
        
        <div class="text-button wishlist-page" v-if="$store.state.library.wishlist">
          <router-link :to="{ name: 'wishlist' }" @click.native="mobileMenuOpen = false">
          <div class="icon">
            <font-awesome fas icon="list" />
            <span>Wishlist</span>
          </div>
          </router-link>
        </div>
        
        <div class="text-button close-mobile-menu" v-if="mobileMenuOpen" @click="mobileMenuOpen = false">
          <div class="icon">
            <font-awesome :icon="['fas', 'times-circle']" />
            <span>Close</span>
          </div>
        </div>
        
      </div>
      
      <div>
        <font-awesome 
        class="brgr-btn" 
        v-if="$store.state.windowWidth < 630" 
        :icon="['fas', 'bars']" 
        @click="toggleMobileMenu()"
        />
      </div>
      
      <div id="mobile-back-btn" v-if="mobileBrowserNavigation()">
        
        <router-link
        v-if="$routerHistory.hasPrevious()"
        :to="{ path: $routerHistory.previous().path }">
          <font-awesome fas icon="chevron-left" /> 
        </router-link>
        
        <router-link
        v-if="$routerHistory.hasForward()"
        :to="{ path: $routerHistory.next().path }">
          <font-awesome fas icon="chevron-right" /> 
        </router-link>
        
      </div>
      
      <div class="special-icons-wrapper">
        
        <light-switch></light-switch>
        
        <view-mode-switcher :justIcon="true" v-if="$route.name !== 'all-series' && $store.state.windowWidth < 450" />
        
        <div class="text-button" v-if="$store.state.searchMounted">
          <div class="icon" @click="startSearching">
            <font-awesome :icon="['fas', 'search']" />
          </div>
        </div>
        
        <div class="text-button" v-if="!$store.state.standalone">
          <ale-save-locally></ale-save-locally>
        </div>
        
        <div
        class="save-csv"
        v-tippy
        content="<strong>Download the spreadsheet as a CSV file.</strong> <br>Cells print out in plain text form, which means that none of the hyperlinks are included in the export."
        v-if="this.$store.state.route && this.$store.state.route.name === 'ale-spreadsheet'"
        @click="csvExportStarted"
        >
          <div class="icon">
            <font-awesome fas icon="file-csv" />
          </div>
        </div>
      </div>
      
    </div>
    <div class="inner-wrap" v-if="showAudioPlayer">
      
      <audio-player :showAudioPlayer.sync="showAudioPlayer" :sampleData.sync="sampleData" />
      
    </div>
  </div>
</template>

<script>
import aleSaveLocally from "./aleSaveLocally";
import lightSwitch from "@output-snippets/lightSwitch";

export default {
  name: "aleMenuActions",
  components: {
    aleSaveLocally,
    lightSwitch,
    viewModeSwitcher: () => import( /* webpackChunkName: "view-mode-switcher" */ "@output-snippets/viewModeSwitcher"),
    audioPlayer: () => import( /* webpackChunkName: "audio-player" */ "@output-snippets/audio-player"),
  },
  
  data: function() {
    return {
      mobileMenuOpen: false,
      showAudioPlayer: false,
      sampleData: null,
    };
  },
  
  created: function() {
    this.$root.$on("play-audio", this.playSample);
  },

  beforeDestroy: function() {
    this.$root.$off("play-audio", this.playSample);
  },
  
  methods: {
    
    mobileBrowserNavigation: function() {
      return (
        this.$store.state.displayMode &&
        (this.$routerHistory.hasPrevious() || this.$routerHistory.hasForward())
      );
    },
    
    csvExportStarted: function() {
      // Eventbus.$emit("csvExportStarted", {
      //   from: "aleMenuActions"
      // });
    },
    
    toggleMobileMenu: function() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    
    playSample: function( msg ) {
      
      this.showAudioPlayer = false;
      this.$nextTick(function() {
        this.showAudioPlayer = true;
        this.sampleData = msg;
      });
      
    },
    
    startSearching: function() {
      
      this.$root.$emit("ios-auto-zoom-disable");
      this.$root.$emit('search-focus');
    },
    
  }
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

#ale-navigation {
  text-align: center;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  position: fixed;
  z-index: 900;
  top: 0;
  right: 0;
  left: 0;
  &.mobile-nav {
    top: unset;
    bottom: 0;
    font-size: 23px;
  }
  @include themify($themes) {
    background: lighten(themed(backColor), 5);
  }
  box-shadow: 2px 0px 13px rgba(#000, 0.5);
  padding: 5px 0;
  line-height: 0px;

  &,
  a {
    text-decoration: none;
    @include themify($themes) {
      color: rgba(themed(frontColor), 0.9) !important;
    }
  }
  
  .inner-wrap,
  .inner-wrap-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: center;
    align-content: center;
    justify-content: center;
  }
  
  .inner-wrap-wrapper > div,
  .inner-wrap > div {
    display: inline-block;
    margin-left: 10px;
    &:first-child {
      margin-left: 0px;
    }
  }
  
  &.mobile-nav {
    .inner-wrap-wrapper > div,
    .inner-wrap > div {
      margin-left: 25px !important;
      &:first-child {
        margin-left: 0px;
      }
    }
  }

  .icon {
    cursor: pointer;
    // cursor: default !important;
    border-radius: 999999px;
    outline: none;

    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-items: center;
    align-content: center;
    justify-content: center;
    // width: 30px;
    // height: 30px;
  }

  .text-button {
    a.router-link-active .icon [data-icon] {
      @include themify($themes) {
        color: themed(audibleOrange);
      }
    }

    .icon {
      width: auto;
      padding: 0 12px;
      > span {
        padding-left: 6px;
      }
    }
  }
  
  div.special-icons-wrapper {
    display: flex;
    flex-direction: row;
    padding: 7px 2px;
    border-radius: 9999px;
    @include themify($themes) {
      border: 1px solid rgba( themed(frontColor), .1);
    }
  }
  
  @media ( max-width: 720px ) {
    .inner-wrap-wrapper > div > a > div {
      padding: 0 2px !important;
    }
  }
  
  &.mobile-nav .inner-wrap-wrapper {
    display: none;
  }
  
  &.mobile-nav.mobile-nav-open .inner-wrap-wrapper {
    backdrop-filter: grayscale(100%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end !important;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9999999999999;
    background: rgba(#000, .88);
    > * {
      padding: 3.2% 0px;
      font-size: 1.2em;
      line-height: 1.1em;
    }
    padding-bottom: 20px;
    &, a {
      color: rgba(#fff, 0.85) !important;
    }
  }
  
  .close-mobile-menu,
  .brgr-btn {
    cursor: pointer;
  }
  
  #mobile-back-btn {
    display: flex;
    flex-direction: row;
    padding: 0 5px;
    border-radius: 9999px;
    @include themify($themes) {
      border: 1px solid rgba( themed(frontColor), .1);
    }
    > a {
      padding: 7px 10px;
    }
  }
}

</style>
