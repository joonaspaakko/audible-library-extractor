import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

export default new Vuex.Store({
  
  state: {
    // States that persist by reading and writing to localStorage
    sticky: {
      lightSwitch: 1,
      lightSwitchSetByUser: false,
      // sortValues: false,
      viewMode: 'grid',
    },
    // States that don't persist
    searchMounted: false,
    searchCollection: [],
    mutatingCollection: [],
    collectionSource: null,
    pageCollection: null,
    route: null,
    library: null,
    urlOrigin: null,
    searchQuery: "",
    searchSort: false,
    standalone: null,
    displayMode: null,
    listRenderingOpts: null,
    windowWidth: window.innerWidth,
    showBackground: false,
  },

  mutations: {
    fromLocalStorage: function(state) {
      const lsState = JSON.parse(localStorage.getItem("aleSettings"));
      if (lsState) state.sticky = _.assign( state.sticky, lsState );
    },

    prop: function(state, o) {
      const inputIsArray = _.isArray(o);
      if ( !o.freeze ) {
        if ( !inputIsArray ) state[o.key] = o.value;
        else _.each(o, function( b ) { state[b.key] = b.value; });
      }
      else {
        if ( !inputIsArray ) state[o.key] = Object.freeze( o.value );
        else _.each(o, function( b ) { state[b.key] = Object.freeze( b.value ); });
      }
    },

    stickyProp: function(state, o) {
      state.sticky[o.key] = o.value;
    },
    
    addListRenderingOpts: function(state, o) {
      
      if ( o.sortValues !== undefined ) {
        let sortValues = _.find( state.listRenderingOpts.sort, { key: 'sortValues' });
        if ( sortValues ) sortValues.active = o.sortValues;
      }
      
      state.listRenderingOpts[o.listName].push( o.option );
      
      if ( o.activate ) {
        if ( o.listName === 'sort' ) {
          const currentSorter = _.find( state.listRenderingOpts[o.listName], "current" );
          if ( currentSorter ) currentSorter.current = false;
          o.option.current = true;
        }
        else {
          const currentlyActive = _.find( state.listRenderingOpts[o.listName], "active" );
          currentlyActive.active = false;
          o.option.active = true;
        }
      }
      
    },
    
    updateListRenderingOpts: function(state, o) {
      
      let currentList = state.listRenderingOpts[o.listName];
      let currentItem = currentList[o.index];
      
      if ( o.group ) {
        let groupies = _.filter( currentList, { group: currentItem.group });
        _.each( groupies, function( groupie, index ) {
          groupie.active = false;
        });
      }
      
      currentItem.active = o.active;
      
      // Changes the currently active sorter (in sort: active state controls the direction)
      if ( o.listName === "sort" && currentItem.type === 'sort' ) {
        const currentSorter = _.find( currentList, "current" );
        currentSorter.current = false;
        currentItem.current = true;
      }
            
    },
    
  },
  
  getters: {
    sortValues: function( state ) {
      return _.find( state.listRenderingOpts.sort, { key: "sortValues" }).active;
    },
    sortBy: function( state ) {
      return _.find( state.listRenderingOpts.sort, 'current').key;
    },
    filterKeys: function( state ) {
      return _.map(_.filter( state.listRenderingOpts.filter, { type: 'filter', active: true }), function( o ) {
        return o.key;
      }).join(',');
    },
    filterExtrasKeys: function( state ) {
      return _.map(_.filter( state.listRenderingOpts.filter, { type: 'filterExtras', active: true }), function( o ) {
        return o.key;
      }).join(',');
    },
    scopeKeys: function( state ) {
      return _.map(_.filter( state.listRenderingOpts.scope, 'active'), function( o ) {
        return o.key;
      }).join(',');
    },
    searchIsActive: function( state ) {
      return state.searchQuery.trim() !== "";
    },
    // collection: function( state ) {
    //   return _.get(state, state.collectionSource);
    // },
    collection: function( state ) {
      const searchIsActive = state.searchQuery.trim() !== "";
      if ( searchIsActive ) {
        return state.searchCollection;
      }
      else {
        return state.mutatingCollection;
      }
    },
  }
  
});
