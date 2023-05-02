<template>
  <div id="audio-player" v-show="store.audioPlayer.audio">
    
    <div class="inner-wrap">
      <!-- <div class="book" v-if="$store.getters.audioPlayerTitle" @click="openBook">
        <strong v-if="$store.state.audioPlayer.sample">sample&nbsp;|&nbsp;</strong>
        <span>{{ $store.getters.audioPlayerTitle }}</span>
      </div> -->
      
      <div class="player-innards">
        
        <img class="book-cover" :src="makeCoverUrl($store.getters.audioPlayerBook.cover, 280)" alt=""
          v-tippy="{ placement: 'right', flipBehavior: ['right', 'bottom'] }" :content="($store.state.audioPlayer.sample ? '<strong>sample</strong> | ' : '') + $store.getters.audioPlayerTitle"
        >
        
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

        <div class="player-buttons">
          <div class="play" v-if="!$store.state.audioPlayer.playing" @click="$compEmitter.emit('audio-player-play')"><fa6-solid-play/></div>
          <div class="pause" v-else @click="$compEmitter.emit('audio-player-pause')"> <fa6-solid-pause/></div>
          <div class="stop" @click="$compEmitter.emit('audio-player-stop')">          <fa-solid-times/></div>
          <div class="back" @click="$compEmitter.emit('audio-player-seek-back')">      <fa-solid-undo-alt/></div>
          <div class="forward" @click="$compEmitter.emit('audio-player-seek-forward')"><fa-solid-redo-alt/></div>
        </div>
        
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

</style>

<style lang="scss">


.mobile-nav-open #audio-player {
  @include themify($themes) {
    background: transparent;
    flex-direction: column !important;
    padding: 8px;
    background: rgba( themed(backColor), .8 );
    
    .inner-wrap {
      border: 1px solid rgba( themed(frontColor), .4 );
      border-radius: 8px;
      box-sizing: border-box;
      padding: 10px 18px;
      flex-direction: column;
      font-size:   19px;
      line-height: 19px;
    }
    
    .book {
      margin: 0;
      padding: 0 5px 5px;
      font-size: 15px !important;
      line-height: 16px !important;
      font-size: inherit;
      line-height: inherit;
      display: block;
    }
  
  }
}

@media ( max-width: 380px ) {
  .mobile-nav-open #audio-player {
    
    .inner-wrap { 
      padding: 10px; 
      font-size:   17px !important;
      line-height: 17px !important; 
    }
    
    .time-display { margin-right: 10px; }
      
    .player-buttons {
      padding-left: 10px;
      > div {
        margin-left: 5px;
        // padding: 5px;
        // &:first-child { padding-left: 0; }
      }
    }
    
  }
}

.book-cover { 
  max-width:  40px;
  max-height: 40px;
  border-radius: .5em;  
  margin-right: 1em;
}

</style>

