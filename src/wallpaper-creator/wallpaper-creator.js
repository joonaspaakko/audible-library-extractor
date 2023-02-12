// VUE
import { createApp } from "vue";
import App from "./wallpaper-creator-app.vue";
const app = createApp(App);

// For vue form multiselect...
// import VueCompositionAPI from '@vue/composition-api';
// app.use(VueCompositionAPI);

import store from "./wallpaper-creator-store.js";
app.use( store );

// VUE SHORTKEY
import shortkey from 'vue3-shortkey';
app.use(shortkey);

import vueClickOutsideElement from 'vue-click-outside-element';
app.use(vueClickOutsideElement);

// VUE-TIPPY
import VueTippy from "vue-tippy";
app.use(VueTippy, {
	directive: 'tippy', // => v-tippy
	component: 'tippy', // => <tippy/>
	componentSingleton: 'tippy-singleton', // => <tippy-singleton/>,
	defaultProps: {
		placement: 'auto-end',
		allowHTML: true,
		arrow: true,
		placement: "top",
		trigger: "mouseenter focus",
		theme: "light-border",
		zIndex: 9999999991,
		delay: [500,0],
		a11y: false,
		maxWidth: 670,
		onShow: options => {
			return !!options.props.content;
		},
		boundary: "viewport",
		flipDuration: 0
	}, // => Global default options * see all props
});
import 'tippy.js/dist/tippy.css';

// Canvas panning
import vueDragscroll from "vue-dragscroll";
app.use(vueDragscroll);

// For emitting custom events between components
import mitt from 'mitt';
app.config.globalProperties.$emitter = new mitt();

app.config.productionTip = false;

app.mount('#wallpaper-creator');

