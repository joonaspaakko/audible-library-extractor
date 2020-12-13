<template>
<div v-if="!nextStep" id="ale-spashscreen">
	
	<div class="extract-wrapper">
	
		<div class="extract-settings" v-if="settingsOpen">
			
			<p class="title is-4">Full Extraction Settings</p>
			<p class="title is-6">Extract:</p>
			<b-field grouped>				
				<b-checkbox v-for="setting in extractSettings" :key="setting.name" 
				:value="setting.value" 
				:disabled="setting.disabled" 
				:type="setting.type"
				v-tippy :content="setting.tippy"
				@input="settingChanged( $event, setting.name )"
				>
					{{ setting.label }}
				</b-checkbox>
			</b-field>
			
			<b-message class="description">
				If you are planning to save the library as a stand-alone website, you can choose to leave out collections and wishlist in the export process later. ISBNs are merged with the library books and can't be removed.
			</b-message>
			
		</div>
		<b-field class="extract-btns">
			
			<b-button @click="takeNextStep('extract')" type="is-info" class="extract control" icon-right="arrow-alt-circle-down" icon-pack="far" expanded size="is-large">
				Start extracting
			</b-button>
			<div class="control">
				<b-button @click="settingsOpen = !settingsOpen" type="is-dark" class="settings" :class="{ open: settingsOpen }" icon-right="cog" icon-pack="fas" size="is-large"></b-button>
			</div>
			
		</b-field>
	</div>

	<b-field class="other-btns">	
		<b-button :disabled="!storageHasData" @click="takeNextStep('update')" class="control" size="is-small" icon-right="sync-alt" icon-pack="fas" v-tippy content="A faster scan that fetches all data for new books and only deletes or updates the progress and rating for old books. You need to have done the full scan at least once to use this.">
			Partial extraction
		</b-button>
		<b-button :disabled="!storageHasData" @click="takeNextStep('output')" class="control" size="is-small" icon-right="share-square" icon-pack="fas" v-tippy content="Skips scanning and does sraight to the gallery. You need to have done the full scan at least once to use this.">
			Output page
		</b-button>
	</b-field>

	<div class="info-wrap bottom content is-small has-text-grey-light">
			Find more information in the <a href="https://github.com/joonaspaakko/audible-library-extractor">Github repository</a> page. <br />
			Post issues, questions, and suggestion at: <a href="https://github.com/joonaspaakko/audible-library-extractor/issues">Github issues</a>. 
	</div>
	
</div>
</template>

<script>
import Vue from 'vue';



// FONTAWESOME
import { library } from '@fortawesome/fontawesome-svg-core';
import { faShareSquare, faSyncAlt, faTimes, faCog, } from '@fortawesome/free-solid-svg-icons';
import { faArrowAltCircleDown, } from '@fortawesome/free-regular-svg-icons';
library.add( faShareSquare, faSyncAlt, faArrowAltCircleDown, faTimes, faCog );
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
Vue.component('font-awesome', FontAwesomeIcon);

// VUE-TIPPY
import VueTippy, { TippyComponent } from "vue-tippy";
Vue.use(VueTippy, {
  arrow: true,
  placement: 'top',
  trigger: "mouseenter focus",
  theme: 'light-border',
  zIndex: 9999999991,
  maxWidth: 370,
  onShow: (options) => { return !!options.props.content },
  boundary: 'viewport',
  flipDuration: 0,
});
Vue.component("tippy", TippyComponent);
import "tippy.js/themes/light-border.css";

import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
Vue.use(Buefy, {
  defaultIconComponent: 'font-awesome',
  defaultIconPack: 'fas',
});


export default {
	name: 'splashscreen',
	props: ['storageHasData'],
  data () {
		return {
			settingsOpen: false,
			nextStep: null,
			extractSettings: [
				{ name: 'library', 		 value: true,  label: 'Library', 		  type: 'is-success', disabled: true, },
				{ name: 'storePage', 	 value: true,  label: 'Store Pages',  type: 'is-success', disabled: true, },
				{ name: 'seriesOrder', value: true,  label: 'Series Order', type: 'is-success', disabled: true, },
				{ name: 'collections', value: true,  label: 'Collections',  type: 'is-success', disabled: false, },
				{ name: 'isbn', 			 value: false, label: 'ISBN', 			  type: 'is-danger',  disabled: false, tippy: "<strong>Slow process.</strong> Attempts to fetch ISBNs for every book in your library. Goodreads uses ISBNs when books are imported from a CSV file." },
				{ name: 'wishlist', 	 value: false, label: 'Wishlist', 	  type: 'is-danger',  disabled: false, tippy: "<strong>Slow process.</strong> Increases the filesize by quite a lot if you have a large wishlist." },
			],
		}
  },
	
	methods: {
		
		takeNextStep: function( step ) {
			this.nextStep = step;
			this.$root.$emit('nextStep', {
				step: step,
				config: _.map( this.extractSettings, function( o ) {
					return { name: o.name, value: o.value };
				}),
			});
		},
		
		settingChanged: function( inputValue, inputName ) {
			const currentSetting = _.find( this.extractSettings, { name: inputName });
			currentSetting.value = inputValue;
		}
		
	}
}
</script>

<style lang="scss">

#ale-spashscreen {
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

	.extract-wrapper {
		margin-top: 35px;
		.extract-btns {
			display: inline-flex;
			width: 100%;
			max-width: 300px;
			button.extract {
				padding: 5px 15px 4px !important;
				border-radius: 4px 0 0 4px;
			}
			.settings.open {
				color: #f19933;
			}
		}
	}
	
	.extract-settings {
		padding-top: 25px;
		max-width: 650px;
		margin: 0 auto 20px auto;
		border: 2px solid #e1e1e1;
		border-radius: 6px;
		
		span.check {
			top: -1px;
			position: relative;
		}
		
		.title {
			&.is-4 {
				margin-bottom: 2px;
			}
			&.is-6 {
				margin-bottom: 7px;
				color: #666;
			}
		}
		.field {
			justify-content: center;
		}
		.description {
			margin-top: 20px;
			.message-body {
				border: none !important;
			}
		}
	}
	.other-btns {
		max-width: 300px;
		margin: 6px auto 0;
		button {
			height: auto;
			padding-top: 9px;
			padding-bottom: 9px;
			flex-grow: 1;
		}
	}
	
	.info-wrap.bottom {
		margin-top: 50px;
		line-height: 1.3em;
	}

}
</style>
