<template>
  <div id="ale-menu-actions">
		
    <ale-save-locally v-if="!general.standalone" :library="library"></ale-save-locally>
  
    <div class="text-button gallery-page">
      <router-link :to="{ name: 'ale-gallery' }">
        <div class="icon">
          <font-awesome-icon fas icon="home" />
          <span>Library</span>
          <!-- <font-awesome-icon fas icon="th" />
          <span>Gallery</span> -->
        </div>
      </router-link>
    </div>
  
    <div class="text-button categories-page">
      <router-link :to="{ name: 'ale-categories' }">
        <div class="icon">
          <font-awesome-icon fas icon="list" />
          <span>Categories</span>
        </div>
      </router-link>
    </div>
  
    <div class="text-button categories-page">
      <router-link :to="{ name: 'ale-all-series' }">
        <div class="icon">
          <font-awesome-icon fas icon="list" />
          <span>Series</span>
        </div>
      </router-link>
    </div>
    
    <div class="text-button categories-page">
      <!-- <router-link :to="{ name: 'ale-categories' }"> -->
        <div class="icon">
          <font-awesome-icon fas icon="list" />
          <span>Collections</span>
        </div>
      <!-- </router-link> -->
    </div>
    
    <div class="text-button spreadsheet-page">
      <router-link :to="{ name: 'ale-spreadsheet' }" @click.native="navigateToSpreadsheet">
        <div class="icon">
          <font-awesome-icon v-if="general.loadingSpreadsheet" icon="spinner" spin />
          <font-awesome-icon v-else fas icon="table" />
          <span>Spreadsheet</span>
        </div>
      </router-link>
    </div>
    
    <div class="light-switch">
      <div
        class="icon"
        @click="lightSwitchToggle"
        :content="'Toggle '+ (this.general.lightSwitch ? '<strong>light</strong>' : 'light') +' and '+ (!this.general.lightSwitch ? '<strong>dark</strong>' : 'dark') +' theme'"
        v-tippy="{ placement: 'top',  arrow: true }"
      >
        <font-awesome-icon fas :icon="lightSwitchIcon" />
      </div>
    </div>
    
    <div class="save-csv"
      content="<strong>Download the spreadsheet as a CSV file.</strong> <br>Cells print out in plain text form, which means that none of the hyperlinks are included in the export."
      v-tippy="{ placement: 'top',  arrow: true }"
      v-if="this.general.route && this.general.route.name === 'ale-spreadsheet'"
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
  props: ['general', 'library'],
	components: {
		aleSaveLocally
	},
  computed: {
    lightSwitchIcon: function() {
      return this.general.lightSwitch ? 'sun' : 'moon';
    },
  },
  
  methods: {
    
    csvExportStarted: function() {
      
      Eventbus.$emit('csvExportStarted', {
        from: 'aleMenuActions'
      });
      
    },
    
    lightSwitchToggle: function() {
      this.general.lightSwitch = this.general.lightSwitch ? 0 : 1;
      $('html').removeClass('theme-light theme-dark');
      $('html').addClass( !this.general.lightSwitch ? 'theme-dark' : 'theme-light' );
    },
    
    navigateToSpreadsheet: function() {
      
      this.general.loadingSpreadsheet = true;
      
    },
    
  }
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';

#ale-menu-actions {
  text-align: center;
  // display: flex;
  // flex-direction: row;
  // align-items: center;
  // justify-items: center;
  // align-content: center;
  // justify-content: center;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  margin: 40px 0 45px;

  &, a {
    text-decoration: none;
    color: #333;
  }
  
  > div {
    line-height: 3em;
    display: inline-block;
    margin-left: 10px;
    &:first-child { margin-left: 0px; }
  }
  
  .icon {
    cursor: pointer;
    // cursor: default !important;
    background: #fff;
    border-radius: 999999px;
    outline: none;
    
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-items: center;
    align-content: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    box-shadow: 2px 0px 13px rgba(#000, .5);
  }
  
  .text-button {
    
    a.router-link-active .icon [data-icon] {
      @include themify($themes) {
        color: themed(audibleOrange);
      } 
    }
    
    .icon {
      width: auto;
      padding: 0 12px;
      > span {
        padding-left: 6px;
      }
    }
    
  }
  
}

</style>
