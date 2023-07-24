<template>
  <div id="library-wishlist-switcher" :class="{ 'above-search': aboveSearch }" v-if="($route.meta.subPage && !$route.meta.gallery) && ($store.state.library.books || $store.state.library.extras.pages.books) && ($store.state.library.wishlist || $store.state.library.extras.pages.wishlist)">
    <button @click="switcher('library')" :class="{ active: isActive('library') }">
      Library
    </button>
    <button @click="switcher('wishlist')" :class="{ active: isActive('wishlist') }">
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
    
    isActive: function( button ) {
      const source = this.$route.query.subPageSource || this.$store.state.sticky.subPageSource;
      if ( button === 'wishlist' && source === 'wishlist' ) {
        return true;
      }
      else if ( button === 'library' && (source === 'library' || source === 'books') ) {
        return true;
      }
    },
    
    switcher: function( key ) {
      
      this.$updateQueries({
        sort: null,
        sortDir: null,
        filterExtras: null,
        subPageSource: key,
      });
      
      this.$store.commit('stickyProp', { key: 'subPageSource', value: key });
      
    },
  },
};
</script>


<style lang="scss" scoped>

#library-wishlist-switcher {
  text-align: center;
  // float: right;
  button {
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 2px 7px rgba(#000, .3);
    outline: none;
    padding: 5px 11px;
    border-radius: 3px;
    border: 2px solid transparent;
    margin: 0 3px;
    @include themify($themes) {
      background: themed(elementColor);
    }
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
  // background: #fff;
  border-color: #666;
  color: #333;
}

.theme-dark #library-wishlist-switcher button {
  // background: #1d1d1d;
  border-color: #4d4d4d;
  color: #aeadad;
}
</style>