<template>
<n-config-provider :theme="lightTheme" :theme-overrides="themeOverrides" class="extraction-settings-provider">
<div class="settings-wrapper">

  <div class="settings-heading">
    <div class="settings-heading-text">
      <span class="settings-title">Extraction Settings</span>
      <span class="settings-subtitle">Choose what to extract, then hit "Extract" below.</span>
    </div>

    <n-dropdown trigger="click" placement="bottom-end" :options="moreOptions" @select="handleMoreSelect">
      <n-button quaternary circle class="more-btn">
        <template #icon><ph-dots-three-bold /></template>
      </n-button>
    </n-dropdown>
  </div>

  <n-tree-select
    multiple
    checkable
    :cascade="false"
    check-strategy="all"
    :default-expanded-keys="defaultExpandedKeys"
    :options="treeOptions"
    :value="selectedKeys"
    :render-label="renderLabel"
    :render-suffix="renderSuffix"
    :node-props="nodeProps"
    placeholder="No settings selected"
    @update:value="onUpdateValue"
  />

  <n-button-group class="extract-btn-group">
    <n-button type="primary" size="large" :disabled="store.extractionButtonDisabled || loading" class="extract-btn" @click="extract">
      {{ $store.getters.partialDataSettings_any ? 'Partial extract' : 'Extract' }}
      <template #icon><ph-arrow-circle-right-bold/></template>
    </n-button>
    <n-popconfirm v-if="$store.getters.partialDataSettings_any" placement="top-end" positive-text="Start extraction" @positive-click="extractFull">
      <template #trigger>
        <n-button type="primary" size="large" :disabled="store.extractionButtonDisabled || loading" class="extract-caret-btn">
          <template #icon><ph-caret-down-bold/></template>
        </n-button>
      </template>
      <div class="full-extraction-confirm">
        <strong>Full extraction</strong>
        <p>Deletes the data already stored for the selected items, then extracts everything from scratch instead of just the parts that changed.</p>
      </div>
    </n-popconfirm>
  </n-button-group>

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
    type="error"
    title="Remove all extracted data"
    content="Are you sure you want to remove all extracted data? This can't be undone."
    positive-text="Remove"
    negative-text="Cancel"
    @positive-click="removeAllExtractedData"
  />

  <cont-changelog v-model:show="showWhatsNew" />

</div>
</n-config-provider>
</template>

<script>
import { h } from 'vue';
import { NConfigProvider, NTreeSelect, NPopconfirm, NButton, NButtonGroup, NDropdown, NModal, lightTheme } from 'naive-ui';
import message from '@contscript/naive-message.js';
import helpers from '@contscript-mixins/misc/content-script-helpers.js';
import { downloadBlob } from '@utils/download.js';
import IconTrash from '~icons/bi/trash3';
import IconCheckAll from '~icons/mdi/checkbox-multiple-marked-outline';
import IconUncheckAll from '~icons/mdi/checkbox-multiple-blank-outline';
import IconSpeedSlow from '~icons/mdi/speedometer-slow';
import IconRestore from '~icons/mdi/restore';
import IconExport from '~icons/mdi/tray-arrow-down';
import IconImport from '~icons/mdi/tray-arrow-up';
import IconDocs from '~icons/ri/external-link-line';
import IconGallery from '~icons/ri/external-link-line';
import IconWhatsNew from '~icons/ph/code-bold';

