<template>
  <div id="ale-navigation" :class="{ regular: !mobileThreshold, 'mobile-nav': mobileThreshold, 'mobile-nav-open': mobileMenuOpen }">
    <div class="inner-wrap">
      
      <div class="inner-wrap-wrapper">
        
        <div class="text-button gallery-page" v-if="$store.state.library.books && routeExists('gallery')">
          <router-link :to="{ name: 'gallery' }" @click.native="linkClicked('gallery')">
            <div class="icon">
              <font-awesome fas icon="book" />
              <span>Library</span>
              <!-- <font-awesome fas icon="th" />
              <span>Gallery</span> -->
            </div>
          </router-link>
        </div>
        
        <div class="text-button collections-page" v-if="$store.state.library.collections && routeExists('collections')">
          <router-link :to="{ name: 'collections' }" @click.native="linkClicked('collections')">
          <div class="icon">
            <font-awesome fas icon="folder-open" />
            <span>Collections</span>
          </div>
          </router-link>
        </div>
        
        <div class="text-button parent-item" :class="{ 'sub-menu-active': subMenuActive }" v-if="$store.state.library.books && routeExists('anySubPage')" @click="subMenuClicked">
          <div class="icon" :class="{ 'router-link-active': $route.meta && $route.meta.subPage }">
            <font-awesome fas icon="chevron-down" />
            <span v-if="$route.meta && $route.meta.subPage && $route.meta.title">
              {{ $store.state.sticky.subPageSource === 'books' ? 'Library: ' : 'Wishlist: ' }}
              {{ $route.meta.title }}
            </span>
            <span v-else>Sub pages</span>
            <div class="sub-menu">
              
              <div class="text-button" v-if="routeExists('categories')">
                <router-link :to="{ name: 'categories' }" @click.native="linkClicked('categories')">
                  <div class="icon">
                    <font-awesome fas icon="indent" />
                    <span>Categories</span>
                  </div>
                </router-link>
              </div>
              
              <div class="text-button" v-if="routeExists('all-series')">
                <router-link :to="{ name: 'all-series' }" @click.native="linkClicked('all-series')">
                  <div class="icon">
                    <font-awesome fas icon="list-ol" />
                    <span>Series</span>
                  </div>
                </router-link>
              </div>
              
              <div class="text-button" v-if="routeExists('authors')">
                <router-link :to="{ name: 'authors' }" @click.native="linkClicked('authors')">
                  <div class="icon">
                    <font-awesome fas icon="user-friends" />
                    <span>Authors</span>
                  </div>
                </router-link>
              </div>
              
              <div class="text-button" v-if="routeExists('narrators')">
                <router-link :to="{ name: 'narrators' }" @click.native="linkClicked('narrators')">
                  <div class="icon">
                    <font-awesome fas icon="users" />
                    <span>Narrators</span>
                  </div>
                </router-link>
              </div>
              
              <div class="text-button" v-if="routeExists('publishers')">
                <router-link :to="{ name: 'publishers' }" @click.native="linkClicked('publishers')">
                  <div class="icon">
                    <font-awesome fas icon="book" />
                    <span>Publishers</span>
                  </div>
                </router-link>
              </div>
              
            </div>
          </div>
        </div>

        <!-- <div class="text-button categories-page" v-if="$store.state.library.books">
          <router-link :to="{ name: 'categories' }" @click.native="linkClicked('categories')">
            <div class="icon">
              <font-awesome fas icon="indent" />
              <span>Categories</span>
            </div>
          </router-link>
        </div>

        <div class="text-button series-page" v-if="$store.state.library.books">
          <router-link :to="{ name: 'all-series' }" @click.native="linkClicked('all-series')">
            <div class="icon">
              <font-awesome fas icon="list-ol" />
              <span>Series</span>
            </div>
          </router-link>
        </div> -->
        
        <div class="text-button wishlist-page" v-if="$store.state.library.wishlist && routeExists('wishlist')">
          <router-link :to="{ name: 'wishlist' }" @click.native="linkClicked('wishlist')">
          <div class="icon">
            <font-awesome fas icon="bookmark" />
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
      
      <div v-if="mobileThreshold" class="burger-menu">
        <font-awesome 
        class="brgr-btn" 
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
        
        <view-mode-switcher :justIcon="true" v-if="$store.state.searchMounted && mobileThreshold" />
        
        <div class="text-button" v-if="$store.state.searchMounted" v-tippy="{ interactive: true, allowHTML: true }" style="outline: none;" content='Click to scroll up and search. <br>Read about advanced search operators <a target="_blank" href="https://joonaspaakko.gitbook.io/audible-library-extractor/gallery/advanced-search">here</a>.'>
          <div class="icon" @click="startSearching">
            <font-awesome :icon="['fas', 'search']" />
          </div>
        </div>
        
        <div class="text-button" v-if="!$store.state.standalone">
          <ale-save-locally></ale-save-locally>
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
      mobileWidth: 630,
      subMenuActive: false,
    };
  },
  
  computed: {
    mobileThreshold: function() {
      return this.$store.state.windowWidth < this.mobileWidth;
    }
  },
  
  created: function() {
    this.$root.$on("play-audio", this.playSample);
    document.addEventListener("mousedown", this.outsideClick);
  },

  beforeDestroy: function() {
    this.$root.$off("play-audio", this.playSample);
    document.addEventListener("mousedown", this.outsideClick);
  },
  
  methods: {
    
    outsideClick: function(e) {
      if (this.subMenuActive) {
        var subMenu = e.target.closest(".sub-menu");
        var subMenuActive = e.target.closest(".sub-menu-active");
        if (!subMenu && !subMenuActive) {
          this.subMenuActive = false;
        }
      }
    },
    
    subMenuClicked: function() {
      
      this.subMenuActive = !this.subMenuActive;
      
    },
    
    linkClicked: function( linkName ) {
      
      this.mobileMenuOpen = false;
      
      if ( this.$route.name === linkName ) {
        this.$root.$emit('refresh-page');
      }
      
    },
    
    mobileBrowserNavigation: function() {
      return (
        this.$store.state.displayMode &&
        (this.$routerHistory.hasPrevious() || this.$routerHistory.hasForward())
      );
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
      this.$updateQuery({ query: 'y', value: null });
      this.$root.$emit('refresh-page', function( vue ) {
        vue.$root.$emit("ios-auto-zoom-disable");
        vue.$root.$emit('search-focus');
      });
    },
    
    routeExists: function( name ) {
      if ( name === 'anySubPage' ) {
        let  subPageStates = _.get( this.$store.state, 'library.extras.subPageStates' );
        if ( !subPageStates ) { return true; } 
        else {
          let foundEnabled = _.find( subPageStates, { enabled: true });
          if ( foundEnabled ) {
            return true;
          }
        }
      }
      else {
        let test = this.$router.resolve({ name: name });
        return test.resolved.matched.length > 0;
      }
      
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
    font-size: 21px !important;
    #view-mode-switcher {
      font-size: 21px !important;
    }
  }
  box-shadow: 2px 0px 13px rgba(#000, 0.5);
  line-height: 0px;

  &,
  a {
    text-decoration: none;
    @include themify($themes) {
      color: rgba(themed(frontColor), 0.9) !important;
    }
  }
  
  .inner-wrap,
  .inner-wrap-wrapper,
  .inner-wrap-wrapper > div {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-items: center;
    align-content: stretch;
    justify-content: center;
  }
  
  .inner-wrap-wrapper {
    margin-left: 10px;
    &:first-child {
      margin-left: 0px;
    }
  }
  
  .inner-wrap-wrapper > div > * {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: center;
    align-content: center;
    justify-content: center;
  }
  
  &.mobile-nav {
    .inner-wrap-wrapper > div,
    .inner-wrap > div {
      margin-left: 25px !important;
      &:first-child {
        margin-left: 0px !important;
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
    margin: 5px 0;
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
    -webkit-backdrop-filter: grayscale(100%);
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
    > *,
    > .parent-item .sub-menu > * {
      padding: 3.2% 0px !important;
      font-size: 1.1em !important;
      line-height: 1.0em !important;
    }
    > .parent-item { 
      margin: 0 !important;
      padding: 0 !important; 
      > .icon { padding: 0 !important; }
    }
    padding-bottom: 20px;
    &, a {
      color: rgba(#fff, 0.85) !important;
    }
  }
  
  .burger-menu {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: center;
    align-content: center;
    justify-content: center;
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
  
  .text-button {
    &.parent-item > .icon { cursor: pointer; }
    position: relative;
    z-index: 0;
    .sub-menu {
      cursor: default;
      display: none;
      position: absolute;
      top: 40px;
      left: 0;
      z-index: 10;
      padding-bottom: 6px;
      border-radius: 0 0 3px 3px;
      @include themify($themes) {
        color: themed( frontColor );
        box-shadow: 0 5px 15px rgba( themed(outerColor), .7);
        // border: 1px solid rgba( themed(frontColor), .2);
      }
      // border-top: none;
      > .text-button > a {
        text-align: left;
        display: block;
        margin-top: 6px;
        padding: 6px 0px;
      }
    }
    &.sub-menu-active .sub-menu {
    // &:hover .sub-menu {
      display: inline-block;
    }
    &.parent-item .router-link-active > [data-icon] {
      @include themify($themes) {
        color: themed(audibleOrange);
      }
    }
  }
  
  &.mobile-nav {
    .parent-item > .icon > * {
      display: none;
    }
    .sub-menu {
      display: inline-block !important;
      position: static;
      padding: 0;
      background: transparent !important;
      box-shadow: none !important;
      a { text-align: center !important; }
    }
  }
  
}

.theme-light #ale-navigation,
.theme-light #ale-navigation .sub-menu {
  background: #fff;
}

.theme-dark #ale-navigation,
.theme-dark #ale-navigation .sub-menu {
  background: lighten( #121517, 4);
}

</style>
