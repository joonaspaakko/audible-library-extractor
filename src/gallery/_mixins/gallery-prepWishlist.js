import slugify from "./gallery-slugify.js";
export default {
  mixins: [slugify],
  methods: {
    prepWishlist: function(book) {
      if ( this.$route.name === "wishlist" ) {
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: this.$store.state.audibledata.wishlist });
        this.collectionSource = 'pageCollection';
        
      }
    }
  }
};
