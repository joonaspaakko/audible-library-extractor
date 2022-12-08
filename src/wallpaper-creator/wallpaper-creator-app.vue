<template>
  <div id="app" v-if="dataReady" v-show="mounted" 
  v-shortkey.push="store.events.canvasPanning ? ['space'] : null" 
  @shortkey="store.events.canvasPanning ? forcePanning($event) : null"
  >
    <preset-modal />
    <editor-canvas />
    <toolbar />
  </div>
  <div v-else-if="noCovers" class="error-msg">
    <h3>Couldn't find any covers from imported data.</h3>
    <p>Try opening this page again from the <a href="../gallery/index.html">gallery</a>.</p>
  </div>
</template>

<script>
import editorCanvas from "@editor-comps/canvas.vue";
import toolbar from "@editor-comps/toolbar.vue";
import getCovers from "@editor-mixins/getCovers.js";
import centerCanvas from "@editor-mixins/centerCanvas.js";
import presetModal from '@editor-comps/preset-modal.vue';

export default {
  name: "App",
  components: {
    presetModal,
    editorCanvas,
    toolbar,
  },
  mixins: [getCovers, centerCanvas],
  data: function () {
    return {
      store: this.$store.state,
      dataReady: false,
      mounted: false,
      panningToggle: false,
      noCovers: false,
    };
  },
  created: function () {
    
    window.addEventListener("mouseup", this.stopSlidingAround);
    window.addEventListener('resize', this.windowResized);
    
    // Makes it so you can used keys reserved by other events inside all text or number inputs.
    document.addEventListener("focusin", this.inputFocused);
    document.addEventListener('focusout', this.inputBlurred);
    
    // window.addEventListener('beforeunload', function (e) {
    //   e.preventDefault();
    //   e.returnValue = '';
    // });
    
  },

  beforeUnmount: function () {
    
    window.removeEventListener("mouseup", this.stopSlidingAround);
    window.removeEventListener('resize', this.windowResized);
    
    document.removeEventListener("focusin", this.inputFocused);
    document.removeEventListener('focusout', this.inputBlurred);
    
  },

  mounted: function () {
    
    this.mounted = true;
    
  },
  
  methods: {
    
    inputFocused: function({ target }) {
      let type = _.get(target, 'type');
      if ( type === "text" || type === "number" || type === "range" ) {
        this.$store.commit('update', [
          { key: 'events.textNudge', value: false },
          { key: 'events.textRemove', value: false },
          { key: 'events.canvasPanning', value: false },
        ]);
      }
    },

    inputBlurred: function({ target}) {
      let type = _.get(target, 'type');
      if ( type === "text" || type === "number" || type === "range" ) {
        this.$store.commit('update', [
          { key: 'events.textNudge', value: true },
          { key: 'events.textRemove', value: true },
          { key: 'events.canvasPanning', value: true },
        ]);
      }
    },
    
    windowResized: _.debounce( function() {
      
      this.$compEmitter.emit('window-resized')
      this.centerCanvas();
      
    }, 400, { leading: false, trailing: true }),
    
    stopSlidingAround: function () {
      let vue = this;
      setTimeout(function () {
        vue.$store.commit("update", { key: "slidingAround", value: null });
      }, 500);
    },
    
    forcePanning: function( e ) {
      
      this.panningToggle = !this.panningToggle;
      
      let keyDown = this.panningToggle;
      if ( keyDown ) {
        this.$store.commit('update', { key: 'canvasPanning', value: true });
      }
      else {
        this.$store.commit('update', { key: 'canvasPanning', value: false });
      }
      
    },
    
  },
};
</script>

<style lang="scss">

/* open-sans-regular - latin */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('@fonts/open-sans-v27-latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('@fonts/open-sans-v27-latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
/* open-sans-700 - latin */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 700;
  src: local(''),
       url('@fonts/open-sans-v27-latin-700.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('@fonts/open-sans-v27-latin-700.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

html, .editor-canvas, .toolbar {
  font-family: "Open Sans", sans-serif;
}
[class^="gb-"]:not(.gb-base-icon) {
  font-family: "Open Sans", sans-serif !important;
}

body {
  overscroll-behavior: none;
}

html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  display: flex;
  flex-direction: row;
  align-content: flex-start;
  align-items: flex-start;
  justify-content: center;
  justify-items: center;
  > div {
    display: flex;
    flex-direction: column;
    align-content: flex-start;
    align-items: flex-start;
    justify-content: center;
    justify-items: center;
    height: 100vh;
    position: relative;
    z-index: 0;
  }
}

[data-tippy-root] {
  z-index: 99999999999 !important;
}

.error-msg {
  display: flex;
  flex-direction: column;
  justify-items: center;
  justify-content: center;
  align-items: center;
  align-content: center;
  width: 100%;
  height: 100%;
}
</style>
