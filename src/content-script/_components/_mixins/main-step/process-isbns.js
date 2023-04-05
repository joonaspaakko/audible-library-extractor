import rateLimit from "axios-rate-limit"
import Fuse from 'fuse.js';

export default {
  methods: {
    getISBNsFromGoogleBooks: function(hotpotato, isbnsFetched) {
      if ( !_.find(hotpotato.config.steps, { name: "isbn" }) ) {
        
        this.$store.commit("resetProgress");
        isbnsFetched(null, hotpotato);
        
      } 
      else {
        
        this.$store.commit('update', [
          { key: 'bigStep.step', value: 0 },
        ]);
        
        this.$store.commit('update', [
          { key: 'bigStep.title', value: 'International Standard Book Number (ISBN)' },
          { key: 'bigStep.step', add: 1 },
          { key: 'progress.text2', value: "(The matching process is relatively loose: beware of false matches)" },
          { key: 'progress.text', value: "Fetching ISBNs from Google Books API..." },
          { key: 'progress.step', value: 0 },
          { key: 'progress.max', value: 0 },
          { key: 'progress.bar', value: true },
        ]);

        const vue = this;
        fetchISBNs(vue, hotpotato, isbnsFetched);
        
      }
    }
  }
};

function fetchISBNs(vue, hotpotato, isbnsFetched) {
  
  // hotpotato.books.length = 100;
  const requestUrls = [];
  let booksOfInterest = _.filter(hotpotato.books, function(o) { return !o.isbns; });
  
  _.each(booksOfInterest, function(book) {
    if ( book.title && book.authors ) {
      // const query = /*'intitle:' +*/ book.title + '+inauthor:' + book.authors[0].name;
      const query = /*'intitle:' +*/ encodeURIComponent(book.title) + "+inauthor:" + encodeURIComponent(book.authors[0].name);
      // const langrestrict = book.language === 'English' ? 'langRestrict=en&' : '';
      const langrestrict = "";

      requestUrls.push({
        url: "https://www.googleapis.com/books/v1/volumes?" + langrestrict + "&maxResults=5&q=" + query,
        asin: book.asin,
        title: book.title
      });
    }
  });
  
  vue.$store.commit('update', { key: 'progress.max', add: requestUrls.length });
  
  const letMeAxiosAQuestion = axios.create();
  axiosRetry(letMeAxiosAQuestion, {
    retries: 7,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: function(error) {
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        ( error && error.response && error.response.status == "429" )
      );
    }
  });
  const isbn = rateLimit(letMeAxiosAQuestion, {
    maxRequests: 6,
    perMilliseconds: 1100
  });

  asyncMapLimit(
    requestUrls,
    18,
    function(request, stepCallback) {
      isbn
        .get(request.url, {
          validateStatus: function (status) {
            return status >= 200 && status < 400;
          }
        })
        .then(function(response) {
          const book = _.find(hotpotato.books, { asin: request.asin });
          if (
            response &&
            response.status >= 200 &&
            response.status < 400 &&
            response.data &&
            response.data.totalItems
          ) {
            
            let fuse = new Fuse(response.data.items, {
              keys: [ 'volumeInfo.title' ],
              // shouldSort: false,
            });
            const fuseresult = _.map( fuse.search( book.titleShort ), 'item' );
            
            const api_book = _.find(fuseresult, function(item) {
              let foundIsbn = false;
              _.each(item.volumeInfo.industryIdentifiers, function(identifier) {
                if ( identifier.type === "ISBN_10" || identifier.type === "ISBN_13" ) foundIsbn = true;
              });
              return foundIsbn;
            });

            if (api_book) {
              let isbns = [];
              _.each(api_book.volumeInfo.industryIdentifiers, function( identifier ) {
                if ( identifier.type === "ISBN_10" || identifier.type === "ISBN_13" ) {
                  let obj = {
                    type: DOMPurify.sanitize(identifier.type),
                    identifier: DOMPurify.sanitize(identifier.identifier)
                  };
                  isbns.push( obj );
                }
              });
              if (isbns.length > 0) {
                book.isbns = isbns;
                
                if (_.get(api_book, "volumeInfo.imageLinks.smallThumbnail")) {
                  // vue.$root.$emit(
                  //   "update-progress-thumbnail", DOMPurify.sanitize( api_book.volumeInfo.imageLinks.smallThumbnail.replace("http://","https://") )
                  // );
                  const thumbnail = DOMPurify.sanitize( api_book.volumeInfo.imageLinks.smallThumbnail.replace("http://","https://") );
                  vue.$store.commit('update', { key: 'progress.thumbnail', value: thumbnail });
                }
                
              }
            }
          }

          if (!book.isbns) {
            console.log(
              "%c" + "Couldn't find ISBN(S): " + book.title + "",
              "background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;",
              response
            );
          }

          vue.$store.commit('update', { key: 'progress.step', add: 1 });
          stepCallback(null);
        })
        .catch(e => {
          console.log(
            "%c" + "Couldn't find ISBN(S): " + request.title + "",
            "background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;",
            e.respone
          );
          vue.$store.commit('update', { key: 'progress.step', add: 1 });
          stepCallback(null);
        });
    },
    function(err, result) {
      if (!err) {
        vue.$nextTick(function() {
          vue.$store.commit('resetProgress');
          isbnsFetched(null, hotpotato);
        });
      } else console.log(err);
    }
  );
}
