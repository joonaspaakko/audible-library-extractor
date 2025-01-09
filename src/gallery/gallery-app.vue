<template>
  <div 
    :class="{ 'mobile-threshold': $store.state.windowWidth < 630 }" 
    :data-version="$store.state.version" 
    :data-prevent-scrolling="$store.state.preventScrolling"
    :style="{ paddingTop: $store.state.desktopPlayerHeight }"
  >
    
    <gallery-background v-if="$store.state.showBackground && !($store.state.standalone && !$store.state.siteOnline)"></gallery-background>
    <gallery-navigation></gallery-navigation>
    
    <div v-if="$route.name !== '404' && $store.state.showRoute">
      <router-view :key="$route.name+'-'+$store.state.routeParams+'-'+$store.state.refreshViewTimeStamp"></router-view>
    </div>
    <div v-else-if="$store.state.showRoute" id="nothing-here-404">
      <h3 v-if="$store.getters.searchIsActive && !$store.state.searchCollection.length">Search: no results</h3>
      <h3 v-else>404: There's nothing here</h3>
    </div>
    
  </div>
</template>

<script>
import audioPlayerGlobal from "@output-mixins/gallery-audio-player-global.js";

export default {
  mixins: [ audioPlayerGlobal, ],
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
    if ( this.checkIf_Mobile() ) {
      document.querySelector('body').classList.add('is-mobile');
    }
    
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

  methods: {
    
    checkIf_iOS: function() {
      return [
        'iPad',
        'iPhone',
        'iPod'
      ].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    },
    
    checkIf_Mobile() {
      
      const userAgent = _.get(navigator, 'userAgent', '').toLowerCase();
      
      const test1 = _.includes( [
        "Android",
        "webOS",
        "iPhone",
        "iPad",
        "iPod",
        "BlackBerry",
        "Windows Phone",
      ], ( item ) => {
         item = item.toLowerCase();
        return userAgent === item;
      });
      
      const test2 = navigator.userAgent.includes("Mac") && "ontouchend" in document;
      
      return test1 || test2;
      
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
        
        this.$compEmitter.emit("afterWindowResize", {
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
      
    },
    "$store.state.preventScrolling"( value ) {
      document.body.classList[ value ? 'add' : 'remove' ]('prevent-scrolling');
    },
  },
  
};
</script>

<style lang="scss">


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

// .is-ios [data-tippy-root] { display: none !important; }

// @media ( max-width: 630px ) {
//   [data-tippy-root] { display: none !important; }
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
      // transition: color 300ms ease;
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

[data-tippy-root] {
  z-index: 9999999999999999;
}
.tippy-content { 
  padding: 3px !important; 
  font-size: 13px !important;
  line-height: 19px !important;
  text-align: left !important;
  ul {
    padding-left: 22px !important;
  }
}

.tippy-box {
  border-radius: 11px !important;
  padding: 7px !important;
}

.theme-dark {
  .tippy-box {
    background: lighten($darkBackColor, 15) !important;
    border: 2px solid lighten($darkBackColor, 34) !important;
    box-shadow: 2px 2px 10px rgba(#000, 0.95) !important;
    .tippy-content {
      color: $darkFrontColor !important;
      a {
        text-decoration: underline !important;
        color: $darkFrontColor !important;
      }
    }
  }
  
  .tippy-arrow {
    color: lighten($darkBackColor, 34) !important;
  }

  .tippy-box {
    &[data-placement^="top"] .tippy-arrow {
      border-top-color: lighten($darkBackColor, 34) !important;
      bottom: -1px !important;
    }
    &[data-placement^="right"] .tippy-arrow {
      border-right-color: lighten($darkBackColor, 34) !important;
      left: -1px !important;
    }
    &[data-placement^="bottom"] .tippy-arrow {
      border-bottom-color: lighten($darkBackColor, 34) !important;
      top: -1px !important;
    }
    &[data-placement^="left"] .tippy-arrow {
      border-left-color: lighten($darkBackColor, 34) !important;
      right: -1px !important;
    }
  }
}
  
.theme-light {
  .tippy-box {
    background: #fff !important;
    border: 2px solid darken($lightBackColor, 10) !important;
    box-shadow: 2px 2px 10px rgba(#000, 0.55), 0px 0px 25px rgba(#000, 0.35) !important;
    .tippy-content {
      color: $lightFrontColor !important;
      a {
        text-decoration: underline !important;
        color: $lightFrontColor !important;
      }
    }
  }
  
  .tippy-arrow {
    color: $lightBackColor !important;
  }
  
  .tippy-box {
    &[data-placement^="top"] .tippy-arrow {
      border-top-color: $lightBackColor !important;
      bottom: -1px !important;
    }
    &[data-placement^="right"] .tippy-arrow {
      border-right-color: $lightBackColor !important;
      left: -1px !important;
    }
    &[data-placement^="bottom"] .tippy-arrow {
      border-bottom-color: $lightBackColor !important;
      top: -1px !important;
    }
    &[data-placement^="left"] .tippy-arrow {
      border-left-color: $lightBackColor !important;
      right: -1px !important;
    }
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
  .error404 {
    animation-name: fade-in;
    animation-duration: 2s;
    animation-delay: 2s;
    opacity: 0;
    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  }
}

// div[data-prevent-scrolling="true"] {
//   height: 100vh !important;
//   width:  100vw !important;
//   overflow: hidden !important;
// }
body.prevent-scrolling {
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

.splide__pagination {
	bottom: 9px !important;
}
.splide__arrow {
	// margin-top: -19px;
	svg {
		width: 20px !important;
		height: 20px !important;
		padding: 10px !important;
		@include themify($themes) { fill: rgba( themed(frontColor), .5 ) !important; }
	}
	&:hover svg {
		@include themify($themes) { fill: rgba( themed(frontColor), .87 ) !important; }
	}
}
.splide__arrow--prev { 
	left: 10px !important; 
	svg { padding-left: 0px !important; }
}
.splide__arrow--next { 
	right: 10px !important; 
	svg { padding-left: 0px !important; }
}
.splide__pagination__page:hover {
  @include themify($themes) { background: themed(frontColor) !important; }
}

.splide__pagination__page.is-active {
  @include themify($themes) { background: themed(audibleOrange) !important; }
}

@media (max-width: 716px) {
	.splide {
		box-sizing: border-box !important;
		position: relative;
		left: 50%;
		right: 50%;
		width: 100vw;
		margin-left: -50vw;
		margin-right: -50vw;
		max-width: unset !important;
	}
}

@media ( max-width: 500px ) {
	.splide__pagination__page { width: 10px !important; }
}

.vue-slider-dot-tooltip-inner,
.vue-slider-process {
  @include themify($themes) {
    background: themed(audibleOrange);
  }
}
.vue-slider-dot-tooltip-inner {
  @include themify($themes) {
    border-color: themed(audibleOrange);
  }
}
.vue-slider-mark {
  width: 2px !important;
  @include themify($themes) {
    background-color: rgba(#000, .05);
  }
}

.vue-slider-dot-handle-focus {
  @include themify($themes) {
    box-shadow: 0 0 0 5px rgba(themed(audibleOrange), 0.2) !important;
  }
}
.vue-slider .vue-slider-dot-handle {
  @include themify($themes) {
    border-color: themed(audibleOrange) !important;
    background: themed(elementColor) !important;
  }
}
.vue-slider .vue-slider-process {
  @include themify($themes) {
    background: themed(audibleOrange) !important;
  }
}
.vue-slider .vue-slider-rail {
  @include themify($themes) {
    background: rgba(themed(frontColor), .25) !important;
  }
}

.vue-slider .vue-slider-mark-step {
  @include themify($themes) {
    box-shadow: none !important;
    background: themed(elementColor) !important;
  }
}

</style>
