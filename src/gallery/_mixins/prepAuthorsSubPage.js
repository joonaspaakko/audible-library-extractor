export default {
  methods: {
    prepAuthorsSubPage: function() {
      const vue = this;
      if (this.$route.name === "author") {
        
        const authorUrl = this.$route.params.author;
        
        // Build author sub page array 
        let books = _.filter( this.subPageSource.collection, function( book ) {
          if ( book.authors ) return _.find(book.authors, function( author ) { return author.url === authorUrl; });
        });
        
        // Set page title
        if ( books.length > 0 ) {
          const author = _.find(books[0].authors, function( author ) { return author.url === authorUrl;  });
          if ( author ) {
            this.pageTitle = author.name;
          }
        }
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: books });
        this.collectionSource = 'pageCollection';
        
      }
    }
  }
};
