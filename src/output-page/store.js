import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

export default new Vuex.Store({
  
  state: {
    // States that get written and recovered from local storage
    sticky: {
      lightSwitch: 0,
    },
    tippyTheme: 'dark',
    searchActive: false,
    searchQuery: '',
    filterRules: null,
    sortBy: null,
    sortDirection: null,
  },
  
  mutations: {
    
    fromLocalStorage: function( state ) {
      
      const lsState = JSON.parse( localStorage.getItem('aleSettings') );
      if( lsState ) {
        _.assign( state.sticky, lsState );
        this.replaceState( state );
      }
      
    },
    
    prop: function(state, o) {
      state[ o.key ] = o.value;
    },
    
    stickyProp: function(state, o) {
      state.sticky[ o.key ] = o.value;
    },
    
  },
  
});