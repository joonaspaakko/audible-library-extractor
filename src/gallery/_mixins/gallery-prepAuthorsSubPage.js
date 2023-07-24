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
        const authors = _.get(books, '0.authors');
        const author = _.find(authors, ( author ) => { return author.url === authorUrl;  });
        this.$store.commit('prop', { key: 'pageTitle', value:  _.get(author, 'name') });
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: books });
        this.collectionSource = 'pageCollection';
        
      }
    }
  }
};
