import Vue from "vue";
import App from "./wallpaper-creator-app.vue";

// For vue form multiselect...
import VueCompositionAPI from '@vue/composition-api';
Vue.use(VueCompositionAPI);

import store from "./wallpaper-creator-store.js";

import VueDarkMode from "@growthbunker/vuedarkmode";
Vue.use(VueDarkMode);

import { ColorPicker, ColorPanel } from "one-colorpicker";
Vue.use(ColorPanel);
Vue.use(ColorPicker);

Vue.use(require('vue-shortkey'));

import contenteditable from 'vue-contenteditable';
Vue.use(contenteditable);

// VUE TIPPY
import VueTippy, { TippyComponent } from "vue-tippy";
Vue.use(VueTippy, {
  a11y: false,
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
import 'tippy.js/dist/tippy.css';

import vueDragscroll from "vue-dragscroll";
Vue.use(vueDragscroll);

Vue.config.productionTip = false;

let editorApp = new Vue({
  el: "#wallpaper-creator",
  render: (h) => h(App),
  store
});

