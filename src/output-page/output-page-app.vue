<template>
  <div
    id="audible-library-extractor"
    :class="{ 'mobile-browser-navigation-on': mobileBrowserNavigation }"
  >
    <ale-background></ale-background>
    <ale-navigation></ale-navigation>
    <router-view ref="$route"></router-view>

    <a
      v-if="this.$store.state.displayMode"
      id="audible-app-link"
      href="audible://"
    >
      <img
        alt=""
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTEuNSA5My43IiB3aWR0aD0iMTUxLjUiIGhlaWdodD0iOTMuNyI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPjxnPjxnPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTc1LjggODAuN2w3NS43LTQ3LjJ2MTIuOEw3NS44IDkzLjcgMCA0Ni4zVjMzLjVsNzUuOCA0Ny4yeiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTc1LjggMjEuNWE0OC4xNyA0OC4xNyAwIDAgMC00MC43IDIxLjkgMTIuOTQgMTIuOTQgMCAwIDEgMS44LTEuNmMyMS4zLTE3LjcgNTItMTMuNyA2OC43IDguNmwxMS4xLTcuMWE0OS44MiA0OS44MiAwIDAgMC00MC45LTIxLjgiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik03NS44IDQzLjRhMjcuNzIgMjcuNzIgMCAwIDAtMjIuNCAxMS41IDIyLjcgMjIuNyAwIDAgMSAxMy41LTQuNGM4LjIgMCAxNS41IDQuMiAyMC40IDExLjNsMTAuNi02LjZhMjUuNzkgMjUuNzkgMCAwIDAtMjIuMS0xMS44TTI0LjYgMjQuMkM1NS44LS40IDk5LjkgNi4zIDEyMy40IDM5bC4yLjIgMTEuNS03LjFhNzAuODIgNzAuODIgMCAwIDAtMTE4LjYgMCA2MC42MyA2MC42MyAwIDAgMSA4LjEtNy45Ii8+PC9nPjwvZz48L3N2Zz4="
      />
    </a>

    <!-- <div id="browser-navigation" v-if="mobileBrowserNavigation">
      
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
      
    </div> -->
  </div>
</template>

<script>
import aleBackground from "./_components/aleBackground";
import aleNavigation from "./_components/aleNavigation";
import aleBreadcrumbs from "./_components/aleBreadcrumbs";

export default {
  components: {
    aleBackground,
    aleNavigation,
    aleBreadcrumbs
  },
  // props: ['library'],
  data: function() {
    return {
      general: {
        route: null,
        standalone: null,
        // lightSwitch: 1,
        categories: null,
        tippyTheme: "dark"
      },
      window: {
        width: null,
        height: null
      }
    };
  },

  computed: {
    mobileBrowserNavigation: function() {
      return (
        this.$store.state.displayMode &&
        (this.$routerHistory.hasPrevious() || this.$routerHistory.hasForward())
      );
    }
  },

  created: function() {
    
    // var isbn = _.filter(this.$store.state.library.books, 'isbns');
    // console.log( 'books with ISBN:', isbn.length, isbn );
    // console.log( _.filter( this.$store.state.library.books, ['asin', 'B08BX58B3N'] ) )
  },

  mounted: function() {
    const vue = this;
    window.addEventListener(
      "resize",
      _.debounce(
        function() {
          vue.onWindowResize(vue);
        },
        320,
        { leading: true, trailing: true }
      )
    );
  },

  // beforeDestroy: function() {

  //   window.removeEventListener('resize', this.onWindowResize);

  // },

  methods: {

    onWindowResize: function(vue) {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const widthChanged = vue.window.width !== currentWidth;
      const heightChanged = vue.window.height !== currentHeight;
      if (widthChanged || heightChanged) {
        vue.window.width = currentWidth;
        vue.window.height = currentHeight;
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
    }
  }
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
  background: -moz-linear-gradient(top, #ffc338 0%, #f29a33 100%);
  background: -webkit-linear-gradient(top, #ffc338 0%, #f29a33 100%);
  background: linear-gradient(to bottom, #ffc338 0%, #f29a33 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffc338', endColorstr='#f29a33',GradientType=0 );
  border: 1px solid #f29a33;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.2);
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

.theme-dark .tippy-popper {
  .tippy-tooltip {
    background: lighten($darkBackColor, 10);
    border: 1px solid lighten($darkBackColor, 20);
    box-shadow: 0 3px 15px rgba(#000, 0.95) !important;
    .tippy-content {
      color: $darkFrontColor;
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
    background: $lightBackColor;
    border: 1px solid darken($lightBackColor, 10);
    box-shadow: 0 3px 10px rgba(#000, 0.35) !important;
    .tippy-content {
      color: $lightFrontColor;
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
