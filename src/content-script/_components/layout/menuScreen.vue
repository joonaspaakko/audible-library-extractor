<template>
  <div id="ale-menu-screen" v-visible="!loading">
    <b-collapse animation="slide" class="panel" :open="settingsOpen">
      <div class="extract-settings">
        <div class="settings-heading fade-in">
          <span class="title is-4">Extraction Settings</span>
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
                <b-button size="is-default" @click="deleteData( setting )">
                  <b-icon pack="fas" icon="trash-alt" size="is-small"></b-icon>
                </b-button>  
              </p>
            </b-field>
            
          </span>
        </b-field>
        
        <div class="linky-links">
          <span><a href="#" @click.prevent="unselectAll">unselect all</a> </span>
          <span class="divider">•</span>
          <span><a href="#" @click.prevent="selectAll">select all</a> </span>
          <span class="divider">•</span>
          <span><a href="#" v-tippy="{ maxWidth: 400 }" content='When you update the library, newly added books get marked "New books" and you can filter and sort based on that status in the gallery. With this you can unmark all of those books. <br><br> <strong>Cannot be undone!!</strong>' @click.prevent="resetNewTitles"><strong>reset new titles</strong></a> </span>
        </div>

        <b-message class="description">
          The extraction process will always retain any previously extracted data, so it will just add or overwrite data from the selected options. For example: if you extracted the library previously, you don't have to extract it again if you just want to for example add the wishlist.
          <!-- You can fetch <b-tag type="is-warning">collections</b-tag> and <b-tag type="is-warning">wishlist</b-tag> now and discard them later when saving the gallery as a stand-alone website. <b-tag type="is-warning">ISBNs</b-tag> are merged with the library books and can't be removed later, not that there should be any need to do that. -->
        </b-message>
      </div>
    </b-collapse>

    <div class="extract-wrapper">
      <b-field class="extract-btn">
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
    content="
    <div style='text-align: left; max-height: 350px; overflow: scroll; padding: 20px;'>
      <strong>v.0.2.5</strong>
      <ul>
        <li><a href='https://github.com/joonaspaakko/audible-library-extractor/issues/28' target='_blank'>Fixed #28</a>: Series/sub page fails to show the right content</li>
        <li><a href='https://github.com/joonaspaakko/audible-library-extractor/issues/27' target='_blank'>Fixed #27</a>: The Great Courses (books) omitted</li>
        <li><a href='https://github.com/joonaspaakko/audible-library-extractor/issues/24' target='_blank'>Fixed #24</a>: Search overrides sorting URL parameter on page load</li>
        <li><a href='https://github.com/joonaspaakko/audible-library-extractor/issues/23' target='_blank'>Fixed #23</a>: Wishlist scraping errored out due to fetching second lvl domain names like “.co.uk” wrong</li>
        <li><a href='https://github.com/joonaspaakko/audible-library-extractor/issues/22' target='_blank'>Fixed #22</a>: Categories page empty (sometimes)</li>
        <li><a href='https://github.com/joonaspaakko/audible-library-extractor/issues/21' target='_blank'>Fixed #21</a>: View mode button showing up on pages it shouldn’t</li>
        <li><a href='https://github.com/joonaspaakko/audible-library-extractor/issues/20' target='_blank'>Fixed #20</a>: Filter and sorter menu disappearing behing the bottom mobile nav</li>
        <li><a href='https://github.com/joonaspaakko/audible-library-extractor/issues/19' target='_blank'>Fixed #19</a>: Partial library scan breaking series</li>
      <ul>
      <br>
      <strong>v.0.2.4</strong>
        <ul>
          <li>First public beta version</li>
        </ul>
    </div>
    "
    >
      Changelog
    </b-button>

    <div id="footer" class="is-small has-text-grey-light">
      Find more information in the <a href="https://github.com/joonaspaakko/audible-library-extractor">Github repository</a> page. <br />
      Post issues, questions, and suggestion at: <a href="https://github.com/joonaspaakko/audible-library-extractor/issues">Github issues</a>.
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
  faTrashAlt,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import { faArrowAltCircleDown } from "@fortawesome/free-regular-svg-icons";
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

