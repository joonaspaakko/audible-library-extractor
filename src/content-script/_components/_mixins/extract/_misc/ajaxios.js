// import { param } from "jquery";

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
              return response ? options.step(response, index, array, callback) : null;
            }).catch(function( e ) {
              return e.response ? options.step(e.response, index, array, callback) : null;
            });
            
          })
        ).then( function( responses ) {
          if ( responses && responses.length > 0 ) {
            console.log('%c' + 'asdfasdf' + '', 'background: #dbff00; color: #000; padding: 2px 5px; border-radius: 8px;', options.flatten);
            options.done( options.flatten ? _.flatten(responses) : responses  ); 
          }
        }).catch(function (error) {
          console.log(error);
        });
        
      }
      
    },
    
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
    
    amapxios: function( options ) {
      
      asyncMap( options.requests, function( request, stepCallback ) {
        const axiosConfig = options.config ? options.config : null;
        axios.get( (request.url || request), axiosConfig ).then(function( response ) {
          options.step( response, function(result) { stepCallback(null,result) }, request );
        }).catch(function( e ) {
          if ( !e.response ) {
            console.log('%c' + 'axios caught an error' + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;', e);
          }
          else if ( options.returnCatch ) {
            options.step( e.response, function(result) { stepCallback(null,result) } );
          }
          else {
            stepCallback(null,null);
          }
        });
        
      },
      function( err, results ) {
        if ( !err ) { 
          options.done( options.flatten ? _.flatten(results) : results );
        }
        else { console.log( err ); }
      });
      
    },
    
  } 
}