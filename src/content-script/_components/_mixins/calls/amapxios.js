// import { param } from "jquery";
import rateLimit from "axios-rate-limit";

export default {
  methods: {
    
    minutesToMilliseconds: function( minutes ) { return minutes * 60 * 1000; },
    secondsToMilliseconds: function( seconds ) { return seconds * 1000; },
    
    amapxios: function(options) {
      
      const vue = this;
      const limiter = options.rateLimit || this.$store.state.axiosRateLimit;
      const maxTimeout = this.minutesToMilliseconds(1);
      
      // AXIOS
      let cAxios = axios.create();
      // AXIOS RETRY
      // axiosRetry(cAxios, {
      //   retries: 1,
      //   retryDelay: function(retryCount) { return 1000 * retryCount; },
      //   retryCondition: function(error) {
      //     return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED';
      //   },
      //   shouldResetTimeout: true,
      // });
      // AXIOS RATE LIMIT
      // cAxios = rateLimit(cAxios, { maxRPS: limiter });
      cAxios = rateLimit(cAxios, limiter);
      
      // REQUEST LOOP
      asyncMapLimit(
        options.requests,
        limiter.maxRequests, // ASYNC MAP LIMITER
        function(request, stepCallback) {
          
          const axiosConfig = options.config || {};
          const requestURL = request.requestUrl || request.url || request;
          const controller = new AbortController();
          
          const urlAlreadyFailed = _.includes( vue.$store.state.failedRequests, requestURL);
          console.log('urlAlreadyFailed', urlAlreadyFailed, JSON.parse(JSON.stringify(vue.$store.state.failedRequests)), requestURL);
          if ( urlAlreadyFailed ) {
            stepCallback(null, null);
            return;
          }
          
          axiosConfig.signal = controller.signal;
          axiosConfig.validateStatus = function (status) {
            return status >= 200 && status < 400;
          };
          
          let requestTimer = setTimeout(() => {
            controller.abort('Request took too long... ('+ requestURL +')');
          }, maxTimeout );
          
          let requestResult = null;
          cAxios.get(requestURL, axiosConfig)
          // SUCCESS
          .then(function(response) {
            
            try {
              options.step( response, function(result) {
                requestResult = result;
              }, request );
            } catch(e) {
              console.log( "%c" + "axios caught an error (step)" + "", "background: #0082ab; color: #fff; padding: 2px 5px; border-radius: 8px;", e );
            }
            
          })
          // FAILURE
          .catch(function(e) {
            
            const status = _.get(e, 'response.status');
            if ( status == 404 ) vue.$store.commit('pushToFailedRequests', requestURL);
            
            console.log( "%c" + "axios caught an error (step)" + "", "background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;", '\n\n', requestURL, '\n\n', e );
            
            if ( _.get( e, 'message') === 'canceled' ) vue.$store.commit('pushToCanceledRequests', requestURL);
            
            try {
              if ( options.returnCatch ) {
                options.step( _.get( e, 'response', e), function(result) {
                  requestResult = result;
                }, request, 'processingError' );
              }
            } catch(e) {
              console.log( "%c" + "axios caught an error (step)" + "", "background: #0082ab; color: #fff; padding: 2px 5px; border-radius: 8px;", e );
            }
            
          })
          // ALWAYS
          .then(function() {
            
            clearTimeout(requestTimer); // Request succeeded: keep alive
            stepCallback(null, requestResult);
            
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
