<template>
  <div v-if="showModal" class="modal-overlay">
    
    <n-config-provider :theme="darkTheme" class="modal-content">
      
      <h2 class="heading">
        Select a starting point
      </h2>
      
      <div class="flex-row">
        
        <div class="card">
          <div class="image">
            <img src="@editor-images/wallpaper.jpg" alt="">
          </div>
          <div class="title">Desktop wallpaper</div>
          <div class="desc">
            Starts with a 1920x1080 canvas with a dark overlay so that icons can be seen on top of it.
          </div>          
          <div class="additional-settings">
            <n-checkbox v-model:checked="store.animatedWallpaperMode" size="large" label="Animated wallpaper" />
          </div>
          <div class="additional-settings full-width">
            <n-button type="primary">
              Start
            </n-button>
          </div>
        </div>
        
        <div class="card">
          <div class="image">
            <img src="@editor-images/card.jpg" alt="">
          </div>
          <div class="title">Card</div>
          <div class="desc">
            Great starting point for online posts and other generic images.
          </div>
          <div class="additional-settings">
            <n-checkbox v-model:checked="store.tierListMode" size="large" label="Tier list" />
          </div>
          <div class="additional-settings full-width">
            <n-button type="primary">
              Start
            </n-button>
          </div>
        </div>
        
      </div>    
      
      <div class="footer">
        <small>
          These presets can be modified in the editor.
        </small>
      </div>
      
    </n-config-provider> <!-- .modal-content -->
    
  </div>
</template>

<script>

  import { 
    NConfigProvider, 
    darkTheme, 
    NModal,
    NCard,
    NSpace,
    NSwitch,
    NRadioButton,
    NRadioGroup,
    NTooltip,
    NCheckbox,
    NButton,
  } from 'naive-ui';
  
  export default {
    data() {
      return {
        store: this.$store.state,
        showModal: true,
        buttonGroupValue: null,
        darkTheme: darkTheme,
      }
    },
    components: {
      NConfigProvider, 
      NModal,
      NCard,
      NSpace,
      NSwitch,
      NRadioButton,
      NRadioGroup,
      NTooltip,
      NCheckbox,
      NButton,
    },
    
    computed: {
      animatedWallpaperMode: {
        get() {
          return this.store.animatedWallpaperMode;
        },
        set( newValue ) {
          this.$store.commit('update', { key: 'animatedWallpaperMode', value: newValue })
        },
      }
    },
    
    created () {
      console.log( darkTheme );
    },
    
    methods: {
        
      editorModeChanged: function( modeName, value ) {
        
        console.log( modeName, value )
        if ( modeName === 'animatedWallpaperMode' && value && this.store.canvasPreset !== 'wallpaper' ) {
          this.changeCanvasPreset('wallpaper');
        }
        else if ( modeName === 'tierListMode' ) {
          if ( value && this.store.canvasPreset !== 'card' ) {
            this.changeCanvasPreset('card');
            this.$store.commit('update', [
              { key: 'canvas.width', value: 3500 },
              { key: 'canvas.height', value: 0 },
              { key: 'coversPerRow', value: 14 },
            ]);
          }
          
          if ( !value ) {
            this.$store.commit('resetTiers');
            this.$store.commit('clearTiers');
          }
          
        }
        
        console.log('asdf', [
          { key: modeName, value: value },
          { key: modeName === 'animatedWallpaperMode' ? 'tierListMode' : 'animatedWallpaperMode', value: false },
        ])
        
        this.$store.commit('update', [
          { key: modeName, value: value },
          { key: modeName === 'animatedWallpaperMode' ? 'tierListMode' : 'animatedWallpaperMode', value: false },
        ]);
        
        // this.$nextTick(function() {
        //   this.zoomToFit();
        // });
        
        
      },
    
      changeCanvasPreset: function( preset ) {
        
        this.$store.commit("update", { key: "canvasPreset", value:  preset  });
        this.$store.commit('changePreset', preset);
        this.$store.commit('update', { 
          key: 'usedCovers', 
          value: this.store.covers.slice(0, this.store.coverAmount)
        });
        
        // this.$nextTick(function() {
        //   this.zoomToFit('and-center');
        // });
      
    },
      
    }
  }
  
</script>

<style lang="scss" scoped>
.modal-overlay {
  display: flex;
  justify-content: center !important;
  align-items: center !important;
  position: fixed !important;
  z-index: 99 !important;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(#000, .6);
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  user-drag: none;
}

.modal-content {
  text-align: center;
  max-width: 800px;
  background: #161e29;
  color: #fff;
  padding: 25px 50px;
  box-sizing: border-box;
  box-shadow: 0 2px 30px rgba(#000, .5);
  border: 1px solid rgba(#fff, .1);
  border-radius: 5px;
}

.flex-row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.card {
  cursor: default;
  margin-left: 30px; &:first-child { margin-left: 0; }
  border: 1px solid rgba(#fff, .2);
  border-radius: 5px;
  box-sizing: border-box;
  padding: 15px;
  text-align: center;
  transition: all 200ms ease;
  
  
  &:hover {
    box-shadow: 0 2px 25px rgba(#000, 1);
    background: rgba(#fff, .01);
    transform: scale(1.05);
    border-color: #ffbf2c;
  }
  
  .image {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    img {
      margin-bottom: 25px;
      width: 100%;
      height: auto;
      max-width: 250px;
      max-height: 100px;
      display: block;
      width:100%; 
      height:100%;
      object-fit: contain;
      box-shadow: 0 2px 15px rgba(#000, .9);
    }
  }
}

.title {
  font-size: 19px;
  line-height: 19px;
}
.desc {
  color: rgba(#fff, .6);
  padding-top: 12px;
  font-size: 13px;
  line-height: 16px;
}

.footer {
  margin-top: 20px;
  font-size: 13px;
  color: rgba(#fff, .5);
}

.additional-settings {
  margin-top: 25px;
}

.full-width {
  display: flex;
  justify-content: stretch;
  align-items: center;
  > * {
    flex: 1;
  }
}

</style>