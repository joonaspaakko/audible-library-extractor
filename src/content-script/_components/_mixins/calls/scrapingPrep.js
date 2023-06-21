// This basically probes the target page for what its maximum page size is...
// Then it probes the page again with that page size...
// ...and returns the amount of pages on that

// Then you're ready to start scraping the pages at the same time.
import rateLimit from "axios-rate-limit";

export default {
  methods: {
    
    scrapingPrep: function( config ) {
      
      const vue = this;
      config = config || {};
      
      let url = new Url(DOMPurify.sanitize(config.url));
      
      const urlAlreadyFailed = _.includes(vue.$store.state.failedRequests, url);
      if (urlAlreadyFailed) {
        config.done({});
        return;
      }
      
      const letMeAxiosAQuestion = axios.create();
      // axiosRetry(letMeAxiosAQuestion, {
      //   retries: 2,
      //   retryDelay: function(retryCount) { return 1000 * retryCount; },
      //   retryCondition: function(error) {
      //     return axiosRetry.isNetworkOrIdempotentRequestError(error) || error && error.response && error.response.status == "500";
      //   }
      // });
      // const axiosLimited = rateLimit(letMeAxiosAQuestion, { maxRPS: 15 });
      const axiosLimited = rateLimit(letMeAxiosAQuestion, this.$store.state.axiosRateLimit);
      
      waterfall(
        [
          // GET MAX PAGE SIZE (how many items per page)
          function(callback) {
            url.query.ale = true;
            url.query.bp_ua = 'yes';
            let obj = {};
            obj.urlObj = url;
            
            let result = [ null, {}];
            
            if ( config.skipFirstCall ) {
              result = vue.getMaxPageSize( obj, config, config.response, callback);
              callback( result[0], result[1] );
            }
            else {
              
              
              axiosLimited.get( url.toString() )
              .then(function(response) {
                result = vue.getMaxPageSize( obj, config, response, callback);
              })
              .catch(function( e ) {
                const status = _.get(e, 'response.status');
                if (status == 404) vue.$store.commit('pushToFailedRequests', requestURL);
                result = [ true, {} ];
              })
              .then(function() {
                
                callback( result[0], result[1] );
                
              });
              
            }
            
          },
          
          // GET MAX PAGE COUNT (pagination)
          function(o, callback) {
            axiosLimited.get(o.urlObj.toString()).then(function(response) {
              const audible = $($.parseHTML(response.data)).find("div.adbl-main");
              const pagination = audible.find(".pagingElements");
              const pagesLength = pagination.length > 0 ? parseFloat( DOMPurify.sanitize(pagination.find(".pageNumberElement:last").text()) ) : 1;
              o.pageNumbers = _.range(1, pagesLength + 1);
              o.pageSize = o.urlObj.query.pageSize || null;
              callback(null, o);
            });
          }
        ],
        function(err, obj) {
          config.done(obj);
        }
      );
    },
    
    getMaxPageSize: function( obj, config, response, waterfallback ) {
      
      const data = _.get(response, 'data');
      if ( !data ) return [ null, null ];
      
      const audible = $($.parseHTML(data)).find("div.adbl-main");
      const pageSizeDropdown = audible.find('select[name="pageSize"]');
      const maxPageSize = pageSizeDropdown.length > 0 ? DOMPurify.sanitize(pageSizeDropdown.find("option:last").val()) : null;
      obj.urlObj.query.pageSize = config.maxSize || obj.urlObj.query.pageSize || maxPageSize;
      
      if ( config.returnResponse ) obj.response = response;
      
      const pagination = audible.find(".pagingElements").length;
      if ( !pagination || !maxPageSize || maxPageSize < 50 || config.returnAfterFirstCall ) {
        obj.pageNumbers = [1];
        obj.pageSize = obj.urlObj.query.pageSize;
        return [ true, obj ];
      } else {
        return [ null, obj ];
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
