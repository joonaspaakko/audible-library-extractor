<template>
  <div id="library-wishlist-switcher" :class="{ 'above-search': aboveSearch }" v-if="($route.meta.subPage && !$route.meta.gallery) && ($store.state.library.books || $store.state.library.extras.pages.books) && ($store.state.library.wishlist || $store.state.library.extras.pages.wishlist)">
    <button @click="switcher('books')" :class="{ active: ($route.query.subPageSource || $store.state.sticky.subPageSource ) === 'books' }">
      Library
    </button>
    <button @click="switcher('wishlist')" :class="{ active: ($route.query.subPageSource || $store.state.sticky.subPageSource ) === 'wishlist' }">
      Wishlist
    </button>
  </div>
</template>

<script>

export default {
  name: "libraryWishlistSwitcher",
  props: ['aboveSearch'],
  created: function() {
    
    // if ( this.$route.query.subPageSource !== this.$store.state.sticky.subPageSource ) {
    //   if ( this.$store.state.library[ this.$route.query.subPageSource ] ) {
    //     this.$store.commit('stickyProp', { key: 'subPageSource', value: this.$route.query.subPageSource });
    //   }
    // }
    
  },
  methods: {
    switcher: function( key ) {
      
      this.$updateQuery({ query: 'subPageSource', value: key });
      this.$store.commit('stickyProp', { key: 'subPageSource', value: key });
      
    },
  },
};
</script>


<style lang="scss" scoped>
@import "~@/_variables.scss";

#library-wishlist-switcher {
  text-align: center;
  // float: right;
  button {
    box-shadow: 0 2px 7px rgba(#000, .3);
    outline: none;
    padding: 3px 9px;
    border-radius: 3px;
    border: 1px solid transparent;
    margin: 0 3px;
    &.active {
      @include themify($themes) {
        border-color: themed(audibleOrange) !important;
      }
    }
  }
  &.above-search {
    margin-bottom: 25px;
  }
}

.theme-light #library-wishlist-switcher button {
  background: #fff;
  border-color: #666;
  color: #333;
}

.theme-dark #library-wishlist-switcher button {
  background: #1d1d1d;
  border-color: #3e3e3e;
  color: #9b9a9a;
}
</style>