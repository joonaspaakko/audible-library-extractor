<template>
  <div class="repo-info-card">

    <!-- HEADLINE: pages URL + status, last upload as a sub-label underneath -->
    <a
      v-if="repoInfo.pagesUrl"
      :href="`${repoInfo.pagesUrl.replace(/\/$/, '')}/?v=${new Date(repoInfo.pushedAt).getTime()}#/${hashRoute}`"
      target="_blank"
      class="headline-row"
    >
      <mdi:web class="headline-icon" />
      <div class="headline-text">
        <div class="headline-url-row">
          <span class="headline-url">{{ repoInfo.pagesUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') }}</span>
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
        </div>
        <div class="headline-sub">Last upload {{ formatDate(repoInfo.pushedAt) }} &middot; {{ repoInfo.commitCount !== null ? repoInfo.commitCount : '…' }} uploads total</div>
      </div>
    </a>
    <!-- Fallback: pages not set up -->
    <div v-else class="headline-row headline-row-empty">
      <mdi:web class="headline-icon" />
      <div class="headline-text">
        <div class="headline-url-row"><span class="headline-url" style="opacity:0.5">Website not set up</span></div>
        <div class="headline-sub">Last upload {{ formatDate(repoInfo.pushedAt) }} &middot; {{ repoInfo.commitCount !== null ? repoInfo.commitCount : '…' }} uploads total</div>
      </div>
    </div>

    <!-- TOGGLE BAR (same text/icon treatment as the Advanced settings header, for consistency) -->
    <div class="details-toggle-bar" @click="detailsExpanded = !detailsExpanded">
      <fa6-solid-circle-info class="settings-icon" />
      Project details
      <fa6-solid-chevron-right class="section-chevron section-chevron-right" :class="{ expanded: detailsExpanded }" />
    </div>

    <!-- EXPANDED DETAILS -->
    <div class="details-extra" v-show="detailsExpanded">

      <!-- REPO LINK -->
      <div class="repo-info-row">
        <span class="info-label">Repository</span>
        <a :href="`https://github.com/${login}/${repoInfo.name}`" target="_blank" class="info-link">
          github.com/{{ login }}/{{ repoInfo.name }}
        </a>
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

      <!-- GITHUB VISIBILITY -->
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

          <!-- ALE topic(s): the real topic name doubles as a toggle, dashed/gray when absent, green when present.
               Rendered first so it lands leftmost/first-wrapped alongside the other topics, per topics-value's
               wrap-reverse + flex-end layout, rather than breaking onto its own line. -->
          <span
            v-for="topicName in aleTopics"
            :key="topicName"
            class="repo-topic ale-toggle"
            :class="{ on: repoInfo.isAleRepo }"
            @click="repoInfo.isAleRepo ? $emit('tag-remove', repoInfo.name) : $emit('tag-add', repoInfo.name)"
            v-tippy="{
              content: repoInfo.isAleRepo ? 'This topic is what marks the repo as an ALE project. Click to remove it.' :
                                            'Not tagged yet. Click to add this topic, which is required before you can upload into this repo.',
              placement: 'top-end', maxWidth: 260, flipBehavior: ['left', 'right', 'bottom'],
            }"
          >
            <span class="ale-toggle-check"><fa-solid-check/></span>
            {{ topicName }}
          </span>

          <!-- Other topics (non-ale, read-only) -->
          <span v-for="topicName in nonAleTopics" :key="topicName" class="repo-topic">{{ topicName }}</span>

        </span> <!-- .info-value -->

      </div> <!-- .repo-info-row -->

    </div> <!-- .details-extra -->

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
      detailsExpanded: false,
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
  border-radius: 8px;
  overflow: hidden;
  @include themify($themes) {
    border: 1px solid rgba(themed(frontColor), .08);
  }
  .theme-light & { border-color: #d9d9d9; }
}

.headline-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  text-decoration: none;
  cursor: pointer;

  .theme-dark & { * { color: #fff; } }
  .theme-light & { * { color: #151515; } }

  &.headline-row-empty { cursor: default; }
}

.headline-icon {
  flex-shrink: 0;
  font-size: 1.17em;
  opacity: 0.6;
}

.headline-text {
  flex: 1;
  min-width: 0;
}

.headline-url-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.headline-url {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl;
  text-align: left;
  unicode-bidi: plaintext;
}

.headline-sub {
  margin-top: 2px;
  font-size: 0.78em;
  opacity: 0.5;
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

// Text/icon sizing and color match .settings-accordion-header in github.vue exactly, so the
// details toggle and the Advanced settings header read as the same kind of control.
.details-toggle-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  font-size: 0.85em;
  cursor: pointer;
  user-select: none;
  @include themify($themes) {
    color: rgba(themed(frontColor), .6);
    background: rgba(themed(frontColor), .04);
    border-top: 1px solid rgba(themed(frontColor), .08);
  }
  .theme-light & { border-top-color: rgba(#000, .08); }
}

.settings-icon {
  flex-shrink: 0;
  font-size: 0.85em;
}

.section-chevron {
  flex-shrink: 0;
  transition: transform 150ms ease;
  font-size: 0.85em;
  &.expanded { transform: rotate(90deg); }
}

.section-chevron-right {
  margin-left: auto;
}

.details-extra {
  padding: 9px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  @include themify($themes) {
    border-top: 1px solid rgba(themed(frontColor), .08);
  }
  .theme-light & { border-top-color: rgba(#000, .08); }
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
  // global #audible-library-extractor a / a:visited rules win on specificity ( id
  // selector ), so both states need !important here.
  @include themify($themes) { color: themed(frontColor) !important; }
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
}

.ale-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: opacity 120ms ease, background 120ms ease, border-color 120ms ease, color 120ms ease;

  // Off: reads as a placeholder for a topic that isn't there yet, not an active tag.
  border-style: dashed;
  opacity: 0.5;

  &:hover { opacity: 0.85; }

  &.on {
    opacity: 1;
    border-style: solid;
    // Same subtle tint as the "built" pages-status badge in this card, so the two green
    // accents read as one consistent status language instead of competing for attention.
    @include themify($themes) { background: rgba(themed(greenColor), .12); color: themed(greenColor); }
    .theme-light & {
      $color: #4bde80;
      background: color.adjust(color.adjust($color, $lightness: -20%), $saturation: 20%);
      border: 1px solid color.adjust($color, $lightness: -10%);
      color:  color.adjust($color, $lightness: 100%);
    }
  }
}

// Small checkbox-style square, matching .visual-checkbox elsewhere in this panel, so the
// toggle affordance reads the same way regardless of which control the user is looking at.
.ale-toggle-check {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
  @include themify($themes) { border: 1px solid rgba(themed(frontColor), .3); }

  svg { width: 70%; visibility: hidden; }

  .ale-toggle.on & {
    border-color: currentcolor;
    svg { visibility: visible; }
  }
}

.topics-value {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 3px;
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
