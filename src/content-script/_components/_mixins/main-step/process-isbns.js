import rateLimit from "axios-rate-limit";
// import Fuse from 'fuse.js';

export default {
  methods: {
    getISBNsFromGoogleBooks: function(hotpotato, isbnsFetched) {
      if ( !_.find(hotpotato.config.steps, { name: "isbn" }).value ) {
        
        this.$root.$emit("reset-progress");
        isbnsFetched(null, hotpotato);
        
      } 
      else {
        this.$root.$emit("update-big-step", {
          title: "International Standard Book Number (ISBN)",
          stepAdd: 1
        });

        this.$root.$emit("update-progress", {
          text2:
            "(The matching process is relatively loose: beware of false matches)",
          text: "Fetching ISBNs from Google Books API...",
          step: 0,
          max: 0,
          bar: true
        });

        const vue = this;

        const getISBNS = _.find(hotpotato.config.steps, { name: "isbn" }).value;
        const useStorageISBNs = getISBNS && true;
        if ( useStorageISBNs ) {
          browser.storage.local.get(null).then(storageData => {
            const bookChunksLength = storageData["books-chunk-length"];
            const bookChunkNumbers = _.range(0, bookChunksLength);
            let isbnBooks = [];
            _.each(bookChunkNumbers, function(n) {
              isbnBooks = isbnBooks.concat(storageData["books-chunk-" + n]);
            });
            isbnBooks = _.filter(isbnBooks, "isbns");
            _.each(isbnBooks, function(isbnBook) {
              let book = _.find(hotpotato.books, { asin: isbnBook.asin });
              if ( book ) book.isbns = isbnBook.isbns;
            });
            fetchISBNs(vue, hotpotato, useStorageISBNs, isbnsFetched);
          });
        } else {
          fetchISBNs(vue, hotpotato, null, isbnsFetched);
        }
      }
    }
  }
};

function fetchISBNs(vue, hotpotato, useStorageISBNs, isbnsFetched) {
  const requestUrls = [];

  // hotpotato.books.length = 100;
  const booksOfInterest = hotpotato.config.partialScan || useStorageISBNs ? 
    _.filter(hotpotato.books, function(o) { 
      return !o.isbns; 
    }) : hotpotato.books;

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

  vue.$root.$emit("update-progress", { max: requestUrls.length });
  const letMeAxiosAQuestion = axios.create();
  axiosRetry(letMeAxiosAQuestion, {
    retries: 7,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: function(error) {
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        error.response.status == "429"
      );
    }
  });
  const isbn = rateLimit(letMeAxiosAQuestion, {
    maxRequests: 10,
    perMilliseconds: 1100
  });

  asyncMap(
    requestUrls,
    function(request, stepCallback) {
      isbn
        .get(request.url)
        .then(function(response) {
          const book = _.find(hotpotato.books, { asin: request.asin });
          if (
            response &&
            response.status >= 200 &&
            response.status < 300 &&
            response.data &&
            response.data.totalItems
          ) {
            // const fuse = new Fuse(response.data.items, {
            //   keys: [ 'volumeInfo.title' ]
            // });
            // const fuseresult = fuse.search( book.titleShort );

            const api_book = _.find(response.data.items, function(item) {
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
                  vue.$root.$emit(
                    "update-progress-thumbnail", DOMPurify.sanitize( api_book.volumeInfo.imageLinks.smallThumbnail.replace("http://","https://") )
                  );
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

          vue.$root.$emit("update-progress-step");
          stepCallback(null);
        })
        .catch(e => {
          console.log(
            "%c" + "Couldn't find ISBN(S): " + request.title + "",
            "background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;",
            e.respone
          );
          vue.$root.$emit("update-progress-step");
          stepCallback(null);
        });
    },
    function(err, result) {
      if (!err) {
        vue.$nextTick(function() {
          setTimeout(function() {
            vue.$root.$emit("reset-progress");
            isbnsFetched(null, hotpotato);
          }, 1000);
        });
      } else console.log(err);
    }
  );
}
