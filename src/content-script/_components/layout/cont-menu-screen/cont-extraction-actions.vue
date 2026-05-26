<template>
	<div class="description">
		<div class="linky-links">
      <div>
        <button 
          v-for="action in actions" :key="action.key"
          class="button is-small" 
          :class="action.extraClasses"
          @click="action.inputEvent ? null : clickEvent( action, $event )"
          v-tippy="{ maxWidth: 400 }" :content="action.tippy"
          :disabled="action.disabled && action.disabled()"
        >
          <label>
            {{ action.key }}
            <input v-if="action.inputEvent" accept=".json" type="file" @change="clickEvent( action, $event )" style="display:none">
          </label>
        </button>
        <button class="button is-small" @click="$store.commit('update', {  key: 'sticky.slowExtract', value: !store.sticky.slowExtract })">
          Extract&nbsp;<span v-if="store.sticky.slowExtract">slow</span> <span v-else>fast</span> &nbsp;
          <mdi-speedometer-slow class="has-text-info" v-if="store.sticky.slowExtract"/>
          <mdi-speedometer class="has-text-danger" v-else />
          <!-- <mdi-snail class="has-text-info" v-if="store.sticky.slowExtract"/>
          <mdi-rabbit class="has-text-danger" v-else /> -->
        </button>
      </div>
			
		</div>
	</div>
</template>
 
<script>
import { saveAs } from 'file-saver';
import helpers from '@contscript-mixins/misc/content-script-helpers.js';
export default {
	
	mixins: [ helpers ],
	
	data: function() {
    const vue = this;
    const store = this.$store.state;
		return {
			store: this.$store.state,
			exportRawDataDisabled: false,
			actions: [
				{ key: 'unselect all'},
				{ key: 'select all' },
				{ key: 'reset new books', disabled: function() { return !store.storageHasData.library; }, tippy: '<strong>Removes the status &#34;new&#34; from all extracted books.</strong> <br><br>During a partial library or wishlist extraction newly added books are marked and you can filter and sort based on that status in the gallery. <br><br><div style="color: #f14668;">The new status is only ever reset automatically when you clear library data or press this button.</div>' },
				{ key: 'export raw data', disabled: function() { return !vue.rawDataExport;  } },
				{ key: 'import raw data', inputEvent: true },
				{ key: 'remove all extracted data', extraClasses: 'delete-btn' },
			],
		};
	},
  
	computed: {
		rawDataExport() {
			return !this.exportRawDataDisabled && this.$store.getters.mainDataExists;
		},
  },
	
	methods: {
    
    clickEvent( action, e ) {
      
      const method = _.camelCase( action.key );
      this[ method ]( e );
      
    },
		
    unselectAll: function() {
      
      const vue = this;
      
      _.each( this.$store.getters.settings_mainSteps, function( setting, index ) {
        vue.$store.commit('updateSetting', { item: setting, obj: { value: false, disabled: false } });
      });
      
      this.$store.commit('update', {  key: 'extractionButtonDisabled', value: true });
      
    },
    
    selectAll: function() {
      
      const vue = this;
      
      _.each( this.$store.getters.settings_mainSteps, function( setting ) {
        vue.$store.commit('updateSetting', { item: setting, obj: { value: true, disabled: setting.name === 'library' } });
      });
      
      this.$store.commit('update', {  key: 'extractionButtonDisabled', value: false });
      
    },
		
    resetNewBooks: function() {
      
      let confirmation = window.confirm('Are you sure you want to clear new book status?');
      if ( confirmation ) {
        
        let vue = this;
        let errorNotification = function() {
          vue.loading = false; 
          vue.$toast.error({
            duration: 4000,
            message: 'Failed to remove "new" status from books',
            type: 'is-danger',
            position: 'is-top',
            closable: false,
          });
        };
        
        chrome.storage.local.get(['audibledata']).then(data => {

          const audibledata = data.audibledata || {};

          const stripIsNew = ( chunks ) => {
            _.each( _.flatten( chunks ), ( book ) => {
              _.unset( book, 'isNew' );
            });
          };

          stripIsNew( audibledata.library );
          stripIsNew( audibledata.wishlist );

          chrome.storage.local.set({ audibledata }).then(() => {

            vue.$toast.success('All "new" books succesfully reset', vue.store.toastOpts);

          }).catch( errorNotification );

        }).catch( errorNotification );
        
      }
      
    },
		
		exportRawData: function() {
			let vue = this;
			vue.exportRawDataDisabled = true;
			chrome.storage.local.get(['audibledata', 'metadata']).then(data => {

				vue.glueFriesBackTogether( data );

				saveAs(new Blob([JSON.stringify(data)], {type: "application/json;charset=utf-8"}), 'Audible Library Extractor Data.json');

				vue.exportRawDataDisabled = false;
				vue.$toast.success("Data exported succesfully!", vue.store.toastOpts);

			}).catch(function( err ) {

				vue.exportRawDataDisabled = false;
				vue.$toast.error("Data export failed. Reload the page and try again.", vue.store.toastOpts);

			});
		},
		
    importRawData: function( e ) {
      
      let vue = this;
      let file = e.target.files;
      if ( file ) file = file[0];
      
      // Importing the same file again is possible with this
      // It's a little silly, but from the users point of view it looks like something is broken otherwise...
      e.target.value = null;
      
      if ( file ) {
        
        vue.loading = true;
        
        let errorNotification = function( e ) {
					vue.loading = false; 
					vue.$toast.error("Data import failed: " + e, vue.store.toastOpts);
        };
        
        let read = new FileReader();
        read.onload = function( e ) {
          
          let data = JSON.parse(e.target.result);
          vue.makeFrenchFries( data );

          chrome.storage.local.set({
            metadata: data.metadata,
            audibledata: data.audibledata,
          }).then(function() {

            chrome.runtime.sendMessage({ action: "rebuild-context-menu" });
						vue.$toast.success("Data imported succesfully!", vue.store.toastOpts);
            vue.loading = false;
            vue.$dataChecker( data );

          }).catch(errorNotification);
          
        };
        read.onerror = errorNotification;
        read.readAsText(file);
      }
      
    },
    	
    removeAllExtractedData: function() {
      let vue = this;
      let confirmation = window.confirm('Are you sure you want to remove all extracted data?');
      if ( confirmation ) {
        
        let errorNotification = function( e ) {
          vue.loading = false; 
          vue.$toast.error('Data clear failed: ' + e, vue.store.toastOpts);
        };
        
        chrome.storage.local.remove(['audibledata', 'metadata']).then(function() {
          chrome.storage.local.get(null).then(data => {

            vue.$dataChecker(data);
            chrome.runtime.sendMessage({ action: "rebuild-context-menu" });
            vue.$toast.success('Data removed succesfully', vue.store.toastOpts);

          }).catch( errorNotification );
        }).catch( errorNotification );
      };
    },
		
	}
}
</script>

<style scoped src="@node/bulma/css/bulma.css"></style>

<style scoped lang="scss">
	.button {
    &, label {
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
    svg {
      font-size: 1.2em;
    }
  }
</style>