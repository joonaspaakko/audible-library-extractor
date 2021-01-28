export default {
  methods: {
    makeGoodReadsUrl: function() {
      
      let isbn10 = _.find( this.book.isbns, { type: "ISBN_10" });
      if ( isbn10 ) isbn10 = isbn10.identifier
      let isbn13 = _.find( this.book.isbns, { type: "ISBN_13" });
      if ( isbn13 ) isbn13 = isbn13.identifier
      
      const authorBook = this.book.authors ? this.book.authors[0].name + " " + ( this.book.titleShort || this.book.title ) : '';
      
      return "https://www.goodreads.com/search?q=" + encodeURIComponent(authorBook);
      // return "https://www.goodreads.com/search?q=" + (isbn10 || isbn13 || encodeURIComponent(authorBook) );
      
    }
  }
};
