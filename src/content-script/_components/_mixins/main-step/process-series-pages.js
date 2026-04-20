export default {
  methods: {    
    filterBooksInSeries: function( hotpotato ) {
      
      let booksInSeries = [];
      
      const config = _.get(hotpotato, 'config');
      const step = {
        library: _.find(_.get(config, 'steps'), { name: "books" }),
        test: _.get(config, 'seriesTest'),
      };
      
      const books = _.get(hotpotato, 'books', []);
      
           if ( step.library ) booksInSeries = _.filter(books, function(o) { return o.isNewThisRound && o.series; });
      else if ( step.test    ) booksInSeries = _.filter(books, function(o) { return o.series; });
      
      return booksInSeries;
      
    },
    
    getDataFromSeriesPages: function(hotpotato, seriesFetched) {
      
      const vue = this;
      
      // FILTER SERIES
      let booksInSeries = this.filterBooksInSeries(hotpotato);
      
      // NO SERIES: move on to next step
      if ( !booksInSeries.length ) {
        this.$store.commit('update', { key: 'subStep.step', add: 3 });
        moveOn();
      }
      // BOOKS IN SERIES: start extracting information about the series
      else {
        
        // Update progress UI
        this.$store.commit('update', [
          { key: 'progress.text', value: "Compiling a list of series pages..." },
          { key: 'progress.step', value: 0 },
          { key: 'progress.max', value: 0 },
          { key: 'progress.bar', value: true },
        ]);
        
        const pageSize = 50;
        
        // PREP REQUESTS
        let requests = [];
        _.each(booksInSeries, function(book) {
          _.each(book.series, function(series) {
            
            requests.push({
              // Use canonical ASIN-based series URL to avoid Audible 301 redirect from slug URLs
              // url: vue.seriesUrl + "/" + series.asin + `?pageSize=${pageSize}`,
              url: series.url + `?pageSize=${pageSize}`,
              asin: series.asin,
              pageSize: pageSize,
              books: [],
              allBooks: [],
              length: 0,
              html: null,
            });
            
          });
        });
        requests = _.uniqBy(requests, "asin");
        requests = _.reject(requests, { asin: _.isNill });
        
        // START MAKING CALLS
        waterfall(
          [
            // Fetches request urls for every single page of every single series
            function(waterfallback) { 
              vue.getAllSeriesPages( hotpotato, requests, waterfallback)
            },
            // Scrapes each page for every single series page
            function(requests, waterfallback) {
              vue.getBooksFromSeries( hotpotato, requests, waterfallback );
            },
            // Last effort to try to find missing book numbers from store pages
            // function(requests, waterfallback) {
            //   vue.getMissingNumbers( hotpotato, requests, waterfallback );
            // }
          ],
          function(err, responses) {
            
            resetProgress();
            
            // FIXME: everything in this function is a bit janky. Could just push into hotpotato.series within each step...?
            
            // Each series page is fetched as a separate request.
            // This merges the books arrays and cleans up the returning object a little
            _.each(responses, function(series) {
              
              if ( !series ) return;
              
              const targetSeries = _.find(requests, { asin: series.asin });
              if (targetSeries) {
                targetSeries.books = targetSeries.books.concat(series.books);
                targetSeries.allBooks = targetSeries.allBooks.concat(series.allBooks);
                targetSeries.length += series.length;
                delete targetSeries.pageNumbers;
                delete targetSeries.pageSize;
                delete targetSeries.url;
                delete targetSeries.parsedFirstPage;
                delete targetSeries.html;
              }
              
            });
            
            // IF SERIES HAVE BEEN EXTRACTED, MERGE FETCHED SERIES WITH THOSE
            const potatoSeries = _.get(hotpotato, 'series', []);
            if ( vue.$store.state.storageHasData.books && potatoSeries.length ) {
              _.each( requests, function( series ) {
                const seriesExists = _.find(potatoSeries, { asin: series.asin });
                if ( seriesExists ) _.merge( seriesExists, series );
                else hotpotato.series.push( series );
              });
            }
            // ALL NEW SERIES: dump requests into potato as is
            else {
              hotpotato.series = requests;
            }
            
            
            // // Deduplicate and assign series (avoid repeated merging of mutated objects)
            // const existingSeries = _.get(hotpotato, 'series', []);
            // // Combine existing + new, then dedupe by asin (new results win by order in concat)
            // const combinedSeries = _.unionBy([...existingSeries, ...requests], 'asin');
            // hotpotato.series = combinedSeries;
            
            
            if ( err ) console.error('%c' + 'error' + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;', err);
            
            moveOn();
            
          }
        );
        
      }
      
      function resetProgress() {
        
        vue.$store.commit('update', [
          { key: 'subStep.step', value: 0 },
          { key: 'subStep.max', value: 0 },
        ]);
        vue.$store.commit('resetProgress');
        
      }
      
      function moveOn() {
        
        resetProgress();
        vue.$nextTick(function() {
          seriesFetched(null, hotpotato);
        });
        
      }
      
    },
    
    getAllSeriesPages: function( hotpotato, requests, waterfallback ) {
        
      this.$store.commit("update", { key: 'subStep.step', add: 1 });
      
      const limiter = _.cloneDeep(this.$store.state.axiosRateLimit);
      limiter.maxRequests = _.clamp( limiter.maxRequests * .6, 1, limiter.maxRequests );
      
      const vue = this;
      vue.amapxios({
        requests: requests,
        rateLimit: limiter,
        step: function(response, stepCallback, request) {
          
          request.pageNumbers = vue.getPageNumbers( response );
          request.parsedFirstPage = vue.parseSeriesPage(response.data, request, hotpotato);
          
          vue.$store.commit("update", { key: 'progress.max', add: 1 });
          stepCallback(request);
          
        },
        flatten: true,
        done: function( responses, err ) {
          
          let requestUrls = [];
          _.each( responses, function( request ) {
            _.each(request.pageNumbers, function( page ) {
              
              const page1 = _.toNumber(page) === 1;
              
              let url = new Url( DOMPurify.sanitize(request.url) );
              url.query.page = page;
              url.query.pageSize = request.pageSize;
              requestUrls.push({ 
                ...request, 
                url            :  page1 ? '' : url.toString(),
                requestId      :  page1 ? '' : _.last(url.path.split('/')),
                parsedFirstPage: !page1 ? '' : request.parsedFirstPage,
              });
              
            });
          });
          
          waterfallback(null, requestUrls);
          
        }
      });
      
    },
    
    getBooksFromSeries(hotpotato, requestUrls, parentStepCallback) {
      
      const vue = this;
      
      this.$store.commit('update', [
        { key: 'progress.text', value: 'Fetching series order...' },
        { key: 'progress.max', value: requestUrls.length },
        { key: 'subStep.step', add: 1 },
      ]);
      
      const grouped = _.groupBy(requestUrls, r => (r.parsedFirstPage || !r.url) ? 'cached' : 'network');
      const cachedSeries = _.map(grouped.cached || [], r => r.parsedFirstPage || r );
      const amapxiosRequests = grouped.network || [];

      vue.$store.commit('update', { key: 'progress.step', value: _.size(cachedSeries) });
      
      // No further requests needed...
      if ( !amapxiosRequests.length ) return parentStepCallback(null, cachedSeries);
      
      // Fetch remaining pages...
      const limiter = _.cloneDeep(this.$store.state.axiosRateLimit);
      limiter.maxRequests = _.clamp( limiter.maxRequests * .8, 1, limiter.maxRequests );
      vue.amapxios({
        requests: amapxiosRequests,
        rateLimit: limiter,
        returnCatch: true,
        step: function(response, stepCallback, request) {
          
          
          const series = vue.parseSeriesPage(response.data, request, hotpotato);

          vue.$store.commit('update', { key: 'progress.step', add: 1 });

          stepCallback(series);
          
        },
        flatten: true,
        done: function(series) { 
          parentStepCallback(null, cachedSeries.concat(series));
        }
      });
      
    },
    
    parseSeriesPage: function(html, request, hotpotato) {

      const audible = $($.parseHTML(html)).find("div.adbl-main")[0];
      if (!audible) return request;
      
      const bookRows = audible.querySelectorAll(".adbl-impression-container li.productListItem");
      if (!bookRows.length) return null;

      const series = {
        asin: request.asin,
        books: [],
        allBooks: [],
        length: bookRows.length
      };

      each(bookRows, function(row) {
        
        let inLibrary;
        const asinEl = row.querySelector("div[data-asin]");
        let titleShort = DOMPurify.sanitize(row.getAttribute('aria-label').decodeHTMLEntities());
        
        let title;
        let subtitle = row.querySelector('.subtitle');
        if ( subtitle ) {
          subtitle = DOMPurify.sanitize( subtitle.textContent.trimAll() );
          title = titleShort + ': ' + subtitle;
        }
        // If book has no subtitle, the only existing title must be the long title...
        else {
          title = titleShort;
          titleShort = false;
        }
        
        if ( title === titleShort ) titleShort = false;
        
        if ( asinEl ) {
          const asin = asinEl.getAttribute("data-asin");
          if ( row.querySelector(".adblBuyBoxInLibraryButton") ) {
            series.books.push( DOMPurify.sanitize(asin) );
          }
        }
        // Sometimes books may leave the store or it is blocked in your region or something. 
        // This makes it so the book you have doesn't match a book in the series page.
        // So what I'm doing is matching the title to a title in the library so it is then 
        // possible to push the book asin in the series collection at the right location.
        else {
          
          const potatoBooks = _.get( hotpotato, 'books', []);
          // Try to match the title to an existing book in the library
          if ( title ) inLibrary = _.find( potatoBooks, { 'title': title });
          // TitleShort Fallback...
          // Title short is not as accurate for matching purposes, but it's better than nothing...
          if ( !inLibrary ) inLibrary = _.find( potatoBooks, { 'titleShort': titleShort });
          // The book is in the library so push it into series
          if ( inLibrary ) series.books.push( inLibrary.asin );
          
        }
        
        // FORM BOOK OBJECTS WITH THE COLLECTED DATA
        let aBook = {};
        // Book ASIN
        if ( asinEl ) aBook.asin = DOMPurify.sanitize( asinEl.getAttribute("data-asin") );
        else if ( inLibrary ) aBook.asin = inLibrary.asin; // Just in case library asin is different...
        // Book title
        if ( title ) aBook.title = title;
        if ( titleShort ) aBook.titleShort = titleShort;
        // Book number as displayed in the series page... if at all
        let numbers = row.querySelector(':scope > div:nth-child(1) > div > h2');
        if ( numbers ) numbers = numbers.textContent;
        if ( numbers ) aBook.bookNumbers = DOMPurify.sanitize( numbers.trimAll().replace(/[^\d]*/, '').split(',')[0] );
        // NOT in library
        if ( !inLibrary && !row.querySelector('.adblBuyBoxInLibraryButton') ) {
          aBook.notInLibrary = true;
        }
        // In plus catalog
        if ( row.querySelector('[name="discovery-add-to-library-form"]') ) aBook.plus = true;
        // It's a free book...
        if ( row.querySelector('.buybox-regular-price') ) {
          let price = row.querySelector('.buybox-regular-price').textContent.match(/\d/g);
          let priceArray = _.map( price, function( v ) { return parseFloat(v) });
          let sumOfPriceArray = priceArray.reduce((a, b) => a + b, 0);
          if ( sumOfPriceArray === 0 ) aBook.free = true;
        }
        // COVER
        const coverImg = row.querySelector('img.bc-image-inset-border');
        if ( coverImg ) {
          let coverUrl = coverImg.getAttribute('src');
          coverUrl = DOMPurify.sanitize( coverUrl );
          if ( coverUrl.lastIndexOf("img-coverart-prod-unavailable") < 0 ) {
          let coverId = coverUrl.match(/\/images\/I\/(.*)._SL/);
          coverId = _.get( coverId, '[1]');
          if ( coverId ) aBook.cover = coverId;
          }
        }
        
        // Try to get book number from the title if that fails, 
        // mark it as numberless with the infinity symbol...
        if ( !aBook.bookNumbers ) {
          let findBookNumber;
          if ( aBook.title    ) findBookNumber = aBook.title.match(/(?:, Book.)(.+)/);
          if ( findBookNumber ) findBookNumber = findBookNumber[1];
          if ( findBookNumber ) aBook.bookNumbers = findBookNumber.replace(/\)$/, '');
        }
        // Try to get book numbers from existing books in the library using ASIN.
        if ( !aBook.bookNumbers ) {
          aBook.bookNumbers = (function( books, seriesAsin, bookAsin ) {
              
            const book = _.find(books, { asin: bookAsin }); if ( !book ) return;
            const series = _.find(book.series, { asin: seriesAsin }); if ( !series ) return;
            return _.isArray(series.bookNumbers) ? series.bookNumbers.join(',') : series.bookNumbers;
            
          })( hotpotato.books, request.asin, aBook.asin );
        }
        
        // IF a book doesn't have a number, make it the infinity symbol...
        if ( !aBook.bookNumbers ) aBook.bookNumbers = '∞';
        
        series.allBooks.push( aBook );

      });

      return series;

    },
    
    // Final attempt at finding missing numbers by checking book's store pages
    getMissingNumbers: function( hotpotato, series, waterfallback ) {
      
      // Prep requests
      let booksWithMissingNumber = [];
      _.each( series, function( currentSeries ) {
        let missing = _.filter( currentSeries.allBooks, { bookNumbers: '∞' });
        if ( missing.length ) {
          missing = _.map( missing, function( book ) { 
            return { 
              requestUrl: window.location.origin +'/pd/'+ book.asin, 
              seriesAsin: currentSeries.asin,
              bookAsin: book.asin,
            };
          })
          booksWithMissingNumber = booksWithMissingNumber.concat(missing);
        }
      });
      
      // Update progress GUI
      this.$store.commit('update', [
        { key: 'progress.text', value: 'Attempting to fetch missing numbers from store pages...' },
        { key: 'progress.step', value: 0 },
        { key: 'progress.max', value: booksWithMissingNumber.length },
        { key: 'progress.bar', value: true },
        { key: 'subStep.step', add: 1 },
      ]);
      
      let vue = this;
      vue.amapxios({
        requests: booksWithMissingNumber,
        returnCatch: true,
        // limiter: 100,
        step: function(response, stepCallback, request) {
          
          let seriesBook = null;
          const responseStatus = _.get( response, 'status', 0);
          if ( responseStatus >= 200 && responseStatus < 400 ) {
            let html = $($.parseHTML(response.data));
            let audible = html.find("div.adbl-main")[0];
            html = null;
            if ( audible && audible.querySelector('[id^="sample-player-"] > button') ) {
              
              const serieslEl = audible.querySelector(".seriesLabel");
              let bookSeries = vue.getSeries( serieslEl );
              if ( bookSeries ) bookSeries = _.find(bookSeries, { asin: request.seriesAsin });
              const bookNumbers = _.get( bookSeries, 'bookNumbers' );
              if ( bookNumbers ) {
                seriesBook = {
                  seriesAsin: request.seriesAsin,
                  asin: request.bookAsin, 
                  bookNumbers: _.isArray(bookNumbers) ? bookNumbers.join(', ') : bookNumbers,
                };
              }
              
            }
          }
          
          vue.$store.commit('update', { key: 'progress.step', add: 1 });
          stepCallback(seriesBook);
          
        },
        flatten: true,
        done: function( newBooks ) {
          
          newBooks = _.omitBy(newBooks, _.isNull);
          
          _.each( newBooks, function( newBook ) {
            let targetSeries = _.find( series, { asin: newBook.seriesAsin });
            if ( targetSeries ) {
              let targetBook = _.find( targetSeries.allBooks, { asin: newBook.asin });
              if ( targetBook ) targetBook.bookNumbers = newBook.bookNumbers;
            }
          });
          
          waterfallback(null, series);
        }
      });
      
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
          
          let seriesBook = null;
          const responseStatus = _.get( response, 'status', 0);
          if ( responseStatus >= 200 && responseStatus < 400 ) {
            let html = $($.parseHTML(response.data));
            let audible = html.find("div.adbl-main")[0];
            html = null;
            if ( audible && audible.querySelector('[id^="sample-player-"] > button') ) {
              
              const serieslEl = audible.querySelector(".seriesLabel");
              let bookSeries = vue.getSeries( serieslEl );
              if ( bookSeries ) bookSeries = _.find(bookSeries, { asin: request.seriesAsin });
              const bookNumbers = _.get( bookSeries, 'bookNumbers' );
              if ( bookNumbers ) {
                seriesBook = {
                  seriesAsin: request.seriesAsin,
                  asin: request.bookAsin, 
                  bookNumbers: _.isArray(bookNumbers) ? bookNumbers.join(', ') : bookNumbers,
                };
              }
              
            }
          }
          
          stepCallback(seriesBook);
          
        },
        flatten: true,
        done: function( newBooks ) {
          
          _.each( newBooks, function( newBook ) {
            let targetBook = _.find( series.allBooks, { asin: newBook.asin });
            if ( targetBook ) targetBook.bookNumbers = newBook.bookNumbers;
          });
          
          vue.$store.commit('update', { key: 'progress.step', add: 1 });
          parentStepCallback(series);
          
        }
      });
      
    },
    
  },
};
