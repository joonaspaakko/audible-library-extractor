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
      return {
        collection: this.$store.state.audibledata[ source ],
        name: source,
        wishlist: source === 'wishlist',
        library: source === 'library',
        books: source === 'library',
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

    // Clear ALL collection state, not just the page/mutating ones. The search query persists
    // across pages, so 'searchCollection' can still hold the previous page's results (e.g.
    // series entities) when this sub page mounts. The 'collection' getter returns it while a
    // search is active, so without this the new page's v-for renders the old items for a tick
    // and feeds a foreign item (no 'url') to this page's rowRoute, which vue-router rejects
    // ('Missing required param'). Cleared here so nothing stale renders before search reruns.
    this.$store.commit("prop", {key: "pageCollection", value: []});
    this.$store.commit("prop", {key: "mutatingCollection", value: []});
    this.$store.commit("prop", {key: "searchCollection", value: []});

  },

  created: function () {
    
    const routeMeta = _.get(this.$route, 'meta', {});
    if ( routeMeta.subPage ) this.subPageSource = this.findSubPageSource();
    if ( !routeMeta.gallery && routeMeta.subPage ) this.makeCollection();
    
  },
  
};
