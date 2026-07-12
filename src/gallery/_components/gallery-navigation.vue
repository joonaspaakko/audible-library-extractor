<template>
<div v-if="!loading" id="nav-outer-wrapper" :class="{ regular: !mobileThreshold, 'mobile-nav': mobileThreshold, 'mobile-nav-open': mobileMenuOpen }">
  <div id="ale-navigation" ref="navigation">

    <gallery-navigation-looper :routes="routes" v-model:mobileMenuOpen="mobileMenuOpen" :inRoot="true" :desktopMenu="!mobileMenuOpen" />
    <!-- <mobile-menu /> -->

  </div>

  <!-- Component opened by one of the menu items (outside #ale-navigation so mobile-nav display:none doesn't affect it) -->
  <component v-if="clickedRouteComp" :is="clickedRouteComp" @closeComp="clickedRoute = null" />
  
  <gallery-mobile-menu-floaters v-if="mobileThreshold" v-model:mobileMenuOpen="mobileMenuOpen" :mobileThreshold="mobileThreshold" @startSearching="startSearching" />
  
  <!-- When gallery is saved to the home screen on a Tablet -->
  <gallery-back-forward-btns v-if="$store.state.displayMode && !mobileThreshold" :viewportFloat="true" />
  
  <gallery-audio-player-ui-mobile v-if="mobileThreshold && store.showMobilePlayer" />
  
</div>
</template>

<script>

import saveGallery from '@output-snippets/save-gallery.vue';
import saveCSV from '@output-snippets/save-csv.vue';
import { storageSet } from '@utils/chrome-storage.js';
import openWallpaperCreator from '@output-mixins/gallery-open-wallpaper-creator.js';

// ICON IMPORTS
import IconFaSolidChevronDown   from '~icons/fa6-solid/chevron-down?raw';
import IconFaBrandsAudible      from '~icons/fa6-brands/audible?raw';
import IconFaSolidGraduationCap from '~icons/fa6-solid/graduation-cap?raw';
import IconFluentColorCloud     from '~icons/fluent-color/cloud-16?raw';
import IconVscodeFileTypeExcel  from '~icons/vscode-icons/file-type-excel?raw';
import IconFaSolidHouseUser     from '~icons/fa6-solid/house-user?raw';
import IconFaSolidHome          from '~icons/fa6-solid/house?raw';

// Recolored streamline-color:screensaver-monitor-wallpaper-flat: white screen with a neutral gray
// border/stand (instead of the set's stock blue), orange sun, teal mountains.
const IconWallpaperMonitor = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 14 14"><g fill="none"><path fill="#8a8f98" fill-rule="evenodd" d="M5.635 10.332a.5.5 0 0 1 .47-.332h1.79a.5.5 0 0 1 .47.332l.687 1.918H10a.75.75 0 0 1 0 1.5H4a.75.75 0 0 1 0-1.5h.948z" clip-rule="evenodd"/><path fill="#ffffff" stroke="#8a8f98" stroke-width="0.6" fill-rule="evenodd" d="M1.457.25C.652.25 0 .902 0 1.707v7.586c0 .805.652 1.457 1.457 1.457h11.086c.805 0 1.457-.652 1.457-1.457V1.707C14 .902 13.348.25 12.543.25z" clip-rule="evenodd"/><path fill="#f79a1c" d="M3.945 5.008a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3"/><path fill="#2ba58c" fill-rule="evenodd" d="M12 6.334L9.422 4.48a1.18 1.18 0 0 0-1.52.032L3.377 8.75H12z" clip-rule="evenodd"/></g></svg>`;

export default {
  name: "aleMenuActions",
  mixins: [ openWallpaperCreator ],
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

    // Debugging: Open save gallery on page load 
    // let saveGallery = _.find( this.routes, route => _.get(route, 'name') === "extension-tools" );
    // if ( saveGallery ) {
    //   saveGallery = _.find(saveGallery.childItems, { name: "Save gallery website" });
    //   this.routeClick(saveGallery);
    // }
    
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
      else {
        // On mobile sub-pages appear flat, so sort them by meta.order so the order
        // matches the desktop dropdown regardless of router registration order.
        const subPages = _.remove( routes, ( r ) => _.get( r, 'meta.nestedGroup' ) === 'subPages' );
        if ( subPages.length ) {
          // Re-insert after Library (index 0), sorted, keeping everything else after.
          routes.splice( 1, 0, ..._.orderBy( subPages, 'meta.order', 'asc' ) );
        }
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
          icon: IconFaSolidChevronDown,
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
              icon: IconFaBrandsAudible,
              nestedGroup: 'extension-tools'
            },
          },
          {
            tag: 'a',
            href: 'https://joonaspaakko.gitbook.io/audible-library-extractor/',
            name: 'Extension documentation',
            disabled: false,
            meta: {
              icon: IconFaSolidGraduationCap,
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
              icon: IconFluentColorCloud,
              multicolorIcon: true,
              nestedGroup: 'extension-tools',
              // component: () => import( /* webpackChunkName: "save-locally" */ "@output-comps/aleSaveLocally.vue"),
              component: saveGallery,
            },
          },
          {
            highlight: true,
            tag: 'div',
            name: 'Spreadsheet export',
            disabled: false,
            click: this.routeClick, 
            meta: {
              icon: IconVscodeFileTypeExcel,
              multicolorIcon: true,
              nestedGroup: 'extension-tools',
              component: saveCSV,
            },
          },
          {
            highlight: true,
            tag: 'div',
            name: 'Collage maker',
            disabled: false,
            click: function( route ) {

              // When the current page has no importable books the mega menu handles
              // the click itself, prompting for a library/wishlist source instead.
              if ( !route.condition() ) return;

              vue.openWallpaperCreator( vue.$store.getters.collection, vue.$store.state.pageTitle, vue.$store.state.pageSubTitle );

            },
            condition: function() {
              return vue.$route.meta.gallery && vue.$store.getters.collection && vue.$store.getters.collection.length; // Collection being an array, not Audible collections
            },
            tippy: function() {
              let txt = "When you open the collage maker, books are imported from the current page with the active sorting. Search and filters also affect what gets imported.";
              const nobooks = !(vue.$route.meta.gallery && vue.$store.getters.collection && vue.$store.getters.collection.length);
              const booksWithCovers = _.filter( vue.$store.getters.collection, 'cover');
              if ( nobooks ) txt += "<br><br> <strong style='color: #db7e00; font-size: 19px;'>Can't be opened on pages that don't have any books.</strong>";
                        else txt += "<br><br> <strong style='color: #db7e00;'>Current selection of books "+ vue.$store.getters.collection.length +" / "+ vue.$store.getters.collectionTotal +". <br> Importable book covers: <span style='color: #50a900;'>"+ booksWithCovers.length +"</span></strong>";
              return txt;  
            },
            meta: {
              icon: IconWallpaperMonitor,
              multicolorIcon: true,
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
                  storageSet( 'metadata', 'extras.galleryUrl', newUrl );

                });

              } catch(e) {}
            },
            meta: {
              icon: IconFaSolidHouseUser,
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
                  storageSet( 'metadata', 'extras.galleryUrl', newUrl );
                  
                });
                
              } catch(e) {}
            },
            meta: {
              icon: IconFaSolidHome,
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
    

</style>