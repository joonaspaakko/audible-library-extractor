<template>
<div v-if="!loading" id="nav-outer-wrapper" :class="{ regular: !mobileThreshold, 'mobile-nav': mobileThreshold, 'mobile-nav-open': mobileMenuOpen }">
  <div id="ale-navigation" ref="navigation">
    
    <gallery-navigation-looper :routes="routes" v-model:mobileMenuOpen="mobileMenuOpen" :inRoot="true" :desktopMenu="!mobileMenuOpen" />
    
    <!-- Component opened by one of the menu items -->
    <div class="floater-components" v-if="!mobileThreshold">
      <component v-if="clickedRouteComp" :is="clickedRouteComp" @closeComp="clickedRoute = null" />
    </div>
    <!-- <mobile-menu /> -->
    
  </div>
  
  <gallery-mobile-menu-floaters v-if="mobileThreshold" v-model:mobileMenuOpen="mobileMenuOpen" :mobileThreshold="mobileThreshold" @startSearching="startSearching" />
  
  <!-- When gallery is saved to the home screen on a Tablet -->
  <gallery-back-forward-btns v-if="$store.state.displayMode && !mobileThreshold" :viewportFloat="true" />
  
  <gallery-audio-player-ui-mobile v-if="mobileThreshold && store.showMobilePlayer" />
  
</div>
</template>

<script>

import saveGallery from '@output-snippets/save-gallery.vue';
import saveCSV from '@output-snippets/save-csv.vue';

