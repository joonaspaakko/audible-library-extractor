import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  
  state: {
    tippyTheme: 'dark',
    searchActive: false,
  },
  
  mutations: {
    
    prop: function(state, o) {
      state[ o.key ] = o.value;
    },
    
  },
  
});