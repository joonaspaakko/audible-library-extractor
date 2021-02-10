<template>
  <div id="audio-player" v-if="audioSource">
    
    <div class="book" v-if="book.title || book.titleShort" @click="openBook">
      <strong>Sample:</strong>
      {{ book.title || book.titleShort }}
    </div>
    
    <mini-audio
      :audio-source="audioSource"
      preload
      autoplay
      ref="audioPlayer"
    ></mini-audio>
    
    <span class="close" ref="closeBtn">
      <font-awesome fas icon="times-circle" @click="samplePlayerClose" /> 
    </span>
    
  </div>
  <!-- #audio-player -->
</template>

<script>

export default {
  name: "audioPlayer",
  props: ['showAudioPlayer', 'sampleData'],
  data: function() {
    return {
      title: null,
      audioSource: null,
      route: null
    };
  },

  created: function() {
    this.startPlaying();
    this.$nextTick(function() {
      
      const iconsWrapper = this.$refs.audioPlayer.$el.querySelector('.operate');
      
      // Close button after stop button
      let children = iconsWrapper.querySelectorAll('span');
      let oldestChild = children[ children.length-1 ];
      oldestChild.insertAdjacentElement('beforebegin', this.$refs.closeBtn);
      
      // Scrubber to the front
      children = iconsWrapper.querySelectorAll('span');
      oldestChild = children[ children.length-1 ];
      const scrubber = this.$refs.audioPlayer.$el.querySelector('.slider');
      iconsWrapper.insertBefore(scrubber, iconsWrapper.firstChild);
      
      // Time indicator to the front
      iconsWrapper.insertBefore(oldestChild, iconsWrapper.firstChild);
      
    });
  },

  methods: {
    
    startPlaying: function() {
      
      this.audioSource = this.sampleData.book.sample;
      this.book = this.sampleData.book;
      if (this.sampleData.route) this.route = this.sampleData.route;
      
    },

    openBook: function() {
      
      if ( this.route.fullPath !== this.$route.fullPath ) {
        this.$router.push({ 
          path: this.route.path, 
          query: this.route.query, 
          params: this.route.params, 
        });
      }
      
      console.log( 'BOOKDETAILS FOUND', document.querySelector('#ale-bookdetails') )
      if ( document.querySelector('#ale-bookdetails') ) {
        this.$root.$emit('book-clicked', { book: this.book });
        this.$nextTick(function() {
          this.$root.$emit('book-clicked', { book: this.book });
        });
      }
      else {
        this.$root.$emit('book-clicked', { book: this.book }); 
      }
      
    },

    samplePlayerClose: function() {
      this.audioSource = null;
      this.$emit('update:sampleData', null);
      this.$emit('update:showAudioPlayer', false);
    }
    
  }
};
</script>

<style lang="scss">
@import "~@/_variables.scss";
@import url('https://fonts.googleapis.com/css2?family=Inconsolata&display=swap');

#audio-player {
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
  margin-top: 5px !important;
  padding: 11px 0px 11px;
  @include themify($themes) {
    background: themed(backColor);
  }
  
  .vueAudioBetter {
    font-family: 'Inconsolata', monospace;
    overflow: visible;
    display: block;
    max-width: 686px;
    margin: 0 auto;
    width: auto;
    height: auto;
    padding: 0px;
    box-shadow: unset;
    background: none;
    @include themify($themes) {
      color: themed(frontColor);
    }
    
    .iconfont.icon-notificationfill {
      display: none;
    }
    .slider {
      flex-grow: 1;
      margin: 0 20px 0 26px !important;
    }
    span {
      font-size: 14px !important;
    }
    .iconfont {
      font-size: 16px !important;
    }
  }

  .vueAudioBetter span,
  svg,
  a {
    @include themify($themes) {
      color: themed(frontColor) !important;
    }
  }
  
  
  .vueAudioBetter .operate {
    height: auto;
    margin-top: 4px;
    line-height: 14px;
    font-size: 0px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    justify-items: center;
    align-content: center;
    align-items: center;
    > * {
      margin-left: 7px;
      &:first-child { margin-left: 0;}
    }
    .close {
      cursor: pointer;
      &, svg {
        display: inherit;
        width: 16px;
        height: 16px;
      }
    }
  }
  
  .book {
    cursor: pointer;
    display: block;
    font-size: 14px;
    line-height: 17px;
  }
  
}

.theme-light #audio-player .vueAudioBetter .slider {
  background: rgba($lightFrontColor, .15);
}
</style>
