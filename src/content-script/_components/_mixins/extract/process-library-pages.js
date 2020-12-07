
import ajaxios from './_misc/ajaxios.js';
export default {
  mixins: [ajaxios],
  methods: {
    getDataFromLibraryPages: function( config, done ) {
      
      const vue = this;
      vue.progress.step = -1;
      vue.progress.text = 'Scanning library for books...';
      if ( vue.partialScan ) {
        vue.progress.text = 'Updating old books (' + vue.localStorageBooksLength + ') and adding new books...';
      }
      
      // this.$root.emit('resetProgres', {
      //   step: -1,
      //   text: vue.partialScan ? 
      //     'Updating old books (' + vue.localStorageBooksLength + ') and adding new books...' :
      //     'Scanning library for books...';
      // });
      
      const requestURL = config.urlObj.toString();
      
      vue.ajaxios({
        request: _.map(config.pageNumbers, function( page ) { return requestURL + '&page=' + page }),
        step: function( response ) {
          
          return processLibraryPage( vue, response );
          
        },
        flatten: true,
        done: function( books ) {
          
          console.log('%c' + 'responses' + '', 'border: 1px solid #00bb1e; color: #00bb1e; padding: 2px 5px; border-radius: 8px;', books);
          // setTimeout( function() {
            done(null, books);
          // }, 1000);
          
        }
      });
      
    },
    
  },
};

function processLibraryPage( vue, response ) {
  
  const audible = $($.parseHTML(response.data)).find('div.adbl-main')[0];
  response.data = null;
  
  const books    = [];
  
  const titleRows = audible.querySelectorAll('#adbl-library-content-main > .adbl-library-content-row');
  $(titleRows).each(function () {
    
    const _thisRow = this;
    const rowItemIsBook = _thisRow.querySelector('[name="contentType"][value="Product"]') || _thisRow.querySelector('[name="contentType"][value="Performance"]');
    // Ignore anything that isn't a book, like for example podcasts...
    if ( rowItemIsBook ) {
      const bookASIN        = _thisRow.getAttribute('id').replace('adbl-library-content-row-', '');
      const bookInMemory    = _.find(vue.library.books, ['asin', bookASIN]);
      const fullScan_ALL_partialScan_NEW = vue.partialScan && !bookInMemory || !vue.partialScan;
      let book            = (vue.partialScan && bookInMemory) ? bookInMemory : {};
      
      // UPDATE SCAN: fetch these only if the book is a new addition...
      // FULL SCAN: fetch always
      if ( fullScan_ALL_partialScan_NEW ) {
        book.asin       = bookASIN;
        const getCover  =  _thisRow.querySelector('a > img.bc-pub-block:first-of-type').getAttribute('src');
        if ( getCover.lastIndexOf('img-coverart-prod-unavailable') > -1 ) {
          book.coverUrl = getCover;
        }
        else {
          book.coverUrl   = getCover.match(/\/images\/I\/(.*)._SL/)[1];
        }
        // book.url        = _thisRow.querySelector(':scope > div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a').getAttribute('href').split('?')[0];
        book.title      = _thisRow.querySelector(':scope > div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a > span').textContent.trimAll();
        book.authors    = vue.getArray(_thisRow.querySelectorAll('.authorLabel > span > a'));
        book.narrators  = vue.getArray(_thisRow.querySelectorAll('.narratorLabel > span > a'));
        book.series     = vue.getSeries(_thisRow.querySelector('.seriesLabel'));
        book.blurb      = _thisRow.querySelector('.summaryLabel > span').textContent.trimAll();
        const fromPlusCatalog = _thisRow.querySelector('input[value="AudibleDiscovery"]');
        if ( fromPlusCatalog ) book.fromPlusCatalog = true;
      }
      
      // ALWAYS FETCH ↓↓ ( downloaded, favorite, progress, myRating )
      
      // Came from the plus catalog but is no longer available there.
      const unavailableBtn = _thisRow.querySelector('.adbl-library-inaccessible-button');
      if ( unavailableBtn ) book.leftPlusCatalog = true;
      
      // Downloaded
      book.downloaded = _thisRow.querySelector('.adbl-library-action > div:nth-child(4) > span') ? true : null;
      
      // Favorite
      const favorite = _thisRow.querySelector('[id^="remove-from-favorites-button"]:not(.bc-pub-hidden)');
      if ( favorite ) book.favorite = true;
      
      // Progress
      const progressbar = _thisRow.querySelector('[id^="time-remaining-display"] [role="progressbar"]');
      const finished = _thisRow.querySelector('[id^="time-remaining-finished"]:not(.bc-pub-hidden)') ? true : false;
      const timeRemaining = _thisRow.querySelector('[id^="time-remaining"]:not(.bc-pub-hidden)').textContent.trimAll();
      if (progressbar || finished) {
        book.progress = timeRemaining;
      }
      else {
        book.length   = timeRemaining;
        book.progress = 0;
      }
      
      // Own rating
      const myRating = _thisRow.querySelector('div.bc-rating-stars.adbl-prod-rate-review-bar.adbl-prod-rate-review-bar-overall').getAttribute('data-star-count');
      if ( myRating > 0 ) book.myRating = myRating;
      
      book = _.omitBy( book, _.isNull );
      
      // - - - - - - - 
      
      if ( vue.partialScan && !bookInMemory ) book.new = true;
      if ( fullScan_ALL_partialScan_NEW ) ++vue.progress.maxLength;
      books.push(book);
      
    } else {
      // console.log('%c' + ' ' + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;', _thisRow.querySelector(':scope > div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a > span').textContent.trimAll(), '('+ _thisRow.querySelector('[name="contentType"]').value +')' );
    }
  });
  
  console.log('%c' + '  ' + '', 'background: #7d0091; color: #fff; padding: 2px 5px; border-radius: 8px;', books);
  return books;
  
}
