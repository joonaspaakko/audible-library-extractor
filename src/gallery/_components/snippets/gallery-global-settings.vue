<template>
<Teleport to="body">
<n-config-provider :theme="naiveTheme" :theme-overrides="naiveThemeOverrides" class="global-settings-drawer-provider">
<n-drawer
  :show="true"
  :placement="isMobile ? 'bottom' : 'right'"
  :width="340"
  :height="isMobile ? '50%' : undefined"
  :mask-closable="true"
  :show-mask="true"
  :lock-scroll="false"
  :auto-focus="false"
  :trap-focus="false"
  :close-on-esc="true"
  @update:show="val => { if ( !val ) $store.commit('prop', { key: 'globalSettingsOpen', value: false }); }"
>
  <n-drawer-content closable :native-scrollbar="false">
    <template #header>
      <div class="drawer-header-inner">
        <fa6-solid-gear class="drawer-header-icon" />
        <div>
          <div class="drawer-header-title">Settings</div>
          <div class="drawer-header-sub">Global gallery preferences. Remembered in your browser.</div>
        </div>
      </div>
    </template>

  <div class="global-settings">

    <!-- Appearance -->
    <div class="settings-section">

      <div class="setting-row">
        <div class="setting-label-wrap segmented-row">
          <div class="setting-icon">
            <fa6-solid-sun v-if="$store.state.sticky.lightSwitch" />
            <fa6-solid-moon v-else />
          </div>
          <div class="setting-label">
            <span>Theme</span>
          </div>
          <div class="segmented">
            <button :class="{ active: !$store.state.sticky.lightSwitch }" @click="setTheme( false )" @mousedown="$haptic(1)">
              <fa6-solid-moon /><span>Dark</span>
            </button>
            <button :class="{ active: !!$store.state.sticky.lightSwitch }" @click="setTheme( true )" @mousedown="$haptic(1)">
              <fa6-solid-sun /><span>Light</span>
            </button>
          </div>
        </div>
      </div>

      <div class="setting-row" v-if="$store.state.searchMounted">
        <div class="setting-label-wrap segmented-row">
          <div class="setting-icon">
            <material-symbols-table-outline v-if="$store.state.sticky.viewMode === 'spreadsheet'" />
            <ep-grid v-else />
          </div>
          <div class="setting-label">
            <span>View</span>
          </div>
          <div class="segmented">
            <button :class="{ active: $store.state.sticky.viewMode === 'grid' }" @click="setViewMode( 'grid' )" @mousedown="$haptic(1)">
              <ep-grid /><span>Grid</span>
            </button>
            <button :class="{ active: $store.state.sticky.viewMode === 'spreadsheet' }" @click="setViewMode( 'spreadsheet' )" @mousedown="$haptic(1)">
              <material-symbols-table-outline /><span>Spreadsheet</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Grid covers per row, via the grid's max width (grid view only) -->
      <div class="setting-row" v-if="$store.state.searchMounted && $store.state.sticky.viewMode === 'grid' && coversPerRowMax > coversPerRowMin">
        <div class="setting-label-wrap covers-per-row-row">
          <div class="setting-icon">
            <fluent-dock-row-20-filled />
          </div>
          <div class="setting-label">
            <span>Max covers per row</span>
            <span class="setting-subtext">Limited by browser width</span>
          </div>
          <div class="covers-per-row-value" :class="{ auto: listMode ? !$store.state.sticky.gridListCols : !$store.state.sticky.gridMaxWidth }">
            {{ coversPerRowCurrent }}
          </div>
          <button
            class="covers-per-row-auto"
            :class="{ active: listMode ? !$store.state.sticky.gridListCols : !$store.state.sticky.gridMaxWidth }"
            @click="resetCoversPerRow"
            @mousedown="$haptic(1)"
          >Default</button>
        </div>
        <n-slider
          class="covers-per-row-slider"
          :min="coversPerRowMin"
          :max="coversPerRowMax"
          :value="coversPerRowCurrent"
          :step="1"
          :tooltip="true"
          :marks="coversPerRowMarks"
          @update:value="onCoversPerRowInput"
          @dragstart="$haptic(1)"
          @dragend="onSliderDragEnd"
        />
      </div>

      <!-- Cover size shrinks/grows the covers themselves while the grid width stays put (grid view only) -->
      <div class="setting-row" v-if="$store.state.searchMounted && $store.state.sticky.viewMode === 'grid'">
        <div class="setting-label-wrap covers-per-row-row">
          <div class="setting-icon">
            <fluent-resize-image-20-filled />
          </div>
          <div class="setting-label">
            <span>Cover size</span>
          </div>
          <div class="covers-per-row-value" :class="{ auto: !$store.state.sticky.coverSize }">
            {{ coverSizeCurrent }}
          </div>
          <button
            class="covers-per-row-auto"
            :class="{ active: !$store.state.sticky.coverSize }"
            @click="setCoverSize( null )"
            @mousedown="$haptic(1)"
          >Default</button>
        </div>
        <n-slider
          class="covers-per-row-slider"
          :min="coverSizeMin"
          :max="coverSizeMax"
          :value="coverSizeCurrent"
          :step="1"
          :marks="coverSizeMarks"
          :tooltip="true"
          :format-tooltip="val => val + 'px'"
          @update:value="onCoverSizeInput"
          @dragstart="$haptic(1)"
          @dragend="onSliderDragEnd"
        />
      </div>

      <!-- Adds title, author and length to each cell. Stacked puts them under the cover, list
           puts them beside it. The two layouts are mutually exclusive (grid view only). -->
      <div class="setting-row" v-if="$store.state.searchMounted && $store.state.sticky.viewMode === 'grid'">
        <div class="setting-label-wrap segmented-row">
          <div class="setting-icon">
            <fa6-solid-list />
          </div>
          <div class="setting-label">
            <span>Details</span>
          </div>
          <div class="segmented">
            <button :class="{ active: $store.state.sticky.gridDetailsMode === 'off' }" @click="setDetailsMode( 'off' )" @mousedown="$haptic(1)">
              <span>Off</span>
            </button>
            <button :class="{ active: $store.state.sticky.gridDetailsMode === 'stacked' }" @click="setDetailsMode( 'stacked' )" @mousedown="$haptic(1)">
              <span>Stacked</span>
            </button>
            <button :class="{ active: $store.state.sticky.gridDetailsMode === 'list' }" @click="setDetailsMode( 'list' )" @mousedown="$haptic(1)">
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Miscellaneous -->
    <template v-if="$store.state.standalone">
    <div class="settings-section-divider"></div>
    <div class="settings-section">

      <div class="setting-row pwa-row">
        <div class="setting-icon">
          <fa6-solid-mobile-screen-button />
        </div>
        <div class="setting-label">
          <span>Install as app</span>
          <span class="setting-subtext">Add this gallery to your home screen for quick access without a browser.</span>
        </div>
        <button class="pwa-install-btn" @click="showPwaDialog" @mousedown="$haptic(2)">Install</button>
      </div>

      <!-- Haptics setting hidden - disabled due to iOS 26.5+ restrictions -->
      <!--
      <div class="setting-row">
        <label class="setting-label-wrap">
          <div class="setting-label">
            <span>Haptics</span>
            <span class="setting-subtext">Vibration feedback on touch interactions.</span>
          </div>
          <div class="visual-toggle" :class="{ on: $store.state.sticky.useHaptics }">
            <input type="checkbox" :checked="$store.state.sticky.useHaptics" @change="toggleHaptics" @mousedown="$haptic(1)">
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </div>
        </label>
      </div>
      -->

    </div>
    </template>

    <!-- Book cover -->
    <div class="settings-section-divider"></div>
    <div class="settings-section">

      <div class="collapsible-header" @click="bookCoverExpanded = !bookCoverExpanded" @mousedown="$haptic(1)">
        <fa6-solid-chevron-right class="section-chevron" :class="{ expanded: bookCoverExpanded }" />
        <span>Book cover</span>
      </div>

      <div v-show="bookCoverExpanded" class="no-selection">
        <div
          v-for="setting in bookCoverSettings"
          :key="setting.sectionLabel || setting.label"
        >
          <div class="setting-divider" v-if="setting.type === 'divider'"></div>
          <div v-else-if="setting.type === 'sectionLabel'" class="setting-section-label">{{ setting.sectionLabel }}</div>
          <div class="setting-row" v-else-if="!setting.standalone || $store.state.standalone" :class="{ 'setting-disabled': !setting.enabled || (setting.coverButtonSetting && coverButtonsDisabled) }">
            <label class="setting-label-wrap">
              <div class="setting-icon">
                <component :is="setting.icon" v-if="setting.icon" />
              </div>
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
                <input type="checkbox" :checked="setting.value" @change="handleSetting(setting, $event)" @mousedown="$haptic(1)" :disabled="!setting.enabled || (setting.coverButtonSetting && coverButtonsDisabled)">
                <div class="toggle-track"><div class="toggle-thumb"></div></div>
              </div>
            </label>
          </div>
        </div>
      </div>

    </div>

    <!-- Book details -->
    <div class="settings-section-divider"></div>
    <div class="settings-section">

      <div class="collapsible-header" @click="bookDetailsExpanded = !bookDetailsExpanded" @mousedown="$haptic(1)">
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
              <input type="checkbox" :checked="setting.value" @change="handleSetting(setting, $event)" @mousedown="$haptic(1)" :disabled="!setting.enabled">
              <div class="toggle-track"><div class="toggle-thumb"></div></div>
            </div>
          </label>
          <div v-else-if="setting.type === 'sectionLabel'" class="setting-section-label">{{ setting.sectionLabel }}</div>
          <div class="setting-row" v-else-if="!setting.standalone || $store.state.standalone" :class="{ 'setting-disabled': !setting.enabled }">
            <label class="setting-label-wrap">
              <div class="setting-icon">
                <component :is="setting.icon" v-if="setting.icon" />
              </div>
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
                <input type="checkbox" :checked="setting.value" @change="handleSetting(setting, $event)" @mousedown="$haptic(1)" :disabled="!setting.enabled">
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

  </n-drawer-content>
