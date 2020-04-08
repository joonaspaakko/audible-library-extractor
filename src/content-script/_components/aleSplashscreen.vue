<template>
<div v-if="!nextStep" id="ale-spashscreen">
	
	<div class="info-wrap top content is-medium"></div>
	
	<div class="btns-one-wrap">
	
		<button class="extract button is-medium is-info " @click="takeNextStep('extract')">
			<span>Start extracting</span>
			<span class="icon is-small">
				<i class="far fa-play-circle"></i>
			</span>
		</button>
	
	</div>

	<div class="field has-addons btns-two-wrap">
		<p class="control">
			<button class="update button is-small" :disabled="!storageDataExists" @click="takeNextStep('update')" aria-label="If you have extracted your library at least once, you can use this to look for any new titles since last extraction, rather than look through the entire library, which is what the &quot;Start extracting&quot; button does." data-balloon-pos="down" data-balloon-length="650">
				<span class="icon is-small">
					<i class="fas fa-sync-alt"></i>
				</span>
				<span>Update</span>
			</button>
		</p>
		<p class="control">
			<button class="output button is-small" :disabled="!storageDataExists" @click="takeNextStep('output')" aria-label="If you have extracted your library at least once, you can skip straight to the output page." data-balloon-pos="down" >
				<span class="icon is-small">
					<i class="fas fa-share-square"></i>
				</span>
				<span>Output page</span>
			</button>
		</p>
	</div>

	<div class="info-wrap bottom content is-small has-text-grey">
			Find more information in the <a href="https://github.com/joonaspaakko/audible-library-extractor">Github repository</a> page. <br />
			if you got any problems or just questions you can post them in the <a href="https://github.com/joonaspaakko/audible-library-extractor/issues">Github issues</a> page.
	</div>
	
</div>
</template>

<script>
export default {
	name: 'aleSplashscreen',
  data () {
		return {
			storageDataExists: null,
			btns: {
				update: null,
				output: null,
				extract: null
			},
			nextStep: null
		}
  },
	mounted: function() {
		
		var comp = this;
		comp.storageDataExists = comp.$root.$data.storageDataExists;

	},
	
	methods: {
		
		takeNextStep: function( step ) {
			this.nextStep = step;
			this.$root.$emit('nextStep', step);
		}
		
	}
}
</script>

<style lang="scss" scoped>
.info-wrap.top {
  display: none;
  margin-top: 30px;
}
.btns-one-wrap {
	margin-top: 45px;
  button.extract {
    .icon {
      font-size: 1.2em;
    }
    > * {
      position: relative;
      top: -2px;
    }
  }
}
div.btns-two-wrap {
  margin-top: 6px;
  justify-content: center;
  button.update {
    width: 85px;
  }
  button.output {
    width: 96px;
  }
}
.info-wrap.bottom {
  margin-top: 50px;
  line-height: 1.3em;
}
</style>
