<template>
	<div class="field has-addons" style="margin: 5px;" v-tippy="{ allowHTML: true, interactive: true }" :content="setting.cannotAccessTippy">
		<!-- NUMBER -->
		<p class="control pointer">
			<button class="setting-numbers-wrapper button is-small" @click="settingChanged()">
				<div class="button">
					<span class="step-number">{{ index+1 }}</span>
				</div>
			</button>  
		</p>
		<!-- CHECKBOX -->
		<p class="control pointer">
			<button class="checbox-wrapper button is-small" @click="settingChanged()">
				<div class="button" :class="[ setting.value ? setting.type : null ]" :disabled="setting.disabled === false ? null : true">
					<zondicons-checkmark v-if="setting.value" />
					<ic-outline-circle v-else style="opacity: .7;"/>
				</div>
			</button>  
		</p>
		<!-- LABEL -->
		<p class="control full-width pointer" v-tippy :content="setting.tippy">
			<button class="button checkbox-btn is-small">
				<label class="checkbox">
					<input type="checkbox" :disabled="setting.disabled" :value="setting.value" @change="settingChanged()">
					{{ setting.label }}
				</label>
			</button>  
		</p>
		<!-- REMOVE -->
		<p class="control delete-btn" v-if="settingHasData" v-tippy :content="'Remove previously extracted data.' + ( setting.trashTippy ? '<br>' + setting.trashTippy : '' ) ">
			<button class="button is-small remove-individual-sections-icon" @click="deleteData( setting )">
				<span class="icon is-small">
					<bi-trash3/>
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
			return _.get(this.store.storageHasData, this.setting.name );
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
			
			console.log('update', update)
			
			this.$store.commit('updateSetting', update);
			
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
		padding: 0 17px;
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