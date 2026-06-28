<template>
<div class="extension-mega-menu">
  <div class="mega-menu-inner">

    <!-- TOOLS -->
    <div class="mega-section">
      <div class="mega-section-label">Tools</div>
      <div class="mega-section-items">
        <div
          v-for="item in toolItems"
          :key="item.name"
          class="mega-item mega-item--tool"
          :class="{ 'is-disabled': item.condition && !item.condition() }"
          @mousedown="$haptic(1)"
          @click="onItemClick(item)"
        >
          <span class="mega-item-icon" v-html="item.meta.icon"></span>
          <div class="mega-item-body">
            <span class="mega-item-text">{{ item.name }}</span>
            <span class="mega-item-desc" v-html="toolDescriptions[item.name]"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="mega-divider"></div>

    <!-- LANDING PAGE TOGGLE -->
    <div class="mega-section">
      <div class="mega-section-label">Landing page</div>
      <div class="mega-section-items">
        <div
          class="mega-item mega-item--landing"
          :class="{ 'is-active': customLandingSet }"
          @mousedown="$haptic(1)"
          @click="toggleLandingPage"
        >
          <span class="mega-item-icon" v-html="landingIcon"></span>
          <div class="mega-item-body">
            <span class="mega-item-text">{{ customLandingSet ? 'Reset landing page' : 'Set as landing page' }}</span>
            <span class="mega-item-desc">{{ customLandingSet ? 'Currently opening to a custom page. Click to go back to the default.' : 'Save this page as the default opening view, including any active filters, search, or sorting. For example, filter out finished books so the gallery always opens without you having to filter them out manually.' }}</span>
          </div>
          <span class="mega-item-toggle" :class="{ 'is-on': customLandingSet }"></span>
        </div>
      </div>
    </div>

    <div class="mega-divider"></div>

    <!-- LINKS -->
    <div class="mega-section">
      <div class="mega-section-label">Resources</div>
      <div class="mega-section-items">
        <component
          v-for="item in linkItems"
          :key="item.name"
          :is="item.tag"
          :href="item.href"
          target="_blank"
          class="mega-item mega-item--link"
          @mousedown="$haptic(1)"
          @click="onItemClick(item)"
        >
          <span class="mega-item-icon" v-html="item.meta.icon"></span>
          <span class="mega-item-text">{{ item.name }}</span>
          <span class="mega-item-external-icon"><fa6-solid-arrow-up-right-from-square /></span>
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
        'Save gallery website': 'Publish online to browse on mobile or show friends your library and wishlist.',
        'Spreadsheet export':   'Export your library data to an Excel or CSV spreadsheet.',
        'Wallpaper creator':    'Turn your book covers into a desktop wallpaper, card for online posts, tier list, or even animated wallpaper/screensaver. Books are pulled from the current page with whatever search, filters, and sorting you have active.',
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
}

.mega-divider {
  @include themify($themes) {
    border-top: 1px solid rgba( themed(frontColor), .1 );
  }
}

.mega-section {
  padding: 8px 0 4px;
}

.mega-section-label {
  padding: 0 14px 5px;
  font-size: .7em;
  letter-spacing: .06em;
  text-transform: uppercase;
  font-weight: 700;
  @include themify($themes) {
    color: rgba( themed(frontColor), .4 );
  }
}

.mega-section-items {
  display: flex;
  flex-direction: column;
}

// SHARED ITEM BASE
.mega-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 7px 14px;
  cursor: pointer;
  text-decoration: none;
  gap: 10px;
  @include themify($themes) {
    color: themed(frontColor);
    &:hover,
    &:focus {
      background: rgba( themed(frontColor), .07 );
    }
    &:active {
      background: rgba( themed(audibleOrange), .15 );
    }
  }

  &.is-disabled {
    cursor: default;
    opacity: .35;
    pointer-events: none;
  }
}

.mega-item-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.mega-item-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.mega-item-desc {
  font-size: .78em;
  line-height: 1.35;
  white-space: normal;
  @include themify($themes) {
    color: rgba( themed(frontColor), .5 );
  }
}

// LINK ITEMS
.mega-item--link {
  .mega-item-external-icon {
    margin-left: auto;
    opacity: .3;
    font-size: .7em;
    display: inline-flex;
    align-items: center;
  }
  @include themify($themes) {
    &:hover .mega-item-external-icon,
    &:focus .mega-item-external-icon {
      opacity: .7;
    }
  }
}

// TOOL ITEMS
.mega-item--tool {
  padding: 9px 14px;
  align-items: flex-start;

  .mega-item-icon {
    margin-top: 2px;
    @include themify($themes) {
      color: themed(audibleOrange);
    }
  }

  .mega-item-text {
    font-weight: 600;
    line-height: 1.2;
  }

  @include themify($themes) {
    background: rgba( themed(frontColor), .04 );
    border-bottom: 1px solid rgba( themed(frontColor), .07 );
    &:last-child {
      border-bottom: none;
    }
    &:hover,
    &:focus {
      background: rgba( themed(frontColor), .08 );
    }
  }
}

// LANDING PAGE TOGGLE
.mega-item--landing {
  padding: 8px 14px;
  align-items: flex-start;

  .mega-item-icon {
    margin-top: 2px;
    flex-shrink: 0;
    @include themify($themes) {
      color: rgba( themed(frontColor), .45 );
    }
  }

  &.is-active .mega-item-icon {
    @include themify($themes) {
      color: themed(audibleOrange);
    }
  }

  .mega-item-text {
    font-size: .88em;
    line-height: 1.2;
    @include themify($themes) {
      color: rgba( themed(frontColor), .75 );
    }
  }

  &.is-active .mega-item-text {
    @include themify($themes) {
      color: themed(frontColor);
    }
  }
}

// TOGGLE PILL
.mega-item-toggle {
  flex-shrink: 0;
  width: 28px;
  height: 16px;
  border-radius: 9999px;
  position: relative;
  margin-top: 2px;
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
