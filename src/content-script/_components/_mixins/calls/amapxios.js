// import { param } from "jquery";
import rateLimit from "axios-rate-limit";

export default {
  methods: {
    
    minutesToMilliseconds: function( minutes ) { return minutes * 60 * 1000; },
    secondsToMilliseconds: function( seconds ) { return seconds * 1000; },
    
    amapxios: function(options) {
      
      const limiter = options.rateLimit || 50;
      const timeout = this.minutesToMilliseconds(1);
      
      // AXIOS
      let cAxios = axios.create();
      // AXIOS RETRY
      axiosRetry(cAxios, {
        retries: 1,
        retryDelay: function(retryCount) { return 1000 * retryCount; },
        retryCondition: function(error) {
          return axiosRetry.isNetworkOrIdempotentRequestError(error) || error && error.response && ( error.response.status == "500" || error.response.status == "400" || error.response.status == "429" );
        }
      });
      // AXIOS RATE LIMIT
      cAxios = rateLimit(cAxios, { maxRPS: limiter });
      
      // REQUEST LOOP
      asyncMapLimit(
        options.requests,
        limiter, // ASYNC MAP LIMITER
        function(request, stepCallback) {
          
          const axiosConfig = options.config || {};
          const requestURL = request.requestUrl || request.url || request;
          const controller = new AbortController();
          
          axiosConfig.signal = controller.signal;
          axiosConfig.validateStatus = function (status) {
            return status >= 200 && status < 400;
          };
          
          let requestTimer = setTimeout(() => {
            controller.abort('Request took too long... ('+ requestURL +')');
          }, timeout);
          
          cAxios.get(requestURL, axiosConfig).then(function(response) {
              
            clearTimeout(requestTimer); // Request succeeded: keep alive
            
            options.step( response,function(result) {
              stepCallback(null, result);
            }, request );
            
          })
          .catch(function(e) {
            
            clearTimeout(requestTimer); // Request succeeded: keep alive
            
            console.log( "%c" + "axios caught an error (step)" + "", "background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;", '\n', requestURL, '\n', e );
            if ( options.returnCatch ) {
              options.step( e.response, function(result) {
                stepCallback(null, result);
              }, request, 'processingError' );
            } 
            else {
              stepCallback(null, null);
            }
            
            });
            
        },
        function(err, results) {
          
          if (!err) {
            results = options.flatten ? _.flatten(results) : results;
            results = _.compact( results );
            options.done( results );
          }
          else {
            console.log( "%c" + "axios caught an error (done)" + "", "background: #f79a33; color: #fff; padding: 2px 5px; border-radius: 8px;", err );
            options.done( null, true );
          }
          
        }
      );
      
    },
  }
};
