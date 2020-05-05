<template>
  <div>
    <div style="background: red; color: #fff;" id="view-switcher" @click="viewSwitcherClick">{{ activeViewText }}</div>
    <ale-lightswitch></ale-lightswitch>
    <ale-background :library="library"></ale-background>
    <ale-spreadsheet v-if="activeView === 'spreadsheet'" :library="library"></ale-spreadsheet>
    <ale-gallery v-if="activeView === 'gallery'" :library="library"></ale-gallery>
  </div>
</template>

<script>
import aleBackground from './_components/aleBackground'
import aleGallery from './_components/aleGallery'
import aleSpreadsheet from './_components/aleSpreadsheet'
import aleLightswitch from './_components/aleLightswitch'

export default {
  components: {
    aleBackground,
    aleGallery,
    aleSpreadsheet,
    aleLightswitch,
  },
  data: function() {
    return {
			activeView: 'gallery',
      library: this.$root.$data.library
    }
  },
  computed: {
    
    activeViewText: function() {
      return this.activeView === 'gallery' ? 'Spreadsheet' : 'Gallery';
    }
    
  },
  filters: {
    capitalize: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  },
  methods: {
    
    viewSwitcherClick: function() {
      
      if ( this.activeView === 'gallery' ) {
        this.activeView = 'spreadsheet';
      }
      else {
        this.activeView = 'gallery';
      }
      
    }
    
  },
	
	created: function() {
		
		var test = _.filter(this.library.books, { title: 'Death & Honey' });
		console.log( test );
		
	},
  
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
