<template>
<n-config-provider :theme="lightTheme" :theme-overrides="themeOverrides" class="ale-launcher-provider">
<div class="ale-launcher-outer">
<div class="ale-launcher" :class="{ open: treeOpen, 'has-selection': !!selectionSummary }">

  <button ref="mainTrigger" class="ale-launcher-main" :disabled="store.extractionButtonDisabled" @click="extract">
    <ph-download-bold class="ale-launcher-main-icon" />
    <span class="ale-launcher-main-text">
      <span class="ale-launcher-label">{{ $store.getters.partialDataSettings_any ? 'Partial extract' : 'Extract' }}</span>
      <span class="ale-launcher-selection" v-if="selectionSummary">{{ selectionSummary }}</span>
    </span>
  </button>

  <n-popover
    trigger="manual"
    :show="treeOpen"
    @update:show="treeOpen = $event"
    placement="bottom-end"
    :show-arrow="false"
    style="padding: 0;"
  >
    <template #trigger>
      <button class="ale-launcher-menu-btn" @click="treeOpen = !treeOpen">
        <ph-sliders-bold />
      </button>
    </template>
    <div class="ale-launcher-menu">
      <div class="ale-launcher-tree-pane">
        <div class="ale-launcher-tree-heading">
          <div class="ale-launcher-tree-title">Data sources</div>
          <div class="ale-launcher-tree-subtitle">Choose what to extract from your library.</div>
        </div>
        <n-tree
          checkable
          check-on-click
          block-line
          show-line
          :cascade="false"
          check-strategy="all"
          :expanded-keys="allParentKeys"
          :data="treeOptions"
          :checked-keys="selectedKeys"
          :render-label="renderLabel"
          :render-suffix="renderSuffix"
          :node-props="nodeProps"
          class="ale-launcher-tree"
          @update:checked-keys="onUpdateValue"
        />
        <div class="ale-launcher-tree-toolbar">
          <button class="ale-launcher-tree-toolbar-btn" @click="selectAll">
            <ph-check-square-bold /> Select all
          </button>
          <button class="ale-launcher-tree-toolbar-btn" @click="unselectAll">
            <ph-square-bold /> Unselect all
          </button>
        </div>
      </div>
      <div class="ale-launcher-menu-divider"></div>
      <div class="ale-launcher-actions">
        <template v-for="action in actionOptions" :key="action.key">
          <button
            class="ale-launcher-action"
            :disabled="action.disabled"
            @click="handleMoreSelect( action.key )"
          >
            <component :is="action.icon" />
            <template v-if="action.key === 'toggleSlowExtract'">
              <span class="ale-launcher-action-label">Slow extraction</span>
              <div class="mini-switch" :class="{ on: store.sticky.slowExtract }"><div class="mini-switch-thumb"></div></div>
            </template>
            <template v-else-if="action.key === 'whatsNew'">
              <span class="ale-launcher-action-label">{{ action.label }}</span>
              <span class="ale-launcher-version-pill">v{{ $store.state.appVersion }}</span>
            </template>
            <span v-else class="ale-launcher-action-label">{{ action.label }}</span>
          </button>
          <div v-if="action.divider" class="ale-launcher-action-divider"></div>
        </template>
      </div>
    </div>
  </n-popover>

  <input ref="importFileInput" accept=".json" type="file" style="display: none" @change="importRawData">

  <n-modal
    v-model:show="showResetConfirm"
    preset="dialog"
    title="Reset new books"
    content="Are you sure you want to clear new book status on all extracted books?"
    positive-text="Reset"
    negative-text="Cancel"
    @positive-click="resetNewBooks"
  />

  <n-modal
    v-model:show="showRemoveAllConfirm"
    preset="dialog"
    title="Remove all extracted data"
    content="Clears all extracted data from storage without re-extracting. You can always extract again afterwards."
    positive-text="Remove"
    negative-text="Cancel"
    :positive-button-props="{ type: 'default' }"
    @positive-click="removeAllExtractedData"
  />

  <n-modal
    v-model:show="showFullExtractConfirm"
    preset="dialog"
    title="Full extraction"
    content="Deletes the data already stored for the selected items, then extracts everything from scratch instead of just the parts that changed."
    positive-text="Full extraction"
    negative-text="Cancel"
    :positive-button-props="{ type: 'default' }"
    @positive-click="extractFull"
  />

  <cont-changelog v-model:show="showWhatsNew" />

