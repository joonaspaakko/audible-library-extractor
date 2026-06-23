<template>
  <div
    class="column-menu"
    :style="clampedPosition"
    @mousedown.stop
    @contextmenu.prevent
  >
  
    <!-- HEADER-->
    <div class="column-menu-header">
      <span>Columns</span>
      <button class="column-menu-reset" @click="reset">Reset</button>
    </div>
    
    <!-- Draggable list items (columns) -->
    <draggable
      class="column-menu-list"
      v-model="orderableKeys"
      :item-key="key => key"
      handle=".column-menu-handle"
      ghost-class="column-menu-ghost"
      :animation="120"
    >
      <template #item="{ element: key }">
        <div
          class="column-menu-item"
          :class="{ checked: !isHidden( key ) }"
          :data-key="key"
        >
        
          <!-- Freeze toggle btn -->
          <button
            class="column-menu-freeze"
            :class="{ frozen: isFrozen( key ) }"
            :title="isFrozen( key ) ? 'Unfreeze column' : 'Freeze column to the left'"
            @click="toggleFreeze( key )"
          >
            <mdi-snowflake />
          </button>
          
          <!-- Drag handle -->
          <span class="column-menu-handle" title="Drag to reorder">
            <mdi-drag-vertical />
          </span>
          
          <!-- Column toggle btn -->
          <button class="column-menu-toggle" @click="toggle( key )">
            <span class="checkbox">
              <mdi-check v-if="!isHidden( key )" class="check" />
            </span>
            <span class="label">{{ label( key ) }}</span>
          </button>
          
        </div>
      </template>
    </draggable> <!-- .column-menu-list -->
    
  </div> <!-- .column-menu -->
</template>

<script>
import draggable from 'vuedraggable';

// titleShort is folded into title (not a real column), so it never appears in the list.
const HIDDEN_FROM_LIST = [ 'titleShort' ];

