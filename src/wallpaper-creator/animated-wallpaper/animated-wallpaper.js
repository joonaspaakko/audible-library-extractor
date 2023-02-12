import { createApp } from "vue";
import App from "./animated-wallpaper-app.vue";
const app = createApp(App);

app.config.productionTip = false;

app.mount('#animated-wallpaper');
