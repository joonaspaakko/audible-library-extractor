import domurl from 'domurl';
import {Howl, Howler} from 'howler';
import _ from 'lodash';

export default {
  name: "audioPlayerGlobal",
  data: function() {
    return {
      store: this.$store.state,
      howler: null,
    };
  },
  
  watch: {
    "store.audioPlayer.audio"( audioInput ) {
      // START
      if ( audioInput ) { 
        this.initPlayer();
      }
      // STOP
      else {
        this.destroyHowler();
      }
    },
  },
  
  computed: {
    audio: {
      get() {
        return this.store.audioPlayer.audio;
      },
      set( newValue ) {
        this.$store.commit('prop', { key: 'audioPlayer.audio', value: newValue })
      },
    },
    timeDisplay: {
      get() {
        return this.store.audioPlayer.timeDisplay;
      },
      set( newValue ) {
        this.$store.commit('prop', { key: 'audioPlayer.timeDisplay', value: newValue })
      },
    },
    timeDisplayLeft: {
      get() {
        return this.store.audioPlayer.timeDisplayLeft;
      },
      set( newValue ) {
        this.$store.commit('prop', { key: 'audioPlayer.timeDisplayLeft', value: newValue })
      },
    },
    progress: {
      get() {
        return this.store.audioPlayer.progress;
      },
      set( newValue ) {
        this.$store.commit('prop', { key: 'audioPlayer.progress', value: newValue })
      },
    },
    sample: {
      get() {
        return this.store.audioPlayer.sample;
      },
      set( newValue ) {
        this.$store.commit('prop', { key: 'audioPlayer.sample', value: newValue })
      },
    },
    audioSource() {
      const source = _.get( this.$store.getters.audioPlayerBook, 'sample');
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
    
  //   console.log( 'player mounted' );
  //   this.$compEmitter.on("play-audio", this.initPlayer);
    this.$compEmitter.on("audio-player-scubber-pause", this.scrubberPause);
    this.$compEmitter.on("audio-player-clear-pause", this.clearPause);
    this.$compEmitter.on("audio-player-scrubbed", this.userScrubbed);
    this.$compEmitter.on("audio-player-play", this.play);
    this.$compEmitter.on("audio-player-pause", this.pause);
    this.$compEmitter.on("audio-player-stop", this.stop);
    this.$compEmitter.on("audio-player-seek-back", this.seekBack);
    this.$compEmitter.on("audio-player-seek-forward", this.seekForward);
    
  },
  
  beforeUnmount() {
    
    // this.$compEmitter.off("play-audio", this.initPlayer);
    this.$compEmitter.off("audio-player-scubber-pause", this.scrubberPause);
    this.$compEmitter.off("audio-player-clear-pause", this.clearPause);
    this.$compEmitter.off("audio-player-scrubbed", this.userScrubbed);
    this.$compEmitter.off("audio-player-play", this.play);
    this.$compEmitter.off("audio-player-pause", this.pause);
    this.$compEmitter.off("audio-stop-pause", this.stop);
    this.$compEmitter.off("audio-stop-seek-back", this.seekBack);
    this.$compEmitter.off("audio-stop-seek-forward", this.seekForward);
    this.destroyHowler();
    
  },

  methods: {
    
    // initPlayer( inputData  ) {  
      
    //   console.log( 'PLAY AUDIO' );
      
    //   this.audio = inputData; 
    //   this.play();
      
    // },
    
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
    
    initPlayer: function() {
      
      let vue = this;
      
      this.destroyHowler('keepAudioData'); // Just in case...
      
      if ( this.$store.getters.mobileThreshold ) this.$store.commit('prop', { key: 'showMobilePlayer', value: true });
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
          vue.$store.commit('prop', { key: 'audioPlayer.playing', value: vue.howler.playing() });
        },
        onplay(e, a) {
          vue.$store.commit('prop', { key: 'audioPlayer.playing', value: vue.howler.playing() });
        },
        onend(e) {
          vue.$store.commit('prop', { key: 'audioPlayer.playing', value: vue.howler.playing() });
        },
        onpause(e) {
          vue.$store.commit('prop', { key: 'audioPlayer.playing', value: vue.howler.playing() });
        },
        onstop(e) {
          vue.$store.commit('prop', { key: 'audioPlayer.playing', value: vue.howler ? vue.howler.playing() : false });
        },
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
        seek.value    = _[ mathMethod ]( vue.howler.current.time, config.value ); // Add of subtract from the current time );
        seek.at.end   = seek.value >= audioLength;
        seek.at.start = seek.value <= 0;
        // Safeguard so seek never goes past start or end:
        seek.value    = seek.going.forward ? 
                        (seek.at.end ? audioLength-.00000001 : seek.value) : 
                        (seek.at.start ? 0 : seek.value); 
        
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
        timeDisplayLeft: null,
        percentage: null,
      };
      
      this.howler.current.timer = setInterval(function() {
        
        if ( vue.howler.playing() ) {
          vue.updateCurrent();
          if ( document.activeElement ) document.activeElement.blur();
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
      var duration =  this.howler.duration() || 0;
      this.howler.current.time = seek;
      this.howler.current.timeDisplay = this.formatTime(Math.round(seek));
      this.howler.current.timeDisplayLeft = this.formatTime(Math.round(duration - seek));
      this.howler.current.percentage = ((seek / duration) * 100) || 0;
      
      this.timeDisplay = this.howler.current.timeDisplay;
      this.timeDisplayLeft = this.howler.current.timeDisplayLeft;
      this.progress = this.howler.current.percentage.toFixed(1);
      
    },
    
    play: function( e ) {
      
      if ( this.howler && !this.howler.playing() ) {
        this.howler.play();
      }
      
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
        // this.clearPause();
        var targetTime = (scrubber.target.value / 100) * this.howler.duration();
        this.progress = scrubber.target.value;
        this.howler.seek( targetTime );
        if ( !this.howler.playing() ) this.howler.play();
      }

    },
    
    destroyHowler( keepAudioData ) {
      
      if ( this.$store.getters.mobileThreshold ) this.$store.commit('prop', { key: 'showMobilePlayer', value: false });
      
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
        asin: this.$store.getters.audioPlayerBook.asin,
        progress: this.howler.current.time,
      });
      
    }, 3000, {'leading': false, 'trailing': true }),
    
    seekToCachedPosition() {
      
      const cached = _.find( this.$store.state.sticky.player.books, { asin: this.$store.getters.audioPlayerBook.asin });
      if ( cached ) this.howler.seek( cached.progress );
      
    },
    
  }
};