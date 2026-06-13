<template>
<gallery-modal class="global-settings-modal" @closeModal="$store.commit('prop', { key: 'globalSettingsOpen', value: false })">

  <div class="global-settings">

    <div class="top-wrapper">
      <div class="icon-wrapper">
        <fa6-solid-gear />
      </div>
      <div class="text-wrapper">
        <h2>Settings</h2>
        <div class="description">Global gallery preferences. These are remembered in your browser.</div>
      </div>
    </div>

    <!-- Miscellaneous -->
    <div class="settings-section">

      <div v-if="$store.state.standalone" class="setting-row pwa-row">
        <div class="setting-label">
          <span>Install as app</span>
          <span class="setting-subtext">Add this gallery to your home screen for quick access without a browser.</span>
        </div>
        <button class="pwa-install-btn" @click="showPwaDialog">Install</button>
      </div>

      <div class="setting-row">
        <label class="setting-label-wrap">
          <div class="setting-label">
            <span>Haptics</span>
            <span class="setting-subtext">Vibration feedback on touch interactions.</span>
          </div>
          <div class="visual-toggle" :class="{ on: $store.state.sticky.useHaptics }">
            <input type="checkbox" :checked="$store.state.sticky.useHaptics" @change="toggleHaptics">
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </div>
        </label>
      </div>

    </div>

    <!-- Book details -->
    <div class="settings-section-divider"></div>
    <div class="settings-section">

      <div class="collapsible-header" @click="bookDetailsExpanded = !bookDetailsExpanded">
        <fa6-solid-chevron-right class="section-chevron" :class="{ expanded: bookDetailsExpanded }" />
        <span>Book details</span>
      </div>

      <div v-show="bookDetailsExpanded" class="no-selection">
        <div
          v-for="setting in bookDetailSettings"
          :key="setting.sectionLabel || setting.label"
        >
          <div class="setting-divider" v-if="setting.type === 'divider'"></div>
          <label v-else-if="setting.sectionToggle" class="setting-section-label is-toggle" :class="{ disabled: !setting.enabled }">
            <span>{{ setting.sectionLabel }}</span>
            <div class="visual-toggle" :class="{ on: setting.value }">
              <input type="checkbox" :checked="setting.value" @change="handleSetting(setting, $event)" :disabled="!setting.enabled">
              <div class="toggle-track"><div class="toggle-thumb"></div></div>
            </div>
          </label>
          <div v-else-if="setting.type === 'sectionLabel'" class="setting-section-label">{{ setting.sectionLabel }}</div>
          <div class="setting-row" v-else-if="!setting.standalone || $store.state.standalone" :class="{ 'setting-disabled': !setting.enabled }">
            <label class="setting-label-wrap">
              <div class="setting-label">
                <span>{{ setting.label }}</span>
              </div>
              <div
                v-if="setting.info"
                class="info-icon"
                v-tippy="{ placement: 'left', maxWidth: 220, interactive: true, trigger: 'mouseenter', hideOnClick: false }"
                :content="setting.info"
                @click.prevent
              >
                <fa6-regular-circle-question />
              </div>
              <div class="visual-toggle" :class="{ on: setting.value }">
                <input type="checkbox" :checked="setting.value" @change="handleSetting(setting, $event)" :disabled="!setting.enabled">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
              </div>
            </label>
          </div>
        </div>
      </div>

    </div>

    <div class="settings-section-divider"></div>
    <div class="attribution">
      This gallery was created with <a href="https://joonaspaakko.gitbook.io/audible-library-extractor/" target="_blank" rel="noopener noreferrer">Audible Library Extractor</a>
    </div>

  </div>

</gallery-modal>
</template>

<script>
import modal from '@output-snippets/gallery-modal.vue';
import SamplePlayButton from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-sample-play-button.jpg';
import BookCoverCloudPlayerButton from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-book-cover-cloud-player-button.jpg';
import BlurbHoverCorner from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-blurb-hover-corner.jpg';
import CoverWhispersyncIndicator from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-cover-whispersync-indicator.jpg';
import CoverPlusCalatogIndicator from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-cover-plus-calatog-indicator.jpg';
import CoverFavoriteFinishedIndicators from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-cover-favorite-finished-indicators.jpg';
import PreferShortTitle from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-prefer-short-title.jpg';
import Sidebar from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-sidebar.jpg';
import SidebarCover from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-sidebar-cover.jpg';
import SidebarToolbar from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-sidebar-toolbar.jpg';
import SidebarMainInfo from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-sidebar-main-info.jpg';
import SidebarCollectionsList from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-sidebar-collections-list.jpg';
import SidebarSeriesList from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-sidebar-series-list.jpg';
import Carousel from '@output-pages/gallery-root/gallery-grid-view/gallery-book-details/gallery-book-details-settings-images/gallery-carousel.jpg';

