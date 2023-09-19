<template>
	<div 
		class="field has-addons"
		:class="{ disabled: setting.disabled }"
		style="margin: 5px;" 
		v-tippy="{ allowHTML: true, interactive: true }" :content="setting.cannotAccessTippy"
		@click="notifier( setting )"
	>
		<!-- NUMBER -->
		<!-- <p class="control pointer">
			<button class="setting-numbers-wrapper button is-small" @click="settingChanged()" :disabled="settingDisabled">
				<div class="button">
					<span class="step-number">{{ index+1 }}</span>
				</div>
			</button>  
		</p> -->
		<!-- CHECKBOX -->
		<p class="control pointer">
			<button class="checbox-wrapper button is-small" @click="settingChanged()" :disabled="settingDisabled">
				<div class="button" :class="[ setting.value ? setting.type : null ]">
					<zondicons-checkmark v-if="setting.value" />
					<ic-outline-circle v-else style="opacity: .7;"/>
					<!-- <material-symbols-check-box v-if="setting.value" />
					<material-symbols-check-box-outline-blank v-else/> -->
				</div>
			</button>  
		</p>
		<!-- LABEL -->
		<p class="control full-width pointer" v-tippy :content="setting.tippy">
			<button class="button checkbox-btn is-small" :disabled="settingDisabled" @click="settingChanged()">
				<label class="checkbox">
					{{ setting.label }}
				</label>
			</button>  
		</p>
		<!-- REMOVE -->
		<p class="control delete-btn" v-if="settingHasData" v-tippy :content="'Remove previously extracted data.' + ( setting.trashTippy ? '<br>' + setting.trashTippy : '' ) ">
			<button class="button is-small remove-individual-sections-icon" @click="deleteChunkData( setting.deleteChunks || [setting.name] )">
				<span class="icon is-small">
					<bi-trash3/>
					<!-- <heroicons-outline-trash/> -->
				</span>
			</button>  
		</p>
	</div>
</template>
 
<script>
export default {
	props: [ 'index', 'settings', 'setting' ],
	data: function() {
		return {
			store: this.$store.state,
		};
	},
	
	computed: {
		settingHasData() {
			return _.get(this.$store.state.storageHasData, this.setting.name );
		},
		settingDisabled() {
			return this.setting.disabled === false ? null : true;
		},
	},
	
	methods: {
			
    settingChanged: function() {
			
			const setting = this.setting;
			const checked = !setting.value;
			const mainSteps = this.$store.getters.settings_mainSteps;
			const update = [];
			
			// Update event setting
			update.push({ 
				item: setting, 
				obj: { 
					value: checked 
				} 
			});
			
			// Update parent setting
			if ( setting.parent ) {
				
				const parent   = _.find(mainSteps, { name: setting.parent });
				const activeSibling = _.find(mainSteps, function( o ) {
					return o.parent === setting.parent && o.value && o.name !== setting.name;
				});
				
				const parentObj = {
					disabled: !!(checked || activeSibling),
				};
				
				if ( parentObj.disabled ) parentObj.value = true;
				
				update.push({ 
					item: parent, 
					obj: parentObj,
				});
				
			}
			
			this.$store.commit('updateSetting', update);
			
		},
    
    deleteChunkData: function( deleteArray, onSuccess ) {
      
      let vue = this; 
      vue.loading = true; 
			deleteArray = _.castArray(deleteArray);
      
      let confirmation = window.confirm('Delete "'+ this.setting.label +'" data?');
      if ( !confirmation ) return;
			
			let keysString = deleteArray.join(', ').replace('books', 'library');
      let errorMsg = "Failed to remove data for: <strong>" + keysString + "</strong>";
      let successMsg = "Successfully removed data for: <strong>" + keysString + "</strong>";
      
      let errorNotification = function( e ) {
        vue.loading = false; 
        vue.$toast.error( errorMsg + ' ('+ e +')', vue.toastOpts);
      };
      
      chrome.storage.local.get(null).then(data => {
        
        _.each( deleteArray, function( deleteKey ) {
          
          let realKey;
          if ( deleteKey === 'isbn' ) {
            deleteKey = 'books';
            realKey = 'isbn';
          }
          
          // REMOVE CHUNK ARRAYS
          _.each( _.range( 0, data[ deleteKey + '-chunk-length'] ), function( index ) { 
            if ( realKey === 'isbn' ) {
              _.each( data[ 'books-chunk-'+index ], function( book ) {
                if ( book.isbns ) delete book.isbns;
              });
            }
            else {
              delete data[ deleteKey + '-chunk-'+index ];
            }
          });
          
          if ( deleteKey !== 'books' || deleteKey === 'books' && realKey !== 'isbn' ) {
            // REMOVE CHUNK LENGTH
            delete data[deleteKey + '-chunk-length'];
            
            // REMOVE FROM CHUNKS ARRAY (basically array of data point keys)
            _.remove( data.chunks, function( value ) {
              return value === deleteKey;
            });
          }
          
          if ( deleteKey === 'books') {
            _.remove( data.chunks, function( value ) {
              return value === 'isbn';
            });
          }
          
          delete data.version[ deleteKey === 'books' ? 'library' : deleteKey ];
          
          if ( data.config && data.config.steps ) delete data.config.steps;
          
        });
        
        if ( data.chunks.length < 1 ) delete data.chunks;
        
        chrome.storage.local.clear().then(() => {
          chrome.storage.local.set(data).then(() => {
            
            if ( onSuccess ) onSuccess( data );
          
            chrome.runtime.sendMessage({ action: "rebuild-context-menu" });
            vue.$toast.success( successMsg, vue.store.toastOpts );
						vue.$dataChecker( data );
            
          }).catch( errorNotification );
        }).catch( errorNotification );
        
      }).catch( errorNotification );
      
    },
		
		notifier( setting ) {
			if ( setting.disabled ) {
				if ( setting.label === 'Library' ) {
					
					let collections = _.find(this.store.sticky.extractSettings, { value: true, name: 'collections' });
							collections = _.get(collections, 'label', '');
					let isbn = _.find(this.store.sticky.extractSettings, { value: true, name: 'isbn' });
							isbn = _.get(isbn, 'label', '');
							
					let stringArray = [ collections, isbn ];
							stringArray = _.compact(stringArray);
							stringArray = _.join(stringArray, ' and ');
					
					this.$toast.error( `<span>Uncheck <strong>${stringArray}</strong> to disable library.</span>`, this.store.toastOpts );
					
				}
			}
		},
		
	}
}
</script>

<style scoped src="@node/bulma/css/bulma.css"></style>

<style scoped lang="scss">
	
	.step-number {
		font-weight: bold;
	}
	
	.checkbox {
		padding: 0px 15px;
	}
	
	.checkbox input {
		position: absolute; 
		top: 0; 
		left: 0; 
		z-index: -1; 
		width: 1px; 
		height: 1px; 
		overflow: hidden; 
		opacity: 0;
	}
	
	.pointer * { cursor: pointer !important; }
 
</style>