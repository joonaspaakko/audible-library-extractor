import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

import storeState from "./state.js";
import storeMutations from "./mutations.js";
import storeGetters from "./getters.js";

export default new Vuex.Store({
  state: storeState,
  mutations: storeMutations,
  getters: storeGetters,
});
