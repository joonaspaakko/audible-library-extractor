<template>
  <div
    class="unused-covers-sidebar"
    :class="{ 'flash-hide-cover': store.sidebarHideFlash }"
    :style="{
      width: $store.getters.unusedSidebarVisible ? '324px' : '25px',
    }"
  >

    <div class="collapse-toolbar" :class="{ 'collapsed': !$store.getters.unusedSidebarVisible }" @click="toggleSidebar">
      <bx-bxs-chevrons-right v-if="!$store.getters.unusedSidebarVisible" />
      <bx-bxs-chevrons-left v-else />
    </div>

    <draggable
      class="unused-covers-list"
      v-if="$store.getters.unusedSidebarVisible"
      v-model="covers"
      item-key="asin"
      group="covers"
      @start="$emit('start', $event)"
      @end="$emit('end', $event)"
      @move="$emit('move', $event)"
    >
      <!-- HEADER -->
      <template #header>
        <div class="unused-covers-heading">Unused covers</div>
      </template>

      <!-- ITEMS -->
      <template #item="{element}">
        <cover :key="element.asin" :book="element"></cover>
      </template>

    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import cover from '@editor-comps/canvas/cover.vue';

export default {

  emits: ['start', 'end', 'move'],

  components: {
    draggable,
    cover,
  },

  data: function() {
    return {
      store: this.$store.state,
    };
  },

  mounted: function() {
    this.$nextTick( () => {
      document.querySelector('#app').prepend( this.$el );
    });
  },

  beforeUnmount: function() {
    const el = document.querySelector('#app > .unused-covers-sidebar');
    if ( el ) el.remove();
  },

  computed: {

    covers: {
      get() {
        return this.store.hiddenCovers;
      },
      set( value ) {
        this.$store.commit( 'update', { key: 'hiddenCovers', value } );
      },
    },

  },

  methods: {

    toggleSidebar: function() {
      const tier = this.$store.getters.unusedSidebarTier;
      this.$store.commit( 'toggleTier', tier );
    },

  },

};
</script>

<style scoped lang="scss">

.unused-covers-sidebar {
  min-width: 25px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 9000 !important;
  background: #171e29;
  transition: width 0.3s ease;
}

.collapse-toolbar {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 1.3em;
  cursor: pointer;
  svg { display: block; }
  position: absolute;
  top: 25px;
  right: -10px;
  z-index: 0;
  padding: 5px;
  background: #171e29;
  border-radius: 50%;
  color: #8eabc5;
  &:before {
    content: '';
    position: absolute;
    border: 1px solid #303d4f;
    border-radius: 50%;
    width: 100%;
    padding-bottom: 100%;
  }

  &.collapsed {
    right: -14px;
  }
}

</style>

<style lang="scss">

.unused-covers-list {
  width: 100% !important;
  flex: 1 !important;
  display: block !important;
  font-size: 0 !important;
  overflow: hidden auto !important;
  margin: 0 !important;
  box-shadow: -4px 0 10px color.adjust(rgba(#171e29, .3), $lightness: -20%) !important;
  background: #171e29 !important;
  text-align: center !important;
  padding: 0 !important;
  padding-bottom: 25px !important;
  box-sizing: border-box !important;
}

.unused-covers-heading {
  padding: 14px 16px 10px;
  margin-bottom: 30px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: rgba( 255, 255, 255, .4 );
  border-bottom: 1px solid rgba( 255, 255, 255, .07 );
  text-align: center;
}

.unused-covers-list .cover {
  width:  118px !important;
  height: 118px !important;
  padding: 0 !important;
  margin: 5px !important;
}
.unused-covers-list .cover img {
  width:  118px !important;
  height: 118px !important;
  box-shadow: 0 0 5px rgba(#000, .5);
}
.unused-covers-list .cover .cover-heart-icon {
  top: 5px !important;
  right: 5px !important;
}
.unused-covers-list .cover .cover-heart-icon svg {
  font-size: 19px !important;
  line-height: 19px !important;
}
.unused-covers-list .cover .cover-star-icons {
  height: 15px !important;
}
.unused-covers-list .cover .cover-star-icons svg {
  font-size: 19px !important;
  line-height: 19px !important;
}
.unused-covers-list .author-and-title {
  font-size: 19px !important;
  line-height: 19px !important;
  color: #fff !important;
  width: 100% !important;
  display: none !important;
}

@keyframes sidebar-hide-flash {
  0%   { box-shadow: inset -3px 0 12px rgba( 255, 65, 54, 0 ),   inset 0 0 0    rgba( 255, 65, 54, 0 ),   3px 0 20px rgba( 255, 65, 54, 0 ),   1px 0 0 rgba( 255, 65, 54, 0 );   background: #171e29; }
  15%  { box-shadow: inset -3px 0 18px rgba( 255, 65, 54, .9 ),  inset 0 0 30px rgba( 255, 65, 54, .35 ),  3px 0 28px rgba( 255, 65, 54, .7 ),  1px 0 0 rgba( 255, 65, 54, .9 );  background: rgba( 90, 20, 18, .9 ); }
  60%  { box-shadow: inset -3px 0 14px rgba( 255, 65, 54, .5 ),  inset 0 0 20px rgba( 255, 65, 54, .2 ),   3px 0 18px rgba( 255, 65, 54, .4 ),  1px 0 0 rgba( 255, 65, 54, .5 );  background: rgba( 55, 20, 18, .7 ); }
  100% { box-shadow: inset -3px 0 12px rgba( 255, 65, 54, 0 ),   inset 0 0 0    rgba( 255, 65, 54, 0 ),   3px 0 20px rgba( 255, 65, 54, 0 ),   1px 0 0 rgba( 255, 65, 54, 0 );   background: #171e29; }
}

.unused-covers-sidebar.flash-hide-cover {
  animation: sidebar-hide-flash 700ms ease-out forwards !important;
}

</style>
