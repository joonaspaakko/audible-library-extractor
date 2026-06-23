<template>
  <div id="ale-collections" class="box-layout-wrapper" v-if="collections">
    
    <gallery-page-title></gallery-page-title>
    
    <div class="hide-premade-btn-wrapper">
      <div @click="$store.commit('prop', { key: 'sticky.collectionsHidePremade', value: !$store.state.sticky.collectionsHidePremade })">
        {{ $store.state.sticky.collectionsHidePremade ? 'show' : 'hide' }} premade collections
      </div>
    </div>
    
    <!--
      Virtualized so a library full of per-series collections stays fast. The two
      chunks (special "audible" boys + user collections) are flattened into one
      list; each item carries its chunk key, and the last special item draws the
      divider that used to hang off the .audible-collection wrapper.
    -->
    <div class="page-content" ref="pageContent">

      <div v-if="paddingTop" class="virtual-spacer" :style="{ height: paddingTop + 'px' }" aria-hidden="true"></div>

      <template v-for="vItem in virtualRows" :key="flatCollections[ vItem.index ].collection.id">
        <div
          class="single-box"
          :class="{ 'is-special': flatCollections[ vItem.index ].collection.isSpecial, 'last-special': flatCollections[ vItem.index ].lastSpecial, 'first-box': vItem.index === 0 }"
          :data-index="vItem.index"
          :data-collection-id="flatCollections[ vItem.index ].collection.id"
          :ref="measureElement"
        >
          <div class="sample-covers-square">
            <div
            class="sample-cover"
            v-for="book in flatCollections[ vItem.index ].collection.sampleBooks"
            :key="book.asin"
            >
              <router-link :to="{
              name: 'collection',
              params: { collection: flatCollections[ vItem.index ].collection.id },
              query: { book: book.asin }
              }">
                <img crossorigin="anonymous" :src="makeCoverUrl(book.cover)" alt="" />
              </router-link>
            </div>
          </div>

          <router-link class="collection-title" :to="{ name: 'collection', params: { collection: flatCollections[ vItem.index ].collection.id } }">
            <h2>
                {{ flatCollections[ vItem.index ].collection.title }}
            </h2>
          </router-link>

          <router-link v-if="flatCollections[ vItem.index ].collection.books && flatCollections[ vItem.index ].collection.books.length" class="books-total" :to="{ name: 'collection', params: { collection: flatCollections[ vItem.index ].collection.id } }" >
            <div v-html="flatCollections[ vItem.index ].collection.books.length" v-tippy="{ placement: 'right' }" content="Total number of books in this collection."></div>
          </router-link>

        </div> <!-- .single-box -->
      </template>

      <div v-if="paddingBottom" class="virtual-spacer" :style="{ height: paddingBottom + 'px' }" aria-hidden="true"></div>

    </div>

    <gallery-segment-rail target="window" :fixed="true" :total="flatCollections.length" :virtualItems="virtualRows" />

  </div>
</template>

<script>
import { useWindowVirtualizer } from "@tanstack/vue-virtual";
import { computed, shallowRef, ref } from "vue";
import slugify from "@output-mixins/gallery-slugify.js";
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";

// FALLBACK BOX HEIGHT
// only an initial estimate; real heights are measured per box (the cover square
// fixes most of it, but titles can wrap), so the virtualizer corrects this.
const BOX_HEIGHT = 102;

