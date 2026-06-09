<template>
  <div id="ale-background" v-if="hasBooks" :class="{ 'is-loaded': loaded, 'is-resizing': resizing }">
    <div
      v-for="book in books"
      :key="book.id"
      :class="[ 'cover', { 'flip-out': book.flipOut, 'flip-back': book.flipBack } ]"
      :style="{ filter: book.filter }"
    >
      <img crossorigin="anonymous" :src="makeCoverUrl(book.cover, 200)" alt="" fetchpriority="low" @load="onImageLoad" />
    </div>
  </div>
</template>

<script>
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";

export default {
  name: "aleBackground",
  mixins: [ makeCoverUrl ],

  created: function() {

    this.slotQueue = [];
    this.filterVariants = [
      '',
      'grayscale(100%)',
      'grayscale(100%) invert(100%)',
      'invert(100%)',
      'hue-rotate(90deg)',
      'hue-rotate(180deg)',
      'hue-rotate(-90deg)',
      'sepia(100%)',
      'sepia(100%) hue-rotate(180deg)',
      'brightness(0.4) contrast(1.5)',
      'saturate(0.1) brightness(1.4)',
      'hue-rotate(90deg) saturate(2)',
    ];

  },

  computed: {
    hasBooks: function() {
      return _.size( this.books );
    },
  },

  data: function() {
    return {
      books: null,
      coverSource: null,
      timers: [],
      loaded: false,
      resizing: false,
    };
  },

  mounted: function() {

    this.coverSource = this.$store.state.audibledata.library || this.$store.state.audibledata.wishlist;
    this.books = this.buildGrid();
    this.pendingLoads = this.books.length;
    window.addEventListener( 'resize', this.onResizeStart );
    document.addEventListener( 'visibilitychange', this.onVisibilityChange );

  },

  beforeUnmounted: function() {

    window.removeEventListener( 'resize', this.onResizeStart );
    document.removeEventListener( 'visibilitychange', this.onVisibilityChange );
    this.debouncedResize.cancel();
    this.timers.forEach( id => clearTimeout( id ) );

  },

  methods: {

    /**
     * Builds the cover grid based on current viewport dimensions.
     * Mirrors the CSS auto-fill column calculation to ensure exact item count with no orphaned rows.
     * @returns {Array} array of book objects ready for the template
     */
    buildGrid: function() {

      const source = _.filter( this.coverSource, 'cover' );
      if ( !source.length ) return [];

      const viewportWidth  = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const cellGap = 4;

      // COLUMNS: mirror css clamp(70px, calc(55px + 4vw), 130px) with gap: 4px
      const colMinWidth = _.clamp( 55 + 4 * viewportWidth / 100, 70, 130 );
      const colCount    = Math.floor( ( viewportWidth + cellGap ) / ( colMinWidth + cellGap ) );
      const cellHeight  = ( viewportWidth - ( colCount - 1 ) * cellGap ) / colCount;

      // ROWS: scale from 30% to 50% of viewport height as width grows to 500px
      const heightRatio = _.clamp( viewportWidth / 500 * 0.5, 0.3, 0.5 );
      const rowCount    = Math.max( 2, Math.ceil( ( viewportHeight * heightRatio ) / cellHeight ) );
      const itemCount   = colCount * rowCount;

      // FILL POOL TO EXACT TOTAL, SHUFFLING SOURCE IN PASSES TO VARY REPETITIONS
      const passes = Math.ceil( itemCount / source.length ) + 1;
      const pool = _.take(
        _.flatten( _.times( passes, () => _.shuffle( source ) ) ),
        itemCount
      );

      // ASSIGN FILTER VARIANTS TO DUPLICATE COVERS SO THEY DON'T LOOK IDENTICAL
      const hasDuplicates = source.length < itemCount;
      const variantQueues = {};

      // RETURN: strip each book down to only what the template needs
      // filter is only assigned when covers repeat — otherwise left empty
      this.slotQueue = [];

      return _.map( pool, book => ({
        id: _.uniqueId(),
        cover: book.cover,
        flipOut: false,
        flipBack: false,
        filter: hasDuplicates ? this.getFilterVariant( book.cover, variantQueues ) : '',
      }));

    },

    /**
     * Returns the next slot in a shuffled queue of all grid indices.
     * Ensures every slot gets a turn before any repeats — refills when exhausted.
     * @returns {Object} a book object from this.books
     */
    getNextSlot: function() {
      if ( !_.size( this.slotQueue ) ) this.slotQueue = _.shuffle( _.range( this.books.length ) );
      return this.books[ this.slotQueue.pop() ];
    },

    /**
     * Ensures each repeated occurrence of the same cover gets a visually distinct
     * CSS filter, so a small library doesn't reveal its duplicates at a glance.
     * @param {string} cover - cover ID used as the queue key
     * @param {Object} queues - shared queue state across the current buildGrid call
     * @returns {string} a CSS filter string
     */
    getFilterVariant: function( cover, queues ) {
    
      if ( !_.size( queues[ cover ] ) ) queues[ cover ] = _.shuffle( [ ...this.filterVariants ] );
      return queues[ cover ].pop();
      
    },

    /**
     * Starts two independent swap chains with randomised intervals.
     * Clears any existing timers first to avoid accumulation.
     */
    startFlipTimers: function() {

      this.timers.forEach( id => clearTimeout( id ) );
      this.timers = [];
      this.scheduleSwap( 2000, 5000 );
      this.scheduleSwap( 4000, 8000 );

    },

    /**
     * Schedules a single cover swap after a random delay then reschedules itself,
     * creating a self-sustaining loop with re-randomised intervals each iteration.
     * @param {number} min - delay in ms
     * @param {number} max - delay in ms
     */
    scheduleSwap: function( min, max ) {

      const id = setTimeout( () => {
        this.timers = _.without( this.timers, id );
        this.swapCover();
        this.scheduleSwap( min, max );
      }, _.random( min, max ) );
      
      this.timers.push( id );

    },

    /**
     * Picks a random available (non-animating) slot and flips it to a new cover.
     * Waits 1200ms — enough for the flip-out to fully complete — before flipping
     * back in from the opposite axis to create a full 3D rotation effect.
     */
    swapCover: function() {

      const source = _.filter( this.coverSource, 'cover' );
      if ( !source.length ) return;

      const slot = this.getNextSlot();
      if ( slot.flipOut || slot.flipBack ) return;
      slot.flipOut = true;
      setTimeout( () => {
        slot.cover = _.sample( source ).cover;
        slot.flipBack = true;
        slot.flipOut = false;
        this.$nextTick( () => requestAnimationFrame( () => {
          slot.flipBack = false;
        }));
      }, 1200 );

    },

    /**
     * Pauses swap timers when the tab is hidden, resumes when it becomes visible again.
     */
    onVisibilityChange: function() {
    
      // PAUSE
      if ( document.hidden ) {
        this.timers.forEach( id => clearTimeout( id ) );
        this.timers = [];
      }
      // RESUME
      else {
        this.startFlipTimers();
      }
      
    },

    /**
     * Hides the grid immediately on resize and rebuilds it 250ms after resizing stops.
     * Prevents CSS auto-fill reflow from showing incomplete rows mid-drag.
     */
    debouncedResize: _.debounce( function() {
      this.books = this.buildGrid();
      this.resizing = false;
    }, 250 ),

    onImageLoad: function() {

      if ( this.loaded ) return;
      this.pendingLoads--;
      if ( this.pendingLoads <= 0 ) {
        this.loaded = true;
        setTimeout( () => this.startFlipTimers(), 1500 );
      }

    },

    onResizeStart: function() {
      this.resizing = true;
      this.debouncedResize();
    },

  },
};
</script>

<style lang="scss" scoped>

#ale-background {
  position: fixed;
  inset: 0 0 auto;
  z-index: -1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(70px, calc(55px + 4vw), 130px), 1fr));
  gap: 4px;
  opacity: 0;
  will-change: transform;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  mask-image: linear-gradient(to bottom, black 0%, black 70%, transparent 100%);

  .cover {
    aspect-ratio: 1 / 1;
    overflow: hidden;
    opacity: 1;
    transition: opacity 900ms, transform 900ms;
    transform: rotateY(0deg);
    animation: none;

    &.flip-out {
      opacity: 0;
      transform: rotateY(180deg);
      transition-duration: 1000ms;
    }

    &.flip-back {
      opacity: 0;
      transform: rotateY(-180deg);
      transition: none;
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}

#ale-background.is-loaded {
  opacity: 0.18;
  transition: opacity 1500ms ease;
}

#ale-background.is-resizing {
  opacity: 0;
  transition: none;
}

</style>