</n-drawer>
</n-config-provider>
</Teleport>
</template>

<script>
import { NConfigProvider, NDrawer, NDrawerContent, NSlider, darkTheme, lightTheme } from 'naive-ui';
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

// SETTING ROW ICONS
import IconPlay         from '~icons/fa6-solid/play';
import IconCloud        from '~icons/fa6-solid/cloud';
import IconAppLink      from '~icons/fa6-solid/mobile-screen-button';
import IconBlurb        from '~icons/fa6-solid/align-left';
import IconWhispersync  from '~icons/fa6-solid/rotate';
import IconPlus         from '~icons/fa6-solid/plus';
import IconHeart        from '~icons/fa6-solid/heart';
import IconCheck        from '~icons/fa6-solid/check';
import IconShortTitle   from '~icons/fa6-solid/heading';
import IconCover        from '~icons/fa6-solid/image';
import IconToolbar      from '~icons/fa6-solid/icons';
import IconMainInfo     from '~icons/fa6-solid/circle-info';
import IconCollections  from '~icons/fa6-solid/layer-group';
import IconSeries       from '~icons/fa6-solid/list-ol';
import IconCarousel     from '~icons/fa6-solid/images';

// Cover size slider bounds, in pixels. Default matches $thumbnailSize.
const COVER_SIZE_DEFAULT = 180;
const COVER_SIZE_MIN = 50;
const COVER_SIZE_MAX = 500;

