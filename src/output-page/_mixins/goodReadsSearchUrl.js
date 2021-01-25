export default {
  methods: {
    makeGoodReadsUrl: function(book) {
      
      let isbn10 = _.find( this.book.isbns, { type: "ISBN_10" });
      if ( isbn10 ) isbn10 = isbn10.identifier
      let isbn13 = _.find( this.book.isbns, { type: "ISBN_13" });
      if ( isbn13 ) isbn13 = isbn13.identifier
      
      return (
        "https://www.goodreads.com/search?q=" +
        (
          isbn10 || 
          isbn13 ||
          this.book.authors ? 
            encodeURIComponent(this.book.authors[0].name + " " + this.book.titleShort ) : ''
        )
      );
    }
  }
};