export default {
  name: "galleryColumnMenu",
  components: { draggable },
  props: {
    x         : { type: Number, default: 0 },
    y         : { type: Number, default: 0 },
    allKeys   : { type: Array, default: () => [] },
    hiddenKeys: { type: Array, default: () => [] },
    frozenKeys: { type: Array, default: () => [] },
  },

  computed: {

    // Every column shown in the list: the full set minus the folded-away titleShort.
    listKeys() {
      return _.reject( this.allKeys, ( key ) => _.includes( HIDDEN_FROM_LIST, key ) );
    },

    // The draggable list edits column order. Reading gives the current list order; writing
    // commits it back (with titleShort kept at the front so the folded column stays put).
    orderableKeys: {
      get() {
        return this.listKeys;
      },
      set( reordered ) {
        const folded = _.filter( this.allKeys, ( key ) => _.includes( HIDDEN_FROM_LIST, key ) );
        this.$store.commit( 'stickyProp', { key: 'listColumnsOrder', value: folded.concat( reordered ) });
      },
    },

    // Clamp the menu inside the viewport so it never spills off the right or bottom edge.
    clampedPosition() {
      const menuWidth = 220;
      const menuHeight = 360;
      const left = Math.min( this.x, window.innerWidth - menuWidth - 8 );
      const top = Math.min( this.y, window.innerHeight - menuHeight - 8 );
      return { left: Math.max( 8, left ) + 'px', top: Math.max( 8, top ) + 'px' };
    },

  },

  methods: {

    label( key ) {
      return _.startCase( key );
    },

    isHidden( key ) {
      return _.includes( this.hiddenKeys, key );
    },

    isFrozen( key ) {
      return _.includes( this.frozenKeys, key );
    },

    // Add or drop the column from the frozen set. The first edit materializes the effective
    // set (null seed) into an explicit array, same as the hidden toggle.
    toggleFreeze( key ) {
      let frozen = _.clone( this.frozenKeys );
      // already frozen: unfreeze it and leave its position alone
      if ( this.isFrozen( key ) ) {
        frozen = _.without( frozen, key );
        this.$store.commit( 'stickyProp', { key: 'listColumnsFrozen', value: frozen });
        return;
      }

      // not frozen: freeze it. A frozen column has to live in the left cluster to read
      // correctly, so reveal it (if hidden) and herd it to the end of the frozen block.
      frozen.push( key );
      this.$store.commit( 'stickyProp', { key: 'listColumnsFrozen', value: frozen });

      if ( this.isHidden( key ) ) {
        const hidden = _.without( this.hiddenKeys, key );
        this.$store.commit( 'stickyProp', { key: 'listColumnsHidden', value: hidden });
      }

      this.moveAfterFrozen( key, frozen );
      this.scrollToKey( key );
    },

    // After a freeze reorders the list, smooth-scroll the menu so the moved column stays in
    // view (it may have jumped up to the frozen block, out of the current scroll window).
    scrollToKey( key ) {
      this.$nextTick( () => {
        const item = this.$el.querySelector( '[data-key="' + key + '"]' );
        if ( item ) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    },

    // Slot key into the list right after the last already-frozen column, so freezing always
    // tucks it onto the contiguous left block instead of leaving it stranded mid-row.
    moveAfterFrozen( key, frozen ) {
      const order = _.without( this.listKeys, key );
      // index of the last frozen column still in the list (excluding key itself)
      let lastFrozen = -1;
      _.forEach( order, ( k, i ) => {
        if ( _.includes( frozen, k ) ) lastFrozen = i;
      });
      order.splice( lastFrozen + 1, 0, key );

      const folded = _.filter( this.allKeys, ( k ) => _.includes( HIDDEN_FROM_LIST, k ) );
      this.$store.commit( 'stickyProp', { key: 'listColumnsOrder', value: folded.concat( order ) });
    },

    // Materialize the effective hidden set into an explicit array, then add or drop
    // this key. The first edit turns the null (seed) state into a concrete choice.
    toggle( key ) {
      let hidden = _.clone( this.hiddenKeys );
      // already hidden: reveal it
      if ( this.isHidden( key ) ) {
        hidden = _.without( hidden, key );
      }
      // visible: hide it
      else {
        hidden.push( key );
      }
      this.$store.commit( 'stickyProp', { key: 'listColumnsHidden', value: hidden });
    },

    // Back to the default seed (null) for visibility, order, freeze, and widths.
    reset() {
      this.$store.commit( 'stickyProp', { key: 'listColumnsHidden', value: null });
      this.$store.commit( 'stickyProp', { key: 'listColumnsOrder', value: null });
      this.$store.commit( 'stickyProp', { key: 'listColumnsFrozen', value: null });
      this.$store.commit( 'stickyProp', { key: 'listColumnsWidths', value: null });
    },

  },
};
</script>

<style lang="scss" scoped>

.column-menu {
  position: fixed;
  z-index: 9999999;
  min-width: 200px;
  max-width: 220px;
  max-height: 360px;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  user-select: none;
  @include themify($themes) {
    background: themed(backColor);
    border: 1px solid rgba(themed(frontColor), 0.14);
    box-shadow: themed(shadowSmall);
    color: themed(frontColor);
  }
}

.column-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  @include themify($themes) {
    border-bottom: 1px solid rgba(themed(frontColor), 0.14);
  }
}

.column-menu-reset {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  text-transform: none;
  letter-spacing: 0;
  color: #f29a33;
  padding: 0;
}

.column-menu-list {
  overflow-y: auto;
  padding: 4px 0;
}

.column-menu-item {
  display: flex;
  align-items: center;

  &:hover {
    @include themify($themes) {
      background: rgba(themed(frontColor), 0.07);
    }
  }
}

// drop-target placeholder while dragging: hidden, so the reorder list just opens an
// empty gap where the item will land instead of showing a faint ghost slot
.column-menu-ghost {
  opacity: 0;
}

// FREEZE TOGGLE
// dim snowflake when the column is free, accent blue when it's frozen to the left edge
.column-menu-freeze {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0 2px 0 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  @include themify($themes) {
    color: rgba(themed(frontColor), 0.25);
  }
  &:hover {
    @include themify($themes) {
      color: rgba(themed(frontColor), 0.55);
    }
  }
  &.frozen {
    color: #4ba3e3;
  }
}

// GRAB HANDLE
// only this region starts a drag (handle: ".column-menu-handle"), so the toggle button stays clickable
.column-menu-handle {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0 4px;
  cursor: grab;
  font-size: 16px;
  @include themify($themes) {
    color: rgba(themed(frontColor), 0.35);
  }
  &:active {
    cursor: grabbing;
  }
}

.column-menu-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 6px 12px 6px 4px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  @include themify($themes) {
    color: rgba(themed(frontColor), 0.55);
  }

  // always-present box so a hidden column still shows a clear (clickable) target where
  // the checkmark would be, instead of the label floating with nothing beside it
  .checkbox {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    @include themify($themes) {
      border: 1px solid rgba(themed(frontColor), 0.35);
    }
  }
  .check {
    font-size: 13px;
    color: #f29a33;
  }

  // checked rows read at full strength, unchecked are dimmed
  .column-menu-item.checked & {
    @include themify($themes) {
      color: themed(frontColor);
    }
  }
}

</style>
