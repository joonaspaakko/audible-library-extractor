
const setListRenderingOpts = {};
setListRenderingOpts.install = function (app, options) {
  app.config.globalProperties.$setListRenderingOpts = function( list ) {
    
    if ( this.$route.query.sortValues ) {
      const sortValuesIndex = _.findIndex( list.sort, { key: 'sortValues' });
      list.sort[ sortValuesIndex ].active = this.$route.query.sortValues;
    }
    
    if ( this.$route.query.sort ) {
      let currentSorter = _.find( list.sort, { current: true });
      currentSorter.current = false;
      const sortIndex = _.findIndex( list.sort, { key: this.$route.query.sort });
      if ( sortIndex > -1 ) {
        list.sort[ sortIndex ].current = true;
        list.sort[ sortIndex ].active = this.$route.query.sortDir === 'desc' ? true : false;
      }
    }
    
    if ( this.$route.query.filter ) {
      
      let paramFilters = decodeURIComponent(this.$route.query.filter).split(',');
      
      _.each( _.filter(list.filter, { type: 'filter' }), function( filter ) {
        filter.active = false;
        _.each( paramFilters, function( paramFilter ) {
          if ( filter.key === paramFilter ) filter.active = true;
        });
      });
      
    }
    
    if ( this.$route.query.filterExtras ) {
      
      let paramFilterExtras = this.$route.query.filterExtras.split(',');
      paramFilterExtras = _.map( paramFilterExtras, function( param ) { return decodeURIComponent(param); });
      
      _.each( paramFilterExtras, function( key ) {
        
        let splitColon = key.split(':');
        let targetKey = splitColon[0];
        let targetItem = _.find(list.filter, { type: 'filterExtras', key: targetKey });
        
        
        
        if ( targetItem ) {
          targetItem.active = true;
          if ( splitColon.length > 1 ) {
            
            if ( targetItem.dropdownOpts ) {
              targetItem.value = splitColon[1].split('|');
            }
            else if ( targetItem.range ) {
              let splitDash = splitColon[1].split('-');
              let min = parseFloat( splitDash[0] );
              let max = parseFloat( splitDash[1] );
              targetItem.range = [min, max];
            }
            
          }
        }
        
      });
      
    }
    
    if ( this.$route.query.scope ) {
      
      let paramScope = decodeURIComponent(this.$route.query.scope).split(',');
      
      _.each( list.scope, function( scope ) {
        scope.active = false;
        _.each( paramScope, function( paramScope ) {
          if ( scope.key === paramScope ) scope.active = true;
        });
      });
      
    }
    
    this.$store.commit("prop", { key: "listRenderingOpts", value: list });
    
  };
};

export default setListRenderingOpts;