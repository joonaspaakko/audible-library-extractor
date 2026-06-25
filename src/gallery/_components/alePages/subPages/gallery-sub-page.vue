<template>
  <div :id="'ale-' + config.pageId" class="box-layout-wrapper" v-if="listReady" :style="optionsOpenMargin" ref="wrapper">

    <gallery-search collectionSource="pageCollection"></gallery-search>

    <div :style="galleryStyle" class="page-content" ref="pageContent">

      <div v-if="paddingTop" class="virtual-spacer" :style="{ height: paddingTop + 'px' }" aria-hidden="true"></div>

      <div
        v-for="vItem in virtualRows"
        :key="config.pageId + ':' + ( collection[ vItem.index ].asin || collection[ vItem.index ].name )"
        class="single-box"
        :data-index="vItem.index"
        :data-id="collection[ vItem.index ].asin || collection[ vItem.index ].name"
        :ref="measureElement"
      >
        <router-link :to="itemRoute( collection[ vItem.index ] )">

          <h2>{{ collection[ vItem.index ].name }}</h2>

          <div
            class="books-total"
            :class="{ 'books-total--borderless': config.booksTotalBorderless }"
            v-if="collection[ vItem.index ].books && collection[ vItem.index ].books.length"
            :content="config.booksTotalTippy"
            v-tippy="{ placement: 'right' }"
            v-html="config.booksTotalContent( collection[ vItem.index ] )"
          ></div>

        </router-link>
      </div>

      <div v-if="paddingBottom" class="virtual-spacer" :style="{ height: paddingBottom + 'px' }" aria-hidden="true"></div>

    </div>

    <gallery-segment-rail target="window" :fixed="true" :total="collection.length" :virtualItems="virtualRows" />

  </div>
</template>

<script>
import { useWindowVirtualizer } from "@tanstack/vue-virtual";
import { useStore } from "vuex";
import { computed, shallowRef, ref } from "vue";
import findSubPageSource from "@output-mixins/gallery-findSubPageSource.js";
import slugify from "@output-mixins/gallery-slugify.js";
import { defaultConfig } from "@output-pages/subPages/gallery-sub-page-configs.js";

// FALLBACK BOX HEIGHT
// only an initial estimate; real heights are measured per box (names wrap to
// 1-3 lines), so the virtualizer corrects this as boxes render.
const BOX_HEIGHT = 75;

export default {
  name: "GallerySubPage",
  mixins: [ findSubPageSource, slugify ],

  props: {
    routeConfig: {
      type: Object,
      required: true,
    },
  },

  setup: function() {

    const store = useStore();
    const pageContent = shallowRef( null );

    // The full sorted/filtered list the virtualizer iterates
    const collection = computed(function() {
      return store.getters.collection;
    });

    // Distance from the document top to the box list (the window virtualizer
    // measures offsets in document space, so it needs this). Set on mount/resize.
    const scrollMargin = ref( 0 );

    const virtualizerOptions = computed(function() {
      return {
        count: collection.value.length,
        estimateSize: function() { return BOX_HEIGHT; },
        overscan: 6,
        scrollMargin: scrollMargin.value,
        // Boxes are spaced with margin-top, which getBoundingClientRect (and the
        // default measureElement) does not include. Measuring height alone would
        // leave that gap uncounted and drift the layout downward, so fold the
        // vertical margins into each item's measured size.
        measureElement: function( el ) {
          const style = window.getComputedStyle( el );
          const margins = parseFloat( style.marginTop ) + parseFloat( style.marginBottom );
          return el.getBoundingClientRect().height + margins;
        },
      };
    });

    const virtualizer = useWindowVirtualizer( virtualizerOptions );

    // Per-box measurement so wrapped names (1-3 lines) reserve their real height
    const measureElement = function( el ) {
      if ( el ) virtualizer.value.measureElement( el );
    };

    const virtualRows = computed(() => {
      const len = collection.value.length;
      return virtualizer.value.getVirtualItems().filter( ( item ) => item.index < len );
    });
    // Spacers are relative to the container, so subtract scrollMargin from the
    // document-space offsets the window virtualizer reports.
    const paddingTop = computed(function() {
      const r = virtualRows.value;
      return r.length ? Math.max( 0, r[ 0 ].start - scrollMargin.value ) : 0;
    });
    const paddingBottom = computed(function() {
      const r = virtualRows.value;
      if ( !r.length ) return 0;
      return Math.max( 0, virtualizer.value.getTotalSize() - r[ r.length - 1 ].end );
    });

    return { store, pageContent, collection, scrollMargin, virtualizer, measureElement, virtualRows, paddingTop, paddingBottom };

  },

  data: function () {
    return {
      listReady: false,
    };
  },

  watch: {
    // Sort/filter/search rebuilds the collection: heights change, so re-measure
    // the list position and reset the virtualizer's cached measurements.
    '$store.getters.collection': function() {
      this.$nextTick( this.measureSubPage );
    },
  },

  mounted: function() {
    this.$compEmitter.on('afterWindowResize', this.measureSubPage);
  },
  beforeUnmount: function() {
    this.$compEmitter.off('afterWindowResize', this.measureSubPage);
    this.$store.commit('prop', { key: 'scrollVisibleIndex', value: -1 });
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
      this.$nextTick( this.measureSubPage );
    },

    // LIST METRICS
    // The window virtualizer reports offsets in document space, so it needs the
    // box list's distance from the document top (scrollMargin). Re-measure on
    // mount, resize, and collection changes, then let it re-measure offsets.
    measureSubPage: function () {

      const list = this.pageContent;
      if ( !list ) return;

      this.scrollMargin = list.getBoundingClientRect().top + window.scrollY;
      this.virtualizer.measure();

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

// Virtual scroller spacers (top/bottom of the rendered window). Height only,
// no box-layout styling so they reserve space without showing.
.virtual-spacer {
  width: 100%;
  background: none;
  border: none;
  box-shadow: none;
  margin: 0;
  padding: 0;
}

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
