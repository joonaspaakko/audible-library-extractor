<template>
<div class="extension-mega-menu">
  <div class="mega-menu-inner">

    <!-- TOOLS -->
    <div class="mega-section">
      <div class="mega-section-label">Tools</div>
      <div class="mega-well">
        <div
          v-for="item in toolItems"
          :key="item.name"
          class="mega-row mega-row--tool"
          :class="{ 'is-disabled': item.condition && !item.condition() }"
          @mousedown="$haptic(1)"
          @click="onItemClick(item)"
        >
          <span
            class="mega-row-icon"
            :class="{ 'mega-row-icon--multicolor': item.meta.multicolorIcon }"
            v-html="item.meta.icon"
          ></span>
          <div class="mega-row-body">
            <span class="mega-row-text">{{ item.name }}</span>
            <span class="mega-row-desc" v-html="toolDescriptions[item.name]"></span>
          </div>
          <span class="mega-row-chevron"><fa6-solid-chevron-right /></span>
        </div>
      </div>
    </div>

    <!-- LANDING PAGE TOGGLE -->
    <div class="mega-section">
      <div class="mega-section-label">Landing page</div>
      <div class="mega-well">
        <div
          class="mega-row mega-row--landing"
          :class="{ 'is-active': customLandingSet }"
          @mousedown="$haptic(1)"
          @click="toggleLandingPage"
        >
          <span class="mega-row-icon" v-html="landingIcon"></span>
          <div class="mega-row-body">
            <span class="mega-row-text">{{ customLandingSet ? 'Reset landing page' : 'Set as landing page' }}</span>
            <span class="mega-row-desc">{{ customLandingSet ? 'Currently opening to a custom page. Click to go back to the default.' : 'Open gallery to this page, including any active filters, search, and sorting.' }}</span>
          </div>
          <span class="mega-row-toggle" :class="{ 'is-on': customLandingSet }"></span>
        </div>
      </div>
    </div>

    <!-- LINKS -->
    <div class="mega-section">
      <div class="mega-section-label">Resources</div>
      <div class="mega-well">
        <component
          v-for="item in linkItems"
          :key="item.name"
          :is="item.tag"
          :href="item.href"
          target="_blank"
          class="mega-row mega-row--link"
          @mousedown="$haptic(1)"
          @click="onItemClick(item)"
        >
          <span class="mega-row-icon" v-html="item.meta.icon"></span>
          <span class="mega-row-text">{{ item.name }}</span>
          <span class="mega-row-external-icon"><fa6-solid-arrow-up-right-from-square /></span>
        </component>
      </div>
    </div>

  </div>
</div>
</template>

<script>
import { storageGet, storageSet } from '@utils/chrome-storage.js';

export default {
  name: 'galleryExtensionToolsMenu',
  props: ['items'],
  emits: ['itemClick'],

  data: function() {
    return {
      customLandingSet: false,
      toolDescriptions: {
        'Save gallery website': 'Publish online to browse on mobile or show off your library or wishlist to your friends.',
        'Spreadsheet export':   'Export to an Excel or CSV spreadsheet.',
        'Wallpaper creator':    'Turn your book covers into a animated desktop wallpaper or screensaver, card, or tier list.',
      },
    };
  },

  created: function() {
    storageGet( 'metadata', 'extras.galleryUrl' ).then(( url ) => {
      this.customLandingSet = !!url;
    });
  },

  computed: {

    linkItems() {
      return _.filter( this.items, item => item.tag === 'a' );
    },

    toolItems() {
      return _.filter( this.items, item => item.highlight );
    },

    landingIcon() {
    
      const setItem   = _.find( this.items, item => item.name === 'Set as gallery landing page' );
      const resetItem = _.find( this.items, item => item.name === 'Reset gallery landing page' );
      
      return this.customLandingSet ? _.get( resetItem, 'meta.icon' ) : _.get( setItem,  'meta.icon' );
      
    },

  },

  methods: {

    onItemClick( item ) {
      if ( item.condition && !item.condition() ) return;
      if ( item.click ) item.click( item );
      this.$emit('itemClick');
    },

    toggleLandingPage() {
      try {
        // RESET
        if ( this.customLandingSet ) {
        
          this.customLandingSet = false;
          const newUrl = null;
          chrome.runtime.sendMessage({ action: 'changeGalleryUrl', url: newUrl });
          storageSet( 'metadata', 'extras.galleryUrl', newUrl );
          
        }
        // SET
        else {
        
          this.customLandingSet = true;
          const path = window.location.pathname;
          const newUrl = '.' + path + window.location.href.split( path )[1];
          chrome.runtime.sendMessage({ action: 'changeGalleryUrl', url: newUrl });
          storageSet( 'metadata', 'extras.galleryUrl', newUrl );
          
        }
      } catch (e) {}
    },

  },
};
</script>

<style lang="scss" scoped>

