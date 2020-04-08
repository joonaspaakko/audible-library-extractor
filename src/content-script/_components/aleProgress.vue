<template>
<div v-if="progress.show">
	<transition name="fade">
	<div class="loader-image">
		<img height="72" :src="imageSources.loader" alt="">
	</div>
	</transition>
	<div class="ale-progress">
		<div>
			<div class="ale-step-text">{{ progressText }} <transition name="fade"><span v-if="progress.titles > 0">{{ progress.step }} / {{ progress.titles }}</span></transition></div>
		</div>
	</div>
	
	<div class="ale-bar" v-if="progress.libraryFetched" :class="{'scale-in-hor-center': progress.libraryFetched }">
		<div class="ale-step-line" :style="computedProgressWidth"></div>
	</div>
</div>
</template>

<script>

export default {
	name: 'aleOverlay',
	props: ['progress'],
  data () {
		return {
			props: ['progress'],
			imageSources: {
				logo: chrome.runtime.getURL("assets/images/audible-library-extractor-logo.svg"),
				loader: chrome.runtime.getURL("assets/images/loader-64px.gif")
			},
			progressWidth: {
				width: 0
			},
			nextStep: null
		}
  },
	computed: {
		progressText: function() {
			return !this.progress.libraryFetched ? 'Searching library...' : 'Processing books...';
		},
		computedProgressWidth: function() {
			return { width: ((this.progress.step / this.progress.titles) * 100) + '%' };
		}
	},
	mounted: function () {
		
		var comp = this;
		
		this.$root.$on('nextStep', function( step ) {
			comp.nextStep = step;
		});
		
	}
}
</script>

<style lang="scss" scoped>

.ale-progress {
  > div,
  > div > div { display: inline-block; }
  font-size: 14px;
  color: #666;
  padding-bottom: 0px;
}
.ale-bar {
  padding: 2px;
  display: inline-block;
  width: 100%;
  max-width: 300px;
  height: 7px;
  background: #f8981c;
  border-radius: 9999px;
  // box-shadow: 0 0 50px rgba( #000, .3 ), 0 3px 6px rgba( #000, .1 );
  position: relative;
  z-index: 0;
  .ale-step-line {
    border-radius: 9999px;
    background: #fff;
    width: 0%;
    height: 100%;
  }
}
</style>
