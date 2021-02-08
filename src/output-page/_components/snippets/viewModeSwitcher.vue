<template>
  <div id="view-mode-switcher" @click="changeViewMode">
    
    <font-awesome v-if="sticky.viewMode === 'grid'"             :icon="['fas', 'table']" />
    <font-awesome v-else-if="sticky.viewMode === 'spreadsheet'" :icon="['fas', 'th']"    />
    
  </div>
</template>

<script>

export default {
  name: "viewModeSwitcher",
  data: function() {
    return {
      sticky: this.$store.state.sticky,
      viewModes: [
        'grid',
        'spreadsheet',
      ],
    };
  },
  
  methods: {
    
    changeViewMode: function() {
      
      const vue = this;
      
      let viewModeIndex = _.findIndex( this.viewModes, function( v ) { return v === vue.sticky.viewMode });
      if ( (viewModeIndex+1) > (this.viewModes.length-1) ) viewModeIndex = 0;
      else viewModeIndex = viewModeIndex+1;
      
      const newViewMode = this.viewModes[ viewModeIndex ];
      this.$store.commit('stickyProp', { key: 'viewMode', value: newViewMode });
      
    },
    
  },
  
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";

#view-mode-switcher {
  
  cursor: pointer;
  // margin-left: -27px;
  // padding: 0 5px 0 30px;
  margin-left: 10px;
  width: 30px;
  height: 30px;
  min-width: 30px;
  min-height: 30px;
  border-radius: 9999px;
  display: flex;
  justify-content: center;
  justify-items: center;
  align-items: center;
  align-content: center;
  font-size: 14px;
  color: #fff;
  background: #252525;
  
  // @include themify($themes) {
  //   background: themed(audibleOrange);
  // }
  background: #fff;
  color: #252525;
  font-size: 13px;
  @include themify($themes) {
    box-shadow: 0 5px 20px rgba(themed(outerColor), 0.9);
  }
  
}

</style>
