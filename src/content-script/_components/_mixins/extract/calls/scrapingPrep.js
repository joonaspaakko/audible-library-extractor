// This basically probes the target page for what its maximum page size is...
// Then it probes the page again with that page size... 
// ...and returns the amount of pages on that

// Then you're ready to start scraping the pages at the same time.

export default {
  methods: {
    
    scrapingPrep: function( baseUrl, callbach ) {
      
      const vue = this;
      // FIXME: make sure there's proper fallbacks if pagesize dropdown or pagination doesn't exist in the query page
      waterfall([
        
        function( callback ) {
          
          let url = new Url( baseUrl );
          url.query.ale = true;
          
          axios.get( url.toString() ).then(function( response ) {
            
            const audible = $($.parseHTML(response.data)).find('div.adbl-main');
            const pageSizeDropdown = audible.find('select[name="pageSize"]');
            const maxPageSize = pageSizeDropdown.length > 0 ? pageSizeDropdown.find('option:last').val() : null;
            url.query.pageSize = maxPageSize;
            if ( !maxPageSize || maxPageSize < 50 ) {
              callback( true, { pageNumbers: [1], pageSize: maxPageSize, urlObj: url } );
            }
            else { 
              callback( null, url );
            }
            
          });
        },
        
        function( urlObj, callback ) {
          
          axios.get( urlObj.toString() ).then(function( response ) {
            
            const audible = $($.parseHTML(response.data)).find('div.adbl-main');
            const pagination = audible.find('.pagingElements');
            const pagesLength = pagination.length > 0 ? pagination.find('.pageNumberElement:last').data('value') : 1;
            callback( null, { pageNumbers: _.range(1, pagesLength + 1), pageSize: (urlObj.query.pageSize || null), urlObj: urlObj });
            
          });
          
        }
        
      ], function( err, obj ) {
        callbach( obj );
      });
      
    },
    
  },
  
  scrapingPrepDrill: function( baseUrl, o, callback ) {
    return axios.get( baseUrl ).then(function( response ) {
        
      const audible = $($.parseHTML(response.data)).find('div.adbl-main');
      const pageSizeDropdown = audible.find('select[name="pageSize"]');
      const maxPageSize = pageSizeDropdown.length > 0 ? pageSizeDropdown.find('option:last').val() : 50;
      let url = new Url( baseUrl );
      url.query.pageSize = maxPageSize;
      
      return axios.get( url.toString() ).then(function( response ) {
            
        const audible = $($.parseHTML(response.data)).find('div.adbl-main');
        const pagination = audible.find('.pagingElements');
        const pagesLength = pagination ? pagination.find('.pageNumberElement:last').data('value') : 1;
        
        return (callback) ? callback( o, urlObj, _.range(1, pagesLength + 1) ) : o;
        
      });
      
    });
  },
  
}