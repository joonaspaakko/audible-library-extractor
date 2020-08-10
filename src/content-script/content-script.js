
const axios = require('axios');
const axiosRetry = require('axios-retry');
const Url = require('domurl');
const _ = require('lodash');
global.$ = require('jquery');
const dateFns = require('date-fns');
const DOMPurify = require('dompurify');

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false;
Vue.config.devtools = false;

import aleOverlay from './_components/aleOverlay'
Vue.component('ale-overlay', aleOverlay);
import aleSplashscreen from './_components/aleSplashscreen'
Vue.component('ale-splashscreen', aleSplashscreen);
import aleProgress from './_components/aleProgress'
Vue.component('ale-progress', aleProgress);

import timeStringToSeconds from '../output-page/_mixins/timeStringToSeconds';
import secondsToTimeString from '../output-page/_mixins/secondsToTimeString';

import './../../node_modules/balloon-css/balloon.min.css';
import './../../node_modules/bulma/css/bulma.min.css';
import './../assets/css/fontawesome-all.css';

global.browser = require('webextension-polyfill');
Vue.prototype.$browser = global.browser;
// Clear Chrome's local storage
// browser.storage.local.clear(); console.log( 'Chrome storage CLEARED' );

String.prototype.trimAll = function() {
  if ( this ) { return this.trim().replace(/\s+/g,' '); }
  else { return null; }
}
String.prototype.trimToColon = function() {
  if ( this ) { return this.substring(this.indexOf(':') + 1).trim(); }
  else { return null; }
}


const inTheLibrary = window.location.pathname === '/library/titles' || window.location.pathname === '/library' || window.location.pathname === '/lib';
if ( inTheLibrary ) {
  $(function() {
    
    var filtersLast = '';
    var libraryStyle = 'new';
    // New library
    filtersLast = $('#center-3 > div.bc-container > div.bc-row-responsive.adbl-library-refinement-section > div:nth-child(1) > span:nth-child(3)');
    // Old Library
    if ( filtersLast.length < 1 ) {
      filtersLast = $('#center-3 > div > div > div > div.bc-col-responsive > div > form > span:nth-child(4)');
      libraryStyle = 'old';
    }
    
    $(
      DOMPurify.sanitize(
        `
        <span> </span>
        <span id="audible-library-extractor-btn" class="bc-button bc-button-outline bc-button-small bc-button-inline">
          <button class="bc-button-text" aria-label="Audible Library Extractor" type="button" tabindex="0">
            <span class="bc-text bc-button-text-inner bc-size-small">
              Audible Library Extractor
              <span class="icon is-small">
                <i class="far fa-play-circle"></i>
              </span>
            </span>
          </button>
        </span>
      `
      )
    ).insertAfter(filtersLast, { SAFE_FOR_JQUERY: true });
    
    $('#audible-library-extractor-btn').on("click", function( e ) {

      e.preventDefault();
      
      // https://developer.chrome.com/apps/storage
      // Permission: "storage"
      browser.storage.local.get(null).then( data => {
        audibleLibraryExtractor( (_.isEmpty( data ) ? null : true), libraryStyle );
			});
        
    });
    
    // LISTENING FOR MESSAGES FROM BACKGROUND.JS
    // - Clicking the extension icon sends a message "iconClicked"
    // https://developer.chrome.com/apps/messaging#simple
    // https://developer.chrome.com/apps/runtime#event-onMessage
    browser.runtime.onMessage.addListener( message => {
      if ( message.iconClicked ) {
        // https://developer.chrome.com/apps/storage
        // Permission: "storage"
        browser.storage.local.get(null).then( data => {
          audibleLibraryExtractor( (_.isEmpty( data ) ? null : true), libraryStyle );
        });
      }
    });
    
  }); // on ready
}  // in library page


