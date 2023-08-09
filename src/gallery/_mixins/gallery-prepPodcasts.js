import slugify from "./gallery-slugify.js";
export default {
  mixins: [slugify],
  methods: {
    prepPodcasts: function(book) {
      if ( this.$route.name === "podcasts" ) {
        
        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: this.$store.getters.podcasts });
        this.collectionSource = 'pageCollection';
        
      }
    },
    
  }
};
