
export default {
  methods: {
    
    // options.request;
    // options.step;
    asynxios: async function( options ) {
      
      let response;
      if ( options.request.length > 0 ) {
        try {
          response = await Promise.all(
            options.request.map( function( url, index, array ) {
              return axios.get( url ).then(function( response ) {
                return response ? options.step(response, index, array) : null;
              }).catch(function( e ) {
                return e.response ? options.step(e.response, index, array) : null;
              });
            })
          );
        } catch (e) {
          console.log('Something went wrong', e);
        }
      }
      return response;
      
    },
    
  } 
}