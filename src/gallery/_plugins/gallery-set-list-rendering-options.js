
const setListRenderingOpts = {};
setListRenderingOpts.install = function (app, options) {
  app.config.globalProperties.$setListRenderingOpts = function( list ) {
    
    // Query values are strings, so "false" would be truthy and re-enable sort values on
    // every refresh. Restore only when the key is present, and compare to the string.
    if ( this.$route.query.sortValues !== undefined ) {
      const sortValuesIndex = _.findIndex( list.sort, { key: 'sortValues' });
      list.sort[ sortValuesIndex ].active = this.$route.query.sortValues === 'true';
    }

    if ( this.$route.query.sortValuesDisplayKey ) {
      const sortValuesIndex = _.findIndex( list.sort, { key: 'sortValues' });
      list.sort[ sortValuesIndex ].displayKey = this.$route.query.sortValuesDisplayKey;
    }

    if ( this.$route.query.sort ) {
      let currentSorter = _.find( list.sort, { current: true });
      currentSorter.current = false;
      const sortIndex = _.findIndex( list.sort, { key: this.$route.query.sort });
      if ( sortIndex > -1 ) {
        list.sort[ sortIndex ].current = true;
        list.sort[ sortIndex ].active = this.$route.query.sortDir === 'desc';
      }
    }
    
    if ( this.$route.query.filter ) {
      
      let paramFilters = this.$route.query.filter.split(',');
      
      _.each( _.filter(list.filter, { type: 'filter' }), function( filter ) {
        filter.active = false;
        _.each( paramFilters, function( key ) {
          if ( filter.key === key ) filter.active = true;
        });
      });
      
    }
    
    if ( this.$route.query.filterExtras ) {

      let paramFilterExtras;
      try {
        paramFilterExtras = JSON.parse( this.$route.query.filterExtras );
      }
      catch ( error ) {
        paramFilterExtras = [];
      }

      _.each( paramFilterExtras, function( entry ) {

        let targetItem = _.find(list.filter, { type: 'filterExtras', key: entry.key });

        if ( targetItem ) {
          targetItem.active = true;
          if ( entry.range ) targetItem.range = entry.range;
          else if ( entry.value ) targetItem.value = entry.value;
        }
        
      });
      
    }
    
    if ( this.$route.query.scope ) {
      
      let paramScope = this.$route.query.scope.split(',');
      
      _.each( list.scope, function( scope ) {
        scope.active = false;
        _.each( paramScope, function( key ) {
          if ( scope.key === key ) scope.active = true;
        });
      });
      
    }
    
    this.$store.commit("prop", { key: "listRenderingOpts", value: list });
    
  };
};

export default setListRenderingOpts;