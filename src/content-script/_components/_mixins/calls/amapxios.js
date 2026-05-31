import rateLimit from "axios-rate-limit";
import axiosRetry from "axios-retry";

export default {
  methods: {

    minutesToMilliseconds: function( minutes ) { return minutes * 60 * 1000; },

    // Derive a stable resource ID from a URL — prefers asin query param, falls back to last path segment.
    // Used to blacklist an entire resource (e.g. a series) if any page of it fails, not just the one URL.
    getRequestId: function( inputUrl ) {

      const url = new Url( DOMPurify.sanitize( inputUrl ) );
      if ( url.query.asin ) return url.query.asin;
      const parts = url.path.split('/');
      return parts[parts.length - 1];

    },

    amapxios: function( options ) {

      const limiter = _.cloneDeep( options.rateLimit || this.$store.state.axiosRateLimit );
      if ( this.$store.state.sticky.slowExtract ) {
        limiter.perMilliseconds *= 2;
      }

      const maxTimeout = this.minutesToMilliseconds( 1 );

      // AXIOS — rate-limited instance with one automatic retry on 503
      const cAxios = rateLimit( axios.create(), limiter );
      axiosRetry( cAxios, {
        retries: 1,
        retryDelay: retryCount => retryCount * 1000,
        retryCondition: e => e.response?.status === 503,
      });

      asyncMapLimit( options.requests, limiter.concurrency || limiter.maxRequests, async ( request ) => {

        const requestURL = request.requestUrl || request.url || request;
        const requestId  = request.requestId || request.asin || this.getRequestId( requestURL );

        // Skip all pages of a resource that already failed this session
        if ( _.includes( this.$store.state.failedRequests, requestId ) ) return null;

        const controller   = new AbortController();
        const requestTimer = setTimeout( () => controller.abort(), maxTimeout );

        const axiosConfig = {
          ...options.config,
          signal: controller.signal,
          validateStatus: status => status >= 200 && status < 400,
        };

        let requestResult = null;

        // SUCCESS
        try {

          const response = await cAxios.get( requestURL, axiosConfig );
          // Wrap in a Promise so we correctly wait for the result even if the caller's
          // step function sets it asynchronously (e.g. inside $nextTick)
          await new Promise( resolve => {
            options.step( response, result => { requestResult = result; resolve(); }, request );
          });

        }
        // FAILURE — track the error status, blacklist requests that won't recover, and optionally pass the
        // error response through to the caller's step function so it can decide what to do with it
        catch( e ) {

          const status = _.get( e, 'response.status' );
          this.$store.commit( 'update', { key: 'lastFailedRequestStatus', value: status } );
          // 404 = gone for good, 503 = still failed after retry — blacklist the whole resource for this session
          if ( status === 404 || status === 503 ) this.$store.commit( 'pushToFailedRequests', requestId );
          console.log( '%cRequest failed', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;', requestURL, e );
          if ( options.returnCatch ) {
            options.step( _.get( e, 'response', e ), result => { requestResult = result; }, request, 'processingError' );
          }

        }
        // ALWAYS — cancel the abort timer regardless of outcome
        finally {
          clearTimeout( requestTimer );
        }

        return requestResult;

      // Flatten, compact, and hand results back to the caller
      }, ( err, results ) => {

        if ( err ) {
          console.log( '%cBatch failed', 'background: #f79a33; color: #fff; padding: 2px 5px; border-radius: 8px;', err );
          return options.done( null, true );
        }

        results = options.flatten ? _.flatten( results ) : results;
        options.done( _.compact( results ) );

      });

    },

  }
};
