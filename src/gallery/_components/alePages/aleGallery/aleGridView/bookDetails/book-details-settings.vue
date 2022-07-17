<template>
<div class="settings-outer-wrapper">
  
  <div class="tabs">
    <h3 @click="showSettings = true" :class="{ active: showSettings }">Settings</h3>
    <h3 @click="showSettings = false" :class="{ active: !showSettings }">Shortcuts</h3>
  </div>
    
  <div>
    
    <div class="settings-wrapper" v-if="showSettings">
      
      <div class="setting" v-for="setting in settings" :key="setting.label" :class="{ disabled: !setting.enabled }">
        
        <div class="heading" v-if="setting.type === 'heading'">
          <h3>{{ setting.label }}</h3>
        </div>
        
        <div class="divider" v-else-if="setting.type === 'divider'"></div>
        <div v-else class="inner-wrapper">
          
          <label>
            <input type="checkbox" :checked="setting.value" @change="setting.event" :disabled="!setting.enabled">
            <div class="visual-checkbox">
              <div class="switch"></div>
            </div>
            <div class="label-text">
              <span>{{ setting.label  }}</span>
            </div>
          </label>
          
          <font-awesome 
          class="more-info-icon" 
          v-if="setting.info" 
          v-tippy="{ trigger: 'mouseenter focus click', hideOnClick: false, delay: 0, placement: 'right', flipBehavior: ['right', 'top', 'left', 'bottom'], allowHTML: true, }" 
          :content="setting.info" 
          :icon="['fas', 'question-circle']" 
          />
        </div>
        
        
      </div>
      
    </div>
    
    <div class="shortcuts-wrapper" v-else>
      <table>
        <tr>
          <th>description</th>
          <th>shortcut</th>
        </tr>
        <tr>
          <td>Close</td>
          <td>Esc</td>
        </tr>
        <tr>
          <td>Open adjacent book</td>
          <td>Arrow Keys</td>
        </tr>
        <tr>
          <td>Open adjacent book</td>
          <td>TAB & Shift+TAB</td>
        </tr>
        <!-- <tr>
          <td>Open book in Audible's mobile app (or website)</td>
          <td>Long press book cover (grid view only)</td>
        </tr> -->
      </table>
    </div>
      
  </div>
</div>
</template>

