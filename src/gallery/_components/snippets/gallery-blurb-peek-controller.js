// PRESS-AND-HOLD BLURB PEEK
// The gesture behind press-drag-across-covers. This mixin is used by the single overlay
// (gallery-blurb-peek.vue): it owns the reactive peek state, the window-level move/up
// listeners, the hold/drag detection and the mobile scroll lock. The grid view holds a
// ref to the mounted overlay and provides it as 'blurbPeek' so gallery-book.vue can
// inject it and call start() on press and consumeClick() on release.

// HOW FAR (px) the pointer must travel before we treat the press as a drag and enter
// blurb mode early, and HOW LONG (ms) a stationary press waits before doing the same.
const DRAG_THRESHOLD = 8;
const HOLD_DELAY = 250;

export default {

  // lookupBook resolves an asin under the pointer to its book; passed by the grid view
  // since it owns the active collection.
  props: {
    lookupBook: {
      type: Function,
      default: null,
    },
  },

  data: function() {
    return {

      // Reactive view state the overlay template renders from.
      peek: {
        visible: false,
        blurb: "",
        x: 0,
        y: 0,
        isTouch: false,
      },

      // Non-reactive gesture bookkeeping (changes every pointermove, not template-bound).
      gesture: {
        active: false,
        inBlurbMode: false,
        startX: 0,
        startY: 0,
        isTouch: false,
        holdTimer: null,
        lastAsin: null,
      },

      // Set when blurb mode was entered, so gallery-book.vue's @click knows to swallow
      // the open the same press would otherwise trigger. Cleared on the next press.
      suppressClick: false,

    };
  },

  created: function() {
    this.boundMove = this.onMove.bind( this );
    this.boundUp = this.onUp.bind( this );
  },

  beforeUnmount: function() {
    this.end();
  },

  methods: {

    blurbEnabled: function() {
      return this.$store.state.sticky.bookDetailSettings.blurb;
    },

    // Resolve the .ale-book under the pointer to its blurb and push it to the overlay.
    // Skips the work when the pointer is still over the same cover.
    peekAt: function( x, y ) {

      const el = document.elementFromPoint( x, y );
      const book = el ? el.closest(".ale-book[data-asin]") : null;
      if ( !book ) return;

      const asin = book.getAttribute("data-asin");
      if ( asin === this.gesture.lastAsin ) {
        this.peek.x = x;
        this.peek.y = y;
        return;
      }
      this.gesture.lastAsin = asin;

      const data = this.lookupBook ? this.lookupBook( asin ) : null;
      if ( !data || !data.blurb ) {
        this.peek.visible = false;
        return;
      }

      this.peek.blurb = data.blurb;
      this.peek.x = x;
      this.peek.y = y;
      this.peek.visible = true;

    },

    enterBlurbMode: function( x, y ) {

      if ( this.gesture.inBlurbMode ) return;
      this.gesture.inBlurbMode = true;
      this.suppressClick = true;
      this.peek.isTouch = this.gesture.isTouch;

      // Touch is both the pointer and the scroll mechanism, so on mobile the page has to
      // be locked (not merely stopped) for the whole press, letting one finger sweep
      // across covers without the row panning under it.
      if ( this.gesture.isTouch ) this.$store.commit("prop", { key: "preventScrolling", value: true });

      this.peekAt( x, y );

    },

    onMove: function( event ) {

      if ( !this.gesture.active ) return;

      const point = this.gesture.isTouch ? event.touches[ 0 ] : event;
      if ( !point ) return;

      if ( !this.gesture.inBlurbMode ) {
        const moved = Math.abs( point.clientX - this.gesture.startX ) + Math.abs( point.clientY - this.gesture.startY );

        // On touch the finger is also the scroll mechanism, so a moving press has to be
        // left alone to pan the page. Only the stationary hold timer enters blurb mode,
        // and any drag before it fires cancels the press so a swipe just scrolls.
        if ( this.gesture.isTouch ) {
          if ( moved >= DRAG_THRESHOLD ) this.end();
          return;
        }

        // Mouse has a separate scroll mechanism, so a quick drag can enter blurb mode early.
        if ( moved < DRAG_THRESHOLD ) return;
        this.enterBlurbMode( point.clientX, point.clientY );
      }

      // Keep the page from panning even momentarily while peeking on touch.
      if ( this.gesture.isTouch && event.cancelable ) event.preventDefault();

      this.peekAt( point.clientX, point.clientY );

    },

    onUp: function() {
      if ( this.gesture.active ) this.end();
    },

    start: function( event ) {

      // Touch devices fire a synthetic mousedown after touchstart; ignore it so the same
      // press doesn't start the gesture twice.
      if ( this.gesture.active ) return;

      this.gesture.active = true;
      this.gesture.inBlurbMode = false;
      this.gesture.lastAsin = null;
      this.gesture.isTouch = event.type === "touchstart";
      this.suppressClick = false;

      const point = this.gesture.isTouch ? event.touches[ 0 ] : event;
      this.gesture.startX = point.clientX;
      this.gesture.startY = point.clientY;

      // A stationary press still enters blurb mode once the hold delay passes.
      clearTimeout( this.gesture.holdTimer );
      this.gesture.holdTimer = setTimeout(() => {
        this.enterBlurbMode( this.gesture.startX, this.gesture.startY );
      }, HOLD_DELAY);

      if ( this.gesture.isTouch ) {
        window.addEventListener("touchmove", this.boundMove, { passive: false });
        window.addEventListener("touchend", this.boundUp);
        window.addEventListener("touchcancel", this.boundUp);
      }
      else {
        window.addEventListener("mousemove", this.boundMove);
        window.addEventListener("mouseup", this.boundUp);
      }

    },

    end: function() {

      clearTimeout( this.gesture.holdTimer );
      this.gesture.active = false;
      this.gesture.inBlurbMode = false;
      this.gesture.lastAsin = null;
      this.peek.visible = false;

      if ( this.gesture.isTouch ) {
        this.$store.commit("prop", { key: "preventScrolling", value: false });
        window.removeEventListener("touchmove", this.boundMove, { passive: false });
        window.removeEventListener("touchend", this.boundUp);
        window.removeEventListener("touchcancel", this.boundUp);
      }
      else {
        window.removeEventListener("mousemove", this.boundMove);
        window.removeEventListener("mouseup", this.boundUp);
      }

    },

    // gallery-book.vue's @click calls this; a true return means "swallow the open"
    // because the press was a blurb peek, not a tap. Reads once then resets.
    consumeClick: function() {
      const swallow = this.suppressClick;
      this.suppressClick = false;
      return swallow;
    },

  },

};
