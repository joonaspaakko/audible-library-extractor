import slugify from "@output-mixins/slugify";

export default {
  mixins: [slugify],
  methods: {
    prepNarratorsSubPage: function() {
      const vue = this;
      if (this.$route.name === "narrator") {
        
        const narratorSlug = this.$route.params.narrator;
        
        // Build narrators sub page array 
        let books = _.filter( this.subPageSource.collection, function( book ) {
          if ( book.narrators ) return _.find(book.narrators, function( narrator ) { return vue.slugify(narrator.name) === narratorSlug;  });
        });
        
        // Set page title
        if ( books.length > 0 ) {
          const narrator = _.find(books[0].narrators, function( narrator ) { return vue.slugify(narrator.name) === narratorSlug;  });
          if ( narrator ) {
            this.pageTitle = narrator.name;
          }
        }
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: books });
        this.collectionSource = 'pageCollection';
        
      }
    }
  }
};