export default {
  name: "aleMenuActions",
  data: function() {
    return {
      store: this.$store.state,
      mobileMenuOpen: false,
      sampleData: null,
      subMenuActive: null,
      routeAvailable: {},
      loading: true,
      routes: null,
      clickedRoute: null,
    };
  },
  
  computed: {    
    clickedRouteComp() {
      
      const component = _.get( this.clickedRoute, 'meta.component' );
      if ( component ) {
        return {...component};
      }
      // return _.get( this.clickedRoute, 'meta.component' );
    },
    
    mobileThreshold() {
      return this.$store.getters.mobileThreshold;
    },
  },
  
  watch: {
    '$store.state.playingAudio': function() {
      this.globalTopNavHeight( this.mobileSize );
    },
    mobileThreshold( mobileSize ) {
      this.mobileMenuOpen = false;
      this.routes = this.getRoutes();
      this.globalTopNavHeight( mobileSize );
    },
    mobileMenuOpen( open ) {
      // FIXME this resets the scroll, so if you were looking at a book and you just close the menu, the scroll position is lost
      // - This should still exist in case there's need to scroll the mobile menu... just in case.
      // - So perhaps the fix should be to remember the scroll position when preventScrolling is triggered and reinstate it later
      this.$store.commit('prop', { key: 'preventScrolling', value: open }); // Makes it so if you have to scroll in the mobile menu, the viewport won't scroll
      this.routes = this.getRoutes();
    },
    clickedRouteComp( open ) {
      this.$store.commit('prop', { key: 'preventScrolling', value: open });
    },
  },
  
  created() {
    
    this.routes = this.getRoutes();
    
  },
  
  mounted: function() {
    
    this.loading = false;
    this.globalTopNavHeight( this.mobileSize );
    // document.addEventListener("mousedown", this.outsideClick, { passive: true });
    // this.$compEmitter.on("afterWindowResize", this.onWindowResize);
    
  },

  beforeUnmount: function() {
    // document.removeEventListener("mousedown", this.outsideClick);
    // this.$compEmitter.off("afterWindowResize", this.onWindowResize);
  },
  
  methods: {
    
    
    startSearching() {
      this.$compEmitter.emit("ios-auto-zoom-disable");
      this.$compEmitter.emit('search-focus');
    },
    
    getRoutes() {
      
      let routes = _.filter( this.$router.options.routes, 'meta.icon' );
          routes = JSON.parse(JSON.stringify( routes ));
      
      if ( !this.mobileThreshold ) {
        this.getExtraItems( routes );
        this.getNestedGroups( routes );
      }
      
      return routes;
      
    },
    
    getNestedGroups( routes ) {
      
      const vue = this;
      const indexes = this.getNestedIndexes( routes );
      
      // Detach all nestedGroups from the routes array...
      let removedRoutes = _.remove( routes, function( route ) {
        return _.get(route, 'meta.nestedGroup');
      });
      
      // Group nestedGroups array
      removedRoutes = _.groupBy( removedRoutes, 'meta.nestedGroup');
      
      // Put nested groups back...
      _.each( removedRoutes, function( routeGroup, key ) {
        const indexObj = _.find(indexes, { key: key });
        if ( indexObj ) routes.splice(indexObj.index, 0, vue.getSubPageSettings(routeGroup, key));
      });
      
    },
    
    getSubPageSettings( routeGroup, key ) {
      
      const vue = this;
      const group = {
        name: key,
        meta: {
          groupName: routeGroup[0].meta.nestedGroup,
          icon: 'fa-solid fa-chevron-down',
        },
        tag: 'div',
        childItems: _.orderBy(routeGroup, 'meta.order', 'asc'),
      };
      
      const groupName = routeGroup[0].meta.nestedGroup;
      
      switch( groupName ) {
        case 'subPages':
          group.altName = function( route ) {
            
            const routeTitle = _.get( vue.$route, 'meta.title');
            const labelPath = 'children.0.meta.title';
            const routeMatch = _.find( routeGroup, [ labelPath, routeTitle ]);
            if ( routeMatch ) {
              const prefix = vue.$route.query.subPageSource || vue.$store.state.sticky.subPageSource;
              return _.startCase(prefix) + ': ' + _.get( routeMatch, labelPath );
            }
            else {
              return _.startCase( key );
            }
            
          };
          break;
      }
      
      return group;
      
    },
    
    getNestedIndexes( routes ) {
      
      routes = _.clone(routes);
      
      // Remove everything but the first occurrence of a nestedGroup
      const keys = [];
      const removed = _.remove(routes, function( route ) {
        const nestedGroup = _.get(route, 'meta.nestedGroup');
        const firstOccurrence = !_.includes(keys, nestedGroup );
        if ( nestedGroup ) {
          if ( firstOccurrence ) keys.push( nestedGroup );
          else return true;
        }
      });
      
      // Find the index of the remaining routes that are part of a nestedGroup
      _.each(keys, function( key, i ) {
        const firstIndex = _.findIndex(routes, { 
          meta: { 
            nestedGroup: key 
          } 
        });
        keys[i] = { key, index: firstIndex };
      });
      
      return keys;
      
    },
    
    getExtraItems( routes ) {
      
      const vue = this;
      let additionalItems = [];
      
      if ( !this.$store.state.standalone ) {
        
        const extensionTools = [
          {
            tag: 'a',
            href: this.$store.state.urlOrigin + '/library',
            name: 'Open Audible library',
            disabled: false,
            meta: {
              icon: 'fa-brands fa-audible',
              nestedGroup: 'extension-tools'
            },
          },
          {
            tag: 'a',
            href: 'https://joonaspaakko.gitbook.io/audible-library-extractor/',
            name: 'Extension documentation',
            disabled: false,
            meta: {
              icon: 'fa-solid fa-graduation-cap',
              nestedGroup: 'extension-tools'
            },
          },
          {
            highlight: true,
            tag: 'div',
            name: 'Save gallery website',
            disabled: false,
            click: this.routeClick, 
            meta: {
              icon: 'fa-solid fa-download',
              nestedGroup: 'extension-tools',
              // component: () => import( /* webpackChunkName: "save-locally" */ "@output-comps/aleSaveLocally.vue"),
              component: saveGallery,
            },
          },
          {
            highlight: true,
            tag: 'div',
            name: 'CSV export&nbsp;<small>(spreadsheet)</small>',
            disabled: false,
            click: this.routeClick, 
            meta: {
              icon: 'fa-solid fa-file-csv',
              nestedGroup: 'extension-tools',
              component: saveCSV,
            },
          },
          {
            highlight: true,
            tag: 'div',
            name: 'Wallpaper creator',
            disabled: false,
            click: function( route ) {
              
              if ( !route.condition() ) return;
              
              try {
                
                let covers = _.filter( vue.$store.getters.collection, 'asin' );
                covers = JSON.parse(JSON.stringify(covers));
                covers = _.chunk(covers, 50);
                
                let storageObj = {
                  imageEditorChunks: covers,
                  imageEditorChunksLength: covers.length,
                  imageEditorTimeCode: new Date().getTime(),
                };
                
                if ( vue.$store.state.pageTitle    ) storageObj.imageEditorPageTitle = vue.$store.state.pageTitle;
                if ( vue.$store.state.pageSubTitle ) storageObj.imageEditorPageSubTitle = vue.$store.state.pageSubTitle;
                
                chrome.storage.local.set(storageObj).then(() => {
                  chrome.runtime.sendMessage({ action: "openImageEditor" });
                });
                
                
              } catch (e) {}
            },
            condition: function() {
              return vue.$route.meta.gallery && vue.$store.getters.collection && vue.$store.getters.collection.length; // Collection being an array, not Audible collections
            },
            tippy: function() {
              let txt = "When you open wallpaper creator, books are imported from the current page with the active sorting. Search and filters also affect what gets imported.";
              const nobooks = !(vue.$route.meta.gallery && vue.$store.getters.collection && vue.$store.getters.collection.length);
              const booksWithCovers = _.filter( vue.$store.getters.collection, 'cover');
              if ( nobooks ) txt += "<br><br> <strong style='color: #db7e00; font-size: 19px;'>Can't be opened on pages that don't have any books.</strong>";
                        else txt += "<br><br> <strong style='color: #db7e00;'>Current selection of books "+ vue.$store.getters.collection.length +" / "+ vue.$store.getters.collectionTotal +". <br> Importable book covers: <span style='color: #50a900;'>"+ booksWithCovers.length +"</span></strong>";
              return txt;  
            },
            meta: {
              icon: 'fa-regular fa-image',
              nestedGroup: 'extension-tools'
            },
          },
          {
            tag: 'div',
            name: 'Set as gallery landing page',
            tippy: "Click here and any links leading to the extension gallery (in browser context menu or extraction settings) will open this exact page. The url will be saved as is, so all url parameters will be saved as well. This includes: searches, filters, sorting, and some other things. <br><br>For example, open the library page, filter out finished books, click this menu item, and now you don't have to do that every time you open the gallery, if that is what you prefer...",
            disabled: false,
            click: function( route ) {
              try {
                
                const path = window.location.pathname;
                const newUrl = '.'+path + window.location.href.split( path )[1];
                chrome.runtime.sendMessage({ action: "changeGalleryUrl", url: newUrl }).then(() => {
                  
                  // This part makes sure the galleryUrl sticks between sessions (assumin)
                  chrome.storage.local.get(['extras']).then(data => {
                    data.extras.galleryUrl = newUrl;
                    chrome.storage.local.set({ extras: data.extras}).then(() => {
                      
                    });
                  });
                  
                });
                
              } catch(e) {}
            },
            meta: {
              icon: 'fa-solid fa-house-user',
              nestedGroup: 'extension-tools'
            },
          },
          {
            tag: 'div',
            name: 'Reset gallery landing page',
            disabled: false,
            click: function( route ) {
              try {
                
                const newUrl = null;
                chrome.runtime.sendMessage({ action: "changeGalleryUrl", url: newUrl }).then(() => {
                  
                  // This part makes sure the galleryUrl sticks between sessions (assumin)
                  chrome.storage.local.get(['extras']).then(data => {
                    data.extras.galleryUrl = newUrl;
                    chrome.storage.local.set({ extras: data.extras}).then(() => {
                      
                    });
                  });
                  
                });
                
              } catch(e) {}
            },
            meta: {
              icon: 'fa-solid fa-house',
              nestedGroup: 'extension-tools'
            },
          },
        ];
        
        additionalItems = additionalItems.concat( extensionTools );
        
      }
      
      if ( additionalItems.length ) {
        _.each( additionalItems, function( route ) {
          routes.push( route );
        });
      }
    },
    
    routeClick( route ) {
      this.clickedRoute = route;
    },
    
    globalTopNavHeight( mobileSize ) {
      this.$nextTick(function() {
        
        let offset = 0;
        
        if ( !mobileSize ) {
          const nav = this.$refs.navigation;
          if ( nav ) offset = Math.floor( nav.getBoundingClientRect().height );
        }
        
        this.$store.commit('prop', { key: 'topNavOffset', value: offset });
        
      });
    },
    
  }
};
</script>

