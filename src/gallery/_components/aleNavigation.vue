<template>
<div id="nav-outer-wrapper" :class="{ regular: !mobileThreshold, 'mobile-nav': mobileThreshold, 'mobile-nav-open': mobileMenuOpen }">
  <div id="ale-navigation">
    <div class="inner-wrap">
      
      <div class="inner-wrap-wrapper">
        
        <!-- Makes the empty area above mobile menu clickable and it closes the menu -->
        <div class="close-area" style="flex: 1; margin-bottom: 30px;" v-if="mobileMenuOpen" @click="mobileMenuOpen = false"></div>
        
        <div class="text-button gallery-page" v-if="routeExists('gallery')">
          <router-link :to="{ name: 'gallery' }" @click.native="linkClicked('gallery')">
            <div class="icon">
              <font-awesome fas icon="book" />
              <span>Library</span>
              <!-- <font-awesome fas icon="th" />
              <span>Gallery</span> -->
            </div>
          </router-link>
        </div>
        
        <div class="text-button collections-page" v-if="routeExists('collections')">
          <router-link :to="{ name: 'collections' }" @click.native="linkClicked('collections')">
          <div class="icon">
            <font-awesome fas icon="folder-open" />
            <span>Collections</span>
          </div>
          </router-link>
        </div>
        
        <div class="text-button parent-item" :class="{ 'sub-menu-active': subMenuActive }" v-if="!$store.state.standalone || routeExists('anySubPage')" @click="subMenuClicked">
          <div class="icon" :class="{ 'router-link-active': $route.meta && $route.meta.subPage }">
            <font-awesome fas icon="chevron-down" />
            <span v-if="$route.meta && $route.meta.subPage && $route.meta.title">
              {{ ($route.query.subPageSource || $store.state.sticky.subPageSource) === 'books' ? 'Library: ' : 'Wishlist: ' }}
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
        
        <div class="text-button wishlist-page" v-if="routeExists('wishlist')">
          <router-link :to="{ name: 'wishlist' }" @click.native="linkClicked('wishlist')">
          <div class="icon">
            <font-awesome fas icon="bookmark" />
            <span>Wishlist</span>
          </div>
          </router-link>
        </div>
        
        <div class="close-mobile-menu" v-if="mobileMenuOpen" @click="mobileMenuOpen = false">
          <!-- <div class="icon"> -->
            <font-awesome :icon="['fas', 'times']" />
            <!-- <span>Close</span> -->
          <!-- </div> -->
        </div>
        
        <div class="mobile-menu-extras" v-show="mobileMenuOpen">
          
          <light-switch></light-switch>
          
          <view-mode-switcher :justIcon="true" v-if="$store.state.searchMounted" />
          
        </div>
        
      </div>
      
      <div class="special-icons-wrapper" v-if="!mobileThreshold">
        
        <light-switch></light-switch>
        
        <view-mode-switcher :justIcon="true" v-if="$store.state.searchMounted && mobileThreshold" />
        
        <div class="text-button" v-if="$store.state.searchMounted" v-tippy="{ interactive: true, allowHTML: true }" style="outline: none;" content='Click to scroll up and search. <br>Read about advanced search operators <a target="_blank" rel="noopener noreferrer" href="https://joonaspaakko.gitbook.io/audible-library-extractor/gallery/advanced-search">here</a>.'>
          <div class="icon" @click="startSearching">
            <font-awesome :icon="['fas', 'search']" />
          </div>
        </div>
        
        <div class="text-button" v-if="!$store.state.standalone" style="z-index: 9999;">
          <ale-save-locally></ale-save-locally>
        </div>
        
        <div class="text-button" v-if="!$store.state.standalone && $route.meta.gallery && $store.getters.collection && $store.getters.collection.length">
          <div class="icon" @click="openImageGallery">
            <font-awesome :icon="['fas', 'images']" />
          </div>
        </div>
        
      </div>
      
    </div>
    <audio-player  v-if="showAudioPlayer" :showAudioPlayer.sync="showAudioPlayer" :sampleData.sync="sampleData" />
  </div>
  
  
  <!-- 
    This v-show on the parent and v-if on the child element is to retain 
    inline styles when the user opens and closes the sample audio player 
  -->
  <div id="mobile-menu-floaters" v-show="mobileThreshold && !mobileMenuOpen">
    
    <div v-if="mobileThreshold" class="second-row">
      
      <div v-if="$store.state.searchMounted" class="search-btn" @click="startSearching">
        <font-awesome :icon="['fas', 'search']" />
      </div>
      
      <div class="mobile-back-btns-wrapper" v-if="$store.state.displayMode">
        <div class="mobile-back-btns" v-if="$routerHistory.hasPrevious()">
          <router-link :to="{ path: $routerHistory.previous().path }">
            <font-awesome fas icon="chevron-left" /> 
          </router-link>
        </div>
        
        <div class="mobile-back-btns" v-if="$routerHistory.hasForward()">
          <router-link :to="{ path: $routerHistory.next().path }">
            <font-awesome fas icon="chevron-right" /> 
          </router-link>
        </div>
      </div>
      
      <div class="burger-menu" @click="toggleMobileMenu()">
        <font-awesome 
        class="brgr-btn" 
        :icon="['fas', 'bars']" 
        />
      </div>
      
    </div>
    
  </div>
</div>
</template>

<script>
import lightSwitch from "@output-snippets/lightSwitch";

