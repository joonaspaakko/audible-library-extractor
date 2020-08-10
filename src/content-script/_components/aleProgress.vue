<template>
<div id="ale-progress-wrap" v-if="progress.show">
	<transition name="fade">
	<div class="loader-image">
		<img height="72" :src="imageSources.loader" alt="">
	</div>
	</transition>
	<div class="ale-progress">
		<div>
			<div class="ale-step-text">
				{{ progress.text }} 
				<!-- <div class="ale-step-additional-info">
					{{ progress.text2 }}
				</div> -->
				<transition name="fade"><span v-if="progress.maxLength > 0">{{ step }}{{ progress.maxLength }}</span></transition>
			</div>
		</div>
	</div>
	
	<div class="ale-bar" v-if="progress.bar" :class="{'scale-in-hor-center': progress.bar }">
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
		
		step: function() {
			return this.progress.step >= 0 ? (this.progress.step + ' / ') : '';
		},
		
		computedProgressWidth: function() {
			return { width: ((this.progress.step / this.progress.maxLength) * 100) + '%' };
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
#ale-progress-wrap {
	-webkit-touch-callout: none; 
	-webkit-user-select: none; 
	-khtml-user-select: none; 
	-moz-user-select: none; 
	-ms-user-select: none; 
	user-select: none; 
}

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

.ale-step-additional-info {
  font-size: 13px;
  color: #7a7a7a;
}
</style>
