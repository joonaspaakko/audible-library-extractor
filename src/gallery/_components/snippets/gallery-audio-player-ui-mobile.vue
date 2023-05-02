<template>
  <div id="audio-player" v-show="store.audioPlayer.audio">
    
    <div class="inner-wrap">
      
      <img class="book-cover" :src="makeCoverUrl($store.getters.audioPlayerBook.cover, 500)" alt="">
      
      <div class="book" v-if="$store.getters.audioPlayerTitle" @click="openBook">
        <!-- <strong v-if="$store.state.audioPlayer.sample">sample&nbsp;|&nbsp;</strong> -->
        <span>{{ $store.getters.audioPlayerTitle }}</span>
      </div>
      
      <div class="player-timeline">
        
        
        <div class="time-display" v-if="store.audioPlayer.timeDisplay">{{ store.audioPlayer.timeDisplay }}</div>

        <div class="scrubber-wrapper">
          <input class="scrubber" type="range" step="0.1" min="0" :value="store.audioPlayer.progress" max="100" 
            @change="$compEmitter.emit('audio-player-scrubbed', $event)"
          >  
          <div class="progress-filler">
            <div :style="{
              width: store.audioPlayer.progress ? store.audioPlayer.progress+'%' : null,
            }"></div>
          </div>
        </div>
        
      </div>
      
      <div class="player-buttons">
        <div class="back" @click="$compEmitter.emit('audio-player-seek-back')"><ic-baseline-replay-30/></div>
        <div class="play-pause">
          <div class="play" v-if="!$store.state.audioPlayer.playing" @click="$compEmitter.emit('audio-player-play')"><ic-round-play-arrow/></div>
          <div class="pause" v-else @click="$compEmitter.emit('audio-player-pause')"><ic-round-pause/></div>
        </div>
        <!-- <div class="stop" @click="$compEmitter.emit('audio-player-stop')">          <fa-solid-stop/></div> -->
        <div class="forward" @click="$compEmitter.emit('audio-player-seek-forward')"><ic-baseline-forward-30/></div>
      </div>
      
    </div>
    
  </div>
  <!-- #audio-player -->
</template>

<script>
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";
export default {
  name: "audioPlayerUiDesktop",
  mixins: [ makeCoverUrl ],
  data: function() {
    return {
      store: this.$store.state,
    };
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
    margin-top: auto !important;
    box-sizing: border-box;
    // background: themed(backColor);
    // background: darken( themed(elementColor), 5);
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
      justify-content: center;
      align-items: center;
      width: 100%;
      
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
      margin-bottom: 40px;
    }
    
    .player-timeline {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: row;
      justify-items: center;
      align-items: center;
      margin-bottom: 40px;
    }
    
    .time-display { 
      color: themed(frontColor);
      font-family: 'Inconsolata', monospace; 
      margin-right: 20px; 
      display: flex;
      justify-items: center;
      align-items: center;
    }
      
    .player-buttons {
      display: flex;
      flex-direction: row;
      align-content: center;
      align-items: center;
      > div {
        cursor: pointer;
        margin: 0 15px;
        padding: 5px;
        &:first-child { padding-left: 0; }
      }
      font-size: 2em;
      margin-bottom: 40px;
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
  max-width:  100%;
  border-radius: .5em;
  margin-bottom: 40px;
}

.play-pause {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  font-size: 1.5em;
  padding: .1em !important;
  @include themify($themes) {
    color: themed(backColor);
  }
  &:after {
    content: '';
    position: absolute;
    z-index: -1;
    border-radius: 50%;
    width: 100%;
    height: auto;
    padding-top: 100%;
    @include themify($themes) {
      background: themed(frontColor);
    }
  }
  div {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

</style>

