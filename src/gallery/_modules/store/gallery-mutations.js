
export default {

  fromLocalStorage: function(state) {
    const lsState = JSON.parse(localStorage.getItem("aleSettings"));
    if (lsState) _.merge( state.sticky, lsState );
  },

  prop(state, config) {

    let setValues = function (config) {
      config = config || {};
      if (config.key) {
        let newValue = config.freeze ? Object.freeze(config.value) : config.value;
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

  buildStandaloneData: function(state, inputArray) {
    state.audibledata = state.audibledata || {};
    _.each(inputArray, function( item ) {
      if ( item.key ) _.set( state, 'audibledata.' + item.key, Object.freeze( item.value ));
    });
  },

  stickyProp: function(state, o) {
    state.sticky[o.key] = o.value;
  },

  // Re-validates the saved cover size against the grid's current measurements, so a size
  // saved under a different viewport/layout snaps to the nearest size that still fits.
  // Runs whenever the grid re-measures (mount, resize, layout change), not just when the
  // settings panel happens to be open, since that's the only place this used to apply.
  snapCoverSize: function(state) {

    const current = state.sticky.coverSize;
    if ( !current ) return;

    const listMode = state.sticky.gridDetailsMode === 'list';
    const available = state.gridAvailableWidth;
    if ( !available ) return;

    const gridWidth = listMode
      ? available
      : Math.min( state.sticky.gridMaxWidth || state.gridDefaultMaxWidth, available );

    const coverSizeMin = ( state.windowWidth < state.mobileWidth ) ? state.coverSizeMinMobile : state.coverSizeMin;

    const MIN_STEP_GAP = 10;
    const raw = [];
    let n = ( !listMode && state.windowWidth >= state.mobileWidth ) ? 2 : 1;
    while ( true ) {
      const size = Math.floor( gridWidth / n );
      if ( size < coverSizeMin ) break;
      raw.push( { size: Math.min( size, state.coverSizeMax ), n } );
      n++;
    }
    const steps = raw.reduce(function( kept, entry, i ) {
      if ( i === 0 || i === raw.length - 1 ) return kept.concat( entry );
      if ( kept[ kept.length - 1 ].size - entry.size >= MIN_STEP_GAP ) return kept.concat( entry );
      return kept;
    }, [] ).reverse();
    if ( !steps.length ) return;

    const snapped = _.minBy( steps, s => Math.abs( s.size - current ) ).size;
    if ( snapped !== current ) state.sticky.coverSize = snapped;

  },

  addListRenderingOpts: function(state, o) {

    if ( o.sortValues !== undefined ) {
      let sortValues = _.find( state.listRenderingOpts.sort, { key: 'sortValues' });
      if ( sortValues ) sortValues.active = o.sortValues;
    }

    if ( o.splice ) {
      state.listRenderingOpts[o.listName].splice(o.splice, 0, o.option);
    }
    else if ( o.unshift ) {
      state.listRenderingOpts[o.listName].unshift( o.option );
    }
    else {
      state.listRenderingOpts[o.listName].push( o.option );
    }

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
    let currentItem = currentList[ (o.index === 0 || o.index) ? o.index : _.findIndex( currentList, { key: o.key })];
    
    if ( o.sortValues !== undefined ) {
      let sortValues = _.find( state.listRenderingOpts.sort, { key: 'sortValues' });
      if ( sortValues ) sortValues.active = o.sortValues;
    }

    // null = "Follow sort"; any sort key = lock the displayed value to that field.
    if ( o.sortValuesDisplayKey !== undefined ) {
      let sortValues = _.find( state.listRenderingOpts.sort, { key: 'sortValues' });
      if ( sortValues ) sortValues.displayKey = o.sortValuesDisplayKey;
    }

    // if ( o.group ) {
    //   let groupies = _.filter( currentList, { group: currentItem.group });
    //   _.each( groupies, function( groupie, index ) {
    //     groupie.active = false;
    //   });
    // }

    if ( o.active === false || o.active === true ) currentItem.active = o.active;
    
    if ( currentItem.type === 'filterExtras' ) {
      if ( o.range ) currentItem.range = o.range;
      if ( o.value ) currentItem.value = o.value;
    }

    // Changes the currently active sorter (in sort: active state controls the direction)
    if ( o.listName === "sort" && currentItem.type === 'sort' ) {
      const currentSorters = _.filter( currentList, "current" );
      _.each( currentSorters, (sorter) => {
        sorter.current = false;
      });
      currentItem.current = true;
    }
    
  },


  resetFilters: function(state, o) {

    _.each( state.listRenderingOpts.filter, function( filter ) {
      filter.active = (filter.type === 'filter');
    });

  },

  navHistory: function( state, config ) {
    
    const direction = config.pushOnly ? config.key : (config.key === 'back' ? 'forward' : 'back');
    state.navHistory[ direction ].push( config.value );
    if ( !config.pushOnly ) {
      state.navHistory[ config.key ].pop;
      state.navHistory.btnNavigation = true;
    }
    
  },
  
  updatePlayerProgress: function( state, config ) {
    
    const cachedIndex = _.findIndex( state.sticky.player.books, { asin: config.asin });
    
    // Update existing object
    if ( cachedIndex > -1 ) _.set( state.sticky.player, 'books['+ cachedIndex +'].progress', config.progress  );
    // New object
    else state.sticky.player.books.push( config );
    
  },

};