.extension-mega-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 10;
  min-width: 290px;
  max-width: 450px;
  padding: 6px 0;
  @include themify($themes) {
    background: themed(elementColor);
    color: themed(frontColor);
    box-shadow: 0 5px 15px rgba( themed(outerColor), .7 );
    border: 1px solid rgba( themed(frontColor), .15 );
  }
}

.mega-menu-inner {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 4px;
}

.mega-section {
  padding: 8px 0 0;
}

.mega-section-label {
  padding: 0 14px 6px;
  font-size: .7em;
  letter-spacing: .06em;
  text-transform: uppercase;
  font-weight: 700;
  @include themify($themes) {
    color: rgba( themed(frontColor), .4 );
  }
}

// WELL: recessed tray that groups a section's rows
.mega-well {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 10px;
  padding: 6px;
  border-radius: 12px;
  @include themify($themes) {
    background: rgba( themed(outerColor), .25 );
  }
}

// SHARED ROW BASE
.mega-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  gap: 12px;
  @include themify($themes) {
    color: themed(frontColor);
    background: themed(elementColor);
    box-shadow: 0 1px 2px rgba( themed(outerColor), .3 );
  }

  .theme-light & {
    &:hover,
    &:focus {
      background: #f5f5f5;
    }
    &:active {
      background: #ededed;
    }
    &:hover .mega-row-icon,
    &:focus .mega-row-icon {
      color: #fff;
      background: $audibleOrange;
    }
    &:hover .mega-row-icon--multicolor,
    &:focus .mega-row-icon--multicolor {
      background: rgba(0, 0, 0, .05);
    }
  }

  .theme-dark & {
    &:hover,
    &:focus {
      background: #333;
    }
    &:active {
      background: #3d3d3d;
    }
    &:hover .mega-row-icon,
    &:focus .mega-row-icon {
      color: #fff;
    }
  }

  &.is-disabled {
    cursor: default;
    opacity: .35;
    pointer-events: none;
  }
}

.mega-row-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 1.3em;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  transition: color 120ms, background 120ms;
  @include themify($themes) {
    color: themed(audibleOrange);
    background: rgba( themed(audibleOrange), .13 );
  }

  &--multicolor {
    font-size: 1.5em;
    @include themify($themes) {
      background: rgba( themed(frontColor), .06 );
    }
  }
}

.mega-row-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.mega-row-chevron {
  flex-shrink: 0;
  align-self: center;
  font-size: .7em;
  opacity: .3;
  display: inline-flex;
  align-items: center;
  transition: opacity 120ms;
}

.mega-row--tool:hover .mega-row-chevron,
.mega-row--tool:focus .mega-row-chevron {
  opacity: .7;
}

.mega-row-text {
  font-size: .85em;
  font-weight: 600;
  line-height: 1.2;
}

.mega-row-desc {
  font-size: .74em;
  line-height: 1.3;
  white-space: normal;
  @include themify($themes) {
    color: rgba( themed(frontColor), .5 );
  }
}

// LINK ROWS
.mega-row--link {
  .mega-row-icon {
    width: 30px;
    height: 30px;
    font-size: 1em;
    @include themify($themes) {
      color: rgba( themed(frontColor), .6 );
      background: rgba( themed(frontColor), .07 );
    }
  }

  .mega-row-external-icon {
    margin-left: auto;
    opacity: .3;
    font-size: .7em;
    display: inline-flex;
    align-items: center;
  }
  @include themify($themes) {
    &:hover .mega-row-external-icon,
    &:focus .mega-row-external-icon {
      opacity: .7;
    }
  }

  .theme-light & {
    &:hover .mega-row-icon,
    &:focus .mega-row-icon {
      color: #fff;
      background: $audibleOrange;
    }
  }

  .theme-dark & {
    &:hover .mega-row-icon,
    &:focus .mega-row-icon {
      color: #fff;
    }
  }
}

// LANDING PAGE TOGGLE
.mega-row--landing {
  .mega-row-icon {
    width: 30px;
    height: 30px;
    font-size: 1em;
  }

  &.is-active .mega-row-icon {
    @include themify($themes) {
      color: themed(audibleOrange);
      background: rgba( themed(audibleOrange), .13 );
    }
  }

  .theme-light & {
    &:hover.is-active .mega-row-icon,
    &:focus.is-active .mega-row-icon {
      color: #fff;
      background: $audibleOrange;
    }
  }

  .theme-dark & {
    &:hover.is-active .mega-row-icon,
    &:focus.is-active .mega-row-icon {
      color: #fff;
    }
  }
}

// TOGGLE PILL
.mega-row-toggle {
  flex-shrink: 0;
  width: 28px;
  height: 16px;
  border-radius: 9999px;
  position: relative;
  transition: background 180ms;
  @include themify($themes) {
    background: rgba( themed(frontColor), .15 );
  }

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 9999px;
    transition: transform 180ms, background 180ms;
    @include themify($themes) {
      background: rgba( themed(frontColor), .4 );
    }
  }

  &.is-on {
    @include themify($themes) {
      background: themed(audibleOrange);
    }
    &::after {
      transform: translateX(12px);
      background: #fff;
    }
  }
}

</style>
