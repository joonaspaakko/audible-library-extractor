<template>
  <div class="complete-screen">
    <div class="complete-box">

      <!-- Checkmark icon -->
      <div class="complete-check-icon">
        <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
          <circle cx="12" cy="12" r="11" stroke="#4ade80" stroke-width="1.5"/>
          <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      
      <!-- Heading (title) -->
      <div class="complete-title">Upload complete</div>

      <!-- SITE CARD: status + URL in one clickable block -->
      <a
        v-if="pagesUrl"
        :href="`${pagesUrl.replace(/\/$/, '')}/?v=${timestamp}#/${hashRoute}`"
        target="_blank"
        class="site-card"
        :class="statusClass"
      >
        <!-- Site status -->
        <div class="site-status" :class="statusClass">
          <span                v-if="building || gaveUp" class="building-dot" />
          <mdi:check-circle  v-else-if="built"        class="status-icon" />
          <mdi:alert-circle  v-else-if="errored"      class="status-icon" />
          <span>{{ statusLabel }}</span>
          <span v-if="building" class="elapsed">({{ elapsedLabel }})</span>
        </div>

        <!-- Builds can take a few minutes on GitHub's side. Reassure the user the upload is already
             done and they're free to leave; waiting is only for inspecting the published site. -->
        <div v-if="building" class="building-note">
          <strong>The upload is complete, so you're free to leave.</strong> It's now up
          to GitHub to deploy the website, which shouldn't take more than a few minutes
          normally. Stick around if you want to check the published page immediately.
        </div>

        <!-- Poll gave up before the build resolved. The build is likely still running; we've just stopped
             watching. Styled like the building status (orange + pulsing dot) so it reads as "in progress, untracked". -->
        <div v-else-if="gaveUp" class="timed-out-note">
          This is taking longer than usual, so we've stopped asking build status for now.
          Your library is still uploaded and it should finish publishing on its own. You
          can check this Github upload window later to confirm it went live, or just visit
          the website later.
        </div>
        <!-- Site URL: only shown once the site is actually live. While building or after we give up,
             a visible (even disabled) link just invites lingering, which fights the "you're free to leave"
             message. Its appearance is the signal that it went live. -->
        <div v-if="built" class="site-url">
          <ph:link class="url-icon" />
          <span class="url-text">{{ cleanPagesUrl }}</span>
        </div>
      </a>
      
      <!-- Back button -->
      <button class="btn-ghost complete-back" @click="$emit('back')">← Back</button>

    </div> <!-- .complete-box -->
  </div> <!-- .complete-screen -->
</template>

<script>
import { format, secondsToMilliseconds } from 'date-fns';
import { utc } from '@date-fns/utc';

