<template>
  <div>
    <div id="ale-lightswitch">
      <div :class="{ on: lightSwitch }" @click="switchToggle()"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'aleLightswitch',
  data: function() {
    return {
      lightSwitch: 1,
    }
  },
  methods: {
    switchToggle: function() {
      this.lightSwitch = this.lightSwitch ? 0 : 1;
      $('html').removeClass('theme-light theme-dark');
      $('html').addClass( !this.lightSwitch ? 'theme-dark' : 'theme-light' );
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';

// https://codepen.io/peiche/pen/vonqb
#ale-lightswitch {
  div {
    border: 1px solid rgba( #A3A3A3, .4 );
    height: 30px;
    width: 15px;
    background: -moz-linear-gradient(center top , #fff 15%, #bbb 1%, #bbb 16%, #c5c5c5 1%, #d2d2d2 50%, #e6e6e6 1%, #e6e6e6 99%, #d2d2d2 1%, #d2d2d2 100%);
    background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(white), color-stop(0.15, white), color-stop(0.15, #BBB), color-stop(0.16, #BBB), color-stop(0.17, #C5C5C5), color-stop(0.5, #D2D2D2), color-stop(0.51, #E6E6E6), color-stop(0.99, #E6E6E6), color-stop(0.99, #D2D2D2), to(#D2D2D2));
    box-shadow: 0 2px 5px #999;
    -moz-box-shadow: 0 2px 5px #999;
    -webkit-box-shadow: 0 2px 5px #999;
    border-radius: 3px;
    &.on {
      background: -moz-linear-gradient(center top , #fff 1%, #e6e6e6 1%, #e6e6e6 50%, #ddd 1%, #ddd 51%, #fbfcfb 1%, #fbfcfb 85%, #bbb 1%, #bbb 86%, #c5c5c5 1%, #d2d2d2 100%);
      background: -webkit-gradient(linear, left top, left bottom, color-stop(0, #fff), color-stop(0.01, #fff), color-stop(0.01, #e6e6e6), color-stop(0.5, #e6e6e6), color-stop(0.5, #ddd), color-stop(0.51, #ddd), color-stop(0.51, #fbfcfb), color-stop(0.85, #fbfcfb), color-stop(0.85, #c5c5c5), color-stop(1, #d2d2d2));
      box-shadow: 0px 2px 6px rgba( #000, .3 );
      -moz-box-shadow: 0px 2px 6px rgba( #000, .3 );
      -webkit-box-shadow: 0px 2px 6px rgba( #000, .3 );
    }
  }
}

</style>
