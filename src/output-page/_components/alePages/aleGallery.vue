<template>
  <div id="ale-gallery" :data-audio-player-visible="$store.state.audioPlayerVisible">
    
    <!-- <ale-breadcrumbs :library="library" :general="general"></ale-breadcrumbs> -->
    
    <div class="gallery-title-wrapper" v-if="pageTitle || pageSubTitle">
      <h2 class="gallery-title" v-if="pageTitle">
        {{ pageTitle }}
      </h2>
      <div class="divider"></div>
      <h3 class="gallery-sub-title" v-if="pageSubTitle">
        {{ pageSubTitle }}
      </h3>
    </div>
    
    <ale-search :collectionSource="collectionSource"></ale-search>
    
    <div v-if="$store.getters.collection && $store.getters.collection.length > 0">
      <ale-grid-view v-if="$store.state.sticky.viewMode === 'grid'" />
      <ale-list-view v-else-if="$store.state.sticky.viewMode === 'spreadsheet'" />
    </div>
    
  </div>
</template>

<script>
import aleSearch from "./aleGallery/aleSearch";

import prepCategoriesSubPage from "@output-mixins/prepCategoriesSubPage.js";
import prepCollectionsSubPage from "@output-mixins/prepCollectionsSubPage.js";
import prepSeriesSubPage from "@output-mixins/prepSeriesSubPage.js";
import prepWishlist from "@output-mixins/prepWishlist.js";

import timeStringToSeconds from "@output-mixins/timeStringToSeconds";
import filterAndSort from "@output-mixins/filter-and-sort.js";
import galleryListRenderingOpts from "@output-mixins/gallery-list-rendering-opts.js";
import smoothscroll from "smoothscroll-polyfill";
smoothscroll.polyfill();

// import aleBreadcrumbs from '../aleBreadcrumbs'

export default {
  name: "aleGallery",
  components: {
    aleSearch,
    aleGridView: () => import( /* webpackChunkName: "grid-view" */ "./aleGallery/aleGridView"),
    aleListView: () => import( /* webpackChunkName: "spreadsheet-view" */ "./aleGallery/aleListView"),
    // aleBreadcrumbs,
  },
  mixins: [
    filterAndSort, 
    prepCategoriesSubPage, 
    prepCollectionsSubPage, 
    prepSeriesSubPage,
    prepWishlist,
    timeStringToSeconds,
    galleryListRenderingOpts,
  ],
  
  data: function() {
    return {
      collectionSource: 'library.books',
      pageTitle: null,
      pageSubTitle: null,
    };
  },
  
  beforeCreate: function() {
    
    if ( this.$route.query.view ) {
      this.$store.commit('stickyProp', { key: 'viewMode', value: this.$route.query.view });
    }
    
  },
  
  created: function() {
    
    this.updateListRenderingOptions();
    
    // Setup for other pages that use the gallery page to show titles
    this.prepCategoriesSubPage();    
    this.prepCollectionsSubPage();    
    this.prepSeriesSubPage();
    this.prepWishlist();
    
  },
  
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";

#ale-gallery {
  padding: 0 20px;
  &:before {
    content: ".";
    visibility: hidden;
    display: block;
    height: 0;
    clear: both;
  }
  
  @media ( min-width: 630px ) {
    &[data-audio-player-visible="true"] {
      padding-top: 64px;
    }
  }
  
}

.gallery-title-wrapper {
  margin-bottom: 20px;
  text-align: center;
  > * { 
    display: inline-block; 
    position: relative;
  }
  .divider {
    display: block !important;
  }
}

.gallery-title {
  font-size: 23px;
  line-height: 24px;
  font-weight: bold;
  margin: 0px;
  @include themify($themes) {
    color: themed(frontColor);
  }
}

.gallery-sub-title {
  font-size: 14px;
  line-height: 16px;
  font-weight: normal;
  margin: 0px;
  margin-top: 10px;
  padding: 5px 10px;
  border-radius: 9999px;
}

.theme-light .gallery-sub-title {
  color: $lightBackColor;
  border: 1px solid $lightFrontColor;
  background: $lightFrontColor;
}

.theme-dark .gallery-sub-title {
  color: $darkFrontColor;
  border: 1px solid $audibleOrange;
  background: $darkBackColor;
}

</style>
