<template>
  <div v-if="showModal" class="modal-overlay" @click.self="$store.commit('update', { key: 'presetModalOpen', value: false })">
    
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
        Choose a mode
      </h2>
      
      <div class="flex-row">
        
        <!-- LOOP CARDS -->
        <div 
          class="card"
          v-for="card in cards" :key="card.key"
          @click="cardChosen( card )"
          @mousemove="tilt( $event )"
          @mouseleave="untilt( $event )"
        >
          <!-- GLARE: cursor-following highlight -->
          <div class="glare"></div>
          <!-- IMAGE -->
          <div class="image" v-if="card.image">
            <img draggable="false" :src="card.image" alt="">
          </div>
          <!-- TITLE -->
          <div class="title">{{ card.title }}</div>
          <!-- DESCRIPTION -->
          <div class="desc"> {{ card.desc }}</div>
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
            image: image_wallpaper,
            preset: 'wallpaper',
            title: "Desktop wallpaper",
            desc: "Starts with a 1920x1080 canvas with a dark overlay so that icons can be seen on top of it.",
          },
          {
            key: 'card',
            image: image_card,
            preset: 'card',
            title: "Card",
            desc: "Great starting point for online posts and other generic images.",
          },
          {
            key: 'wallpaper-animated',
            image: image_wallpaper_animated,
            preset: 'wallpaper',
            mode: 'animatedWallpaperMode',
            title: "Animated wallpaper",
            desc: "A moving version of the desktop wallpaper. Exports a web page you can run as a live wallpaper or screensaver.",
          },
          {
            key: 'tierlist',
            image: image_card_tierlist,
            preset: 'card',
            mode: 'tierListMode',
            title: "Tier list",
            desc: "A segmented card where you place your covers into S, A, B, C and D tiers.",
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
    },
    
    mounted() {
      this.onKeydown = ( e ) => {
        if ( e.key === 'Escape' && this.store.presetModalOpen ) {
          this.$store.commit( 'update', { key: 'presetModalOpen', value: false } );
        }
      };
      document.addEventListener( 'keydown', this.onKeydown );
    },
    beforeDestroy() {
      document.removeEventListener( 'keydown', this.onKeydown );
    },

    methods: {

      // POINTER TILT: rotate the card toward the cursor and move the glare highlight with it
      tilt( event ) {

        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();

        const px = ( event.clientX - rect.left ) / rect.width;
        const py = ( event.clientY - rect.top ) / rect.height;

        const maxTilt = 3;
        const rotateY = ( px - 0.5 ) * 2 * maxTilt;
        const rotateX = ( 0.5 - py ) * 2 * maxTilt;

        card.style.setProperty( '--rotate-x', rotateX + 'deg' );
        card.style.setProperty( '--rotate-y', rotateY + 'deg' );
        card.style.setProperty( '--glare-x', ( px * 100 ) + '%' );
        card.style.setProperty( '--glare-y', ( py * 100 ) + '%' );

      },

      untilt( event ) {

        const card = event.currentTarget;

        card.style.setProperty( '--rotate-x', '0deg' );
        card.style.setProperty( '--rotate-y', '0deg' );

      },

      cardChosen( card ) {
        
        this.reset();

        // MODE FLAG: animated wallpaper / tier list variants set their store flag
        if ( card.mode ) this.$store.commit('update', { key: card.mode, value: true });

        this.changeCanvasPreset( card.preset );

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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: stretch;
  perspective: 1200px;
}

.card {
  --rotate-x: 0deg;
  --rotate-y: 0deg;
  --glare-x: 50%;
  --glare-y: 50%;
  --scale: 1;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(#fff, .2);
  border-radius: 5px;
  box-sizing: border-box;
  padding: 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
  transform: perspective(1200px) rotateX(var(--rotate-x)) rotateY(var(--rotate-y)) scale(var(--scale));
  transition: transform 120ms ease-out, box-shadow 200ms ease, border-color 200ms ease;

  box-shadow: 0 2px 30px rgba(#000, .2);
  
  &:hover {
    --scale: 1.05;
    box-shadow: 0 12px 40px rgba(#000, 1);
    border-color: #ffbf2c;
    .glare { opacity: 1; }
  }

  // GLARE: soft spotlight that tracks the cursor
  .glare {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    transition: opacity 200ms ease;
    background: radial-gradient(
      circle at var(--glare-x) var(--glare-y),
      rgba(cyan, .065),
      rgba(cyan, 0) 90%
    );
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