<template>
  <div
    class="notification-panel"
    :class="{ collapsed }"
    :style="{ width: panelWidth + 'px' }"
  >

    <div class="notification-panel-resize-handle" @mousedown="startResize"></div>

    <div class="notification-panel-header" @click="toggleCollapse">
      <span class="notification-panel-title">Hints</span>
      <span class="notification-panel-badge" v-if="collapsed && notifications.length">{{ notifications.length }}</span>
      <bx-bxs-chevrons-up v-if="!collapsed" class="notification-panel-chevron" />
      <bx-bxs-chevrons-down v-else class="notification-panel-chevron" />
    </div>

    <div class="notification-panel-body" v-if="!collapsed">
      <div
        class="notification-item"
        :class="'notification-item--' + n.type"
        :style="n.color ? { borderLeftColor: n.color } : null"
        v-for="n in notifications"
        :key="n.id"
      >
        <span v-if="n.icon" class="notification-item-icon" :style="n.color ? { color: n.color } : null" v-html="n.icon"></span>
        <span class="notification-item-message">{{ n.message }}</span>
        <button
          v-if="n.closable"
          class="notification-item-close"
          @click.stop="$store.commit('removeNotification', n.id)"
        >
          <fa-regular-times-circle />
        </button>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'NotificationPanel',

  data: function() {
    return {
      collapsed: false,
      panelWidth: 280,
      minWidth: 200,
      maxWidth: 440,
      resizing: false,
      resizeStartX: 0,
      resizeStartWidth: 0,
    };
  },

  computed: {
    notifications: function() {
      return this.$store.state.notifications;
    },

    visible: function() {
      return this.collapsed || this.notifications.length > 0;
    },

  },

  methods: {

    toggleCollapse: function() {
      this.collapsed = !this.collapsed;
    },

    startResize: function( e ) {
      this.resizing = true;
      this.resizeStartX = e.clientX;
      this.resizeStartWidth = this.panelWidth;

      const onMove = ( moveEvent ) => {
        if ( !this.resizing ) return;
        const delta = this.resizeStartX - moveEvent.clientX;
        this.panelWidth = Math.min( this.maxWidth, Math.max( this.minWidth, this.resizeStartWidth + delta ) );
      };

      const onUp = () => {
        this.resizing = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },

  },
};
</script>

<style lang="scss" scoped>

.notification-panel {
  position: absolute;
  top: 28px;
  right: 58px;
  z-index: 9999;
  background: rgb( 22, 30, 41 );
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba( 0, 0, 0, .55 );
  overflow: hidden;
  min-width: 200px;
  max-width: 440px;
  user-select: none;
}

.notification-panel-resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 5px;
  cursor: ew-resize;
  z-index: 1;

  &:hover {
    background: rgba( 255, 255, 255, .06 );
  }
}

.notification-panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px 6px 14px;
  cursor: pointer;
  border-bottom: 1px solid rgba( 255, 255, 255, .07 );

  &:hover {
    background: rgba( 255, 255, 255, .04 );
  }
}

.notification-panel-title {
  flex: 1;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: rgba( 255, 255, 255, .4 );
}

.notification-panel-badge {
  font-size: 11px;
  font-weight: 700;
  background: #0798f1;
  color: #fff;
  border-radius: 999px;
  padding: 1px 6px;
  line-height: 1.4;
}

.notification-panel-chevron {
  color: rgba( 255, 255, 255, .35 );
  font-size: 13px;
  flex-shrink: 0;
}

.notification-panel-body {
  padding: 4px 0;
}

// NOTIFICATION ITEMS

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 7px 10px 7px 14px;
  border-left: 3px solid transparent;

  &--info {
    border-left-color: #0798f1;
  }

  &--warning {
    border-left-color: #fbc03d;
  }

  &--success {
    border-left-color: #2ecc40;
  }

  & + & {
    border-top: 1px solid rgba( 255, 255, 255, .05 );
  }
}

.notification-item-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 1px;
  color: rgba( 255, 255, 255, .4 );
  display: block;

  :deep(svg) {
    width: 100%;
    height: 100%;
    fill: currentColor;
    display: block;
  }
}

.notification-item-message {
  flex: 1;
  font-size: 12px;
  line-height: 1.45;
  color: rgba( 255, 255, 255, .75 );
}

.notification-item-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: rgba( 255, 255, 255, .3 );
  font-size: 14px;
  line-height: 1;
  margin-top: 1px;

  &:hover {
    color: rgba( 255, 255, 255, .7 );
  }
}

</style>
