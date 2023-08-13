
// import _ from "lodash";
import { createStore } from 'vuex';

export default createStore({
  state: {
    appVersion: import.meta.env.PACKAGE_VERSION,
    localStorageName: 'ale-content-script-settings',
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
    toastOpts: {
      position: 'top',
      duration: 4000,
    },
    storageConfig: {},
    dataVersion: null,
    extractBtnDisabled: false,
    extractionButtonDisabled: false,
    axiosRateLimit: { 
      maxRequests: 10, 
      perMilliseconds: 1000,
    },
    failedRequests: [],
    lastFailedRequestStatus: null,
    taking_a_break: false,
    noWishlistAccess: false,
    checkingWishlistAccess: false,
    sticky: {
      openOnLoad: false,
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
          deleteChunks: ['books', 'series', 'collections'],
          partialData: true,
        },
        {
          label: "Collections",
          name: "collections",
          parent: 'books',
          value: true,
          disabled: false,
          type: "is-success",
          tippy: "Very quick extraction that just needs to check the first page of each collection to find out the title and description",
          kind: 'main',
          partialData: true,
        },
        {
          label: "Wishlist",
          name: "wishlist",
          value: false,
          disabled: false,
          type: "is-success",
          tippy: "Similar to library extraction but series order is not fetched. Books that also exist in your library are dropped off as long as you also extract library data.",
          kind: 'main',
          partialData: true,
          // cannotAccessTippy: this.cannotAccessWishlist ? '<a href="https://audible.com/login">audible.com/login</a>' : null,
        },
        {
          label: "ISBN",
          name: "isbn",
          parent: 'books',
          value: false,
          disabled: false,
          type: "is-danger",
          tippy: "International Standard Book Numbers (ISBN) are required if you want to try importing your library to Goodreads. ISBNs are fetched for library books only. Very slow extraction time.",
          kind: 'main',
          partialData: true,
        },
        {
          name: "saveStandaloneAfter",
          value: false,
          label: "Save standalone gallery after extraction",
          kind: 'extra',
        },
        {
          name: "saveCSVAfter",
          value: false,
          label: "Save  CSV spreadsheet after extraction",
          kind: 'extra',
        }
      ],
    },
  },

  mutations: {

    fromLocalStorage: function(state) {
      let lsState = localStorage.getItem( state.localStorageName );
      if ( lsState && lsState != "undefined" ) {
        
        lsState = JSON.parse( lsState );
        
        const settings = _.map( lsState.extractSettings, function(o) {
          return { 
            disabled: o.disabled,
            value   : o.value,
          };
        });
        
        lsState.extractSettings = [];
        
        _.merge(state.sticky, lsState);
        
        _.merge( state.sticky.extractSettings, settings );
        
      }
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
      
      state.progress.text       = null;
      state.progress.textSuffix = null;
      state.progress.text2      = null;
      state.progress.step       = 0;
      state.progress.max        = 0;
      state.progress.bar        = false;
      state.progress.thumbnail  = null;
      
    },
    
    pushToCanceledRequests: function( state, value ) {
      state.canceledRequests.push( value );
    },
    
    updateSetting: function( state, o ) {
      
      o = _.castArray(o);
      
      _.each( o, function( o ) {
        
        const setting = _.find(state.sticky.extractSettings, { name: o.item.name });
        _.merge( setting, o.obj );
        
      });
      
    },

    pushToFailedRequests(state, url) {
      state.failedRequests.push(url);
    },
    
  },
  
  getters: {
    
    settings_mainSteps: function( state ) {
      
      return _.filter(state.sticky.extractSettings, { kind: 'main' });
    },
    
    settings_extras: function( state ) {
      return _.filter(state.sticky.extractSettings, { kind: 'extra' });
    },
    
    mainDataExists: function( state ) {
      return state.storageHasData.books || state.storageHasData.wishlist;
    },
    
    
    setting: ( state ) => ( settingName ) => {
      return _.find(state.sticky.extractSettings, { name: settingName });
    },
    
    partialDataSettings( state, getters ) {
      
      const partalData_Settings = _.filter( getters.settings_mainSteps, { partialData: true });
      const keys = _.map( partalData_Settings, 'name');
      
      
      // hasData.books || hasData.wishlist || hasData.isbn
      // console.log( keys );
      
      const mainStepsData = _.map( keys, ( settingKey ) =>  {
        return _.get( state.storageHasData, settingKey );
      });
      
      return _.every( mainStepsData, true );
      
    },
    
    partialDataSettings( state, getters ) {
      
      const partalData_Settings = _.filter( getters.settings_mainSteps, { partialData: true });
      const keys = _.map( partalData_Settings, 'name');
      
      return _.map( keys, ( settingKey ) =>  {
        return _.get( state.storageHasData, settingKey );
      });
      
    },
    partialDataSettings_all( state, getters ) {
      return _.every( getters.partialDataSettings, true );
    },
    partialDataSettings_any( state, getters ) {
      return _.includes( getters.partialDataSettings, true );
    },
    
  }

});
