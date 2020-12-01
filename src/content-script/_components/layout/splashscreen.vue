<template>
<div v-if="!nextStep" id="ale-spashscreen">
	
	<div class="info-wrap top content is-medium"></div>
	
	<div class="btns-one-wrap">
		
		<button class="extract button is-medium is-info " @click="takeNextStep('extract')">
			<span>Start extracting</span>
			<span class="icon is-small">
				<font-awesome :icon="['far', 'arrow-alt-circle-down']" />
			</span>
		</button>
		
	</div>

	<div class="field has-addons btns-two-wrap">
		<p class="control" v-tippy content="A faster scan that fetches all data for new books and only deletes or updates the progress and rating for old books. You need to have done the full scan at least once to use this.">
			<button 
			class="update button is-small" :disabled="!storageHasData" 
			@click="takeNextStep('update')" 
			>
				<span class="icon is-small">
					<font-awesome :icon="['fas', 'sync-alt']" />
				</span>
				<span>Update</span>
			</button>
		</p>
		<p class="control" v-tippy content="Skips scanning and does sraight to the gallery. You need to have done the full scan at least once to use this.">
			<button 
			class="output button is-small" 
			:disabled="!storageHasData" 
			@click="takeNextStep('output')" 
			>
				<span class="icon is-small">
					<font-awesome :icon="['fas', 'share-square']" />
				</span>
				<span>Gallery page</span>
			</button>
		</p>
	</div>

	<div class="info-wrap bottom content is-small has-text-grey-light">
			Find more information in the <a href="https://github.com/joonaspaakko/audible-library-extractor">Github repository</a> page. <br />
			Post issues, questions, and suggestion at: <a href="https://github.com/joonaspaakko/audible-library-extractor/issues">Github issues</a>. 
	</div>
	
</div>
</template>

<script>
export default {
	name: 'splashscreen',
	props: ['storageHasData'],
  data () {
		return {
			btns: {
				update: null,
				output: null,
				extract: null
			},
			nextStep: null
		}
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
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/helpers/color.sass";
@import "bulma/sass/form/shared.sass";
@import "bulma/sass/form/tools.sass";
@import "bulma/sass/elements/content.sass";
@import "bulma/sass/elements/button.sass";

.info-wrap.top {
  display: none;
  margin-top: 30px;
}

.has-text-grey-light {
	a {
		text-decoration: underline;
		color: #b5b5b5;
	}
	a:visited {
		color: darken( #b5b5b5, 10);
	}
}

.btns-one-wrap {
	margin-top: 45px;
  button.extract {
		padding: 5px 15px 4px !important;
    .icon {
      font-size: 1.2em;
			position: relative;
			top: 1px;
			margin: 0 !important;
			margin-left: 6px !important;
    }
  }
}
div.field.has-addons.btns-two-wrap {
	margin: 0px !important;
  margin-top: 6px !important;
  justify-content: center;
	.control {
		margin-top: 0px !important;
		margin-bottom: 0px !important;
	}
  button.update {
    width: 88px;
  }
  button.output {
    width: 101px;
  }
}
.info-wrap.bottom {
  margin-top: 50px;
  line-height: 1.3em;
}
</style>
