// import { param } from "jquery";
import rateLimit from "axios-rate-limit";

export default {
  methods: {
    amapxios: function(options) {
      const vue = this;
      
      const letMeAxiosAQuestion = axios.create();
      axiosRetry(letMeAxiosAQuestion, {
        retries: 2,
        retryDelay: function(retryCount) { return 1000 * retryCount; },
        retryCondition: function(error) {
          return axiosRetry.isNetworkOrIdempotentRequestError(error) || error && error.response && ( error.response.status == "500" || error.response.status == "400" );
        }
      });
      const axiosLimited = rateLimit(letMeAxiosAQuestion, { maxRPS: 6 });
      
      asyncMap(
        options.requests,
        function(request, stepCallback) {
          const axiosConfig = options.config || {};
          
          axiosLimited
            .get((request.requestUrl || request.url || request), axiosConfig)
            .then(function(response) {
              options.step( response,function(result) {
                  stepCallback(null, result);
              }, request );
            })
            .catch(function(e) {
              if ( options.returnCatch ) {
                options.step( e.response, function(result) {
                    stepCallback(null, result);
                }, request );
              } 
              else {
                console.log( "%c" + "axios caught an error (step)" + "", "background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;", e );
                stepCallback(null, null);
              }
            });
        },
        function(err, results) {
          if (!err) {
            results = options.flatten ? _.flatten(results) : results;
            results = _.compact( results );
            options.done( results );
          } else {
            console.log( "%c" + "axios caught an error (done)" + "", "background: #f79a33; color: #fff; padding: 2px 5px; border-radius: 8px;", err );
            options.done( null );
          }
        }
      );
    }
  }
};
