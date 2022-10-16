<template>
<div class="menu-items" :class="{ 'has-sub-menu': childRoutes, mobileMenu: mobileMenuOpen }">
  <div v-if="menuOpen">
      
    <div v-if="mobileMenuOpen" class="mobile-menu-top-filler" @click="$emit('update:mobileMenuOpen', !mobileMenuOpen)"></div>
    <div v-if="mobileMenuOpen" class="mobile-menu-top-spacer"></div>
    
    <!-- Each individual menu item -->
    <component 
    v-for="route in routes"
    :key="route.path"
    :is="route.tag || 'router-link'" 
    v-bind:[getHrefAttr(route)]="getRoutePath(route)" 
    :target="route.href ? '_blank' : null"
    class="menu-item"
    :class="[ 
      route.meta.groupName, 
      itemActive(route), 
      subItemActive(route), 
      (route.disabled || (route.condition ? 
        !route.condition() : null)
      ) ? 'disabled' : '' 
    ]"
    v-tippy="{ placement: 'left', flipBehavior: ['left', 'top', 'bottom'], maxWidth: 400 }"
    :content="typeof route.tippy === 'function' ? route.tippy() : route.tippy"
    @click="route.click ? route.click( route ) : null"
    >
        
      <div class="menu-item-inner" @click="additionalClick(route)">
        <span class="menu-item-icon">
          <font-awesome :icon="route.meta.icon" />
        </span>
        <span class="menu-item-text" v-html="getRouteName(route)"></span>
      </div>
      
      <div class="sub-menu" v-if="route.childItems">
        <menuLooper :routes="route.childItems" :childRoutes="route.childItems" @closeMenu="closeMenu" />
      </div>
      
    </component>
    
    <!-- This is rendered only on the first level -->
    <div v-if="inRoot" class="menu-icon-toolbar">
      
      <div>
        <light-switch />
      </div>
      <div v-if="!mobileMenuOpen">
        <search-button />
      </div>
      <div v-if="mobileMenuOpen">
        <view-mode-switcher :justIcon="true" v-if="$store.state.searchMounted" />
      </div>
      <div v-if="mobileMenuOpen">
        <font-awesome 
        class="icon" 
        @click="copyToClipboard()"
        v-tippy="{ trigger: 'manual' }"
        content="Page URL copied to clipboard!"
        :icon="['fas', 'link']" 
        ref="copyToClipboard"
        />
      </div>
      
    </div>
    
  </div>
  
  <!-- AUDIO PLAYER -->
  <audio-player v-if="inRoot" />
  
</div>
</template>

<script>
export default {
  name: "menuLooper",
  props: [ 'routes', 'childRoutes', 'mobileMenuOpen', 'inRoot' ],
  data: function() {
    return {
      menuOpen: true,
      copiedToClipboard: false,
    };
  },
  
  methods: {
    
    getHrefAttr( route ) {
      return route.tag === 'a' ? 'href' : 'to';
    },
    
    itemActive( route ) {
      
      const currentRoute = this.$route.name;
      const linkActive = currentRoute === route.name || _.find(route.children, { name: currentRoute });
      return linkActive ? 'router-link-active' : null;
      
    },
    
    subItemActive( route ) {
      
      const currentRoute = this.$route.name;
      const linkActive = _.find(route.childItems, function( route ) {
        return currentRoute === route.name || _.find(route.children, { name: currentRoute });
      });
      return linkActive ? 'router-link-active' : null;
      
    },
    
    getRoutePath( route ) {
      const path = _.get(route, 'path');
      return !!path ? { 
        name: _.get(route, 'name') || _.get(route, 'children[0].name'),
        query: { refresh: true  },
      } :
      _.get(route, 'href');
    },
    
    getRouteName( route ) {
      if ( route.altName ) {
        return route.altName( route );
      }
      else {
        const name = _.get(route, 'children[0].meta.title') || _.get(route, 'children[0].name') || route.name;
        const extensionTools = _.get( route, 'meta.nestedGroup') === 'extension-tools';
        return extensionTools ? name : _.startCase( name );
      }
    },
    
    closeMenu() {
      
      this.menuOpen = false;
      this.$nextTick(function() {
        this.menuOpen = true;
      });
      
    },
    
    additionalClick( route ) {
      
      if ( this.mobileMenuOpen ) {
        this.$emit('update:mobileMenuOpen', !this.mobileMenuOpen);
      }
        // These are only in the desktop menu
      else {
        this.$emit('closeMenu');
      }
      
      // let name = _.get(route, 'children[0].name') || route.name || '';
      //     name = name.toLowerCase();
      // if ( this.$route.name === name && !!name ) this.$root.$emit('refresh-page');
      
    },
    
    copyToClipboard() {
      
      const vue = this;
      navigator.clipboard.writeText( window.location.href );
      vue.$refs.copyToClipboard._tippy.show();
      setTimeout(function() {
        vue.$refs.copyToClipboard._tippy.hide();
      }, 2000);
      
    },
    
  }
};
</script>

