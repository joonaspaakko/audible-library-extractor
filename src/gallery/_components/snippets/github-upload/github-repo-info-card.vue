<template>
  <div class="repo-info-card">

    <!-- PAGES LINK -->
    <a
      v-if="repoInfo.pagesUrl"
      :href="`${repoInfo.pagesUrl.replace(/\/$/, '')}/?v=${new Date(repoInfo.pushedAt).getTime()}#/${hashRoute}`"
      target="_blank"
      class="pages-url-prominent"
    >
      <mdi:web class="pages-url-icon" />
      <span>{{ repoInfo.pagesUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') }}</span>
      <span
        v-if="repoInfo.pagesStatus"
        class="pages-status"
        :class="[ repoInfo.pagesStatus, { 'just-checked': justChecked } ]"
      >{{ repoInfo.pagesStatus }}</span>
      <!-- Manual single re-check of the publish status. Stops propagation so it doesn't open the link.
           Disabled while a check is in flight and during the cooldown after one. -->
      <mdi:refresh
        v-if="repoInfo.pagesStatus && repoInfo.pagesStatus !== 'none'"
        class="pages-refresh"
        :class="{ disabled: recheckDisabled, checking: repoInfo.pagesChecking }"
        @click.prevent.stop="recheck"
      />
    </a>
    <!-- Fallback: pages not set up -->
    <div v-else class="repo-info-row">
      <span class="info-label">Website</span>
      <span class="info-value" style="opacity:0.35">not set up</span>
    </div>
    
    <!-- REPO LINK -->
    <div class="repo-info-row">
      <span class="info-label">Repository</span>
      <a :href="`https://github.com/${login}/${repoInfo.name}`" target="_blank" class="info-link">
        github.com/{{ login }}/{{ repoInfo.name }}
      </a>
    </div>

    <!-- LAST UPLOADED -->
    <div class="repo-info-row">
      <span class="info-label">Last upload</span>
      <span class="info-value info-value-with-tip">
        {{ formatDate(repoInfo.pushedAt) }}
        <mdi:information-outline
          class="info-tip-icon"
          v-tippy="{ content: formatDateTime(repoInfo.pushedAt), placement: 'right', flipBehavior: ['left', 'top', 'bottom'] }"
        />
      </span>
    </div>

    <!-- CREATED DATE -->
    <div class="repo-info-row">
      <span class="info-label">Created</span>
      <span class="info-value info-value-with-tip">
        {{ formatDate(repoInfo.createdAt) }}
        <mdi:information-outline
          class="info-tip-icon"
          v-tippy="{ content: formatDateTime(repoInfo.createdAt), placement: 'right', flipBehavior: ['left', 'top', 'bottom'] }"
        />
      </span>
    </div>

    <!-- TIMES UPLOADED -->
    <div class="repo-info-row">
      <span class="info-label">Uploads</span>
      <span class="info-value">{{ repoInfo.commitCount !== null ? repoInfo.commitCount : '…' }}</span>
    </div>

    <!-- GITHUB VISIBILITY (Seems unnecessary...?) -->
    <div class="repo-info-row">
      <span class="info-label">Visibility</span>
      <span class="info-value">
        <mdi:lock v-if="repoInfo.private" />
        <mdi:earth v-else />
        {{ repoInfo.private ? 'private' : 'public' }}
      </span>
    </div>

    <!-- TOPICS (tags) -->
    <div class="repo-info-row">
    
      <span class="info-label">Topics</span>
      
      <span class="info-value topics-value">
      
        <!-- Other topics (non-ale) -->
        <span v-for="topicName in nonAleTopics" :key="topicName" class="repo-topic">{{ topicName }}</span>
        
        <!-- ALE topics: always on the right -->
        <span class="topics-right">
          <span v-for="topicName in aleRepoTopics" :key="topicName" class="repo-topic ale-topic">{{ topicName }}</span>
          <!-- Remove ALE tag/topic -->
          <mdi-minus-box
            v-if="repoInfo.isAleRepo"
            class="topic-action remove"
            @click="$emit('tag-remove', repoInfo.name)"
            v-tippy="{ content: `Remove ALE tags: ${aleTopics.join(', ')}.`, placement: 'top-end', flipBehavior: ['left', 'right', 'bottom'] }"
          />
          <!-- Add ALE tag/topic -->
          <mdi:plus-box
            v-else
            class="topic-action add"
            @click="$emit('tag-add', repoInfo.name)"
            v-tippy="{ content: 'Tag as ALE project so that you can upload into it and filter by it in the project dropdown. Newly created projects are tagged automatically.', placement: 'top-end', maxWidth: 300, flipBehavior: ['left', 'right', 'bottom'] }"
          />
        </span> <!-- .topics-right -->
        
      </span> <!-- .info-value -->
      
    </div> <!-- .repo-info-row -->

  </div>
</template>

<script>
import githubUtilsMixin from './github-utils.mixin.js';

export default {
  mixins: [ githubUtilsMixin ],

  props: {
    repoInfo : { type: Object, required: true },
    login    : { type: String, required: true },
    aleTopics: { type: Array, default: () => [] },
    hashRoute: { type: String, default: 'library' },
  },

  emits: ['tag-add', 'tag-remove', 'recheck'],

  data() {
    return {
      justChecked: false,
      justCheckedTimer: null,
      cooldown: false,
      cooldownTimer: null,
    };
  },

  watch: {
    // When a manual re-check finishes ( pagesChecking flips back to false ): flash the status badge
    // so the user gets feedback even when the status came back unchanged, and start a short cooldown
    // so a spam-clicker can't keep re-firing the moment each fast response lands.
    'repoInfo.pagesChecking'( checking, wasChecking ) {

      if ( wasChecking && !checking ) {

        // Badge flash
        this.justChecked = false; // Reset first so re-triggering restarts the animation
        clearTimeout( this.justCheckedTimer );

        this.$nextTick( () => {
          this.justChecked = true;
          this.justCheckedTimer = setTimeout( () => { this.justChecked = false; }, 900 );
        });

        // Cooldown
        this.cooldown = true;
        clearTimeout( this.cooldownTimer );
        this.cooldownTimer = setTimeout( () => { this.cooldown = false; }, 5000 );

      }

    },
  },

  beforeUnmount() {
    clearTimeout( this.justCheckedTimer );
    clearTimeout( this.cooldownTimer );
  },

  computed: {
    recheckDisabled() {
      return this.repoInfo.pagesChecking || this.cooldown;
    },

    nonAleTopics() {
      return this.repoInfo.topics.filter( t => !this.aleTopics.includes( t ) );
    },

    aleRepoTopics() {
      return this.repoInfo.topics.filter( t => this.aleTopics.includes( t ) );
    },
  },

  methods: {
    recheck() {

      // pointer-events: none already blocks clicks while disabled, but guard here too in case the
      // event still slips through ( touch, keyboard ).
      if ( this.recheckDisabled ) return;

      this.$emit( 'recheck', this.repoInfo.name );

    },
  },
};
</script>

<style scoped lang="scss">
.repo-info-card {
  margin-top: 8px;
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  @include themify($themes) {
    background: themed(panelColor);
    border: 1px solid rgba( themed(frontColor), .08 );
  }
  .theme-light & {
    background: #fcfcfc;
    border: 1px solid #d9d9d9;
  }
  
  .repo-info-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    font-size: 0.92em;
    gap: 6px;
    border-bottom: 1px dashed rgba(#000, .08);
    .theme-dark & { border-color: rgba(#fff, .05); }
  }

  .info-label {
    align-self: flex-start;
    opacity: 0.55;
  }

  .info-value {
    opacity: 0.85;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  .info-value-with-tip {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .info-tip-icon {
    opacity: 0.35;
    font-size: 1em;
    cursor: default;
    flex-shrink: 0;

    &:hover { opacity: 0.7; }
  }

  .info-link {
    // Reads like the other info rows ( green is reserved for the .io status link ). The
    // global #audible-library-extractor a:visited rule wins on specificity ( id selector ),
    // so the visited override needs !important.
    @include themify($themes) { color: themed(frontColor); }
    &:visited { @include themify($themes) { color: themed(frontColor) !important; } }
    text-decoration: none;
    font-size: 0.92em;
    opacity: 0.85;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    direction: rtl;
    text-align: left;

    &:hover { text-decoration: underline; }
  }

  .pages-url-prominent {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px;
    margin-bottom: 4px;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.92em;
    overflow: hidden;
    
    .theme-dark & {
      * { color: #fff; }
      background: rgba(#fff, .02);
      border: 1px solid rgba(#fff, .05);
      &:hover { 
        background: rgba(#fff, .07); 
        border: 1px solid rgba(#fff, .09);
      }
    }
    .theme-light & {
      * { color: #151515; }
      background: rgba(#000, .04);
      border: 1px solid rgba(#000, .09);
      &:hover { background: rgba(#000, .02); }
    }
    
    .pages-url-icon { flex-shrink: 0; font-size: 1.17em; }

    // Bold so the URL itself stands out; the globe and status badge keep their own colors.
    span:nth-child(2) {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      direction: rtl;
      text-align: left;
      unicode-bidi: plaintext;
      font-weight: 600;

      .theme-dark & { color: #fff; }
      .theme-light & { color: #151515; }
    }
  }

  .pages-status {
    font-size: 0.84em;
    padding: 1px 5px;
    border-radius: 3px;
    flex-shrink: 0;

    @include themify($themes) { background: rgba( themed(frontColor), .12 ); }

    // One-shot flash after a manual re-check, so the user sees something happened even if the status
    // came back unchanged.
    &.just-checked { animation: pages-status-flash 0.9s ease-out; }

    &.built    { 
      @include themify($themes) { background: rgba(themed(greenColor), 0.12); color: themed(greenColor); } 

      .theme-light & { 
        $color: #4bde80;
        background: color.adjust(color.adjust($color, $lightness: -20%), $saturation: 20%);
        border: 1px solid color.adjust($color, $lightness: -10%);
        color:  color.adjust($color, $lightness: 100%);
      }
      
    }
    &.building { 
      background: rgba(#f97316, 0.15); color: #f97316; 
      .theme-light & { 
        $color: #f97316;
        background: color.adjust(color.adjust($color, $lightness: -10%), $saturation: 10%);
        border: 1px solid color.adjust($color, $lightness: 1%);
        color:  color.adjust($color, $lightness: 100%);
      }
    }
    &.errored  { 
      background: rgba(#ef4444, 0.15); color: #ef4444; 
      .theme-light & { 
        $color: #ef4444;
        background: color.adjust(color.adjust($color, $lightness: -20%), $saturation: 10%);
        border: 1px solid color.adjust($color, $lightness: 10%);
        color:  color.adjust($color, $lightness: 100%);
      }
    }
  }

  .pages-refresh {
    flex-shrink: 0;
    cursor: pointer;
    opacity: 0.5;
    font-size: 1.08em;
    outline: none;
    -webkit-tap-highlight-color: transparent;

    &:hover:not(.disabled) { opacity: 1; }

    // Disabled: in flight, or in the cooldown right after. Dimmed so it reads as resting. Clicks are
    // gated in the recheck handler, not via pointer-events ( that would also kill hover ).
    &.disabled {
      opacity: 0.3;
      cursor: default;
    }

    // Only spins while the request is actually in flight, not during the cooldown that follows.
    &.checking { animation: pages-refresh-spin 0.7s linear infinite; }
  }

  .repo-topic {
    font-size: 0.84em;
    padding: 1px 5px;
    border-radius: 3px;
    flex-shrink: 0;
    @include themify($themes) {
      border: 1px solid rgba( themed(frontColor), .15 );
      background: rgba( themed(frontColor), .1 );
      color: themed(frontColor);
    }

    &.ale-topic {
      .theme-dark & { background: rgba(#00ed00, 0.1); color: #00ed00; }
      .theme-light & { background: #1faa1f; color: #fff; }
    }
  }

  .topics-value {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap-reverse;
    margin-bottom: 3px;

    & .topics-right {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }
  }
}

.topic-action {
  cursor: pointer;
  opacity: 0.5;
  font-size: 1.17em;
  
  &:hover { opacity: 1; }
  .theme-light & { opacity: 1; }
  
  &.add { color: #4ade80; }
  &.remove { color: #ef4444; }
}

@keyframes pages-refresh-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pages-status-flash {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5); }
  100% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); }
}
</style>
