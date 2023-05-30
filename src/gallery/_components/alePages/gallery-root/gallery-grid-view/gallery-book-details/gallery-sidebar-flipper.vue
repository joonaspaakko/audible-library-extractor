<template>
<div 
  class="action-reverse-direction" 
  :class="{ flip: detailSettings.reverseDirection }"
  @click="flip"
>
  
  <!-- <fluent-circle-small-20-filled/>
  <fluent-circle-small-20-filled style="color: orange;"/> -->
  <ri-toggle-line/>
  <!-- <fluent-circle-12-filled/> -->
  <!-- <fa6-solid-retweet @click="flip" /> -->
  
<!--   
  <div
  v-for="item in settings" :key="item.label"
  :class="[ item.label ]"
  @click="$store.commit('prop', { key: 'sticky.bookDetailSettings.reverseDirection', value: !detailSettings.reverseDirection })"
  >
  {{ item.label }}
  </div> -->
  
</div>
</template>

<script>
export default {
  name: "sidebarFlipper",
  data: function() {
    return {
      detailSettings: this.$store.state.sticky.bookDetailSettings,
      // settings: [
      //   { 
      //     label: 'sidebar',
      //   },
      //   {
      //     label: 'summary',
      //   }
      // ],
    };
  },
  
  methods: {
    flip() {
      this.$store.commit('prop', { 
        key: 'sticky.bookDetailSettings.reverseDirection', 
        value: !this.detailSettings.reverseDirection 
      });
    },
  }
};
</script>

<style lang="scss" scoped>


// .action-reverse-direction {
//   @include themify($themes) {
//     position: absolute;
//     top: 0;
//     background: themed(audibleOrange);
//     border-radius: 0 0 7px 7px;
//     display: inline-flex;
//     flex-direction: row;
//     color: #fff;
//     font-weight: bold;
//     > div {
//       padding: 0 9px;
//       border-left: 1px solid themed(audibleOrange); &:first-child { border-left: none; }
//     }
    
//     &.flip {
//       flex-direction: row-reverse;
//       > div {
//         border-left: none;
//         border-right: 1px solid themed(audibleOrange); &:first-child { border-right: none; }
//       }
//     }
    
//   }
// }

.action-reverse-direction {
  @extend .no-selection;
  @include themify($themes) {
    display: flex;
    flex-direction: row;
    font-size: 18px;
    cursor: pointer;
    transition: color 200ms cubic-bezier(0, 0, 0, .1);
    color: rgba(themed(frontColor), 0.4);
    &.active,
    &:hover {
      color: themed(frontColor);
    }
  }
  
  &.flip {
    flex-direction: row-reverse;
    > * { transform: rotate(180deg); }
  }
}

</style>

<style lang="scss">

// #ale-bookdetails {
//   .action-reverse-direction { display: none; }
//   &:hover .action-reverse-direction { display: inline-flex; }
// }
</style>