export default {
  name: "aleMenuActions",
  components: {
    lightSwitch,
    aleSaveLocally: () => import( /* webpackChunkName: "save-locally" */ "./aleSaveLocally"),
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
    document.addEventListener("mousedown", this.outsideClick, { passive: true });
    this.$root.$on("afterWindowResize", this.onWindowResize);
  },

  beforeDestroy: function() {
    this.$root.$off("play-audio", this.playSample);
    document.removeEventListener("mousedown", this.outsideClick);
    this.$root.$off("afterWindowResize", this.onWindowResize);
  },
  
  methods: {
    
    onWindowResize: function( win ) {
      if ( this.mobileMenuOpen && win.widthChanged && win.width >= this.mobileWidth ) {
        this.mobileMenuOpen = false;
      }
    },
    
    openImageGallery: function() {
      
      try {
        
        let covers = _.filter( this.$store.getters.collection, 'asin' );
        covers = JSON.parse(JSON.stringify(covers));
        covers = _.chunk(covers, 50);
        
        let storageObj = {
          imageEditorChunks: covers,
          imageEditorChunksLength: covers.length,
        };
        
        if ( this.$store.state.pageTitle    ) storageObj.imageEditorPageTitle = this.$store.state.pageTitle;
        if ( this.$store.state.pageSubTitle ) storageObj.imageEditorPageSubTitle = this.$store.state.pageSubTitle;
        
        browser.storage.local.set(storageObj).then(() => {
          browser.runtime.sendMessage({ action: "openImageEditor" });
        });
        
        
      } catch (e) {}
      
    },
    
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

#nav-outer-wrapper {
  display: inline-block;
  text-align: center;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

#nav-outer-wrapper {
  
  #ale-navigation {
    position: fixed;
    z-index: 900;
    top: 0;
    right: 0;
    left: 0;
    box-shadow: 0px 2px 13px rgba(#000, 0.4);
  }
  
  &.mobile-nav #ale-navigation > .inner-wrap { display: none; }
  &.mobile-nav-open #ale-navigation > .inner-wrap { display: inline-block; }
  &.mobile-nav #ale-navigation {
    top: unset;
    bottom: 0;
    font-size: 21px !important;
    #view-mode-switcher {
      font-size: 21px !important;
    }
  }
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
  
  svg {
    border-radius: none;
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
    margin-left: 10px;
    display: flex;
    flex-direction: row;
    padding: 7px 2px;
    border-radius: 9999px;
    @include themify($themes) {
      border: 1px solid rgba( themed(frontColor), .1);
    }
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
    padding-bottom: 55px;
    > *,
    > .parent-item .sub-menu > * {
      font-size: 1.1em !important;
      line-height: 1.0em !important;
    }
    .text-button {
      margin: 0;
      padding: 0;
    }
    .parent-item {
      padding: 0;
    }
    a {
      margin-top: 3px !important;
      padding: 9px 0px !important;
    }
    &, a {
      color: rgba(#fff, 0.85) !important;
    }
  }
  
  .close-mobile-menu,
  .brgr-btn {
    cursor: pointer;
  }
  
  div.close-mobile-menu {
    position: absolute;
    z-index: 10;
    left: 0px;
    bottom: 0px;
    padding: 15px !important;
    margin: 0 !important;
    svg {
      font-size:   38px !important;
      line-height: 38px !important;
    }
    color: rgba( #fff, .6);
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

#ale-navigation div.mobile-menu-extras {
  margin: 0 !important;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 5;
  right: 5px;
  bottom: 5px; 
  > div {
    margin: 6px !important;
    position: relative;
    &:before {
      content: '';
      position: absolute;
      z-index: -1;
      border-radius: 50%;
      width: 100%;
      height: auto;
      padding-top: 100%;
      border-radius: 9999999px;
      // border: 2px solid rgba(#fff, .2);
      background: rgba(#fff, .1);
      // box-shadow: 0px 0px 6px rgba(#fff, .15);
    }
    &:after {
      content: '';
      position: absolute;
      z-index: -2;
      border-radius: 50%;
      width: 100%;
      height: auto;
      padding-top: 100%;
      border-radius: 9999999px;
      // border: 2px solid rgba(#fff, .2);
      background: rgba(#000, 1);
      // box-shadow: 0px 0px 6px rgba(#fff, .15);
    }
  }
  > div > * {
    padding: 11px !important;
    z-index: 0;
  }
}

.center-contents {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  align-content: center;
  justify-content: center;
}

#mobile-menu-floaters {
  transition: bottom 200ms ease-in-out;
  position: fixed;
  z-index: 200;
  bottom: 10px;
  right: 10px;
  
  @extend .center-contents;
  align-items: flex-end;
  align-content: flex-end;
  flex-direction: column;
  &, a {
    color: #fff !important;
  }
  
  .search-btn {
    position: absolute;
    top: -46px;
    cursor: pointer;
    @extend .center-contents;
    border-radius: 999999px;
    width:  32px;
    height: 32px;
    // @include themify($themes) {
    //   background: rgba( themed(backColor), .25);
    // }
    background: rgba( #292929, .90);
    border: 1px solid rgba( #fff, 1);
  }
  
  .burger-menu {
    cursor: pointer;
    position: relative;
    z-index: 5;
    @extend .center-contents;
    width: 60px;
    height: 60px;
    @include themify($themes) {
      background: themed(audibleOrange);
      border: 2px solid rgba( themed(backColor), .8);
    }
    border-radius: 999999px;
    color: #fff;
    box-shadow: 0 2px 15px rgba(#000, .5);
    
  }
  .second-row {
    @extend .center-contents;
  }
  
  .mobile-back-btns-wrapper {
    @extend .center-contents;
    position: absolute;
    z-index: 1;
    right: 65px;
    white-space: nowrap;
  }
  .mobile-back-btns {
    @extend .search-btn;
    position: relative;
    top: 0;
    margin: 7px;
    &, a {
      @extend .center-contents;
      width:  32px;
      height: 32px;
    }
  }
  
}

// #nav-outer-wrapper.mobile-nav 

</style>