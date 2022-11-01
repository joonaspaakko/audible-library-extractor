export default {
  methods: {
    getDataFromWishlist: function(hotpotato, wishlistFetched) {
      if ( !_.find(hotpotato.config.steps, { name: "wishlist" }) ) {
        
        this.$store.commit("resetProgress");
        wishlistFetched(null, hotpotato);
        
      } else {
        
        this.$store.commit('update', [
          { key: 'bigStep.title', value: 'Wishlist' },
          { key: 'bigStep.step', add: 1 },
          { key: 'subStep.step', value: 1 },
          { key: 'subStep.max', value: 2 },
          { key: 'progress.text', value: this.$store.state.storageHasData.wishlist ? "Updating old books and adding new books..." : "Scanning wishlist for books..." },
          { key: 'progress.step', value: 0 },
          { key: 'progress.max', value: 0 },
        ]);

        const vue = this;
        waterfall(
          [
            function(callback) {
              vue.scrapingPrep({
                url: vue.wishlistUrl,
                returnResponse: true,
                returnAfterFirstCall: true,
                done: function(prep) {
                  const audible = $($.parseHTML(prep.response.data)).find("div.adbl-main")[0];
                  const titlesLength = parseFloat( DOMPurify.sanitize(audible.querySelector(".adbl-library-refinement-section > div.bc-col-responsive.bc-col-2 > span").textContent.match(/\d+/)[0]) );
                  delete prep.response;
                  
                  // Forcing smaller pageSize...
                  // - Wishlist pages load a bit faster with less items. I had hopes loading pages with fewer items in parallel would be faster, but it wasn't really in my test.
                  // prep.pageSize = 20;
                  // prep.urlObj.query.pageSize = prep.pageSize;

                  const pagesLength = prep.pageSize ? Math.ceil(titlesLength / prep.pageSize) : 1;
                  prep.pageNumbers = _.range(1, pagesLength + 1);

                  callback(null, prep);
                  
                }
              }); // Stopping after the first call then doing some sleuthing around to figure out the amount of pages to scrape, rather than doing a second call (just because wisthlist loads super slow)
            },

            function(prep, callback) {
              vue.amapxios({
                requests: _.map(prep.pageNumbers, function(page) {
                  prep.urlObj.query.page = page;
                  return prep.urlObj.toString();
                }),
                step: function(response, stepCallback) {
                  vue.getBooksWishlist(response, hotpotato, stepCallback);
                },
                flatten: true,
                done: function(books) {
                  callback(null, books);
                }
              });
            }
          ],
          function(err, books) {
            
            if ( books.length ) hotpotato.wishlist = books;
            
            vue.$nextTick(function() {
              hotpotato.config.getStorePages = 'wishlist';
              wishlistFetched(null, hotpotato);
            });
            
          }
        );
      }
    },
    
    getBooksWishlist: function(response, hotpotato, completeStep) {
      let vue = this;
      const audible = $($.parseHTML(response.data)).find("div.adbl-main")[0];
      response.data = null;
      const wishlist = [];
    
      const wishlistRows = audible.querySelectorAll('#adbl-library-content-main .productListItem');
      $(wishlistRows).each(function() {
        const _thisRow = this;
        
        let asin  = _thisRow.querySelector('[data-asin]');
            asin  = asin.getAttribute("data-asin");
            asin  = DOMPurify.sanitize( asin );
        
        let carryOnMyWaywardPines = hotpotato.books ? !_.find( hotpotato.books, { asin: asin }) : true;
        if ( carryOnMyWaywardPines ) {
          
          let bookInMemory = _.find(hotpotato.wishlist, ["asin",  asin]);
          let fullScan_ALL_partialScan_NEW = (vue.$store.state.storageHasData.wishlist && !bookInMemory) || !vue.$store.state.storageHasData.wishlist;
          let book = vue.$store.state.storageHasData.wishlist && bookInMemory ? bookInMemory : {};
          
          book.asin = asin;
          
          let title = _thisRow.querySelector(":scope > div:nth-child(1) > div > div > div > div > div > span > ul > li:nth-child(1) > a");
          if ( title ) {
            let bookAddress = title.getAttribute("href");
                bookAddress = DOMPurify.sanitize(bookAddress);
            let storePageUrl = new Url( window.location.origin + bookAddress );
            storePageUrl.clearQuery();
            book.storePageRequestUrl = storePageUrl.toString();
          }
          
          if ( fullScan_ALL_partialScan_NEW ) {
            
            // SUBTITLE
            const subtitle = _thisRow.querySelector(":scope > div:nth-child(1) > div > div > div > div > div > span > ul > li:nth-child(2) > span.bc-color-secondary");
            if ( subtitle ) book.subtitle = DOMPurify.sanitize( subtitle.textContent.trimAll() );
            // SHORT TITLE
            if ( title ) {
              title = title.textContent.trimAll();
              book.titleShort = DOMPurify.sanitize( title );
              // FULL TITLE
              book.title = book.subtitle ? (title +': '+ book.subtitle) : title;
            }
            
            // COVER
            const coverWrapper = _thisRow.querySelector('[data-trigger^="product-list-flyout"]');
            if ( coverWrapper ) {
              const coverLink = coverWrapper.querySelector(':scope > a');
              if ( coverLink ) {
                let coverUrl = coverLink.getAttribute('src');
                    coverUrl = DOMPurify.sanitize( coverUrl );
                if ( coverUrl.lastIndexOf("img-coverart-prod-unavailable") < 0 ) {
                  let coverId = coverUrl.match(/\/images\/I\/(.*)._SL/);
                      coverId = _.get( coverId, '[1]');
                  if ( coverId ) book.cover = coverId;
                }
              }
            }
            
            // SAMPLE
            const sample = _thisRow.querySelector("[data-mp3]");
            if (sample) book.sample = DOMPurify.sanitize( sample.getAttribute("data-mp3") );
            
            // SERIES
            const series = _thisRow.querySelector(".seriesLabel > span");
            if ( series ) book.series = vue.getSeries( series );
            // if ( series ) book.series = vue.getSeries( series, 'reverseOutput');
            
            // LENGTH
            const length = _thisRow.querySelector(".runtimeLabel > span");
            if (length) book.length = vue.shortenLength( length.textContent );
            
            // RELEASE DATE
            const releaseDate = _thisRow.querySelector(".releaseDateLabel > span");
            if (releaseDate) book.releaseDate = vue.fixDates( releaseDate );
            
            // AUTHORS
            const authors = _thisRow.querySelectorAll(".authorLabel > a");
            if (authors.length > 0) book.authors = vue.getArray(authors);
            
            // NARRATORS
            const narrators = _thisRow.querySelectorAll(".narratorLabel > a");
            if (narrators.length > 0) book.narrators = vue.getArray(narrators);
            
            const language = _thisRow.querySelector(".languageLabel");
            if ( language ) book.language = DOMPurify.sanitize(language.textContent.trimToColon());
            
          }
          
          const ratingsWrappers = _thisRow.querySelector(".ratingsLabel");
          if ( ratingsWrappers ) {
            const starsWrapper = _thisRow.querySelector(".bc-review-stars");
            const ratingSpan   = starsWrapper.nextElementSibling;
            const ratingsSpan  = ratingSpan.nextElementSibling;
            // RATING
            book.rating = Number( DOMPurify.sanitize(ratingSpan.textContent.match(/^\d\.?(\d)?/g)) ); // returns the first number
            // RATINGS
            book.ratings = parseFloat( DOMPurify.sanitize(ratingsSpan.textContent.match(/\d/g).join("")) ); // returns all numbers merged into one
          }
          
          // From plus catalog
          const fromPlusCatalog = _thisRow.querySelector('.discovery-add-to-library-button');
          if (fromPlusCatalog) book.fromPlusCatalog = true;
          
          book = _.omitBy(book, _.isNull);
          
          // - - - - - - -
          
          if ( vue.$store.state.storageHasData.books ) {
            let newAddition = !bookInMemory;
            let newFromStorage = bookInMemory && bookInMemory.isNew;
            if ( newAddition || newFromStorage ) book.isNew = true;
          }
          
          if (fullScan_ALL_partialScan_NEW) {
            book.isNewThisRound = true;
            vue.$store.commit('update', { key: 'progress.max', add: 1 });
          }
          
          wishlist.push(book);
          
        }
        
      });
      
      completeStep(wishlist);
      
    },
        
  }
};