export default {
  name: 'contExtractionSettings',
  components: { NConfigProvider, NTreeSelect, NButton, NButtonGroup, NDropdown, NPopconfirm, NModal },
  mixins: [ helpers ],

  data: function() {
    return {
      store: this.$store.state,
      loading: false,
      exportRawDataDisabled: false,
      showResetConfirm: false,
      showRemoveAllConfirm: false,
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

    // Settings with a `parent` nest under that parent's tree node (collapsed by default);
    // everything else sits at the root, alongside its now-expandable parent.
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

    // Nested groups start collapsed; only a group containing a currently-checked
    // child auto-expands so the user can see what's checked without hunting for it.
    defaultExpandedKeys: function() {
      const checkedWithParent = _.filter( this.settings, ( setting ) => setting.parent && setting.value );
      return _.uniq( _.map( checkedWithParent, 'parent' ) );
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

    moreOptions: function() {

      return [
        { label: 'Unselect all', key: 'unselectAll', icon: () => h(IconUncheckAll) },
        { label: 'Select all', key: 'selectAll', icon: () => h(IconCheckAll) },
        {
          label: () => h('div', { class: 'dropdown-toggle-row' }, [
            h('span', 'Slow extraction'),
            h('div', { class: ['mini-switch', { on: this.store.sticky.slowExtract }] }, h('div', { class: 'mini-switch-thumb' })),
          ]),
          key: 'toggleSlowExtract',
          icon: () => h(IconSpeedSlow),
        },
        { type: 'divider', key: 'd1' },
        { label: 'Reset new books', key: 'resetNewBooks', disabled: !this.store.storageHasData.library, icon: () => h(IconRestore) },
        { label: 'Export raw data', key: 'exportRawData', disabled: !this.rawDataExport, icon: () => h(IconExport) },
        { label: 'Import raw data', key: 'importRawData', icon: () => h(IconImport) },
        { label: 'Remove all extracted data', key: 'removeAllExtractedData', icon: () => h(IconTrash) },
        { type: 'divider', key: 'd2' },
        { label: 'Documentation', key: 'documentation', icon: () => h(IconDocs) },
        { label: 'Open gallery', key: 'openGallery', disabled: !this.$store.getters.mainDataExists, icon: () => h(IconGallery) },
        { label: 'What’s new', key: 'whatsNew', icon: () => h(IconWhatsNew) },
      ];

    },

  },

  methods: {

    renderLabel: function({ option }) {

      const setting = option._setting;

      const labelNode = h('div', { class: 'tree-option-label' }, [
        h('span', { class: 'tree-option-title' }, option.label),
        setting.tippy ? h('span', { class: 'tree-option-subtext' }, setting.tippy) : null,
      ]);

      return labelNode;

    },

    renderSuffix: function({ option }) {

      const setting = option._setting;
      const hasData = !!_.get( this.$store.state.storageHasData, setting.name );
      if ( !hasData ) return null;

      const vue = this;

      return h(NPopconfirm, {
        onPositiveClick: () => vue.deleteChunkData( setting ),
      }, {
        trigger: () => h('button', {
          class: 'delete-btn',
          onClick: ( e ) => e.stopPropagation(),
        }, h(IconTrash)),
        default: () => `Delete "${ setting.label }" data?${ setting.trashTippy ? ' ' + setting.trashTippy : '' }`,
      });

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
    // Unchecking a parent also unchecks all of its children (their data depends on the parent's).
    settingChanged: function( settingName, checked ) {

      const setting = _.find( this.settings, { name: settingName } );
      if ( !setting ) return;

      const update = [{ item: setting, obj: { value: checked } }];

      if ( checked && setting.parent ) {

        const parent = _.find( this.settings, { name: setting.parent });
        if ( parent && !parent.value ) update.push({ item: parent, obj: { value: true } });

      }
      else if ( !checked ) {

        const children = _.filter( this.settings, { parent: setting.name });
        _.each( children, ( child ) => {
          if ( child.value ) update.push({ item: child, obj: { value: false } });
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
      this.$emit('extract');
    },

    extractFull: function() {

      const vue = this;

      chrome.storage.local.remove(['audibledata', 'metadata']).then(function() {
        chrome.storage.local.get(null).then(data => {

          vue.$dataChecker(data);
          chrome.runtime.sendMessage({ action: "rebuild-context-menu" });
          vue.$emit('extract');

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

      // These open a confirmation/dialog modal instead of acting immediately - a dropdown
      // closes on item-click before a nested popconfirm could ever open, so the modal is
      // shown after the dropdown closes instead.
      if ( key === 'resetNewBooks' ) { this.showResetConfirm = true; return; }
      if ( key === 'removeAllExtractedData' ) { this.showRemoveAllConfirm = true; return; }
      if ( key === 'whatsNew' ) { this.showWhatsNew = true; return; }

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
      this.$emit('open-gallery');
    },

  },

};
</script>

<style scoped lang="scss">

.settings-wrapper {
  max-width: 480px;
  margin: 0 auto 20px;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  background: #fff;
  padding: 14px;
}

.settings-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.settings-heading-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2a2a2a;
}

.settings-subtitle {
  font-size: 0.8rem;
  color: #999;
}

.more-btn {
  flex-shrink: 0;
  margin-top: -4px;
}

.extract-btn-group {
  display: flex;
  width: 100%;
  margin-top: 16px;
}

.extract-btn {
  flex: 1;
}

.extract-caret-btn {
  flex-shrink: 0;
  padding: 0 12px !important;
}

.full-extraction-confirm {
  max-width: 280px;
  p { margin: 6px 0 0; font-size: 0.85em; color: #666; line-height: 1.4; }
}

</style>

<style lang="scss">

.tree-option-label {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 2px 0;
}

.tree-option-title {
  font-size: 14px;
}

.tree-option-subtext {
  font-size: 12px;
  line-height: 1.35;
  color: #999;
}

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

  &:hover {
    background: rgba(red, .08);
    color: red;
  }

  svg { width: 14px; height: 14px; }
}

.dropdown-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
