
export default {
  sortValues: function( state ) {
    const sortValues = _.find( _.get(state,'listRenderingOpts.sort'), { key: "sortValues" });
    return _.get(sortValues, 'active');
  },
  sortBy: function( state ) {
    const sort = _.find( _.get(state,'listRenderingOpts.sort'), 'current');
    return _.get(sort,'key');
  },
  regularFilters: function( state ) {
    return _.filter( _.get(state,'listRenderingOpts.filter'), { type: 'filter' }).length > 0;
  },
  filterKeys: function( state ) {
    return _.map(_.filter( _.get(state,'listRenderingOpts.filter'), { type: 'filter', active: true }), function( o ) {
      return o.key;
    }).join(',');
  },
  filterKeysLength: function( state ) {
    return _.filter( _.get(state,'listRenderingOpts.filter'), { type: 'filter' }).length;
  },
  filterExtrasKeys: function( state ) {
    return _.map(_.filter( _.get(state,'listRenderingOpts.filter'), { type: 'filterExtras', active: true }), function( o ) {
      return o.key;
    }).join(',');
  },
  scopeKeys: function( state ) {
    return _.map(_.filter( _.get(state,'listRenderingOpts.scope'), 'active'), function( o ) {
      return o.key;
    }).join(',');
  },
  searchIsActive: function( state ) {
    return state.searchQuery.trim() !== "";
  },
  collectionSource: function( state, getters ) {
    const libary = state.collectionSource === 'library.books';
    return libary ? getters.regularBooks : _.get(state, state.collectionSource);
    // return getters.searchIsActive ? state.searchCollection : libary ? getters.regularBooks : _.get(state, state.collectionSource);
  },
  collectionTotal: function( state, getters ) {
    const libary = state.collectionSource === 'library.books';
    return libary ? getters.regularBooks.length : _.get(state, state.collectionSource, []).length;
  },
  collection: function( state, getters ) {
    if ( getters.searchIsActive ) {
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
  
  audioPlayerBook( state, getters ) {
    return _.get( state.audioPlayer.audio, 'book', {});
  },
  audioPlayerTitle( state, getters ) {
    const book = _.get( getters, 'audioPlayerBook', {});
    return book.title || book.titleShort;
  },
  
  mobileThreshold( state ) {
    return state.windowWidth < state.mobileWidth;
  },
  
  showPageTitle( state ) {
    return !!(state.pageSubTitle || state.pageTitle);
  },
  
  regularBooks( state, getters ) {
    
    const books = _.filter(state.library.books, o => !_.get(o,'podcastParent'));
    return books;
    
  },
  podcasts( state, getters ) {
    
    const books = state.library.books;
    const podcasts = _.filter(books, 'podcastParent');
    return podcasts;
    
  },
  
};
