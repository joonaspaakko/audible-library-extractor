// import _ from "lodash";

export default {
  methods: {
    getDataFromLibraryPages: function(hotpotato, libraryPagesFetched) {
      const vue = this;
      
      if ( _.find(hotpotato.config.steps, { name: "library" }) ) {
        
        this.$store.commit('update', [
          { key: 'bigStep.step', value: 0 },
          { key: 'subStep.step', value: 0 },
        ]);
        
        this.$store.commit('update', [
          { key: 'bigStep.title', value: 'Library' },
          { key: 'bigStep.step', add: 1 },
          { key: 'subStep.step', add: 1 },
          { key: 'subStep.max', value: 4 },
          { key: 'progress.step', value: 0 },
          { key: 'progress.max', value: 0 },
          { key: 'progress.text', value: this.$store.state.storageHasData.library ? "Updating old books and adding new books..." : "Scanning library for books..." },
        ]);
        
        const bookCounts = { new: 0, old: 0 };

        vue.scrapingPrep({
          url: vue.libraryUrl, 
          maxSize: 20,
          done: function(prep) {
          
            // Debug: extract specific pages only
            // prep.pageNumbers = [1];
            // prep.pageNumbers = _.take(prep.pageNumbers, 2);
            
            const requestURL = prep.urlObj.toString();
            vue.amapxios({
              requests: _.map(prep.pageNumbers, (page) => ({
                requestUrl: requestURL + "&page=" + page,
                requestId: 'library-page-' + page,
              })),
              step: function(response, stepCallback) {
                vue.processLibraryPage(response, hotpotato, bookCounts, stepCallback);
              },
              flatten: true,
              done: function(books) {
                vue.$nextTick(function() {
                  
                  hotpotato.library = books;

                  // Removes unnecessary data from series and collections durin a partial extraction
                  if ( hotpotato.library && hotpotato.library.length ) {
                    const changedBooks = _.xorBy( hotpotato.library, books, 'asin');
                    if ( changedBooks.length > 0 ) {
                      let removedBooks = _.filter( changedBooks, function( book ) { return !book.isNewThisRound; });
                      if ( removedBooks.length > 0 )  {
                        vue.removeFromSeries( hotpotato.series, removedBooks );
                        vue.removeFromCollections( hotpotato.collections, removedBooks );
                      }
                    }
                    if ( hotpotato.wishlist && hotpotato.wishlist.length > 0 ) {
                      let newBooks = _.filter( hotpotato.library, 'isNewThisRound');
                      if ( newBooks.length > 0 ) {
                        newBooks = _.map(newBooks, 'asin');
                        _.remove( hotpotato.wishlist, function( wBook ) {
                          return _.includes(newBooks, wBook.asin);
                        });
                      }
                    }
                  }
                  
                  // hotpotato.books = _.sampleSize( hotpotato.books, 40);
                  
                  // hotpotato.books = _.sampleSize( hotpotato.books, function( book ) {
                    
                  //   return _.includes([
                  //     'B078X15P2P',
                  //     '1799751511',
                  //     '1781103798',
                  //   ], book.asin);
                     
                  // });
                  
                  hotpotato.config.getStorePages = 'library';
                  vue.$nextTick(function() {
                    libraryPagesFetched(null, hotpotato);
                  });
                    
                });
              }
            });
            
          }
        });
        
      }
      else {
        
        vue.$store.commit('resetProgress');
        libraryPagesFetched(null, hotpotato);
        
      }
      
    },
    
    // Builds the "Updating old books (N) and adding new books (N)" progress sentence. Either half
    // is dropped while its count is still 0, so an idle count never shows a stray "(0)".
    buildLibraryProgressText: function( bookCounts ) {

      const oldClause = bookCounts.old > 0 ? 'Updating old books (' + bookCounts.old + ')' : '';
      const newClause = bookCounts.new > 0 ? 'adding new books (' + bookCounts.new + ')' : '';

      if ( oldClause && newClause ) return oldClause + ' and ' + newClause;
      if ( oldClause ) return oldClause;
      if ( newClause ) return 'Adding new books (' + bookCounts.new + ')';
      return 'Updating old books and adding new books...';

    },

    processLibraryPage: function(response, hotpotato, bookCounts, stepCallback) {
      
      let vue = this;
  
      const audible = $($.parseHTML(response.data)).find("div.adbl-main")[0];
      response.data = null;
    
      const books = [];
    
      const titleRows = audible.querySelectorAll("#adbl-library-content-main > .adbl-library-content-row");
      each( titleRows, function( _thisRow ) {
        
        const rowItem = {
          is: {
            product:  _thisRow.querySelector('[name="contentType"][value="Product"]'), // Regular book
            performance: _thisRow.querySelector('[name="contentType"][value="Performance"]'), 
            lecture: _thisRow.querySelector('[name="contentType"][value="Lecture"]'),
            podcast: _thisRow.querySelector('[name="contentType"][value="Podcast"]'),
            podcastParent: _thisRow.querySelector('[name="contentDeliveryType"][value="PodcastParent"]'),
          }
        };
        
        // if ( !rowItem.is.podcast ) return;
        
        let bookASIN = _thisRow.querySelector('[data-asin]');
            bookASIN = bookASIN.getAttribute("data-asin");
            bookASIN = DOMPurify.sanitize( bookASIN );
            
        // if ( bookASIN !== "B004SOLDJQ" ) return;
        
        const bookInMemory = _.find(hotpotato.library, ["asin", bookASIN]);
        const fullScan_ALL_partialScan_NEW = (vue.$store.state.storageHasData.library && !bookInMemory) || !vue.$store.state.storageHasData.library;
        let book = vue.$store.state.storageHasData.library && bookInMemory ? bookInMemory : {};
        
        // Always pass over old ISBNs
        const oldIsbns = _.get(bookInMemory, 'isbns');
        if ( oldIsbns ) book.isbns = oldIsbns;
        
        // Podcasts use a different link element than regular books
        let storePageLink;
        if ( rowItem.is.podcast ) storePageLink = _thisRow.querySelector(".adbl-episodes-link > a");
        if ( !storePageLink ) storePageLink = _thisRow.querySelector(":scope > div > div > div > div > span > ul > li:nth-child(1) > a");

        // Audible removed store page links for discontinued books (noticed this
        // 2026-05-31), so the selector above may match a link that doesn't lead to the
        // store page. 
        if ( storePageLink ) {
          const href = DOMPurify.sanitize( storePageLink.getAttribute("href") );
          if ( href && href.includes('/pd/') ) {
            let storePageUrl = new Url( window.location.origin + href );
            storePageUrl.clearQuery();
            book.storePageRequestUrl = storePageUrl.toString();
          }
        }
        // No valid store page link found — mark as missing so the store page step skips it.
        if ( !book.storePageRequestUrl ) book.storePageMissing = true;
        // Clear the flag on re-extraction in case a previously discontinued book was restored.
        else if ( book.storePageMissing ) delete book.storePageMissing;
        
        // UPDATE SCAN: fetch these only if the book is a new addition...
        // FULL SCAN: fetch always
        if ( fullScan_ALL_partialScan_NEW ) {
          
          book.asin = bookASIN;
          
          const coverImg = _thisRow.querySelector('a > img.bc-image-inset-border:first-of-type') ||
                           _thisRow.querySelector(':scope > div > div > div > a > img.bc-image-inset-border') ||  
                           _thisRow.querySelector(':scope > div > div > div > img.bc-image-inset-border');
          if ( coverImg ) {
            let coverUrl = coverImg.getAttribute('src');
                coverUrl = DOMPurify.sanitize( coverUrl );
            if ( coverUrl.lastIndexOf("img-coverart-prod-unavailable") < 0 ) {
              let coverId = coverUrl.match(/\/images\/I\/(.*)._SL/);
                  coverId = _.get( coverId, '[1]');
              if ( coverId ) book.cover = coverId;
            }
          }
          
          // book.url        = _thisRow.querySelector(':scope > div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a').getAttribute('href').split('?')[0];
          book.title     = DOMPurify.sanitize(_thisRow.querySelector(":scope > div > div > div > div > span > ul > li:nth-child(1)").textContent.trimAll());
          book.authors   = vue.getArray( _thisRow.querySelectorAll(".authorLabel a") );
          book.narrators = vue.getArray( _thisRow.querySelectorAll(".narratorLabel a") );
          book.series    = vue.getSeries( _thisRow.querySelector(".seriesLabel > span"), { getUrl: true });
          book.blurb     = DOMPurify.sanitize(_thisRow.querySelector(".summaryLabel > span").textContent.trimAll());
          const fromPlusCatalog = _thisRow.querySelector('input[value="AudibleDiscovery"]');
          if (fromPlusCatalog) book.fromPlusCatalog = true;

        }
        
        
        // ALWAYS FETCH ↓↓ ( downloaded, favorite, progress, myRating )
        
        // Is a podcast episode or a podcast (parent)
        if ( rowItem.is.podcast ) book.format = 'Podcast'; // Just in case store page is not available
        if ( rowItem.is.podcastParent ) book.podcastParent = true; // Just in case store page is not available
        
        // "Came from the plus catalog but is no longer available there"
        const unavailableBtn = _thisRow.querySelector(".adbl-library-inaccessible-button");
        if (unavailableBtn) { book.unavailable = true; }
        else if ( book.unavailable ) { delete book.unavailable; }
        
        // Downloaded
        book.downloaded = _thisRow.querySelector(".adbl-library-action > div:nth-child(4) > span") ? true : null;
  
        // Favorite
        const favorite = _thisRow.querySelector('[id^="remove-from-favorites-button"]:not(.bc-pub-hidden)');
        if (favorite) book.favorite = true;
        else if ( book.favorite ) delete book.favorite;
  
        // Progress
        const progressbar = _thisRow.querySelector('[id^="time-remaining-display"] [role="progressbar"]');
        const finished = _thisRow.querySelector('[id^="time-remaining-finished"]:not(.bc-pub-hidden)') ? true : false;
        let timeRemaining = _thisRow.querySelector('[id^="time-remaining"]:not(.bc-pub-hidden)');
        if ( timeRemaining ) timeRemaining = DOMPurify.sanitize( timeRemaining.textContent.trimAll() );
        
        if (progressbar || finished) {
          book.progress = timeRemaining;
        } else {
          book.length = timeRemaining;
          book.progress = 0;
        }
        
        // Collection IDs
        let collectionIds = _thisRow.querySelector('[id^="collectionIds-"]');
        if ( collectionIds ) delete book.collectionIds;
        if ( collectionIds ) collectionIds = collectionIds.getAttribute('value');
        if ( collectionIds ) collectionIds = collectionIds.replace(/^\[/, '').replace(/\]$/, '').trim();
        if ( collectionIds ) collectionIds = collectionIds.split(', ');
        if ( collectionIds && collectionIds.length > 0 ) {
          const ignoreCollections = ['', '__PENDING', '__PURCHASE'];
          _.remove( collectionIds, function( value ) { return _.includes( ignoreCollections, value.trim() ); });
          if ( collectionIds.length > 0 ) book.collectionIds = collectionIds;
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
        let myRating = _thisRow.querySelector("div.bc-rating-stars.adbl-prod-rate-review-bar.adbl-prod-rate-review-bar-overall");
        if ( myRating ) myRating = myRating.getAttribute("data-star-count");
        if ( myRating > 0 ) book.myRating = DOMPurify.sanitize(myRating);
  
        book = _.omitBy(book, _.isNull);
  
        // - - - - - - -
        
        if ( vue.$store.state.storageHasData.library ) {
          let newAddition = !bookInMemory;
          let newFromStorage = bookInMemory && bookInMemory.isNew;
          if ( newAddition || newFromStorage ) book.isNew = true;
        }

        if ( fullScan_ALL_partialScan_NEW ) book.isNewThisRound = true;

        // Partial scan: show a live "updating/adding" count instead of a static text.
        if ( vue.$store.state.storageHasData.library ) {
          if ( fullScan_ALL_partialScan_NEW ) bookCounts.new++;
          else bookCounts.old++;
          vue.$store.commit('update', { key: 'progress.text', value: vue.buildLibraryProgressText( bookCounts ) });
        }
        // Full scan: keeps the static "Scanning..." text, but the number of books found
        // so far is still shown via the progress bar's step counter.
        else {
          vue.$store.commit('update', { key: 'progress.max', add: 1 });
        }

        books.push(book);
        
      });
      
      vue.$nextTick(function() {
        stepCallback(books);
      });
      
    },
    
  }
};

