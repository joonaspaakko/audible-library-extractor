
import rateLimit from 'axios-rate-limit';
// import Fuse from 'fuse.js';

export default {
  methods: {
    getISBNsFromGoogleBooks: function( hotpotato, isbnsFetched ) {
      
      if ( !_.find( hotpotato.config, { name: 'isbn'}).value ) {
        isbnsFetched( null, hotpotato ); 
      }
      else {
        
        this.$root.$emit('update-big-step', {
          title: 'International Standard Book Number (ISBN)',
          stepAdd: 1,
        });
        
        this.$root.$emit('update-progress', {
          text: 'Fetching ISBNs from Google Books API...',
          step: 0,
          max: 0,
          bar: true,
        });
        
        const vue = this;
        fetchISBNs( vue, hotpotato, isbnsFetched );
        
      }
    },
    
  },
};


function fetchISBNs( vue, hotpotato, isbnsFetched ) {
  
  const requestUrls = [];
  
  // hotpotato.books.length = 100;
  
  _.each( hotpotato.books, function( book ) {
    
    if ((book.title) && book.authors) {
      // const query = /*'intitle:' +*/ book.title + '+inauthor:' + book.authors[0].name;
      const query = /*'intitle:' +*/ encodeURIComponent(book.title) + '+inauthor:' + encodeURIComponent(book.authors[0].name);
      // const langrestrict = book.language === 'English' ? 'langRestrict=en&' : '';
      const langrestrict = '';
      
      requestUrls.push({
        url: 'https://www.googleapis.com/books/v1/volumes?' + langrestrict + '&maxResults=5&q=' + query,
        asin: book.asin,
        title: book.title,
      });
      
    }
    
  });
  
  vue.$root.$emit('update-progress', { max: requestUrls.length });
  const letMeAxiosAQuestion = axios.create();
  axiosRetry(
    letMeAxiosAQuestion, 
    { 
      retries: 5, 
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: function(error) {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response.status == "429";
      } 
    }
  );
  const isbn = rateLimit( letMeAxiosAQuestion, { maxRequests: 10, perMilliseconds: 1100 });
  
  asyncMap( requestUrls,
    function( request, stepCallback ) {
      
      isbn.get( request.url ).then(function( response ) {
        
        const book = _.find( hotpotato.books, { asin: request.asin });
        if ( response && response.status >= 200 && response.status < 300 && response.data && response.data.totalItems ) {
          
          // const fuse = new Fuse(response.data.items, {
          //   keys: [ 'volumeInfo.title' ]
          // });
          // const fuseresult = fuse.search( book.titleShort );
          
          const api_book = _.find( response.data.items, function( item ) { 
            let foundIsbn = false;
            _.each( item.volumeInfo.industryIdentifiers, function( identifier ) {
              if ( identifier.type === 'ISBN_10' || identifier.type === 'ISBN_13' ) foundIsbn = true;
            }); 
            return foundIsbn;
          });
          
          if ( api_book ) {
            let isbns = [];
            _.each( api_book.volumeInfo.industryIdentifiers, function( identifier ) {
              if ( identifier.type === 'ISBN_10' || identifier.type === 'ISBN_13' ) isbns.push( identifier );
            });
            if ( isbns.length > 0 ) {
              
              book.isbns = isbns;
              if ( _.get(api_book, 'volumeInfo.imageLinks.smallThumbnail') ) vue.$root.$emit('update-progress-thumbnail', api_book.volumeInfo.imageLinks.smallThumbnail.replace('http://', 'https://') );
              
            }
          }
        }
        
        if ( !book.isbns ) { 
          console.log('%c' + "Couldn't find ISBN(S): " + book.title + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;', response);
        }
        
        vue.$root.$emit('update-progress-step');
        stepCallback( null );
        
      }).catch(e => {
        console.log('%c' + "Couldn't find ISBN(S): " + request.title + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;', e.respone);
        stepCallback( null );
      });
      
    },
    function(err, result) {
      
      console.log( 'ISBNS:', _.filter( hotpotato.books, 'isbns' ).length, 'isbns (true):', _.filter( hotpotato.books, {isbns: true} ).length, 'books:', hotpotato.books.length );
      
      if ( !err ) { 
        vue.$root.$emit('reset-progress');
        isbnsFetched( null, hotpotato ); 
      }
      else console.log( err );
    }
  );
  
}