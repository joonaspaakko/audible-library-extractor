<template>
  <div v-if="showModal" class="modal-overlay">
    
    <!-- <animated-wallpaper-app class="cover-bg"
      :editorCovers="store.covers"
      :editorCoverPadding="0"
      :editorCoverSize="win.height / 2"
      :editorCoversPerRow="14"
      :editorCanvasWidth="win.width"
      :editorCanvasHeight="win.height"
      :editorCanvasPaddingLeft="0"
      :editorCanvasPaddingTop="0"
      :editorCanvasPaddingRight="0"
      :editorCanvasPaddingBottom="0"
    /> -->
    
    <n-config-provider :theme="darkTheme" class="modal-content">
      
      <div class="close-btn" @click="$store.commit('update', { key: 'presetModalOpen', value: false })">
        <ion-close-round/>
      </div>
      
      <h2 class="heading">
        Select a starting point
      </h2>
      
      <div class="flex-row">
        
        <!-- LOOP CARDS -->
        <div 
          class="card"
          v-for="card in cards" :key="card.key"
          @mouseenter="card.enabled = true" 
          @mouseleave="card.enabled = false"
        >
          <!-- IMAGE -->
          <div class="image" v-if="card.images">
            <img draggable="false" :src="card.images.extras" alt="" v-if="card.images.extras">
            <img draggable="false" :src="card.images.regular" alt="" v-else>
          </div>
          <!-- TITLE -->
          <div class="title">{{ card.title }}</div>
          <!-- DESCRIPTION -->
          <div class="desc"> {{ card.desc }}</div> 
          <!-- EXtRA SETTINGS -->
          <div class="additional-settings">
            <n-checkbox 
              size="large" 
              v-for="extra in card.extras" :key="extra.label"
              v-model:checked="extra.checked" 
              :label="extra.label" 
              :disabled="!card.enabled" 
              @update:checked="extrasChecked( card, extra )"
            />
          </div>
          <div class="additional-settings full-width">
            <n-button type="primary" :disabled="!card.enabled" @click="cardChosen( card )">
              {{ card.startBtn || 'Start' }}
            </n-button>
          </div>
        </div>
        
      </div> <!-- .flex-row -->
      
      <!-- <div class="footer">
        <small>
        </small>
      </div> -->
      
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
  
  import image_wallpaper from '@editor-images/wallpaper.jpg';
  import image_wallpaper_animated from '@editor-images/wallpaper-animated.gif';
  import image_card from '@editor-images/card.jpg';
  import image_card_tierlist from '@editor-images/card-tierlist.jpg';

  export default {
    data() {
      
      const store = this.$store;
      
      return {
        store: this.$store.state,
        showModal: true,
        buttonGroupValue: null,
        darkTheme: darkTheme,
        win: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        cards: [
          {
            key: 'wallpaper',
            enabled: false,
            images: {
              regular: image_wallpaper,
              extras: null,
            },
            title: "Desktop wallpaper",
            desc: "Starts with a 1920x1080 canvas with a dark overlay so that icons can be seen on top of it.",
            method: ( card, vue ) => {
              
              vue.changeCanvasPreset( card.key );
              
            },
            extras: {
              animated: { 
                checked: false,
                label: 'Animated wallpaper',
                image: image_wallpaper_animated,
                method: ( card, extra, vue ) => {
                  
                  vue.$store.commit('update', { key: 'animatedWallpaperMode', value: true });
                  
                },
              },
            }
          },
          {
            key: 'card',
            enabled: false,
            images: {
              regular: image_card,
              extras: null,
            },
            title: "Card",
            desc: "Great starting point for online posts and other generic images.",
            method: ( card, vue ) => {
              
              this.changeCanvasPreset( card.key );
              
            },
            extras: {
              animated: { 
                checked: false,
                label: 'Tier list',
                image: image_card_tierlist,
                method: ( card, extra, vue ) => {
                  
                  vue.$store.commit('update', { key: 'tierListMode', value: true });
                  
                },
              },
            }
          },
        ],
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
    
    methods: {
      
      extrasChecked( card, extra ) {
        
        card.images.extras = extra.checked ? extra.image : null;
        
      },
      
      cardChosen( card ) {
        
        this.reset();
        
        const checkedExtras = _.filter( card.extras, { checked: true });
        if ( checkedExtras.length ) {
          console.log( checkedExtras )
          _.each( checkedExtras, ( extra ) => {
            
            if ( extra.method ) extra.method( card, extra, this );
            
          });
        }
        
        if ( card.method ) card.method( card, this );
        
        this.$store.commit('update', { key: 'presetModalOpen', value: false });
        
        this.$nextTick(function() {
          
          
          const coversMax = (this.store.covers|| []).length;
          const currentAmount = this.store.coverAmount;
          this.$store.commit('update', { key: 'coverAmount', value: currentAmount > coversMax ? coversMax : currentAmount });
          
        });
        
      },
      
      changeCanvasPreset: function( preset ) {
        
        this.$store.commit("update", { key: "canvasPreset", value:  preset  });
        this.$store.commit('changePreset', preset);
        this.$store.commit('update', { 
          key: 'usedCovers', 
          value: this.store.covers.slice(0, this.store.coverAmount)
        });
      
      },
    
      reset() {
        
        this.$store.commit('resetTiers');
        this.$store.commit('clearTiers');
              
        this.$store.commit('update', [
          { key: 'tierListMode', value: false },
          { key: 'animatedWallpaperMode', value: false },
        ]);
        
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
  background: rgba(#000, .4);
  backdrop-filter: blur(3px);
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
  position: relative;
  text-align: center;
  max-width: 800px;
  color: #fff;
  padding: 25px 50px 40px 50px;
  box-sizing: border-box;
  border-radius: 5px;
  background: #161e29;
  box-shadow: 0 2px 30px rgba(#000, .5);
  border: 2px solid rgba(#fff, .1);
  
}

.flex-row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: stretch;
}

.card {
  cursor: default;
  margin-left: 30px; &:first-child { margin-left: 0; }
  border: 1px solid rgba(#fff, .2);
  border-radius: 5px;
  box-sizing: border-box;
  padding: 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 200ms ease;
  
  // background: rgba(#fff, .1);
  // background: rgba(#171e29, .6);
  // backdrop-filter: blur(5px);
  box-shadow: 0 2px 30px rgba(#000, .2);
  
  &:hover {
    box-shadow: 0 2px 25px rgba(#000, 1);
    // background: rgba(#fff, .01);
    transform: scale(1.05);
    border-color: #ffbf2c;
  }
  
  .image {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
    margin-bottom: 25px;
    img {
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
  flex: 1;
  width: 100%;
  justify-content: stretch;
  align-items: center;
  > * {
    flex: 1;
  }
}

.heading {
  margin: 0 0 20px 0;
}

.close-btn {
  cursor: pointer;
  position: absolute;
  z-index: 1;
  top: 10px;
  right: 10px;
  font-size: 16px;
  line-height: 16px;
  padding: 10px;
  transition: all 250ms ease;
  color: rgba(#fff, .7);
  &:hover {
    transform: scale(1.4);
    color: rgba(#fff, 1);
  }
}
</style>