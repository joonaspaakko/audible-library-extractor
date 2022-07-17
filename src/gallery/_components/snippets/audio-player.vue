<template>
  <div id="audio-player" v-if="audio">
    
    <div class="inner-wrap">
      <div class="book" v-if="title" @click="openBook">
        <strong>sample&nbsp;|&nbsp;</strong>
        <span>{{ title }}</span>
      </div>
      
      <div class="player-innards">
        
        <div class="time-display" v-if="timeDisplay">{{ timeDisplay }}</div>

        <input class="scrubber" type="range" min="0" :value="progress" max="100" @mousedown="scrubberPause" @touchstart="scrubberPause" @input="clearPause" @change="scrubber">  

        <div class="player-buttons">
          <div class="play" v-if="!(howler && howler.playing())" @click="play"><font-awesome :icon="['fas', 'play']" /></div>
          <div class="pause" v-else @click="pause"> <font-awesome :icon="['fas', 'pause']" /></div>
          <div class="stop" @click="stop">          <font-awesome :icon="['fas', 'times']" /></div>
          <div class="back" @click="seekBack">      <font-awesome :icon="['fas', 'undo-alt']" /></div>
          <div class="forward" @click="seekForward"><font-awesome :icon="['fas', 'redo-alt']" /></div>
        </div>
        
      </div>
    </div>
    
  </div>
  <!-- #audio-player -->
</template>

<script>

import {Howl, Howler} from 'howler';

