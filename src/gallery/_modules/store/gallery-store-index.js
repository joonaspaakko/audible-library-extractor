import { createStore } from 'vuex';

import storeState from "./gallery-state.js";
import storeMutations from "./gallery-mutations.js";
import storeGetters from "./gallery-getters.js";

export default createStore({
  state: storeState,
  mutations: storeMutations,
  getters: storeGetters,
});
