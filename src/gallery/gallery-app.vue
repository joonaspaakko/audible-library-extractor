<template>
  <div id="audible-library-extractor" :data-version="$store.state.version" :class="{ 'mobile-threshold': $store.state.windowWidth < 630 }" :data-block-scrolling="$store.state.blockScrolling">
    
    <ale-background v-if="$store.state.showBackground && !($store.state.standalone && !$store.state.siteOnline)"></ale-background>
    <ale-navigation></ale-navigation>
    
    <!-- <extension-gallery-toolbar /> -->
    
    <div v-if="$route.name !== '404'">
      <router-view :key="$route.name+'-'+$store.state.routeParams+'-'+$store.state.refreshView"></router-view>
    </div>
    <div v-else id="nothing-here-404">
      <h3 v-if="$store.getters.searchIsActive && !$store.state.searchCollection.length">Search: no results</h3>
      <h3 v-else>404: There's nothing here</h3>
    </div>
    
  </div>
</template>

<script>
import aleNavigation from "./_components/aleNavigation";
import aleBackground from "./_components/aleBackground";
// import extensionGalleryToolbar from "./_components/extension-gallery-toolbar.vue";
// import aleBreadcrumbs from "./_components/aleBreadcrumbs";

export default {
  components: {
    // aleBackground: () => import('./_components/aleBackground'),
    aleBackground,
    aleNavigation,
    // extensionGalleryToolbar,
    // aleBreadcrumbs
  },
  data: function() {
    return {
      general: {
        route: null,
        standalone: null,
        categories: null,
        tippyTheme: "dark"
      },
      window: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  },
  
  created: function() {
    
    if ( !this.$store.state.sticky.lightSwitchSetByUser ) {
      const html = document.querySelector('html');
      html.classList.remove("theme-dark");
      html.classList.add("theme-light");
    }
    
    let vue = this;
    
    // var isbn = _.filter(this.$store.state.library.books, 'isbns');
    // console.log( 'books with ISBN:', isbn.length, isbn );
    // console.log( _.filter( this.$store.state.library.books, ['asin', 'B08BX58B3N'] ) )
    if ( this.checkIf_iOS() ) {
      document.querySelector('body').classList.add('is-ios');
    }
    
    this.$root.$on('refresh-page', this.refreshPage);
    
    this.$store.commit('prop', { key: 'siteOnline', value: navigator.onLine });
    window.addEventListener('offline', function() {
      vue.$store.commit('prop', { key: 'siteOnline', value: false });
    }, { passive: true });
    window.addEventListener('online', function() {
      vue.$store.commit('prop', { key: 'siteOnline', value: true });
    }, { passive: true });
    
  },

  mounted: function() {
    
    const vue = this;
    window.addEventListener("resize", vue.onWindowResize, { passive: true });
    this.showTheBackgroundGrid();
    
  },
  
  beforeDestroy: function() {
    
    this.$root.$off('refresh-page', this.refreshPage);

  },

  methods: {
    
    refreshPage: function( callback ) {
      const vue = this;
      const timeStamp = new Date().getTime();
      this.$store.commit('prop', { key: 'viewRefresh', value: timeStamp });
      this.$nextTick(function() {
        
        setTimeout(function() {
          vue.$store.commit('prop', { key: 'viewRefresh', value: '' });
          vue.$nextTick(function() {
            if ( typeof callback === 'function' ) callback( vue );
          });
        }, 10);
        
      });
    },
    
    checkIf_iOS: function() {
      return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
      ].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    },
    
    showTheBackgroundGrid: function() {
      if ( !this.$store.state.showBackground ) {
        const vue = this;
        this.$nextTick(function() {
          setTimeout(function() {
            vue.$store.commit("prop", { key: 'showBackground', value: true });
          }, 1200);
        });
      }
    },
    
    onWindowResize: _.debounce(function() { 
      
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const widthChanged = (this.window.width !== currentWidth);
      const heightChanged = (this.window.height !== currentHeight);
      
      if (widthChanged || heightChanged) {
        
        this.window.width = currentWidth;
        this.window.height = currentHeight;
        
        if ( widthChanged ) this.$store.commit('prop', { key: 'windowWidth', value: currentWidth});
        
        this.$root.$emit("afterWindowResize", {
          from: "app",
          width: currentWidth,
          widthChanged: widthChanged,
          height: currentHeight,
          heightChanged: heightChanged
        });
        
      }
      
    }, 320, { leading: true, trailing: true }),
    
  },

  watch: {
    $route: function(route, previousRoute) {
      
      let paramsString = route.params ? _.map( route.params, function( value, param ) { return param + ':' + value; }).join(',') : null;
      this.$store.commit("prop", [
        { key: "route", value: route },
        { key: "routeParams", value: paramsString },
      ]);
      
      this.$nextTick(function() {
        
        
        if ( this.$store.state.pageTitle && (this.$route.meta.title || this.$route.meta.title === '') ) {
          document.title = 'ALE • ' + (( this.$route.meta.title === this.$store.state.pageTitle ) ? this.$store.state.pageTitle : (this.$route.meta.title + ': ' + this.$store.state.pageTitle));
        }
        else if ( route.meta.title ) {
          document.title = 'ALE • ' + ( route.meta.title || 'My Audible Library' );
        }
        
      });
      
    }
  },
  
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

/* inconsolata-regular - latin */
@font-face {
  font-family: 'Inconsolata';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('../fonts/inconsolata-v21-latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('../fonts/inconsolata-v21-latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* roboto-regular - latin */
@font-face {
  font-family: 'Roboto';
  font-style: normal; 
  font-weight: 400;
  src: local(''),
       url('../fonts/roboto-v29-latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('../fonts/roboto-v29-latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* roboto-700 - latin */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  src: local(''),
       url('../fonts/roboto-v29-latin-700.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('../fonts/roboto-v29-latin-700.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

html.theme-dark {
  background-color: $darkBackColor !important;
}
html.theme-light {
  background-color: $lightBackColor !important;
}

// .is-ios .tippy-popper { display: none !important; }

// @media ( max-width: 630px ) {
//   .tippy-popper { display: none !important; }
// }

html {
  padding-top: 1px;
  margin: 0;
  margin-top: -1px;
}
body {
  margin: 0px;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: "Roboto", sans-serif !important;
  font-size: 14px !important;
  line-height: 1.55em !important;
}

#audible-library-extractor {
  box-sizing: border-box;
  padding-top: 80px;
  &.mobile-threshold { padding-top: 45px; };
  
  a {
    text-decoration: none;
    @include themify($themes) {
      color: themed(audibleOrange);
    }
  }
  a:visited {
    // @include themify($themes) { color: rgba( themed(frontColor), .7); }
    @include themify($themes) {
      color: darken(desaturate(themed(audibleOrange), 5), 25);
    }
  }
  a:hover {
    @include themify($themes) {
      color: themed(frontColor);
    }
  }

}

// @media all and (display-mode: standalone) {
//   /* Here goes the CSS rules that will only apply if app is running standalone */
// }

// #audible-app-link {
//   width: 35px;
//   height: 35px;
//   border-radius: 999999px;
//   background: $audibleOrange;
//   background: #f29a33;
//   background: #ffc338;
//   background: #ffc338;
//   background: -moz-linear-gradient(top, #ffc338 0%, #f29a33 100%);
//   background: -webkit-linear-gradient(top, #ffc338 0%, #f29a33 100%);
//   background: linear-gradient(to bottom, #ffc338 0%, #f29a33 100%);
//   filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffc338', endColorstr='#f29a33',GradientType=0 );
//   border: 1px solid #f29a33;
//   box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.2);
//   position: fixed;
//   z-index: 9999999999;
//   bottom: 10px;
//   right: 10px;
//   display: flex;
//   justify-items: center;
//   justify-content: center;
//   align-items: center;
//   align-content: center;
//   text-align: center;
//   padding: 8px;
//   img {
//     width: 100%;
//     height: auto;
//   }
// }

.tippy-popper .tippy-content { 
  padding: 3px !important; 
  font-size: 13px !important;
  line-height: 19px !important;
  text-align: left;
  ul {
    padding-left: 22px;
  }
}

.tippy-tooltip {
  border-radius: 11px;
}

.theme-dark .tippy-popper {
  .tippy-tooltip {
    background: lighten($darkBackColor, 15);
    border: 1px solid lighten($darkBackColor, 34);
    box-shadow: 2px 2px 10px rgba(#000, 0.95) !important;
    .tippy-content {
      color: $darkFrontColor;
      a {
        text-decoration: underline !important;
        color: $darkFrontColor;
      }
    }
  }

  &[x-placement^="top"] .tippy-arrow {
    border-top-color: lighten($darkBackColor, 34);
    bottom: -8px;
  }
  &[x-placement^="right"] .tippy-arrow {
    border-right-color: lighten($darkBackColor, 34);
    left: -8px;
  }
  &[x-placement^="bottom"] .tippy-arrow {
    border-bottom-color: lighten($darkBackColor, 34);
    top: -8px;
  }
  &[x-placement^="left"] .tippy-arrow {
    border-left-color: lighten($darkBackColor, 34);
    right: -8px;
  }
}
.theme-light .tippy-popper {
  .tippy-tooltip {
    background: #fff;
    border: 1px solid darken($lightBackColor, 10);
    box-shadow: 2px 2px 10px rgba(#000, 0.35) !important;
    .tippy-content {
      color: $lightFrontColor;
      a {
        text-decoration: underline !important;
        color: $lightFrontColor;
      }
    }
  }
  &[x-placement^="top"] .tippy-arrow {
    border-top-color: $lightBackColor;
  }
  &[x-placement^="right"] .tippy-arrow {
    border-right-color: $lightBackColor;
  }
  &[x-placement^="bottom"] .tippy-arrow {
    border-bottom-color: $lightBackColor;
  }
  &[x-placement^="left"] .tippy-arrow {
    border-left-color: $lightBackColor;
  }
}

[content] {
  outline: none !important;
}

#nothing-here-404 {
  text-align: center;
  font-size: 2em;
  line-height: 2em;
  @include themify($themes) {
    color: themed(frontColor);
  }
}

div[data-block-scrolling] {
  height: 100vh !important;
  width:  100vw !important;
  overflow: hidden !important;
}

.audible-orange-text {
  @include themify($themes) {
    color: themed(audibleOrange) !important;
  }
}
.audible-orange-background {
  @include themify($themes) {
    background: themed(audibleOrange) !important;
  }
}

</style>