export default {
  name: "audioPlayer",
  data: function() {
    return {
      audio: null, // input object
      howler: null,
      timeDisplay: '00:00',
      progress: 0,
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
      return _.get( this.book, 'sample');
    },
    route() {
      return _.get( this.audio, 'route', {});
    },
  },
  
  mounted() {
    
    this.$root.$on("play-audio", this.initPlayer);
    
  },
  
  beforeDestroy() {
    
    this.$root.$off("play-audio", this.initPlayer);
    
  },

  methods: {
    
    initPlayer( inputData  ) {  
      
      this.audio = inputData; 
      this.play();
      
    },
    
    // playerMounted() {
    //   console.log( 'test!!!!!', this.$refs.audioPlayer )
    //   this.player = this.$refs.audioPlayer;
    //   this.addingPlayerElements();
    //   this.startPlaying();
      
    // },
    
    // startPlaying() {
      
    //   console.log( this.player );
    //   this.player.play();
    //   this.$store.commit('prop', { key: 'playingAudio', value: true });
      
    // },
    
    // samplePlayerClose() {
      
    //   this.$store.commit('prop', { key: 'playingAudio', value: false });
    //   this.player.stop();
    //   this.audio = null;
      
    // },
    
    // addingPlayerElements() {
      
    //   const playerEl = this.player.$el;
    //   const iconsWrapper = playerEl.querySelector('.operate');
      
    //   // Close button after stop button
    //   let children = iconsWrapper.querySelectorAll('span');
    //   let oldestChild = children[ children.length-1 ];
    //   oldestChild.insertAdjacentElement('beforebegin', this.$refs.closeBtn);
      
    //   // Scrubber to the front
    //   children = iconsWrapper.querySelectorAll('span');
    //   oldestChild = children[ children.length-1 ];
    //   const scrubber = playerEl.querySelector('.slider');
    //   iconsWrapper.insertBefore(scrubber, iconsWrapper.firstChild);
      
    //   // Time indicator to the front
    //   iconsWrapper.insertBefore(oldestChild, iconsWrapper.firstChild);
      
    // },
    
    openBook() {
      
      const bookASIN  = this.book.asin;
      const queryASIN = this.$route.query.book;
      
      // Go back to the current sample page URL
      if ( this.route && this.route.fullPath !== this.$route.fullPath ) this.$router.push(this.route.fullPath);
      
      // Open book details if needed
      if ( !queryASIN || (bookASIN && queryASIN !== bookASIN) ) {
        this.$nextTick(function() {
          this.$root.$emit('book-clicked', { book: this.book });
        });
      }
    },
    
    
    stripHttp( url ) {
      
      const has_http = url.match(/^https?:\/\//);
      if ( has_http ) return url.replace( has_http[0], '//' );
      
    },
    
    play: function() {

      let vue = this;
      
      this.$store.commit('prop', { key: 'playingAudio', value: true });
      
      if ( this.howler ) this.howler.unload();
      
      this.howler = new Howl({
        src: [ this.audioSource ],
        autoplay: true,
        loop: false,
        volume: 1,
        onplayerror: function() {
          vue.howler.once('unlock', function() {
            vue.howler.play();
          });
        }
      });


      this.howler.customSeek = function( config ) {

        config = config || {};
        config.value = config.value || 30;

        if ( config.direction === 'forward' ) {
          vue.howler.seek( (vue.howler.current.time+config.value) >= vue.howler.duration() ? vue.howler.duration() : vue.howler.current.time+config.value );
        }
        else if ( config.direction === 'back' ) {
          vue.howler.seek( (vue.howler.current.time-config.value) <= 0 ? 0 : vue.howler.current.time-config.value );
        }

      };
      
      if ( this.howler.current ) clearInterval( this.howler.current.timer );
      
      this.howler.current = { 
        timer: null,
        time: null,
        timeDisplay: null,
        percentage: null,
      };
      
      const formatTime = function(secs) {
        
        const timeArray = [];
        const addToArray = function( number ) { timeArray.push( (number < 10 ? '0' : '') + number ) };
        
        let hours   = Math.floor(secs / 3600); addToArray(hours);
        let minutes = Math.floor(secs / 60) || 0; addToArray(minutes);
        let seconds = (secs - minutes * 60) || 0; addToArray(seconds);
        
        timeArray.shift();
        
        return timeArray.join(':');
        
      };
      
      this.howler.current.timer = setInterval(function() {
        
        if ( vue.howler.playing() ) {
          var seek = vue.howler.seek() || 0;
          vue.howler.current.time = seek;
          vue.howler.current.timeDisplay = formatTime(Math.round(seek));
          vue.howler.current.percentage = ((seek / vue.howler.duration()) * 100) || 0;
          
          vue.timeDisplay = vue.howler.current.timeDisplay;
          vue.progress = vue.howler.current.percentage;
        }

        //if ( !vue.howler.playing() ) clearInterval( vue.howler.current.timer );

      }, 500);

    },
    
    pause: function( e ) {
      
      if ( this.howler && this.howler.playing() ) {
        this.howler.pause();
      }
      
    },
    
    scrubberPause: function( e ) {
      
      if ( this.howler && this.howler.playing() ) {
        this.howler.pause();
        clearTimeout( this.howler.pauseTimer );
        let vue = this;
        // Restarts playback if user doesn't move the srubber.
        this.howler.pauseTimer = setTimeout(function() {
          vue.howler.play();
        }, 500); 
      }
      
    },
    
    clearPause: function() {
      if ( this.howler ) clearTimeout( this.howler.pauseTimer );
    },
    
    stop: function() {

      
      if ( this.howler ) {
        clearInterval( this.howler.current.timer );
        this.howler.unload();
      }
      
      this.$store.commit('prop', { key: 'playingAudio', value: false });
      this.audio = null;

    },
    
    seekBack: function() {
      
      if ( this.howler && this.howler.playing() ) this.howler.customSeek({ direction: 'back' });

    },
    
    seekForward: function() {
      
      if ( this.howler && this.howler.playing() ) this.howler.customSeek({ direction: 'forward' });

    },
    
    scrubber: function( scrubber ) {
      
      if ( this.howler ) {
        clearTimeout( this.howler.pauseTimer );
        var targetTime = (scrubber.target.value / 100) * this.howler.duration();
        this.progress = scrubber.target.value;
        this.howler.seek( targetTime );
        this.howler.play();
      }

    },
    
  }
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

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
    
    input[type=range] {
      -webkit-appearance: none;
      margin: 6px 0;
      width: 100%;
      min-width: 80px;
      background: transparent;
    }
    input[type=range]:focus {
      outline: none;
    }
    $trackBackground: rgba(themed(frontColor), .3);
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      animate: 0.2s;
      box-shadow: none;
      background: $trackBackground;
      border-radius: 50px !important;
      border: 0px solid #000000;
    }
    input[type=range]::-webkit-slider-thumb {
      box-shadow: none;
      border: 0px solid #000000;
      height: 16px;
      width: 30px;
      border-radius: 50px;
      background: #f69919;
      cursor: pointer;
      -webkit-appearance: none;
      margin-top: -3px;
    }
    input[type=range]:focus::-webkit-slider-runnable-track {
      background: $trackBackground;
    }
    input[type=range]::-moz-range-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      animate: 0.2s;
      box-shadow: none;
      background: $trackBackground;
      border-radius: 50px;
      border: 0px solid #000000;
    }
    input[type=range]::-moz-range-thumb {
      box-shadow: none;
      border: 0px solid #000000;
      height: 16px;
      width: 30px;
      border-radius: 50px;
      background: #f69919;
      cursor: pointer;
    }
    input[type=range]::-ms-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      animate: 0.2s;
      background: transparent;
      border-color: transparent;
      color: transparent;
    }
    input[type=range]::-ms-fill-lower {
      background: $trackBackground;
      border: 0px solid #000000;
      border-radius: 100px;
      box-shadow: none;
    }
    input[type=range]::-ms-fill-upper {
      background: $trackBackground;
      border: 0px solid #000000;
      border-radius: 100px;
      box-shadow: none;
    }
    input[type=range]::-ms-thumb {
      box-shadow: 0px 0px 1px #ffffff;
      border: 0px solid #000000;
      height: 16px;
      width: 30px;
      border-radius: 50px;
      background: #f69919;
      cursor: pointer;
    }
    input[type=range]:focus::-ms-fill-lower {
      background: $trackBackground;
    }
    input[type=range]:focus::-ms-fill-upper {
      background: $trackBackground;
    }
  }

}

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

// #nav-outer-wrapper.mobile-nav #audio-player {
//   .vueAudioBetter {
//     span {
//       font-size: 15px !important;
//     }
//     .iconfont {
//       font-size: 25px !important;
//     }
//     .operate .close,
//     .operate .close svg {
//       width: 25px;
//       height: 25px;
//     }
//   }
// }


// .mobile-nav-open .vueAudioBetter {
//   .iconfont, .close {
//     font-size: 27px !important;
//   }
// }

</style>