function audibleLibraryExtractor( oldLibraryData, libraryStyle ) {
  
  $(
    DOMPurify.sanitize('<div id="audible-library-extractor"></div>', { SAFE_FOR_JQUERY: true })
  ).prependTo('body');
  
  new Vue({
    render: h => { return h(App); },
    el: '#audible-library-extractor',
    mixins: [
      timeStringToSeconds,
      secondsToTimeString,
    ],
    data: {
      partialScan: false,
      localStorageBooksLength: 'n/a',
      nextStep: null,
      libraryStyle: libraryStyle,
      libraryUrl: window.location.origin + '/library/titles?ale=true',                                                                                                                                                                                                // 'https://www.audible.com/library/titles?ref=a_library_t_c3_sortBy_PURCHASE_DATE.dsc&pf_rd_p=dca9ae45-7e31-4c31-8f67-4f550cbd3e4b&pf_rd_r=28DGMM0BK5YHJF5FD7RH&sortBy=PURCHASE_DATE.dsc&pageSize=50'
      collectionsUrl: window.location.origin + '/library/collections',                                                                                                                             
      storageDataExists: oldLibraryData ? true : false,
			newBooks: [],
      library: {
        domainExtension: window.location.hostname.replace('www.audible',''),
        books: [],
        storePageMissing: []
      },
      progress: {
        show: false,
        text: '',
        text2: '',
        step: 0,
        maxLength: 0,
        bar: false,
        pageSize: 0
      }
    },
    beforeMount: function() {
      
      const vue = this;
      
      vue.$root.$on('nextStep', function( step ) {
        vue.nextStep = step;
        vue[ 'init_'+step ]();
      });
      
      vue.init_storePageTest();
      
    },
    methods: {
      
      init_extract: function() {
        
        const vue = this;
        vue.progress.show = true;
        // this.getLibraryPagesLength(); // Cascades down from here...
        vue.scrapingPrep( vue.libraryUrl, function( pageNumbers, url ) {
          vue.getInitialLibraryData1( pageNumbers, url );
        });
        
      },
      init_update: function() {
        
        const vue = this;
        browser.storage.local.get(null).then( data => {
          
          vue.library.books = vue.processOldLibraryData( data ).library.books;
          
          // Update test...
          // vue.library.books.splice(0, 10);
          // vue.library.books.splice(100, 1);
          
          vue.partialScan = true;
          vue.localStorageBooksLength = vue.library.books.length;
          vue.progress.show = true;
          
          vue.scrapingPrep(vue.libraryUrl, function (pageNumbers, url) {
            vue.getInitialLibraryData1(pageNumbers, url);
          });
          
        });
        
      },
      init_output: function() {
        
        this.goToOutputPage( true );
        
      },
      
      init_storePageTest: function() {
        
        console.log('============= STORE PAGE TEST ============= ' );
        
        const vue = this;
        
        vue.ajaxios({
          request: [
            'https://www.audible.com/pd/The-Martian-Audiobook/B082BHJMFF',
            'https://www.audible.com/pd/Aliens-of-Extraordinary-Ability-Audiobook/B07TXLC1NF',
            'https://www.audible.com/pd/The-Dire-King-Audiobook/B0751GMDXN'
          ],
          step: function (response) {

            var book = { test: true };
            
            if (response.status >= 400) {
              book.storePageMissing = true;
              vue.library.storePageMissing.push(book);
            }
            else {
              vue.getStorePageData(response, book );
            }
            
            return book;

          },
          done: function(responses) {

            const books = _.flatten( responses );
            console.log( books );
            console.log(' DONE');

          }
        });
        
      },
      
      processOldLibraryData: function( oldLibraryData ) {
        
        if ( _.isEmpty( oldLibraryData ) ) {
          oldLibraryData = null;
        }
        else {
          
          // Merge storage book chunks into one array
          return (function( data ) {
            const chunkKeys = [];
            const chunkLength = data[ 'books-chunk-length' ];
            for (var i = 0; i < chunkLength; i++) {
              chunkKeys.push( 'books-chunk-'+i  );
            }
            const chunks = _.pick(data, chunkKeys);
            const books = _.flatten( _.values( chunks ) );            
            return {
              library: {
                domainExtension: data[ 'domain-extension' ],
                storePageMissing: data[ 'storage-page-missing' ],
                booksChunkLength : data[ 'books-chunk-length' ],
                books: books,
              }
            };
          }( oldLibraryData ));
          
        }
        
      },
      
      scrapingPrep: function( url, callback ) {
        
        const vue = this;
        
        vue.getMaxPageSize( url, function( pageSize, url ) {
          
          url = new Url( url );
          url.query.pageSize = pageSize;
          vue.getPagesLength(url.toString(), function ( pagesLength, url ) {
            
            callback( _.range(1, pagesLength + 1), url );
            
          });
          
        });
        
      },
      
      getMaxPageSize: function( url, callback ) {
        
        const vue = this;
        axios.get( url ).then(function( response ) {
          
          const audible = $($.parseHTML(response.data)).find('div.adbl-main');
          const pageSizeDropdown = audible.find('select[name="pageSize"]');
          const maxPageSize = pageSizeDropdown.length > 0 ? pageSizeDropdown.find('option:last').val() : 50;
          callback( maxPageSize, url );
          
        });

      },
      
      getPagesLength: function( url, callback ) {
        
        const vue = this;
        axios.get( url ).then(function( response ) {
          
          const audible = $($.parseHTML(response.data)).find('div.adbl-main');
          const pagination = audible.find('.pagingElements');
          const pagesLength = pagination ? pagination.find('.pageNumberElement:last').data('value') : 1;
          callback( pagesLength, url );
          
        });

      },
      
      getInitialLibraryData1: function( pageNumbers, url ) {
        
        const vue = this;
        
        vue.progress.step = -1;
        vue.progress.text = 'Scanning library for books...';
        if ( vue.partialScan ) {
          vue.progress.text = 'Updating old books (' + vue.localStorageBooksLength + ') and adding new books...';
        }
        
        const requestUrls = _.map(pageNumbers, function( page ) { return url + '&page=' + page });
        vue.ajaxios({
          request: requestUrls,
          step: function( response ) {
            
            return vue.getlibraryPageData( response );
            
          },
          done: function( responses ) {
            
            vue.library.books = _.flatten( _.map(responses, 'books') );
            
            const newBooks = _.compact(_.flatten(_.map(responses, 'newBooks') ) );
            if ( newBooks && newBooks.length > 0 ) vue.newBooks = newBooks;
            
            setTimeout( function() {
              vue.getBookData1();
            }, 1000);
            
          }
        });
        
      },
      
      ajaxios: function( options ) {
        
        // options.request;
        // options.step;
        // options.done;
        // options.baseUrl;
        
        var vue = this;
        
        Promise.all(
          options.request.map( function( url, index, array ) {
            return axios.get( url ).then(function( response ) {
              return response ? options.step(response, index, array) : null;
            }).catch(function( e ) {
              return e.response ? options.step(e.response, index, array) : null;
            });
          })
        ).then( function( response ) {
          options.done( response ); 
        }).catch(function (error) {
          // handle error
          console.log(error);
        });
        
      },
      
      getlibraryPageData: function( response ) {
        
        const audible = $($.parseHTML(response.data)).find('div.adbl-main')[0];
        response.data = null;
        
        const vue      = this;
        const newBooks = [];
        const books    = [];
        
        const titleRows = audible.querySelectorAll('#adbl-library-content-main > .adbl-library-content-row');
        $(titleRows).each(function () {
          
          const _thisRow = this;
          const bookASIN = _thisRow.getAttribute('id').replace('adbl-library-content-row-', '');
          const bookInMemory    = _.find(vue.library.books, ['asin', bookASIN]);
          const partialScan_New = vue.partialScan && !bookInMemory || !vue.partialScan;
          const book            = (vue.partialScan && bookInMemory) ? bookInMemory : {};
              
          // UPDATE (SCAN): fetch these only if the book is a new addition...
          // FULL SCAN: fetch always
          if ( partialScan_New ) {
            book.asin       = bookASIN;
            book.coverUrl   = _thisRow.querySelector('a > img.bc-pub-block:first-of-type').getAttribute('src').match(/\/images\/I\/(.*)._SL/)[1];
            book.url        = _thisRow.querySelector(':scope > div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a').getAttribute('href').split('?')[0];
            book.title      = _thisRow.querySelector(':scope > div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a > span').textContent.trimAll();
            book.authors    = vue.getArray(_thisRow.querySelectorAll('.authorLabel > span > a'));
            book.narrators  = vue.getArray(_thisRow.querySelectorAll('.narratorLabel > span > a'));
            book.series     = vue.getSeries(_thisRow.querySelector('.seriesLabel'));
            book.blurb      = _thisRow.querySelector('.summaryLabel > span').textContent.trimAll();
          }
          
          // ALWAYS FETCH ↓↓ ( downloaded, favorite, progress, myRating )
          
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
          
          // - - - - - - - 
          
          if ( vue.partialScan && !bookInMemory ) newBooks.push(bookASIN);
          if ( partialScan_New ) ++vue.progress.maxLength;
          books.push(book);
          
        });
        
        const result = { books: books };
        if (newBooks.length > 0) result.newBooks = newBooks;
				return result;
        
      },
      
      getBookData1: function() {

        const vue = this;
        vue.progress.text = 'Fetching additional data from store pages...';
        vue.progress.bar  = true;
        vue.progress.step = 0;
        
        // Update (scan): new books only
        // Full scan: all books
        let urlSources = [];
        if ( vue.partialScan ) {
          urlSources = _.filter(vue.library.books, function( book ) {
            return _.includes( vue.newBooks, book.asin );
          });
        }
        else {
          urlSources = vue.library.books;
        }
        
        if ( urlSources.length > 0 ) {
          
          const bookURLs = _.map( urlSources, 'url' );
          urlSources = null;
          
          vue.ajaxios({
            request: bookURLs,
            step: function( response, index, array ) {
            
              const book = _.find( vue.library.books, ['url', response.config.url] );
              
              // vue.progress.text2 = book.title;
              
              if ( response.status >= 400 ) {
                book.storePageMissing = true;
                vue.library.storePageMissing.push( book );
              }
              else {
                vue.getStorePageData( response, book );
              }
              
              ++vue.progress.step; 
              
            },
            done: function() {
              
              // vue.getSeriesPage(); 
              // vue.goToOutputPage();
              vue.getCollections1();
            }
          });
          
        }
        else {
          
          // vue.getSeriesPage(); 
          // vue.goToOutputPage();
          vue.getCollections1();
          
        }
        
      },
      
      getStorePageData: function( response, book ) {
        
        const vue = this;
        
        var   html     = $($.parseHTML(response.data));
        const audible  = html.find('div.adbl-main')[0];
        const jsonData = JSON.parse( html.find('#bottom-0 > script:first')[0].textContent );
        const bookData = jsonData[0];
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
        if ( book.test || audible.querySelector('#sample-player-'+ book.asin +' > button') ) {
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
          
          vue.carouselDataFetch(book, audible, 'peopleAlsoBought', 5 );
          vue.carouselDataFetch(book, audible, 'moreLikeThis', 6 ); 
          // Audible seemed to have stopped using the ↑↑↑ "more like this" carousel in store pages around 2020 march-april.
          book = _.omitBy( book, _.isNull );
        }
        else { 
          book.storePageMissing = true;
          vue.library.storePageMissing.push(book);
        }
        
        
      },
      
      // This secondary fetch is needed because length is shown in the library
      // only if that same space is not occupied by "Finished" or "Xh left"
      // Unfortunately the library uses a sorter syntax, so this function shortens 
      // the length text found in the store page...
      // Nore: I opted to use the shorter syntax because the progress that is fetched 
      // from the library page uses it, so it's all consistent...
      shortenLength: function( string ) {
        
        const lengthInSeconds = this.timeStringToSeconds( string );
        return this.secondsToTimeString( lengthInSeconds, true );
        
      },
      
      getCollections1: function() {

        const vue = this;
        const seriesOrder = seriesOrderPrep.order;
        const queryURLS = seriesOrderPrep.urls;
        
        if (queryURLS.length > 0) {

          vue.progress.text = 'Fetching series order for more accurate sorting...';
          vue.progress.step = 0;
          vue.progress.maxLength = queryURLS.length;

          vue.scrapingPrep(queryURLS, function (pageNumbers, url) {
            
            const series = _.find(seriesOrder, ['url', response.config.url]);
            return vue.getInitialLibraryData1(pageNumbers, url);
            
          });

        }
        else {
          // vue.goToOutputPage();
        }
        
      },
      
      getSeriesPage: function() {

        const vue = this;
        const seriesOrderPrep = vue.prepSeriesOrder();
        const seriesOrder = seriesOrderPrep.order;
        const queryURLS = seriesOrderPrep.urls;
        
        if (queryURLS.length > 0) {

          vue.progress.text = 'Fetching series order for more accurate sorting...';
          vue.progress.step = 0;
          vue.progress.maxLength = queryURLS.length;

          vue.scrapingPrep(queryURLS, function (pageNumbers, url) {
            
            const series = _.find(seriesOrder, ['url', response.config.url]);
            return vue.getInitialLibraryData1(pageNumbers, url);
            
          });

        }
        else {
          // vue.goToOutputPage();
        }
        
      },
      
      /*
        // asin is filled immediately
        // Books array filled later
        [
          { asin: 'series-asin-1', books: ['asin-1', 'asin-2'] }, 
          { asin: 'series-asin-2', books: ['asin-1', 'asin-2'] }
          ...
        ]
      */
      prepSeriesOrder: function(  ) {

        var obj = {
          order: [],
          urls: [],
        };
        
        _.each(this.library.books, function (book) {
          if (book.series) {
            _.each(book.series, function (series) {
              
              const seriesAdded = _.find(obj.order, ['asin', series.asin]);
              if (!seriesAdded) {
                obj.urls.push( series.url );
                obj.order.push({
                  asin: series.asin,
                  url: series.url,
                  books: [],
                })
              }

            });
          }
        });

        return obj;
        
      },
      
      getSummary: function( el ) {
        
        el.removeAttribute('class');
        var children = el.querySelectorAll( '*' );
        $.each(children, function () {
          this.removeAttribute('class');
        });
        
        return DOMPurify.sanitize( el.outerHTML.trimAll() );
        
      },
      
      fixDates: function( el ) {
        
        if ( el ) {
          
          var date = el.textContent.trimToColon();
          const domainExtension = this.library.domainExtension;
          
          const regionalDateFormats = {
            '.com'   : ['m-d-y', 'MM-dd-yyyy'],
            '.ca'    : ['y-m-d', 'yyyy-MM-dd'],
            '.co.uk' : ['d-m-y', 'dd-MM-yyyy'],
            '.de'    : ['d-m-y', 'dd-MM-yyyy'],
            '.fr'    : ['d-m-y', 'dd-MM-yyyy'],
            '.it'    : ['d-m-y', 'dd-MM-yyyy'],
            '.com.au': ['d-m-y', 'dd-MM-yyyy'],
            '.in'    : ['d-m-y', 'dd-MM-yyyy']
          };
          
          const formatString = regionalDateFormats[domainExtension][0] || regionalDateFormats['.com'][0];
          const formatSplit = formatString.split('-');
          
          const newDate = {
            y: null,
            m: null,
            d: null
          };
          $.each( date.split('-'), function( i, date ) {
            newDate[ formatSplit[i] ] = date;
          });
          date = null;
          // Some audible sites display all years in two digits,
          // which is very difficult to transform to 4 digits.
          // For example, if the year is 20, is it 1920, 2020, or 1420?
          // This conversion to 4 digits is not bulletproof, but better than nothing.
          if ( newDate.y.length <= 2) {
            const yearMin = 95;
            const firstNumber = newDate.y.substring(0, 1);
            if ( newDate.y >= 95 && newDate.y <= 99 ) {
              newDate.y = '19' + newDate.y;
            }
            else if ( newDate.y < 95 ) {
              newDate.y = '20' + newDate.y;
            }
          }
          const ISO8601 = [newDate.y, newDate.m, newDate.d];
          const originalFormat = regionalDateFormats[domainExtension][1] || regionalDateFormats['.com'][1];
          
          // This was just an idea to be a bit more flexible with how it shows up in the gallery, but it's not so simple
          // What if the person viewing it is not from the same country? The only proper way to do it I feel would be to 
          // Show visitors whatever format is dominant in their country... but that seems too much work, so: "year-month-day" it is for now at least
          // return {
          //   value: dateFns.format(new Date(ISO8601[0], ISO8601[1] - 1, ISO8601[2]), 'yyyy-MM-dd'),
          //   original: dateFns.format(new Date(ISO8601[0], ISO8601[1] - 1, ISO8601[2]), originalFormat),
          // };
          return dateFns.format(new Date(ISO8601[0], ISO8601[1] - 1, ISO8601[2]), 'yyyy-MM-dd');
        }
        else {
          return null;
        }
      },
      
			getSeries: function( element ) {
				const series = [];
				if ( element ) {
          const childSpan = element.querySelector(':scope > span');
          const html = childSpan ? DOMPurify.sanitize( childSpan.outerHTML ) : DOMPurify.sanitize( element.outerHTML );
					var string = html.trimAll();
          string = string.replace('</span>', '').trimToColon();
          string = $.parseHTML(string);
          
					$.each( string, function( index, object ) {
            
            var string = object.textContent.trim().replace(/^\,/,'').trimAll() || '';
            
						var titleRow = (index+1) % 2;
						var numberRow = !titleRow;
						if ( titleRow ) {
              const url = object.href.split('?')[0].replace( window.location.origin, '' );
							series.push({
								name: string,
                url: url,
                asin: url.substring(url.lastIndexOf('/') + 1)
							});
						}
						else if ( numberRow ) {
							if ( string.match(/\d/) ) {
								// Trims text from the front ("Book ") and splits numbers separated by commas
								var numbers = string.replace(/^[^0-9]*/g, '').trim().split(',');
								// Numbers are added to the previous item
								var lastItem = series[ series.length-1 ];
								lastItem.bookNumbers  = $.map( numbers, function( n, i ) {
									return parseFloat( n );
								});
							}
						}
						
					});
				}
				return series.length > 0 ? series : null;
			},
			
      getArray: function( elements ) {
        
        const objArray = [];
        $(elements).each( function() {
          const url = new Url( $(this).attr('href'), true );
          var searchNarrator;
          var searchProvider;
    			if ( url.query.searchNarrator ) searchNarrator = url.query.searchNarrator;
    			if ( url.query.searchProvider ) searchProvider = url.query.searchProvider;
    			url.clearQuery();
          if ( searchNarrator ) url.query.searchNarrator = searchNarrator;
          if ( searchProvider ) url.query.searchProvider = searchProvider;
          searchNarrator = null;
          searchProvider = null;
          objArray.push({
            name: $(this).text().trim(),
            url: url.toString()
          });
        });
        return objArray.length > 0 ? objArray : null;
      },
      // supplementArray: function( output, input ) {
      //   if ( input ) {
      //     $.each( output, function( i, series ) {
      //       series.bookNumber = input[i];
      //     });
      //   }
      //   return output;
      // },
      // getBookNumbers: function( element ) {
      //   var clone = element.clone();
      //   clone.find('a').remove();
      //   var bookString = clone.text();
      //   if ( bookString ) bookString = bookString.trim().replace(/\s+/g,' ').split(':')[1];
      //   if ( bookString ) bookString = bookString.replace(/Book/g, '');
      //   if ( bookString ) bookString = bookString.trim();
      //   clone.remove();
      //   clone = null;
      //   if ( bookString ) {
      //     var numbersArray = bookString.split(', ').filter(function ( v ) {
      //       return v.trim() ? true : false;
      //     });
          
      //     numbersArray = _.map(numbersArray, function(n) {
      //       var commaSplit =  n.split(',');
      //       var dashSplit  =  n.split('-');
      //       // Basically, here the script tries to make an array and turn the
      //       // numbers into numbers but dashed number ranges should stay as strings.
      //       if ( commaSplit.length > 1 ) {
      //         return _.map( commaSplit, function(n) {
      //           var dashSplit = n.split('-');
      //           if ( dashSplit.length > 1 ) {
      //             return n.trim();
      //           }
      //           else {
      //             return parseFloat(n);
      //           }
      //         });
      //       }
      //       else {
      //         return dashSplit.length > 1 ? n.trim() : parseFloat( n );
      //       }
      //     });
          
      //     return numbersArray.length > 0 ? numbersArray : null;
      //   }
      //   else {
      //     return null;
      //   }
      // },
      
      // People who bought this also bought... Popup contents
      carouselDataFetch: function( parentBook, audible, key, carouselID ) {
        
        const carousel = $( audible.querySelector('#adbl-web-carousel-c'+carouselID) );
        if ( carousel.length > 0 ) {
          const books = [];
          
          const carouselItem = carousel.find('.responsive-product-square');
          const flyout = carouselItem.next('[id^=product-list-flyout]');
          const popover = flyout.find('.bc-popover-inner');
          
          popover.each(function() {
            
            const book = {};
            const flyout = $(this).closest('[id^=product-list-flyout]');
            const image = flyout.prev('.responsive-product-square').find('[id^="product-carousel-image"]');
            const cover = image.attr('src') || image.attr('data-lazy');
            const url = image.parent('a').attr('href');
            book.coverUrl = cover.match(/\/images\/I\/(.*)._SL/)[1];
            book.url = url.split('?')[0];
            
            var list = $(this).find('ul');
            var listItems = list.find('li:not(.bc-size-base)');
            var subHeading = list.find('li.bc-size-base:nth-child(2)');
            if (subHeading.length > 0) book.subHeading = subHeading.text().trim();
            listItems.length = 4;
            $(listItems).each(function (i) {
              
              const _this = this.querySelector('h2') || this;
              let text = this.textContent.trimAll();
              
              if (!this.querySelector('h2')) {
                text = text.trimToColon();
              }
              
              var line = (i + 1);
              switch (line) {
                case 1:
                  book.title = text;
                  break;
                case 2:
                  book.authors = text;
                  break;
                case 3:
                  book.narrators = text;
                  break;
                case 4:
                  book.length = text;
                  break;
              }
              
            });
            books.push( book );
          });
          
          if ( books.length > 0 ) parentBook[key] = books;
          
        }
        
      },
      
      fetchISBNs: function( urlSources ) {
        
        const vue = this;
        

        // if (book.title && book.authors) {
        //   var query = 'intitle:' + encodeURIComponent(book.title) + '+inauthor:' + encodeURIComponent(book.authors[0].name);
        //   // const langrestrict = book.language === 'English' ? 'langRestrict=en&' : '';
        //   const langrestrict = '';
        //   book.booksAPIaddress = 'https://www.googleapis.com/books/v1/volumes?' + langrestrict + 'showPreorders=true&maxResults=4&q=' + query;
        // }
        
        const booksAPIaddresses = _.filter( vue.library.books, 'booksAPIaddress');
        const queryURLS = _.map( booksAPIaddresses, 'booksAPIaddress');
        
        if ( queryURLS.length > 0 ) {
          
          vue.progress.text = 'Fetching international standard book numbers (ISBN)...';
          vue.progress.step = 0;
          vue.progress.maxLength = queryURLS.length;
          
          vue.ajaxios({
            request: queryURLS,
            step: function( response, index, array ) {
              
              // const book = _.find( vue.library.books, ['booksAPIaddress', response.config.url] );
              // delete book.booksAPIaddress;
              
              if ( response.status >= 200 && response.status < 300 && response.data.totalItems ) {
                
                const lowercase_author = _.lowerCase( book.authors[0].name );
                const lowercase_title = _.lowerCase( book.title );
                
              	const api_books = response.data.items;
            		const api_book = _.find( api_books, function( ab ) {
                	const exists = {};
            			exists.author = _.find( ab.volumeInfo.authors, function( author ) {
                  	return _.lowerCase( author ) === lowercase_author;
                  });
                  
                  exists.title = _.lowerCase( ab.volumeInfo.title ).lastIndexOf( lowercase_title ) > -1;
                  exists.isbn = ab.volumeInfo.industryIdentifiers;
                  return exists.author && exists.title && exists.isbn;
                });
                
                if ( api_book ) {
                  const isbns = api_book.volumeInfo.industryIdentifiers;
                  const isbn10 = _.find( isbns, ["type", "ISBN_10"]);
                  if ( isbn10 ) book[ isbn10.type ] = isbn10.identifier;
                  const isbn13 = _.find( isbns, ["type", "ISBN_13"]);
                  if ( isbn13 ) book[ isbn13.type ] = isbn13.identifier;
                }
                
                ++vue.progress.step;
                
              }
              
              
            },
            done: function( responses ) {

              vue.goToOutputPage();
              
            }
          });
          
        }
        else {
          
          vue.goToOutputPage();
          
        }
      },
      
      goToOutputPage: function( straightFromStorage ) {

        
        const vue = this;
        
        if ( straightFromStorage ) {
          browser.runtime.sendMessage({ action: 'openOutput' });
        }
        else {
          
          // Since the added date is no longer shown in the library or store pages,
          // a property called "added" is added and also filled with what are basically index numbers 
          let booksLength = vue.library.books.length + 1;
          vue.library.books = _.map(vue.library.books, function (obj, i) {
            --booksLength;
            return _.extend(obj, {
              added: booksLength
            });
          });

          const bookChunks = _.chunk( vue.library.books, 50);
          const data = (function( chunks) {
            const obj = {
              'domain-extension': vue.library.domainExtension,
              'storage-page-missing': vue.library.storePageMissing,
              'books-chunk-length': 0
            };
            chunks.forEach((chunk, i ) => {
              obj[ 'books-chunk-'+i ] = chunk;
              ++obj[ 'books-chunk-length' ];
            });
            return obj;
          }( bookChunks, vue ));
          
          // console.log( data ); 
          
          browser.storage.local.set( data ).then( data => {
            browser.runtime.sendMessage({ action: 'openOutput' });
          });
          
        }
        
        
      }
      
    }
  });
  
}
