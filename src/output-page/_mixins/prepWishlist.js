import slugify from "./slugify";
export default {
  mixins: [slugify],
  methods: {
    prepWishlist: function(book) {
      if (this.$route.name === "wishlist") {
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: this.$store.state.library.wishlist });
        this.collectionSource = 'pageCollection';
        
        // FIXME: add store page scraping for wishlist? Totally forgot about that (mainly missing the summary )
          // Argument against: Wishlist already takes a good while to scrape... this would like at least tripple the scraping time for the wishlist...
          // Another argument against it: The summary alone would add a heck of a lot to the fileize. Of course that depends on the wishlist size, but still...
          // Argument for it: Looks dumb when you open the bookdetails and don't have the summary there.
        
        // TODO: should the scraper ignore books that are in your library already? I think the answer is yes...
        
      }
    }
  }
};
