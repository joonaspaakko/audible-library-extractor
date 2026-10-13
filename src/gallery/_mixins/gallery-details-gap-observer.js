// GAP HEIGHT
// Watches the element wrapping the open book details with a ResizeObserver so
// openDetails.gapHeight always matches its actual flow height (including the panel's
// margins). The virtualizer reserves that height for the open row, so it has to be
// reported even when the row mounts late, like when a ?book= page load scrolls to it.
// Hook it up with :ref="onDetailsWrapRef" on the wrapper.
export default {
  data: function() {
    return {
      detailsWrapObserver: null,
    };
  },

  beforeUnmount: function() {
    this.observeDetailsWrap( null );
  },

  methods: {

    // Vue calls function refs on every re-render, not just on mount, so this skips the
    // element it's already watching. Null (unmount) is ignored: the old wrapper can unmount
    // after the new one mounts, and the gap should survive the row scrolling out of view.
    onDetailsWrapRef: function( el ) {
      if ( el && el !== this.detailsWrapEl ) this.observeDetailsWrap( el );
    },

    // A fresh observer always reports once on observe(), even if the size didn't change.
    observeDetailsWrap: function( el ) {

      if ( this.detailsWrapObserver ) {
        this.detailsWrapObserver.disconnect();
        this.detailsWrapObserver = null;
      }

      this.detailsWrapEl = el;
      if ( !el ) return;

      const store = this.$store;
      this.detailsWrapObserver = new ResizeObserver(function( entries ) {
        const entry = entries[0];
        if ( !entry ) return;
        const height = entry.borderBoxSize ? entry.borderBoxSize[0].blockSize : entry.contentRect.height;
        if ( height < 1 ) return;
        const current = store.state.openDetails;
        if ( Math.abs( current.gapHeight - height ) < 2 ) return;
        store.commit('prop', { key: 'openDetails', value: { index: current.index, gapHeight: height } });
      });
      this.detailsWrapObserver.observe( el, { box: 'border-box' } );

    },

  },
};
