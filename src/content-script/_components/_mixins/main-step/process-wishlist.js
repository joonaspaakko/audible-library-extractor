export default {
  methods: {
    getDataFromWishlist: function(hotpotato, wishlistFetched) {
      if ( !_.find(hotpotato.config.steps, { name: "wishlist" }) ) {
        
        this.$root.$emit("reset-progress");
        wishlistFetched(null, hotpotato);
        
      } else {
        
        this.$root.$emit("update-big-step", {
          title: "Wishlist",
          stepAdd: 1
        });

        this.$root.$emit("update-progress", {
          text: this.storageHasData.wishlist ? "Updating old books and adding new books..." : "Scanning wishlist for books...",
          step: 0,
          max: 0,
        });

        const vue = this;
        waterfall(
          [
            function(callback) {
              vue.scrapingPrep(
                vue.wishlistUrl,
                function(prep) {
                  const audible = $($.parseHTML(prep.response.data)).find("div.adbl-main")[0];
                  const titlesLength = parseFloat( DOMPurify.sanitize(audible.querySelector("#wishlist-content-main > div > h1.bc-heading").nextElementSibling.textContent.match(/\d+/)[0]) );
                  delete prep.response;

                  // if ( !vue.storageHasData.wishlist ) vue.$root.$emit("update-progress", {
                  //   max: titlesLength
                  // });

                  // Forcing smaller pageSize...
                  // - Wishlist pages load a bit faster with less items. I had hopes loading pages with fewer items in parallel would be faster, but it wasn't really in my test.
                  // prep.pageSize = 20;
                  // prep.urlObj.query.pageSize = prep.pageSize;

                  const pagesLength = prep.pageSize ? Math.ceil(titlesLength / prep.pageSize) : 1;
                  prep.pageNumbers = _.range(1, pagesLength + 1);

                  callback(null, prep);
                },
                true,
                true
              ); // Stopping after the first call then doing some sleuthing around to figure out the amount of pages to scrape, rather than doing a second call (just because wisthlist loads super slow)
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
            hotpotato.wishlist = books;

            vue.$nextTick(function() {
              hotpotato.config.getStorePages = 'wishlist';
              
              // if ( !vue.storageHasData.wishlist ) vue.$root.$emit("update-progress", {
              //   max: hotpotato.wishlist.length
              // });
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
    
      const wishlistRows = audible.querySelectorAll('#wishlist-content-main tr[id^="lib-item-row-"');
      $(wishlistRows).each(function() {
        const _thisRow = this;
        
        let titleLink = _thisRow.querySelector('[id^="title-"]');
        let bookASIN = DOMPurify.sanitize( titleLink.getAttribute("id").replace("title-", "") );
        
        let carryOnMyWaywardPines = hotpotato.books ? !_.find( hotpotato.books, { asin: bookASIN }) : true;
        if ( carryOnMyWaywardPines ) {
          
          let bookInMemory = _.find(hotpotato.wishlist, ["asin",  bookASIN]);
          let fullScan_ALL_partialScan_NEW = (vue.storageHasData.wishlist && !bookInMemory) || !vue.storageHasData.wishlist;
          let book = vue.storageHasData.wishlist && bookInMemory ? bookInMemory : {};
          
          book.asin = DOMPurify.sanitize( titleLink.getAttribute("id").replace("title-", "") );
          
          if ( titleLink ) {
            let storePageUrl = new Url( window.location.origin + DOMPurify.sanitize(titleLink.getAttribute("href")) );
            storePageUrl.clearQuery();
            book.storePageRequestUrl = storePageUrl.toString();
          }
          
          if ( fullScan_ALL_partialScan_NEW ) {
            
            // TITLE
            if (titleLink) book.title = DOMPurify.sanitize( titleLink.textContent.trimAll() );
            
            // COVER
            let getCover = _thisRow.querySelector("img[data-lazy]");
            if ( !getCover ) getCover = _thisRow.querySelector("picture > img");
            if ( getCover ) {
              getCover = DOMPurify.sanitize( getCover.getAttribute("src") );
              if ( getCover && getCover.lastIndexOf("img-coverart-prod-unavailable") < 0 ) {
                const coverId = getCover.match(/\/images\/I\/(.*)._SL/);
                if (coverId && coverId[1]) book.cover = coverId[1];
              }
            }
            
            // SAMPLE
            const sample = _thisRow.querySelector("[data-mp3]");
            if (sample) book.sample = DOMPurify.sanitize( sample.getAttribute("data-mp3") );
            
            // SERIES
            const series = _thisRow.querySelector(":scope > td:nth-child(2) > div > span > span > ul > li:nth-child(2) > div");
            if (series) book.series = vue.getSeries(series, 'reverseOutput');
            
            // LENGTH
            const length = _thisRow.querySelector(":scope > td:nth-child(2) > div > span > span > ul > li:nth-child(3) > span");
            if (length) book.length = vue.shortenLength( length.textContent );
            
            // RELEASE DATE
            const releaseDate = _thisRow.querySelector(":scope > td:nth-child(2) > div > span > span > ul > li:nth-child(4) > span");
            if (releaseDate) book.releaseDate = vue.fixDates( releaseDate );
            
            // AUTHORS
            const authors = _thisRow.querySelectorAll(":scope > td:nth-child(3) > div > span > div > a");
            if (authors.length > 0) book.authors = vue.getArray(authors);
            
            // NARRATORS
            const narrators = _thisRow.querySelectorAll(":scope > td:nth-child(4) > div > span > div > a");
            if (narrators.length > 0) book.narrators = vue.getArray(narrators);
            
            // DATE ADDED
            const dateAdded = _thisRow.querySelector(":scope > td:nth-child(5) > div > span > div > div > span");
            if (dateAdded) book.dateAdded = vue.fixDates( dateAdded );
            
          }
          
          const stars = _thisRow.querySelector(".bc-review-stars");
          if (stars) {
            // RATING
            const ratingSpan = stars.nextElementSibling;
            book.rating = Number( DOMPurify.sanitize(ratingSpan.textContent.match(/^\d\.?(\d)?/g)) ); // returns the first number
            const ratingsParent = ratingSpan.parentNode;
            ratingSpan.remove();
            // RATINGS
            book.ratings = parseFloat(
              DOMPurify.sanitize(ratingsParent.textContent.match(/\d/g).join(""))
            ); // returns all numbers merged into one
          }
          
          // From plus catalog
          const fromPlusCatalog = _thisRow.querySelector('.discovery-add-to-library-button');
          if (fromPlusCatalog) book.fromPlusCatalog = true;
          
          
          book = _.omitBy(book, _.isNull);
          
          // - - - - - - -
          
          if ( vue.storageHasData.books ) {
            let newAddition = !bookInMemory;
            let newFromStorage = bookInMemory && bookInMemory.isNew;
            if ( newAddition || newFromStorage ) book.isNew = true;
          }
          
          if (fullScan_ALL_partialScan_NEW) {
            book.isNewThisRound = true;
            vue.$root.$emit("update-progress-max");
          }
          
          wishlist.push(book);
          
        }
        
      });
      
      completeStep(wishlist);
      
    },
        
  }
};
