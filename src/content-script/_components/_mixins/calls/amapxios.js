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
      
      const getRequestId = ( inputUrl ) => {
        
        let url = new Url( DOMPurify.sanitize(inputUrl) );
        
        if ( url.query.asin ) {
          return url.query.asin;
        }
        else {
          const splitPath = url.path.split('/');
          return splitPath[splitPath.length-1];
        }
        
      };
      
      
      asyncMapLimit( options.requests, limiter.maxRequests, function(request, stepCallback) {
              
        const axiosConfig = options.config || {};
        const requestURL  = request.requestUrl || request.url || request;
        const requestId   = request.requestId || request.asin || getRequestId( requestURL );
        const controller  = new AbortController();
        
        const urlAlreadyFailed = _.includes( vue.$store.state.failedRequests, requestId);
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
          vue.$store.commit('update', { key: "lastFailedRequestStatus", value: status });
          
          // console.log( '404 STATUS ', status == 404 );
          if ( status == 404 || status == 503 ) vue.$store.commit('pushToFailedRequests', requestId);
          
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
          
      }, function(err, results) {
        
        if (!err) {
          results = options.flatten ? _.flatten(results) : results;
          results = _.compact( results );
          options.done( results );
        }
        else {
          console.log( "%c" + "axios caught an error (done)" + "", "background: #f79a33; color: #fff; padding: 2px 5px; border-radius: 8px;", err );
          options.done( null, true );
        }
        
      });
      
    },
    
    chunkAmapxios: function(options) {
      
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
      
      const getRequestId = ( inputUrl ) => {
        
        let url = new Url( DOMPurify.sanitize(inputUrl) );
        
        if ( url.query.asin ) {
          return url.query.asin;
        }
        else {
          const splitPath = url.path.split('/');
          return splitPath[splitPath.length-1];
        }
        
      };
      
      const break_threshold = 300;
      const break_time = 10000;
      
      const requestChunks = _.chunk( options.requests, break_threshold );
      
      let chunkCounter = -1;
      // Requests are split into chunks
      // When each chunk is completed, there's small delay before starting a new chunk.
      asyncMapLimit( requestChunks, 1, function( requestChunk, eachCallback ) {
        ++chunkCounter;
        vue.$store.commit('update', { key: 'taking_a_break', value: true });
        // Delay
        setTimeout(() => {
          
          vue.$store.commit('update', { key: 'taking_a_break', value: false });
          
          // 1 chunk of requests per loop...
          asyncMapLimit( requestChunk, limiter.maxRequests, function(request, stepCallback) {
              
            const axiosConfig = options.config || {};
            const requestURL  = request.requestUrl || request.url || request;
            const requestId   = request.requestId || request.asin || getRequestId( requestURL );
            const controller  = new AbortController();
            
            const urlAlreadyFailed = _.includes( vue.$store.state.failedRequests, requestId);
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
              vue.$store.commit('update', { key: "lastFailedRequestStatus", value: status });
              
              if ( status == 404 || status == 503 ) vue.$store.commit('pushToFailedRequests', requestId);
              
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
              
          }, function(err, results) {
            
            if (!err) {
              results = options.flatten ? _.flatten(results) : results;
              results = _.compact( results );
              eachCallback( null, results );
            }
            else {
              eachCallback( null, null );
            }
            
          });
        }, chunkCounter === 0 ? 0 : break_time); // No delay in front of the first chunk
      }, function( err, results ) {
        
        if (!err) {
          results = options.flatten ? _.flatten(results) : results;
          results = _.compact( results );
          options.done( results );
        }
        else {
          console.log( "%c" + "axios caught an error (done)" + "", "background: #f79a33; color: #fff; padding: 2px 5px; border-radius: 8px;", err );
          options.done( null, true );
        }
        
      });
      
    },
    
  }
};
