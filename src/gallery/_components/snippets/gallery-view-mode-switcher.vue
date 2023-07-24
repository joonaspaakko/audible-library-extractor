<template>
  <div class="view-mode-switcher icon" :class="{ 'no-style': justIcon }" @click="changeViewMode"
  v-tippy="{ allowHTML: true, }"
  :content="'Change to <strong>' + (sticky.viewMode === 'grid' ? 'spreadsheet' : 'grid')  + '</strong> view'"
  >
  
    <mdi-table-large class="icon" v-if="sticky.viewMode === 'grid'" />
    <ep-grid class="icon" v-else-if="sticky.viewMode === 'spreadsheet'" />
    
  </div>
</template>

<script>

export default {
  name: "ViewModeSwitcher",
  props: ['justIcon'],
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
      
      let viewModeIndex = _.findIndex( this.viewModes, ( v ) => { return v === this.sticky.viewMode });
      if ( (viewModeIndex+1) > (this.viewModes.length-1) ) viewModeIndex = 0;
      else viewModeIndex = viewModeIndex+1;
      
      const newViewMode = this.viewModes[ viewModeIndex ];
      this.$store.commit('stickyProp', { key: 'viewMode', value: newViewMode });
      this.$updateQueries({ y: null, view: newViewMode });
      
    },
    
  },
  
};
</script>

<style lang="scss">


.view-mode-switcher {
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
  
  &.no-style {
    background: transparent;
    padding: 0px;
    margin: 0px;
    color: inherit;
    box-shadow: unset;
    min-width: unset;
    min-height: unset;
    width: inherit;
    height: inherit;
    svg {
      width: auto;
      padding: 0 12px;
    }
  }
  
}

</style>
