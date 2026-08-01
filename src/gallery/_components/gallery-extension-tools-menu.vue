<template>
<div class="extension-mega-menu">
  <div class="mega-menu-inner">

    <!-- TOOLS -->
    <div class="mega-section">
      <div class="mega-section-label">Tools</div>
      <div class="mega-well mega-well--tools">
        <div
          v-for="item in toolItems"
          :key="item.name"
          class="mega-row mega-row--tool"
          @mousedown="$haptic(1)"
          @click="onItemClick(item)"
        >
          <span
            class="mega-row-icon"
            :class="{ 'mega-row-icon--multicolor': item.meta.multicolorIcon }"
            v-html="item.meta.icon"
          ></span>
          <div class="mega-row-body">
            <span class="mega-row-title-line">
              <span class="mega-row-text">{{ item.name }}</span>
              <span
                v-if="item.condition"
                class="mega-row-badge"
                :class="{ 'mega-row-badge--empty': !wallpaperCurrentPageCount }"
              >
                {{ wallpaperCurrentPageCount ? wallpaperCurrentPageCount + ' covers' : 'Pick a source' }}
              </span>
            </span>
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

  <!-- WALLPAPER SOURCE PROMPT: shown when the current page has no importable books -->
  <Teleport to="body">
  <n-config-provider :theme="naiveTheme">
    <n-modal
      v-model:show="wallpaperPromptOpen"
      preset="card"
      :bordered="false"
      :auto-focus="false"
      title="Open collage maker"
      size="small"
      style="max-width: 420px;"
    >
      <p class="wallpaper-source-lead">
        This page has no book covers to import. Pick a source to open the collage maker with.
      </p>

      <div class="wallpaper-source-options">
        <div
          v-for="source in wallpaperSources"
          :key="source.key"
          class="wallpaper-source-option"
          @mousedown="$haptic(1)"
          @click="pickWallpaperSource( source )"
        >
          <span class="wallpaper-source-icon" v-html="source.icon"></span>
          <div class="wallpaper-source-body">
            <span class="wallpaper-source-title">{{ source.label }}</span>
            <span class="wallpaper-source-count">{{ source.count }} book covers</span>
          </div>
          <span class="wallpaper-source-chevron"><fa6-solid-chevron-right /></span>
        </div>

        <div
          class="wallpaper-source-option wallpaper-source-option--cancel"
          @mousedown="$haptic(1)"
          @click="wallpaperPromptOpen = false"
        >
          <span class="wallpaper-source-icon" v-html="IconFaSolidSliders"></span>
          <div class="wallpaper-source-body">
            <span class="wallpaper-source-title">Cancel, let me pick the books first</span>
            <span class="wallpaper-source-count">Close this, open a page with a grid, then use search, filters, and sorting to shape the import before launching again.</span>
          </div>
        </div>
      </div>
    </n-modal>
  </n-config-provider>
  </Teleport>

</div>
</template>

<script>
import { storageGet, storageSet } from '@utils/chrome-storage.js';
import { NConfigProvider, NModal, darkTheme, lightTheme } from 'naive-ui';
import openWallpaperCreator from '@output-mixins/gallery-open-wallpaper-creator.js';

// SOURCE ICONS (raw svg for v-html)
import IconFaBrandsAudible from '~icons/fa6-brands/audible?raw';
import IconFaSolidHeart     from '~icons/fa6-solid/heart?raw';
import IconFaSolidSliders   from '~icons/fa6-solid/sliders?raw';

