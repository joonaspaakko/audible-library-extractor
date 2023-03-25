
export default {
  sortValues: function( state ) {
    return _.find( state.listRenderingOpts.sort, { key: "sortValues" }).active;
  },
  sortBy: function( state ) {
    return _.find( state.listRenderingOpts.sort, 'current').key;
  },
  regularFilters: function( state ) {
    return _.filter( state.listRenderingOpts.filter, { type: 'filter' }).length > 0;
  },
  filterKeys: function( state ) {
    return _.map(_.filter( state.listRenderingOpts.filter, { type: 'filter', active: true }), function( o ) {
      return o.key;
    }).join(',');
  },
  filterKeysLength: function( state ) {
    return _.filter( state.listRenderingOpts.filter, { type: 'filter' }).length;
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
  collectionSource: function( state ) {
    return state.searchQuery.trim() !== "" ? state.searchCollection : _.get(state, state.collectionSource);
  },
  collectionTotal: function( state ) {
    return _.get(state, state.collectionSource, []).length;
  },
  collection: function( state ) {
    const searchIsActive = state.searchQuery.trim() !== "";
    if ( searchIsActive ) {
      return state.searchCollection;
    }
    else {
      return state.mutatingCollection;
    }
  },
  saveStandaloneAfter: function( state ) {

    let extraSettings = _.get( state, 'extractSettings.extraSettings' );
    if ( extraSettings ) {
      let saveStandaloneAfter = _.find( extraSettings, { name: 'saveStandaloneAfter', value: true, deactivated: false });
      if ( saveStandaloneAfter ) return true;
    }

  },
};
