<template>
  <div id="audible-library-extractor" :class="{ 'mobile-browser-navigation-on': mobileBrowserNavigation }">
    
    <ale-background :library="library" :general="general"></ale-background>
    <ale-navigation :library="library" :general="general"></ale-navigation>
    <router-view    :library="library" :general="general" ref="$route" ></router-view>
    
    <div id="audio-player" v-if="audioBetter.audioSource">
      <mini-audio :audio-source="audioBetter.audioSource" preload autoplay ref="audioBetter"></mini-audio>
      <div class="custom-icons" :class="{ 'book-index-known': audioBetter.index }">
        <div class="book" :content="audioBetter.book.title" v-tippy="{ placement: 'top',  arrow: true, theme: general.tippyTheme }">
          <router-link :to="{ path: audioBetter.route.path, query: { book: audioBetter.book.asin}}">
            <font-awesome fas icon="book" />
          </router-link>
          <!-- <font-awesome fas icon="book" @click="samplePlayerBook" /> -->
        </div>
        <div class="close">
          <font-awesome fas icon="times-circle" @click="samplePlayerClose" />
        </div>
      </div>
    </div> <!-- #audio-player -->
    
    <a v-if="this.general.displayMode" id="audible-app-link" href="audible://">
      <img alt="" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTEuNSA5My43IiB3aWR0aD0iMTUxLjUiIGhlaWdodD0iOTMuNyI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPjxnPjxnPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTc1LjggODAuN2w3NS43LTQ3LjJ2MTIuOEw3NS44IDkzLjcgMCA0Ni4zVjMzLjVsNzUuOCA0Ny4yeiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTc1LjggMjEuNWE0OC4xNyA0OC4xNyAwIDAgMC00MC43IDIxLjkgMTIuOTQgMTIuOTQgMCAwIDEgMS44LTEuNmMyMS4zLTE3LjcgNTItMTMuNyA2OC43IDguNmwxMS4xLTcuMWE0OS44MiA0OS44MiAwIDAgMC00MC45LTIxLjgiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik03NS44IDQzLjRhMjcuNzIgMjcuNzIgMCAwIDAtMjIuNCAxMS41IDIyLjcgMjIuNyAwIDAgMSAxMy41LTQuNGM4LjIgMCAxNS41IDQuMiAyMC40IDExLjNsMTAuNi02LjZhMjUuNzkgMjUuNzkgMCAwIDAtMjIuMS0xMS44TTI0LjYgMjQuMkM1NS44LS40IDk5LjkgNi4zIDEyMy40IDM5bC4yLjIgMTEuNS03LjFhNzAuODIgNzAuODIgMCAwIDAtMTE4LjYgMCA2MC42MyA2MC42MyAwIDAgMSA4LjEtNy45Ii8+PC9nPjwvZz48L3N2Zz4=" />
    </a>
    
    <div id="browser-navigation" v-if="mobileBrowserNavigation">
      
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
    
  </div>
</template>

<script>
import aleBackground  from './_components/aleBackground'
import aleNavigation from './_components/aleNavigation'
import aleBreadcrumbs from './_components/aleBreadcrumbs'

export default {
  components: {
    aleBackground,
    aleNavigation,
    aleBreadcrumbs,
  },
  data: function() {
    return {
      audioBetter: {
        title: null,
        audioSource: null,
      },
      general: {
        route: null,
        standalone: null,
        lightSwitch: 1,
        urlOrigin: 'https://audible',
        categories: null,
        tippyTheme: 'dark',
      },
      window: {
        width: null,
        height: null,
      },
      library: this.$root.$data.library,
    }
  },
  
  computed: {
    
    mobileBrowserNavigation: function() {
      return this.general.displayMode && (this.$routerHistory.hasPrevious() || this.$routerHistory.hasForward());
    }
    
  },
  
	created: function() {
    
    const vue = this;
    // this.library.books = this.library.books.splice(1,20);  
    // console.log( 'this.library.books' )
    // console.log( this.library.books )
      
    this.general.displayMode = window.matchMedia('(display-mode: standalone)').matches;
    this.general.urlOrigin += this.library.domainExtension;
    this.general.standalone = $('html.standalone-gallery').length > 0;
    this.window.width = $(window).width();
    this.window.height = $(window).height();
    
		var isbn = _.filter(this.library.books, 'ISBN_10');
		// console.log( 'books with ISBN:' );
    // console.log( isbn.length );
    // console.log( this.library )
    // console.log( _.filter( this.library.books, ['asin', 'B08BX58B3N'] ) )
    Eventbus.$on('playSample', this.playSample );
    
    $(window).on('resize', _.debounce(function() {
      vue.onWindowResize( vue );
    }, 400));
    
  },
	
	beforeDestroy: function() {
    
    const vue = this;
    Eventbus.$off('playSample', this.playSample);
    $(window).off('resize', this.onWindowResize );
    
  },
  
  methods: {
    
		onWindowResize: function( vue ) {
      
      const win = $(window);
      const windowWidth = win.width();
      const windowHeight = win.height();
      const widthChanged = windowWidth !== vue.window.width;
      const heightChanged = windowHeight !== vue.window.height
      if ( widthChanged || heightChanged ) {
        vue.window.width = windowWidth;
        vue.window.height = windowHeight;
        Eventbus.$emit('afterWindowResize', {
          from: 'app',
          width: windowWidth,
          widthChanged: widthChanged,
          height: windowHeight,
          heightChanged: heightChanged,
        });
        console.log('RESIZE!!!');
      }

    },
    
    playSample: function( msg ) {
      this.audioBetter.audioSource = msg.book.sample;
      this.audioBetter.book = msg.book;
      if ( msg.index ) this.audioBetter.index = msg.index;
      if ( msg.route ) this.audioBetter.route = msg.route;
      console.log( msg.route )
    },
    
    samplePlayerBook: function() {
      const vue = this;
      if ( vue.audioBetter.index ) {
        Eventbus.$emit('galleryBookClick', {
          from: 'sample-audio-player',
          index: vue.audioBetter.index,
          animationSpeed: 1500,
          dontClose: true,
        });
      }
    },
    
    samplePlayerClose: function() {
      this.audioBetter.audioSource = null;
    },
    
  },
  
  watch: {
    $route: function ( route, previousRoute ) {
      this.general.route = route;
    }
  },
  
}
</script>

