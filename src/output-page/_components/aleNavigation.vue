<template>
  <div id="ale-navigation" :class="{ regular: !mobileThreshold, 'mobile-nav': mobileThreshold, 'mobile-nav-open': mobileMenuOpen }">
    <div class="inner-wrap">
      
      <div class="inner-wrap-wrapper">
        
        <div class="text-button gallery-page" v-if="$store.state.library.books">
          <router-link :to="{ name: 'gallery' }" @click.native="linkClicked('gallery')">
            <div class="icon">
              <font-awesome fas icon="book" />
              <span>Library</span>
              <!-- <font-awesome fas icon="th" />
              <span>Gallery</span> -->
            </div>
          </router-link>
        </div>
        
        <div class="text-button parent-item" v-if="$store.state.library.books">
          <div class="icon" :class="{ 'router-link-active': $route.meta && $route.meta.subPage }">
            <font-awesome fas icon="chevron-down" />
            <span>Sub pages</span>
            <div class="sub-menu">
              
              <div class="text-button" v-if="$store.state.library.books">
                <router-link :to="{ name: 'categories' }" @click.native="linkClicked('categories')">
                  <div class="icon">
                    <font-awesome fas icon="indent" />
                    <span>Categories</span>
                  </div>
                </router-link>
              </div>
              
              <div class="text-button" v-if="$store.state.library.books">
                <router-link :to="{ name: 'all-series' }" @click.native="linkClicked('all-series')">
                  <div class="icon">
                    <font-awesome fas icon="list-ol" />
                    <span>Series</span>
                  </div>
                </router-link>
              </div>
              
              <div class="text-button" v-if="$store.state.library.books">
                <router-link :to="{ name: 'authors' }" @click.native="linkClicked('authors')">
                  <div class="icon">
                    <font-awesome fas icon="users" />
                    <span>Authors</span>
                  </div>
                </router-link>
              </div>
              
              <div class="text-button" v-if="$store.state.library.books">
                <router-link :to="{ name: 'narrators' }" @click.native="linkClicked('narrators')">
                  <div class="icon">
                    <font-awesome fas icon="user-friends" />
                    <span>Narrators</span>
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
        
        <div class="text-button collections-page" v-if="$store.state.library.collections">
          <router-link :to="{ name: 'collections' }" @click.native="linkClicked('collections')">
          <div class="icon">
            <font-awesome fas icon="folder-open" />
            <span>Collections</span>
          </div>
          </router-link>
        </div>
        
        <div class="text-button wishlist-page" v-if="$store.state.library.wishlist">
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
        
        <div class="text-button" v-if="$store.state.searchMounted" v-tippy="{ interactive: true, allowHTML: true, delay: 700 }" style="outline: none;" content="
          <strong>Click to start searching.</strong>
          <br><br>
          
          <h4>Advanced search operators</h4>
          
          
          <p>White space acts as an <strong>AND</strong> operator, while a single pipe <code>|</code> character acts as an <strong>OR</strong> operator. To escape white space, use double quote ex. <code>=“scheme language”</code> for exact match.</p>          
          <style>
            #advanced-search-table {
              text-align: left; 
              padding: 0px 30px;
            }
            #advanced-search-table td {
              padding: 2px 7px 3px;
              border-bottom: 1px solid rgba(127,127,127, .2);
            }
          </style>
          <table id='advanced-search-table'>
          <thead>
          <tr>
          <th>Token</th>
          <th>Match type</th>
          <th>Description</th>
          </tr>
          </thead>
          <tbody>
          <tr>
          <td><code>jscript</code></td>
          <td>fuzzy-match</td>
          <td>Items that fuzzy match jscript</td>
          </tr>
          <tr>
          <td><code>=scheme</code></td>
          <td>exact-match</td>
          <td>Items that are scheme</td>
          </tr>
          <tr>
          <td><code>&#39;python</code></td>
          <td>include-match</td>
          <td>Items that include python</td>
          </tr>
          <tr>
          <td><code>!ruby</code></td>
          <td>inverse-exact-match</td>
          <td>Items that do not include ruby</td>
          </tr>
          <tr>
          <td><code>^java</code></td>
          <td>prefix-exact-match</td>
          <td>Items that start with java</td>
          </tr>
          <tr>
          <td><code>!^earlang</code></td>
          <td>inverse-prefix-exact-match</td>
          <td>Items that do not start with earlang</td>
          </tr>
          <tr>
          <td><code>.js$</code></td>
          <td>suffix-exact-match</td>
          <td>Items that end with .js</td>
          </tr>
          <tr>
          <td><code>!.go$</code></td>
          <td>inverse-suffix-exact-match</td>
          <td>Items that do not end with .go</td>
          </tr>
          </tbody>
          </table>
        ">
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
      mobileWidth: 630,
    };
  },
  
  computed: {
    mobileThreshold: function() {
      return this.$store.state.windowWidth < this.mobileWidth;
    }
  },
  
  created: function() {
    this.$root.$on("play-audio", this.playSample);
  },

  beforeDestroy: function() {
    this.$root.$off("play-audio", this.playSample);
  },
  
  methods: {
    
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
      this.$updateQuery({ query: 'y', value: null });
      this.$root.$emit('refresh-page', function( vue ) {
        vue.$root.$emit("ios-auto-zoom-disable");
        vue.$root.$emit('search-focus');
      });
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
    &.parent-item > .icon { cursor: default; }
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
    &:hover .sub-menu {
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
