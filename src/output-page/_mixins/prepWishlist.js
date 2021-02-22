import slugify from "./slugify";
export default {
  mixins: [slugify],
  methods: {
    prepWishlist: function(book) {
      if (this.$route.name === "wishlist") {
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: this.$store.state.library.wishlist });
        this.collectionSource = 'pageCollection';
        
        console.log( _.filter( this.$store.state.library.wishlist, 'series' ) );
        
      }
    }
  }
};
