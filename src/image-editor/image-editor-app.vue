<template>
  <div id="app" v-if="dataReady" v-show="mounted" 
  v-shortkey.push="store.events.canvasPanning ? ['space'] : null" 
  @shortkey="store.events.canvasPanning ? forcePanning($event) : null"
  >
    <editor-canvas />
    <toolbar />
  </div>
</template>

<script>
import editorCanvas from "@editor-comps/canvas.vue";
import toolbar from "@editor-comps/toolbar.vue";
import getCovers from "@editor-mixins/getCovers.js";
import centerCanvas from "@editor-mixins/centerCanvas.js";

export default {
  name: "App",
  components: {
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
    };
  },
  created: function () {
    window.addEventListener("mouseup", this.stopSlidingAround);
    window.addEventListener('resize', this.windowResized);
    
    // window.addEventListener('beforeunload', function (e) {
    //   e.preventDefault();
    //   e.returnValue = '';
    // });
    
  },

  beforeDestroy: function () {
    
    window.removeEventListener("mouseup", this.stopSlidingAround);
    window.addEventListener('resize', this.windowResized);
    
  },

  mounted: function () {
    
    this.mounted = true;
    
  },
  
  methods: {
    
    windowResized: _.debounce( function() {
      
      this.$root.$emit('window-resized')
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
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap");

html, .editor-canvas, .toolbar {
  font-family: "Open Sans", sans-serif;
}
[class^="gb-"]:not(.gb-base-icon) {
  font-family: "Open Sans", sans-serif !important;
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
    height: 100%;
    position: relative;
    z-index: 0;
  }
}
</style>
