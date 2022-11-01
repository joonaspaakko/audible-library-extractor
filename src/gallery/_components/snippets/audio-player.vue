<template>
  <div id="audio-player" v-if="audio">
    
    <div class="inner-wrap">
      <div class="book" v-if="title" @click="openBook">
        <strong v-if="sample">sample&nbsp;|&nbsp;</strong>
        <span>{{ title }}</span>
      </div>
      
      <div class="player-innards">
        
        <div class="time-display" v-if="timeDisplay">{{ timeDisplay }}</div>

        <div class="scrubber-wrapper">
          <input class="scrubber" ref="timeline" type="range" step="0.1" min="0" :value="progress" max="100" @mousedown="scrubberPause" @touchstart="scrubberPause" @input="clearPause" @change="userScrubbed">  
          <div class="progress-filler">
            <div :style="progressFillerStyle"></div>
          </div>
        </div>

        <div class="player-buttons">
          <div class="play" v-if="!(howler && howler.playing())" @click="play"><fa6-solid-play/></div>
          <div class="pause" v-else @click="pause"> <fa6-solid-pause/></div>
          <div class="stop" @click="stop">          <fa-solid-times/></div>
          <div class="back" @click="seekBack">      <fa-solid-undo-alt/></div>
          <div class="forward" @click="seekForward"><fa-solid-redo-alt/></div>
        </div>
        
      </div>
    </div>
    
  </div>
  <!-- #audio-player -->
</template>

<script>
import domurl from 'domurl';
import {Howl, Howler} from 'howler';
import _ from 'lodash';

