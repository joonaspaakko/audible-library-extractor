<template>
<div id="subpage-menu-bar" v-if="source && destinations.length && sourceAvailable">
  <gallery-scroll-nav arrowStyle="ghost">

    <router-link
      v-for="destination in destinations"
      :key="destination.key"
      class="subpage-menu-tab"
      :class="{ active: isActive( destination ) }"
      :to="{ name: destination.indexName, query: destination.subPageBar ? {} : { subPageSource: source } }"
      @mousedown="$haptic(1)"
    >
      <span class="subpage-menu-tab-icon" v-if="destination.icon" v-html="destination.icon"></span>
      <span class="subpage-menu-tab-text">{{ destination.label }}</span>
    </router-link>

  </gallery-scroll-nav>
</div>
</template>

<script>

import { getSubpageMenuDestinations, isDestinationActive, subpageMenuSourceAvailable } from '@output-mixins/gallery-subpage-menu-destinations.js';
import galleryScrollNav from '@output-snippets/gallery-scroll-nav.vue';

export default {
  name: "subpageMenuBar",
  props: [ 'source' ],
  components: { galleryScrollNav },

  computed: {

    destinations() {
      return getSubpageMenuDestinations( this.$router, this.source );
    },

    sourceAvailable() {
      return subpageMenuSourceAvailable( this.$store, this.source );
    },

  },

  methods: {

    isActive: function( destination ) {
      return isDestinationActive( destination, this.source, this.$route, this.$store.state.sticky.subPageSource );
    },

  },
};
</script>


<style lang="scss" scoped>

#subpage-menu-bar {
  width: 100%;
  font-size: .9em;
  @include themify($themes) {
    background: themed(panelColor);
    border-top: 1px solid rgba( themed(frontColor), .12);
  }
}

#subpage-menu-bar :deep(.scroll-nav-track) {
  padding: 4px 0;
}

// #ale-navigation sets an !important color on every anchor, so these need to outrank it.
#subpage-menu-bar .subpage-menu-tab {
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  padding: 4px 12px;
  @include themify($themes) {
    color: rgba( themed(frontColor), .75) !important;
  }
  .theme-light & {
    color: rgba(0, 0, 0, 0.75) !important;
  }
  
  &:hover {
    @include themify($themes) {
      color: themed(frontColor) !important;
    }
  }
  &.active {
    @include themify($themes) {
      color: themed(audibleOrange) !important;
      .subpage-menu-tab-icon {
        color: themed(audibleOrange) !important;
      }
    }
  }
}

.subpage-menu-tab-icon {
  width: 14px;
  height: 14px;
  padding-right: 7px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

</style>
