
// import _ from "lodash";
import { createStore } from 'vuex';

export default createStore({
  state: {
    canceledRequests: [],
    progress: {
      text: null,
      textSuffix: null,
      text2: null,
      step: 0,
      max: 0,
      bar: false,
      thumbnail: null
    },
    bigStep: {
      title: "",
      step: 0,
      max: 0
    },
    subStep: {
      step: 0,
      max: 0
    },
    storageHasData: {
      books: null,
      isbn: null,
      wishlist: null,
      collections: null,
    },
    storageConfig: {},
    dataVersion: {},
    extractSettings: [
      {
        label: "Library",
        name: "books",
        value: true,
        disabled: true,
        type: "is-success",
        tippy: "Library is required in order to extract collections and isbn.",
        trashTippy: 'This will also remove Collections and ISBN data.',
        kind: 'main',
      },
      {
        label: "Collections",
        name: "collections",
        parent: 'books',
        value: true,
        disabled: false,
        type: "is-info",
        tippy: "Super quick extraction that just needs to check the first <br>page of each collection to find out the title and description",
        kind: 'main',
      },
      {
        label: "ISBN",
        name: "isbn",
        parent: 'books',
        value: false,
        disabled: false,
        type: "is-danger",
        tippy: "International Standard Book Numbers (ISBN) are required if you want to try importing your library to Goodreads. <br>ISBNs are fetched for library books and not for books in the wishlist. Very slow extraction.",
        kind: 'main',
      },
      {
        label: "Wishlist",
        name: "wishlist",
        value: false,
        disabled: false,
        type: "is-success",
        tippy: "Similar to library extraction but series order is not fetched. Books that also exist in your library are dropped <br>off as long as you also extract library data.",
        kind: 'main',
        // cannotAccessTippy: this.cannotAccessWishlist ? '<a href="https://audible.com/login">audible.com/login</a>' : null,
      },
      {
        name: "saveStandaloneAfter",
        value: false,
        label: "Start saving the standalone gallery immediately after extraction",
        kind: 'extra',
      }
    ]
  },

  mutations: {

    fromLocalStorage: function(state) {
      const lsState = JSON.parse(localStorage.getItem("ale-content-script"));
      if (lsState) _.merge( state.sticky, lsState );
    },

    update(state, config) {

      let setValues = function (config) {
        config = config || {};
        if (config.key) {
          let newValue = config.value;
          if ( config.add ) {
            const oldValue = _.get(state, config.key);
            newValue = (oldValue || 0) + config.add;
          }
          newValue = config.freeze ? Object.freeze(newValue) : newValue;
          _.set(state, config.key, newValue);
        }
      };

      if (_.isArray(config)) {
        _.each(config, function(conf) {
          setValues(conf);
        });
      } else {
        setValues(config);
      }
      
    },
    
    resetProgress: function( state ) {
      
      state.progress.text = null;
      state.progress.textSuffix = null;
      state.progress.text2 = null;
      state.progress.step = 0;
      state.progress.max = 0;
      state.progress.bar = false;
      state.progress.thumbnail = null;
      
    },
    
    pushToCanceledRequests: function( state, value ) {
      state.canceledRequests.push( value );
    },
    
    updateSetting: function( state, o ) {
      
      o = _.isArray(o) ? o : [o];
      
      _.each( o, function( o ) {
        
        const setting = _.find(state.extractSettings, { name: o.item.name });
        _.merge( setting, o.obj );
        
      });
      
    },
    
  },
  
  getters: {
    
    settings_mainSteps: function( state ) {
      return _.filter(state.extractSettings, { kind: 'main' });
    },
    
    settings_extras: function( state ) {
      return _.filter(state.extractSettings, { kind: 'extra' });
    },
    
    mainDataExists: function( state ) {
      return state.storageHasData.books || state.storageHasData.wishlist;
    },
    
  }

});