<style lang="scss">
@import '~@/_variables.scss';
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');

html {
  padding-top: 1px;
  margin: 0;
  margin-top: -1px;
}
body {
	-moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: 'Montserrat', sans-serif !important;
	font-size: 14px !important;
	line-height: 1.55em !important;
}

html.theme-dark {
  background-color: $darkBackColor;
}
html.theme-light {
  background-color: $lightBackColor;
}

#audible-library-extractor {
  padding-top: 80px;
  
  a {
    text-decoration: none;
    @include themify($themes) { color: themed(audibleOrange); }
  }
  a:visited { 
    @include themify($themes) { color: rgba( themed(frontColor), .7); } 
    // @include themify($themes) { color: darken( desaturate( themed(audibleOrange), 65), 25); } 
  }
  a:hover { 
    @include themify($themes) { color: themed(frontColor); } 
  }
  
  &.mobile-browser-navigation-on {
    margin-top: 45px;
  }
  #browser-navigation {
    position: fixed;
    z-index: 20;
    top: 0;
    right: 0;
    left: 0;
    color: #222;
    background: #fff;
    height: 45px;
    font-size: 20px;
    line-height: 45px;
  }
  
  #audio-player {
    -webkit-touch-callout: none; 
    -webkit-user-select: none; 
    -khtml-user-select: none; 
    -moz-user-select: none; 
    -ms-user-select: none; 
    user-select: none;
    max-width: 400px;
    margin: 0 auto;
    position: fixed;
    z-index: 900;
    right: 0px;
    bottom: 15px;
    left: 0px;
    .vueAudioBetter {
      max-width: 400px;
      margin: 0;
      width: auto;
      padding-right: 72px;
      // background: #fff;
      // color: $lightFrontColor;
      .iconfont.icon-notificationfill {
        display: none;
      }
      .slider {
        flex-grow: 1;
        margin-left: 15px;
      }
    }
  }
  .custom-icons {
    position: absolute;
    top: 0;
    right: 14px;
    bottom: 0;
    font-size: 16px;
    color: rgba( #000, .7 );
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-content: center;
    justify-items: center;
    align-items: center;
    
    &.book-index-known .book,
    .close { cursor: pointer; }
    
    > div {
      margin-left: 10px;
      &:first-child { margin-left: 0px; }
      outline: none;
      &:active {
        position: relative;
        top: 2px;
        left: 2px;
      }
    }
    
    a {
      cursor: default;
      color: rgba( #000, .7 );
    }
  }
  
}


// @media all and (display-mode: standalone) {
//   /* Here goes the CSS rules that will only apply if app is running standalone */
// }

#audible-app-link {
  width: 35px;
  height: 35px;
  border-radius: 999999px;
  background: $audibleOrange;
  background: #f29a33;
  background: #ffc338;
  background: #ffc338;
  background: -moz-linear-gradient(top,  #ffc338 0%, #f29a33 100%);
  background: -webkit-linear-gradient(top,  #ffc338 0%,#f29a33 100%);
  background: linear-gradient(to bottom,  #ffc338 0%,#f29a33 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffc338', endColorstr='#f29a33',GradientType=0 );
  border: 1px solid #f29a33;
  box-shadow: 0 3px 10px rgba(0,0,0, .1), 0 1px 4px rgba(0,0,0, .2);
  position: fixed;
  z-index: 9999999999;
  bottom: 10px;
  right: 10px;
  display: flex;
  justify-items: center;
  justify-content: center;
  align-items: center;
  align-content: center;
  text-align: center;
  padding: 8px;
  img {
    width: 100%;
    height: auto;
  }
}

</style>
