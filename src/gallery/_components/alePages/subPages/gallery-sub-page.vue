<template>
  <div :id="'ale-' + config.pageId" class="box-layout-wrapper" v-if="listReady" :style="optionsOpenMargin" ref="wrapper">

    <gallery-search collectionSource="pageCollection"></gallery-search>

    <div :style="galleryStyle" class="page-content">
      <gallery-lazy
        v-for="item in $store.getters.collection"
        class="single-box"
        :data-id="item.asin || item.name"
        :key="config.pageId + ':' + ( item.asin || item.name )"
      >
        <router-link :to="itemRoute( item )">

          <h2>{{ item.name }}</h2>

          <div
            class="books-total"
            :class="{ 'books-total--borderless': config.booksTotalBorderless }"
            v-if="item.books && item.books.length"
            :content="config.booksTotalTippy"
            v-tippy="{ placement: 'right' }"
            v-html="config.booksTotalContent( item )"
          ></div>

        </router-link>
      </gallery-lazy>
    </div>

  </div>
</template>

<script>
import findSubPageSource from "@output-mixins/gallery-findSubPageSource.js";
import slugify from "@output-mixins/gallery-slugify.js";
import { defaultConfig } from "@output-pages/subPages/gallery-sub-page-configs.js";


export default {
  name: "GallerySubPage",
  mixins: [ findSubPageSource, slugify ],

  props: {
    routeConfig: {
      type: Object,
      required: true,
    },
  },

  data: function () {
    return {
      listReady: false,
    };
  },

  computed: {

    // Functions in each config's resolve{} are called with context to produce their final values.
    // Everything else merges as-is — plain values or callable functions for later use.
    config: function () {
    
      const merged  = { ...defaultConfig, ...this.routeConfig };
      const resolve = { ...defaultConfig.resolve, ...( this.routeConfig.resolve || {} ) };
      const context = { bp: merged.bookProp, singular: merged.label, scope: merged.scope || [] };
      
      _.each( resolve, ( resolver, key ) => {
        merged[ key ] = resolver( context );
      } );
      
      delete merged.resolve;
      return merged;
      
    },

    optionsOpenMargin: function () {
      if ( this.$store.state.searchOptOpenHeight ) return { marginBottom: 0 };
      return false;
    },

    galleryStyle: function () {
      if ( this.$store.state.searchOptOpenHeight ) {
        return {
          overflow: 'hidden',
          height: this.$store.state.searchOptOpenHeight - ( this.$refs.wrapper.offsetTop * 2 ) + 'px',
        };
      }
      return false;
    },

  },

  methods: {

    // Merges two arrays by id/key: base items are overridden by matching overrides,
    // and override-only items are appended. The id property is stripped from all output objects
    // since it's only used for matching, not rendering.
    mergeByKey: function ( base, overrides ) {

      const getId = ( o ) => o.id || o.key;
      const stripId = ( { id, ...rest } ) => rest;

      // No overrides: return base items as fresh objects with id stripped
      if ( !overrides || !overrides.length ) return base.map( stripId );

      // Merge base items with their matching overrides
      const result = base.map( ( baseItem ) => {
        const override = overrides.find( ( o ) => getId( o ) === getId( baseItem ) );
        if ( !override ) return stripId( baseItem );
        return { ...stripId( baseItem ), ...stripId( override ) };
      } );

      // Append override items that have no matching base entry
      overrides.forEach( ( override ) => {
        if ( !base.find( ( b ) => getId( b ) === getId( override ) ) ) {
          result.push( stripId( override ) );
        }
      } );

      // If any item carries an explicit `order`, sort the list.
      // Items without `order` use their natural merge position (index × 10) as implicit order,
      // so unsorted items stay put relative to each other.
      if ( result.some( o => o.order !== undefined ) ) {
        result.forEach( ( o, i ) => { if ( o.order === undefined ) o._order = i * 10; } );
        result.sort( ( a, b ) => ( a.order ?? a._order ) - ( b.order ?? b._order ) );
        result.forEach( o => delete o._order );
      }

      return result;

    },

    itemRoute: function ( item ) {
      return this.config.rowRoute( item, this.subPageSource.name );
    },

    makeCollection: function () {
      const result = this.config.makeCollection( this.subPageSource.collection, this );
      this.$store.commit( "prop", { key: "pageCollection", value: result } );
      this.updateListRenderingOptions();
      this.listReady = true;
    },

    updateListRenderingOptions: function () {

      // All three arrays are built with fresh objects each call so that
      // $setListRenderingOpts can mutate them (setting .active, .current, .range
      // from URL params) without corrupting the config originals.

      const scope = this.mergeByKey( defaultConfig.scope, this.routeConfig.scope || [] );

      // Prepend the namesake scope: the page's own entity, searched against each entity's
      // 'name' but keyed per page ('series', 'authors') so the chip and @series alias read
      // naturally and sit at the top, like 'title' does in the library. 'alias'/'label'/'icon'
      // give it '@'-autocomplete support; label matches the key so the chip stays lowercase.
      scope.unshift({
        active: true,
        key   : this.config.bookProp,
        field : 'name',
        alias : this.config.bookProp,
        label : this.config.bookProp,
        icon  : this.config.icon,
        weight: 5,
      });

      const sort = this.mergeByKey( defaultConfig.sort, this.routeConfig.sort || [] );

      const filter = _.cloneDeep( this.mergeByKey( defaultConfig.filters, this.routeConfig.filters || [] ) );

      const list = { scope, filter, sort };

      if ( this.subPageSource.wishlist ) {
        list.filter = _.filter( list.filter, ( o ) => !o.excludeFromWishlist );
        list.sort   = _.filter( list.sort,   ( o ) => !o.excludeFromWishlist );
      }

      if ( this.routeConfig.bookProp === 'series' ) {
        list.filter = _.filter( list.filter, ( o ) => !o.excludeFromSeries );
      }

      this.$setListRenderingOpts( list );
    },

  },
};
</script>

<style lang="scss" scoped>

@use "@gallery/box-layout.scss" as *;

.single-box {
  min-height: 35px !important;
  display: flex !important;
  align-content: center !important;
  align-items: center !important;
  padding: 0px !important;
  margin-top: 5px !important;

  > a {
    padding: 7px 14px !important;
    display: inline-block !important;
    width: 100%;
    box-sizing: border-box;
  }

  h2 {
    display: inline-block;
    width: 100%;
    margin-bottom: 0 !important;
    font-size: 1.20em !important;
    line-height: 1.30em !important;
  }

  .books-total {
    width: 23px !important;
    height: 23px !important;
    line-height: 23px !important;
    font-size: .9em !important;
    top: unset !important;
    border-width: 2px !important;
    top: 4px !important;
    right: 4px !important;

    &.books-total--borderless {
      border: none !important;
      background: transparent !important;
      padding: 0 6px !important;
      width: auto !important;
      height: 23px !important;
      line-height: 23px !important;
      top: 6px !important;
    }
  }
}

</style>
