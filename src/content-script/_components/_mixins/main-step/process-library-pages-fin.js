export default {
  methods: {
    getDataFromLibraryPagesFin: function(hotpotato, libraryPagesFetched) {
      const vue = this;
      
      if ( _.find(hotpotato.config.steps, { name: "books" }) ) {
          
        // this.$root.$emit("update-progress", {
        //   text: 'Double checking book status...'
        // });
        
        vue.scrapingPrep({
          url: vue.libraryUrlFin, 
          done: function(prep) {
          
            const requestURL = prep.urlObj.toString();
            vue.amapxios({
              requests: _.map(prep.pageNumbers, function(page) {
                return requestURL + "&page=" + page;
              }),
              step: function(response, stepCallback) {
                processLibraryPage(vue, response, hotpotato, stepCallback);
              },
              flatten: true,
              done: function() {
                libraryPagesFetched(null, hotpotato);
              }
            });
          }
        });
        
      }
      else {
        
        libraryPagesFetched(null, hotpotato);
        
      }
      
    }
  }
};

function processLibraryPage(vue, response, hotpotato, stepCallback) {
  const audible = $($.parseHTML(response.data)).find("div.adbl-main")[0];
  response.data = null;
  
  const titleRows = audible.querySelectorAll("#adbl-library-content-main > .adbl-library-content-row");
  each( titleRows, function(el) {
    const _thisRow = el;
    
    const rowItemIsBook =
      _thisRow.querySelector('[name="contentType"][value="Product"]') ||
      _thisRow.querySelector('[name="contentType"][value="Performance"]');
      
    // Ignore anything that isn't a book, like for example podcasts...
    if (rowItemIsBook) {
      
      const bookASIN = DOMPurify.sanitize(_thisRow.getAttribute("id").replace("adbl-library-content-row-", ""));
      const book = _.find(hotpotato.books, ["asin", bookASIN]);
      
      if ( book ) {
        
        const finished = _thisRow.querySelector('[id^="time-remaining-finished"]'); // finished
        if ( finished ) book.progress = DOMPurify.sanitize( finished.textContent.trimAll() );
        
        const timeRemainingDisplay = _thisRow.querySelector('[id^="time-remaining-display"]'); // not started || started
        if ( timeRemainingDisplay ) book.length = DOMPurify.sanitize( timeRemainingDisplay.textContent.trimAll() );
        
      }
      
    }
  });

  stepCallback();
  
}