// List card sizing, kept in sync with gallery-grid-view.vue: the default list cover edge
// and the text reserve beside it that together set a card's minimum width.
const LIST_COVER_DEFAULT = 90;
const LIST_TEXT_MIN_WIDTH = 200;
// Default cards per row in list mode, kept in sync with LIST_DEFAULT_COLS in
// gallery-grid-view.vue. Clearing the covers-per-row override falls back to this.
const LIST_DEFAULT_COLS = 3;

export default {
  name: 'galleryGlobalSettings',
  components: { NConfigProvider, NDrawer, NDrawerContent, NSlider },
  data: function() {
    const vue = this;
    const sticky = this.$store.state.sticky;
    return {
      bookCoverExpanded: true,
      bookDetailsExpanded: true,
      bookCoverSettings: [

        {
          enabled: true, coverButtonSetting: true, type: 'checkbox', label: 'Show sample play button', icon: IconPlay,
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
          enabled: true, coverButtonSetting: true, type: 'checkbox', label: 'Show cloud player button', icon: IconCloud,
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
          enabled: true, coverButtonSetting: true, type: 'checkbox', label: 'Show open in app button', icon: IconAppLink,
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
          enabled: true, type: 'checkbox', label: 'Show blurb on hover', icon: IconBlurb,
          info: `Shows the book description as an overlay when hovering the cover. Not visible on mobile.<br><img src="${BlurbHoverCorner}" class="tippy-info-image" />`,
          value: sticky.bookDetailSettings.blurb,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.blurb', value: e.target.checked });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show whispersync indicator', icon: IconWhispersync,
          info: `Shows a small badge on the cover if you own a Whispersync (Kindle) version of the book.<br><img src="${CoverWhispersyncIndicator}" class="tippy-info-image" />`,
          value: sticky.bookDetailSettings.whispersync,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.whispersync', value: e.target.checked });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show plus catalog indicator', icon: IconPlus,
          info: `Shows a badge on the cover for books available in the Audible Plus catalog.<br><img src="${CoverPlusCalatogIndicator}" class="tippy-info-image" />`,
          value: sticky.bookDetailSettings.plusCatalog,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.plusCatalog', value: e.target.checked });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show favorite indicator', icon: IconHeart,
          info: `<strong>The RED dot</strong> shows on covers for books marked as favorite.<br><img src="${CoverFavoriteFinishedIndicators}" class="tippy-info-image" />`,
          value: sticky.bookDetailSettings.favorite,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.favorite', value: e.target.checked });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show finished indicator', icon: IconCheck,
          info: `<strong>The GREEN dot</strong> shows on covers for books you have finished.<br><img src="${CoverFavoriteFinishedIndicators}" class="tippy-info-image" />`,
          value: sticky.bookDetailSettings.finished,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.finished', value: e.target.checked });
          },
        },
      ],
      bookDetailSettings: [

        { type: 'sectionLabel', sectionLabel: 'Above summary' },
        {
          enabled: true, type: 'checkbox', label: 'Prefer short title', icon: IconShortTitle,
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
          enabled: true, type: 'checkbox', label: 'Show book cover', icon: IconCover,
          info: `Shows the book cover at the top of the sidebar. Can also be toggled via the arrow button on the sidebar.<br><img src="${SidebarCover}" class="tippy-info-image" />`,
          parent: 'sidebar',
          value: !sticky.bookDetailsCollapsedCover,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailsCollapsedCover', value: !e.target.checked });
            vue.$nextTick(() => { vue.$compEmitter.emit('resizeSummary'); });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show icon toolbar', icon: IconToolbar,
          info: `Shows the row of action icons (share, open in Audible, etc.) in the sidebar.<br><img src="${SidebarToolbar}" class="tippy-info-image" />`,
          parent: 'sidebar',
          value: sticky.bookDetailSettings.sidebar.iconToolbar,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.sidebar.iconToolbar', value: e.target.checked });
            vue.$nextTick(() => { vue.$compEmitter.emit('resizeSummary'); });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show main details', icon: IconMainInfo,
          info: `Shows the main info block (author, narrator, series, etc.) in the sidebar. Can also be toggled via the arrow button on the sidebar.<br><img src="${SidebarMainInfo}" class="tippy-info-image" />`,
          parent: 'sidebar',
          value: !sticky.bookDetailsCollapsedDetails,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailsCollapsedDetails', value: !e.target.checked });
            vue.$nextTick(() => { vue.$compEmitter.emit('resizeSummary'); });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show collections list', icon: IconCollections,
          info: `Shows which collections the book belongs to, if any.<br><img src="${SidebarCollectionsList}" class="tippy-info-image" />`,
          parent: 'sidebar',
          value: sticky.bookDetailSettings.sidebar.collectionsList,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.sidebar.collectionsList', value: e.target.checked });
            vue.$nextTick(() => { vue.$compEmitter.emit('resizeSummary'); });
          },
        },
        {
          enabled: true, type: 'checkbox', label: 'Show series list', icon: IconSeries,
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
          enabled: true, type: 'checkbox', label: 'Show carousel', icon: IconCarousel,
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
    const hasInits = _.filter( [ ...this.bookCoverSettings, ...this.bookDetailSettings ], 'init' );
    _.each(hasInits, s => s.init(s));
  },

  computed: {

    isMobile: function() {
      return this.$store.getters.mobileThreshold;
    },

    naiveTheme: function() {
      return this.$store.state.sticky.lightSwitch ? lightTheme : darkTheme;
    },

    naiveThemeOverrides: function() {
      const sliderOverrides = {
        Slider: {
          fillColor: '#00c853',
          fillColorHover: '#00c853',
          dotBorderActive: '2px solid #00c853',
          thumbColor: '#00c853',
          thumbColorHover: '#00c853',
        },
      };
      if ( !this.$store.state.globalSettingsDrawerHidden ) return sliderOverrides;
      const isLight = this.$store.state.sticky.lightSwitch;
      return {
        ...sliderOverrides,
        Drawer: {
          color: isLight ? 'rgba(255,255,255,0.82)' : 'rgba(44,44,50,0.82)',
        },
      };
    },

    // The covers-per-row slider works in whole covers. Its range runs from however
    // many fit at the grid's default width up to however many fit across the
    // viewport (minus the page side padding the grid leaves around itself).
    // In list mode the slider sets the number of cards per row directly, so it runs
    // from a single full-width card up to however many cards fit at their minimum width.
    listMode: function() {
      return this.$store.state.sticky.gridDetailsMode === 'list';
    },
    coversPerRowMin: function() {
      if ( this.listMode ) return 1;
      const coverWidth = this.$store.state.gridCoverWidth || 1;
      return Math.max( 1, Math.floor( this.$store.state.gridDefaultMaxWidth / coverWidth ) );
    },
    coversPerRowMax: function() {
      if ( this.listMode ) {
        const coverSize = this.$store.state.sticky.coverSize || LIST_COVER_DEFAULT;
        const cardMin = coverSize + LIST_TEXT_MIN_WIDTH;
        return Math.max( 1, Math.floor( this.$store.state.gridAvailableWidth / cardMin ) );
      }
      const coverWidth = this.$store.state.gridCoverWidth || 1;
      return Math.max( this.coversPerRowMin, Math.floor( this.$store.state.gridAvailableWidth / coverWidth ) );
    },
    coversPerRowCurrent: function() {
      if ( this.listMode ) {
        return _.clamp( this.$store.state.sticky.gridListCols || LIST_DEFAULT_COLS, this.coversPerRowMin, this.coversPerRowMax );
      }
      const coverWidth = this.$store.state.gridCoverWidth || 1;
      const width = this.$store.state.sticky.gridMaxWidth || this.$store.state.gridDefaultMaxWidth;
      return _.clamp( Math.floor( width / coverWidth ), this.coversPerRowMin, this.coversPerRowMax );
    },

    // Cover size runs from the minimum usable size up to the max, in pixels.
    // The upper bound is also capped to the available container width so the cover
    // can never be set wider than what physically fits on screen.
    coverSizeMin: function() {
      return COVER_SIZE_MIN;
    },
    coverSizeMax: function() {
      const containerCap = this.$store.state.gridAvailableWidth;
      return containerCap ? Math.min( COVER_SIZE_MAX, Math.floor( containerCap ) ) : COVER_SIZE_MAX;
    },
    // The unset (default) cover size differs by layout: the plain grid falls back to the
    // full thumbnail, list cards fall back to the small list cover. The slider and readout
    // follow that so clearing the override shows the size the cover actually renders at.
    coverSizeDefault: function() {
      return this.listMode ? LIST_COVER_DEFAULT : COVER_SIZE_DEFAULT;
    },
    coverSizeCurrent: function() {
      return this.$store.state.sticky.coverSize || this.coverSizeDefault;
    },

    // Cover overlay buttons (sample, cloud player, open in app) are not usable
    // when covers are too small to interact with comfortably.
    coverButtonsDisabled: function() {
      return this.coverSizeCurrent < 110;
    },

    coversPerRowMarks: function() {
      return _.fromPairs( _.range( this.coversPerRowMin, this.coversPerRowMax + 1 ).map( i => [ i, '' ] ) );
    },

    // Snap points for the cover size slider: one per column count, from 1 cover filling
    // the full width down to however many fit at the minimum size. Each value is the
    // largest cover size that still lets exactly N covers fit side by side.
    // In list mode the full-width (N=1) step is skipped since list cards don't go full width.
    coverSizeSteps: function() {
      if ( !this.isMobile ) return null;
      const available = this.$store.state.gridAvailableWidth;
      if ( !available ) return null;
      const steps = [];
      let n = this.listMode ? 2 : 1;
      while ( true ) {
        const size = Math.floor( available / n );
        if ( size < COVER_SIZE_MIN ) break;
        steps.push( Math.min( size, COVER_SIZE_MAX ) );
        n++;
      }
      return steps.length ? steps : null;
    },

    coverSizeMarks: function() {
      if ( !this.coverSizeSteps ) return {};
      return _.fromPairs( this.coverSizeSteps.map( s => [ s, '' ] ) );
    },

  },

  methods: {

    onCoverSizeInput: function( value ) {
      if ( this.coverSizeSteps ) {
        value = _.minBy( this.coverSizeSteps, s => Math.abs( s - value ) );
      }
      this.setCoverSize( value );
      this.setDrawerPeek( true );
    },

    onCoversPerRowInput: function( value ) {
      this.setCoversPerRow( value );
      this.setDrawerPeek( true );
    },

    onSliderDragEnd: function() {
      this.setDrawerPeek( false );
    },

    setDrawerPeek: function( hidden ) {
      if ( hidden === this.$store.state.globalSettingsDrawerHidden ) return;
      this.$store.commit('prop', { key: 'globalSettingsDrawerHidden', value: hidden });
      document.body.classList.toggle('settings-drawer-peek-hidden', hidden);
    },

    setCoversPerRow: function( count ) {
      // List mode: the slider is a direct cards-per-row count. At the default count,
      // clear the override so it tracks the default again.
      if ( this.listMode ) {
        const value = count === LIST_DEFAULT_COLS ? null : count;
        this.$store.commit('stickyProp', { key: 'gridListCols', value: value });
      }
      // Grid mode: convert the whole-cover count to a max width. At the minimum
      // (default) count, clear the override so the grid returns to its CSS default.
      else if ( count <= this.coversPerRowMin ) {
        this.setGridWidth( null );
      }
      else {
        this.setGridWidth( count * this.$store.state.gridCoverWidth );
      }
    },

    resetCoversPerRow: function() {
      // List mode clears the cards-per-row override; grid mode clears the max width.
      if ( this.listMode ) {
        this.$store.commit('stickyProp', { key: 'gridListCols', value: null });
      }
      else {
        this.setGridWidth( null );
      }
    },

    setGridWidth: function( value ) {
      this.$store.commit('stickyProp', { key: 'gridMaxWidth', value: value });
    },

    setCoverSize: function( value ) {
      // Dragging to the layout's default size clears the override so the cover returns to
      // its CSS fallback (full thumbnail in the grid, small cover in list mode).
      if ( value === this.coverSizeDefault ) value = null;
      this.$store.commit('stickyProp', { key: 'coverSize', value: value });
    },

    toggleHaptics: function( e ) {
      this.$store.commit('stickyProp', { key: 'useHaptics', value: e.target.checked });
    },

    setDetailsMode: function( mode ) {
      if ( this.$store.state.sticky.gridDetailsMode === mode ) return;
      this.$store.commit('stickyProp', { key: 'gridDetailsMode', value: mode });
    },

    setTheme: function( light ) {

      const value = light ? 1 : 0;
      if ( this.$store.state.sticky.lightSwitch === value ) return;

      this.$store.commit('stickyProp', { key: 'lightSwitch', value: value });
      if ( !this.$store.state.sticky.lightSwitchSetByUser ) this.$store.commit('stickyProp', { key: 'lightSwitchSetByUser', value: true });

      const html = document.querySelector('html');
      html.classList.remove('theme-light');
      html.classList.remove('theme-dark');
      html.classList.add( !this.$store.state.sticky.lightSwitch ? 'theme-dark' : 'theme-light' );

    },

    setViewMode: function( mode ) {

      if ( this.$store.state.sticky.viewMode === mode ) return;
      this.$store.commit('stickyProp', { key: 'viewMode', value: mode });
      this.$updateQueries({ y: null, view: mode });

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
      const children = _.filter( [ ...this.bookCoverSettings, ...this.bookDetailSettings ], { parent: parentKey } );
      _.each(children, c => { c[propKey] = value; });
    },

  },

  watch: {
    coverSizeMax: function( max ) {
      const current = this.$store.state.sticky.coverSize;
      if ( current && current > max ) {
        const snapped = this.coverSizeSteps
          ? _.minBy( this.coverSizeSteps, s => Math.abs( s - current ) )
          : max;
        this.setCoverSize( snapped );
      }
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

// Fade the drawer while covers-per-row is dragged past the visible threshold.
// Opacity transitions in/out; the push (padding-right) on the app root is
// toggled without transition so the layout snaps immediately.
// Naive-ui renders the mask as position:absolute which only covers its container.
// Fix it to cover the full viewport.
.n-drawer-mask {
  position: fixed;
}

body.settings-drawer-peek-hidden .n-drawer {
  opacity: 0.9;
  transition: opacity 150ms ease;
}
body:not(.settings-drawer-peek-hidden) .n-drawer {
  opacity: 1;
  transition: opacity 250ms ease;
}
</style>

<style lang="scss" scoped>

// Drawer header: gear icon left of title + subtitle
.drawer-header-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.drawer-header-icon {
  font-size: 22px;
  flex-shrink: 0;
  opacity: 0.45;
}

.drawer-header-title {
  font-size: 1em;
  font-weight: 600;
}

.drawer-header-sub {
  font-size: 0.76em;
  opacity: 0.5;
  margin-top: 2px;
}

.global-settings {
  font-size: 14px;
  line-height: 1.4;
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

.setting-icon {
  flex-shrink: 0;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95em;
  @include themify($themes) {
    color: rgba(themed(frontColor), .45);
  }
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
  .theme-light & { color: rgba($lightFrontColor, .55); }
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
  .theme-light & { color: rgba($lightFrontColor, .5); }
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

// Segmented control: two labeled buttons for an either/or choice (theme, view mode).
// The active segment is highlighted so both options stay visible and named.
.segmented-row {
  cursor: default;
}

.segmented {
  flex-shrink: 0;
  display: flex;
  border-radius: 7px;
  overflow: hidden;
  @include themify($themes) {
    border: 1px solid rgba(themed(frontColor), .15);
  }

  button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    font-size: 0.78em;
    cursor: pointer;
    background: transparent;
    border: none;
    @include themify($themes) {
      color: rgba(themed(frontColor), .55);
      &:hover { background: rgba(themed(frontColor), .08); }
    }

    & + button {
      @include themify($themes) {
        border-left: 1px solid rgba(themed(frontColor), .15);
      }
    }

    &.active {
      @include themify($themes) {
        background: rgba(themed(frontColor), .16);
        color: rgba(themed(frontColor), .95);
      }
    }
  }
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

// Covers per row
.covers-per-row-row {
  cursor: default;
}

.covers-per-row-value {
  flex-shrink: 0;
  min-width: 32px;
  text-align: right;
  font-size: 0.85em;
  font-variant-numeric: tabular-nums;
  @include themify($themes) {
    color: rgba(themed(frontColor), .7);
  }
  &.auto {
    @include themify($themes) {
      color: rgba(themed(frontColor), .4);
    }
  }
}

.covers-per-row-auto {
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 0.75em;
  cursor: pointer;
  @include themify($themes) {
    background: rgba(themed(frontColor), .08);
    color: rgba(themed(frontColor), .7);
    border: 1px solid rgba(themed(frontColor), .15);
    &:hover { background: rgba(themed(frontColor), .14); }
  }
  &.active {
    @include themify($themes) {
      background: rgba(themed(frontColor), .18);
      color: rgba(themed(frontColor), .9);
    }
  }
}

.covers-per-row-slider {
  width: 100%;
  margin: 10px 0 2px;
}

// PWA install button
.pwa-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0 10px;
  .setting-label { flex: 1; }
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