export default {
  name: "aleCollections",
  mixins: [slugify, makeCoverUrl],

  setup: function() {

    const pageContent = shallowRef( null );

    // Filled by the component instance (this.flatCollections) below; the
    // virtualizer reads it through a getter so its count stays reactive.
    const flatCount = ref( 0 );

    // Distance from the document top to the box list (the window virtualizer
    // measures offsets in document space, so it needs this). Set on mount/resize.
    const scrollMargin = ref( 0 );

    const virtualizerOptions = computed(function() {
      return {
        count: flatCount.value,
        estimateSize: function() { return BOX_HEIGHT; },
        overscan: 6,
        scrollMargin: scrollMargin.value,
        // Boxes are spaced with margin-top, which getBoundingClientRect (and the
        // default measureElement) does not include. Fold the vertical margins into
        // each item's measured size so the gaps (and the divider's extra margin on
        // the last special box) are counted and the layout doesn't drift.
        measureElement: function( el ) {
          const style = window.getComputedStyle( el );
          const margins = parseFloat( style.marginTop ) + parseFloat( style.marginBottom );
          return el.getBoundingClientRect().height + margins;
        },
      };
    });

    const virtualizer = useWindowVirtualizer( virtualizerOptions );

    const measureElement = function( el ) {
      if ( el ) virtualizer.value.measureElement( el );
    };

    const virtualRows = computed(function() { return virtualizer.value.getVirtualItems(); });
    const paddingTop = computed(function() {
      const r = virtualRows.value;
      return r.length ? Math.max( 0, r[ 0 ].start - scrollMargin.value ) : 0;
    });
    const paddingBottom = computed(function() {
      const r = virtualRows.value;
      if ( !r.length ) return 0;
      return Math.max( 0, virtualizer.value.getTotalSize() - r[ r.length - 1 ].end );
    });

    return { pageContent, flatCount, scrollMargin, virtualizer, measureElement, virtualRows, paddingTop, paddingBottom };

  },

  data: function() {
    return {
      collections: null,
      pageTitle: null,
      pageSubTitle: null,
    };
  },

  watch: {
    // Toggling "hide premade" changes which chunks are shown: re-measure.
    flatCollections: function() {
      this.flatCount = this.flatCollections.length;
      this.$nextTick( this.measureCollections );
    },
  },

  mounted: function() {
    this.flatCount = this.flatCollections.length;
    this.$compEmitter.on('afterWindowResize', this.measureCollections);
    this.$nextTick( this.measureCollections );
  },
  beforeUnmount: function() {
    this.$compEmitter.off('afterWindowResize', this.measureCollections);
    this.$store.commit('prop', { key: 'scrollVisibleIndex', value: -1 });
  },

  computed: {

    filteredCollections() {
      const vue = this;
      const array = _.filter( this.collections, function( chunk ) {
        if ( chunk.key === 'audible' ) {
          return !vue.$store.state.sticky.collectionsHidePremade
        }
        else {
          return true;
        }
      });
      return array;
    },

    // Flatten the visible chunks into a single list for the virtualizer. Each entry
    // keeps its collection plus a `lastSpecial` flag so the last special box can
    // draw the divider the .audible-collection wrapper used to provide.
    flatCollections() {
      const out = [];
      _.each( this.filteredCollections, function( chunk ) {
        _.each( chunk.items, function( collection ) {
          out.push( { collection: collection, chunkKey: chunk.key } );
        });
      });
      const lastSpecialIndex = _.findLastIndex( out, function( o ) { return o.chunkKey === 'audible'; });
      if ( lastSpecialIndex > -1 ) out[ lastSpecialIndex ].lastSpecial = true;
      return out;
    },

  },

  created: function() {
    
    this.pageTitle = 'Collections';
    this.pageSubTitle = null;
    
    const vue = this;
    let collections = [];
    _.each( this.$store.state.audibledata.collections, function( collection ) {
      
      let newCollection = {
        id: collection.id,
        title: collection.title,
        isSpecial: vue.isSpecial(collection),
      };
      
      newCollection.books = _.filter( vue.$store.state.audibledata.library, function( book ) {
        return _.includes( collection.books, book.asin );
      });

      // Pick the sample covers once here, not in the template: the list is
      // virtualized, so a box re-renders every time it scrolls back into view and
      // a template-side _.sampleSize would reshuffle the covers on each scroll.
      newCollection.sampleBooks = vue.getRandomBooks( newCollection.books, 4 );

      collections.push( newCollection );
      
    });
    
    // "Special" Audible created collections bubble to the top.
    // After that it's alphabetical sorting based on the title.
    // TODO: Should've maybe split collections to 2 arrays so it'd be easier to handle the special boys.
    collections = _.orderBy(collections, [
      function( o ) { return vue.isSpecial(o) },
      'title',
    ], 
    [
      "desc",
      "asc",
    ]);
    
    this.collections = this.chunkify(collections);
    
    this.$store.commit("prop", [
      { key: "pageCollection", value: [] }, 
      { key: "mutatingCollection", value: [] }
    ]);
    
  },

  methods: {

    // LIST METRICS
    // The window virtualizer reports offsets in document space, so it needs the
    // box list's distance from the document top (scrollMargin). Re-measure on
    // mount, resize, and when the visible chunks change.
    measureCollections: function() {

      const list = this.pageContent;
      if ( !list ) return;

      this.scrollMargin = list.getBoundingClientRect().top + window.scrollY;
      this.virtualizer.measure();

    },

    getRandomBooks: function(books, number) {
      return _.sampleSize(books, number);
    },
    
    isSpecial( obj ) {
      return _.get(obj,'id','').indexOf('__') === 0;
    },
    
    chunkify( collections ) {
      
      const specialBoysLength = _.filter( collections, { isSpecial: true }).length;
      const specialBoysChunk = collections.splice(0, specialBoysLength);
      
      return [
        {
          key: 'audible',
          items: specialBoysChunk,
        },
        {
          key: 'user',
          items: collections,
        },
      ];
      
    },
    
  }
};
</script>

