<template>
  <div id="audible-library-extractor">
        
    <ale-background v-if="$store.state.showBackground"></ale-background>
    <ale-navigation></ale-navigation>
    <router-view :key="$route.name+$store.state.viewRefresh"></router-view>
    <!-- <router-view :key="$route.name+($route.query.refresh ? '-refresh' : '')"></router-view> -->
    
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
        width: null,
        height: null
      }
    };
  },
  
  created: function() {
    
    // var isbn = _.filter(this.$store.state.library.books, 'isbns');
    // console.log( 'books with ISBN:', isbn.length, isbn );
    // console.log( _.filter( this.$store.state.library.books, ['asin', 'B08BX58B3N'] ) )
    if ( this.checkIf_iOS() ) {
      document.querySelector('body').classList.add('is-ios');
    }
    
    this.$root.$on('refresh-page', this.refreshPage);
    
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
    
    refreshPage: function() {
      this.$store.commit('prop', { key: 'viewRefresh', value: 'refresh' });
      this.$nextTick(function() {
        this.$store.commit('prop', { key: 'viewRefresh', value: '' });
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
      const widthChanged = vue.window.width !== currentWidth;
      const heightChanged = vue.window.height !== currentHeight;
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
      
      this.$store.commit("prop", { key: "route", value: route });
      
      if ( route.meta.title ) {
        document.title = 'ALE • ' + route.meta.title || 'My Audible Library';
      }

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

@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap");

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

.theme-dark .tippy-popper {
  .tippy-tooltip {
    background: lighten($darkBackColor, 10);
    border: 1px solid lighten($darkBackColor, 20);
    box-shadow: 0 3px 15px rgba(#000, 0.95) !important;
    .tippy-content {
      color: $darkFrontColor;
      a {
        text-decoration: underline !important;
        color: $darkFrontColor;
      }
    }
  }

  &[x-placement^="top"] .tippy-arrow {
    border-top-color: lighten($darkBackColor, 10);
  }
  &[x-placement^="right"] .tippy-arrow {
    border-right-color: lighten($darkBackColor, 10);
  }
  &[x-placement^="bottom"] .tippy-arrow {
    border-bottom-color: lighten($darkBackColor, 10);
  }
  &[x-placement^="left"] .tippy-arrow {
    border-left-color: lighten($darkBackColor, 10);
  }
}
.theme-light .tippy-popper {
  .tippy-tooltip {
    background: #fff;
    border: 1px solid darken($lightBackColor, 10);
    box-shadow: 0 3px 10px rgba(#000, 0.35) !important;
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
</style>
