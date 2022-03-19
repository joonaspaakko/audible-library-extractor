export default {
  methods: {
    getDataFromSeriesPages: function(hotpotato, seriesFetched) {
      
      const vue = this;
      
      if ( _.find(hotpotato.config.steps, { name: "library" }) || hotpotato.config.seriesTest ) {
        
        let booksInSeries = vue.storageHasData.books ? _.filter(hotpotato.books, 'isNewThisRound') : hotpotato.books;

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
                vue.getBooksFromSeries(hotpotato, request, stepCallback);
                
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
              
              if ( vue.storageHasData.books && _.get(hotpotato, 'series') ) {
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
    },
    
    fetchMissingNumbers: function( missingNumbers, series, parentStepCallback ) {
      
      let vue = this;
      vue.amapxios({
        requests: _.map( missingNumbers, function( book ) { 
          return { 
            requestUrl: window.location.origin +'/pd/'+ book.asin, 
            seriesAsin: series.asin,
            bookAsin: book.asin,
          };
        }),
        step: function(response, stepCallback, request) {
          
          let seriesBook = {};
          
          if (response.status < 400) {
            let html = $($.parseHTML(response.data));
            let audible = html.find("div.adbl-main")[0];
            html = null;
            let bookSeries = vue.getSeries(audible.querySelector(".seriesLabel"));
            bookSeries = _.find(bookSeries, { asin: request.seriesAsin });
            if ( bookSeries && bookSeries.bookNumbers ) {
              seriesBook = {    
                asin: request.bookAsin, 
                bookNumbers: bookSeries.bookNumbers.join(',') 
              };
            }
          }
          
          stepCallback(seriesBook);
          
        },
        flatten: true,
        done: function( newBooks ) {
          
          _.each( newBooks, function( newBook ) {
            let targetBook = _.find( series.allBooks, { asin: newBook.asin });
            if ( targetBook ) {
              targetBook.bookNumbers = newBook.bookNumbers;
            }
          });
          
          parentStepCallback(series);
        }
      });
      
    },
    
    getBooksFromSeries(hotpotato, request, parentStepCallback) {
      let vue = this;
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
          
          let prevBook = {};
          
          $(bookRows).each(function() {
            
            let inLibrary;
            const asinEl = this.querySelector("div[data-asin]");
            let titleShort = DOMPurify.sanitize(this.getAttribute('aria-label'));
            
            let title;
            let subtitle = this.querySelector('.subtitle');
            if ( subtitle ) {
              subtitle = DOMPurify.sanitize( subtitle.textContent.trimAll() );
              title = titleShort + ': ' + subtitle;
            }
            // If book has no subtitle, the only existing title must be the long title...
            else {
              title = titleShort;
              titleShort = false;
            }
            
            if ( title === titleShort ) {
              titleShort = false;
            }
            
            if ( asinEl ) {
              const asin = asinEl.getAttribute("data-asin");
              if ( this.querySelector(".adblBuyBoxInLibraryButton") ) {
                series.books.push( DOMPurify.sanitize(asin) );
              }
              
            }
            // Sometimes books may leave the store or it is blocked in your region or something. 
            // This makes it so the book you have doesn't match a book in the series page.
            // So what I'm doing is matching the title to a title in the library so it is then 
            // possible to push the book asin in the series collection at the right location.
            else {
              
              if ( title ) {
                inLibrary = _.find( hotpotato.books, { 'title': title });
              }
              
              // TitleShort Fallback...
              // Title short is not as accurate for matching purposes, but it's better than nothing...
              if ( !inLibrary ) {
                inLibrary = _.find( hotpotato.books, { 'titleShort': titleShort });
              }
              
              if ( inLibrary ) series.books.push( inLibrary.asin );
              
            }
            
            let aBook = {};
            
            if ( title ) aBook.title = title;
            if ( titleShort ) aBook.titleShort = titleShort;
            let numbers = this.querySelector(':scope > div:nth-child(1) > div > h2');
            if ( numbers ) aBook.bookNumbers = DOMPurify.sanitize( numbers.textContent.trimAll().replace(/[^\d]*/, '').split(',')[0] );
            if ( asinEl ) aBook.asin = DOMPurify.sanitize( asinEl.getAttribute("data-asin") );
            else if ( inLibrary ) aBook.asin = inLibrary.asin;
            
            if ( !inLibrary && !this.querySelector('.adblBuyBoxInLibraryButton') ) {
              aBook.notInLibrary = true;
            }
            
            // Try to get book number from the title if that fails, 
            // mark it as numberless with the infinity symbol...
            if ( !aBook.bookNumbers ) {
              let findBookNumber = aBook.title.match(/(?:, Book.)(.+)/);
              if ( aBook.title && findBookNumber ) {
                aBook.bookNumbers = findBookNumber[1].replace(/\)$/, '');
              }
              else {
                
                aBook.bookNumbers = (function( books, seriesAsin, bookAsin ) {
                
                  const book = _.find(books, { asin: bookAsin }); if ( !book ) return;
                  const series = _.find(book.series, { asin: seriesAsin }); if ( !series ) return;
                  return series.bookNumbers.join(',');
                  
                })( hotpotato.books, request.asin, aBook.asin );
                
              }
            }
            
            if ( !aBook.bookNumbers ) aBook.bookNumbers = '∞';
            
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
          
          
          // Final attempt at finding missing numbers by checking series pages:
          let missingNumbers = _.filter( series.allBooks, { bookNumbers: '∞' });
          if ( missingNumbers ) {
            vue.fetchMissingNumbers( missingNumbers, series, stepCallback );
          }
          else {
            stepCallback(series);
          }
          
        },
        flatten: true,
        done: function(series) {
          vue.$root.$emit("update-progress-step"); // Counting series, not books
          parentStepCallback(null, series);
        }
      });
    },
        
  },
};
