// This basically probes the target page for what its maximum page size is...
// Then it probes the page again with that page size...
// ...and returns the amount of pages on that

// Then you're ready to start scraping the pages at the same time.
import rateLimit from "axios-rate-limit";

export default {
  methods: {
    scrapingPrep: function( baseUrl, callbach, returnResponse, returnAfterFirstCall, maxSize ) {
      const vue = this;
      
      
      const letMeAxiosAQuestion = axios.create();
      axiosRetry(letMeAxiosAQuestion, {
        retries: 2,
        retryDelay: function(retryCount) { return 1000 * retryCount; },
        retryCondition: function(error) {
          return axiosRetry.isNetworkOrIdempotentRequestError(error) || error && error.response && error.response.status == "500";
        }
      });
      const axiosLimited = rateLimit(letMeAxiosAQuestion, { maxRPS: 10 });
      
      waterfall(
        [
          function(callback) {
            let url = new Url( DOMPurify.sanitize(baseUrl) );
            url.query.ale = true;
            url.query.bp_ua = 'yes';

            axiosLimited.get(url.toString()).then(function(response) {
              const audible = $($.parseHTML(response.data)).find("div.adbl-main");
              const pageSizeDropdown = audible.find('select[name="pageSize"]');
              const maxPageSize = pageSizeDropdown.length > 0 ? DOMPurify.sanitize(pageSizeDropdown.find("option:last").val()) : null;
              url.query.pageSize = maxSize ? (maxPageSize > maxSize ? maxSize : maxPageSize) : maxPageSize;

              let obj = {};
              if (returnResponse) obj.response = response;
              obj.urlObj = url;

              if (!maxPageSize || maxPageSize < 50 || returnAfterFirstCall) {
                obj.pageNumbers = [1];
                obj.pageSize = maxPageSize;
                callback(true, obj);
              } else {
                callback(null, obj);
              }
            });
          },
          
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
          callbach(obj);
        }
      );
    }
  }
};
