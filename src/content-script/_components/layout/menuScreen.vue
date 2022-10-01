<template>
<div>
  <div id="ale-menu-screen" v-if="!loading && extractSettings" :class="{ 'show-delete-btns': showDeleteBtns, 'show-partial-extraction': showPartialExtraction }">
    <b-collapse animation="slide" class="panel" :open="settingsOpen">
      <div class="extract-settings">
        <div class="settings-heading">
          <span class="title is-4">Extraction Settings</span>
        </div>
        
        <!-- <div style="font-size: 12px; line-height: 13px; margin: 6px 0 0 0; color: #888;">
          Previously extracted data is retained as long as you don't overwrite it with new data.
        </div> -->
        
        <b-field grouped group-multiline class="setting-checkboxes">
          <span v-for="( setting, index) in mainSteps" :key="setting.name" :class="{ 'partial-extraction': (hasData.books && setting.name == 'library') || (hasData.wishlist && setting.name === 'wishlist') || (hasData.isbn && setting.name === 'isbn') }">
            
            <b-field style="margin: 5px;" v-tippy="{ allowHTML: true, interactive: true }" :content="setting.cannotAccessTippy">
              <p class="control">
                <b-button size="is-default" :disabled="true" style="cursor: default;">
                  {{ ++index }}
                </b-button>  
              </p>
              <p class="control" v-tippy :content="setting.tippy">
                <b-button size="is-default" class="checkbox-btn">
                  <b-checkbox v-model="setting.value" :disabled="setting.disabled" :type="setting.type" @input="settingChanged($event, setting.name)" >
                    {{ setting.label }}
                  </b-checkbox>
                </b-button>  
              </p>
              <p class="control delete-btn" v-if="setting.trash" v-tippy :content="'Remove previously extracted data.' + ( setting.trashTippy ? '<br>' + setting.trashTippy : '' ) ">
                <b-button size="is-default" @click="deleteData( setting )" class="remove-individual-sections-icon">
                  <b-icon pack="far" icon="trash-alt" size="is-small"></b-icon>
                </b-button>  
              </p>
            </b-field>
            
          </span>
        </b-field>
          
        <b-checkbox v-model="saveStandaloneAfter.value" size="is-small" type="is-dark">
          {{ saveStandaloneAfter.label }}
        </b-checkbox>
        
        <b-message class="description">
          <!-- You can fetch <b-tag type="is-warning">collections</b-tag> and <b-tag type="is-warning">wishlist</b-tag> now and discard them later when saving the gallery as a stand-alone website. <b-tag type="is-warning">ISBNs</b-tag> are merged with the library books and can't be removed later, not that there should be any need to do that. -->
          
          <div class="linky-links">
            <b-button size="is-small" @click="unselectAll">unselect all</b-button>
            <b-button size="is-small" @click="selectAll">select all</b-button>
            <b-button size="is-small" @click="resetNewTitles" v-tippy="{ maxWidth: 400 }" content='<strong>Removes the status &#34;new&#34; from all extracted books.</strong> <br><br>During a partial library or wishlist extraction newly added books are marked and you can filter and sort based on that status in the gallery. <br><br><div style="color: #f14668;">The new status is only ever reset automatically when you clear library data or press this button.</div>'>reset new books</b-button>
            <b-button size="is-small" @click="exportRawData" :type="exportRawDataDisabled ? 'is-warning' : null" :disabled="exportRawDataDisabled">Export raw data</b-button>
            <b-button size="is-small">
              <label>
                Import raw data
                <input accept=".json" type="file" @change="importRawData" style="display:none">
              </label>
            </b-button>
            <b-button class="delete-btn" size="is-small" @click="clearStoredData">Remove all extracted data</b-button>
          </div>

        </b-message>
      </div>
    </b-collapse>
    
  
    <b-message v-if="dataVersionMismatch.length > 0" type="is-danger">
      You should <span class="init-show-detele-btns" @mouseover="showDeleteBtns = true" @mouseleave="showDeleteBtns = false">remove</span> <strong>{{ dataVersionMismatch.join(', ') }}</strong> data and re-extract to get the most out of the new version.
    </b-message>
    
    <b-message v-if="hasData.books || hasData.wishlist || hasData.isbn" type="is-info">
      <strong>Previously extracted data detected: <span style="color: #f7991c;">a faster <span v-tippy="{ allowHTML: true }" content="<div style='display: block; text-align: left;'><ol style='margin-left: 15px;'><li>Updates stored data that is likely to change</li><li>Does a full extract on newly added books</li><li>Clears data of removed books</li></ol><span style='display: inline-block; margin-top: 6px; color: #157df0;'>In the case of ISBN extraction, books that already have ISBNs are ignored. A large amount of books (+100) without the numbers will still take quite a while to extract.</span></div>" style="cursor: default; text-decoration: underline">partial extraction</span> is used</span> <span class="init-show-partial-extraction" style="color: #f7991c;" @mouseover="showPartialExtraction = true" @mouseleave="showPartialExtraction = false">where applicable.</span></strong> 
      <br>
      If you need to do a <span v-tippy="{ maxWidth: 310 }" content="The data structure may change from version to version, in which case a full extraction is needed or at least preferred. <br><br>You need to remove extracted data in order to do a full extraction." style="cursor: default; text-decoration: underline">full extraction</span>, you can remove stored data using <span class="init-show-detele-btns" @mouseover="showDeleteBtns = true" @mouseleave="showDeleteBtns = false">these buttons</span>.
    </b-message>
    
    <div>
      <div class="extract-wrapper">
        <div v-if="cannotAccessWishlist">
           <b-message type="is-warning">
            Try to open your
            <a @click="cannotAccessWishlist = false; extractionButtonDisabled = false;" target="_blank" rel="noopener noreferrer" :href="'https://audible'+ domainExtension +'/wishlist'">audible{{ domainExtension }}/wishlist</a> and login when asked. <br>
            After that try  to redo the extraction. <strong>The link will open in a new tab!</strong>
          </b-message>
        </div>
        <div v-else-if="extractBtnDisabled">
          <b-progress style="min-width: 288px;" size="is-large" type="is-warning" show-value>
            <small style="font-size: 12px;">Checking for wishlist access...</small>
          </b-progress>
        </div>
        <b-field class="extract-btn" v-show="!extractionButtonDisabled && !loading" v-else>
          <b-button @click="extract" type="is-info" class="extract control" expanded size="is-large" >
            Extract selected items
          </b-button>
          <div class="control">
            <b-button @click="extract" type="is-dark" icon-right="arrow-alt-circle-down" icon-pack="far" size="is-large" ></b-button>
          </div>
        </b-field>

        <b-field class="other-btns">
          <b-button
          tag="a"
          href="https://joonaspaakko.gitbook.io/audible-library-extractor/"
          target="_blank"
          class="control" size="is-small"
          icon-pack="fas" icon-right="share-square"
          >
            Documentation
          </b-button>
          <b-button
          :disabled="outputPageDisabled"
          @click="takeNextStep('output')"
          class="control" size="is-small"
          icon-pack="fas" icon-right="share-square"
          >
            Open gallery
          </b-button>
        </b-field>
      </div>
    </div>

    <b-button
    class="settings-btn"
    size="is-small"
    type="is-text"
    icon-left="code"
    icon-pack="fas"
    v-tippy="{ 
      allowHTML: true, 
      trigger: 'click',
      interactive: true,
    }"
    :content="getChangelog()"
    >
      Changelog
    </b-button>


    <div id="footer" class="is-small has-text-grey-light">
      Project source files in <a href="https://github.com/joonaspaakko/audible-library-extractor">Github</a>. <br />
      Post issues, questions, and suggestions at: <a href="https://github.com/joonaspaakko/audible-library-extractor/issues">Github issues</a>. <br>
      <br>
      
      <!-- <b-icon style="position: relative; top: -4px;"
        v-tippy content="It may take a few days for a new release to propagate from Github to Firefox and Chrome web store."
        icon-pack="fas"
        icon="question-circle"
        size="is-small">
      </b-icon> -->
      
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/joonaspaakko/audible-library-extractor/releases/latest" v-tippy content="It may take a few days for a new release to propagate from Github to Firefox and Chrome web store.">
        <img src="https://img.shields.io/github/v/release/joonaspaakko/audible-library-extractor?include_prereleases&label=latest%20release (Github)&color=6e41bf" alt="">
      </a>
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/joonaspaakko/audible-library-extractor/releases/latest">
        <img src="https://img.shields.io/github/release-date/joonaspaakko/audible-library-extractor?label=latest%20release&color=6e41bf" alt="">
      </a>
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/joonaspaakko/audible-library-extractor/labels/bug">
        <img src="https://img.shields.io/github/issues/joonaspaakko/audible-library-extractor/bug?label=known bugs&color=6e41bf" alt="">
      </a>

      <br>
      
      <a target="_blank" rel="noopener noreferrer" href="https://chrome.google.com/webstore/detail/audible-library-extractor/deifcolkciolkllaikijldnjeloeaall">
        <img src="https://img.shields.io/chrome-web-store/v/deifcolkciolkllaikijldnjeloeaall?color=2acb41&label=latest%20release (Chrome)" alt="">
      </a>
      <a target="_blank" rel="noopener noreferrer" href="https://addons.mozilla.org/en-US/firefox/addon/audible-library-extractor/">
        <img src="https://img.shields.io/amo/v/audible-library-extractor?label=latest%20release (Firefox)" alt="">
      </a>
      
      <div v-if="extensionVersion" style="margin-top: 10px;">
        <span style="border: 1px dashed #e1e1e1; padding: 10px 15px; display: inline-block;">
          You're currently using <strong>version {{ extensionVersion }}</strong>.
        </span>
      </div>
    </div>
  </div>
  <div v-else class="extraction-loading">
    <b-icon
      pack="fas"
      icon="sync-alt"
      custom-class="fa-spin">
    </b-icon>
  </div>
  
