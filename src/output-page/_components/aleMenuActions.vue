<template>
  <div id="ale-view-control">
		
	    <div class="views">
        <div
  	      class="icon"
  	      v-for="( view, index ) in views.array" :key="view.key"
  	      v-if="views.active.index === index"
  	      @click="changeGalleryView( index, view )"
          :content="'Switch gallery view: '+ getGalleryViewsTooltip "
          v-tippy="{ placement: 'top',  arrow: true, maxWidth: 410 }"
  	    >
  	      <font-awesome-icon fas :icon="view.key" />
  	    </div>
      </div>
      
      <div class="light-switch">
        <div
          class="icon"
          @click="lightSwitchToggle"
          :content="'Toggle '+ (this.views.lightSwitch ? '<strong>light</strong>' : 'light') +' and '+ (!this.views.lightSwitch ? '<strong>dark</strong>' : 'dark') +' theme'"
          v-tippy="{ placement: 'top',  arrow: true }"
        >
          <font-awesome-icon fas :icon="lightSwitchIcon" />
        </div>
      </div>
      
			<ale-save-locally v-if="!standalone" :library="library"></ale-save-locally>
      
      <div class="save-csv"
        content="<strong>Download the spreadsheet as a CSV file.</strong> Some contents may print out with the raw data, rather than what you're seeing in the table here."
        v-tippy="{ placement: 'top',  arrow: true }"
        v-if="this.views.array[ this.views.active.index ].name === 'spreadsheet'"
        @click="csvExportStarted"
      >
        <div class="icon">
          <font-awesome-icon fas icon="file-csv" />
        </div>
      </div>
      
  </div>
</template>

<script>
import aleSaveLocally from './aleSaveLocally'

export default {
  name: 'aleMenuActions',
  props: ['standalone', 'views', 'library'],
	components: {
		aleSaveLocally
	},
  computed: {
    lightSwitchIcon: function() {
      return this.views.lightSwitch ? 'sun' : 'moon';
    },
    
    getGalleryViewsTooltip: function() {
      const vue = this;
      const result = [];
      const currentView = vue.views.array[ vue.views.active.index ];
      _.forEach( this.views.array, function( view, key) {
        const isCurrent = view.name === currentView.name;
        result.push( isCurrent ? ('<strong>'+ view.name +'</strong>') : view.name );
      });
      return result.join(', ');
    }
  },
  
  methods: {
    
    csvExportStarted: function() {
      
      Eventbus.$emit('csvExportStarted', {
        from: 'aleMenuActions'
      });
      
    },
    
    lightSwitchToggle: function() {
      this.views.lightSwitch = this.views.lightSwitch ? 0 : 1;
      $('html').removeClass('theme-light theme-dark');
      $('html').addClass( !this.views.lightSwitch ? 'theme-dark' : 'theme-light' );
    },
    
    changeGalleryView: function( index, view ) {
      const viewsLength = this.views.array.length-1;
      const newIndex = index+1;
      this.views.active.index = newIndex > viewsLength ? 0 : newIndex;
      
    },
    
  }
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';

#ale-view-control {
  
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  align-content: center;
  justify-content: center;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  margin: 40px;
  
  
  > div {
    margin-left: 10px;
    &:first-child { margin-left: 0px; }
  }
  
  .icon {
    cursor: pointer;
    // cursor: default !important;
    background: #fff;
    border-radius: 999999px;
    outline: none;
    
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: center;
    align-content: center;
    justify-content: center;
    width: 30px;
    height: 30px;
		@include themify($themes) {
			box-shadow: 2px 0px 13px rgba(#000, .5);
		}
  }
}

</style>