export default {
  props: {
    pagesUrl   : { type: String, default: null },
    pagesStatus: { type: String, default: null },
    timedOut   : { type: Boolean, default: false },
    timestamp  : { type: Number, default: null },
    hashRoute  : { type: String, default: 'library' },
  },
  emits: ['back'],
  data() {
    return {
      elapsed: 0,
      elapsedTimer: null,
    };
  },
  computed: {
  
    // Actively building: still polling and the build hasn't resolved. Once we time out we stop
    // listening, so we no longer treat it as "building" even though the last known status was.
    building() { return this.pagesStatus === 'building' && !this.timedOut; },
    built()    { return this.pagesStatus === 'built'; },
    errored()  { return this.pagesStatus === 'errored'; },

    // We stopped polling before the build resolved. The build itself is likely still running on
    // GitHub's side; we've just stopped watching it.
    gaveUp() { return this.timedOut && this.pagesStatus === 'building'; },

    statusClass() {
    
      if ( this.building ) return 'is-building';
      if ( this.gaveUp )   return 'is-building'; // Keep the orange "in progress" look; the build likely still is
      if ( this.built )    return 'is-built';
      if ( this.errored )  return 'is-errored';
      return 'is-pending';
      
    },

    statusLabel() {
    
      if ( this.building ) return 'Publishing site…';
      if ( this.gaveUp )   return 'Still publishing…';
      if ( this.built )    return 'Site is live';
      if ( this.errored )  return 'Publish failed';
      return 'Checking status…';
      
    },

    cleanPagesUrl() {
    
      if ( !this.pagesUrl ) return '';
      return this.pagesUrl.replace( /^https?:\/\//, '' ).replace( /\/$/, '' );
      
    },
    
    // Elapsed build time as "0m 5s", labeled so it's obvious it's a minutes/seconds timer.
    // Formatted in UTC so the local timezone offset can't bleed into the minutes/seconds.
    elapsedLabel() {
      return format( new Date( secondsToMilliseconds( this.elapsed ) ), "m'm' s's'", { in: utc } );
    },

  },

  watch: {
    // Run the elapsed counter only while the site is building, and stop it the moment
    // the build resolves so the final time stays frozen on screen.
    building: {
      immediate: true,
      handler( isBuilding ) {
        if ( isBuilding ) {
          this.startElapsed();
        }
        else {
          this.stopElapsed();
        }
      },
    },
  },

  beforeUnmount() {
    this.stopElapsed();
  },

  methods: {

    startElapsed() {
      if ( this.elapsedTimer ) return;
      this.elapsed = 0;
      this.elapsedTimer = setInterval( () => {
        this.elapsed++;
      }, 1000 );
    },

    stopElapsed() {
      if ( this.elapsedTimer ) {
        clearInterval( this.elapsedTimer );
        this.elapsedTimer = null;
      }
    },

  },
};
</script>

<style scoped lang="scss">
.complete-screen {
  display: flex;
  justify-content: center;
  padding: 8px 0;

  .complete-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    border-radius: 10px;
    padding: 24px 20px;
    width: 100%;
    text-align: center;

    @include themify($themes) {
      background: themed(panelColor);
      border: 1px solid rgba( themed(frontColor), .08 );
    }
    .theme-light & {
      background: #fcfcfc;
      border: 1px solid #d9d9d9;
    }
    
  }

  .complete-check-icon { line-height: 1; }

  .complete-title {
    font-size: 1.25em;
    font-weight: 600;

    @include themify($themes) { color: themed(frontColor); }
  }

  .site-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    text-decoration: none;
    overflow: hidden;
    box-sizing: border-box;

    @include themify($themes) {
      background: themed(elementColor);
      border: 1px solid rgba( themed(frontColor), .1 );
    }

    &:hover {
      @include themify($themes) { border-color: rgba( themed(frontColor), .22 ); }
    }

    // Disabled until the site is actually live
    &:not(.is-built) {
      pointer-events: none;
      cursor: default;
    }

    &.is-built .site-url {
      .theme-dark & { color: #34c0ff; }
      .theme-light & { color: #0061ac; }
    }
  }

  .site-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    font-size: 0.92em;

    @include themify($themes) {
      border-bottom: 1px solid rgba( themed(frontColor), .08 );
    }

    .status-icon { font-size: 1.15em; }

    .elapsed {
      font-variant-numeric: tabular-nums;
      opacity: 0.7;
    }

    &.is-building { color: #f97316; }
    &.is-built    { color: #4ade80; .theme-light & { color: #1faa1f; } }
    &.is-errored  { color: #ef4444; }
    &.is-pending  { @include themify($themes) { color: rgba( themed(frontColor), .4 ); } }
  }

  .building-note {
    padding: 8px 12px;
    font-size: 0.82em;
    text-align: center;

    @include themify($themes) {
      color: rgba( themed(frontColor), .45 );
      border-bottom: 1px solid rgba( themed(frontColor), .08 );
    }

    strong { font-weight: 600; }
  }

  .timed-out-note {
    padding: 10px 12px;
    margin: 8px;
    font-size: 0.82em;
    text-align: center;
    color: #f97316;
    border: 1px solid rgba(249, 115, 22, 0.35);
    border-radius: 6px;
  }

  .site-url {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 12px;
    font-size: 0.92em;
    // Neutral until live; green applied via .site-card.is-built above
    @include themify($themes) { color: rgba( themed(frontColor), .4 ); }

    .url-icon {
      flex-shrink: 0;
      opacity: 0.6;
    }

    .url-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      direction: rtl;
      text-align: left;
      unicode-bidi: plaintext;
    }
  }

  .complete-back {
    margin-top: 2px;
    font-size: 0.92em;
  }

  .building-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #f97316;
    flex-shrink: 0;
    animation: building-pulse 1.4s ease-in-out infinite;
  }
}

@keyframes building-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.75);
  }
  65% {
    transform: scale(1.15);
    box-shadow: 0 0 0 7px rgba(249, 115, 22, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
  }
}
</style>