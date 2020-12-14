
export default {
  methods: {
    getDataFromStorePages: function( hotpotato, storePagesFetched ) {
      
      this.$root.$emit('update-big-step', {
        title: 'Store Pages',
        stepAdd: 1,
      });
      
      this.$root.$emit('update-progress', {
        text: 'Fetching additional data from store pages...',
        step: 0,
        bar: true,
      });
      
      const vue = this;
      const requests = prepStorePages( this, hotpotato.books );
      
      if ( requests ) {
        vue.amapxios({
          requests: requests,
          returnCatch: true,
          step: function( response, stepCallback, book ) {
            
            delete book.requestUrl;
            
            vue.$root.$emit('update-progress', { text2: book.title });
            
            if ( response.status >= 400 ) {
              book.storePageMissing = true;
            }
            else {
              getStorePageData( vue, response, book );
            }
            
            vue.$root.$emit('update-progress-step');
            // if ( book.cover ) vue.$root.$emit('update-progress-thumbnail', 'https://m.media-amazon.com/images/I/'+ book.cover + '._SL120_.jpg' );
            stepCallback( book );
            
          },
          flatten: true,
          done: function( books ) {
            
            vue.$nextTick(function() {
              setTimeout(function() {
                  
                vue.$root.$emit('reset-progress');
                storePagesFetched(null, hotpotato);
                
              }, 1000);
            });
            
          }
        });
      }
      
    },
    
  },
};

function prepStorePages( vue, books ) {
  
  let source = vue.partialScan ? _.filter(books, 'new') : books;
  
  // if ( source.length > 0 ) return _.map( source, function( book ) {
  //   return { url: window.location.origin + '/pd?asin=' + book.asin, asin: book.asin }
  // });
  // else return null;
  if ( source.length > 0 ) {
    
    _.each( source, function( book ) {
      book.requestUrl = window.location.origin + '/pd?asin=' + book.asin;
    });
    
    return source;
    
  }
  else { return null; }
  
}

function getStorePageData( vue, response, book ) {
  
  var   html     = $($.parseHTML(response.data));
  const audible  = html.find('div.adbl-main')[0];
  let jsonData = html.find('#bottom-0 > script:first')[0];
  if ( jsonData ) jsonData = JSON.parse( jsonData.textContent );
  const bookData = jsonData[0] || {};
  html =  null;
          
  response.data = null;
  // When the store page is replaced with a new version, its ID (asin) may change and so here
  // I just make a note of it so that we can say in the gallery that  the information here may 
  // be inaccurate
  if ( !book.test ) {
    const storePageChanged = response.request.responseURL.lastIndexOf(book.asin) < 0;
    if ( storePageChanged ) book.storePageChanged = true;
  }

  // This "#sample-player..." selector tries to weed out missing store pages
  if ( book.test || audible.querySelector('#sample-player-'+ book.asin +'> button') ) { 
    book.titleShort  = bookData.name;
    book.ratings     = parseFloat( audible.querySelector('.ratingsLabel > a').textContent.match(/\d/g).join('') );
    book.rating      = Number( audible.querySelector('.ratingsLabel > span:last-of-type').textContent.trimAll() );
    book.summary     = bookData.description || vue.getSummary( audible.querySelector('.productPublisherSummary > .bc-section > .bc-box:first-of-type') || audible.querySelector('#center-1 > div.bc-container > div > div.bc-col-responsive.bc-col-6 > span') );
    book.releaseDate = bookData.datePublished || vue.fixDates( audible.querySelector('.releaseDateLabel') );
    book.publishers  = vue.getArray( audible.querySelectorAll('.publisherLabel > a') );
    book.length      = book.length || vue.shortenLength( audible.querySelector('.runtimeLabel').textContent.trimToColon() );
    book.categories  = vue.getArray(audible.querySelector('.categoriesLabel') ? audible.querySelectorAll('.categoriesLabel > a') : audible.querySelectorAll('.bc-breadcrumb > a') );
    book.sample      = book.test ? null : audible.querySelector('#sample-player-'+ book.asin +' > button').getAttribute('data-mp3');
    book.language    = bookData.inLanguage ? _.startCase( bookData.inLanguage ) : audible.querySelector('.languageLabel').textContent.trimToColon();
    book.format      = audible.querySelector('.format').textContent.trimAll();
    // Around July 2020 audible has removed any mention of the added date. 
    // It was early 2020 when it was removed from the library page and now it's totally gone aside from the purchase history.
    // book.dateAdded   = vue.fixDates( audible.querySelector('#adbl-buy-box-purchase-date > span') );
    
    vue.getDataFromCarousel(book, audible, 'peopleAlsoBought', 5 );
    vue.getDataFromCarousel(book, audible, 'moreLikeThis', 6 ); 
    // Audible seemed to have stopped using the ↑↑↑ "more like this" carousel in store pages around 2020 march-april.
    book = _.omitBy( book, _.isNull );
  }
  else { 
    book.storePageMissing = true;
  }
  
}