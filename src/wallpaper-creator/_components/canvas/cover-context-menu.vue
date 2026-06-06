<template>
  <div
    class="cover-context-menu"
    v-if="store.coverActions"
    :style="{ top: store.coverActions.y + 'px', left: store.coverActions.x + 'px' }"
    @click.stop
  >
    <!-- MARK/UNMARK RELISTEN -->
    <button :class="['cover-context-menu-item', store.coverActions.book.reread ? 'reread-unmark' : 'reread-mark']" @click="toggleRelisten">
      <ph-repeat-bold />
      {{ store.coverActions.book.reread ? 'Remove relisten' : 'Mark relisten' }}
    </button>
    
    <!-- RESET RELISTENS -->
    <button v-if="$store.getters.rereadExist" class="cover-context-menu-item remove-all-reread" @click="resetRelistens">
      <mdi-refresh />
      Reset relistens
    </button>
    
    <!-- REMOVE COVER -->
    <button class="cover-context-menu-item remove-cover" @click="removeCover">
      <mdi-book-remove-outline />
      <span>
        Remove book
        <small>Can't be undone</small>
      </span>
    </button>
    
  </div>
</template>

<script>
export default {

  data: function() {
    return {
      store: this.$store.state,
    };
  },

  mounted: function() {
    document.addEventListener('click', this.closeCoverActions);
  },

  beforeUnmount: function() {
    document.removeEventListener('click', this.closeCoverActions);
  },

  methods: {

    closeCoverActions: function() {
      if ( this.store.coverActions ) {
        this.$store.commit('update', { key: 'coverActions', value: null });
      }
    },

    toggleRelisten: function() {
      const { book } = this.store.coverActions;
      this.closeCoverActions();
      this.$store.commit('updateBookCover', { key: 'reread', value: !book.reread, book });
    },

    resetRelistens: function() {
      const { book } = this.store.coverActions;
      this.closeCoverActions();
      this.$store.commit('updateBookCover', { key: 'reread', value: false, book, all: true });
    },

    removeCover: function() {
      const { book } = this.store.coverActions;
      this.closeCoverActions();
      this.$store.commit('removeCover', book.asin);
    },

  },

};
</script>

<style scoped lang="scss">

.cover-context-menu {
  position: fixed;
  z-index: 9999999;
  background: #161e29;
  border: 1px solid rgba( 255, 255, 255, .1 );
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba( 0, 0, 0, .6 );
  overflow: hidden;
  min-width: 200px;
  user-select: none;
}

.cover-context-menu-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 9px 16px;
  background: none;
  border: none;
  color: #fff;
  font-size: 13px;
  text-align: left;
  cursor: pointer;

  svg {
    flex-shrink: 0;
    font-size: 15px;
    opacity: .7;
    transition: color 120ms ease, opacity 120ms ease;
  }

  &:hover {
    background: rgba( 255, 255, 255, .07 );
    svg { opacity: 1; }
  }

  // UN-MARK RELISTEN: purple
  &.reread-unmark:hover {
    background: rgba( 200, 100, 255, .14 );
    svg { color: #c864ff; }
  }

  // MARK RELISTEN: blue
  &.reread-mark:hover {
    background: rgba( 100, 210, 255, .12 );
    svg { color: #64d2ff; }
  }

  // RESET RELISTENS: orange
  &.remove-all-reread:hover {
    background: rgba( 255, 160, 60, .14 );
    svg { color: #ffa03c; }
  }

  // REMOVE BOOK: red
  &.remove-cover:hover {
    background: rgba( 255, 65, 54, .12 );
    svg { color: #ff4136; }
  }

  span {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  small {
    font-size: 10px;
    opacity: .45;
    line-height: 1;
  }

  & + & {
    border-top: 1px solid rgba( 255, 255, 255, .06 );
  }
}

</style>