export default {
  name: 'galleryExtensionToolsMenu',
  props: ['items'],
  emits: ['itemClick'],
  mixins: [ openWallpaperCreator ],
  components: { NConfigProvider, NModal },

  data: function() {
    return {
      customLandingSet: false,
      wallpaperPromptOpen: false,
      IconFaSolidSliders,
      toolDescriptions: {
        'Upload gallery website': 'Publish online to browse on mobile or show off your library or wishlist to your friends.',
        'Spreadsheet export':   'Export to an Excel or CSV spreadsheet.',
        'Collage maker':        'Turn your book covers into a collage image, in the form of a card, tier list, a desktop wallpaper, animated desktop wallpaper (or screensaver).',
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

    naiveTheme() {
      return this.$store.state.sticky.lightSwitch ? lightTheme : darkTheme;
    },

    // Importable covers on the current page: what the wallpaper creator would grab
    // if opened right now, honoring the active search, filters, and sorting.
    wallpaperCurrentPageCount() {
      return _.filter( this.$store.getters.collection, 'cover' ).length;
    },

    // Extracted sources the wallpaper creator can fall back to when the current page
    // has nothing to import. Only lists what was actually extracted, and counts the
    // books that carry a cover since those are the ones the creator can use.
    wallpaperSources() {

      const sources = [];
      const library = this.$store.getters.regularBooks;
      const wishlist = _.get( this.$store.state, 'audibledata.wishlist' );

      const withCovers = books => _.filter( books, 'cover' ).length;

      if ( library && library.length ) {
        sources.push({ key: 'library', label: 'Library', icon: IconFaBrandsAudible, books: library, count: withCovers( library ) });
      }

      if ( wishlist && wishlist.length ) {
        sources.push({ key: 'wishlist', label: 'Wishlist', icon: IconFaSolidHeart, books: wishlist, count: withCovers( wishlist ) });
      }

      return sources;

    },

  },

  methods: {

    onItemClick( item ) {

      // Wallpaper creator on a page with no importable books: prompt for a
      // whole library or wishlist source instead of doing nothing.
      if ( item.condition && !item.condition() ) {

        if ( this.wallpaperSources.length ) this.wallpaperPromptOpen = true;
        return;

      }

      if ( item.click ) item.click( item );
      this.$emit('itemClick');

    },

    pickWallpaperSource( source ) {

      this.wallpaperPromptOpen = false;
      this.openWallpaperCreator( source.books );
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

  // darker moat so the bordered tool cards pop on light mode
  .theme-light &--tools {
    background: rgba(0, 0, 0, .16);
  }
}

// SHARED ROW BASE
.mega-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 9px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
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
      background: #fff;
      border-color: rgba(0, 0, 0, .3);
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

// TOOL ROWS
.mega-row--tool {
  @include themify($themes) {
    border: 1px solid rgba( themed(frontColor), .15 );
  }

  // stronger passive border against the darker light-mode moat
  .theme-light & {
    border-color: rgba(0, 0, 0, .28);
  }

  @include themify($themes) {
    &:hover,
    &:focus {
      border-color: rgba( themed(frontColor), .3 );
    }
  }

  // stronger hover border to stand out against the darker light-mode moat
  .theme-light & {
    &:hover,
    &:focus {
      border-color: rgba(0, 0, 0, .45);
    }
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

.mega-row-title-line {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.mega-row-badge {
  flex-shrink: 0;
  white-space: nowrap;
  font-size: .62em;
  font-weight: 700;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 9999px;
  color: $audibleOrange;
  background: rgba( $audibleOrange, .14 );

  // Nothing on this page: the click will offer a source instead, so read as a nudge.
  &--empty {
    @include themify($themes) {
      color: rgba( themed(frontColor), .6 );
      background: rgba( themed(frontColor), .1 );
    }
  }
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
    @include themify($themes) {
      color: rgba( themed(frontColor), .6 );
      background: rgba( themed(frontColor), .07 );
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

// WALLPAPER SOURCE PROMPT
.wallpaper-source-lead {
  margin: 0 0 14px;
  font-size: .9em;
  line-height: 1.4;
}

.wallpaper-source-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wallpaper-source-option {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid rgba(128, 128, 128, .25);
  transition: border-color 120ms, background 120ms;

  &:hover {
    border-color: $audibleOrange;
    background: rgba( $audibleOrange, .08 );
  }
}

// The manual escape hatch: closes the prompt so the user can shape a grid first.
// Muted so it reads as secondary to the two real source picks above it.
.wallpaper-source-option--cancel {
  margin-top: 4px;
  align-items: flex-start;
  border-style: dashed;

  .wallpaper-source-icon {
    color: inherit;
    opacity: .55;
    background: rgba(128, 128, 128, .12);
  }

  .wallpaper-source-title {
    opacity: .85;
  }

  &:hover {
    border-color: rgba(128, 128, 128, .55);
    background: rgba(128, 128, 128, .08);
  }
}

.wallpaper-source-icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  font-size: 1.2em;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: $audibleOrange;
  background: rgba( $audibleOrange, .13 );
}

.wallpaper-source-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.wallpaper-source-title {
  font-size: .95em;
  font-weight: 600;
  line-height: 1.2;
}

.wallpaper-source-count {
  font-size: .78em;
  opacity: .6;
}

.wallpaper-source-chevron {
  flex-shrink: 0;
  font-size: .7em;
  opacity: .3;
  display: inline-flex;
  align-items: center;
}

.wallpaper-source-note {
  margin: 16px 0 0;
  font-size: .78em;
  line-height: 1.45;
  opacity: .6;
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
