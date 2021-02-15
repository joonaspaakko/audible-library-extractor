import slugify from "./slugify";
export default {
  mixins: [slugify],
  methods: {
    prepCollectionsSubPage: function(book) {
      
      if (this.$route.name === "collection") {
        
        const vue = this;
        let collectionID = this.$route.params.collection;
        let collection = _.find( this.$store.state.library.collections, { id: collectionID });
        if ( collection ) {
          
          let collectionBooks = _.filter( this.$store.state.library.books, function( book ) {
            return _.includes( collection.books, book.asin );
          });
          
          // Set page title
          if ( collection.title || collection.description ) {
            if ( collection.title        ) this.pageTitle = collection.title;
            if ( collection.description  ) this.pageSubTitle = collection.description;
          }
          
          // Init arrays
          this.$store.commit("prop", { key: 'pageCollection', value: collectionBooks });
          this.collectionSource = 'pageCollection';
          
        }
      }
    }
  }
};