</div>
<span class="ale-launcher-menu-badge">{{ selectedCount }}/{{ settings.length }}</span>
</div>
</n-config-provider>
</template>

<script>
import { h } from 'vue';
import { NConfigProvider, NPopover, NTree, NPopconfirm, NTooltip, NModal, lightTheme } from 'naive-ui';
import message from '@contscript/naive-message.js';
import helpers from '@contscript-mixins/misc/content-script-helpers.js';
import { downloadBlob } from '@utils/download.js';
import IconTrash from '~icons/bi/trash3';
import IconInfo from '~icons/fa6-solid/circle-info';
import IconSpeedSlow from '~icons/mdi/speedometer-slow';
import IconRestore from '~icons/mdi/restore';
import IconPartialExtract from '~icons/ph/download-bold';
import IconExport from '~icons/mdi/tray-arrow-down';
import IconImport from '~icons/mdi/tray-arrow-up';
import IconDocs from '~icons/ri/external-link-line';
import IconGallery from '~icons/ri/external-link-line';
import IconWhatsNew from '~icons/ph/code-bold';
import IconFullExtract from '~icons/mdi/restart';

export default {
  name: 'aleLauncherButton',
  components: { NConfigProvider, NPopover, NTree, NPopconfirm, NTooltip, NModal },
  mixins: [ helpers ],

  data: function() {
    return {
      store: this.$store.state,
      exportRawDataDisabled: false,
      treeOpen: false,
      showResetConfirm: false,
      showRemoveAllConfirm: false,
      showFullExtractConfirm: false,
      showWhatsNew: false,
    };
  },

  computed: {

    settings: function() {
      return this.$store.getters.settings_mainSteps;
    },

    selectedKeys: function() {
      return _.map( _.filter( this.settings, 'value' ), 'name' );
    },

    selectedCount: function() {
      return _.filter( this.settings, 'value' ).length;
    },

    // Compact summary of the currently checked settings, shown inside the button in
    // place of the always-visible separate tag row. Truncates with an ellipsis via CSS.
    selectionSummary: function() {
      return _.map( _.filter( this.settings, 'value' ), 'label' ).join(', ');
    },

    // Settings with a `parent` nest under that parent's tree node; everything else
    // sits at the root, alongside its parent.
    treeOptions: function() {

      const toOption = ( setting ) => ({
        key: setting.name,
        label: setting.label,
        isLeaf: !_.some( this.settings, { parent: setting.name } ),
        _setting: setting,
      });

      const roots = _.reject( this.settings, 'parent' );

      return _.map( roots, ( setting ) => {
        const option = toOption( setting );
        const children = _.filter( this.settings, { parent: setting.name } );
        if ( children.length ) option.children = _.map( children, toOption );
        return option;
      });

    },

    // There's enough room to always show everything, so the tree never collapses -
    // every parent's key is passed as permanently "expanded" and the switcher icon is
    // hidden (see the template), removing the affordance to collapse at all.
    allParentKeys: function() {
      return _.map( _.reject( this.settings, 'parent' ), 'name' );
    },

    rawDataExport() {
      return !this.exportRawDataDisabled && this.$store.getters.mainDataExists;
    },

    themeOverrides: function() {
      return {
        common: {
          primaryColor: '#f79a1c',
          primaryColorHover: '#f8a93d',
          primaryColorPressed: '#dd860e',
        },
      };
    },

    actionOptions: function() {

      return [
        { label: 'Partial extraction', key: 'partialExtraction', icon: IconPartialExtract },
        { label: 'Full extraction', key: 'fullExtraction', icon: IconFullExtract, divider: true },
        { label: 'Slow extraction', key: 'toggleSlowExtract', icon: IconSpeedSlow },
        { label: 'Reset new books', key: 'resetNewBooks', disabled: !this.store.storageHasData.library, icon: IconRestore },
        { label: 'Remove all extracted data', key: 'removeAllExtractedData', icon: IconTrash, divider: true },
        { label: 'Export raw data', key: 'exportRawData', disabled: !this.rawDataExport, icon: IconExport },
        { label: 'Import raw data', key: 'importRawData', icon: IconImport, divider: true },
        { label: 'Documentation', key: 'documentation', icon: IconDocs },
        { label: 'Open gallery', key: 'openGallery', disabled: !this.$store.getters.mainDataExists, icon: IconGallery },
        { label: 'What’s new', key: 'whatsNew', icon: IconWhatsNew },
      ];

    },

  },

  methods: {

    renderLabel: function({ option }) {

      return h('div', { class: 'tree-option-label' }, [
        h('span', { class: 'tree-option-title' }, option.label),
      ]);

    },

    renderSuffix: function({ option }) {

      const setting = option._setting;
      const vue = this;

      const buttons = [];

      if ( setting.tippy ) {
        buttons.push( h(NTooltip, {
          trigger: 'click',
          placement: 'left',
        }, {
          trigger: () => h('button', {
            class: 'info-btn',
            onClick: ( e ) => e.stopPropagation(),
          }, h(IconInfo)),
          default: () => setting.tippy,
        }));
      }

      buttons.push( h(NPopconfirm, {
        onPositiveClick: () => vue.deleteChunkData( setting ),
      }, {
        trigger: () => h('button', {
          class: 'delete-btn',
          onClick: ( e ) => e.stopPropagation(),
        }, h(IconTrash)),
        default: () => `Delete "${ setting.label }" data?${ setting.trashTippy ? ' ' + setting.trashTippy : '' }`,
      }));

      if ( !buttons.length ) return null;

      return h('div', { class: 'tree-option-suffix' }, buttons );

    },

    nodeProps: function({ option }) {
      const setting = option._setting;
      const hasData = !!_.get( this.$store.state.storageHasData, setting.name );
      return hasData ? { class: 'partial-extraction' } : {};
    },

    onUpdateValue: function( keys ) {

      const newKeys = keys || [];
      const oldKeys = this.selectedKeys;

      const added = _.difference( newKeys, oldKeys );
      const removed = _.difference( oldKeys, newKeys );

      _.each( added, ( name ) => this.settingChanged( name, true ) );
      _.each( removed, ( name ) => this.settingChanged( name, false ) );

    },

    // Checking a child also checks its parent (a child is useless without its parent's data).
    // Checking a parent also checks all of its children, except ones flagged
    // excludeFromParentCascade (e.g. ISBN - slow and niche enough that checking
    // "Library" shouldn't silently opt people into it). Unchecking a parent unchecks
    // all of its children regardless, since their data depends on the parent's.
    settingChanged: function( settingName, checked ) {

      const setting = _.find( this.settings, { name: settingName } );
      if ( !setting ) return;

      const update = [{ item: setting, obj: { value: checked } }];
      let children = _.filter( this.settings, { parent: setting.name });
      if ( checked ) children = _.reject( children, 'excludeFromParentCascade' );

      if ( checked && setting.parent ) {

        const parent = _.find( this.settings, { name: setting.parent });
        if ( parent && !parent.value ) update.push({ item: parent, obj: { value: true } });

      }
      else if ( children.length ) {

        _.each( children, ( child ) => {
          if ( child.value !== checked ) update.push({ item: child, obj: { value: checked } });
        });

      }

      this.$store.commit('updateSetting', update);

    },

    deleteChunkData: function( setting ) {

      const vue = this;
      const deleteArray = _.castArray( setting.deleteChunks || [ setting.name ] );

      let keysString = deleteArray.join(', ');
      let errorMsg = "Failed to remove data for: " + keysString;
      let successMsg = "Successfully removed data for: " + keysString;

      let errorNotification = function( e ) {
        message.error( errorMsg + ' (' + e + ')' );
      };

      chrome.storage.local.get(['audibledata', 'metadata']).then(data => {

        const audibledata = data.audibledata || {};
        const metadata    = data.metadata || {};

        _.each( deleteArray, ( deleteKey ) => {

          if ( deleteKey === 'isbn' ) {
            // ISBNs are properties on book objects — strip them from every book in library chunks
            _.each( _.flatten( audibledata.library ), ( book ) => _.unset( book, 'isbns' ) );
            _.unset( metadata, 'version.library' );
          }
          else {
            _.unset( audibledata, deleteKey );
            _.unset( metadata, 'version.' + deleteKey );
          }

          if ( _.get( metadata, 'config.steps' ) ) _.unset( metadata, 'config.steps' );

        });

        chrome.storage.local.set({ audibledata, metadata }).then(() => {

          chrome.runtime.sendMessage({ action: "rebuild-context-menu" });
          message.success( successMsg );
          vue.$dataChecker( data );

        }).catch( errorNotification );

      }).catch( errorNotification );

    },

    extract: function() {
      this.treeOpen = false;
      this.$takeNextStep('extract');
    },

    extractFull: function() {

      const vue = this;

      chrome.storage.local.remove(['audibledata', 'metadata']).then(function() {
        chrome.storage.local.get(null).then(data => {

          vue.$dataChecker(data);
          chrome.runtime.sendMessage({ action: "rebuild-context-menu" });
          vue.treeOpen = false;
          vue.$takeNextStep('extract');

        });
      }).catch(function( e ) {
        message.error('Failed to clear existing data: ' + e);
      });

    },

    handleMoreSelect: function( key ) {

      if ( key === 'importRawData' ) {
        this.$refs.importFileInput.click();
        return;
      }

      // These open a confirmation/dialog modal instead of acting immediately.
      if ( key === 'resetNewBooks' ) { this.showResetConfirm = true; return; }
      if ( key === 'removeAllExtractedData' ) { this.showRemoveAllConfirm = true; return; }
      if ( key === 'fullExtraction' ) { this.showFullExtractConfirm = true; return; }
      if ( key === 'whatsNew' ) { this.showWhatsNew = true; return; }

      // Same action the main orange button performs - a convenience duplicate inside
      // the menu, since once someone's in here adjusting checkboxes the main button
      // sitting outside the popover is easy to lose track of.
      if ( key === 'partialExtraction' ) { this.extract(); return; }

      this[ key ]();

    },

    unselectAll: function() {

      const vue = this;

      _.each( this.settings, function( setting ) {
        vue.$store.commit('updateSetting', { item: setting, obj: { value: false } });
      });

      this.$store.commit('update', { key: 'extractionButtonDisabled', value: true });

    },

    selectAll: function() {

      const vue = this;

      _.each( this.settings, function( setting ) {
        vue.$store.commit('updateSetting', { item: setting, obj: { value: true } });
      });

      this.$store.commit('update', { key: 'extractionButtonDisabled', value: false });

    },

    toggleSlowExtract: function() {
      this.$store.commit('update', { key: 'sticky.slowExtract', value: !this.store.sticky.slowExtract });
    },

    resetNewBooks: function() {

      let errorNotification = function() {
        message.error('Failed to remove "new" status from books');
      };

      chrome.storage.local.get(['audibledata']).then(data => {

        const audibledata = data.audibledata || {};

        const stripIsNew = ( chunks ) => {
          _.each( _.flatten( chunks ), ( book ) => {
            _.unset( book, 'isNew' );
          });
        };

        stripIsNew( audibledata.library );
        stripIsNew( audibledata.wishlist );

        chrome.storage.local.set({ audibledata }).then(() => {

          message.success('All "new" books successfully reset');

        }).catch( errorNotification );

      }).catch( errorNotification );

    },

    exportRawData: function() {

      const vue = this;
      vue.exportRawDataDisabled = true;

      chrome.storage.local.get(['audibledata', 'metadata']).then(data => {

        vue.glueFriesBackTogether( data );

        downloadBlob( new Blob([JSON.stringify(data)], { type: "application/json;charset=utf-8" }), 'Audible Library Extractor Data.json' );

        vue.exportRawDataDisabled = false;
        message.success("Data exported successfully!");

      }).catch(function( err ) {

        console.error( err );

        vue.exportRawDataDisabled = false;
        message.error("Data export failed. Reload the page and try again.");

      });

    },

    importRawData: function( e ) {

      const vue = this;
      let file = e.target.files;
      if ( file ) file = file[0];

      // Importing the same file again is possible with this
      // It's a little silly, but from the users point of view it looks like something is broken otherwise...
      e.target.value = null;

      if ( file ) {

        let errorNotification = function( e ) {
          message.error("Data import failed: " + e);
        };

        let read = new FileReader();
        read.onload = function( e ) {

          let data = JSON.parse(e.target.result);
          vue.normalizeForMakeFrenchFries( data );
          if ( !data.audibledata ) vue.makeFrenchFries( data );

          chrome.storage.local.set({
            metadata: data.metadata,
            audibledata: data.audibledata,
          }).then(function() {

            chrome.runtime.sendMessage({ action: "rebuild-context-menu" });
            message.success("Data imported successfully!");
            vue.$dataChecker( data );

          }).catch(errorNotification);

        };
        read.onerror = errorNotification;
        read.readAsText(file);
      }

    },

    removeAllExtractedData: function() {

      const vue = this;

      let errorNotification = function( e ) {
        message.error('Data clear failed: ' + e);
      };

      chrome.storage.local.remove(['audibledata', 'metadata']).then(function() {
        chrome.storage.local.get(null).then(data => {

          vue.$dataChecker(data);
          chrome.runtime.sendMessage({ action: "rebuild-context-menu" });
          message.success('Data removed successfully');

        }).catch( errorNotification );
      }).catch( errorNotification );

    },

    documentation: function() {
      window.open('https://joonaspaakko.gitbook.io/audible-library-extractor/', '_blank');
    },

    openGallery: function() {
      this.$takeNextStep('output');
    },

  },

};
</script>

