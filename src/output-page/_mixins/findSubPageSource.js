export default {
  methods: {
    findSubPageSource: function() {
      switch ( this.$route.query.subPageSource || this.$store.state.sticky.subPageSource ) {
        case 'books':
          if ( !this.$store.state.library.books ) this.$store.commit('stickyProp', { key: 'subPageSource', value: 'wishlist' });
          // else this.$store.commit('stickyProp', { key: 'subPageSource', value: 'books' });
          return this.$store.state.library.books || this.$store.state.library.wishlist;
          break;
        case 'wishlist':
          if ( !this.$store.state.library.wishlist ) this.$store.commit('stickyProp', { key: 'subPageSource', value: 'books' });
          // else this.$store.commit('stickyProp', { key: 'subPageSource', value: 'wishlist' });
          return this.$store.state.library.wishlist || this.$store.state.library.books;
          break;
      }
    },
  },
};
