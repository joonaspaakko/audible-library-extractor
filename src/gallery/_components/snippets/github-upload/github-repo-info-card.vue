<template>
  <div class="repo-info-card">

    <!-- PAGES LINK -->
    <a
      v-if="repoInfo.pagesUrl"
      :href="`${repoInfo.pagesUrl.replace(/\/$/, '')}/#/${hashRoute}?tt=${new Date(repoInfo.pushedAt).getTime()}`"
      target="_blank"
      class="pages-url-prominent"
    >
      <mdi:web class="pages-url-icon" />
      <span>{{ repoInfo.pagesUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') }}</span>
      <span v-if="repoInfo.pagesStatus" class="pages-status" :class="repoInfo.pagesStatus">{{ repoInfo.pagesStatus }}</span>
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

  emits: ['tag-add', 'tag-remove'],

  computed: {
    nonAleTopics() {
      return this.repoInfo.topics.filter( t => !this.aleTopics.includes( t ) );
    },

    aleRepoTopics() {
      return this.repoInfo.topics.filter( t => this.aleTopics.includes( t ) );
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
    color: #4ade80;
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

    span:nth-child(2) {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      direction: rtl;
      text-align: left;
      unicode-bidi: plaintext;
    }
  }

  .pages-status {
    font-size: 0.84em;
    padding: 1px 5px;
    border-radius: 3px;
    flex-shrink: 0;

    @include themify($themes) { background: rgba( themed(frontColor), .12 ); }

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
</style>
