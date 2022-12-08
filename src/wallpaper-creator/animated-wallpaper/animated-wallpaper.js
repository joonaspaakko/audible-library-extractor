import { createApp } from "vue";
import App from "./animated-wallpaper-app.vue";
const app = createApp(App);

Vue.config.productionTip = false;

app.mount('#animated-wallpaper');