<style scoped lang="scss">

.ale-launcher-provider {
  display: inline-flex;
}

.ale-launcher-outer {
  position: relative;
  display: inline-flex;
}

.ale-launcher {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  width: 232px;
  height: 33px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%), 0 2px 10px rgb(0 0 0 / 10%);
  font-family: "Audible Sans", Arial, sans-serif;

  // Taller to fit the selection subtext line once any data source is checked.
  &.has-selection { height: 43px; }
}

.ale-launcher-main {
  display: inline-flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 0 8px 0 12px;
  border: none;
  background: #f7991c;
  color: #fff;
  cursor: pointer;

  &:hover { background: #f8a93d; }
  &:disabled { opacity: .6; cursor: default; }
}

.ale-launcher-main-icon {
  flex-shrink: 0;
  font-size: 15px;
  opacity: .85;
}

.ale-launcher-main-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.ale-launcher-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  font-weight: 900;
  font-size: 14px;
  line-height: 16px;
}

.ale-launcher-selection {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  opacity: .85;
}

.ale-launcher-menu-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 28px;
  border: none;
  border-left: 1px solid rgba(255, 255, 255, .25);
  background: #f7991c;
  color: #fff;
  font-size: 16px;
  cursor: pointer;

  &:hover { background: #f8a93d; }
}

