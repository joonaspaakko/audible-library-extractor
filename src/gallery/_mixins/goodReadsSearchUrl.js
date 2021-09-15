export default {
  methods: {
    makeGoodReadsUrl: function( book ) {
      
      // let isbn10 = _.find( this.book.isbns, { type: "ISBN_10" });
      // if ( isbn10 ) isbn10 = isbn10.identifier
      // let isbn13 = _.find( this.book.isbns, { type: "ISBN_13" });
      // if ( isbn13 ) isbn13 = isbn13.identifier
      book = book || this.book;
      const author = book.authors ? (book.authors[0].name + " - ") : '';
      const title = author + ( book.titleShort || book.title );
      if ( author && title || title ) {
        return "https://www.goodreads.com/search?q=" + encodeURIComponent(author && title);
      }
      
      // return "https://www.goodreads.com/search?q=" + (isbn10 || isbn13 || encodeURIComponent(authorBook) );
      
    }
  }
};
