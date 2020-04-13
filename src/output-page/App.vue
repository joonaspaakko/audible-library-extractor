<template>
  <div>
    <ale-gallery :library="library"></ale-gallery>
    <ale-spreadsheet   :library="library"></ale-spreadsheet>
  </div>
</template>

<script>
import aleGallery from './_components/aleGallery'
import aleSpreadsheet from './_components/aleSpreadsheet'

export default {
  components: {
    aleGallery,
    aleSpreadsheet
  },
  data: function() {
    return {
      library: this.$root.$data.library
    }
  },
  mounted: function() {
  }
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');

body {
	-moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: 'Montserrat', sans-serif;
	font-size: 14px;
	line-height: 1.55em;
  margin: 0;
  padding-top: 1px;
  margin-top: -1px;
  @include themify($themes) {
    background-color: themed('backColor');
  }
}
//
// .theme-dark body {
// 	-webkit-animation: color-change-dark 400ms linear;
// 	animation: color-change-dark 400ms linear;
// }
// .theme-light body {
// 	-webkit-animation: color-change-light 400ms linear;
// 	animation: color-change-light 400ms linear;
// }
//
// $light: #f9f8f8;
// $dark: #15171a;
//
// @-webkit-keyframes color-change-dark {
//  0% { background-color: $light; }
//  100% { background-color: $dark; }
// }
// @keyframes color-change-dark {
//  0% { background-color: $light; }
//  100% { background-color: $dark; }
// }
//
// @-webkit-keyframes color-change-light {
//  0% { background-color: $dark; }
//  100% { background-color: $light; }
// }
// @keyframes color-change-light {
//  0% { background-color: $dark; }
//  100% { background-color: $light; }
// }

</style>
