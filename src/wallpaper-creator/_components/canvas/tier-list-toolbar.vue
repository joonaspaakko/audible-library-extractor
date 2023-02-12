<template>
  <n-config-provider :theme="darkTheme" class="tier-toolbar">
    
    <n-badge 
      class="tier-list-btn-wrapper"
      :class="[ tier.key ]"
      v-for="tier in $store.state.tiers" :key="'btn-'+tier.key" 
      :max="99"
      :value="
        tier.visible ? 0 : (
          (tier.key === 'container') ? draggableCovers.length : tier.list.length
        )
      " 
    >
      
      <!-- BUTTONS -->
      <button 
        :style="{ 
          background: tier.color, 
          width: tier.key === 'container' ? null : '30px', 
        }"
        :class="{ hidden: !tier.visible }"
        @click="buttonClicked( tier )"
      >
      
        <!-- BTN LABEL -->
        <span v-if="tier.visible">
          <span v-if="tier.key === 'container'">
            <ic-sharp-grid-view/>
          </span>
          <span v-else>
            {{ tier.key }}
          </span>
        </span>
        <!-- BTN ICON (hidden) -->
        <span v-else>
          <mdi-eye-off/>
        </span>
        
      </button>
    </n-badge>
    
  </n-config-provider>
</template>

<script>

import { 
  NConfigProvider, 
  darkTheme, 
  NBadge,
} from 'naive-ui';

export default {
  props: ['draggableCovers'],
  data() {
    return {
      darkTheme: darkTheme,
    }
  },
  components: { 
    NConfigProvider,
    NBadge,
  },
  methods: {
    buttonClicked( tier ) {
      
      this.$store.commit('toggleTier', tier);
      
    },
  }
}
</script>

<style lang="scss" scoped>

.tier-toolbar {
  width: 40px;
  position: absolute;
  z-index: 9999999;
  // top: 0px;
  left: 0;
  // right: 380px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  // background: rgba(#fff, .3);
  // backdrop-filter: blur(4px);
  // box-shadow: 0px 0px 3px 2px rgba(#fff, .99), inset 0 2px 4px rgba(#000, .3), inset 0 2px 14px rgba(#000, .3);
  border-radius: 9999px;
  
  button {
    padding: 0px 6px;
    height: 30px;
    border: none; 
    border-radius: 3px;
    border: 1px solid rgba(#555, .7);
    box-shadow: 1px 1px 3px rgba(#000, .3);
    
    &.hidden {
      // opacity: .6;
      box-shadow: inset 2px 2px 5px rgba(#000, .5);
    }
    &:hover {
      // box-shadow: 1px 2px 5px rgba(#000, .3);
    }
    &:active {
      box-shadow: inset 2px 2px 5px rgba(#000, .5);
    }
    background: #fff;
    cursor: pointer;
    font-weight: 500;
    &, span {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    span, svg {
      font-size: 15px !important;
      line-height: 15px !important;
    }
  }

    
  .container {
    // transform: rotate(90deg);
    // transform-origin: center;
    // margin-top: 30px;
  }
}

.tier-list-btn-wrapper {
  margin: 5px;
}
</style>