<style lang="scss" scoped>


.menu-items {
  &, > div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
  &.has-sub-menu > div {
    flex-direction: column !important;
    align-items: stretch !important;
  }
}

.menu-item {
  position: relative;
  white-space: nowrap;
  text-align: left;
  
  .disabled {
    cursor: default !important;
    opacity: .4;
  }
}

.menu-item-inner {
  padding: 10px 12px;
}

.menu-item,
.menu-item-inner,
.menu-item-icon,
.menu-item-text {
  display: inline-flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.menu-item-icon {
  width: 18px;
  height: 18px;
  padding-right: 7px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

// .router-link-exact-active 
.router-link-active > .menu-item-inner > .menu-item-icon {
  @include themify($themes) {
    color: themed(audibleOrange);
  }
}

.sub-menu {
  cursor: default;
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  min-width: 100%;
  @include themify($themes) {
    background: themed(elementColor);
    color: themed(frontColor);
    box-shadow: 0 5px 15px rgba( themed(outerColor), .7);
    border: 1px solid rgba( themed(frontColor), .2);
  }
}

.menu-item:hover .sub-menu {
  display: block;
  -webkit-animation:swing-in-top-fwd 300ms cubic-bezier(.175,.885,.32,1.275) both;
          animation:swing-in-top-fwd 300ms cubic-bezier(.175,.885,.32,1.275) both;
  /* ----------------------------------------------
  * Generated by Animista on 2022-6-12 16:52:51
  * Licensed under FreeBSD License.
  * See http://animista.net/license for more info. 
  * w: http://animista.net, t: @cssanimista
  * ---------------------------------------------- */
  @-webkit-keyframes swing-in-top-fwd{0%{-webkit-transform:rotateX(-100deg);transform:rotateX(-100deg);-webkit-transform-origin:top;transform-origin:top;opacity:0}100%{-webkit-transform:rotateX(0deg);transform:rotateX(0deg);-webkit-transform-origin:top;transform-origin:top;opacity:1}}@keyframes swing-in-top-fwd{0%{-webkit-transform:rotateX(-100deg);transform:rotateX(-100deg);-webkit-transform-origin:top;transform-origin:top;opacity:0}100%{-webkit-transform:rotateX(0deg);transform:rotateX(0deg);-webkit-transform-origin:top;transform-origin:top;opacity:1}}
}

.sub-menu .menu-item {
  @include themify($themes) {
    border-bottom: 1px solid rgba( themed(frontColor), .2);
    cursor: pointer;
  }
}

.extension-tools {
  margin-left: 10px;
  padding: 6px 0;
}

.extension-tools > .menu-item-inner {
  padding:  2px 9px;
  border-radius: 99999px !important;
  > span {
    padding: 0 !important;
    font-size: .85em;
  }
  @include themify($themes) {
    // color: themed(audibleOrange);
    border: 2px solid themed(audibleOrange);
    background: rgba(themed(audibleOrange), .1);
    color: themed(front_color);
  }
}

.extension-tools > .sub-menu .menu-item:active {
  @include themify($themes) {
    background: themed(audibleOrange);
  }
}

.menu-icon-toolbar {
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 5px 0;
  border-radius: 9999px;
  margin-left: 10px;
  padding: 0 4px;
  div {
    padding: 2px 5px;
    cursor: pointer;
  }
  @include themify($themes) {
    border: 1px solid rgba( themed(frontColor), .1);
  }
}


.mobile-menu-top-filler { flex: 1; cursor: pointer; }
.mobile-menu-top-spacer { flex: .2; } // So you don't accidentally close the menu when trying to click the top item...

.mobileMenu {
  height: 100%;
  flex-direction: column-reverse !important;
  justify-content: stretch;
  align-items: stretch;
}
.mobileMenu > div {
  display: flex;
  flex-direction: column;
  justify-content: unset;
  align-items: unset;
  overflow: auto;
  flex: 1;
  min-height: 0;
  &, & svg, & div {
    font-size: 21px !important;
    line-height: 21px !important;
  }
  
  .menu-icon-toolbar { 
    margin-left: 0; 
    padding: 15px 0;
    border: none;
    border-radius: 0;
    position: relative;
    z-index: 0;
    
    > div {
      padding: 0 20px;
    }
    
    &:before {
      content: '';
      position: absolute;
      z-index: 1;
      top: 0px;
      right: 0;
      left: 0;
      width: 100%;
      height: 1px;
      @include themify($themes) {
        background: rgba( themed(frontColor), .1);
      }
    }
    
  }
  
  .menu-item-icon {
    width: 38px;
    height: 38px;
    padding-left: 15px;
    padding-right: 15px;
    @include themify($themes) {
      color: rgba( themed(frontColor), .6);
    }
  }
  
  .menu-item {
    @include themify($themes) {
      border-top: 1px solid rgba( themed(frontColor), .1);
    }
  }
  .menu-item:hover .menu-item-text {
    @include themify($themes) {
      color: themed(audibleOrange);
    }
  }
  
}


</style>