const axios = require('axios');
const Url = require('domurl');
const _ = require('lodash');
global.$ = require('jquery');

import Vue from 'vue'
import App from './App'
import aleOverlay from './_components/aleOverlay'
Vue.component('ale-overlay', aleOverlay);
import aleSplashscreen from './_components/aleSplashscreen'
Vue.component('ale-splashscreen', aleSplashscreen);
import aleProgress from './_components/aleProgress'
Vue.component('ale-progress', aleProgress);

import './../../node_modules/balloon-css/balloon.min.css';
import './../../node_modules/bulma/css/bulma.min.css';
import './../assets/css/fontawesome-all.css';

global.browser = require('webextension-polyfill');
Vue.prototype.$browser = global.browser;
// Clear Chrome's local storage
// browser.storage.local.clear(); console.log( 'Chrome storage CLEARED' );

var inTheLibrary = window.location.pathname === '/library/titles' || window.location.pathname === '/library' || window.location.pathname === '/lib';
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
    
    $(`
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
    `).insertAfter( filtersLast );
    
    $('#audible-library-extractor-btn').on("click", function( e ) {

      e.preventDefault();
      
      // https://developer.chrome.com/apps/storage
      // Permission: "storage"
      browser.storage.local.get(['library']).then( data => {
        var oldLibraryData = data.library;
        audibleLibraryExtractor( oldLibraryData, libraryStyle );
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
        browser.storage.local.get(['library']).then( data => {
          var oldLibraryData = data.library;
          audibleLibraryExtractor( oldLibraryData, libraryStyle );
        });
      }
    });
    
  }); // on ready
}  // in library page


