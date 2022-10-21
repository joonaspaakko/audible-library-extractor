<template>
<div class=" settings-wrapper box panel" animation="slide">
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
					'partial-extraction': (store.storageHasData.books && setting.name == 'library') || (store.storageHasData.wishlist && setting.name === 'wishlist') || (store.storageHasData.isbn && setting.name === 'isbn'),
					checked: setting.value,
					unchecked: !setting.value,
				}"
			>
				
				<cont-extraction-setting 
				:index="index" 
				:settings="$store.getters.settings_mainSteps" 
				:setting="setting" 
				/>
				
			</div>
		</div> <!-- setting-checkboxes -->
		
		<!-- <label class="checkbox is-small is-dark">
			<input type="checkbox" v-model="saveStandaloneAfter.value">
			{{ saveStandaloneAfter.label }}
		</label> -->
		
		<div class="description">
			<!-- You can fetch <b-tag type="is-warning">collections</b-tag> and <b-tag type="is-warning">wishlist</b-tag> now and discard them later when saving the gallery as a stand-alone website. <b-tag type="is-warning">ISBNs</b-tag> are merged with the library books and can't be removed later, not that there should be any need to do that. -->
			
			<div class="linky-links">
				<button class="button is-small" @click="unselectAll">unselect all</button>
				<button class="button is-small" @click="selectAll">select all</button>
				<button class="button is-small" @click="resetNewTitles" v-tippy="{ maxWidth: 400 }" content='<strong>Removes the status &#34;new&#34; from all extracted books.</strong> <br><br>During a partial library or wishlist extraction newly added books are marked and you can filter and sort based on that status in the gallery. <br><br><div style="color: #f14668;">The new status is only ever reset automatically when you clear library data or press this button.</div>'>reset new books</button>
				<button class="button is-small" :class="[ !rawDataExport ? 'is-warning' : null ]" @click="exportRawData" :disabled="!rawDataExport">Export raw data</button>
				<button class="button is-small">
					<label>
						Import raw data
						<input accept=".json" type="file" @change="importRawData" style="display:none">
					</label>
				</button>
				<button class="button is-small delete-btn" @click="clearStoredData">Remove all extracted data</button>
			</div>

		</div>
	</div>
</div>
</template>
 
<script>
import { saveAs } from 'file-saver';
import helpers from '@contscript-mixins/misc/helpers.js';
export default {
	data: function() {
		return {
			store: this.$store.state,
			exportRawDataDisabled: false,
		};
	},
	
	mixins: [ helpers ],
	
	computed: {
		
		rawDataExport() {
			return !this.exportRawDataDisabled && this.$store.getters.mainDataExists;
		},
		
    saveStandaloneAfter: function() {
      return _.find( this.extractSettings, { name: 'saveStandaloneAfter' });
    },
		
	},
	
	methods: {
		
		exportRawData: function() {
			let vue = this;
			vue.exportRawDataDisabled = true;
			browser.storage.local.get(null).then(data => {
				
				if ( data.chunks ) vue.glueFriesBackTogether( data );
				
				delete data.imageEditorPageTitle;
				delete data.imageEditorPageSubTitle;
				delete data.imageEditorTimeCode;
				delete data.imageEditorChunksLength;
				delete data.imageEditorChunks;
				
				saveAs(new Blob([JSON.stringify(data)], {type: "application/json;charset=utf-8"}), 'Audible Library Extractor Data.json');
				
				vue.exportRawDataDisabled = false;
				vue.$toast.success("Data exported succesfully!", {
					position: 'top',
					duration: 4000,
				});
			
			}).catch(function( err ) {
				console.log( err )
				
				vue.exportRawDataDisabled = false;
				vue.$toast.error("Data export failed. Reload the page and try again.", {
					position: 'top',
					duration: 4000,
				});
				
			});
		},
		
    importRawData: function( e ) {
      
      let vue = this;
      let file = e.target.files;
      if ( file ) file = file[0];
      
      vue.loading = true;
      
      if ( file ) {
        
        let errorNotification = function() {
					vue.loading = false; 
					vue.$toast.success("Data import failed...", {
						position: 'top',
						duration: 4000,
					});
        };
        
        let read = new FileReader();
        read.onload = function( e ) {
          
          let data = JSON.parse(e.target.result);
          vue.makeFrenchFries( data );
          
          browser.storage.local.clear().then(() => {
            browser.storage.local.set(data).then(function() {
              
							vue.$toast.success("Data imported succesfully!", {
								position: 'top',
								duration: 4000,
							});
								
              vue.updateViewData( data );
              
            }).catch(errorNotification);
          }).catch(errorNotification);
          
        };
        read.onerror = errorNotification;
        read.readAsText(file);
      }
      else {
        vue.loading = false; 
      }
    },
    	
		
	}
}
</script>

<style scoped src="@node/bulma/css/bulma.css"></style>

<style scoped lang="scss">
	.row {
		display: flex;
		flex-direction: row;
		> div {
			padding-left: 20px;
			&:first-child { padding-left: 0; }
		}
	}
</style>