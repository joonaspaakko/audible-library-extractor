import slugify from "./gallery-slugify.js";
export default {
  mixins: [slugify],
  methods: {
    prepWishlist: function(book) {
      if ( this.$route.name === "wishlist" ) {
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: this.$store.state.library.wishlist });
        this.collectionSource = 'pageCollection';
        
      }
    }
  }
};
