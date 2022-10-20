
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
    
  }

});
