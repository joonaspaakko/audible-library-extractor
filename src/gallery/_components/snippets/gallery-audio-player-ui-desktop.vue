<template>
  <div id="audio-player" v-show="store.audioPlayer.audio" ref="player">
    
    <div class="inner-wrap">
      
      <div class="player-innards">
        
        <img class="book-cover" :src="makeCoverUrl($store.getters.audioPlayerBook.cover, 280)" alt=""
          v-tippy="{ placement: 'right', flipBehavior: ['right', 'bottom'] }" :content="($store.state.audioPlayer.sample ? '<strong>sample</strong> | ' : '') + $store.getters.audioPlayerTitle"
        >
        
        <div class="time-display left" v-if="store.audioPlayer.timeDisplay">{{ store.audioPlayer.timeDisplay }}</div>
        <vue-slider style="width: 100%;" v-model="progress" :tooltip="'none'" />
        <div class="time-display right" v-if="store.audioPlayer.timeDisplayLeft">-{{ store.audioPlayer.timeDisplayLeft }}</div>

        <div class="player-buttons">
          <div class="play" v-if="!$store.state.audioPlayer.playing" @click="$compEmitter.emit('audio-player-play')"><fa6-solid-play/></div>
          <div class="pause" v-else @click="$compEmitter.emit('audio-player-pause')"> <fa6-solid-pause/></div>
          <div class="stop" @click="$compEmitter.emit('audio-player-stop')">          <fa-solid-times/></div>
          <div class="back" @click="$compEmitter.emit('audio-player-seek-back')">      <ic-baseline-replay-30/></div>
          <div class="forward" @click="$compEmitter.emit('audio-player-seek-forward')"><ic-baseline-forward-30/></div>
        </div>
        
      </div>
    </div>
    
  </div>
  <!-- #audio-player -->
</template>

<script>
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";

import 'vue-slider-component/theme/antd.css';
import '@vueform/multiselect/themes/default.css';
import VueSlider from 'vue-slider-component';

export default {
  name: "audioPlayerUiDesktop",
  mixins: [ makeCoverUrl ],
  components: {
    VueSlider,
  },
  data: function() {
    return {
      store: this.$store.state,
    };
  },
  
  watch: {
    
    'store.audioPlayer.audio'( show ) {
      this.$nextTick(() => {
        
        this.$store.commit('prop', { key: 'desktopPlayerHeight', value: show ? (this.$refs.player.offsetHeight/2)+'px' : null });
        
      });
    },
    
  },
  
  computed: {
    progress: {
      get() {
        return this.store.audioPlayer.progress;
      },
      set( value ) {
        this.$compEmitter.emit('audio-player-scrubbed', { target: { value } });
      },
    },
  },
  
};
</script>

<style lang="scss" scoped>


#audio-player {
  @include themify($themes) {
    flex: unset;
    // -webkit-touch-callout: none;
    // -webkit-user-select: none;
    // -khtml-user-select: none;
    // -moz-user-select: none;
    // -ms-user-select: none;
    // user-select: none;
    max-width: unset;
    width: 100%;
    text-align: center;
    margin: 0 auto !important;
    margin-top: 0 !important;
    box-sizing: border-box;
    // background: themed(backColor);
    background: darken( themed(elementColor), 5);
    color: themed(frontColor);
    position: relative;
    z-index: 0;
    
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
    padding: 11px 25px;
    
    &:before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 11px;
      background: linear-gradient(180deg, rgba(0,0,0,.2) 0%, rgba(0,0,0,0) 100%);
    }
    
    .inner-wrap {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 715px;
      
      font-size: 17px;
      line-height: 17px;
    }
    
    .book {
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 15px;
      line-height: 18px;
      color: themed(frontColor);
      margin-right: 50px;
    }
    
    .player-innards {
      flex: 1;
      display: flex;
      flex-direction: row;
      justify-items: center;
      align-items: center;
    }
    
    .time-display { 
      color: themed(frontColor);
      font-family: 'Inconsolata', monospace; 
      display: flex;
      justify-items: center;
      align-items: center;
      &.left {
        margin-right: 20px; 
      }
      &.right {
        margin-left: 20px; 
      }
    }
      
    .player-buttons {
      display: flex;
      flex-direction: row;
      align-content: center;
      align-items: center;
      padding-left: 20px;
      > div {
        cursor: pointer;
        margin-left: 15px;
        padding: 5px;
        &:first-child { padding-left: 0; }
      }
    }
    
    
    
    $trackBackground: rgba(themed(frontColor), .3);
    $thumbBackground: themed(audibleOrange);
    
    /*********** Baseline, reset styles ***********/
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      cursor: pointer;
      width: 100%;
      position: relative;
      z-index: 10;
    }

    /* Removes default focus */
    input[type="range"]:focus {
      outline: none;
    }

    /******** Chrome, Safari, Opera and Edge Chromium styles ********/
    /* slider track */
    input[type="range"]::-webkit-slider-runnable-track {
      border: 9px solid darken( themed(elementColor), 5);
      border-left: none;
      border-right: none;
      background-color: $trackBackground;
      border-radius: 10px;
      height: 20px;
    }

    /* slider thumb */
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; /* Override default look */
      appearance: none;
      margin-top: -7px; /* Centers thumb on the track */
      background-color: $thumbBackground;
      border-radius: 100px;
      height: 10px;
      width: 10px;
      position: relative;
      top: 3px;
      transition: outline 150ms;
    }

    input[type="range"]:focus::-webkit-slider-thumb {
      outline: 2px solid $thumbBackground;
      // outline-offset: 0.125rem;
    }

    /*********** Firefox styles ***********/
    /* slider track */
    input[type="range"]::-moz-range-track {
      border: 9px solid darken( themed(elementColor), 5);
      border-left: none;
      border-right: none;
      background-color: $trackBackground;
      border-radius: 10px;
      height: 20px;
    }

    /* slider thumb */
    input[type="range"]::-moz-range-thumb {
      background-color: $thumbBackground;
      border: none; /*Removes extra border that FF applies*/
      border-radius: 100px;
      height: 10px;
      width: 10px;
      position: relative;
      top: 3px;
      transition: outline 300ms cubic-bezier(.64,-0.7,.31,1.65);
    }

    input[type="range"]:focus::-moz-range-thumb{
      outline: 2px solid $thumbBackground;
      // outline-offset: 0.125rem;
    }
     
  }
}

.scrubber-wrapper {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-items: center;
  align-items: center;
  position: relative;
  z-index: 0;
}

.progress-filler {
  position: absolute;
  z-index: 5;
  padding-left: 0px;
  padding-right: 9px;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-items: center;
  align-items: center;
  div {
    position: relative;
    left: 1px;
    padding-right: 4px;
    height: 5px;
    @include themify($themes) {
      background: themed(audibleOrange);
    }
  }
}

.book-cover { 
  max-width:  40px;
  max-height: 40px;
  border-radius: .5em;  
  margin-right: 1em;
}

.back, .forward {
  font-size: 1.4em;
}

</style>

