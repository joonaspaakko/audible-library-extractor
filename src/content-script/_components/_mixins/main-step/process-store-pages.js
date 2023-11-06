export default {
  methods: {
    getDataFromStorePages: function(hotpotato, storePagesFetched) {
      
      this.$store.commit('update', { key: 'subStep.step', add: 1 });
      
      const vue = this;
      let requests = [];
      const processing = hotpotato.config.getStorePages;
      if ( hotpotato.config.getStorePages ) {
        requests = this.prepStorePages(hotpotato, hotpotato.config.getStorePages);
        hotpotato.config.getStorePages = false;
      }
      
      if ( !requests.length ) {
        moveOn();
      }
      else {
        
        if ( !hotpotato.config.test ) this.$store.commit('update', [
          { key: 'progress.step', value: 0 },
          { key: 'progress.bar', value: true },
          { key: 'progress.text', value: "Fetching additional data from store pages..." },
        ]);
        
        vue.amapxios({
          requests: requests,
          returnCatch: true, // Returns failed steps in the step() callback in order to mark missing sote page data
          step: function(response, stepCallback, book, processingError) {
            
            if ( _.get(book, 'requestUrl') ) delete book.requestUrl;
            if (!hotpotato.config.test) vue.$store.commit('update', { key: 'progress.text2', value: _.get(book, 'title') });
            
            if ( response && response.status >= 200 &&response.status < 400 ) {
              vue.getStorePageData(response, book, hotpotato.config.test);
            } 
            else if ( !!book ) {
              book.storePageMissing = true;
            }
            if (!hotpotato.config.test) vue.$store.commit('update', { key: 'progress.step', add: 1 });
            // if ( book.cover ) vue.$root.$emit('update-progress-thumbnail', 'https://m.media-amazon.com/images/I/'+ book.cover + '._SL120_.jpg' );
            stepCallback(book);
          },
          flatten: true,
          done: moveOn,
        });
        
      }
      
      function moveOn() {
        
        if (!hotpotato.config.test) vue.$store.commit("resetProgress");
        if ( processing === 'wishlist' ) vue.$store.commit('update', [
          { key: 'subStep.step', value: 0 },
          { key: 'subStep.max', value: 0 },
        ]);
        
        vue.$nextTick(function() {
          storePagesFetched(null, hotpotato);
        });
        
      }
      
    },
    
    prepStorePages: function(hotpotato, getStorePages) {
      
      let vue = this;
      _.each( hotpotato[ getStorePages ], function( book ) { 
        
        if ( vue.$store.state.storageHasData[ getStorePages ] && !hotpotato.config.test ) {
          if ( book.isNewThisRound ) book.requestUrl = book.storePageRequestUrl;
        }
        else {
          book.requestUrl = book.storePageRequestUrl;
        }
        
        let url = new Url(book.requestUrl);
        url.query.ipRedirectOverride = true;
        url.query.overrideBaseCountry = true;
        book.requestUrl = url.toString();
        
        delete book.storePageRequestUrl;
      });
      
      let result = [];
      
      if ( vue.$store.state.storageHasData[ getStorePages ] && !hotpotato.config.test ) {
        result = _.filter(hotpotato[ getStorePages ], "isNewThisRound");
      }
      else {
        result = hotpotato[ getStorePages ] || [];
      }
      
      return result;
      
    },
    
    getStorePageData: function(response, book, isTest) {
      
      let vue = this;
      
      var html = $($.parseHTML(response.data));
      const audible = html.find("div.adbl-main")[0];
      let jsonData = html.find("#bottom-0 > script:first")[0];
      if (jsonData) jsonData = JSON.parse(jsonData.textContent);
      const bookData = jsonData ? jsonData[0] : {};
      html = null;
    
      response.data = null;
      // When the store page is replaced with a new version, its ID (asin) may change and so here
      // I just make a note of it so that we can say in the gallery that  the information here may
      // be inaccurate
      if ( !isTest ) {
        const storePageChanged = response.request.responseURL.lastIndexOf(book.asin) < 0;
        if (storePageChanged) book.storePageChanged = true;
      }
      
      // This "#sample-player..." selector tries to weed out missing store pages
      const foundSample = audible && audible.querySelector("#sample-player-" + book.asin + " > button");
      const foundPlay = audible && audible.querySelector("#adbl-buy-box-play-now-button");
      
      if ( isTest || foundSample || foundPlay ) {
        
        book.storePageMissing = false;
        
        if ( !book.cover ) {
          const regularCover  = audible.querySelector('#center-1 > div > div > div > div.bc-col-responsive > div > div:nth-child(1) > img');
          const heroPageCover = audible.querySelector('#center-1 > div > div.bc-container > div > div:nth-child(1) > img');
                                
          let cover = regularCover || heroPageCover;
          if ( cover ) {
            cover = cover.getAttribute("src");
            cover = DOMPurify.sanitize( cover );
            if ( cover.lastIndexOf("img-coverart-prod-unavailable") < 0 ) {
              let coverId = cover.match(/\/images\/I\/(.*)._SL/);
                  coverId = _.get( coverId, '[1]');
              if ( coverId ) book.cover = coverId;
            }
          }
        }
        
        book.titleShort = DOMPurify.sanitize(bookData.name);
        const subtitle = audible.querySelector('.subtitle');
        if ( subtitle ) book.subtitle = DOMPurify.sanitize( subtitle.textContent.trimAll() );
        const ratingsLink = audible.querySelector(".ratingsLabel > a");
        if ( ratingsLink ) {
          let ratings = ratingsLink.textContent;
          if ( ratings ) {
            ratings = DOMPurify.sanitize(ratings);
            ratings = ratings.match(/\d/g);
            ratings = _.isArray(ratings) ? _.join(ratings, '') : ratings;
            ratings = parseFloat(ratings);
            book.ratings = ratings; // returns all numbers merged into one
          }
        }
        const ratingEl = audible.querySelector(".ratingsLabel > span:last-of-type");
        if ( ratingEl ) book.rating = Number( DOMPurify.sanitize(ratingEl.textContent.trimAll()) );
        book.summary = DOMPurify.sanitize(bookData.description) || vue.getSummary( audible.querySelector( ".productPublisherSummary > .bc-section > .bc-box:first-of-type" ) || audible.querySelector( "#center-1 > div.bc-container > div > div.bc-col-responsive.bc-col-6" ) );
        book.releaseDate = DOMPurify.sanitize(bookData.datePublished) ? DOMPurify.sanitize(bookData.datePublished) : vue.fixDates( audible.querySelector(".releaseDateLabel") ); 
        book.publishers = vue.getArray( audible.querySelectorAll(".publisherLabel > a") );
        const length = audible.querySelector(".runtimeLabel");
        book.length = book.length || (length ? vue.shortenLength(length.textContent.trimToColon()) : 0);
        book.categories = vue.getArray( audible.querySelector(".categoriesLabel") ? audible.querySelectorAll(".categoriesLabel > a") : audible.querySelectorAll(".bc-breadcrumb > a") );
        book.sample = (isTest || !foundSample) ? null : DOMPurify.sanitize( foundSample.getAttribute("data-mp3") );
        book.language = bookData.inLanguage ? DOMPurify.sanitize(_.startCase(bookData.inLanguage)) : DOMPurify.sanitize(audible.querySelector(".languageLabel").textContent.trimToColon());
        book.format = DOMPurify.sanitize((audible.querySelector(".format") || "").textContent.trimAll());
        
        // Decided against this for now since this would never get updated... It's better if I can do this from the lbirary page....
        // Also couldn't get any results in my test...
        // if ( storeKey === 'books' && !book.fromPlusCatalog && plusCatalogTag ) {
        //   let plusCatalogTag = document.querySelector('.bc-badge-group .bc-tag-primary');
        //   book.inPlusCatalog = plusCatalogTag; // Owned but also in plus catalog...
        //   console.log('%c' + 'inPlusCatalog' + '', 'background: #7d0091; color: #fff; padding: 2px 5px; border-radius: 8px;', book);
        // }
        
        if (!book.series) book.series = vue.getSeries(audible.querySelector(".seriesLabel"));
        
        const whisperSyncLink = audible.querySelector(".ws4vLabel > a");
        if ( whisperSyncLink ) {
          const whisperSyncIcon = whisperSyncLink.querySelector("img");
          const whisperSyncText = whisperSyncIcon.getAttribute('alt');
          if ( whisperSyncText.match(/Voice-enabled/) ) book.whispersync = 'owned';
          else if ( whisperSyncText.match(/Voice-ready/) ) book.whispersync = 'available';
        }
        
        var tagWrapper = audible.querySelector('.product-topic-tags');
        if ( tagWrapper ) {
          
          var tagsArray = [];
          var tags = audible.querySelectorAll('.bc-chip-text');
          each( tags, function( tag ) {
            
            var tagObj = {};
            
            var catUrl = tag.closest('a').getAttribute('href');
            if ( catUrl ) {
              catUrl = DOMPurify.sanitize( catUrl );
              catUrl = new Url( catUrl ).path;
              catUrl = catUrl.split('/').pop();
              tagObj.url = DOMPurify.sanitize( catUrl )
            }
            
            var tagName = tag.getAttribute('data-text');
            if ( tagName ) {
              tagObj.name = DOMPurify.sanitize( tagName );
              tagsArray.push( tagObj );
            }
            
          });
          
          if ( tagsArray.length > 0 ) book.tags = tagsArray;
          
        }
    
        // Around July 2020 audible has removed any mention of the added date.
        // It was early 2020 when it was removed from the library page and now it's totally gone aside from the purchase history.
        // book.dateAdded   = vue.fixDates( audible.querySelector('#adbl-buy-box-purchase-date > span') );
        
        vue.getDataFromCarousel(book, audible, "peopleAlsoBought", 5);
        vue.getDataFromCarousel(book, audible, "moreLikeThis", 6);
        // Audible seemed to have stopped using the ↑↑↑ "more like this" carousel in store pages around 2020 march-april.
        
        book = _.omitBy(book, _.isNull);
        
      } 
      else {
        book.storePageMissing = true;
      }
    },
        
  }
};

