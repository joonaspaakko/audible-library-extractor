<template>
<div class="settings-wrapper box panel" animation="slide">
	<div class="extract-settings">
		<div class="settings-heading">
			<span class="title is-4">Extraction Settings</span>
		</div>
		
		<!-- <div style="font-size: 12px; line-height: 13px; margin: 6px 0 0 0; color: #888;">
			Previously extracted data is retained as long as you don't overwrite it with new data.
		</div> -->
		
		<div class="row is-0 setting-checkboxes">
			<div 
				v-for="(setting, index) in $store.getters.settings_mainSteps" 
				:key="setting.name" 
				:class="{ 
					checked: setting.value,
					unchecked: !setting.value,
				}"
			>
				
				<cont-extraction-setting 
				:class="{ 
					'partial-extraction': store.storageHasData[ setting.name ],
				}"
				:index="index" 
				:settings="$store.getters.settings_mainSteps" 
				:setting="setting" 
				/>
				
			</div>
		</div> <!-- setting-checkboxes -->
		
		<label class="checkbox is-small is-dark no-selection">
			<input style="width: 0px; height: 0px; position: absolute; top: -1px; left: -1px; overflow: hidden; opacity: 0;" type="checkbox" v-model="saveStandaloneAfter.value">
			
			<span style="vertical-align: middle; padding-right: 5px;">
				<tabler-checkbox v-if="saveStandaloneAfter.value" />
				<ion-android-checkbox-outline-blank v-else />
			</span>
			<span>
				{{ saveStandaloneAfter.label }}
			</span>
		</label>
		
    <cont-extraction-actions />
    
	</div>
</div>
</template>
 
<script>
export default {
	data: function() {
		return {
			store: this.$store.state,
		};
	},
	
	computed: {
		
    saveStandaloneAfter: function() {
      return _.find( this.store.extractSettings, { name: 'saveStandaloneAfter' });
    },
		
	},
	
	methods: {
		
    checkBrowser: function() {
      this.isFirefox = browser.runtime.getURL('').startsWith('moz-extension://');
      this.isChrome = browser.runtime.getURL('').startsWith('chrome-extension://');
    },
    
	}
}
</script>

<style scoped src="@node/bulma/css/bulma.css"></style>

<style scoped lang="scss">

	.settings-wrapper > .extract-settings {
		margin-bottom: 0 !important;
	}
	
	// .row {
	// 	display: flex;
	// 	flex-direction: row;
	// 	> div {
	// 		padding-left: 20px;
	// 		&:first-child { padding-left: 0; }
	// 	}
	// }
	
</style>