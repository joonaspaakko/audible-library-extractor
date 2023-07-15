<template>
  
  <div v-if="$store.state.checkingWishlistAccess">
    
    <div class="progress-wrapper">
      <progress class="progress is-warning is-large" max="100" style="min-width: 288px;">75%</progress>
      <small style="font-size: 12px;">Checking for wishlist access...</small>
    </div>
    
  </div>
  <div v-else-if="$store.state.noWishlistAccess">
    
    <article class="message is-warning wishlist-login-wrapper">
      <div class="message-body">
        Try to open your
        <a @click.prevent="wishlistLinkClicked" target="_blank" rel="noopener noreferrer" :href="'https://audible'+ domainExtension +'/wishlist'">audible{{ domainExtension }}/wishlist</a> and login when asked. <br>
        After that try  to redo the extraction. <strong>The link will open in a new tab!</strong>
      </div>
    </article>
    
  </div>
  <div id="ale-progress-wrap" v-else>
    <transition name="fade">
      <div class="loader-image">
        <img height="72" :src="imageSources.loader" alt="" />
      </div>
    </transition>

    <div class="ale-big-step" :class="{ 'sub-step-exists': store.subStep.max > 0 }" v-if="store.bigStep.title">
      <h2>
        {{ store.bigStep.title }}&nbsp;
        <!-- <span class="step" v-if="bigSteps">{{ bigSteps }}</span> -->
        <small class="step" v-if="store.subStep.max > 0">({{ subSteps }})</small>
      </h2>
    </div>
    
    <!-- <div>
      <div class="sub-step-wrapper" v-if="store.subStep.max > 0">
        <small class="step" >{{ store.bigStep.title }} sub steps {{ subSteps }}</small>
      </div>
    </div> -->

    <div class="ale-progress" v-visible="store.progress.text">  
      <div>
        <div class="ale-step-text">
          <div class="ale-step-additional-info" v-visible="store.progress.text2">
            {{ store.progress.text2 }}
          </div>
          {{ store.progress.text }}
          <transition name="fade" v-if="steps"><span>{{ steps }}</span></transition>
          {{ store.progress.textsuffix }}
        </div>        
      </div>
    </div>
    
    <div
      class="ale-bar"
      v-visible="store.progress.bar && store.progress.step && store.progress.max"
      :class="{ 'scale-in-hor-center': store.progress.bar }"
    >
      <div class="ale-step-line" :style="progressWidth"></div>
    </div>
    
    <div
      v-show="store.progress.thumbnail"
      style="text-align: center; margin-top: 20px; height: 110px;"
    >
      <img :src="store.progress.thumbnail" alt="" style="max-height: 110px;" />
    </div>
    
    <!-- <div v-if="store.taking_a_break"><iconoir-coffee-cup style="font-size: 20px;" /></div>
    <div v-if="store.lastFailedRequestStatus">status: {{ store.lastFailedRequestStatus }}</div> -->
    
    <div class="footnote">
      Keep this tab and the browser window on top until the extraction is completed.
    </div>
    
  </div>
</template>

<script>
export default {
  name: "scrapingProgress",
  props: ["domainExtension"],
  data() {
    return {
      store: this.$store.state,
      imageSources: {
        logo: chrome.runtime.getURL("assets/images/audible-library-extractor-logo.svg"),
        loader: chrome.runtime.getURL("assets/images/loader-64px.gif")
      },
    };
  },
  computed: {
    steps: function() {
      return this.store.progress.step > 0 ? this.store.progress.step + " / " + this.store.progress.max : this.store.progress.max;
    },

    bigSteps: function() {
      return this.store.bigStep.step > 0 ? this.store.bigStep.step + " / " + this.store.bigStep.max : this.store.bigStep.max;
    },
    
    subSteps: function() {
      return this.store.subStep.step > 0 ? this.store.subStep.step + " / " + this.store.subStep.max : this.store.subStep.max;
    },

    progressWidth: function() {
      return { width: (this.store.progress.step / this.store.progress.max) * 100 + "%" };
    }
  },
  
  methods: {
    wishlistLinkClicked( e ) {
      
      this.$store.commit('update', { key: 'sticky.openOnLoad', value: true });
      chrome.runtime.sendMessage({ action: "refresh", url: window.location.origin + window.location.pathname });
      chrome.runtime.sendMessage({ action: "newPage", url: e.target.href });      
      
    }
  },
};
</script>

<style scoped src="@node/bulma/css/bulma.css"></style>

<style lang="scss" scoped>
#ale-progress-wrap {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  text-align: center;
}

.ale-big-step {
  display: inline-block;
  text-align: center;
  box-sizing: border-box;
  margin: 30px 0 25px;
  // &.sub-step-exists {
  //   margin-bottom: 15px;
  // }
  h2 {
    font-size: 19px;
    line-height: 21px;
    padding: 0px 8px 8px;
    box-sizing: border-box;
  }
  span {
    color: #999;
  }
}

.sub-step-wrapper {
  width: auto !important;
  display: inline-block !important;
  border-radius: 7px;
  box-shadow: inset 0 3px 10px rgba(#000,.15);
  padding: 5px 14px;
  // margin-bottom: 15px;
  margin-top: 15px;
  color: #999;
}

.ale-progress {
  > div,
  > div > div {
    display: inline-block;
  }
  font-size: 14px;
  color: #666;
  padding-bottom: 0px;
  > div,
  > div > div,
  .ale-step-additional-info {
    width: 100%;
  }
}
.ale-bar {
  padding: 2px;
  display: inline-block;
  width: 100%;
  max-width: 300px;
  height: 7px;
  background: #f8981c;
  border-radius: 9999px;
  // box-shadow: 0 0 50px rgba( #000, .3 ), 0 3px 6px rgba( #000, .1 );
  position: relative;
  z-index: 0;
  .ale-step-line {
    border-radius: 9999px;
    background: #fff;
    width: 0%;
    height: 100%;
  }
}

.ale-step-additional-info {
  font-size: 13px;
  color: #7a7a7a;
}

.footnote {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  color: #999;
  z-index: 10;
  background: #fff;
  &:before {
    content: '';
    position: absolute;
    top: -10px;
    right: 0;
    left: 0;
    z-index: 0;
    height: 10px;
    width: 100%;
    background: rgb(255,255,255);
    background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);
  }
}

.progress-wrapper {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  .progress { margin-bottom: 0 !important; }
  small {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 5;
  }
}

.wishlist-login-wrapper {
  max-width: 500px;
  margin: 0 auto;
}
</style>