export default {
  name: "menuScreen",
  props: ["storageHasData", "storageConfig"],
  data() {
    return {
      inStorage: {
        books: this.storageHasBooks
      },
      outputPageDisabled: false,
      settingsOpen: true,
      extractSettings: [
        {
          name: "library",
          value: true,
          disabled: true,
          label: "Library",
          type: "is-success",
          tippy: "<div style='text-align: left;'>If this option is checked and disabled, it's because there's no library data in memory and <br>some selected options require it to function: collections, isbn</div>",
          trash: this.storageHasData.books,
          trashTippy: 'This will also remove ISBN data, because that data is attached to the library.',
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
          trash: this.storageHasData.collections
        },
        {
          name: "isbn",
          value: false,
          label: "ISBN",
          type: "is-danger",
          disabled: false,
          tippy: "<div style='text-align: left;'>Attempts to fetch ISBNs for every book in your library, but if you have extracted ISBNs before, <br>it will only try to fetch them for books without ISBNs. <br><br><strong>Very slow process when it needs to process more than 200 books.</strong> <br><br>You should only need ISBNs if you plan to import the books to Goodreads.</div>",
          trash: this.storageHasData.isbn
        },
        {
          name: "wishlist",
          value: false,
          label: "Wishlist",
          type: "is-danger",
          disabled: false,
          tippy: "<div style='text-align: left;'><strong>Slow process...</strong> + <strong>Always a full extract.</strong> <br><br>This has potential to increase the gallery's file size by a lot if your wishlist is huge. Though that only really matters if you're uploading the gallery online, if that is something you care about. A book in wishlist takes about the same amount of space as one book in the library.</div>",
          trash: this.storageHasData.wishlist
        }
      ],
      loading: true
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
    
    if ( !(this.storageHasData.books || this.storageHasData.wishlist) ) {
      this.outputPageDisabled = true;
    }
    else {
      _.find(this.extractSettings, { name: 'library' }).disabled = false;
    }
    
  },

  mounted: function() {
    
    const vue = this;
    
    // Updates default values from browser storage
    if (this.storageConfig && this.storageConfig.steps) {
      _.each(this.extractSettings, function(step) {
        step.value = false; // Reset steps
      });
      _.each(this.storageConfig.steps, function(step) {
        let foundOriginalDolly = _.find(vue.extractSettings, { name: step.name });
        if ( foundOriginalDolly ) foundOriginalDolly.value = step.value;
      });
    }
    
    // Just to make sure that accidental clicks don't do anything when the overlay is opened
    // - If the button that opens the overlay was perfectly aligned with any of the buttons in this component, a double click would start doing things prematurely
    this.$nextTick(function() {
      setTimeout(function() {
        vue.loading = false;
      }, 1000);
    });

  },

  methods: {
    
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
    },
    selectAll: function() {
      _.each( this.extractSettings, function( setting ) {
        setting.value = true;
      });
    },
    
    deleteData: function( setting ) {
      
      const vue = this;
      
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
                browser.storage.local.set(data).then(() => {
                  
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
                
              });
            });
            
          });
          break;
        
      }
      
    },
    
    deleteChunkData: function( setting, callback ) {
      
      const vue = this;
      
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
            
          });
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
      this.forceTrue( inputValue, inputName, currentSetting );
      
    },
    
    forceTrue: function( inputValue, inputName, currentSetting ) {
    
      switch ( inputName ) {
        case 'isbn':
        case 'collections':
          // Enable library setting if there is no previously collected book data
          if ( !this.storageHasBooks ) {
            
            let library = _.find(this.extractSettings, { name: 'library' });
            
            if ( !(this.storageHasData.books || this.storageHasData.wishlist) ) {
              if ( inputValue ) {
                library.value = true;
                library.disabled = true;
              }
              else if ( inputName === 'isbn' ) {
                let collections = _.find(this.extractSettings, { name: 'collections' });
                if ( !collections.value ) library.disabled = false;
              }
              else if ( inputName === 'collections' ) {
                let isbn = _.find(this.extractSettings, { name: 'isbn' });
                if ( !isbn.value ) library.disabled = false;
              }
            }
          }
          break;
      }
      
    },
    
    resetNewTitles: function() {
      
      browser.storage.local.get(null).then(data => {
        
        _.each( _.range( 0, data[ 'books-chunk-length'] ), function( index ) { 
          
          let booksChunk = data[ 'books-chunk-'+index ];
          _.each( booksChunk, function( book ) {
            if (book.isNew) delete book.isNew;
          });
          
        });
        
        browser.storage.local.clear().then(() => {
          browser.storage.local.set(data).then(() => {});
        });
        
      });
      
    },
    
  }
};
</script>

<style lang="scss">
#ale-menu-screen {
  max-width: 810px;
  margin: 0 auto;

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
        padding: 13px;
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

    .setting-checkboxes {
      margin: 15px 20px;
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
    max-width: 300px;
    margin: 6px auto 0;
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
    padding: 50px 0 10px;
    &,
    & a {
      transition: color 150ms ease;
    }
    &:hover {
      color: #717171 !important;
      a {
        color: darken(#717171, 5) !important;
      }
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
    margin-bottom: 15px;
    font-size: 13px;
    span { 
      margin-left: 6px; &:first-child { margin-left: 0 }
    }
    .divider { color: #444; }
    a { color: #666; }
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
</style>
