<template>
<div id="ale-progress-wrap">
	
	<transition name="fade">
		<div class="loader-image">
			<img height="72" :src="imageSources.loader" alt="">
		</div>
	</transition>
	
	<div class="ale-big-step" v-if="bigStep.title">
		<h2>{{ bigStep.title }} <span class="step" v-if="bigSteps">{{ bigSteps }}</span></h2>
	</div>
	
	<div class="ale-progress" v-visible="progress.text">
		<div>
			<div class="ale-step-text">
				<div class="ale-step-additional-info" v-visible="progress.text2">
					{{ progress.text2 }}
				</div>
				{{ progress.text }} 
				<transition name="fade" v-if="steps"><span>{{ steps }}</span></transition>
			</div>
		</div>
	</div>
	
	<div class="ale-bar" v-visible="progress.bar && progress.step && progress.max" :class="{'scale-in-hor-center': progress.bar }">
		<div class="ale-step-line" :style="progressWidth"></div>
	</div>
	
	<div v-show="progress.thumbnail" style="text-align: center; margin-top: 20px; height: 110px;">
		<img :src="progress.thumbnail" alt="" style="max-height: 110px;">
	</div>
	
</div>
</template>

<script>

export default {
	name: 'scrapingProgress',
  data () {
		return {
			imageSources: {
        logo: browser.runtime.getURL("assets/images/audible-library-extractor-logo.svg"),
				loader: browser.runtime.getURL("assets/images/loader-64px.gif")
			},
			progress: {
				text: null,
				text2: null,
				step: 0,
				max: 0,
				bar: false,
				thumbnail: null,
			},
			bigStep: {
				title: '',
				step: 0,
				max: 0,
			},
		}
  },
	computed: {
		
		steps: function() {
			return this.progress.step > 0 ? (this.progress.step + ' / ' + this.progress.max) : this.progress.max;
		},
		
		bigSteps: function() {
			return this.bigStep.step > 0 ? (this.bigStep.step + ' / ' + this.bigStep.max) : this.bigStep.max;
		},
		
		progressWidth: function() {
			return { width: ((this.progress.step / this.progress.max) * 100) + '%' };
		}
		
	},
	
	created: function() {
		
		var vue = this;
		
		this.$root.$on('update-progress', function( progress ) {
			if ( progress.text 			) vue.progress.text      = progress.text;
			if ( progress.text2 		) vue.progress.text2     = progress.text2;
			if ( progress.step > -1 ) vue.progress.step      = progress.step;
			if ( progress.max > -1  ) vue.progress.max 			 = progress.max;
			if ( progress.bar 			) vue.progress.bar       = progress.bar;
		});
		
		this.$root.$on('update-progress-step', function() {
			++vue.progress.step;
		});
		
		this.$root.$on('update-progress-max', function() {
			++vue.progress.max;
		});
		
		this.$root.$on('update-progress-thumbnail', function( thumbnail ) {
			vue.progress.thumbnail = thumbnail;
		});
		
		this.$root.$on('reset-progress', function() {
			vue.progress.text      = null;
			vue.progress.text2     = null;
			vue.progress.step      = 0;
			vue.progress.max 			 = 0;
			vue.progress.bar       = false;
			vue.progress.thumbnail = null;
		});
		
		this.$root.$on('update-big-step', function( o ) {
			if ( o.title     ) vue.bigStep.title = o.title;
			if ( o.step > -1 ) vue.bigStep.step  = o.step;
			if ( o.stepAdd   ) vue.bigStep.step += o.stepAdd;
			if ( o.max > -1  ) vue.bigStep.max   = o.max;
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

.ale-big-step {
	margin: 30px 0 25px;
	h2 {
		font-size: 19px;
		line-height: 21px;
	}
	span {
		color: #999;
	}
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
