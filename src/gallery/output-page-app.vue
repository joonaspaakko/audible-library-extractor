<template>
  <div id="audible-library-extractor" :data-version="$store.state.version" :class="{ 'mobile-threshold': this.$store.state.windowWidth < 630 }">
    
    <ale-background v-if="$store.state.showBackground && !($store.state.standalone && !$store.state.siteOnline)"></ale-background>
    <ale-navigation :key="'nav-'+$route.params+$route.name+$store.state.viewRefresh"></ale-navigation>
    <router-view v-if="$route.name !== '404'" :key="$route.params+$route.name+$store.state.viewRefresh"></router-view>
    <div v-else id="nothing-here-404">
      <h3 v-if="$store.getters.searchIsActive && !$store.state.searchCollection.length">Search: no results</h3>
      <h3 v-else>404: There's nothing here</h3>
    </div>
    
  </div>
</template>

<script>
import aleNavigation from "./_components/aleNavigation";
import aleBackground from "./_components/aleBackground";
// import aleBreadcrumbs from "./_components/aleBreadcrumbs";

export default {
  components: {
    // aleBackground: () => import('./_components/aleBackground'),
    aleBackground,
    aleNavigation,
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
    });
    window.addEventListener('online', function() {
      vue.$store.commit('prop', { key: 'siteOnline', value: true });
    });
    
  },

  mounted: function() {
    
    const vue = this;
    window.addEventListener("resize", 
      _.debounce( function() { 
        vue.onWindowResize(vue); 
      }, 320, { leading: true, trailing: true })
    );
    
    this.showTheBackgroundGrid();
    
  },
  
  beforeDestroy: function() {
    
    this.$root.$off('refresh-page', this.refreshPage);

  },

  methods: {
    
    refreshPage: function( callback ) {
      this.$store.commit('prop', { key: 'viewRefresh', value: 'refresh' });
      this.$nextTick(function() {
        this.$store.commit('prop', { key: 'viewRefresh', value: '' });
        this.$nextTick(function() {
          if ( typeof callback === 'function' ) callback( this );
        });
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
    
    onWindowResize: function(vue) {
      
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const widthChanged = (vue.window.width !== currentWidth);
      const heightChanged = (vue.window.height !== currentHeight);
      
      if (widthChanged || heightChanged) {
        
        vue.window.width = currentWidth;
        vue.window.height = currentHeight;
        
        if ( widthChanged ) this.$store.commit('prop', { key: 'windowWidth', value: currentWidth});
        
        vue.$root.$emit("afterWindowResize", {
          from: "app",
          width: currentWidth,
          widthChanged: widthChanged,
          height: currentHeight,
          heightChanged: heightChanged
        });
        
      }
      
    }
  },

  watch: {
    $route: function(route, previousRoute) {
            
      this.$nextTick(function() {
        
        this.$store.commit("prop", { key: "route", value: route });
        
        if ( this.$store.state.pageTitle && (this.$route.meta.title || this.$route.meta.title === '') ) {
          document.title = 'ALE • ' + (( this.$route.meta.title === this.$store.state.pageTitle ) ? this.$store.state.pageTitle : (this.$route.meta.title + ': ' + this.$store.state.pageTitle));
        }
        else if ( route.meta.title ) {
          document.title = 'ALE • ' + ( route.meta.title || 'My Audible Library' );
        }
        
      });
      
      // console.log( route, previousRoute )
      // console.log( this.$routerHistory, this.$router )
      // if ( route.name === previousRoute.name  ) {
        // this.$nextTick(function() {
        //   this.$updateQuery({ query: 'refresh', value: null });
        // });
      // }
      
    }
  },
  
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

@media (prefers-color-scheme: dark) {
  background-color: $darkBackColor;
}
@media (prefers-color-scheme: light) {
  background-color: $lightBackColor;
}
html.theme-dark {
  background-color: $darkBackColor;
}
html.theme-light {
  background-color: $lightBackColor;
}

@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,700&display=swap");

.is-ios .tippy-popper { display: none !important; }

  @media ( max-width: 630px ) {
    .tippy-popper { display: none !important; }
  }

html {
  padding-top: 1px;
  margin: 0;
  margin-top: -1px;
}
body {
  margin: 0px;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: "Montserrat", sans-serif !important;
  font-size: 14px !important;
  line-height: 1.55em !important;
}

#audible-library-extractor {
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

#nothing-here-404 {
  text-align: center;
  font-size: 2em;
  line-height: 2em;
  @include themify($themes) {
    color: themed(frontColor);
  }
}
</style>
