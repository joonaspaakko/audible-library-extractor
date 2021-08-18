import Vue from "vue";
import App from "./animated-wallpaper-app.vue";

import _ from "lodash";

Vue.config.productionTip = false;

let editorApp = new Vue({
  el: "#animated-wallpaper",
  render: (h) => h(App),
});

