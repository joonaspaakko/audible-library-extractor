import _ from "lodash";

export default {
  methods: {
    getDataFromLibraryPages: function(hotpotato, libraryPagesFetched) {
      const vue = this;
      
      if ( _.find(hotpotato.config.steps, { name: "library" }) ) {
        
        this.$root.$emit("update-big-step", {
          title: "Library",
          stepAdd: 1
        });
        
        this.$root.$emit("update-progress", {
          step: 0,
          max: 0,
          text: this.storageHasData.books ? "Updating old books and adding new books..." : "Scanning library for books..."
        });
        
        vue.scrapingPrep(vue.libraryUrl, function(prep) {
          
          const requestURL = prep.urlObj.toString();
          vue.amapxios({
            requests: _.map(prep.pageNumbers, function(page) {
              return requestURL + "&page=" + page; // + '&stampyStamp=' + (new Date().getTime());
            }),
            step: function(response, stepCallback) {
              vue.processLibraryPage(response, hotpotato, stepCallback);
            },
            flatten: true,
            done: function(books) {
              vue.$nextTick(function() {
                
                hotpotato.books = books;
                
                // Removes unnecessary data from series and collections durin a partial extraction
                if ( hotpotato.books && hotpotato.books.length ) {
                  const changedBooks = _.xorBy( hotpotato.books, books, 'asin');
                  if ( changedBooks.length > 0 ) {
                    let removedBooks = _.filter( changedBooks, function( book ) { return !book.isNewThisRound; });
                    if ( removedBooks.length > 0 )  {
                      vue.removeFromSeries( hotpotato.series, removedBooks );
                      vue.removeFromCollections( hotpotato.collections, removedBooks );
                    }
                  }
                  if ( hotpotato.wishlist && hotpotato.wishlist.length > 0 ) {
                    let newBooks = _.filter( hotpotato.books, 'isNewThisRound');
                    if ( newBooks.length > 0 ) {
                      newBooks = _.map(newBooks, 'asin');
                      _.remove( hotpotato.wishlist, function( wBook ) {
                        return _.includes(newBooks, wBook.asin);
                      });
                    }
                  }
                }
                
                // hotpotato.books = _.filter( hotpotato.books, { asin: 'B078X15P2P' });
                
                hotpotato.config.getStorePages = 'books';
                libraryPagesFetched(null, hotpotato);
                  
              });
            }
          });
        }, false, false, 20);
        
      }
      else {
        
        vue.$root.$emit("reset-progress");
        libraryPagesFetched(null, hotpotato);
        
      }
      
    },
    
    processLibraryPage: function(response, hotpotato, stepCallback) {
      
      let vue = this;
  
      const audible = $($.parseHTML(response.data)).find("div.adbl-main")[0];
      response.data = null;
    
      const books = [];
    
      const titleRows = audible.querySelectorAll("#adbl-library-content-main > .adbl-library-content-row");
      titleRows.forEach(function(el) {
        const _thisRow = el;
        
        
        // const rowItem = {
        //   is: {
        //     product:  _thisRow.querySelector('[name="contentType"][value="Product"]'),
        //     performance: _thisRow.querySelector('[name="contentType"][value="Performance"]'),
        //     lecture: _thisRow.querySelector('[name="contentType"][value="Lecture"]'),
        //     podcast: _thisRow.querySelector('[name="contentType"][value="Podcast"]'),
        //   }
        // };
        
        // The idea is to avoid items with this chevron button, because they are structurally different. 
        // So far the only item type I know to have that is podcasts, but this will skip all such items.
        let rowItemNotABook = !!_thisRow.querySelector('.adbl-episodes-link .chevron-container');
        
        // Ignore anything that isn't a book, like for example podcasts...
        if ( !rowItemNotABook ) {
          
          const bookASIN = DOMPurify.sanitize(_thisRow.getAttribute("id").replace("adbl-library-content-row-", ""));
          const bookInMemory = _.find(hotpotato.books, ["asin", bookASIN]);
          const fullScan_ALL_partialScan_NEW = (vue.storageHasData.books && !bookInMemory) || !vue.storageHasData.books;
          let book = vue.storageHasData.books && bookInMemory ? bookInMemory : {};
          
          // Always pass over old ISBNs
          if ( bookInMemory && bookInMemory.isbns ) book.isbns = bookInMemory.isbns;
          
          const storePageLink = _thisRow.querySelector(":scope > div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a");
          
          if (storePageLink) {
            let storePageUrl = new Url( window.location.origin + DOMPurify.sanitize(storePageLink.getAttribute("href")) );
            storePageUrl.clearQuery();
            book.storePageRequestUrl = storePageUrl.toString();
          }
    
          // UPDATE SCAN: fetch these only if the book is a new addition...
          // FULL SCAN: fetch always
          if ( fullScan_ALL_partialScan_NEW ) {
            book.asin = bookASIN;
            
            const getCover = DOMPurify.sanitize(_thisRow.querySelector("a > img.bc-pub-block:first-of-type").getAttribute("src"));
            if ( getCover.lastIndexOf("img-coverart-prod-unavailable") < 0 ) {
              const coverId = getCover.match(/\/images\/I\/(.*)._SL/);
              if (coverId && coverId[1]) book.cover = coverId[1];
            }
            // book.url        = _thisRow.querySelector(':scope > div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a').getAttribute('href').split('?')[0];
            book.title     = DOMPurify.sanitize(_thisRow.querySelector(":scope > div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a > span").textContent.trimAll());
            book.authors   = vue.getArray( _thisRow.querySelectorAll(".authorLabel > span > a") );
            book.narrators = vue.getArray( _thisRow.querySelectorAll(".narratorLabel > span > a") );
            book.series    = vue.getSeries( _thisRow.querySelector(".seriesLabel > span") );
            book.blurb     = DOMPurify.sanitize(_thisRow.querySelector(".summaryLabel > span").textContent.trimAll());
            const fromPlusCatalog = _thisRow.querySelector('input[value="AudibleDiscovery"]');
            if (fromPlusCatalog) book.fromPlusCatalog = true;
          }
    
          // ALWAYS FETCH ↓↓ ( downloaded, favorite, progress, myRating )
    
          // "Came from the plus catalog but is no longer available there"
          const unavailableBtn = _thisRow.querySelector(".adbl-library-inaccessible-button");
          if (unavailableBtn) { book.unavailable = true; }
          else { delete book.unavailable; }
          
          // Downloaded
          book.downloaded = _thisRow.querySelector(".adbl-library-action > div:nth-child(4) > span") ? true : null;
    
          // Favorite
          const favorite = _thisRow.querySelector('[id^="remove-from-favorites-button"]:not(.bc-pub-hidden)');
          if (favorite) book.favorite = true;
    
          // Progress
          const progressbar = _thisRow.querySelector('[id^="time-remaining-display"] [role="progressbar"]');
          const finished = _thisRow.querySelector('[id^="time-remaining-finished"]:not(.bc-pub-hidden)') ? true : false;
          const timeRemaining = DOMPurify.sanitize(_thisRow.querySelector('[id^="time-remaining"]:not(.bc-pub-hidden)').textContent.trimAll());
          
          if (progressbar || finished) {
            book.progress = timeRemaining;
          } else {
            book.length = timeRemaining;
            book.progress = 0;
          }
          
          
          // if ( 
          //   book.title.lastIndexOf('Besiege') > -1 ||
          //   book.title.lastIndexOf('The Rise and Fall of D.O.D.O.: A Novel') > -1 ||
          //   book.title.lastIndexOf('Dragon Blood - Omnibus') > -1
          // ) {
          //   console.log('');
          //   console.log(  book.title, ' - progress:', book.progress, ' - length:', book.length, 'finished?:', _thisRow.querySelector('[id^="time-remaining-finished"]') );
          // }
          
          // const adblLibraryAction = _thisRow.querySelector('.adbl-library-action');
          // let getTXT = adblLibraryAction.textContent.trimAll().split(' ');
          // console.log('%c' + 'teeeest' + '', 'background: #003191; color: #fff; padding: 2px 5px; border-radius: 8px;', book.title, getTXT.join(' | ') );
          
          /*
          const adblLibraryAction = _thisRow.querySelector('.adbl-library-action');
          const timeRemainingDisplay = _thisRow.querySelector('[id^="time-remaining-display"]'); // not started || started
          let isFinished = _thisRow.querySelector('input[name="isFinished"]'); // finished
          isFinished = isFinished.getAttribute('value') == 'true';
          
          if ( isFinished ) {
            const finishedCont = _thisRow.querySelector('[id^="time-remaining-finished"]');
            book.progress = DOMPurify.sanitize( finishedCont.textContent.trimAll() );
            console.log('%c' + 'finished' + '', 'background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;', book.title);
          }
          else if ( timeRemainingDisplay ) {
            const progressbar = _thisRow.querySelector('[id^="time-remaining-display"] [role="progressbar"]'); // started
            if ( progressbar ) {
              book.progress = DOMPurify.sanitize( timeRemainingDisplay.textContent.trimAll() );
              console.log('%c' + 'started (progress)' + '', 'background: #ff8d00; color: #fff; padding: 2px 5px; border-radius: 8px;', book.title);
            }
            // not started
            else {
              book.length = DOMPurify.sanitize( timeRemainingDisplay.textContent.trimAll() );
              book.progress = 0;
              console.log('%c' + 'not started' + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;', book.title);
            }
          }
          else {
            console.log('%c' + 'nothing at all...' + '', 'background: #7d0091; color: #fff; padding: 2px 5px; border-radius: 8px;', book.title);
          }
          */
    
          // Own rating
          const myRating = DOMPurify.sanitize(_thisRow.querySelector("div.bc-rating-stars.adbl-prod-rate-review-bar.adbl-prod-rate-review-bar-overall").getAttribute("data-star-count"));
          if (myRating > 0) book.myRating = myRating;
    
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
          
          books.push(book);
          
        }
      });
      
      vue.$nextTick(function() {
        stepCallback(books);
      });
      
    },
    
  }
};