export default {
  name: "audioPlayer",
  data: function() {
    return {
      audio: null, // input object
      howler: null,
      timeDisplay: '00:00',
      progress: 0,
      sample: true,
    };
  },
  
  computed: {
    book() {
      return _.get( this.audio, 'book', {});
    },
    title() {
      return this.book.title || this.book.titleShort;
    },
    audioSource() {
      const source = _.get( this.book, 'sample');
      var url  = new domurl( source );
      if ( window.location.protocol === 'http:' ) url.protocol = 'http';
      return url.toString();
    },
    route() {
      return _.get( this.audio, 'route', {});
    },
    progressFillerStyle() {
      const style = {};
      // if ( this.progress ) style.width = Math.floor(this.progress)+'%';
      if ( this.progress ) style.width = this.progress+'%';
      // if ( this.progress ) style.width = this.progress+'%';
      return style;
    },
  },
  
  mounted() {
    
    this.$compEmitter.on("play-audio", this.initPlayer);
    
  },
  
  beforeUnmount() {
    
    this.$compEmitter.off("play-audio", this.initPlayer);
    this.destroyHowler();
    
  },

  methods: {
    
    initPlayer( inputData  ) {  
      
      this.audio = inputData; 
      this.play();
      
    },
    
    openBook() {
      
      const bookASIN  = this.book.asin;
      const queryASIN = this.$route.query.book;
      
      // Go back to the current sample page URL
      if ( this.route && this.route.fullPath !== this.$route.fullPath ) this.$router.push(this.route.fullPath);
      
      // Open book details if needed
      if ( !queryASIN || (bookASIN && queryASIN !== bookASIN) ) {
        this.$nextTick(function() {
          this.$compEmitter.emit('book-clicked', this.book.asin);
        });
      }
    },
    
    play: function() {
      
      let vue = this;
      
      this.destroyHowler('keepAudioData'); // Just in case...
      
      this.$store.commit('prop', { key: 'playingAudio', value: true });
      
      this.howler = new Howl({
        src: this.audioSource,
        autoplay: true,
        loop: false,
        volume: 1,
        // rate: 1.5,
        onplayerror: function() {
          vue.howler.once('unlock', function() {
            vue.howler.play();
          });
        },
        onloaderror: function( e ) {
          
        },
        onstop: function( e ) {
          // if ( this.howler ) {
          //   this.howler.duration()
          // }
        }
      });
      
      this.seekToCachedPosition();

      this.howler.customSeek = function( config ) {

        config = config || {};
        config.value = config.value || 30;
        const audioLength = vue.howler.duration();
        
        const seek = {
          going: {
            forward:  config.direction === 'forward',
            backward: config.direction === 'backward',
          },
          at: {
            end:   false,
            start: false,
          },
          value: null,
        };
        
        const mathMethod = seek.going.forward ? 'add' : 'subtract';
        seek.value    = _[ mathMethod ]( vue.howler.current.time, config.value ); // Add of subtract from the current time
        seek.at.end   = seek.value >= audioLength;
        seek.at.start = seek.value >= audioLength;
        // Safeguard so seek never goes past start or end:
        seek.value    = seek.going.forward ? 
                        seek.at.end ? audioLength : seek.value : 
                        seek.at.start ? 0 : seek.value; 
        
        // Commands the player to seek...
        vue.howler.seek( seek.value );
        
        // Update player position
        if ( seek.at.start || seek.at.end ) {
          vue.updateCurrent();
        }
        // Mostly for seeking backwards when at the end.
        // Also if the player is paused, this will make it continue playing.
        else if ( !vue.howler.playing() ) {
          vue.howler.play();
        }

      };
      
      this.howler.current = { 
        timer: null,
        time: null,
        timeDisplay: null,
        percentage: null,
      };
      
      this.howler.current.timer = setInterval(function() {
        
        if ( vue.howler.playing() ) {
          vue.updateCurrent();
          vue.$refs.timeline.blur();
        }
        vue.updateBookProgress();

      }, 500);

    },
    
    formatTime(secs) {
      
      const timeArray = [];
      const addToArray = function( number ) { timeArray.push( (number < 10 ? '0' : '') + number ) };
      
      let hours   = Math.floor(secs / 3600); addToArray(hours);
      let minutes = Math.floor(secs / 60) || 0; addToArray(minutes);
      let seconds = (secs - minutes * 60) || 0; addToArray(seconds);
      
      timeArray.shift();
      
      return timeArray.join(':');
      
    },
    
    updateCurrent() {
      
      var seek = this.howler.seek() || 0;
      this.howler.current.time = seek;
      this.howler.current.timeDisplay = this.formatTime(Math.round(seek));
      this.howler.current.percentage = ((seek / this.howler.duration()) * 100) || 0;
      
      this.timeDisplay = this.howler.current.timeDisplay;
      this.progress = this.howler.current.percentage.toFixed(1);
      
    },
    
    pause: function( e ) {
      
      if ( this.howler && this.howler.playing() ) {
        this.howler.pause();
      }
      
    },
    
    scrubberPause: function( e ) {
      
      let vue = this;
      if ( this.howler && this.howler.playing() ) {
        this.howler.pause();
        this.clearPause();
        // Restarts playback if user doesn't move the srubber.
        this.howler.pauseTimer = setTimeout(function() {
          vue.howler.play();
        }, 500); 
      }
      
    },
    
    clearPause: function() {
      if ( this.howler ) clearTimeout( this.howler.pauseTimer );
    },
    
    // The traditional stop button doesn't exist. 
    // This stops the entire player.
    stop: function() {
      
      this.destroyHowler();
      
    },
    
    seekBack: function() {
      
      if ( this.howler ) this.howler.customSeek({ direction: 'backward' });

    },
    
    seekForward: function() {
      
      if ( this.howler ) this.howler.customSeek({ direction: 'forward' });

    },
    
    userScrubbed: function( scrubber ) {
      
      if ( this.howler ) {
        this.clearPause();
        var targetTime = (scrubber.target.value / 100) * this.howler.duration();
        this.progress = scrubber.target.value;
        this.howler.seek( targetTime );
        this.howler.play();
      }

    },
    
    destroyHowler( keepAudioData ) {
      
      if ( this.howler ) {
        this.clearPause();
        if ( _.get(this.howler, 'current.timer') ) clearInterval( this.howler.current.timer );
        if ( _.get(this.howler, 'unload') ) this.howler.unload();
        this.howler = null;
      }
      
      if ( !keepAudioData ) this.audio = null;
      this.$store.commit('prop', { key: 'playingAudio', value: false });
      
    },
    
    updateBookProgress: _.throttle(function() {
      
      if ( this.sample ) return; // Don't remember sample position....
      
      this.$store.commit('updatePlayerProgress', {
        asin: this.book.asin,
        progress: this.howler.current.time,
      });
      
    }, 3000, {'leading': false, 'trailing': true }),
    
    seekToCachedPosition() {
      
      const cached = _.find( this.$store.state.sticky.player.books, { asin: this.book.asin });
      if ( cached ) this.howler.seek( cached.progress );
      
    },
    
  }
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
      flex-direction: row;
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

</style>

