<template>
  <div id="audio-player" v-show="store.audioPlayer.audio" v-touch:swipe.bottom="swipeHandler" v-touch:swipe.top="swipeHandler">
    
    <div class="inner-wrap">
      
      <div class="cover-wrap">
        
        <div class="close-instructions">
          <div class="text">
            swipe down to close
          </div>
          <!-- <div class="icon">
            <fluent-swipe-down-20-filled/>
          </div> -->
        </div>
        
        <div class="cover-inner-wrap">
          <img class="book-cover" :src="cover" alt="" draggable="false">
        </div>
        <div class="book-cover-bg" :style="{ backgroundImage: `url('${cover}')` }"></div>
      </div>
      
      <div class="bottom">    
      
        <div class="player-timeline">
          
          <vue-slider style="width: 100%;" v-model="progress" :tooltip="'none'" />
          
          <div class="duration-wrapper">
            <div class="time-display" v-if="store.audioPlayer.timeDisplay">{{ store.audioPlayer.timeDisplay }}</div>
            
            <div class="time-display" v-if="store.audioPlayer.timeDisplayLeft">-{{ store.audioPlayer.timeDisplayLeft }}</div>
          </div>
          
        </div>
        
        <div class="book" v-if="$store.getters.audioPlayerTitle" @click="openBook">
          <!-- <strong v-if="$store.state.audioPlayer.sample">sample&nbsp;|&nbsp;</strong> -->
          <span>{{ $store.getters.audioPlayerTitle }}</span>
        </div>
        
        <div class="player-buttons">
          <div class="back" @click="$compEmitter.emit('audio-player-seek-back')"><ic-baseline-replay-30/></div>
          <div class="play-pause">
            <div class="play" v-if="!$store.state.audioPlayer.playing" @click="$compEmitter.emit('audio-player-play')"><ic-sharp-play-circle-filled/></div>
            <div class="pause" v-else @click="$compEmitter.emit('audio-player-pause')"><ic-sharp-pause-circle-filled/></div>
          </div>
          <!-- <div class="stop" @click="$compEmitter.emit('audio-player-stop')">          <fa-solid-stop/></div> -->
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
  
  computed: {
    cover() {
      return this.makeCoverUrl(this.$store.getters.audioPlayerBook.cover, 500);
    },
    progress: {
      get() {
        return this.store.audioPlayer.progress;
      },
      set( value ) {
        this.$compEmitter.emit('audio-player-scrubbed', { target: { value } });
      },
    },
  },
  
  mounted() {
    this.$store.commit('prop', { key: 'preventScrolling', value: true });
  },
  beforeUnmount() {
    this.$store.commit('prop', { key: 'preventScrolling', value: false });
  },
  
  methods: {
    swipeHandler() {
      
      this.$store.commit('prop', { key: 'showMobilePlayer', value: false });
      
    },
  },
  
};
</script>

<style lang="scss" scoped>


#audio-player {
  @include themify($themes) {
    background: darken( themed(elementColor), 5);
    flex: unset;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    max-width: unset;
    width: 100%;
    text-align: center;
    margin: 0 auto !important;
    margin-top: auto !important;
    box-sizing: border-box;
    // background: themed(backColor);
    // background: darken( themed(elementColor), 5);
    color: themed(frontColor);
    position: fixed;
    z-index: 9999999999;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    
    // &:before {
    //   content: '';
    //   position: absolute;
    //   top: 0;
    //   right: 0;
    //   left: 0;
    //   height: 11px;
    //   background: linear-gradient(180deg, rgba(0,0,0,.2) 0%, rgba(0,0,0,0) 100%);
    // }
    
    .inner-wrap {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
      width: 100%;
      height: 100%;
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
      margin-bottom: 30px;
    }
    
    .player-timeline {
      background: themed(elementColor);
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
      margin-bottom: 5px;
      padding: 10px 20px;
      box-sizing: border-box;
      position: relative;
      left: 50%;
      right: 50%;
      width: 100vw;
      margin-left: -50vw;
      margin-right: -50vw;
      &:after {
        content: '';
        position: absolute;
        z-index: -1;
        top: 100%;
        left: 0;
        right: 0;
        height: 40px;
        background: linear-gradient(0deg, rgba(themed(elementColor),0) 0%, rgba(themed(elementColor),1) 100%);
      }
      .duration-wrapper {
        flex: 1;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }
    
    .time-display { 
      color: themed(frontColor);
      font-family: 'Inconsolata', monospace; 
      display: flex;
      justify-content: center;
      align-items: center;
    }
      
    .player-buttons {
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      align-items: center;
      
      > div {
        cursor: pointer;
        margin: 0 15px;
        padding: 5px;
        &:first-child { padding-left: 0; }
      }
      font-size: 1.7em;
      margin-bottom: 10px;
      
      .back {
        padding-left: 40px !important;
        margin-left: 70px;
      }
      .forward {
        padding-right: 40px !important;
        margin-right: 70px;
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
      border: 9px solid themed(elementColor);
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
      border: 9px solid themed(elementColor);
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
  justify-content: center;
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
  justify-content: center;
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


.cover-wrap {
  overflow: hidden;
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 20px 40px;
  box-sizing: border-box;
  gap: 10px;
  
  &:before {
    content: '';
    position: absolute;
    z-index: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 60%;
    @include themify($themes) {
      background: linear-gradient(0deg, rgba(themed(elementColor),1) 0%, rgba(themed(elementColor),0.1) 80%, rgba(themed(elementColor),0) 100%);
    }
  }
}
.cover-inner-wrap {
  width: 100%;
  height: 100%;
  margin-top: -10px;
  margin-bottom: auto;
  padding: 20px 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.book-cover { 
  position: relative;
  z-index: 5;
  // max-height:  100%;
  // max-width:  100%;
  border-radius: .5em;
  // margin-bottom: 40px;
  box-shadow: 10px 10px 50px rgba(#000, .4), 5px 5px 10px rgba(#000, .6);
  
  max-width: 100%;
  max-height: 100%;
}
.book-cover-bg { 
  position: absolute;
  z-index: -1;
  $blur: 23px;
  top   : -$blur*2;
  right : -$blur*2;
  bottom: -$blur*2;
  left  : -$blur*2;
  filter: blur($blur);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: unset;
}

.bottom {
  @include themify($themes) {
    background: rgba(themed(elementColor),1);
    padding: 30px;
    padding-top: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    box-shadow: 0 -3px 3px rgba(themed(elementColor), 1), 0 -10px 50px rgba(#000, .2);
    position: relative;
    z-index: 10;
  }
}

.play-pause {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  font-size: 2em;
  padding: .1em !important;
  @include themify($themes) {
    color: themed(frontColor);
  }
  // &:after {
  //   content: '';
  //   position: absolute;
  //   z-index: -1;
  //   border-radius: 50%;
  //   width: 100%;
  //   height: auto;
  //   padding-top: 100%;
  //   @include themify($themes) {
  //     background: themed(frontColor);
  //   }
  // }
  div {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.close-instructions {
  @include themify($themes) {
    margin-top: 20px;
    margin-bottom: auto;
    color: themed(backColor);
    background: themed(frontColor);
    padding: 3px 11px;
    opacity: .4;
    border-radius: 99999px;
    .text {
      font-size: .8em;
      // text-shadow: 2px 2px 2px themed(backColor);
    }
    .icon {
      padding-top: 5px;
      font-size: 1.2em;
      svg {
        filter: drop-shadow(2px 2px 2px themed(backColor));
      }  
    }
  }
}

</style>

