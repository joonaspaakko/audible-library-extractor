<template>
<div>
  <div id="ale-menu-screen" v-if="!loading" :class="{ 'show-delete-btns': showDeleteBtns, 'show-partial-extraction': showPartialExtraction }">
    
    <!-- SETTINGS -->
    <cont-extraction-settings />
  
    <!-- INLINE MESSAGES -->
    <!-- <article v-if="dataVersionMismatch.length > 0" class="message is-danger">
      <div class="message-body">
        You should <span class="init-show-detele-btns" @mouseover="showDeleteBtns = true" @mouseleave="showDeleteBtns = false">remove</span> <strong>{{ dataVersionMismatch.join(', ') }}</strong> data and re-extract to get the most out of the new version.
      </div>
    </article> -->
    
    <article v-if="$store.getters.partialDataSettings_any" class="message is-info">
      <div class="message-body">
        <strong>Previously extracted data detected: <span style="color: #f7991c;">a faster <span v-tippy="{ allowHTML: true }" content="<div style='display: block; text-align: left;'><ol style='margin-left: 15px;'><li>Updates stored data that is likely to change</li><li>Does a full extract on newly added books</li><li>Clears data of removed books</li></ol><span style='display: inline-block; margin-top: 6px; color: #157df0;'>In the case of ISBN extraction, books that already have ISBNs are ignored. A large amount of books (+100) without the numbers will still take quite a while to extract.</span></div>" style="cursor: default; text-decoration: underline">partial extraction</span> is used</span> <span class="init-show-partial-extraction" style="color: #f7991c;" @mouseover="showPartialExtraction = true" @mouseleave="showPartialExtraction = false">where applicable.</span></strong> 
        <br>
        If you need to do a <span v-tippy="{ maxWidth: 310 }" content="The data structure may change from version to version, in which case a full extraction is needed or at least preferred. <br><br>You need to remove extracted data in order to do a full extraction." style="cursor: default; text-decoration: underline">full extraction</span>, you can remove stored data using <span class="init-show-detele-btns" @mouseover="showDeleteBtns = true" @mouseleave="showDeleteBtns = false">these buttons</span>.
      </div>
    </article>
    
    <!-- EXTRACTION BUTTONS -->
    <div>
      <div class="extract-wrapper">
        
        <div class="field has-addons extract-btn" v-show="!store.extractionButtonDisabled && !loading">
          <p class="control">
            <button class="button is-info extract is-large" @click="extract" expanded>
              Extract selected items
            </button>
          </p>
          <p class="control">
            <button class="button is-dark is-large" @click="extract">
              <ph-arrow-circle-right-bold/>
            </button>
          </p>
        </div>

        <div class="field has-addons other-btns">
          <button
            class="button control is-small"
            tag="a"
            href="https://joonaspaakko.gitbook.io/audible-library-extractor/"
            target="_blank"
          >
            Documentation <ri-external-link-line/>
          </button>
          <button
            class="button control is-small"
            :disabled="!$store.getters.mainDataExists ? true : null"
            @click="takeNextStep('output')"
          >
            Open gallery <ri-external-link-line/>
          </button>
        </div>
      </div>
    </div>

    <cont-changelog></cont-changelog>


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
      
      <div style="margin-top: 10px;">
        <span style="border: 1px dashed #e1e1e1; padding: 10px 15px; display: inline-block;">
          You're currently using <strong>version {{ store.appVersion }}</strong>.
        </span>
      </div>
    </div>
  </div>
  <div v-else class="extraction-loading">
    <gg-spinner class="spin" />
  </div>
  
</div>
</template>

<script>
import helpers from "@contscript-mixins/misc/content-script-helpers.js";

