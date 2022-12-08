<template>
  <div class="tier-toolbar">
    
    <!-- BUTTONS -->
    <button 
      v-for="tier in $store.state.tiers" :key="'btn-'+tier.key" 
      :style="{ background: tier.color, width: tier.key === 'container' ? null : '30px' }"
      :class="{
        hidden: !tier.visible
      }"
      @click="buttonClicked( tier )"
    >
    
      <!-- BTN LABEL -->
      <span v-if="tier.visible">{{ tier.key }}</span>
      <!-- BTN ICON (hidden) -->
      <span v-else>
        <mdi-eye-off/>
      </span>
      
    </button>
  </div>
</template>

<script>
import centerCanvas from "@editor-mixins/centerCanvas.js";

export default {
  mixins: [
    centerCanvas,
  ],
  methods: {
    buttonClicked( tier ) {
      
      this.$store.commit('toggleTier', tier);
      this.$nextTick(function() {
        this.centerCanvas();
      });
      
    },
  }
}
</script>

<style lang="scss" scoped>

.tier-toolbar {
  position: fixed;
  z-index: 9999999;
  top: 10px;
  left: 0;
  right: 380px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  
  button {
    margin: 1px;
    padding: 0px 6px;
    height: 30px;
    border: none; 
    border-radius: 3px;
    border: 2px solid #333;
    background: #fff;
    cursor: pointer;
    font-weight: 500;
    &, span {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    span, i {
      font-size: 15px !important;
      line-height: 15px !important;
    }
  }
  
  .hidden {
    opacity: .7;
  }
}
</style>