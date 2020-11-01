
export default {
	methods: {
    makeGoodReadsUrl: function( book ) {
      return 'https://www.goodreads.com/search?q=' + (
        this.book.ISBN_10 && this.book.ISBN_10 ||
        this.book.ISBN_13 && this.book.ISBN_13 ||
        this.book.authors ? encodeURIComponent( this.book.authors[0].name + ' ' + this.book.titleShort ) : null
      );
    },
	}
}
