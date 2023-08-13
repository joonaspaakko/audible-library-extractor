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
				{ key: 'reset new books', disabled: function() { return !store.storageHasData.books; }, tippy: '<strong>Removes the status &#34;new&#34; from all extracted books.</strong> <br><br>During a partial library or wishlist extraction newly added books are marked and you can filter and sort based on that status in the gallery. <br><br><div style="color: #f14668;">The new status is only ever reset automatically when you clear library data or press this button.</div>' },
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
        vue.$store.commit('updateSetting', { item: setting, obj: { value: true, disabled: setting.name === 'books' } });
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
        
        chrome.storage.local.get(null).then(data => {
          
          _.each( _.range( 0, data[ 'books-chunk-length'] ), function( index ) { 
            
            let booksChunk = data[ 'books-chunk-'+index ];
            _.each( booksChunk, function( book ) { if (book.isNew) delete book.isNew; });
            
          });
          
          _.each( _.range( 0, data[ 'wishlist-chunk-length'] ), function( index ) { 
            
            let wishlistChunk = data[ 'wishlist-chunk-'+index ];
            _.each( wishlistChunk, function( book ) { if (book.isNew) delete book.isNew; });
            
          });
          
          chrome.storage.local.clear().then(() => {
            chrome.storage.local.set(data).then(() => {
            
              vue.$toast.success('All "new" books succesfully reset', vue.store.toastOpts);
              
            }).catch( errorNotification );
          }).catch( errorNotification );
          
        }).catch( errorNotification );
        
      }
      
    },
		
		exportRawData: function() {
			let vue = this;
			vue.exportRawDataDisabled = true;
			chrome.storage.local.get(null).then(data => {
				
				if ( data.chunks ) vue.glueFriesBackTogether( data );
				
				delete data.imageEditorPageTitle;
				delete data.imageEditorPageSubTitle;
				delete data.imageEditorTimeCode;
				delete data.imageEditorChunksLength;
				delete data.imageEditorChunks;
				
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
          
          chrome.storage.local.clear().then(() => {
            chrome.storage.local.set(data).then(function() {
              
              chrome.runtime.sendMessage({ action: "rebuild-context-menu" });
							vue.$toast.success("Data imported succesfully!", vue.store.toastOpts);
              vue.loading = false;
              vue.$dataChecker( data );
              
            }).catch(errorNotification);
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
        
        chrome.storage.local.clear().then(function() {
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
	
</style>