// Sits in .ale-launcher-outer (not .ale-launcher itself, which clips via
// overflow:hidden for its own rounded corners) so it can overlap the button's
// outer edge like a typical notification badge instead of being clipped flush to it.
.ale-launcher-menu-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  padding: 0 4px;
  pointer-events: none;
  border-radius: 999px;
  background: #fff;
  color: #2a2a2a;
  font-weight: 700;
  font-size: 9px;
  line-height: 13px;
  white-space: nowrap;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .12), 0 1px 2px rgba(0, 0, 0, .15);
}

.ale-launcher-menu {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.ale-launcher-tree-pane {
  display: flex;
  flex-direction: column;
  width: 270px;
  padding: 15px;
}

.ale-launcher-tree-heading {
  flex-shrink: 0;
  padding-bottom: 8px;
}

.ale-launcher-tree-title {
  color: #2a2a2a;
  font-weight: 700;
  font-size: 13px;
}

.ale-launcher-tree-subtitle {
  margin-top: 2px;
  color: #888;
  font-size: 11px;
  line-height: 14px;
}

.ale-launcher-tree {
  max-height: 280px;
  overflow-y: auto;
}

.ale-launcher-tree-toolbar {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e1e1e1;
}

.ale-launcher-tree-toolbar-btn {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 8px;
  border: none;
  border-radius: 5px;
  background: rgba(0, 0, 0, .04);
  color: #2a2a2a;
  font-size: 12px;
  cursor: pointer;
  appearance: none;

  svg { width: 13px; height: 13px; color: #777; }

  &:hover { background: rgba(0, 0, 0, .08); }
}

.ale-launcher-menu-divider {
  flex-shrink: 0;
  width: 1px;
  background: #e1e1e1;
}

.ale-launcher-actions {
  display: flex;
  flex-direction: column;
  width: 200px;
  max-height: 386px;
  overflow-y: auto;
  padding: 4px;
}

.ale-launcher-action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border: none;
  border-radius: 5px;
  background: none;
  color: #2a2a2a;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  appearance: none;

  svg { flex-shrink: 0; width: 15px; height: 15px; color: #777; }

  &:hover:not(:disabled) { background: rgba(0, 0, 0, .05); }
  &:disabled { opacity: .4; cursor: default; }
}

.ale-launcher-action-label {
  flex: 1;
}

.ale-launcher-action-divider {
  height: 1px;
  margin: 4px 8px;
  background: #e1e1e1;
}

.ale-launcher-version-pill {
  flex-shrink: 0;
  padding: 2px 7px;
  border-radius: 999px;
  background: #ececec;
  color: #8a8a8a;
  font-size: 11px;
  line-height: 1.4;
}

</style>

<style lang="scss">

// naive-ui's floating layers (tree-select/dropdown/popover popups, popconfirm, the
// discrete message container) teleport to <body>, landing as siblings of the page's
// own content rather than inside the button. Without this they default to naive-ui's
// own z-index (~2000), which can sit behind other page elements. Match tippy's existing
// fix for the same problem.
.v-binder-follower-container,
.n-message-container,
.n-modal-container {
  z-index: 9999999990 !important;
}

// The tree never collapses (expanded-keys is locked to every parent key, see
// allParentKeys), but the switcher arrow is kept rather than hidden entirely - an
// empty slot there looked worse than a static, inert arrow. pointer-events: none
// keeps it visually present without suggesting it's still clickable.
.ale-launcher-tree .n-tree-node-switcher {
  pointer-events: none;
}

.tree-option-label {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 2px 0;
}

.tree-option-title {
  font-size: 14px;
}

.tree-option-suffix {
  display: flex;
  align-items: center;
  gap: 2px;
}

.info-btn,
.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: 2px;
  padding: 0;
  border: none;
  border-radius: 5px;
  background: none;
  color: #c2c2c2;
  cursor: pointer;
  appearance: none;

  svg { width: 14px; height: 14px; }
}

.info-btn:hover {
  background: rgba(0, 0, 0, .06);
  color: #666;
}

.delete-btn:hover {
  background: rgba(red, .08);
  color: red;
}

.mini-switch {
  position: relative;
  flex-shrink: 0;
  width: 28px;
  height: 16px;
  border-radius: 999px;
  background: rgba(0, 0, 0, .15);
  transition: background 150ms ease;

  &.on {
    background: #f79a1c;
  }
}

.mini-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transition: transform 150ms ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .3);

  .mini-switch.on & {
    transform: translateX(12px);
  }
}

</style>
