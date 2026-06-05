// Fetches the target page with the preferred page size, reads pagination,
// and returns all page numbers. Ready to scrape all pages in parallel.
import rateLimit from "axios-rate-limit";
import axiosRetry from "axios-retry";

export default {
  methods: {
    
    scrapingPrep: function( config ) {
      
      const vue = this;
      config = config || {};
      
      let url = new Url(DOMPurify.sanitize(config.url));
      
      const urlAlreadyFailed = _.includes(vue.$store.state.failedRequests, vue.getRequestId( url.toString() ));
      if ( urlAlreadyFailed ) {
        config.done({});
        return;
      }
      
      const letMeAxiosAQuestion = axios.create();
      axiosRetry(letMeAxiosAQuestion, {
        retries: 2,
        retryDelay: retryCount => retryCount * 1000,
        retryCondition: e => e.response?.status === 503,
      });

      const limiter = _.cloneDeep(this.$store.state.axiosRateLimit);
      limiter.maxRequests = _.clamp( Math.ceil(limiter.maxRequests * .5), 1, limiter.maxRequests );
      const axiosLimited = rateLimit(letMeAxiosAQuestion, limiter);

      url.query.ale = true;
      url.query.bp_ua = 'yes';
      url.query.pageSize = config.maxSize || url.query.pageSize || 50;

      let obj = { urlObj: url };

      const processResponse = function( response ) {
        const data = _.get(response, 'data');
        if ( !data ) {
          config.done({});
          return;
        }

        const audible = $($.parseHTML(data)).find("div.adbl-main");
        obj.pageSize = obj.urlObj.query.pageSize;

        if ( config.returnResponse ) obj.response = response;

        const pagination = audible.find(".pagingElements");
        const pagesLength = ( pagination.length > 0 && !config.returnAfterFirstCall )
          ? parseFloat( DOMPurify.sanitize(pagination.find(".pageNumberElement:last").text()) )
          : 1;
        obj.pageNumbers = _.range(1, pagesLength + 1);

        config.done(obj);
      };

      if ( config.skipFirstCall ) {
        processResponse(config.response);
      }
      else {
        axiosLimited.get( url.toString() )
        .then(function( response ) {
          processResponse(response);
        })
        .catch(function( e ) {
          const status = _.get(e, 'response.status');
          if (status == 404) vue.$store.commit('pushToFailedRequests', vue.getRequestId( url.toString() ));
          config.done({});
        });
      }

    },
    
    getPageNumbers: function( response  ) {
      
      const audible = $($.parseHTML(response.data)).find("div.adbl-main");
      const pagination = audible.find(".pagingElements");
      const pagesLength = pagination.length > 0 ? parseFloat( DOMPurify.sanitize(pagination.find(".pageNumberElement:last").text()) ) : 1;
      return _.range(1, pagesLength + 1); 
      
    },
    
  }
};
