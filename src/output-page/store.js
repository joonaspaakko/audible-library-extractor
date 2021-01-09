import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

export default new Vuex.Store({
  
  state: {
    // States that persist by reading and writing to localStorage
    sticky: {
      lightSwitch: 0,
      listRenderingOpts: null,
    },
    // States that don't persist
    tippyTheme: 'dark',
    searchActive: false,
    searchQuery: '',
    filterRules: null,
    sortBy: null,
    sortDirection: null,
    urlOrigin: null,
    library: null,
    displayMode: null,
    standalone: null,
    route: null,
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
    
    updateListRenderingOpts: function( state, o ) {
      state.sticky.listRenderingOpts[ o.listName ][ o.index ].active = o.active;
      if ( o.listName === 'sort' ) {
        const currentSorter = _.find( state.sticky.listRenderingOpts[ o.listName ], 'current' );
        currentSorter.current = false;
        state.sticky.listRenderingOpts[ o.listName ][ o.index ].current = true;
      }
    },
    
  },
  
});
