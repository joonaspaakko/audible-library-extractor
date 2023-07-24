import slugify from "@output-mixins/gallery-slugify.js";

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
        const narrators = _.get(books, '0.narrators');
        const narrator = _.find(narrators, ( narrator ) => { return this.slugify(narrator.name) === narratorSlug;  });
        this.$store.commit('prop', { key: 'pageTitle', value:  _.get(narrator, 'name') });
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: books });
        this.collectionSource = 'pageCollection';
        
      }
    }
  }
};