export default {
  name: 'galleryGlobalSettings',
  components: { modal },
  data: function() {
    const vue = this;
    const sticky = this.$store.state.sticky;
    return {
      bookDetailsExpanded: true,
      bookDetailSettings: [

        { type: 'sectionLabel', sectionLabel: 'Book cover' },
        {
          enabled: true, type: 'checkbox', label: 'Show sample play button',
          info: `Plays a short audio sample directly from the book cover.<br><img src="${SamplePlayButton}" class="tippy-info-image" />`,
          parent: 'sampleButton',
          value: sticky.bookDetailSettings.playButton,
          event: function( e ) {
            const v = e.target.checked;
            const update = [{ key: 'sticky.bookDetailSettings.playButton', value: v }];
            if ( sticky.bookDetailSettings.cloudPlayer ) {
              update.push({ key: 'sticky.bookDetailSettings.cloudPlayer', value: !v });
              vue.mutateChildren('cloudButton', 'value', !v);
            }
            if ( sticky.bookDetailSettings.appLink ) {
              update.push({ key: 'sticky.bookDetailSettings.appLink', value: !v });
              vue.mutateChildren('appLinkButton', 'value', !v);
            }
            vue.mutateChildren('sampleButton', 'value', v);
            vue.$store.commit('prop', update);
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show cloud player button',
          info: `Opens the Audible cloud player. Cannot be enabled at the same time as the sample play button. Requires being logged in to Audible.<br><img src="${BookCoverCloudPlayerButton}" class="tippy-info-image" />`,
          parent: 'cloudButton',
          value: sticky.bookDetailSettings.cloudPlayer,
          event: function( e ) {
            const v = e.target.checked;
            const update = [{ key: 'sticky.bookDetailSettings.cloudPlayer', value: v }];
            if ( sticky.bookDetailSettings.playButton ) {
              update.push({ key: 'sticky.bookDetailSettings.playButton', value: !v });
              vue.mutateChildren('sampleButton', 'value', !v);
            }
            if ( sticky.bookDetailSettings.appLink ) {
              update.push({ key: 'sticky.bookDetailSettings.appLink', value: !v });
              vue.mutateChildren('appLinkButton', 'value', !v);
            }
            vue.mutateChildren('cloudButton', 'value', v);
            vue.$store.commit('prop', update);
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show open in app button',
          info: 'Shows a button on the book cover to open the book in the Audible mobile app. Only available in the standalone gallery. Cannot be enabled at the same time as the other cover buttons.',
          standalone: true,
          parent: 'appLinkButton',
          value: sticky.bookDetailSettings.appLink,
          event: function( e ) {
            const v = e.target.checked;
            const update = [{ key: 'sticky.bookDetailSettings.appLink', value: v }];
            if ( sticky.bookDetailSettings.playButton ) {
              update.push({ key: 'sticky.bookDetailSettings.playButton', value: !v });
              vue.mutateChildren('sampleButton', 'value', !v);
            }
            if ( sticky.bookDetailSettings.cloudPlayer ) {
              update.push({ key: 'sticky.bookDetailSettings.cloudPlayer', value: !v });
              vue.mutateChildren('cloudButton', 'value', !v);
            }
            vue.mutateChildren('appLinkButton', 'value', v);
            vue.$store.commit('prop', update);
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show blurb on hover',
          info: `Shows the book description as an overlay when hovering the cover. Not visible on mobile.<br><img src="${BlurbHoverCorner}" class="tippy-info-image" />`,
          value: sticky.bookDetailSettings.blurb,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.blurb', value: e.target.checked });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show whispersync indicator',
          info: `Shows a small badge on the cover if you own a Whispersync (Kindle) version of the book.<br><img src="${CoverWhispersyncIndicator}" class="tippy-info-image" />`,
          value: sticky.bookDetailSettings.whispersync,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.whispersync', value: e.target.checked });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show plus catalog indicator',
          info: `Shows a badge on the cover for books available in the Audible Plus catalog.<br><img src="${CoverPlusCalatogIndicator}" class="tippy-info-image" />`,
          value: sticky.bookDetailSettings.plusCatalog,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.plusCatalog', value: e.target.checked });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show favorite indicator',
          info: `<strong>The RED dot</strong> shows on covers for books marked as favorite.<br><img src="${CoverFavoriteFinishedIndicators}" class="tippy-info-image" />`,
          value: sticky.bookDetailSettings.favorite,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.favorite', value: e.target.checked });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show finished indicator',
          info: `<strong>The GREEN dot</strong> shows on covers for books you have finished.<br><img src="${CoverFavoriteFinishedIndicators}" class="tippy-info-image" />`,
          value: sticky.bookDetailSettings.finished,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.finished', value: e.target.checked });
          },
        },
        { type: 'sectionLabel', sectionLabel: 'Above summary' },
        {
          enabled: true, type: 'checkbox', label: 'Prefer short title',
          info: `Displays the short title when available, with the subtitle shown below in a smaller font, similar to Audible store pages.<br><img src="${PreferShortTitle}" class="tippy-info-image" />`,
          value: sticky.bookDetailSettings.titleShort,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.titleShort', value: e.target.checked });
            vue.$nextTick(() => { vue.$compEmitter.emit('resizeSummary'); });
          },
        },

        {
          enabled: true, type: 'checkbox', label: 'Show sidebar',
          info: `Toggles the entire sidebar panel in the book details view.<br><img src="${Sidebar}" class="tippy-info-image" />`,
          sectionLabel: 'Sidebar',
          sectionToggle: true,
          value: sticky.bookDetailSettings.sidebar.show,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.sidebar.show', value: e.target.checked });
            vue.$nextTick(() => { vue.$compEmitter.emit('resizeSummary'); });
            vue.mutateChildren('sidebar', 'enabled', e.target.checked);
          },
          init: function() { vue.mutateChildren('sidebar', 'enabled', sticky.bookDetailSettings.sidebar.show); },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show book cover',
          info: `Shows the book cover at the top of the sidebar. Can also be toggled via the arrow button on the sidebar.<br><img src="${SidebarCover}" class="tippy-info-image" />`,
          parent: 'sidebar',
          value: !sticky.bookDetailsCollapsedCover,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailsCollapsedCover', value: !e.target.checked });
            vue.$nextTick(() => { vue.$compEmitter.emit('resizeSummary'); });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show icon toolbar',
          info: `Shows the row of action icons (share, open in Audible, etc.) in the sidebar.<br><img src="${SidebarToolbar}" class="tippy-info-image" />`,
          parent: 'sidebar',
          value: sticky.bookDetailSettings.sidebar.iconToolbar,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.sidebar.iconToolbar', value: e.target.checked });
            vue.$nextTick(() => { vue.$compEmitter.emit('resizeSummary'); });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show main details',
          info: `Shows the main info block (author, narrator, series, etc.) in the sidebar. Can also be toggled via the arrow button on the sidebar.<br><img src="${SidebarMainInfo}" class="tippy-info-image" />`,
          parent: 'sidebar',
          value: !sticky.bookDetailsCollapsedDetails,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailsCollapsedDetails', value: !e.target.checked });
            vue.$nextTick(() => { vue.$compEmitter.emit('resizeSummary'); });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show collections list',
          info: `Shows which collections the book belongs to, if any.<br><img src="${SidebarCollectionsList}" class="tippy-info-image" />`,
          parent: 'sidebar',
          value: sticky.bookDetailSettings.sidebar.collectionsList,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.sidebar.collectionsList', value: e.target.checked });
            vue.$nextTick(() => { vue.$compEmitter.emit('resizeSummary'); });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show series list',
          info: `Shows which series the book belongs to, if any.<br><img src="${SidebarSeriesList}" class="tippy-info-image" />`,
          parent: 'sidebar',
          value: sticky.bookDetailSettings.sidebar.seriesList,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.sidebar.seriesList', value: e.target.checked });
            vue.$nextTick(() => { vue.$compEmitter.emit('resizeSummary'); });
          },
        },

        { type: 'sectionLabel', sectionLabel: 'Bottom' },
        {
          enabled: true, type: 'checkbox', label: 'Show carousel',
          info: `Shows a carousel of related books (same series or author) at the bottom of the details view.<br><img src="${Carousel}" class="tippy-info-image" />`,
          value: sticky.bookDetailSettings.carousel,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.carousel', value: e.target.checked });
          },
        },

      ],
    };
  },

  created: function() {
    const hasInits = _.filter(this.bookDetailSettings, 'init');
    _.each(hasInits, s => s.init(s));
  },

  methods: {

    toggleHaptics: function( e ) {
      this.$store.commit('stickyProp', { key: 'useHaptics', value: e.target.checked });
    },

    showPwaDialog: function() {
      const el = document.querySelector('pwa-install');
      if ( el ) el.showDialog(true);
    },

    handleSetting: function( setting, e ) {
      setting.value = e.target.checked;
      setting.event( e );
    },

    mutateChildren: function( parentKey, propKey, value ) {
      const children = _.filter(this.bookDetailSettings, { parent: parentKey });
      _.each(children, c => { c[propKey] = value; });
    },

  },
};
</script>

