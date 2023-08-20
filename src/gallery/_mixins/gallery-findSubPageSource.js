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
      this.$store.commit('prop', { key: 'sticky.subPageSource', value: source });
      const sourceKey = source === 'library' ? 'books' : null;
      return {
        collection: this.$store.state.library[ sourceKey || source ],
        name: source,
        wishlist: source === 'wishlist',
        library: source === 'library' || source === 'books',
        books: source === 'library' || source === 'books',
      };
    },
    
  },
  
  watch: {
    
    '$route.query.subPageSource': function( source ) {
      const routeMeta = _.get(this.$route, 'meta', {});
      if ( !routeMeta.gallery && routeMeta.subPage ) {
        
        this.listReady = false;
        this.subPageSource = this.findSubPageSource();
        
        this.$nextTick(function() {
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
    
    const routeMeta = _.get(this.$route, 'meta', {});
    if ( routeMeta.subPage ) this.subPageSource = this.findSubPageSource();
    if ( !routeMeta.gallery && routeMeta.subPage ) this.makeCollection();
    
  },
  
};
