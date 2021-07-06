export default {
  data: function() {
    return {
      subPageSource: {
        collection: null,
        name: null,
        wishlist: false,
        library: false,
        books: false,
      }
    };
  },
  
  methods: {
    
    findSubPageSource: function() {
      const source = this.$route.query.subPageSource || this.$store.state.sticky.subPageSource;
      return {
        collection: this.$store.state.library[ source ],
        name: source,
        wishlist: source === 'wishlist',
        library: source === 'books',
        books: source === 'books',
      };
    },
    
  },
  
  watch: {
    
    '$route.query.subPageSource': function( source ) {
      
      if ( !this.$route.meta.gallery && this.$route.meta.subPage ) {
        this.listReady = false;
        this.$nextTick(function() {
          
          this.subPageSource = this.findSubPageSource();
          this.makeCollection();
          
        });
      }
      
    }
    
  },

  beforeCreate: function () {

    this.$store.commit("prop", {key: "pageCollection", value: []});
    this.$store.commit("prop", {key: "mutatingCollection", value: []});

  },

  created: function () {
    
    if ( this.$route.meta.subPage ) this.subPageSource = this.findSubPageSource();
    if ( !this.$route.meta.gallery && this.$route.meta.subPage ) this.makeCollection();
    
  },
  
};