<style lang="scss">


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

#ale-navigation {
  @include themify($themes) {
    background: themed(elementColor);
    color: themed(frontColor);
  }
  position: fixed;
  z-index: 900;
  top: 0;
  right: 0;
  left: 0;
  box-shadow: 0px 2px 13px rgba(#000, 0.4);
  @include themify($themes) {
    border-bottom: 1px solid rgba(themed(frontColor), .15);
  }
  &,
  a {
    text-decoration: none;
    @include themify($themes) {
      color: themed(frontColor) !important;
    }
  }
  .menu-items {
    flex-direction: column;
  }
}
    
#nav-outer-wrapper.mobile-nav #ale-navigation {
  @include themify($themes) {
    display: none;
    background: themed(elementColor);
  }
}
#nav-outer-wrapper.mobile-nav-open #ale-navigation {
  @include themify($themes) {
    flex-direction: column-reverse;
    display: block;
    background: rgba( themed(backColor), .85 );
    -webkit-backdrop-filter: grayscale(.96) blur(1.5px);
    backdrop-filter: grayscale(.96) blur(1.5px);
    bottom: 0px;
    
    // -webkit-animation:swing-in-top-fwd 360ms cubic-bezier(.175,.885,.32,1.275) both;
    //         animation:swing-in-top-fwd 360ms cubic-bezier(.175,.885,.32,1.275) both;
    // /* ----------------------------------------------
    // * Generated by Animista on 2022-6-12 16:52:51
    // * Licensed under FreeBSD License.
    // * See http://animista.net/license for more info. 
    // * w: http://animista.net, t: @cssanimista
    // * ---------------------------------------------- */
    // @-webkit-keyframes swing-in-top-fwd{0%{-webkit-transform:rotateX(-100deg);transform:rotateX(-100deg);-webkit-transform-origin:top;transform-origin:top;opacity:0}100%{-webkit-transform:rotateX(0deg);transform:rotateX(0deg);-webkit-transform-origin:top;transform-origin:top;opacity:1}}@keyframes swing-in-top-fwd{0%{-webkit-transform:rotateX(-100deg);transform:rotateX(-100deg);-webkit-transform-origin:top;transform-origin:top;opacity:0}100%{-webkit-transform:rotateX(0deg);transform:rotateX(0deg);-webkit-transform-origin:top;transform-origin:top;opacity:1}}
    
    .menu-items {
      height: 100%;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
    }
    
  }
}

// #nav-outer-wrapper.mobile-nav-open #audio-player {
//   top: 0;
//   right: 0;
//   bottom: unset;
//   left: 0;
//   position: absolute;
// }
    

.floater-components {
  position: absolute;
  z-index: 50;
}

</style>