// UPDATING VUEX QUERIES
const updateRouterQuery = {};
updateRouterQuery.install = function (app, options) {
  app.config.globalProperties.$updateQuery = function( config ) {
    
    config      = config || {};
    let query   = config.query;
    let value   = config.value;
    let history = config.history;  
    let queries = config.queries || this.$route.query;
    
    let queryClone = JSON.parse(JSON.stringify( queries ));
    
    // Toggle
    if ( value === undefined ) {
      if ( queryClone[ query ] ) delete queryClone[ query ];  
      else queryClone[ query ] = true;
    }
    // Truthy value adds the value
    // Falsy value removes the query
    else {
      if ( !value ) delete queryClone[ query ]; 
      else queryClone[ query ] = value;
    }
    
    // push() writes a history state...
    if ( history ) {
      this.$router.push({ query: queryClone }).catch(() => {}); 
    }
    // replace() doesn't...
    else {
      this.$router.replace({ query: queryClone }).catch(() => {}); 
    }
    
  };
  
  app.config.globalProperties.$updateQueries = function( queries, config ) {
    
    config      = config || {};
    let history = config.history;
    let queryClone = JSON.parse(JSON.stringify( config.queries || this.$route.query ));
    
    _.merge(queryClone, queries);
    _.each( queryClone, function( value, key ) {
      if ( _.isNil( value ) ) delete queryClone[ key ];
    });
    
    // push() writes a history state...
    if ( history ) {
      this.$router.push({ query: queryClone }).catch(() => {}); 
    }
    // replace() doesn't...
    else {
      this.$router.replace({ query: queryClone }).catch(() => {}); 
    }
    
  };
};

export default updateRouterQuery;