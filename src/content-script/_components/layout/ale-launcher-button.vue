<template>
<n-config-provider :theme="lightTheme" :theme-overrides="themeOverrides" class="ale-launcher-provider">
<div class="ale-launcher-outer">
<div class="ale-launcher" :class="{ open: treeOpen }">

  <n-popover
    trigger="manual"
    :show="treeOpen"
    @update:show="treeOpen = $event"
    :on-clickoutside="handleTreeClickOutside"
    placement="bottom-end"
    :show-arrow="false"
    style="padding: 0;"
  >
    <template #trigger>
      <button ref="mainTrigger" class="ale-launcher-main" :disabled="store.extractionButtonDisabled" @click="treeOpen = !treeOpen">
        <svg class="ale-launcher-mark" viewBox="0 0 151.5 93.7">
          <path d="M75.8 80.7l75.7-47.2v12.8L75.8 93.7 0 46.3V33.5l75.8 47.2z"/>
          <path d="M75.8 21.5a48.17 48.17 0 0 0-40.7 21.9 12.94 12.94 0 0 1 1.8-1.6c21.3-17.7 52-13.7 68.7 8.6l11.1-7.1a49.82 49.82 0 0 0-40.9-21.8"/>
          <path d="M75.8 43.4a27.72 27.72 0 0 0-22.4 11.5 22.7 22.7 0 0 1 13.5-4.4c8.2 0 15.5 4.2 20.4 11.3l10.6-6.6a25.79 25.79 0 0 0-22.1-11.8M24.6 24.2C55.8-.4 99.9 6.3 123.4 39l.2.2 11.5-7.1a70.82 70.82 0 0 0-118.6 0 60.63 60.63 0 0 1 8.1-7.9"/>
        </svg>
        <span class="ale-launcher-label">Audible Library Extractor</span>
      </button>
    </template>
    <div class="ale-launcher-menu">
      <div class="ale-launcher-tree-pane">
        <div class="ale-launcher-tree-heading">
          <div class="ale-launcher-tree-subtitle">Choose what to extract:</div>
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
        <div class="ale-launcher-extract-actions">
          <template v-if="$store.getters.partialDataSettings_any">
            <button class="ale-launcher-extract-primary" @click="extract">
              <ph-lightning-bold /> Quick extraction
            </button>
            <button class="ale-launcher-extract-secondary" @click="handleMoreSelect('fullExtraction')">
              <ph-cloud-arrow-down-bold /> Full extraction
            </button>
          </template>
          <button v-else class="ale-launcher-extract-primary" @click="handleMoreSelect('fullExtraction')">
            <ph-cloud-arrow-down-bold /> Full extraction
          </button>
        </div>
        <div class="ale-launcher-utility-actions">
          <n-popover
            trigger="manual"
            :show="moreOpen"
            @update:show="moreOpen = $event"
            :on-clickoutside="handleMoreClickOutside"
            placement="right-end"
            :flip="true"
            :show-arrow="false"
            style="padding: 0;"
          >
            <template #trigger>
              <button class="ale-launcher-more-btn" @click="moreOpen = !moreOpen">
                <ph-sliders-bold /> Options & tools
              </button>
            </template>
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
          </n-popover>
          <button v-if="$store.getters.mainDataExists" class="ale-launcher-gallery-link" @click="openGallery">
            Open gallery
          </button>
        </div>
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
    title="Remove all data"
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
import IconExport from '~icons/mdi/tray-arrow-down';
import IconImport from '~icons/mdi/tray-arrow-up';
import IconDocs from '~icons/ri/external-link-line';
import IconWhatsNew from '~icons/ph/code-bold';