function audibleLibraryExtractor( oldLibraryData, libraryStyle ) {
  
  var base = $('<div id="audible-library-extractor"></div>').prependTo('body');
  
  var ale = new Vue({
    render: h => { return h(App); },
    el: '#audible-library-extractor',
    data: {
      nextStep: null,
      libraryStyle: libraryStyle,                                                                                                                                                                                                   // 'https://www.audible.com/library/titles?ref=a_library_t_c3_sortBy_PURCHASE_DATE.dsc&pf_rd_p=dca9ae45-7e31-4c31-8f67-4f550cbd3e4b&pf_rd_r=28DGMM0BK5YHJF5FD7RH&sortBy=PURCHASE_DATE.dsc&pageSize=50'
      libraryPage: libraryStyle === 'old' ? window.location.origin + '/lib?page=1&ref=a_lib_c3_programFilter_all&purchaseDateFilter=all&programFilter=all&sortBy=PURCHASE_DATE.dsc&pageSize=50&ipRedirectOverride=true' : window.location.origin + '/library/titles?page=1&ref=a_library_t_c3_sortBy_PURCHASE_DATE.dsc&pf_rd_p=dca9ae45-7e31-4c31-8f67-4f550cbd3e4b&pf_rd_r=873BC8CWET7GZC3QJFPC&sortBy=PURCHASE_DATE.dsc&pageSize=50',
      // 'https://www.audible.com/library/titles?page=1&ref=a_library_t_c3_sortBy_PURCHASE_DATE.dsc&pf_rd_p=dca9ae45-7e31-4c31-8f67-4f550cbd3e4b&pf_rd_r=5MQYY3NX2PJTYJNEDMQA&sortBy=PURCHASE_DATE.dsc&pageSize=50'
      // 'https://www.audible.com/library/titles?page=1&ref=a_library_t_c3_sortBy_PURCHASE_DATE.dsc&pf_rd_p=dca9ae45-7e31-4c31-8f67-4f550cbd3e4b&pf_rd_r=873BC8CWET7GZC3QJFPC&sortBy=PURCHASE_DATE.dsc&pageSize=50'
      //'https://www.audible.com/library/titles?ref=a_library_t_c6_pageNum_1&pf_rd_p=916cc708-f98b-49cb-b322-8769f6bef92e&pf_rd_r=1YA95WP9G6GQBKQZ28AT&sortBy=PURCHASE_DATE.dsc&pageSize=50&page=2'
      //'https://www.audible.com/library/titles?ref=a_library_t_c6_pageNum_3&pf_rd_p=916cc708-f98b-49cb-b322-8769f6bef92e&pf_rd_r=1YA95WP9G6GQBKQZ28AT&sortBy=PURCHASE_DATE.dsc&pageSize=50&page=5'
      // bookASINs: [],
      storageDataExists: (!_.isEmpty( oldLibraryData )) ? oldLibraryData : false,
      library: {
        books: [],
        storePageMissing: []
      },
      progress: {
        show: false,
        pageSize: 0,
        titles: 0,
        step: 0,
        libraryFetched: null,
      }
    },
    beforeMount: function() {
      
      var vue = this;
      
      
      vue.$root.$on('nextStep', function( step ) {
        vue.nextStep = step;
        vue[ 'init_'+step ]();
      });
      
    },
    methods: {
      
      init_extract: function() {
        
        this.progress.show = true;
        this.getLibraryPagesLength(); // Cascades down from here...
        
      },
      init_update: function() {
        
        if ( !_.isEmpty( oldLibraryData ) ) this.library = oldLibraryData;
        alert( 'Not available' );
        
      },
      init_output: function() {
        
        if ( !_.isEmpty( oldLibraryData ) ) this.library = oldLibraryData;
        this.goToOutputPage();
        
      },
      
      getLibraryPagesLength: function() {
        
        var vue = this;
        axios.get( vue.libraryPage ).then(function( response ) {
          
          var audible = $("<div>").html( response.data );
          vue.progress.pageSize = audible.find('.pageNumberElement:last').data('value');
          
          vue.getInitialLibraryData1();
          
        });

      },
      
      getInitialLibraryData1: function() {
        
        var vue = this;
        
        var libraryPages = (function( pageSize ) {
          var libUrl = new Url( vue.libraryPage );
          var pages = [];
          for (var page = 1; page <= pageSize; page++) {
            libUrl.query.page = page;
            pages.push( libUrl.toString() );
          }
          return pages;
        }( vue.progress.pageSize ));
        
        // libraryPages.length = 1;
        
        vue.ajaxios({
          request: libraryPages,
          step: function( response ) {
            
            var audible = $("<div>").html( response.data );
            response.data = vue.getInitialLibraryData2( audible );
            
          },
          done: function( responses ) {
            
            vue.progress.libraryFetched = true;
            vue.library.books = _.flatten( _.map(responses, 'data') );
            vue.getBookData1();
            
          }
        });
        
      },
      
      ajaxios: function( options ) {
        
        options.request;
        options.step;
        options.done;
        
        var vue = this;
        
        axios.all(
          options.request.map( function( url, index, array ) {
            return axios.request( url ).then(function( response ) {
              if ( response ) options.step( response, index, array );
              return response;
            }).catch(function( e ) {
              if ( e.response ) options.step( e.response, index, array );
              return e.response;
            });
          })
        ).then(
          axios.spread( function( ...response ) {
            options.done( response );
          })
        );
        
      },
      
      getInitialLibraryData2: function( audible ) {
        
        var vue = this;
        var libraryWrapper = audible.find('#adbl-library-content-main');
        
        var books = [];
				
        // Old library style
        if ( vue.libraryStyle === 'old' ) {
          var titleRows = libraryWrapper.find('> table > tbody > tr.bc-table-row').not(':first').not(':last');
          $( titleRows ).each( function() {
            
            var _thisRow = $(this);
            var asin = _thisRow.attr('id').replace('adbl-library-content-row-','');
            // vue.bookASINs.push( asin );
            
            var book = {};
            book.asin = asin;
            book.title = _thisRow.find('> td:nth-child(2) > div > span > span > ul > li:nth-child(1) > a').text().trim().replace(/\s+/g,' ');
            book.dateAdded = _thisRow.find('> td:nth-child(5) > div > span > div > div > span').text().trim();
            book.url = window.location.origin + _thisRow.find('> td:nth-child(2) .bc-list > li:first a').attr('href');
            book.bookLength = _thisRow.find('> td:nth-child(4) > div > span > div > div > span').text().trim();
            book.authors = vue.getArray( _thisRow.find('> td:nth-child(3) > div > span > span > ul > a') );
            book.series = [{
              bookNumber: _thisRow.find('> td:nth-child(2) > div > span > span > ul > li:nth-child(1) > a').text().trim().replace(/\s+/g,' ').split(',')[1],
              name: '',
              url: window.location.origin + '/' + _thisRow.find('> td:nth-child(2) .bc-list > li:last a').attr('href')
            }];
            book.progress = _thisRow.find('> td:nth-child(1) .bc-col > div:last').text().trim().replace(/\s+/g,' ');
            book.coverUrl = _thisRow.find('> td:nth-child(1) .bc-col > div:first img').data('bc-hires');
            book.downloadUrl = _thisRow.find('> td:nth-child(8) a').attr('href');
            book.downloaded = _thisRow.find('> td:nth-child(7) > div > span > div > i').length > 0;
            book.ownRating = vue.getOwnRating( _thisRow.find('> td:nth-child(6) > div > span > div > div > div > .bc-row-responsive').not(':last') );
            
            books.push( book );
            ++vue.progress.titles;
            
          });
        }
        // new library style
        else {
          
          var titleRows = libraryWrapper.find('> .adbl-library-content-row');
          
          $( titleRows ).each( function() {
            
            var _thisRow = $(this);
            var asin = _thisRow.attr('id').replace('adbl-library-content-row-','');
            // vue.bookASINs.push( asin );
            
            var book = {};
            book.asin = asin;
            book.title = _thisRow.find('> div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a > span').text().trim().replace(/\s+/g,' ');
            book.dateAdded = null;
            book.url = window.location.origin + _thisRow.find('> div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a').attr('href');
            book.authors = vue.getArray( _thisRow.find('li.bc-list-item.authorLabel > span > a') );
            book.series = vue.getArray( _thisRow.find('li.bc-list-item.seriesLabel > span > a') );
            book.bookNumbers = vue.getBookNumbers( _thisRow.find('li.bc-list-item.seriesLabel') );
            book.series = vue.supplementArray( book.series, book.bookNumbers );
            book.progress = _thisRow.find('[id^="time-remaining"]:not(.bc-pub-hidden)').text().trim().replace(/\s+/g,' ');
            book.coverUrl = _thisRow.find('img.bc-pub-block:first').attr('src');
            book.downloadUrl = _thisRow.find('.adbl-lib-action-download > a').attr('href');
            book.downloaded = _thisRow.find('> div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.adbl-library-action.bc-col-2.bc-col-offset-1 > div:nth-child(4) > span').length > 0;
            var ratingWrap = _thisRow.find('div.bc-rating-stars.adbl-prod-rate-review-bar.adbl-prod-rate-review-bar-overall');
            var ratingEl = ratingWrap.find('.bc-rating-star:checked:last');
            book.ownRating = {
              text: ratingEl.data('text'),
              rating: ratingEl.data('index')
            };
            
            books.push( book );
            ++vue.progress.titles;
            
          });
        }
				
				return books;
        
      },
      
      getOwnRating: function( ratingWrappers ) {
        var ratings = {};
        ratingWrappers.each(function() {
          var _this = $(this);
          var ratingType = _this.find('> div:first h3').text().trim();
          ratings[ ratingType ] = _this.find('> div:last .bc-rating-star[aria-checked="true"]').data('index') || 0;
        });
        return ratings;
      },
      
      getBookData1: function() {
        
        var vue = this;
        
        // var bookASINs = vue.bookASINs;
        var bookURLs = _.map( vue.library.books, 'url' );
        
        // bookASINs.length = 3;
        // bookURLs.length = 3;
        
        vue.ajaxios({
          request: bookURLs,
          step: function( response, index, array ) {
          
            var book = _.find( vue.library.books, ['url', response.config.url] );
            
            if ( response.status >= 400 ) {
              book.storePageMissing = true;
              vue.library.storePageMissing.push( book );
            }
            else {
              var audible = $("<div>").html( response.data );
              book.changesSinceAdded = response.config.url !== response.request.responseURL;
              vue.getBookData2( audible, book );
            }
            
            ++vue.progress.step;
            
          },
          done: function( responses ) {
            
            vue.goToOutputPage();
            
          }
        });
        
      },
      
      getBookData2: function( audible, book ) {
        
        var vue = this;
        var body = audible.find('> .adbl-page');
        // This is the type of page, that Audible uses exclusively for their own titles with like the big hero image at the top with some elementse on top of it.
        var featuredBook = body.find('.dlp-hero').length > 0;
        var center1 = body.find('#center-1');
        var center1div = body.find('#center-1 > div > div > div');
        // Normal layout...
        if ( body.find('.productPublisherSummary').length > 0 ) {
          book.added = body.find('#adbl-buy-box-purchase-date > span').text().trim().replace(/\s+/g,' ');
          var titleElem = center1div.find('> div.bc-col-responsive.bc-col-5 > span > ul > li:nth-child(1) > h1');
          book.title = titleElem.length > 0 ? center1div.find('> div.bc-col-responsive.bc-col-5 > span > ul > li:nth-child(1) > h1').text().trim() : center1div.find('> div.bc-col-responsive.bc-col-5 > span > ul > li.bc-list-item.bc-spacing-small > h1').text().trim();
          book.rating = center1div.find('> div.bc-col-responsive.bc-col-5 > span > ul > li.bc-list-item.ratingsLabel > span:nth-child(3)').text().trim();
          book.ratings = center1div.find('> div.bc-col-responsive.bc-col-5 > span > ul > li.bc-list-item.ratingsLabel > a').text().trim();
          book.summary = body.find('.productPublisherSummary > div > .bc-box:first').html().trim().replace(/\s+/g,' ');
          var col5ul = center1div.find('> div.bc-col-responsive.bc-col-5 > span > ul');
          var releaseDateLabel = col5ul.find('> li.bc-list-item.releaseDateLabel');
          book.releaseDate = releaseDateLabel.length > 0 ? releaseDateLabel.text().trim().split(':')[1].trim() : null;
          book.publisher = col5ul.find('> li.bc-list-item.publisherLabel > a').text().trim();
          book.authors = vue.getArray( col5ul.find('> li.bc-list-item.authorLabel > a') );
          if ( !book.changesSinceAdded ) book.narrators = vue.getArray( col5ul.find('> li.bc-list-item.narratorLabel > a') );
          book.series = vue.getArray( col5ul.find('> li.bc-list-item.seriesLabel > a') );
          book.bookNumbers = vue.getBookNumbers( col5ul.find('> li.bc-list-item.seriesLabel') );
          book.series = vue.supplementArray( book.series, book.bookNumbers );
          book.categories = vue.getArray( body.find('#center-1 > div > div > nav > a') );
          book.sample = body.find('#sample-player-'+ book.id +' > button').data('mp3');
        }
        // Audible original layout with the large image in the background...
        else if ( featuredBook ) {
          book.added = body.find('#adbl-buy-box-purchase-date > span').text().trim().replace(/\s+/g,' ');
          var heroContChild1 = center1.find('> div.bc-box > div > div > div > div.hero-content > div > div > div:nth-child(1)');
          book.title =  heroContChild1.find('> h1').text().trim();
          book.rating = heroContChild1.find('> div.bc-section.ratingsLabel > span.bc-text.bc-color-base').text().trim();
          book.ratings = heroContChild1.find('> div.bc-section.ratingsLabel > a').text().trim();
          var bcContDiv = center1.find('> div.bc-container > div');
          var summaryHtml = bcContDiv.find('> div.bc-col-responsive.bc-col-6 > span').html();
          book.summary = summaryHtml ? summaryHtml.trim().replace(/\s+/g,' ') : null;
          var child2ul = bcContDiv.find('> div:nth-child(2) > span > ul');
          var releaseDateLabel = child2ul.find('> li.bc-list-item.releaseDateLabel');
          book.releaseDate = releaseDateLabel.length > 0 ? releaseDateLabel.text().trim().split(':')[1].trim() : null;
          book.publisher = child2ul.find('> li.bc-list-item.publisherLabel > a').text().trim();
          book.authors = vue.getArray( child2ul.find('> li.bc-list-item.authorLabel > a') );
          book.narrators = vue.getArray( child2ul.find('> li.bc-list-item.narratorLabel > a') );
          book.series = vue.getArray( child2ul.find('> li.bc-list-item.seriesLabel > a') );
          book.bookNumbers = vue.getBookNumbers( child2ul.find('> li.bc-list-item.seriesLabel') );
          book.series = vue.supplementArray( book.series, book.bookNumbers );
          book.categories = vue.getArray( child2ul.find('> li.bc-list-item.categoriesLabel > a') );
          var languageLabel = body.find('#center-1 > div.bc-container > div > div:nth-child(2) > span > ul > li.bc-list-item.languageLabel');
          book.language = languageLabel.length > 0 ? languageLabel.text().split(':')[1].trim() : null;
          book.sample = body.find('#sample-player-'+ book.id +' > button').data('mp3');
        }
        
        book.peopleAlsoBought = vue.carouselDataFetch( audible, 5 );
        book.moreLikeThis = vue.carouselDataFetch( audible, 6 );
        
      },
      
      getArray: function( elements ) {
        var objArray = [];
        elements.each( function() {
          objArray.push({
            name: $(this).text().trim(),
            url: window.location.origin + $(this).attr('href')
          });
        });
        return objArray.length > 0 ? objArray : null;
      },
      supplementArray: function( output, input ) {
        if ( input ) {
          $.each( output, function( i, series ) {
            series.bookNumber = input[i];
          });
        }
        return output;
      },
      getBookNumbers: function( element ) {
        var clone = element.clone();
        clone.find('a').remove();
        var seriesString = clone.text().trim().replace(/\s+/g,' ').split(':')[1];
        clone.remove();
        if ( seriesString ) {
          var seriesArray = seriesString.split(', ').filter(function ( v ) {
            return v.trim() ? true : false;
          });
          return seriesArray.length > 0 ? seriesArray : null;
        }
        else {
          return null;
        }
      },
      
      carouselDataFetch: function( audible, carouselID ) {
    
        var books = [];
        
        // People who bought this also bought... Popup contents
        var carousel = audible.find('#adbl-web-carousel-c'+ carouselID );
        if ( !carousel ) carousel = audible.find('#adbl-web-carousel-c' + carouselID );
        
        if ( carousel.length > 0 ) {
          
          var carouselItem = carousel.find('.responsive-product-square');
          var flyout = carouselItem.next('[id^=product-list-flyout]');
          var popover = flyout.find('.bc-popover-inner');

          popover.each(function() {
            
            // Product cover url
            var cover = $(this).closest('[id^=product-list-flyout]').parent().find('[id^="product-carousel-image"]').attr('data-lazy');
            if ( !cover ) cover = $(this).closest('[id^=product-list-flyout]').parent().find('[id^="product-carousel-image"]').attr('src');
            if ( cover )
              cover.replace('._SL5_.','._SL320_.');
            else
              cover = null;
            
            var url = $(this).closest('[id^=product-list-flyout]').parent().find('[id^="product-carousel-image"]').parent('a').attr('href');
            if ( url ) url = window.location.origin + url;
            
            // Popover (hover card)
            // Everything above ratings
            var top = $(this).find('span:nth-child(1) ul');
            // Title
            var title = top.find('li:nth-child(1) > h2').text();
            if ( title ) title = title.trim();
            // Series name?
            var seriesName = top.find('li:nth-child(2)').text();
            if ( seriesName ) seriesName = seriesName.replace(/\s+/g,' ').trim();
            // Author
            var authors = top.find('li:nth-child(3)').text();
            if ( authors ) authors = authors.replace(/\s+/g,' ').trim().split('By: ')[1];
            // Narrators
            var narrators = top.find('li:nth-child(4)').text();
            if ( narrators ) narrators = narrators.replace(/\s+/g,' ').trim().split('Narrated by: ')[1];
            // Length
            var length = top.find('li:nth-child(5)').text();
            if ( length ) length = length.replace(/\s+/g,' ').trim().split('Length: ')[1];
            // Bridged
            var bridged = top.find('li:nth-child(6)').text();
            if ( bridged ) bridged = bridged.trim();
            
            // Ratings
            var ratings = $(this).find('span:nth-child(2) ul');
            // Overall rating
            var labelOverall = ratings.find('li:nth-child(1) > div > div:nth-child(1)').text();
            if ( labelOverall ) labelOverall = labelOverall.trim();
            var ratingOverall = ratings.find('li:nth-child(1) > div > div:nth-child(2) > span:first').text();
            if ( ratingOverall ) ratingOverall = ratingOverall.trim().split(' out of ')[0];
            // Performance rating
            var labelPerformance = ratings.find('li:nth-child(2) > div > div:nth-child(1)').text();
            if ( labelPerformance ) labelPerformance = labelPerformance.trim();
            var ratingPerformance = ratings.find('li:nth-child(2) > div > div:nth-child(2) > span:first').text();
            if ( ratingPerformance ) ratingPerformance = ratingPerformance.trim().split(' out of ')[0];
            // Story rating
            var labelStory = ratings.find('li:nth-child(3) > div > div:nth-child(1)').text();
            if ( labelStory ) labelStory = labelStory.trim();
            var ratingStory = ratings.find('li:nth-child(3) > div > div:nth-child(2) > span:first').text();
            if ( ratingStory ) ratingStory = ratingStory.trim().split(' out of ')[0];
            
            // Summary
            var summary = $(this).find('> p:nth-child(3)');
            if ( summary.length > 0 ) summary = summary.text();
            if ( summary.length > 0 && summary ) summary = summary.trim();
            if ( !summary ) {
              var summary = $(this).find('> p:nth-child(4)');
              if ( summary.length > 0 ) summary = summary.text();
              if ( summary.length > 0 && summary ) summary = summary.trim();
            }
            
            var book = {};
            book.url = url;
            book.coverUrl = cover;
            book.title = title;
            book.seriesName = seriesName;
            book.authors = authors;
            book.narrators = narrators;
            book.length = length;
            book.bridged = bridged;
            book.ratingOverall = ratingOverall;
            book.ratingPerformance = ratingPerformance;
            book.ratingStory = ratingStory;
            book.summary = summary;
            
            books.push( book );
            
          });
        }
        
        return books.length > 0 ? books : null;
        
      },
      
      goToOutputPage: function() {
        
        var vue = this;
        var data = { library: vue.library };
        browser.storage.local.set( data ).then( () => {
          browser.runtime.sendMessage({ action: 'openOutput' });
        });
        
      }
      
    }
  });
  
}
