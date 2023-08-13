<template>
  <div v-if="collections">
    <div
    class="label hidden-section-label"
    @click="labelClick"
    >
      <span class="heading">This book in collections</span>
      <span class="count">{{ collections.length }}</span>
      <gallery-vertical-chevron :up="$store.state.sticky.collectionsDrawerToggle" />
    </div>
    <div class="hidden-section" v-if="$store.state.sticky.collectionsDrawerToggle">
      <router-link class="collection-link" v-for="collection in collections" :key="collection.id" :to="{ 
        name: 'collection', 
        params: { collection: collection.id },
        query: { book: book.asin }
      }">
        <span class="text">{{ collection.title }}</span>
        <span class="total-books">{{ collection.books.length }}</span>
      </router-link>
        
    </div>
  </div>
</template>

<script>
export default {
  name: "collectionsDrawer",
  props: ["book"],
  data: function() {
    return {
      collections: null,
      store: this.$store.state,
    };
  },
  
  created: function() {
   
   this.compileCollections();
    
  },
  
  mounted: function() {
    
    if ( this.$store.state.sticky.collectionsDrawerToggle ) {
      this.$nextTick(() => {
        this.$compEmitter.emit("resizeSummary");
      });
    }
    
  },
  
  methods: {
    
    compileCollections: function() {
      
      const collectionIds = this.book.collectionIds;
      const collections = this.store.library.collections;
      if ( !collectionIds || !collections ) return;
      
      this.collections = _.filter(collections, function( collection ) {
        return _.includes(collectionIds, collection.id);
      });
      
    },
    
    labelClick: function() {
      this.$store.commit('stickyProp', { key: 'collectionsDrawerToggle', value: !this.$store.state.sticky.collectionsDrawerToggle });
      this.$nextTick(() => {
        this.$compEmitter.emit("resizeSummary");
      });
    },
    
  }
  
};
</script>

<style lang="scss" scoped>


.hidden-section {
  .collection-link {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    white-space: nowrap;
    @include themify($themes) {
      border-bottom: 1px dotted rgba(themed(frontColor), 0.2);
    }
    
    .text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .total-books {
      font-size: 0.8em;
      @include themify($themes) {
        color: rgba(themed(frontColor), 4);
      }
    }
    
    .clickety-click {
        cursor: pointer;
        display: flex;
        flex-direction: row;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      .numbers {
        padding-right: 4px;
      }
      .title {
        display: inline !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      &.cursor-alias {
        cursor: alias;
      }
      &.link-disabled {
        cursor: default;
      }
    }

    .icon {
      outline: none;
      padding-right: 8px;
    }
    
    a {
      @include themify($themes) {
        color: themed(frontColor) !important;
      }
      &:visited {
        @include themify($themes) {
          color: rgba( themed(frontColor), .6) !important;
        }
      }
    }
    
    &.router-link-active {
      font-weight: 600;
    }
     
    &.router-link-active .total-books {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      // @include themify($themes) {
      //   color: themed(audibleOrange);
      // }
    }
    // &.router-link-active { 
    //   position: relative; 
    //   .text {
    //     padding-left: 15px;
    //   }
    // }
    // &.router-link-active:before {
    //   position: absolute;
    //   margin-top: -3px;
    //   top: 50%;
    //   left: 0;
    //   content: '';
    //   width: 6px;
    //   height: 6px;
    //   border-radius: 99999px;
    //   @include themify($themes) {
    //     background: themed(frontColor);
    //   }
    // }
    
  }
  
}

div.hidden-section-label {
  cursor: pointer;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  padding: 0 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  @include themify($themes) {
    background: rgba(themed(frontColor), 0.01);
    border-top: 1px solid rgba(themed(frontColor), 0.15);
    border-bottom: 1px solid rgba(themed(frontColor), 0.15);
  }
  > * {
    padding: 5px 0;
  }
  .heading {
    flex: 1;
  }
  .count {
    padding-left: 7px;
    padding-right: 7px;
    @include themify($themes) {
      border-left: 1px solid rgba(themed(frontColor), 0.15);
      border-right: 1px solid rgba(themed(frontColor), 0.15);
    }
  }
  [data-icon] {
    padding-left: 10px;
  }
  // padding-bottom: 4px;
  // @include themify($themes) {
  //   border-bottom: 2px solid rgba( themed(frontColor), .3 );
  // }
}
div.hidden-section {
  padding: 20px;
  padding-bottom: 0;
}

.series-heading {
  display: block;
  font-weight: 700;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .series-name {
    flex: 1;
  }
}


@media ( max-width: 630px ) {
  .hidden-section .collection-link {
    padding: 5px 0;
  }
}


</style>