</div>
</template>

<script>
import Vue from "vue";

// FONTAWESOME
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faShareSquare,
  faSyncAlt,
  faTimes,
  faCog,
  faCode,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faArrowAltCircleDown, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
library.add(faShareSquare, faSyncAlt, faArrowAltCircleDown, faTimes, faCog, faTrashAlt, faCode, faQuestionCircle);
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
Vue.component("font-awesome", FontAwesomeIcon);

// VUE-TIPPY
import VueTippy, { TippyComponent } from "vue-tippy";
Vue.use(VueTippy, {
  arrow: true,
  placement: "top",
  trigger: "mouseenter focus",
  theme: "light-border",
  zIndex: 9999999991,
  delay: [500,0],
  a11y: false,
  maxWidth: 670,
  onShow: options => {
    return !!options.props.content;
  },
  boundary: "viewport",
  flipDuration: 0
});
Vue.component("tippy", TippyComponent);
import "tippy.js/themes/light-border.css";

import Buefy from "buefy";
import "buefy/dist/buefy.css";
Vue.use(Buefy, {
  defaultIconComponent: "font-awesome",
  defaultIconPack: "fas"
});

import helpers from "@contscript-mixins/misc/helpers.js";
import changelog from "@output-mixins/changelog.js";

export default {
  name: "menuScreen",
  props: ["storageHasData", "storageConfig", "domainExtension", "wishlistUrl", "dataVersion"],
  mixins: [ changelog, helpers ],
  data() {
    return {
      hasData: null,
      hasConfig: null,
      extractionButtonDisabled: false,
      outputPageDisabled: false,
      settingsOpen: true,
      extractSettings: null,
      loading: true,
      isFirefox: false,
      isChrome: false,
      releaseURL: '',
      showDeleteBtns: false,
      showPartialExtraction: false,
      exportRawDataDisabled: false,
      cannotAccessWishlist: false,
      extractBtnDisabled: false,
    };
  },
  
  computed: {
    
    dataVersionMismatch: function() {
      
      const extensionVersion = this.extensionVersion;
      const dataVersions = this.dataVersion;
      const hasData = this.hasData;
    
      let mismatch = [];
      const dataPoints = ['library', 'collections', 'wishlist'];
      
      _.each( dataPoints, function( key ) {
        
        const version = _.isObject( dataVersions ) ? dataVersions[ key ] : null;
        const keyHasData = !!hasData[ key === 'library' ? 'books' : key ];
        const noVersion = keyHasData && !version;
        const versionMismatch = keyHasData && (version !== extensionVersion && version !== '0.2.7' );
        if ( noVersion || versionMismatch ) mismatch.push( key );
        
      });
      
      return mismatch;
      
    },
    
    saveStandaloneAfter: function() {
      return _.find( this.extractSettings, { name: 'saveStandaloneAfter' });
    },
    
    mainSteps: function() {
      return _.filter(this.extractSettings, function(o) {
        return !o.extra;
      });
    },
    
    settingWishlist: function() {
      return _.find(this.extractSettings, { name: 'wishlist' });
    },
    
  },
  
  created: function() {
    
    this.hasData = this.storageHasData;
    this.hasConfig = this.storageConfig;
    this.updateSettings();
    
    this.checkBrowser();
    this.makeReleaseURLs();
    this.getCurrentVersion();
    
  },

  mounted: function() {
    
    const vue = this;    
    // Just to make sure that accidental clicks don't do anything when the overlay is opened
    // - If the button that opens the overlay was perfectly aligned with any of the buttons in this component, a double click would start doing things prematurely
    this.$nextTick(function() {
      
      // Updates default values from browser storage
      if ( this.hasConfig.steps) {
        _.each(this.extractSettings, function(step) {
          step.value = false; // Reset steps
        });
        _.each(this.hasConfig.steps, function(step) {
          let foundOriginalDolly = _.find(vue.extractSettings, { name: step.name });
          if ( foundOriginalDolly ) foundOriginalDolly.value = step.value;
        });
        
      }
      if ( this.hasConfig.extraSettings ) {
        _.each( this.hasConfig.extraSettings, function( setting ) {
          let original = _.find( vue.extractSettings, { name: setting.name });
          if ( original ) original.value = setting.value;
        });
      }
      
      this.updateSettings(function() {
        setTimeout(function() {
          vue.loading = false;          
        }, 100);
      });
      
    });

  },

  methods: {
    
    checkAccess: function( config ) {
      
      config = config || {};
      
      // Check if it's possible to read the wishlist page
      axios.get( config.to )
      .then(function() {
        if ( config.success ) config.success();
      }).catch(function() {
        if ( config.failed ) config.failed();
      }).then(function() {
        if ( config.finally ) config.finally();
      });
      
    },
    
    updateSettings: function( cllbck ) {
      
      this.outputPageDisabled = !(this.hasData.books || this.hasData.wishlist);
      
      let library = _.find( this.extractSettings, { name: 'library' });
      let collections = _.find( this.extractSettings, { name: 'collections' });
      let wishlist = _.find( this.extractSettings, { name: 'wishlist' });
      let isbn = _.find( this.extractSettings, { name: 'isbn' });
      let saveStandaloneAfter = _.find( this.extractSettings, { name: 'saveStandaloneAfter' });
      
      this.extractSettings = null;
      this.$nextTick(function() {
        
        let forceLibrary = _.get( collections, 'value' ) || _.get( isbn, 'value' );
        
        this.extractSettings = [
          {
            name: "library",
            value: forceLibrary,
            disabled: forceLibrary,
            label: "Library",
            type: "is-success",
            tippy: "Library is required in order to extract collections and isbn.",
            trash: this.hasData.books,
            trashTippy: 'This will also remove Collections and ISBN data.',
          },
          {
            name: "collections",
            value: _.get( collections, 'value' ),
            disabled: _.get( collections, 'disabled' ),
            label: "Collections",
            type: "is-info",
            tippy: "Super quick extraction that just needs to check the first <br>page of each collection to find out the title and description",
            trash: this.hasData.collections
          },
          {
            name: "wishlist",
            value: _.get( wishlist, 'value' ),
            disabled: _.get( wishlist, 'disabled' ),
            label: "Wishlist",
            type: "is-success",
            tippy: "Similar to library extraction but series order is not fetched. Books that also exist in your library are dropped <br>off as long as you also extract library data.",
            trash: this.hasData.wishlist,
            // cannotAccessTippy: this.cannotAccessWishlist ? '<a href="https://audible.com/login">audible.com/login</a>' : null,
          },
          {
            name: "isbn",
            value: _.get( isbn, 'value' ),
            disabled: _.get( isbn, 'disabled' ),
            label: "ISBN",
            type: "is-danger",
            tippy: "International Standard Book Numbers (ISBN) are required if you want to try importing your library to Goodreads. <br>ISBNs are fetched for library books and not for books in the wishlist. Very slow extraction.",
            trash: this.hasData.isbn
          },
          {
            extra: true,
            name: "saveStandaloneAfter",
            value: _.get( saveStandaloneAfter, 'value' ),
            label: "Start saving the standalone gallery immediately after extraction",
          }
        ];
        
        if ( !_.find(this.extractSettings, function( o ) { return o.value && !o.extra; }) ) {
          library = _.find( this.extractSettings, { name: 'library' });
          library.disabled = false;
          library.value = true;
        }
        
        if ( cllbck ) cllbck();
        
      });
    },
    
    checkISBNs: function( data ) {
      
      let foundISBNs = false;
      _.each( _.range( 0, data['books-chunk-length'] ), function( index ) {
        
        const booksChunk = data['books-chunk-'+index];
        const isbns = _.find( booksChunk, 'isbns' );
        if ( isbns ) {
          foundISBNs = true;
          return false;
        }
        
      });
      
      return foundISBNs;
      
    },
    
    updateViewData: function( data ) {
      
      
      const dataChunks = _.get(data, 'chunks', []);
      const storageHasData = dataChunks.length > 0;
      
      this.hasData = storageHasData ? ({ 
        books: dataChunks.indexOf('books') > -1, 
        isbn: dataChunks.indexOf('books') > -1 ? this.checkISBNs( data ) : false,
        wishlist: dataChunks.indexOf('wishlist') > -1,
        collections: dataChunks.indexOf('collections') > -1,
      }) : {};
      
      this.hasConfig = data.config || {};
      
      // Fixme: could've gotten rid of hasData, but didn't feel like cleaning up the code so I just added this so the code gets updated in the parent component.
      this.$emit('update:storageHasData', JSON.parse(JSON.stringify(this.hasData)));
      this.$emit('update:storageConfig', JSON.parse(JSON.stringify(this.hasConfig)));
      this.$emit('update:dataVersion', data.version);
      
      let vue = this;
      this.updateSettings(function() {
        setTimeout(function() {
          vue.loading = false;          
        }, 100);
      });
      
    },
    
    getCurrentVersion: function() {
      this.extensionVersion = browser.runtime.getManifest().version;
    },
    
    makeReleaseURLs: function() {
      this.releaseURL = this.isFirefox ? 'https://chrome.google.com/webstore/detail/audible-library-extractor/deifcolkciolkllaikijldnjeloeaall' : 'https://addons.mozilla.org/firefox/addon/audible-library-extractor/';
    },
    
    checkBrowser: function() {
      this.isFirefox = browser.runtime.getURL('').startsWith('moz-extension://');
      this.isChrome = browser.runtime.getURL('').startsWith('chrome-extension://');
    },
    
    unselectAll: function() {
      _.each( this.extractSettings, function( setting ) {
        if ( !setting.extra ) setting.value = false;
      });
      this.extractionButtonDisabled = true;
    },
    selectAll: function() {
      _.each( this.extractSettings, function( setting ) {
        if ( !setting.extra ) setting.value = true;
      });
      this.extractionButtonDisabled = false;
    },
    
    clearStoredData: function() {
      let vue = this;
      let confirmation = window.confirm('Are you sure you want to remove all extracted data?');
      if ( confirmation ) {
        let errorNotification = function() {
          vue.loading = false; 
          vue.$buefy.notification.open({
            duration: 4000,
            message: 'Data clear failed',
            type: 'is-danger',
            position: 'is-top',
            closable: false,
          });
        };
        
        browser.storage.local.clear().then(function() {
          browser.storage.local.get(null).then(data => {
            vue.updateViewData(data);
        
            vue.$buefy.notification.open({
              duration: 4000,
              message: 'Data removed succesfully',
              type: 'is-success',
              position: 'is-top',
              closable: false,
            });
            
          }).catch( errorNotification );
        }).catch( errorNotification );
      };
    },
    
    exportRawData: function() {
      let vue = this;
      
      vue.exportRawDataDisabled = true;
      browser.storage.local.get(null).then(data => {
        
        if ( data.chunks ) vue.glueFriesBackTogether( data );
        
        delete data.imageEditorPageTitle;
        delete data.imageEditorPageSubTitle;
        delete data.imageEditorTimeCode;
        delete data.imageEditorChunksLength;
        delete data.imageEditorChunks;
        
        saveAs(new Blob([JSON.stringify(data)], {type: "application/json;charset=utf-8"}), 'Audible Library Extractor Data.json');
        
        vue.exportRawDataDisabled = false;
        
        vue.$buefy.notification.open({
          duration: 4000,
          message: 'Data exported succesfully',
          type: 'is-success',
          position: 'is-top',
          closable: false,
        });
      
      }).catch(function( err ) {
        
        vue.exportRawDataDisabled = false;
        vue.$buefy.notification.open({
          duration: 4000,
          message: 'Data export failed. Reload the page and try again.',
          type: 'is-danger',
          position: 'is-top',
          closable: false,
        });
        
      });
    },
    
    importRawData: function( e ) {
      
      let vue = this;
      let file = e.target.files;
      if ( file ) file = file[0];
      
      vue.loading = true;
      
      if ( file ) {
        
        let errorNotification = function() {
            vue.loading = false; 
            vue.$buefy.notification.open({
              duration: 4000,
              message: 'Data import failed',
              type: 'is-danger',
              position: 'is-top',
              closable: false,
            });
        };
        
        let read = new FileReader();
        read.onload = function( e ) {
          
          let data = JSON.parse(e.target.result);
          vue.makeFrenchFries( data );
          
          browser.storage.local.clear().then(() => {
            browser.storage.local.set(data).then(function() {
              
              vue.$buefy.notification.open({
                duration: 4000,
                message: 'Data imported succesfully',
                type: 'is-success',
                position: 'is-top',
                closable: false,
              });
              
              vue.updateViewData( data );
              
            }).catch(errorNotification);
          }).catch(errorNotification);
          
        };
        read.onerror = errorNotification;
        read.readAsText(file);
      }
      else {
        vue.loading = false; 
      }
    },
    
    deleteData: function( setting ) {
      
      let vue = this;
      switch( setting.name ) {
        case 'library':
          vue.deleteChunkData(['books', 'series', 'collections']);
          break;
        case 'isbn':
          vue.deleteChunkData(['isbn']);
          break;
        default:
          vue.deleteChunkData([ setting.name ]);
          break;
      }
      
    },
    
    deleteChunkData: function( deleteArray, onSuccess ) {
      
      let vue = this; 
      vue.loading = true; 
      
      let keysString = deleteArray.join(', ').replace('books', 'library');
      let errorMsg = "Failed to remove data for: <strong>" + keysString + "</strong>";
      let successMsg = "Successfully removed data for: <strong>" + keysString + "</strong>";
      
      let errorNotification = function() {
        vue.loading = false; 
        vue.$buefy.notification.open({
          duration: 4000,
          message: errorMsg,
          type: 'is-danger',
          position: 'is-top',
          closable: false,
        });
      };
      
      browser.storage.local.get(null).then(data => {
        
        _.each( deleteArray, function( deleteKey ) {
          
          let realKey;
          if ( deleteKey === 'isbn' ) {
            deleteKey = 'books';
            realKey = 'isbn';
          }
          
          // REMOVE CHUNK ARRAYS
          _.each( _.range( 0, data[ deleteKey + '-chunk-length'] ), function( index ) { 
            if ( realKey === 'isbn' ) {
              _.each( data[ 'books-chunk-'+index ], function( book ) {
                if ( book.isbns ) delete book.isbns;
              });
            }
            else {
              delete data[ deleteKey + '-chunk-'+index ];
            }
          });
          
          if ( deleteKey !== 'books' || deleteKey === 'books' && realKey !== 'isbn' ) {
            // REMOVE CHUNK LENGTH
            delete data[deleteKey + '-chunk-length'];
            
            // REMOVE FROM CHUNKS ARRAY (basically array of data point keys)
            _.remove( data.chunks, function( value ) {
              return value === deleteKey;
            });
          }
          
          if ( deleteKey === 'books') {
            _.remove( data.chunks, function( value ) {
              return value === 'isbn';
            });
          }
          
          delete data.version[ deleteKey === 'books' ? 'library' : deleteKey ];
          
          if ( data.config && data.config.steps ) delete data.config.steps;
          
        });
        
        if ( data.chunks.length < 1 ) delete data.chunks;
        
        browser.storage.local.clear().then(() => {
          browser.storage.local.set(data).then(() => {
            
            if ( onSuccess ) onSuccess( data );
          
            vue.$buefy.notification.open({
              duration: 4000,
              message: successMsg,
              type: 'is-success',
              position: 'is-top',
              closable: false,
            });
            
            vue.updateViewData( data );
            
          }).catch( errorNotification );
        }).catch( errorNotification );
        
      }).catch( errorNotification );
      
    },
    
    partialExtraction: function( setting ) {
      
      const library = _.filter( this.extractSettings, { name: 'library' });
      
      this.takeNextStep('update', {
        steps: _.map( library, function(o) {
          return { name: o.name, value: o.value };
        })
      });
      
    },
    
    extract: function() {
      
      let vue = this;
      
      if ( this.settingWishlist.value ) {
        
        vue.extractBtnDisabled = true;
        vue.extractionButtonDisabled = true;
        
        // I don't know the full logic, but Audible tends to require a login to certain pages after you haven't in a while. 
        // I think it might just do that for any page you haven't visited after a while. The only evidence I have is that I visit
        // library very often but wishlist and other pages not so much and wishlist requires login way more often than my library.
        vue.checkAccess({
          to: vue.wishlistUrl,
          success: function( e ) {
            vue.takeNextStep('extract');
          },
          failed: function() {
            vue.cannotAccessWishlist = true;
          },
          finally: function() {
            vue.extractBtnDisabled = false;
          },
        });
      }
      else {
        vue.takeNextStep('extract');
      }
      
    },
    
    takeNextStep: function(step, config) {
      
      
      if ( !config ) {
        config = {
          steps: _.map( _.filter( this.extractSettings, function( o ) { return o.value && !o.extra }), function(o) {
            return { name: o.name, value: o.value };
          })
        };  
      }
      
      config.extraSettings = _.map( _.filter( this.extractSettings, 'extra'), function(o) {
        return { name: o.name, value: o.value, deactivated: false };
      });
      
      this.$root.$emit("do-next-step", {
        step: step,
        config: config
      });
      
    },

    settingChanged: function(inputValue, inputName) {
      
      let currentSetting = _.find(this.extractSettings, { name: inputName });
      let library = _.find(this.extractSettings, { name: 'library' });
      let collections = _.find(this.extractSettings, { name: 'collections' });
      let isbn = _.find(this.extractSettings, { name: 'isbn' });
      
      let collectionsOrIsbn = inputName === 'collections' || inputName === 'isbn';
      if ( collectionsOrIsbn ) {
        if ( inputValue && (!collections.value || !isbn.value) ) {
          library.value = true;
          library.disabled = true;
        }
        else if (  !inputValue && (!collections.value && !isbn.value) ) {
          library.disabled = false;
        }
      }
      
      this.extractionButtonDisabled = !_.find(this.extractSettings, { value: true });
      
    },
    
    resetNewTitles: function() {
      
      let confirmation = window.confirm('Are you sure you want to clear new book status?');
      if ( confirmation ) {
        
        let vue = this;
        let errorNotification = function() {
          vue.loading = false; 
          vue.$buefy.notification.open({
            duration: 4000,
            message: 'Failed to remove "new" status from books',
            type: 'is-danger',
            position: 'is-top',
            closable: false,
          });
        };
        
        browser.storage.local.get(null).then(data => {
          
          _.each( _.range( 0, data[ 'books-chunk-length'] ), function( index ) { 
            
            let booksChunk = data[ 'books-chunk-'+index ];
            _.each( booksChunk, function( book ) { if (book.isNew) delete book.isNew; });
            
          });
          
          _.each( _.range( 0, data[ 'wishlist-chunk-length'] ), function( index ) { 
            
            let wishlistChunk = data[ 'wishlist-chunk-'+index ];
            _.each( wishlistChunk, function( book ) { if (book.isNew) delete book.isNew; });
            
          });
          
          browser.storage.local.clear().then(() => {
            browser.storage.local.set(data).then(() => {
            
              vue.$buefy.notification.open({
                message: 'All "new" books succesfully reset',
                type: 'is-success',
                position: 'is-top',
                closable: false,
              });
              
            }).catch( errorNotification );
          }).catch( errorNotification );
          
        }).catch( errorNotification );
        
      }
      
    },
    
    getChangelog: function() {
      
      
      let changelogInnerHTML = '';
      
      _.each( this.changeLog, function( versionBlock ) {
        
        changelogInnerHTML += '<strong style="display: inline-block; width: 100%; font-size: 16px;">'+ versionBlock.version +'</strong>';
        changelogInnerHTML += versionBlock.highlights ? '<div style="padding: 6px; margin: 6px 0 7px; color: rgb(128 93 54); background: rgb(246, 153, 50, .06); border: 1px solid rgb(246, 153, 50, .2);">'+ versionBlock.highlights +'</div>' : '';
        changelogInnerHTML += '<ul class="changelog-list" style="display: inline-block; width: 100%; box-sizing: border-box;">';
        _.each( versionBlock.changes, function( change ) {
          if ( change.divider ) {
            changelogInnerHTML += '<li style="height: 0px; border: 1px dashed #f1f1f1; margin: 5px 0; width: 100%;"></li>';
          }
          else {
            let linkText;
            if ( change.link ) linkText = change.highlight ? ('<strong>' + change.link.text + '</strong>') : change.link.text;
            changelogInnerHTML += '<li class="'+ (change.class || '') +'">'+
              (change.link ? '<a target="_blank" rel="noopener noreferrer" href="'+ change.link.href +'">'+ linkText +'</a>: ' : '') + 
              (change.description || '')
            +'</li>';
          }
        });
        changelogInnerHTML += '</ul>';
        changelogInnerHTML += '<br><br>';
      });
      
      let changelogHTML = '<div style="text-align: left; max-height: 350px; overflow: scroll; padding: 20px;">'+ changelogInnerHTML +'</div>';
      return changelogHTML;
      
    },
    
  }
};
</script>

