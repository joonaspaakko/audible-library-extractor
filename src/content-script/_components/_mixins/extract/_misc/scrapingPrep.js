// This basically probes the target page for what its maximum page size is...
// Then it probes the page again with that page size... 
// ...and returns the amount of pages on that

// Then you're ready to start scraping the pages at the same time.

export default {
  methods: {
    
    scrapingPrep: function( url, callbach ) {
      
      const vue = this;
      
      waterfall([
        
        function( callback ) {
          axios.get( url ).then(function( response ) {
        
            const audible = $($.parseHTML(response.data)).find('div.adbl-main');
            const pageSizeDropdown = audible.find('select[name="pageSize"]');
            const maxPageSize = pageSizeDropdown.length > 0 ? pageSizeDropdown.find('option:last').val() : 50;
            let url = new Url( url );
            url.query.pageSize = maxPageSize;
            callback( null, url );
            
          });
        },
        
        function( urlObj, callback ) {
          
          axios.get( urlObj.toString() ).then(function( response ) {
            
            const audible = $($.parseHTML(response.data)).find('div.adbl-main');
            const pagination = audible.find('.pagingElements');
            const pagesLength = pagination ? pagination.find('.pageNumberElement:last').data('value') : 1;

            callback( null, { pageNumbers: _.range(1, pagesLength + 1), urlObj: urlObj });
          });
          
        }
        
      ], function( err, obj ) {
        callbach( obj );
      });
      
    },
    
  } 
}