<style lang="scss" scoped>

@use "@gallery/box-layout.scss" as *;

// Virtual scroller spacers (top/bottom of the rendered window). Height only.
.virtual-spacer {
  width: 100%;
  background: none;
  border: none;
  box-shadow: none;
  margin: 0;
  padding: 0;
}

.single-box {
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  padding: 0px !important;
  margin-top: 20px !important;
  // The list is virtualized, so the first rendered node isn't always item 0;
  // the real top item carries .first-box (bound on index 0) instead of :first-child.
  &.first-box { margin-top: 0 !important; }
  min-height: 82px;
}

.sample-covers-square {
  @include themify($themes) { 
    border: 1px solid rgba( themed(frontColor), .1); 
    background: rgba( themed(backColor), .5);
  }
  border-radius: 11px;
  overflow: hidden;
  width: 80px;
  height: 80px;
  min-width: 80px;
  min-height: 80px;
  display: inline-block;
  position: relative;
  .sample-cover {
    float: left;
    width: 50%;
    height: 50%;
    padding: 3px;
    box-sizing: border-box;
    img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 6px;
      overflow: hidden;
      &:hover {
        position: absolute;
        top   : 0px;
        right : 0px;
        bottom: 0px;
        left  : 0px;
        padding: 2px;
        box-sizing: border-box;
        border-radius: 11px;
        overflow: hidden;
      }
    }
  }
}


.collection-title {
  display: inline-block;
  align-self: stretch;
  flex: 1;
  display: flex;
  justify-content: flex-start;
  justify-items: flex-start;
  align-content: center;
  align-items: center;
  padding: 10px 30px;
  h2 { 
    margin: 0 !important; 
    font-size: 22px !important;
    line-height: 23px !important;
  }
  
}

.books-total { top: unset !important; }

.single-box { position: relative; z-index: 0; };
.is-special { display: flex; }

// Divider after the special "audible" boys. Under the flat virtual list there's no
// chunk wrapper, so the last special box carries the extra bottom margin and the
// separator bar that .audible-collection used to provide.
.single-box.last-special {
  margin-bottom: 62px;
  &:after {
    content: '';
    position: absolute;
    z-index: 0;
    right: 0;
    bottom: -33px;
    left: 0;
    height: 2px;
    @include themify($themes) {
      background: rgba(themed(frontColor), .25);
    }
  }
}

.hide-premade-btn-wrapper {
  @include themify($themes) {
    // position: relative;
    // z-index: 0;
    // height: 10px;
    text-align: right;
    > div {
      // position: absolute;
      // top: -30px;
      // right: 0px;
      display: inline-block;
      @extend .no-selection;
      cursor: pointer;
      background: themed(backColor);
      color: themed(frontColor);
      padding: 4px 12px;
      margin-bottom: 15px;
      border-radius: 5px;
      border: 1px solid rgba( themed(frontColor), .3);
      font-weight: bold;
    }
  }
}



.theme-dark .hide-premade-btn-wrapper > div {
  background: color.adjust(rgba( #121517, .98 ), $lightness: 5%);
  box-shadow: $shadowMedium rgba(0,0,0,0.45);
  color: $darkFrontColor;
  border: 1px solid rgba( color.adjust($darkBackColor, $lightness: 62%), .25 );
}
.theme-light .hide-premade-btn-wrapper > div {
  background: rgba( color.adjust($lightBackColor, $lightness: 5%), .98 );
  box-shadow: $shadowSmall  rgba(0,0,0,0.2), $shadowMedium  rgba(0,0,0,0.2);
  color: $lightFrontColor;
  border: 1px solid rgba( $lightFrontColor, .25 );
}

</style>