<script>
export default {
  name: "bookDetailsSettings",
  data: function() {
    const vue = this;
    const store = this.$store.state;
    const sticky = this.$store.state.sticky;
    return {
      showSettings: true,
      settings: [
        
        { type: 'heading', label: 'Grid book cover' },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show sample play button', 
          info: '<img src="images/info/sample-play-button.jpg" class="tippy-info-image" />',
          value: sticky.bookDetailSettings.playButton,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.playButton', value: e.target.checked });
          },
        },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show blurb on hover', 
          info: 'This is never visible on mobile <br/><img src="images/info/blurb-hover-corner.jpg" class="tippy-info-image" />',
          value: sticky.bookDetailSettings.blurb,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.blurb', value: e.target.checked });
          },
        },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show whispersync (owned) indicator', 
          info: '<img src="images/info/cover-whispersync-indicator.jpg" class="tippy-info-image" />',
          value: sticky.bookDetailSettings.whispersync,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.whispersync', value: e.target.checked });
          },
        },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show plus catalog indicator', 
          info: '<img src="images/info/cover-plus-calatog-indicator.jpg" class="tippy-info-image" />',
          value: sticky.bookDetailSettings.plusCatalog,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.plusCatalog', value: e.target.checked });
          },
        },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show favorite indicator', 
          info: '<strong>The RED dot</strong><br><img src="images/info/cover-favorite-finished-indicators.jpg" class="tippy-info-image" />',
          value: sticky.bookDetailSettings.favorite,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.favorite', value: e.target.checked });
          },
        },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show finished indicator', 
          info: '<strong>The GREEN dot</strong><br><img src="images/info/cover-favorite-finished-indicators.jpg" class="tippy-info-image" />',
          value: sticky.bookDetailSettings.finished,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.finished', value: e.target.checked });
          },
        },
        { type: 'divider' },
        
        { type: 'heading', label: 'Above summary' },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Prefer short title', 
          info: "Short title is used if available (newly extracted data since v.0.2.9). Subtitle is shown below with a smaller font similar to Audible store pages. <br/><br/><strong>In case subtitle is not available, the full title is shown below instead, so you always get to see the full title either way.</strong><br/><br/><img src='images/info/prefer-short-title.jpg' class='tippy-info-image' />",
          value: sticky.bookDetailSettings.titleShort,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.titleShort', value: e.target.checked });
            vue.$nextTick(() => {
              vue.$root.$emit("resizeSummary");
            });
          }
        },
        { type: 'divider' },
        { type: 'heading', label: 'Sidebar' },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show sidebar', 
          info: '<strong>The entire sidebar!</strong> <br><img src="images/info/sidebar.jpg" class="tippy-info-image" />',
          value: sticky.bookDetailSettings.sidebar.show,
          event: function( e ) {
            
            const checked = e.target.checked;
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.sidebar.show', value: checked });
            vue.$nextTick(() => {
              vue.$root.$emit("resizeSummary");
            });
            
            vue.mutateChildren( 'sidebar', 'enabled', checked );
            
          },
          init: function( setting ) {
            vue.mutateChildren( 'sidebar', 'enabled', sticky.bookDetailSettings.sidebar.show );
          }
        },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show book cover', 
          parent: 'sidebar',
          info: 'There is also an easy access toggle swith on the left side of the sidebar (arrow up) <br><img src="images/info/sidebar-cover.jpg" class="tippy-info-image" />',
          value: !sticky.bookDetailsCollapsedCover,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailsCollapsedCover', value: !e.target.checked });
            vue.$nextTick(() => {
              vue.$root.$emit("resizeSummary");
            });
          },
        },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show icon toolbar', 
          parent: 'sidebar',
          info: '<img src="images/info/sidebar-toolbar.jpg" class="tippy-info-image" />',
          value: sticky.bookDetailSettings.sidebar.iconToolbar,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.sidebar.iconToolbar', value: e.target.checked });
            vue.$nextTick(() => {
              vue.$root.$emit("resizeSummary");
            });
          },
        },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show main details', 
          parent: 'sidebar',
          info: 'There is also an easy access toggle swith on the left side of the sidebar (arrow up) <br><img src="images/info/sidebar-main-info.jpg" class="tippy-info-image" />',  
          value: !sticky.bookDetailsCollapsedDetails,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailsCollapsedDetails', value: !e.target.checked });
            vue.$nextTick(() => {
              vue.$root.$emit("resizeSummary");
            });
          },
        },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show collections list', 
          parent: 'sidebar',
          info: 'If a book is in a collection... <br><img src="images/info/sidebar-collections-list.jpg" class="tippy-info-image" />',
          value: sticky.bookDetailSettings.sidebar.collectionsList,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.sidebar.collectionsList', value: e.target.checked });
            vue.$nextTick(() => {
              vue.$root.$emit("resizeSummary");
            });
          },
        },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show series list', 
          parent: 'sidebar',
          info: 'If a book is in a series... <br><img src="images/info/sidebar-series-list.jpg" class="tippy-info-image" />',
          value: sticky.bookDetailSettings.sidebar.seriesList,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.sidebar.seriesList', value: e.target.checked });
            vue.$nextTick(() => {
              vue.$root.$emit("resizeSummary");
            });
          },
        },
        { type: 'divider' },
        
        { type: 'heading', label: 'Bottom of the details view' },
        { 
          enabled: true,
          type: 'checkbox', 
          label: 'Show carousel', 
          info: '<img src="images/info/carousel.jpg" class="tippy-info-image" />',
          value: sticky.bookDetailSettings.carousel,
          event: function( e ) {
            vue.$store.commit('prop', { key: 'sticky.bookDetailSettings.carousel', value: e.target.checked });
          },
        },
        
      ],
    };
  },
  
  created: function() {
    
    const hasPreps = _.filter( this.settings, 'init');
    _.each(hasPreps, function( setting ) {
      setting.init( setting );
    });
    
    this.dividerIds();
    
  },
  
  mounted: function() {
    this.$nextTick(function() {
      this.setMinHeight();
    });
  },
  
  methods: {
    
    // Mutate a prop in children or items where "location" matches input "itemKey"
    mutateChildren: function( itemKey, propKey, value ) {
      
      const children = _.filter(this.settings, { parent: itemKey });
      _.each( children, function( child ) {
        child[ propKey ] = value;
      });
      
    },
    
    dividerIds: function() {
      
      const dividerStr = 'divider';
      const dividers = _.filter( this.settings, { type: dividerStr });
      _.each(dividers, function( divider, index ) {
        divider.label = dividerStr +'-'+ index;
      });
      
    },
    
    setMinHeight: function() {
      
      const contentHeight = this.$el.offsetHeight;
      const minHeightSet = this.$store.state.sticky.bookDetailSettings.minHeight;
      this.$store.commit('prop', { key: 'sticky.bookDetailSettings.minHeight', value: contentHeight + 'px' });
      
    },
  }
  
};
</script>

