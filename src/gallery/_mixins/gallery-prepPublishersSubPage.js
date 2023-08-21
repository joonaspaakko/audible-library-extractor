import slugify from "@output-mixins/gallery-slugify.js";

export default {
  mixins: [slugify],
  methods: {
    prepPublishersSubPage: function() {
      const vue = this;
      if (this.$route.name === "publisher") {
        
        const publisherSlug = this.$route.params.publisher;
        
        // Build publishers sub page array 
        let books = _.filter( this.subPageSource.collection, function( book ) {
          if ( book.publishers ) return _.find(book.publishers, function( publisher ) { return vue.slugify(publisher.name) === publisherSlug;  });
        });
        
        // Set page title
        if ( books.length > 0 ) {
          const publisher = _.find(books[0].publishers, function( publisher ) { return vue.slugify(publisher.name) === publisherSlug;  });
          if ( publisher ) {
            // this.pageTitle = publisher.name;
            if ( publisher.name ) this.$store.commit('prop', { key: 'pageTitle', value: publisher.name });
          }
        }
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: books });
        this.collectionSource = 'pageCollection';
        
      }
    }
  }
};
