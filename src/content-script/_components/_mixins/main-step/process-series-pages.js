export default {
  methods: {
    getDataFromSeriesPages: function(hotpotato, seriesFetched) {
      
      const vue = this;
      
      if ( _.find(hotpotato.config.steps, { name: "library" }) ) {
        
        let booksInSeries = hotpotato.config.partialScan ? _.filter(hotpotato.books, 'isNewThisRound') : hotpotato.books;

        if ( booksInSeries.length > 0 ) {
          
          booksInSeries = _.filter(booksInSeries, "series");
          let requests = [];

          _.each(booksInSeries, function(book) {
            _.each(book.series, function(series) {
              requests.push({
                url: vue.seriesUrl + "/" + series.asin,
                asin: series.asin,
                books: [],
                allBooks: [],
                length: 0
              });
            });
          });

          requests = _.uniqBy(requests, "asin");

          this.$root.$emit("update-progress", {
            text: "Preparing books in series...",
            step: 0,
            max: 0,
            bar: true
          });

          asyncMap(
            requests,
            function(request, stepCallback) {
              vue.scrapingPrep(request.url, function(prep) {
                vue.$root.$emit("update-progress", { max: requests.length });

                request.pageNumbers = prep.pageNumbers;
                request.pageSize = prep.pageSize;
                getBooks(vue, hotpotato, request, stepCallback);
                
              });
            },
            function(err, responses) {
              
              // Each series page is fetched as a separate request.
              // This merges the books arrays and cleans up the returning object a little
              _.each(_.flatten(responses), function(series) {
                const targetSeries = _.find(requests, { asin: series.asin });
                if (targetSeries) {
                  targetSeries.books = targetSeries.books.concat(series.books);
                  targetSeries.allBooks = targetSeries.allBooks.concat(series.allBooks);
                  targetSeries.length += series.length;
                  delete targetSeries.pageNumbers;
                  delete targetSeries.pageSize;
                  delete targetSeries.url;
                }
              });
              
              if ( hotpotato.config.partialScan ) {
                vue.mergeBooksWithSeries( hotpotato.series, requests );
              }
              else {
                hotpotato.series = requests;
              }
              
              if (!err) {
                vue.$nextTick(function() {
                  vue.$root.$emit("reset-progress");
                  seriesFetched(null, hotpotato);
                });
              } else console.log(err);
              
            }
          );
        } else {
          vue.$nextTick(function() {
            vue.$root.$emit("reset-progress");
            seriesFetched(null, hotpotato);
          });
        }
        
      }
      else {
        
        vue.$root.$emit("reset-progress");
        seriesFetched(null, hotpotato);
        
      }
    }
  }
};

function getBooks(vue, hotpotato, request, parentStepCallback) {
  let requestUrls = [];

  _.each(request.pageNumbers, function(page) {
    const requestDolly = _.cloneDeep(request);
    const pageSize = request.pageSize ? "&pageSize=" + request.pageSize : "";
    requestDolly.url += "/?page=" + page + pageSize;
    requestUrls.push(requestDolly);
  });

  vue.amapxios({
    requests: requestUrls,
    step: function(response, stepCallback, request) {
      const audible = $($.parseHTML(response.data)).find("div.adbl-main")[0];
      response.data = null;

      const bookRows = audible.querySelectorAll(".adbl-impression-container > .productListItem");
      
      let series = {
        asin: request.asin,
        books: [],
        allBooks: [],
        length: bookRows.length
      };
      
      
      $(bookRows).each(function() {
        
        let inLibrary;
        const asinEl = this.querySelector("div[data-asin]");
        let title = DOMPurify.sanitize(this.getAttribute('aria-label'));
        if ( asinEl ) {
          const asin = asinEl.getAttribute("data-asin");
          if ( this.querySelector(".adblBuyBoxInLibraryButton") ) {
            series.books.push( DOMPurify.sanitize(asin) );
          }
          
        }
        // Sometimes books may leave the store or be blocked for whatever reason and when a book 
        // is not available, you can't tell if it's in your library by lookin at the series page (like I'm doing above). 
        // What I ended up doing was checking the title against the short title in hotpotato.books array.
        // There doesn't seem to be another way, since the asin is no longer there and the cover art id does not match
        // The book in question: https://www.audible.com/pd/Alien-Out-of-the-Shadows-Audiobook/B01CYVJUBC
        else {
          
          inLibrary = _.find( hotpotato.books, { 'titleShort': title });
          if ( inLibrary ) series.books.push( inLibrary.asin );
          
        }
        
        let aBook = {};
        
        if ( title ) aBook.title = title;
        let numbers = this.querySelector(':scope > div:nth-child(1) > div > h2');
        if ( numbers ) aBook.bookNumbers = DOMPurify.sanitize( numbers.textContent.trimAll().replace(/[^\d]*/, '').split(',')[0] );
        if ( asinEl ) aBook.asin = DOMPurify.sanitize( asinEl.getAttribute("data-asin") );
        else if ( inLibrary ) aBook.asin = inLibrary.asin;
        
        if ( this.querySelector('[name="discovery-add-to-library-form"]') ) aBook.plus = true;
        // if ( title.match(/^FREE:/) ) aBook.free = true;
        if ( this.querySelector('.buybox-regular-price') ) {
          let price = this.querySelector('.buybox-regular-price').textContent.match(/\d/g);
          let priceArray = _.map( price, function( v ) { return parseFloat(v) });
          let sumOfPriceArray = priceArray.reduce((a, b) => a + b, 0);
          if ( sumOfPriceArray === 0 ) aBook.free = true;
        }
        
        series.allBooks.push( aBook );
        
      });

      vue.$root.$emit("update-progress", {
        text: "Fetching series order for books in series..."
      });
      
      stepCallback(series);
      
    },
    flatten: true,
    done: function(series) {
      vue.$root.$emit("update-progress-step"); // Counting series, not books
      parentStepCallback(null, series);
    }
  });
}
