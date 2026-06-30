<template>
<n-config-provider :theme="lightTheme" :theme-overrides="themeOverrides">
<div>
  <div id="ale-menu-screen" v-if="!loading">

    <!-- SETTINGS -->
    <cont-extraction-settings @extract="extract" @open-gallery="takeNextStep('output')" />

  </div>
  <div v-else class="extraction-loading">
    <gg-spinner class="spin" />
  </div>

</div>
</n-config-provider>
</template>

<script>
import { NConfigProvider, lightTheme } from 'naive-ui';
import helpers from "@contscript-mixins/misc/content-script-helpers.js";

export default {
  name: "menuScreen",
  props: ["domainExtension", "wishlistUrl"],
  mixins: [ helpers ],
  components: { NConfigProvider },
  data() {
    return {
      store: this.$store.state,
      hasData: null,
      hasConfig: null,
      loading: true,
      isFirefox: false,
      isChrome: false,
      releaseURL: '',
      cannotAccessWishlist: false,
    };
  },
  
  computed: {

    lightTheme: function() { return lightTheme; },

    themeOverrides: function() {
      return {
        common: {
          primaryColor: '#f79a1c',
          primaryColorHover: '#f8a93d',
          primaryColorPressed: '#dd860e',
        },
      };
    },

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

<style lang="scss">

body > .notices {
  z-index: 9999999999 !important;
}

// naive-ui's floating layers (tree-select/dropdown/popover popups, popconfirm, the
// discrete message container) teleport to <body>, landing as siblings of the
// #audible-library-extractor overlay rather than inside it. Without this they default
// to naive-ui's own z-index (~2000), which sits behind the overlay's z-index:999999999
// and makes every popup open invisibly/unclickably. Match tippy's existing fix for the
// same problem.
.v-binder-follower-container,
.n-message-container,
.n-modal-container {
  z-index: 9999999990 !important;
}

#ale-menu-screen {
  max-width: 810px;
  margin: 0 auto;

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
    border: 1px solid color.adjust(#f1f1f1, $lightness: -5%);
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
