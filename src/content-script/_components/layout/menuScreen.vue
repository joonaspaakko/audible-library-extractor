<template>
<div>
  <div id="ale-menu-screen" v-if="!loading && extractSettings">
    <b-collapse animation="slide" class="panel" :open="settingsOpen">
      <div class="extract-settings">
        <div class="settings-heading">
          <span class="title is-4">Extraction Settings</span>
        </div>
        
        <div style="font-size: 12px; line-height: 13px; margin: 6px 0 0 0; color: #888;">
          Previously extracted data is retained as long as you don't overwrite it with new data.
        </div>
        
        <b-field grouped group-multiline class="setting-checkboxes">
          <span v-for="( setting, index) in mainSteps" :key="setting.name">
            
            <b-field style="margin: 5px;">
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
              <p class="control" v-if="setting.update && setting.trash" v-tippy="{ placement: 'top', flipBehavior: ['top', 'right', 'left', 'bottom'] }" :content="setting.updateTippy">
                <b-button type="is-warning" size="is-default" @click="partialExtraction( setting )">
                  <b-icon pack="fas" icon="sync-alt" size="is-small"></b-icon>
                </b-button>  
              </p>
              <p class="control" v-if="setting.trash" v-tippy :content="'Remove previously extracted data.' + ( setting.trashTippy ? '<br>' + setting.trashTippy : '' ) ">
                <b-button size="is-default" @click="deleteData( setting )" class="remove-individual-sections-icon">
                  <b-icon pack="far" icon="trash-alt" size="is-small"></b-icon>
                </b-button>  
              </p>
            </b-field>
            
          </span>
        </b-field>
        
        <b-message class="description">
          <!-- You can fetch <b-tag type="is-warning">collections</b-tag> and <b-tag type="is-warning">wishlist</b-tag> now and discard them later when saving the gallery as a stand-alone website. <b-tag type="is-warning">ISBNs</b-tag> are merged with the library books and can't be removed later, not that there should be any need to do that. -->
          
          <div class="linky-links">
            <b-button size="is-small" @click="unselectAll">unselect all</b-button>
            <b-button size="is-small" @click="selectAll">select all</b-button>
            <b-button size="is-small" @click="resetNewTitles" v-tippy="{ maxWidth: 400 }" content='During library extraction newly added books get marked and you can filter and sort based on that status in the gallery. With this you can unmark all of those books. <br><br>Deleting previously extracted library data clears all new books too, but with this you can clear those without having to extract books again.<br><br> <strong>Cannot be undone!!</strong>'>reset new books</b-button>
            <b-button size="is-small" @click="exportRawData">Export raw data</b-button>
            <b-button size="is-small">
              <label>
                Import raw data
                <input accept=".json" type="file" @change="importRawData" style="display:none">
              </label>
            </b-button>
            <b-button size="is-small" @click="clearStoredData">Remove all extracted data</b-button>
          </div>

        </b-message>
      </div>
    </b-collapse>

    <div class="extract-wrapper">
      <b-field class="extract-btn" v-show="!extractionButtonDisabled" >
        <b-button @click="takeNextStep('extract')" type="is-info" class="extract control" expanded size="is-large" >
          Extract selected items
        </b-button>
        <div class="control">
          <b-button @click="takeNextStep('extract')" type="is-dark" icon-right="arrow-alt-circle-down" icon-pack="far" size="is-large" ></b-button>
        </div>
      </b-field>

      <b-field class="other-btns">
        <!-- <b-button
          :disabled="outputPageDisabled"
          @click="takeNextStep('update')"
          class="control"
          size="is-small"
          icon-right="sync-alt"
          icon-pack="fas"
          v-tippy
          content="<strong>Usable after one full extraction.</strong> <br>A faster extraction that primarily add new books but also updates data that is likely to change."
        >
          Partial extraction
        </b-button> -->
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
      Post issues, questions, and suggestion at: <a href="https://github.com/joonaspaakko/audible-library-extractor/issues">Github issues</a>. <br>
      <br>
      
      <a target="_blank" :href="releaseURL">
        <img src="https://img.shields.io/github/v/release/joonaspaakko/audible-library-extractor?include_prereleases&label=latest%20version" alt="">
      </a>
      <a target="_blank" :href="releaseURL">
        <img src="https://img.shields.io/github/release-date/joonaspaakko/audible-library-extractor?label=latest%20version" alt="">
      </a>
      <a target="_blank" href="https://github.com/joonaspaakko/audible-library-extractor/labels/bug">
        <img src="https://img.shields.io/github/issues/joonaspaakko/audible-library-extractor/bug" alt="">
      </a>
      
      <br><br>
      You're currently using version {{ extensionVersion }}
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
} from "@fortawesome/free-solid-svg-icons";
import { faArrowAltCircleDown, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
library.add(faShareSquare, faSyncAlt, faArrowAltCircleDown, faTimes, faCog, faTrashAlt, faCode);
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
  props: ["storageHasData", "storageConfig"],
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
    };
  },

  computed: {
    mainSteps: function() {
      return _.filter(this.extractSettings, function(o) {
        return !o.extra;
      });
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
    
    // Just to make sure that accidental clicks don't do anything when the overlay is opened
    // - If the button that opens the overlay was perfectly aligned with any of the buttons in this component, a double click would start doing things prematurely
    this.$nextTick(function() {
      setTimeout(function() {
        vue.loading = false;
      }, 500);
    });

  },

  methods: {
    
    updateSettings: function() {
      
      this.outputPageDisabled = !(this.hasData.books || this.hasData.wishlist);
      
      this.extractSettings = null;
      this.$nextTick(function() {
        
        this.extractSettings = [
          {
            name: "library",
            value: true,
            disabled: !this.hasData.books,
            label: "Library",
            type: "is-success",
            tippy: "<div style='text-align: left;'>Required for collections and isbn</div>",
            trash: this.hasData.books,
            trashTippy: 'This will also remove ISBN data.',
            update: true,
            updateTippy: `
            <div style="text-align: left;" class="udpate-tooltip">
              <strong>Update library data.</strong> Usable after one full extraction.<br><br>
              This is a faster partial extraction that: 
              <ol>
                <li>Adds new books just like it would on a full extract</li>
                <li>Clears books that were removed from the library</li>
                <li>
                  Updates information on old books that is likely to change:
                  <br>
                  <ul>
                  <li><code style="padding: 1px 3px;">unavailable(plus catalog), downloaded, favorite, progress(status), length, myRating</code></li>
                  </ul>
                </li>
                <li>Updates series data by removing books that are no longer in the library and by adding new ones</li>
                <li>Clears removed library books from collections. <br>Doesn't add new collection entries though, that requires a separate full scan.</li>
              </ol>
            </div>
            `,
          },
          {
            name: "collections",
            value: true,
            label: "Collections",
            type: "is-success",
            disabled: false,
            tippy: "<div style='text-align: left;'><strong>Always a full extract.</strong> Fairly quick extraction process.</div>",
            trash: this.hasData.collections
          },
          {
            name: "wishlist",
            value: false,
            label: "Wishlist",
            type: "is-danger",
            disabled: false,
            tippy: "<div style='text-align: left;'><strong>Slow process...</strong> + <strong>Always a full extract.</strong> <br><br>Books that also exist in your library are dropped off as long as you also extract library data.</div>",
            trash: this.hasData.wishlist
          },
          {
            name: "isbn",
            value: false,
            label: "ISBN",
            type: "is-danger",
            disabled: false,
            tippy: "<div style='text-align: left;'>You only need these if you want to try importing to Goodreads.<br><br> Books with previously extracted ISBNs are ignored. <br><br><strong>Very slow process when it needs to process more than 200 books.</strong></div>",
            trash: this.hasData.isbn
          },
        ];
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
      
      let storageHasData = !$.isEmptyObject(data);
      if ( storageHasData && !!data.chunks && data.chunks.length === 0 ) storageHasData = false;
      
      this.hasData = storageHasData ? ({ 
        books: data.chunks.indexOf('books') > -1, 
        isbn: data.chunks.indexOf('books') > -1 ? this.checkISBNs( data ) : false,
        wishlist: data.chunks.indexOf('wishlist') > -1,
        collections: data.chunks.indexOf('collections') > -1,
      }) : {};
      
      this.hasConfig = data.config || {};
      this.updateSettings();
      
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
    
    partialExtraction: function( setting ) {
      
      const library = _.filter( this.extractSettings, { name: 'library' });
      
      this.takeNextStep('update', {
        steps: _.map( library, function(o) {
          return { name: o.name, value: o.value, extra: o.extra };
        })
      });
      
    },
    
    unselectAll: function() {
      _.each( this.extractSettings, function( setting ) {
        setting.value = false;
      });
      this.extractionButtonDisabled = true;
    },
    selectAll: function() {
      _.each( this.extractSettings, function( setting ) {
        setting.value = true;
      });
      this.extractionButtonDisabled = false;
    },
    
    clearStoredData: function() {
      let vue = this;
      let confirmation = window.confirm('Are you sure you want to remove all extracted data?');
      if ( confirmation ) {
        browser.storage.local.clear().then(function() {
          
          browser.storage.local.get(null).then(data => {
            vue.updateViewData(data);
        
            vue.$buefy.notification.open({
              message: 'Data removed succesfully',
              type: 'is-success',
              position: 'is-top',
              closable: false,
            });
            
          }).catch(function( err ) {
            
            vue.$buefy.notification.open({
              message: 'Data clear failed',
              type: 'is-danger',
              position: 'is-top',
              closable: false,
            });
            
          });
          
        }).catch(function( err ) {
            
            vue.$buefy.notification.open({
              message: 'Data clear failed',
              type: 'is-danger',
              position: 'is-top',
              closable: false,
            });
            
          });
      };
    },
    
    exportRawData: function() {
      let vue = this;
      browser.storage.local.get(null).then(data => {
        
        if ( data.chunks ) vue.glueFriesBackTogether( data );
        saveAs(new Blob([JSON.stringify(data)], {type: "application/json;charset=utf-8"}), 'Audible Library Extractor Data.json');
        
      });
    },
    
    importRawData: function( e ) {
      
      let vue = this;
      let file = e.target.files;
      if ( file ) file = file[0];
      
      vue.loading = true;
      
      if ( file ) {
        
        let read = new FileReader();
        read.onload = function( e ) {
          
          let data = JSON.parse(e.target.result);
          vue.makeFrenchFries( data );
          
          browser.storage.local.clear().then(() => {
            
            browser.storage.local.set(data).then(function() {
              
              vue.updateViewData( data );
              
              if ( vue.hasData.books || vue.hasData.wishlist ) vue.extractionButtonDisabled = false;
              vue.loading = false; 
              vue.$buefy.notification.open({
                message: 'Data imported succesfully',
                type: 'is-success',
                position: 'is-top',
                closable: false,
              });
              
            }).catch(function( err ) {
              
              vue.loading = false; 
              vue.$buefy.notification.open({
                message: 'Data import failed',
                type: 'is-danger',
                position: 'is-top',
                closable: false,
              });
              
            });
            
          }).catch(function( err ) {
              
            vue.loading = false; 
            vue.$buefy.notification.open({
              message: 'Data import failed',
              type: 'is-danger',
              position: 'is-top',
              closable: false,
            });
            
          });
          
        };
        read.onerror = function( e ) {
          
          vue.loading = false; 
          vue.$buefy.notification.open({
            message: 'Data import failed',
            type: 'is-danger',
            position: 'is-top',
            closable: false,
          });
          
        };
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
          vue.deleteChunkData( { name: 'books'}, function( data ) {
            vue.deleteChunkData( { name: 'series'}, function( data ) {
              
              data.chunks = _.remove( data.chunks, function( value ) {
                return value !== 'isbn';
              });
              
              if ( data.config ) {
                data.config.steps = _.remove( data.config.steps, function( o ) {
                  return o.name !== 'isbn';
                });
              }
              browser.storage.local.clear().then(() => {
                browser.storage.local.set(data).then(function() {
                  
                  vue.updateViewData( data );
                  
                });
              });
              
            });
          });
          break;
          
        case 'collections':
        case 'wishlist':
          vue.deleteChunkData( setting );
          break;
        
        case 'isbn':
          vue.loading = false; 
          browser.storage.local.get(null).then(data => {
            
            _.each( _.range( 0, data[ 'books-chunk-length'] ), function( index ) { 
              
              let booksChunk = data[ 'books-chunk-'+index ];
              _.each( booksChunk, function( book ) {
                if ( book.isbns ) delete book.isbns;
              });
              
            });
            
            if ( data.config ) {
              data.config.steps = _.remove( data.config.steps, function( o ) {
                return o.name !== 'isbn';
              });
            }
            
            browser.storage.local.clear().then(() => {
              browser.storage.local.set(data).then(() => {
                
                let isbnSetting = _.find( vue.extractSettings, { name: 'isbn' });
                if ( isbnSetting ) isbnSetting.trash = false;
                
                vue.updateViewData( data );
                vue.loading = false; 
                vue.$buefy.notification.open({
                  message: `Removed ISBNs`,
                  type: 'is-success',
                  position: 'is-top',
                  closable: false,
                });
                
              }).catch(function( err ) {
                
                vue.loading = false; 
                vue.$buefy.notification.open({
                  message: `Failed to remove ISBNs`,
                  type: 'is-danger',
                  position: 'is-top',
                  closable: false,
                });
                
              });
            }).catch(function( err ) {
              
              vue.loading = false; 
              vue.$buefy.notification.open({
                message: `Failed to remove ISBNs`,
                type: 'is-danger',
                position: 'is-top',
                closable: false,
              });
              
            });
            
          }).catch(function( err ) {
            
            vue.loading = false; 
            vue.$buefy.notification.open({
              message: `Failed to remove ISBNs`,
              type: 'is-danger',
              position: 'is-top',
              closable: false,
            });
            
          });
          break;
        
      }
      
    },
    
    deleteChunkData: function( setting, callback ) {
      
      let vue = this;
      vue.loading = true; 
      
      let settingName = setting.name === 'books' ? 'library' : setting.name;
      
      browser.storage.local.get(null).then(data => {
        
        _.each( _.range( 0, data[ setting.name + '-chunk-length'] ), function( index ) { 
          delete data[ setting.name + '-chunk-'+index ];
        });
        delete data[setting.name + '-chunk-length'];
        
        data.chunks = _.remove( data.chunks, function( value ) {
          return value !== setting.name;
        });
        
        if ( data.config ) {
          data.config.steps = _.remove( data.config.steps, function( o ) {
            if ( setting.name === 'books' )
              return o.name !== 'library';
            else
              return o.name !== setting.name;
          });
        }
        
        browser.storage.local.clear().then(() => {
          browser.storage.local.set(data).then(() => {
            
            let s;
            if ( setting.name === 'books' ) {
              s = _.find( vue.extractSettings, { name: 'library' });
              if ( s ) s.trash = false;
            }
            else {
              s = _.find( vue.extractSettings, { name: setting.name });
              if ( s ) s.trash = false;
            }
            
            if ( data.chunks.indexOf('books') === -1 && data.chunks.indexOf('wishlist') === -1 ) vue.outputPageDisabled = true;
            
            if ( callback ) callback( data );
          
            vue.loading = false; 
            vue.updateViewData( data );
            vue.$buefy.notification.open({
              message: `Removed ${settingName} data`,
              type: 'is-success',
              position: 'is-top',
              closable: false,
            });
            
          }).catch(function( err ) {
            
            vue.loading = false; 
            vue.$buefy.notification.open({
              message: `Failed to remove ${settingName} data`,
              type: 'is-danger',
              position: 'is-top',
              closable: false,
            });
            
          });
        }).catch(function( err ) {
          
          vue.loading = false; 
          vue.$buefy.notification.open({
            message: `Failed to remove ${settingName} data`,
            type: 'is-danger',
            position: 'is-top',
            closable: false,
          });
          
        });
        
      }).catch(function( err ) {
        
        vue.loading = false; 
        vue.$buefy.notification.open({
          message: `Failed to remove ${settingName} data`,
          type: 'is-danger',
          position: 'is-top',
          closable: false,
        });
        
      });
      
    },
    
    takeNextStep: function(step, config) {
      
      let activeSettings = _.filter( this.extractSettings, 'value');
      if ( activeSettings.length > 0 ) {
        
        config = config || {
          steps: _.map( activeSettings, function(o) {
            return { name: o.name, value: o.value, extra: o.extra };
          })
        };
        
        this.$root.$emit("do-next-step", {
          step: step,
          config: config
        });
        
      }
    },

    settingChanged: function(inputValue, inputName) {
      
      let currentSetting = _.find(this.extractSettings, { name: inputName });
      let library = _.find(this.extractSettings, { name: 'library' });
      let collections = _.find(this.extractSettings, { name: 'collections' });
      let isbn = _.find(this.extractSettings, { name: 'isbn' });
      
      let collectionsOrIsbn = inputName === 'collections' || inputName === 'isbn';
      if ( !this.hasData.books && collectionsOrIsbn ) {
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
        browser.storage.local.get(null).then(data => {
          
          _.each( _.range( 0, data[ 'books-chunk-length'] ), function( index ) { 
            
            let booksChunk = data[ 'books-chunk-'+index ];
            _.each( booksChunk, function( book ) {
              if (book.isNew) delete book.isNew;
            });
            
          });
          
          browser.storage.local.clear().then(() => {
            browser.storage.local.set(data).then(() => {
            
              vue.$buefy.notification.open({
                message: 'All "new" books succesfully reset',
                type: 'is-success',
                position: 'is-top',
                closable: false,
              });
              
            }).catch(function( err ) {
              
              vue.$buefy.notification.open({
                message: 'Failed to remove "new" status from books',
                type: 'is-danger',
                position: 'is-top',
                closable: false,
              });
              
            });
          }).catch(function( err ) {
            
            vue.$buefy.notification.open({
              message: 'Failed to remove "new" status from books',
              type: 'is-danger',
              position: 'is-top',
              closable: false,
            });
            
          });
          
        }).catch(function( err ) {
          
          vue.$buefy.notification.open({
            message: 'Failed to remove "new" status from books',
            type: 'is-danger',
            position: 'is-top',
            closable: false,
          });
          
        });
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
            changelogInnerHTML += '<li class="'+ (change.class || '') +'">'+
              (change.link ? '<a target="_blank" href="'+ change.link.href +'">'+ linkText +'</a>: ' : '') + 
              (change.description || '')
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
    width: 300px;
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
    padding: 50px 0 60px;
    * {
      transition: all 200ms ease;
    }
    img { opacity: .6; }
    &:hover {
      color: #717171 !important;
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
</style>
