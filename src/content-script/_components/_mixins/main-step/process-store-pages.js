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
            
            let status = _.get(response, 'status');
                status = status ? _.toNumber(status) : 0;
            
            const statusOk = _.inRange( status, 200, 400-1 );
            
            if ( statusOk ) {
              vue.getStorePageData(response, book, hotpotato.config.test);
              delete book.storePageMissing;
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
    
    // Converts storePageRequestUrl into a requestUrl with redirect-override params appended,
    // then returns the books that actually need a store page fetch this round — new books only
    // on update scans, all books on a full scan, always excluding storePageMissing books.
    prepStorePages: function(hotpotato, getStorePages) {

      _.each( hotpotato[ getStorePages ], ( book ) => {

        // ABORT: No store page link was found on the library page...
        if ( book.storePageMissing ) return;

        // Update scan: only assign a URL for books new this round
        if ( this.$store.state.storageHasData[ getStorePages ] && !hotpotato.config.test ) {
          if ( book.isNewThisRound ) book.requestUrl = book.storePageRequestUrl;
        }
        // Full scan: assign for all
        else {
          book.requestUrl = book.storePageRequestUrl;
        }

        // Append params that tell Audible not to redirect based on region/country (shouldn't really be necessary here)
        if ( book.requestUrl ) {
          let url = new Url(book.requestUrl);
          url.query.ipRedirectOverride = true;
          url.query.overrideBaseCountry = true;
          book.requestUrl = url.toString();
        }

        delete book.storePageRequestUrl;
      });

      let result = [];

      // Update scan: fetch store pages for new books only
      if ( this.$store.state.storageHasData[ getStorePages ] && !hotpotato.config.test ) {
        result = _.filter(hotpotato[ getStorePages ], (b) => b.isNewThisRound && !b.storePageMissing);
      }
      // Full scan: fetch for all books
      else {
        result = _.reject(hotpotato[ getStorePages ] || [], 'storePageMissing');
      }

      return result;

    },
    
    getStorePageData: function(response, book, isTest) {
      
      let vue = this;
      
      var html = $($.parseHTML(response.data));
      const audible = html.find("div.adbl-main")[0];
      
      // When the store page is replaced with a new version, its ID (asin) may change and so here
      // I just make a note of it so that we can say in the gallery that  the information here may
      // be inaccurate
      if ( !isTest ) {
        const storePageChanged = response.request.responseURL.lastIndexOf(book.asin) < 0;
        if (storePageChanged) book.storePageChanged = true;
      }
            
      const bookData = (( html ) => {
        
        const jsonElements = html.find("#bottom-0").children();
        
        // Combine json arrays
        // [ { author: 'Jim' } ] + [ { author: 'Earl', releaseDate: 3 } ] => [ { author: 'Jim' }, { author: 'Earl', releaseDate: 3 } ]
        let arrays = [];
        jsonElements.each((index, item) => {
          const text = $(item).text();
          if ( text ) {
            const json = vue.safeParseJSON(text);
            if ( json ) {
              arrays = _.concat( arrays, _.castArray(json) );
            }
          }
        });
        
        // Combine objects
        // [ { author: 'Jim' }, { author: 'Earl', releaseDate: 3 } ] => { author: 'Earl', releaseDate: 3 }
        // - Objects with identical props get overwritten. In the example author 'Jim' is overwritten by 'Earl'
        // - The example aside, the expectation is that if there are any repeating property keys, the value is the same.
        const combinedData = {};
        _.each( arrays, ( object ) => {
          _.merge(combinedData, object);
        });
        
        // This is in the ISO 8601 format
        _.unset(combinedData, 'duration');
        
        const productMetadata = html.find('adbl-product-hero adbl-product-metadata > script, adbl-product-details adbl-product-metadata > script');
        if ( productMetadata ) {
          productMetadata.each((index, item) => {
            const text = $(item).text();
            if ( text ) {
              const json = vue.safeParseJSON(text);
              if ( json ) {
                _.merge(combinedData, json);
              }
            }
          });
        }
        
        return combinedData;
        
      })( html );
      
      html = null;
      response.data = null;

      // GET COVED ID
      const extractCoverIdFromUrl = ( url ) => _.get(DOMPurify.sanitize(url).match(/\/images\/I\/(.*)._SL/), '[1]');

      // From data
      if ( !book.cover && bookData.image ) {
        book.cover = extractCoverIdFromUrl(bookData.image);
      }
      // From DOM
      if ( !book.cover ) {
        const regularCover = audible.querySelector('#center-1 > div > div > div > div.bc-col-responsive > div > div:nth-child(1) > img');
        const heroPageCover = audible.querySelector('#center-1 > div > div.bc-container > div > div:nth-child(1) > img');
        const cover = regularCover || heroPageCover;
        if ( cover ) {
          const src = DOMPurify.sanitize(cover.getAttribute("src"));
          if ( src.lastIndexOf("img-coverart-prod-unavailable") < 0 ) {
            book.cover = extractCoverIdFromUrl(src);
          }
        }
      }
      
      // GET TITLE SHORT AND SUBTITLE
      // From data (Title only, subtitle is not quite in the data)
      // bookData.name comes from Audible's embedded JSON and arrives HTML-entity
      // encoded (eg. "&amp;"), unlike book.title which is read from .textContent
      // and is already decoded, so it needs decoding to match.
      book.titleShort = bookData.name ? DOMPurify.sanitize(bookData.name).decodeHTMLEntities() : bookData.name;
      // From DOM
      const titleLockup = audible.querySelector("adbl-title-lockup");
      if ( titleLockup ) {
        if ( !book.titleShort ) {
          const lockupTitle = titleLockup.querySelector('[slot="title"]');
          book.titleShort = lockupTitle ? DOMPurify.sanitize(lockupTitle.textContent) : book.titleShort;
        }
        if ( !book.subtitle ) {
          const lockupSubtitle = titleLockup.querySelector('[slot="subtitle"]');
          const subtitle = !lockupSubtitle ? audible.querySelector('.subtitle') : lockupSubtitle;
          book.subtitle = subtitle ? DOMPurify.sanitize(subtitle.textContent.trimAll()) : book.subtitle;
        }
      }
      // No point keeping a titleShort that's identical to the full title, consumers
      // already fall back to title when titleShort is missing.
      if ( book.titleShort === book.title ) delete book.titleShort;
      
      // GET RATING (rating + number of ratings)
      // From data
      if ( bookData.aggregateRating ) {
        const rating = DOMPurify.sanitize(bookData.aggregateRating.ratingValue);
        if ( rating ) book.rating = _.toNumber(_.toNumber(rating).toFixed('1').replace(/\.0$/, ''));
        const ratings = DOMPurify.sanitize(bookData.aggregateRating.ratingCount);
        book.ratings = _.toNumber(ratings);
      }
      // From DOM
      const ratingsLink = audible.querySelector(".ratingsLabel > a");
      if ( ratingsLink ) {
        let ratings = ratingsLink.textContent;
        if ( ratings ) {
          ratings = DOMPurify.sanitize(ratings);
          ratings = ratings.match(/\d/g);
          ratings = _.isArray(ratings) ? _.join(ratings, '') : ratings;
          ratings = parseFloat(ratings);
          book.ratings = ratings;
        }
      }
      const ratingEl = audible.querySelector(".ratingsLabel > span:last-of-type");
      if ( ratingEl ) book.rating = Number( DOMPurify.sanitize(ratingEl.textContent.trimAll()) );
      
      // GET SUMMARY
      // From data
      if ( bookData.description ) {
        book.summary = DOMPurify.sanitize(bookData.description);
      }
      if ( !book.summary ) {
        book.summary = vue.getSummary( audible.querySelector( ".productPublisherSummary > .bc-section > .bc-box:first-of-type" ) || audible.querySelector( "#center-1 > div.bc-container > div > div.bc-col-responsive.bc-col-6" ) );
      }
      
      // GET RELEASE DATE
      book.releaseDate = (
        ( bookData.datePublished && DOMPurify.sanitize(bookData.datePublished) ) ||
        ( bookData.releaseDate && vue.fixDates(DOMPurify.sanitize(bookData.releaseDate)) ) ||
        ( () => {
          const el = audible.querySelector(".releaseDateLabel");
          return el ? vue.fixDates(el) : undefined;
        } )()
      );
      
      // GET PUBLISHER
      // From data
      if ( bookData.publisher ) {
        
        const pbPublishers = [];
        _.each( _.castArray( bookData.publisher ), ( publisher ) => {
          const bdPublisher = _.get(publisher, 'name');
          pbPublishers.push({ name: bdPublisher });
        });
        
        book.publishers = pbPublishers;
        
      }
      // From DOM
      else {
        const publishersEl = audible.querySelectorAll(".publisherLabel > a");
        book.publishers = vue.getArray( publishersEl );
      }
      
      // GET LENGTH
      // From data
      if ( bookData.duration ) {
        book.length = vue.shortenLength(bookData.duration);
      }
      // From DOM
      else {
        const lengthEl = audible.querySelector(".runtimeLabel");
        if ( lengthEl ) {
          book.length = vue.shortenLength(lengthEl.textContent.trimToColon());
        }
      }
      
      // GET CATEGORIES
      // From data
      if ( bookData.itemListElement ) {
        
        const bdListElements = [];
        _.each( bookData.itemListElement, ( category ) => {
          
          // Ignore items that don't have an item
          const item = _.get(category, 'item');
          if ( !item ) return;
          // Ignore items that don't have a name
          const name = item.name || '';
          if ( !name )  return;
          // Ignore item called "Home"
          const home = name.match(/home/im);
          if ( home )  return;
          
          const url = _.get(item, '@id');
          
          bdListElements.push({
            name: name,
            url : _.get( url.match(/\/cat\/.+\/(\d+)/im), '1'), // uri becomes category id and nothing else
          });
            
        });
        
        if ( bdListElements.length ) {
          book.categories = bdListElements;
        }
        
      }
      
      // From data (again)
      (() => {
        if ( !bookData.categories || _.get(book.categories, '1') ) return;

        const bdCategories = _.castArray(bookData.categories);
        if ( !bdCategories.length ) return;

        book.categories = _.map( bdCategories, ( category ) => {
          return {
            name: category.name,
            url: _.get( (category.url || '').match(/\/cat\/.+\/(\d+)/im), '1'), // uri becomes category id and nothing else
          };
        });
      })();

      // From DOM
      (() => {
        if ( _.get(book.categories, '1') ) return;

        const domCategories = audible.querySelector(".categoriesLabel")
          ? audible.querySelectorAll(".categoriesLabel > a")
          : audible.querySelectorAll(".bc-breadcrumb > a");

        if ( domCategories ) book.categories = vue.getArray( domCategories );
      })();
      
      // GET LANGUAGE
      // From data
      if ( bookData.inLanguage ) {
        book.language = DOMPurify.sanitize(bookData.language || _.startCase(bookData.inLanguage));
      }
      // From DOM
      else {
        const domLanguageEl = audible.querySelector(".languageLabel");
        if ( domLanguageEl ) {
          book.language = DOMPurify.sanitize(domLanguageEl.textContent.trimAll());
        }
      }
      
      // GET FORMAT
      // From data
      if ( bookData.format ) {
        book.format = DOMPurify.sanitize(bookData.format);
      }
      // From DOM
      else {
        const formatEl = audible.querySelector(".format");
        if ( formatEl ) {
          book.format = DOMPurify.sanitize(formatEl.textContent.trimAll());
        }
      }
      
      // GET SERIES
      // From data
      if ( bookData.series ) {
        
        book.series = [];
        
        _.each( bookData.series, ( series ) => {
          
          book.series.push({
            // Match 3rd path segment → /.../.../(...)? 
            asin: _.get( (series.url || '').match(/\/.+\/.+\/(.+)\?/im), '1'),
            name: series.name,
            url: series.url && series.url.split('?')[0],
            // 1. Make sure it's a string.
            // 2. Remove non-number prefix "Book ".
            // 3. Remove trailing whitespace (Just in case)
            // 3. Split while excluding white space around commas.
            bookNumbers: _.toString(series.part).replace(/^[^0-9]*/, "").trim().split(/\s*,\s*/img),
          });
          
        });
        
      }
      // From DOM
      else if ( !book.series ) {
        book.series = vue.getSeries(audible.querySelector(".seriesLabel"), { getUrl: true });
      }
      
      // GET WHISPER SYNC
      // From data
      // Around January 13th 2025 they changed the store layout and at least
      // for now there's no longer a way to see if you own it or not.
      (() => {
        if ( !bookData.listeningEnhancements ) return;
        const whisperSyncAvailable = _.find( bookData.listeningEnhancements, { eventId: "whispersync" });
        if ( whisperSyncAvailable ) book.whispersync = 'available';
      })();

      // From DOM
      // This is checked every time because some pages still appear to have both (old dom elements & new meta data elements)
      // and the new meta data only says it's in whisper sync, not if it's owned.
      (() => {
        const whisperSyncLink = audible.querySelector(".ws4vLabel > a");
        if ( !whisperSyncLink ) return;

        const whisperSyncIcon = whisperSyncLink.querySelector("img");
        if ( !whisperSyncIcon ) return;

        const whisperSyncText = whisperSyncIcon.getAttribute('alt');
        if ( !whisperSyncText ) return;

        if ( whisperSyncText.match(/Voice-enabled/) ) book.whispersync = 'owned';
        else if ( whisperSyncText.match(/Voice-ready/) ) book.whispersync = 'available';
      })(); 
      
      // GET TAGS
      // From new DOM
      (() => {
        const chipGroup = audible.querySelector('.product-topictag-impression');
        if ( !chipGroup ) return;

        const chips = chipGroup.querySelectorAll('adbl-chip');
        const tags = [];
        _.each( chips, ( chip ) => {
          const tag = {
            name: chip.textContent,
            url: _.get( (chip.getAttribute('href') || '').match(/\/(adbl_rec_tag.*)\?/im), '1'),
          };
          tags.push(tag);
        });

        book.tags = tags;
      })();

      // From old DOM
      (() => {
        const tagWrapper = audible.querySelector('.product-topic-tags');
        if ( !tagWrapper ) return;

        const tagsArray = [];
        const tags = audible.querySelectorAll('.bc-chip-text');
        each( tags, function( tag ) {
          const tagObj = {};

          const catUrl = tag.closest('a').getAttribute('href');
          if ( catUrl ) {
            const sanitizedUrl = DOMPurify.sanitize(catUrl);
            const pathUrl = new Url(sanitizedUrl).path;
            tagObj.url = DOMPurify.sanitize(pathUrl.split('/').pop());
          }

          const tagName = tag.getAttribute('data-text');
          if ( tagName ) {
            tagObj.name = DOMPurify.sanitize(tagName);
            tagsArray.push(tagObj);
          }
        });

        if ( tagsArray.length > 0 ) book.tags = tagsArray;
      })();
  
      // Around July 2020 audible has removed any mention of the added date.
      // It was early 2020 when it was removed from the library page and now it's totally gone aside from the purchase history.
      // book.dateAdded   = vue.fixDates( audible.querySelector('#adbl-buy-box-purchase-date > span') );
      
      vue.getDataFromCarousel(book, audible, "peopleAlsoBought", "Listeners who picked this title also picked");
      
      book = _.omitBy(book, _.isNull);

    },
        
  }
};

