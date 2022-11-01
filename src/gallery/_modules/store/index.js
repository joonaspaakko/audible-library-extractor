import { createStore } from 'vuex';

import storeState from "./state.js";
import storeMutations from "./mutations.js";
import storeGetters from "./getters.js";

export default createStore({
  state: storeState,
  mutations: storeMutations,
  getters: storeGetters,
});