<style lang="scss">
.tippy-info-image {
  display: block;
  width: 210px;
  max-width: 100%;
  margin-top: 8px;
}
</style>

<style lang="scss" scoped>

:global(.global-settings-modal .inner-wrap) {
  padding: 25px;
  box-sizing: border-box;
}

.global-settings {
  min-width: 300px;
}

.top-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding-bottom: 18px;
  margin-bottom: 16px;
  @include themify($themes) {
    border-bottom: 1px solid rgba(themed(frontColor), .08);
  }
}

.icon-wrapper {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
  @include themify($themes) {
    color: rgba(themed(frontColor), .4);
  }
}

.text-wrapper h2 {
  margin: 0 0 3px;
  font-size: 1.15em;
}

.description {
  font-size: 0.82em;
  @include themify($themes) {
    color: rgba(themed(frontColor), .5);
  }
}

.settings-section {
  display: flex;
  flex-direction: column;
}

.settings-section-divider {
  margin: 10px 0;
  @include themify($themes) {
    border-top: 1px solid rgba(themed(frontColor), .07);
  }
}

.setting-row {
  padding: 6px 0;
}

.setting-label-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  input { display: none; }
}

.setting-label {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
  span:first-child {
    font-size: 0.9em;
  }
}

.setting-subtext {
  font-size: 0.75em !important;
  @include themify($themes) {
    color: rgba(themed(frontColor), .4);
  }
}


