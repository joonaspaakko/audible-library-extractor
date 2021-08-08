import Vue from "vue";
import App from "./image-editor-app.vue";

import VueDarkMode from "@growthbunker/vuedarkmode";
Vue.use(VueDarkMode);

import _ from "lodash";

import { ColorPicker, ColorPanel } from "one-colorpicker";
Vue.use(ColorPanel);
Vue.use(ColorPicker);

Vue.use(require('vue-shortkey'))

import Vuex from "vuex";
Vue.use(Vuex);

// VUE TIPPY
import VueTippy, { TippyComponent } from "vue-tippy";
Vue.use(VueTippy, {
  placement: "left",
  arrow: true,
  theme: "light-border",
  maxWidth: 450,
  delay: [500,0],
  onShow: options => {
    return !!options.props.content;
  },
  boundary: "viewport",
  flipDuration: 0
});
Vue.component("tippy", TippyComponent);
import "tippy.js/themes/light-border.css";

const store = new Vuex.Store({
  state: {
    covers: null,
    coverAmount: 30,
    coverSize: 160,
    paddingSize: 5,
    canvas: {
      width: 914,
      height: 0,
      background: "#fff",
      zoom: 1,
      zoomOutputs: false,
      fit: false,
      padding: 32,
      transformOrigin: "center center",
      scaled: {
        width: 0,
        height: 0,
      },
    },
    saving: false,
    slidingAround: null,
    showHints: true,
    canvasPanning: true,
    usedCovers: null,
    draggable: true,
    showAuthorAndTitle: false,
    textElementCounter: 0,
    textElements: [],
  },
  mutations: {
    
    update(state, config) {
      let setValues = function (config) {
        config = config || {};
        if (config.key) {
          updateMutationIntercept( state, config );
          _.set(state, config.key, config.value);
        }
      };

      if (_.isArray(config)) {
        _.each(config, function (conf) {
          setValues(conf);
        });
      } else {
        setValues(config);
      }
    },
    
    addText( state, textElement ) {
      
      ++state.textElementCounter;
      if ( !textElement.id ) textElement.id = state.textElementCounter;
      if ( !textElement.textElement ) textElement.textElement = true,
      
      state.textElements.push( textElement );
      
    },
    
    removeText( state, index ) {
      
      state.textElements.splice(index, 1);
      
    },
    
    changeText( state, config ) {
      
      let textObj = state.textElements[ config.index ];
      textObj[ config.key ] = config.value;
      
    },
    
  },
  getters: {
    widthOrHeight_Unset: function (state) {
      return state.canvas.width < 1 || state.canvas.height < 1;
    }
  }
});

function updateMutationIntercept( state, config ) {
  
  // if ( config.key === 'usedCovers' ) {
  //   let oldCovers = state.usedCovers;
  //   let newCovers = config.value;
    
  // }
  
}

import vueDragscroll from "vue-dragscroll";
Vue.use(vueDragscroll);

Vue.config.productionTip = false;

let editorApp = new Vue({
  el: "#image-editor",
  render: (h) => h(App),
  store
});