export default {
  name: 'aleLauncherButton',
  components: { NConfigProvider, NPopover, NTree, NPopconfirm, NTooltip, NModal },
  mixins: [ helpers ],

  data: function() {
    return {
      store: this.$store.state,
      exportRawDataDisabled: false,
      treeOpen: false,
      moreOpen: false,
      showResetConfirm: false,
      showRemoveAllConfirm: false,
      showFullExtractConfirm: false,
      showWhatsNew: false,
    };
  },

  mounted: function() {
    document.addEventListener( 'keydown', this.handleEscKey );
  },

  unmounted: function() {
    document.removeEventListener( 'keydown', this.handleEscKey );
  },

  computed: {

    settings: function() {
      return this.$store.getters.settings_mainSteps;
    },

    selectedKeys: function() {
      return _.map( _.filter( this.settings, 'value' ), 'name' );
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
        { label: 'Slow extraction', key: 'toggleSlowExtract', icon: IconSpeedSlow },
        { label: 'Reset new books', key: 'resetNewBooks', disabled: !this.store.storageHasData.library, icon: IconRestore },
        { label: 'Remove all extracted data', key: 'removeAllExtractedData', icon: IconTrash, divider: true },
        { label: 'Export raw data', key: 'exportRawData', disabled: !this.rawDataExport, icon: IconExport },
        { label: 'Import raw data', key: 'importRawData', icon: IconImport, divider: true },
        { label: 'Documentation', key: 'documentation', icon: IconDocs },
        { label: 'What’s new', key: 'whatsNew', icon: IconWhatsNew },
      ];

    },

  },

  methods: {

    // naive-ui's clickoutside check only looks at the popover's own DOM node, so a
    // click landing in a nested popover/popconfirm/tooltip/modal (the per-row delete
    // button, its info tooltip, the "more" menu, the what's new dialog) reads as
    // "outside" since those float as separate elements teleported to <body>. Without
    // this, clicking their content closes the whole tree popover before the nested one
    // can register the click. And while any of those overlays are open, an outside
    // click should only close that overlay, never cascade into closing this whole tree
    // popover underneath it - so the click needs a full "anything else open" bail-out,
    // not just a same-click DOM-containment check.
    handleTreeClickOutside: function( e ) {
      if ( e.target.closest('.n-popover, .n-popover-shared, .n-modal-container') ) return;
      if ( this.moreOpen || this.showWhatsNew || this.showResetConfirm || this.showRemoveAllConfirm || this.showFullExtractConfirm ) return;
      // The main trigger button owns its own open/close toggle via @click - letting
      // this handler also react to the same click would race with that toggle and
      // immediately reopen what the click just closed.
      if ( e.target.closest('.ale-launcher-main') ) return;
      this.treeOpen = false;
    },

    // Same reasoning as handleTreeClickOutside: the what's new modal opens from a menu
    // item inside this popover, so a click inside it must not count as "outside" this
    // menu, otherwise opening what's new immediately closes the menu underneath it.
    // The "more" trigger button also owns its own toggle via @click, so it's excluded
    // here too, otherwise clicking it again to close would race with this handler and
    // flicker back open.
    handleMoreClickOutside: function( e ) {
      if ( e.target.closest('.n-modal-container') ) return;
      if ( e.target.closest('.ale-launcher-more-btn') ) return;
      this.moreOpen = false;
    },

    // A DOM-bubbling @keydown.esc on the tree's own content wouldn't reliably catch
    // Escape pressed while focus sits inside a nested popover/modal, since those
    // teleport to <body> as siblings rather than DOM descendants. A single
    // document-level listener with the same "topmost overlay only" precedence as the
    // clickoutside handlers above avoids that, and avoids Escape cascading down to
    // close everything at once.
    handleEscKey: function( e ) {
      if ( e.key !== 'Escape' ) return;
      if ( this.showWhatsNew ) { this.showWhatsNew = false; return; }
      if ( this.showResetConfirm ) { this.showResetConfirm = false; return; }
      if ( this.showRemoveAllConfirm ) { this.showRemoveAllConfirm = false; return; }
      if ( this.showFullExtractConfirm ) { this.showFullExtractConfirm = false; return; }
      if ( this.moreOpen ) { this.moreOpen = false; return; }
      if ( this.treeOpen ) { this.treeOpen = false; return; }
    },

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

      // Nothing to delete if this setting has no stored data yet.
      const hasData = !!_.get( this.$store.state.storageHasData, setting.name );
      if ( hasData ) {
        buttons.push( h(NPopconfirm, {
          onPositiveClick: () => vue.deleteChunkData( setting ),
        }, {
          trigger: () => h('button', {
            class: 'delete-btn',
            onClick: ( e ) => e.stopPropagation(),
          }, h(IconTrash)),
          default: () => `Delete "${ setting.label }" data?${ setting.trashTippy ? ' ' + setting.trashTippy : '' }`,
        }));
      }

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

      // Same as checking "Library" directly: settings flagged excludeFromParentCascade
      // (ISBN, for instance) are niche/slow enough that "select all" shouldn't silently
      // opt people into them. Still checkable manually.
      _.each( this.settings, function( setting ) {
        if ( setting.excludeFromParentCascade ) return;
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
      chrome.runtime.sendMessage({ action: "openGallery" });
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
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%), 0 2px 10px rgb(0 0 0 / 10%);
  font-family: "Audible Sans", Arial, sans-serif;
}

.ale-launcher-main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 33px;
  padding: 0 12px;
  border: none;
  background: linear-gradient(135deg, #f9a13c, #f0790a);
  color: #fff;
  cursor: pointer;

  &:hover { background: linear-gradient(135deg, #fab158, #f28a26); }
  &:disabled { opacity: .6; cursor: default; }
}

.ale-launcher-mark {
  flex-shrink: 0;
  width: 14px;
  height: auto;
  fill: #fff;
  opacity: .9;
}

.ale-launcher-label {
  white-space: nowrap;
  font-weight: 800;
  font-size: 12.5px;
}

.ale-launcher-menu {
  display: flex;
}

.ale-launcher-tree-pane {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 310px;
  padding: 20px;
}

.ale-launcher-tree-heading {
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
  padding-bottom: 12px;
  padding-top: 3px;
}

.ale-launcher-tree-subtitle {
  color: #2a2a2a;
  font-weight: 700;
  font-size: 13.5px;
  line-height: 17px;
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

.ale-launcher-extract-actions {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 6px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e1e1e1;
}

.ale-launcher-extract-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 10px;
  border: none;
  border-radius: 6px;
  background: #f7991c;
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  appearance: none;

  svg { width: 14px; height: 14px; }

  &:hover { background: #f8a93d; }
}

.ale-launcher-extract-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 7px 10px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 0, 0, .045);
  color: #2a2a2a;
  font-size: 12.5px;
  cursor: pointer;
  appearance: none;

  svg { width: 13px; height: 13px; color: #777; }

  &:hover { background: rgba(0, 0, 0, .09); }
}

.ale-launcher-gallery-link {
  margin-top: 10px;
  padding: 4px;
  border: none;
  background: none;
  color: #999;
  font-size: 11.5px;
  text-align: center;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  appearance: none;

  &:hover { color: #666; }
}

.ale-launcher-utility-actions {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e1e1e1;
}

.ale-launcher-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid rgba(247, 153, 28, .4);
  border-radius: 6px;
  background: none;
  color: #dd860e;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  appearance: none;

  svg { width: 13px; height: 13px; }

  &:hover { background: rgba(247, 153, 28, .08); border-color: rgba(247, 153, 28, .7); }
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
