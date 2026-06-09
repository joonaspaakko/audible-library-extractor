<template>
  <div
    class="notification-panel"
    :class="{ collapsed: notificationPanelCollapsed }"
    :style="notificationPanelCollapsed ? {} : { width: notificationPanelWidth + 'px' }"
  >

    <div class="notification-panel-resize-handle" @mousedown="startResize"></div>

    <div class="notification-panel-header" @click="toggleCollapse">
      <span class="notification-panel-title">Hints</span>
      <span class="notification-panel-badge" v-if="notificationPanelCollapsed && notifications.length">{{ notifications.length }}</span>
      <bx-bxs-chevrons-up v-if="!notificationPanelCollapsed" class="notification-panel-chevron" />
      <bx-bxs-chevrons-down v-else class="notification-panel-chevron" />
    </div>

    <div class="notification-panel-body" v-if="!notificationPanelCollapsed">
      <div
        class="notification-item"
        :class="['notification-item--' + n.type, { 'notification-item--timed': n.timed }]"
        :style="n.color ? { borderLeftColor: n.color } : null"
        v-for="n in notifications"
        :key="n.id"
      >
        <div
          v-if="n.timed && n.duration"
          class="notification-item-progress"
          :style="{ animationDuration: n.duration + 'ms', background: n.color || 'rgba(255,255,255,.5)' }"
        ></div>
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

    notificationPanelCollapsed: function() {
      return this.$store.state.notificationPanelCollapsed;
    },

    notificationPanelWidth: function() {
      return this.$store.state.notificationPanelWidth;
    },

    visible: function() {
      return this.notificationPanelCollapsed || this.notifications.length > 0;
    },

  },

  methods: {

    toggleCollapse: function() {
      this.$store.commit( 'update', { key: 'notificationPanelCollapsed', value: !this.notificationPanelCollapsed } );
    },

    startResize: function( e ) {
      this.resizing = true;
      this.resizeStartX = e.clientX;
      this.resizeStartWidth = this.notificationPanelWidth;

      const onMove = ( moveEvent ) => {
        if ( !this.resizing ) return;
        const delta = this.resizeStartX - moveEvent.clientX;
        const clamped = Math.min( this.maxWidth, Math.max( this.minWidth, this.resizeStartWidth + delta ) );
        this.$store.commit( 'update', { key: 'notificationPanelWidth', value: clamped } );
      };

      const onUp = () => {
        this.resizing = false;
        document.removeEventListener( 'mousemove', onMove );
        document.removeEventListener( 'mouseup', onUp );
      };

      document.addEventListener( 'mousemove', onMove );
      document.addEventListener( 'mouseup', onUp );
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
  transition: top .2s ease, border-radius .2s ease;

  &.collapsed {
    top: 0;
    min-width: 0;
    max-width: none;
    border-radius: 0 0 6px 6px;
  }
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

  .collapsed & {
    display: none;
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
  background: none;
  color: rgba( 255, 255, 255, .5 );
  border: 1px solid rgba( 255, 255, 255, .2 );
  border-radius: 999px;
  padding: 0px 5px;
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

@keyframes timed-border-shrink {
  from { transform: scaleY( 0 ); }
  to   { transform: scaleY( 1 ); }
}

.notification-item {
  position: relative;
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

  &--timed {
    background: rgba( 255, 255, 255, .04 );
    border-left-color: rgba( 255, 255, 255, .1 ) !important;
  }

  & + & {
    border-top: 1px solid rgba( 255, 255, 255, .05 );
  }
}

.notification-item-progress {
  position: absolute;
  left: -3px;
  top: 0;
  bottom: 0;
  width: 3px;
  transform-origin: bottom;
  animation: timed-border-shrink linear forwards;
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
