<template>
<div class="subpage-menu-accordion-body" v-if="destinations.length && sourceAvailable" v-show="expanded">
  <router-link
    v-for="destination in destinations"
    :key="destination.key"
    class="subpage-menu-accordion-item"
    :class="{ active: isActive( destination ) }"
    :to="{ name: destination.indexName, query: { subPageSource: source } }"
    @click="$emit('navigate')"
    @mousedown="$haptic(1)"
  >
    <span class="subpage-menu-accordion-icon" v-if="destination.icon" v-html="destination.icon"></span>
    <span class="subpage-menu-accordion-text">{{ destination.label }}</span>
  </router-link>
</div>
</template>

<script>

import { getSubpageMenuDestinations, isDestinationActive, subpageMenuSourceAvailable } from '@output-mixins/gallery-subpage-menu-destinations.js';

export default {
  name: "subpageMenuAccordion",
  props: [ 'source', 'expanded' ],
  emits: [ 'navigate' ],

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

.subpage-menu-accordion-body {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.subpage-menu-accordion-item {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 5px 12px 5px 55px;
  &, & span {
    font-size: 16px !important;
    line-height: 16px !important;
  }
  @include themify($themes) {
    border-top: 1px solid rgba( themed(frontColor), .1);
  }
  &:hover .subpage-menu-accordion-text {
    @include themify($themes) {
      color: themed(audibleOrange);
    }
  }
}

.subpage-menu-accordion-icon {
  width: 28px;
  height: 28px;
  padding-right: 12px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  @include themify($themes) {
    color: rgba( themed(frontColor), .6);
  }
}

.subpage-menu-accordion-item.active {
  .subpage-menu-accordion-icon,
  .subpage-menu-accordion-text {
    @include themify($themes) {
      color: themed(audibleOrange);
    }
  }
}

</style>