export default {
  name: "menuScreen",
  props: ["domainExtension", "wishlistUrl"],
  mixins: [ helpers ],
  data() {
    return {
      store: this.$store.state,
      hasData: null,
      hasConfig: null,
      settingsOpen: true,
      loading: true,
      isFirefox: false,
      isChrome: false,
      releaseURL: '',
      showDeleteBtns: false,
      showPartialExtraction: false,
      exportRawDataDisabled: false,
      cannotAccessWishlist: false,
    };
  },
  
  computed: {
    
    dataVersionMismatch: function() {
      
      // const extensionVersion = this.store.appVersion;
      // const dataVersions = this.$store.state.dataVersion;
      // const hasData = this.hasData;
    
      // let mismatch = [];
      // const dataPoints = ['library', 'collections', 'wishlist'];
      
      // _.each( dataPoints, function( key ) {
        
      //   const version = _.isObject( dataVersions ) ? dataVersions[ key ] : null;
      //   const keyHasData = !!hasData[ key === 'library' ? 'books' : key ];
      //   const noVersion = keyHasData && !version;
      //   const versionMismatch = keyHasData && (version !== extensionVersion && version !== '0.2.7' );
      //   if ( noVersion || versionMismatch ) mismatch.push( key );
        
      // });
      
      // return mismatch;
      
      return [];
      
    },
    
  },
  
  created: function() {
    
    this.hasData = this.$store.state.storageHasData;
    this.hasConfig = this.$store.state.storageConfig;
    // this.updateSettings();
    
    this.checkBrowser();
    this.makeReleaseURLs();
    
  },

  mounted: function() {
      
    // Just to make sure that accidental clicks don't do anything when the overlay is opened
    // - If the button that opens the overlay was perfectly aligned with any of the buttons in this component, a double click would start doing things prematurely
    this.$nextTick(function() {
      setTimeout(() => {
        this.loading = false;          
      }, 300);
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
    
    checkBrowser: function() {
      this.isFirefox = chrome.runtime.getURL('').startsWith('moz-extension://');
      this.isChrome = chrome.runtime.getURL('').startsWith('chrome-extension://');
    },
    
    makeReleaseURLs: function() {
      this.releaseURL = this.isFirefox ? 'https://chrome.google.com/webstore/detail/audible-library-extractor/deifcolkciolkllaikijldnjeloeaall' : 'https://addons.mozilla.org/firefox/addon/audible-library-extractor/';
    },
    
    extract: function() {
      
      let vue = this;
      
      // // Going to extract wishlist...?
      // if ( this.$store.getters.setting('wishlist').value ) {
        
      //   this.$store.commit('update', {  key: 'extractBtnDisabled', value: true });
      //   this.$store.commit('update', {  key: 'extractionButtonDisabled', value: true });
        
      //   // I don't know the full logic, but Audible tends to require a login to certain pages after you haven't in a while. 
      //   // I think it might just do that for any page you haven't visited after a while. The only evidence I have is that I visit
      //   // library very often but wishlist and other pages not so much and wishlist requires login way more often than my library.
      //   vue.checkAccess({
      //     to: vue.wishlistUrl,
      //     success: function( e ) {
      //       vue.takeNextStep('extract');
      //     },
      //     failed: function() {
      //       vue.cannotAccessWishlist = true;
      //     },
      //     finally: function() {
      //       vue.$store.commit('update', {  key: 'extractBtnDisabled', value: false });
      //     },
      //   });
      // }
      // else {
      //   vue.takeNextStep('extract');
      // }
      
      this.takeNextStep('extract');
      
    },
    
    takeNextStep: function(step, config) {
      
      if ( !config ) {
        config = {
          steps: _.map( _.filter( this.store.sticky.extractSettings, function( o ) { return o.value && !o.extra }), function(o) {
            return { name: o.name, value: o.value };
          })
        };  
      }
      
      config.extraSettings = _.map( _.filter( this.store.sticky.extractSettings, 'extra'), function(o) {
        return { name: o.name, value: o.value, deactivated: false };
      });
      
      this.$compEmitter.emit("start-extraction", {
        step: step,
        config: config
      });
      
    },
    
  }
};
</script>

<style scoped src="@node/bulma/css/bulma.css"></style>

<style lang="scss">
// @use '@node/bulma/css/bulma.css';

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
    margin: 20px auto 0;
    .field-body { width: 100%; }
  }

  .extract-btn {
    margin-bottom: 0px !important;
    display: inline-flex;
    width: 100%;
    button.extract {
      padding: 5px 15px 4px !important;
      border-radius: 4px 0 0 4px;
      background: #1b7dd1 !important;
    }
    button.is-dark {
      background: #555 !important;
    }
  }

  .extract-settings {
    position: relative;
    z-index: 1;
    padding-top: 10px;
    margin: 0px auto 20px auto;
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
      display: block;
      // padding: 20px 6px;
      padding: 15px 6px;
      > div {
        display: inline-block;
			  padding-left: 11px;
        &:first-child { padding-left: 0; }
      }
      @media ( max-width: 798px ) {
        
        padding: 20px;
        > div {
			    padding-left: 0px;
          display: block;
        }
      }
      &, .field {
        margin: 0 !important;
      }
      span > .field {
        padding: 3px;
      }
      // margin-right: 46px;
      button {
        padding: 8px;
        min-width: 34px;
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
        &:disabled {
          opacity: 1;
          border: 1px solid #ededed;
        }
      }
      
      .full-width {
        flex: 1;
        > .button {
          width: 100%;
          display: flex;
          justify-content: stretch;
          align-items: stretch;
          > label {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }
      
      button {
        outline: none !important;
        box-shadow: none !important;
        border-color: #dbdbdb !important;
        &:active { border-color: #4a4a4a !important; }
      }
      
      .setting-numbers-wrapper,
      .checbox-wrapper {
        // cursor: default;
        // border: 1px solid #dbdbdb !important;
        padding: 6px;
        > .button {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          font-size: 0.7em;
          cursor: default;
          padding: 0px;
          width: 19px;
          height: 19px;
          border-radius: 4px;
        }
      }
      
      .disabled .checbox-wrapper > .button {
        background: #000;
      }
      
      & > .unchecked .checbox-wrapper > .button {
        padding: 0;
        font-size: 1em;
      }
      
      .setting-numbers-wrapper > .button {
        font-size: 1em !important;
        padding: 0 !important;
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
      font-size: 13px;
      line-height: 13px;
    }
    svg { 
      margin-left: 6px; 
      font-size: 15px;
      line-height: 15px;
      position: relative;
      top: -2px;
    }
  }

  #footer {
    font-size: 0.9em;
    line-height: 1.3em;
    margin-top: 30px;
    padding-top: 20px;
    padding-bottom: 60px;
    a, img { display: inline-block; }
    a {
      margin: 2px;
    }
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
    margin-top: 10px;
    background: #f4f5f6;
    font-size: 13px;
    span { 
      margin-left: 6px; &:first-child { margin-left: 0 }
    }
    .divider { color: #444; }
    a { color: #666; }
    button {
      margin: 5px 2px;
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

.update-tooltip {
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

.extraction-loading,
.extraction-loading .icon {
  font-size: 40px;
  color: #f79a32;
  .spin {
    animation: rotating .5s linear infinite;
    @keyframes rotating {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  }
}

.delete-btn svg {
  color: red;
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
}


.tippy-box {
  box-shadow: 0 10px 25px rgba(#000, .2) !important;
}
.tippy-arrow {
  color: #e1e1e1 !important;
}
.tippy-content {
  padding: 7px !important; 
  background: #fff !important;
  border: 1px solid #e1e1e1;
  color: #151515 !important;
}


div.c-toast-container {
  z-index: 9999999999 !important;
}

.no-selection {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  user-drag: none;
}


</style>
