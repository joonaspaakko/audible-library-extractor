<template>
  <div id="audio-player" v-if="audioSource">
    <mini-audio
      :audio-source="audioSource"
      preload
      autoplay
      ref="audioPlayer"
    ></mini-audio>
    <div class="custom-icons" :class="{ 'book-index-known': index }">
      <div class="book" :content="book.title" v-tippy>
        <router-link :to="{ path: route.path, query: { book: book.asin } }">
          <font-awesome fas icon="book" />
        </router-link>
        <!-- <font-awesome fas icon="book" @click="samplePlayerBook" /> -->
      </div>
      <div class="close">
        <font-awesome fas icon="times-circle" @click="samplePlayerClose" />
      </div>
    </div>
  </div>
  <!-- #audio-player -->
</template>

<script>

export default {
  name: "audioPlayer",
  data: function() {
    return {
      title: null,
      audioSource: null,
      index: null,
      route: null
    };
  },

  created: function() {
    this.$root.$on("play-audio", this.startPlaying);
  },

  beforeDestroy: function() {
    this.$root.$off("play-audio", this.startPlaying);
  },

  methods: {
    startPlaying: function(msg) {
      
      this.audioSource = msg.book.sample;
      this.book = msg.book;
      if (msg.index) this.index = msg.index;
      if (msg.route) this.route = msg.route;
      
    },

    samplePlayerBook: function() {
      const vue = this;
      if (vue.index) {
        // Eventbus.$emit("galleryBookClick", {
          // from: "sample-audio-player",
          // index: vue.index,
          // animationSpeed: 1500,
          // dontClose: true
        // });
      }
    },

    samplePlayerClose: function() {
      this.audioSource = null;
    }
  }
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

#audio-player {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  max-width: 400px;
  margin: 0 auto;
  position: fixed;
  z-index: 900;
  right: 0px;
  bottom: 15px;
  left: 0px;
  .vueAudioBetter {
    max-width: 400px;
    margin: 0;
    width: auto;
    padding-right: 72px;
    @include themify($themes) {
      background: themed(audibleOrange);
      box-shadow: themed(shadowSmall);
    }

    // color: $lightFrontColor;
    .iconfont.icon-notificationfill {
      display: none;
    }
    .slider {
      flex-grow: 1;
      margin-left: 15px;
    }
  }
  .custom-icons {
    position: absolute;
    top: 0;
    right: 14px;
    bottom: 0;
    font-size: 16px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-content: center;
    justify-items: center;
    align-items: center;

    &.book-index-known .book,
    .close {
      cursor: pointer;
    }

    > div {
      margin-left: 10px;
      &:first-child {
        margin-left: 0px;
      }
      outline: none;
      &:active {
        position: relative;
        top: 2px;
        left: 2px;
      }
    }
  }

  .vueAudioBetter span,
  svg,
  a {
    // cursor: default;
    color: rgba(#111, 0.95) !important;
  }
}
</style>
