
export default {
  methods: {
    
    // options.request;
    // options.step;
    // options.done;
    // options.flatten;
    ajaxios: function( options ) {
      
      if ( options.request.length > 0 ) {
        
        Promise.all(
          options.request.map( function( url, index, array ) {
            return axios.get( url ).then(function( response ) {
              return response ? options.step(response, index, array) : null;
            }).catch(function( e ) {
              return e.response ? options.step(e.response, index, array) : null;
            });
          })
        ).then( function( responses ) {
          if ( responses && responses.length > 0 ) {
            options.done( options.flatten ? _.flatten(responses) : responses  ); 
          }
        }).catch(function (error) {
          console.log(error);
        });
        
      }
      
    },
    
  } 
}