.setting-section-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.68em;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  padding: 10px 0 3px;
  @include themify($themes) {
    color: rgba(themed(frontColor), .35);
  }
  &.is-toggle {
    cursor: pointer;
    input { display: none; }
  }
  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

.info-icon {
  flex-shrink: 0;
  cursor: pointer;
  font-size: 0.85em;
  line-height: 1;
  @include themify($themes) {
    color: rgba(themed(frontColor), .3);
    &:hover { color: rgba(themed(frontColor), .7); }
  }
}

.setting-divider {
  margin: 6px 0;
  @include themify($themes) {
    border-top: 1px solid rgba(themed(frontColor), .06);
  }
}

.setting-disabled {
  opacity: 0.4;
  pointer-events: none;
}

// Toggle switch
.visual-toggle {
  flex-shrink: 0;
  position: relative;
  width: 30px;
  height: 17px;
}

.toggle-track {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  transition: background 180ms;
  @include themify($themes) {
    background: rgba(themed(frontColor), .15);
  }
  .visual-toggle.on & {
    background: #00c853;
  }
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  transition: transform 180ms;
  box-shadow: 0 1px 3px rgba(#000, .3);
  .visual-toggle.on & {
    transform: translateX(13px);
  }
}

// PWA install button
.pwa-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0 10px;
}

.attribution {
  padding-top: 14px;
  text-align: center;
  font-size: 0.78em;
  @include themify($themes) {
    color: rgba(themed(frontColor), .4);
    a {
      color: rgba(themed(frontColor), .4) !important;
      text-decoration: none;
      border-bottom: 1px solid rgba(themed(frontColor), .3);
      &:hover { color: rgba(themed(frontColor), .7) !important; border-bottom-color: rgba(themed(frontColor), .7); }
    }
  }
}

.pwa-install-btn {
  flex-shrink: 0;
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 0.85em;
  cursor: pointer;
  @include themify($themes) {
    background: rgba(themed(frontColor), .08);
    color: rgba(themed(frontColor), .8);
    border: 1px solid rgba(themed(frontColor), .2);
    &:hover {
      background: rgba(themed(frontColor), .14);
    }
  }
}

// Collapsible book details header
.collapsible-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72em;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  padding: 4px 0 8px;
  @include themify($themes) {
    color: rgba(themed(frontColor), .45);
  }
}

.section-chevron {
  flex-shrink: 0;
  transition: transform 150ms ease;
  &.expanded {
    transform: rotate(90deg);
  }
}

</style>
