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

body {
  @include themify($themes) {
    background-color: themed('backColor');
  }
}

.theme-dark body {
	-webkit-animation: color-change-dark 400ms linear;
	animation: color-change-dark 400ms linear;
}
.theme-light body {
	-webkit-animation: color-change-light 400ms linear;
	animation: color-change-light 400ms linear;
}

$light: #f9f8f8;
$dark: #15171a;

@-webkit-keyframes color-change-dark {
 0% { background-color: $light; }
 100% { background-color: $dark; }
}
@keyframes color-change-dark {
 0% { background-color: $light; }
 100% { background-color: $dark; }
}

@-webkit-keyframes color-change-light {
 0% { background-color: $dark; }
 100% { background-color: $light; }
}
@keyframes color-change-light {
 0% { background-color: $dark; }
 100% { background-color: $light; }
}

</style>