<style>
.tippy-info-image {
  max-width: 300px;
  max-height: 300px;
  width: 100%;
  height: auto;
}
</style>

<style lang="scss" scoped>
@import "~@/_variables.scss";

.settings-outer-wrapper {
  overflow: auto;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;  
  > div { display: inline-block; }
}

.tabs {
  text-align: left;
  padding-bottom: 20px;
  h3 {
    cursor: pointer;
    @extend .no-selection;
    display: inline-block;
    margin: 0;
    padding: 5px 10px;
    text-align: left;
    @include themify($themes) {
      // background: rgba(themed(frontColor), 0.1);
      border: 1px solid rgba(themed(frontColor), 0.2);
      // box-shadow: themed(shadowMedium);
      
      border-bottom: 4px solid rgba(themed(frontColor), .6);
      &.active {
        border-bottom: 4px solid themed(audibleOrange);
      }
    }
  }
}

.shortcuts-wrapper,
.settings-wrapper {
  @extend .no-selection;
  padding: 10px;
  position: relative;
  margin-top: 0px;
}

.setting {
  position: relative;
  z-index: 0;
  &, 
  & > div {
    display: flex; 
    flex-direction: row;
    align-items: flex-start;
  }
  padding-top: 15px;
  &:first-child { padding-top: 0; }
  label {
    display: flex; 
    flex-direction: row;
    align-items: flex-start;
    cursor: pointer;
  }
  input {
    z-index: 1;
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
    top: 0;
    left: 0;
    outline: none;
  }
  > div > div {
    display: inline-block;
  }
  .divider {
    height: 0px;
    width: 100%;
    @include themify($themes) {
      border-top:    1px solid rgba(themed(backColor), .9);
      border-bottom: 1px solid rgba(themed(frontColor), .15);
    }
  }
  .heading h3 {
    margin: 0;
    margin-top: 15px;
  }
  .outer-wrapper {
    display: flex; 
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
  .inner-wrapper {
    display: flex; 
    flex-direction: row;
    align-items: center;
    // white-space: nowrap;
  }
}

.visual-checkbox {
  margin-right: 10px;
  width: 50px;
  height: 20px;
  border-radius: 999999px;
  display: inline-flex !important;
  justify-content: flex-start;
  align-items: center;
  @include themify($themes) {
    background: themed(backColor);
    border: 1px solid rgba(themed(frontColor), .3);
    .switch {
      margin: 2px;
      width: 16px;
      height: 16px;
      background: themed(frontColor);
      border-radius: 999999px;
      transition: all 200ms cubic-bezier(0, 0, 0, .1);
    }
  }
}

input:checked ~ .visual-checkbox {
  @include themify($themes) {
    .switch {
      margin-left: 32px;
      background: themed(audibleOrange);
    }
  }
}

.label-text {
  transition: all 200ms cubic-bezier(0, 0, 0, .1);
  display: inline-flex; 
  flex-direction: row;
  align-items: flex-start;
  text-align: left;
  // white-space: nowrap;
}
.more-info-icon {
  outline: none;
  cursor: pointer;
  // margin-left: 6px;
  padding:  5px 15px 5px 10px;
  @include themify($themes) {
    color: rgba(themed(frontColor), .5);
    &:hover {
      color: themed(audibleOrange);
    }
  }
}

.disabled.setting {
  // cursor: not-allowed !important;
}
.disabled .visual-checkbox {
  @include themify($themes) {
    background: rgba(themed(backColor), .7);
    .switch {
      margin-left: 2px !important;
      background: rgba(themed(frontColor), .5) !important;
    }
  }
}
.disabled .label-text {
  opacity: .4 !important;
}


table {
  @include themify($themes) {
    width: 100%;
    border-spacing: 0;
    background: rgba(themed(backColor), 0.4);
    border: 1px solid rgba(themed(frontColor), 0.3);
    th {
      font-weight: bold;
    }
    th, td {
      border: 1px solid rgba(themed(frontColor), 0.1);
      padding: 5px 8px;
      
      &:first-child {
        text-align: left;
      }
    }
  }
}

</style>
