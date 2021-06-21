export default {
  methods: {
    getDataFromStorePages: function(hotpotato, storePagesFetched) {
      
      if ( hotpotato.config.getStorePages ) {
        
        if (!hotpotato.config.test) {
          
          this.$root.$emit("update-progress", {
            text: "Fetching additional data from store pages...",
            step: 0,
            bar: true
          });
        }

        const vue = this;
        const requests = prepStorePages(hotpotato, hotpotato.config.getStorePages);
        
        hotpotato.config.getStorePages = false;
        
        if (requests) {
          vue.amapxios({
            requests: requests,
            returnCatch: true,
            step: function(response, stepCallback, book) {
              delete book.requestUrl;

              if (!hotpotato.config.test)
                vue.$root.$emit("update-progress", { text2: book.title });

              if (response.status >= 400) {
                book.storePageMissing = true;
              } else {
                getStorePageData(vue, response, book, hotpotato.config.test);
              }

              if (!hotpotato.config.test) vue.$root.$emit("update-progress-step");
              // if ( book.cover ) vue.$root.$emit('update-progress-thumbnail', 'https://m.media-amazon.com/images/I/'+ book.cover + '._SL120_.jpg' );
              stepCallback(book);
            },
            flatten: true,
            done: function() {
              vue.$nextTick(function() {
                if (!hotpotato.config.test) vue.$root.$emit("reset-progress");
                storePagesFetched(null, hotpotato);
              });
            }
          });
        } else {
          vue.$nextTick(function() {
            vue.$root.$emit("reset-progress");
            storePagesFetched(null, hotpotato);
          });
        }
        
      }
      else {
        
        hotpotato.config.getStorePages = false;
        this.$root.$emit("reset-progress");
        storePagesFetched(null, hotpotato);
        
      }
    }
  }
};

function prepStorePages(hotpotato, getStorePages) {
  
  _.each( hotpotato[ getStorePages ], function( book ) { 
    if ( hotpotato.config.partialScan ) {
      if ( book.isNewThisRound ) book.requestUrl = book.storePageRequestUrl;
    }
    else {
      book.requestUrl = book.storePageRequestUrl;
    }
    delete book.storePageRequestUrl;
  });
  
  return hotpotato.config.partialScan ? _.filter(hotpotato[ getStorePages ], "isNewThisRound") : hotpotato[ getStorePages ];
  
}

function getStorePageData(vue, response, book, isTest) {
  
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
  if (!isTest) {
    const storePageChanged =
      response.request.responseURL.lastIndexOf(book.asin) < 0;
    if (storePageChanged) book.storePageChanged = true;
  }

  // This "#sample-player..." selector tries to weed out missing store pages
  if ( isTest || audible.querySelector("#sample-player-" + book.asin + " > button") ) {
    
    if ( !book.cover ) {
      const regularCover = audible.querySelector('#center-1 > div > div > div > div.bc-col-responsive.bc-col-3 > div > div:nth-child(1) > img');
      const heroPageCover = audible.querySelector('#center-1 > div.bc-container > div > div:nth-child(1) > img');
      const getCover = DOMPurify.sanitize( ( regularCover || heroPageCover ).getAttribute("src") );
      if ( getCover.lastIndexOf("img-coverart-prod-unavailable") < 0 ) {
        const coverId = getCover.match(/\/images\/I\/(.*)._SL/);
        if (coverId && coverId[1]) book.cover = coverId[1];
      }
    }
    
    book.titleShort = DOMPurify.sanitize(bookData.name);
    const ratingsLink = audible.querySelector(".ratingsLabel > a");
    if ( ratingsLink ) book.ratings = parseFloat( DOMPurify.sanitize(ratingsLink.textContent.match(/\d/g).join("")) );
    const ratingEl = audible.querySelector(".ratingsLabel > span:last-of-type");
    if ( ratingEl ) book.rating = Number( DOMPurify.sanitize(ratingEl.textContent.trimAll()) );
    book.summary = DOMPurify.sanitize(bookData.description) || vue.getSummary( audible.querySelector( ".productPublisherSummary > .bc-section > .bc-box:first-of-type" ) || audible.querySelector( "#center-1 > div.bc-container > div > div.bc-col-responsive.bc-col-6 > span" ) );
    book.releaseDate = DOMPurify.sanitize(bookData.datePublished) ? DOMPurify.sanitize(bookData.datePublished) : vue.fixDates( audible.querySelector(".releaseDateLabel") ); 
    book.publishers = vue.getArray( audible.querySelectorAll(".publisherLabel > a") );
    book.length = book.length || vue.shortenLength( audible.querySelector(".runtimeLabel").textContent.trimToColon() );
    book.categories = vue.getArray( audible.querySelector(".categoriesLabel") ? audible.querySelectorAll(".categoriesLabel > a") : audible.querySelectorAll(".bc-breadcrumb > a") );
    book.sample = isTest ? null : DOMPurify.sanitize(audible.querySelector("#sample-player-" + book.asin + " > button").getAttribute("data-mp3"));
    book.language = bookData.inLanguage ? DOMPurify.sanitize(_.startCase(bookData.inLanguage)) : DOMPurify.sanitize(audible.querySelector(".languageLabel").textContent.trimToColon());
    book.format = DOMPurify.sanitize(audible.querySelector(".format").textContent.trimAll());
    /*if (!book.series)*/ book.series = vue.getSeries(audible.querySelector(".seriesLabel"));
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
      tags.forEach( function( tag ) {
        
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
}
