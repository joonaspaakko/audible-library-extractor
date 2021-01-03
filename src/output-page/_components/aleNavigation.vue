<template>
  <div id="ale-navigation">
    
    <ale-save-locally v-if="!general.standalone" :library="library" :general="general"></ale-save-locally>
  
    <div class="text-button gallery-page">
      <router-link :to="{ name: 'ale-gallery' }">
        <div class="icon">
          <font-awesome fas icon="home" />
          <span>Library</span>
          <!-- <font-awesome fas icon="th" />
          <span>Gallery</span> -->
        </div>
      </router-link>
    </div>
  
    <div class="text-button categories-page">
      <router-link :to="{ name: 'ale-categories' }">
        <div class="icon">
          <font-awesome fas icon="list" />
          <span>Categories</span>
        </div>
      </router-link>
    </div>
  
    <div class="text-button categories-page">
      <router-link :to="{ name: 'ale-all-series' }">
        <div class="icon">
          <font-awesome fas icon="list" />
          <span>Series</span>
        </div>
      </router-link>
    </div>
    
    <div class="text-button categories-page">
      <!-- <router-link :to="{ name: 'ale-categories' }"> -->
        <div class="icon">
          <font-awesome fas icon="list" />
          <span>Collections</span>
        </div>
      <!-- </router-link> -->
    </div>
    
    <light-switch></light-switch>
    
    <div class="save-csv"
      content="<strong>Download the spreadsheet as a CSV file.</strong> <br>Cells print out in plain text form, which means that none of the hyperlinks are included in the export."
      v-tippy="{ placement: 'top',  arrow: true, theme: general.tippyTheme }"
      v-if="this.general.route && this.general.route.name === 'ale-spreadsheet'"
      @click="csvExportStarted"
    >
      <div class="icon">
        <font-awesome fas icon="file-csv" />
      </div>
    </div>
      
  </div>
</template>

<script>
import aleSaveLocally from './aleSaveLocally';
import lightSwitch from '@output-snippets/lightSwitch';

export default {
  name: 'aleMenuActions',
  props: ['general', 'library'],
	components: {
    aleSaveLocally,
    lightSwitch,
	},
  
  methods: {
    
    csvExportStarted: function() {
      
      Eventbus.$emit('csvExportStarted', {
        from: 'aleMenuActions'
      });
      
    },
    
  }
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';

#ale-navigation {
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
  position: fixed;
  z-index: 900;
  top: 0;
  right: 0;
  left: 0;
  // height: 30px;
  // line-height: 30px;
  @include themify($themes) {
    background: lighten( themed(backColor), 5);
  } 
  box-shadow: 2px 0px 13px rgba(#000, .5);
  padding: 10px 0;
  line-height: 0px;
    
  &, a {
    text-decoration: none;
    @include themify($themes) {
      color: rgba( themed(frontColor), .9 ) !important;
    } 
  }
  
  > div {
    display: inline-block;
    margin-left: 10px;
    &:first-child { margin-left: 0px; }
  }
  
  .icon {
    cursor: pointer;
    // cursor: default !important;
    border-radius: 999999px;
    outline: none;
    
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-items: center;
    align-content: center;
    justify-content: center;
    // width: 30px;
    // height: 30px;
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