<style lang="scss">

body > .notices {
  z-index: 9999999999 !important;
}

#ale-menu-screen {
  max-width: 810px;
  margin: 0 auto;
  
  > .panel {
    box-shadow: none !important;
  }
  
  /* ----------------------------------------------
  * Generated by Animista on 2020-12-19 21:31:49
  * Licensed under FreeBSD License.
  * See http://animista.net/license for more info. 
  * w: http://animista.net, t: @cssanimista
  * ---------------------------------------------- */
  .fade-in {
    -webkit-animation: fade-in 0.3s cubic-bezier(0.39, 0.575, 0.565, 1) 0.25s
      both;
    animation: fade-in 0.3s cubic-bezier(0.39, 0.575, 0.565, 1) 0.25s both;
  }
  @-webkit-keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .has-text-grey-light {
    a {
      text-decoration: underline;
      color: #b5b5b5;
    }
    a:visited {
      color: darken(#b5b5b5, 10);
    }
  }

  .extract-wrapper {
    display: inline-block;
    margin: 35px auto 0;
    .field-body { width: 100%; }
  }

  .extract-btn {
    margin-bottom: 0px !important;
    display: inline-flex;
    width: 100%;
    button.extract {
      padding: 5px 15px 4px !important;
      border-radius: 4px 0 0 4px;
    }
  }

  .extract-settings {
    position: relative;
    z-index: 1;
    padding-top: 10px;
    margin: 20px auto 20px auto;
    border: 1px solid #e1e1e1;
    border-radius: 6px;

    span.check {
      top: -1px;
      position: relative;
    }

    .title {
      &.is-4 {
        margin-bottom: 2px;
      }
      &.is-6 {
        margin-bottom: 7px;
        color: #666;
      }
    }
    .field {
      justify-content: center;
    }
    .description {
      line-height: 22px;
      margin: 0;
      .message-body {
        // padding: 13px;
        padding: 5px;
        font-size: .9em;
        line-height: 1.2em;
        border: none !important;
      }
      &.darker-gray {
        border-radius: 0;
        background: rgba(#000, 0.1);
        border-color: rgba(#000, 0.12);
        border-style: solid;
        border-width: 2px;
        border-right: none;
        border-left: none;
        .media-content {
          color: rgba(#000, 0.57);
        }
      }
      .tag {
        background-color: #d5e9f8 !important;
        color: #1d72aa !important;
      }
    }

    .settings-heading {
      z-index: 2;
      position: absolute;
      left: 0;
      right: 0;
      top: -13px;
      font-size: 1.3em;
      span {
        display: inline-block;
        padding: 0 5px;
        background: #fff;
      }
    }

    .setting-checkboxes {
      padding: 6px;
      &, .field {
        margin: 0 !important;
      }
      span > .field {
        padding: 3px;
      }
      // margin-right: 46px;
      button {
        padding: 10px 12px 9px;
        font-size: 13.5px;
        line-height: 13.5px;
        // .b-checkbox { margin-top: 2px; }
        
        
      }
      button span {
        display: flex;
        justify-content: center;
        align-content: center;
        justify-items: center;
        align-content: center;
      }
      .checkbox-btn {
        padding: 0;
        .b-checkbox { 
          padding: 10px 12px 9px;
          margin: 0; 
          .control-label { margin-top: -1px; }
        }
      }
      
    }
  }

  .other-btns {
    margin: 6px auto 0;
    a,
    button {
      width: 100%;
      box-sizing: border-box;
      height: auto;
      padding-top: 9px;
      padding-bottom: 9px;
      flex-grow: 1;
    }
  }

  #footer {
    font-size: 0.9em;
    line-height: 1.3em;
    margin-top: 30px;
    padding-top: 20px;
    padding-bottom: 60px;
    a, img { display: inline-block; }
    &, * {
      transition: all 200ms ease;
      color: rgba(181, 181, 181, .5) !important;
    }
    img { opacity: .2; }
    &:hover {
      &, * {
        color: #717171 !important;
      }
      a {
        color: darken(#717171, 5) !important;
      }
      img { opacity: 1; }
    }
  }

  .settings-btn {
    margin-top: 25px;
    transition: all 180ms ease-out;
    &:focus {
      box-shadow: none !important;
    }
    &.open {
      background: #444;
      color: #fff;
      border-radius: 5px;
    }
  }
  
  .linky-links {
    // margin-bottom: 15px;
    font-size: 13px;
    span { 
      margin-left: 6px; &:first-child { margin-left: 0 }
    }
    .divider { color: #444; }
    a { color: #666; }
    button {
      label { cursor: pointer; }
      span { font-size: 11px !important; line-height: 11px !important; }
      height: auto !important;
    }
  }
  
  .remove-individual-sections-icon {
    // color: #959595;
    color: #666;
    svg {
      width: 14px;
    }
  } 
  
}

.udpate-tooltip {
  padding: 15px;
  
  ol, ul {
    padding-left: 15px;
    li { list-style: inside circle; }
  }
  ol > li { list-style: decimal; }
  
  code {
    padding: 4px;
    border: 1px solid darken( #f1f1f1, 5);
    background: rgba( #f1f1f1, .7);
  }
}

.changelog-list {
  li { position: relative; z-index: 1; }
  li:before {
    content: '';
    position: absolute;
    z-index: 4;
    top: 5px;
    height: 6px;
    width: 6px;
    left: -12px;
    display: none;
    border-radius: 9999999px;
    background: red;
  }
  li.fixed:before    { background: #f25954; display: block; }
  li.improved:before { background: #ba23ca; display: block; }
  li.added:before    { background: #10c064; display: block; }
}

.extraction-loading,
.extraction-loading .icon {
  font-size: 40px;
  color: #f79a32;
}

.show-partial-extraction .partial-extraction,
.show-delete-btns .delete-btn {
  position: relative;
  z-index: 0;
  &:before {
    content: '';
    position: absolute;
    z-index: 90;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(red, .1);
    outline: 1px solid rgba(red, .4);
  }
}

.init-show-partial-extraction,
.init-show-detele-btns {
  cursor: default;
  text-decoration: underline;
  // border: 1px solid rgba(#956d03, .2);
  // border-radius: 3px;
  // padding: 0px 3px;
}

.show-partial-extraction .partial-extraction:before {
  background: rgba(#47c78e, .25);
  outline: 2px solid rgba(#47c78e, .8);
  top: 5px;
  right: 5px;
  bottom: 5px;
  left: 5px;
}


.tippy-tooltip {
  box-shadow: 0 10px 25px rgba(#000, .15), 0 5px 10px rgba(#000, .4) !important;
}
.tippy-content {
  padding: 7px !important; 
}

</style>
