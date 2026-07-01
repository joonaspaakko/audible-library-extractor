<template>
<n-config-provider :theme="lightTheme">
<n-modal
  :show="show"
  preset="card"
  title="What's new"
  style="width: 480px; max-width: 90vw;"
  :bordered="false"
  size="medium"
  @update:show="$emit('update:show', $event)"
>
  <n-collapse class="changelog-body" :default-expanded-names="allVersionNames">
    <n-collapse-item
      v-for="versionBlock in changeLog"
      :key="versionBlock.version"
      :title="versionBlock.version"
      :name="versionBlock.version"
    >
      <div v-if="versionBlock.highlights" class="version-highlights">{{ versionBlock.highlights }}</div>
      <n-timeline class="ale-changelog-list">
        <n-timeline-item
          v-for="(change, index) in versionBlock.changes"
          :key="index"
          :color="changeColors[change.class]"
        >
          <template #icon>
            <div class="changelog-dot"></div>
          </template>
          <a v-if="change.link" target="_blank" rel="noopener noreferrer" :href="change.link.href">
            <strong v-if="change.highlight">{{ change.link.text }}</strong>
            <template v-else>{{ change.link.text }}</template>
          </a><template v-if="change.link">: </template>{{ change.description }}
        </n-timeline-item>
      </n-timeline>
    </n-collapse-item>
  </n-collapse>

  <div class="project-info">
    <a target="_blank" rel="noopener noreferrer" href="https://github.com/joonaspaakko/audible-library-extractor">Source</a>
    <span class="divider">·</span>
    <a target="_blank" rel="noopener noreferrer" href="https://github.com/joonaspaakko/audible-library-extractor/issues">Report an issue</a>
    <span class="divider">·</span>
    <a target="_blank" rel="noopener noreferrer" href="https://github.com/joonaspaakko/audible-library-extractor/labels/bug">Known bugs</a>

    <div class="project-badges">
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/joonaspaakko/audible-library-extractor/releases/latest">
        <img src="https://img.shields.io/github/v/release/joonaspaakko/audible-library-extractor?include_prereleases&label=latest%20release%20(Github)&color=6e41bf" alt="">
      </a>
      <a target="_blank" rel="noopener noreferrer" href="https://chrome.google.com/webstore/detail/audible-library-extractor/deifcolkciolkllaikijldnjeloeaall">
        <img src="https://img.shields.io/chrome-web-store/v/deifcolkciolkllaikijldnjeloeaall?color=2acb41&label=latest%20release%20(Chrome)" alt="">
      </a>
      <a target="_blank" rel="noopener noreferrer" href="https://addons.mozilla.org/en-US/firefox/addon/audible-library-extractor/">
        <img src="https://img.shields.io/amo/v/audible-library-extractor?label=latest%20release%20(Firefox)" alt="">
      </a>
    </div>

    <div class="current-version">
      You're currently using version {{ $store.state.appVersion }}.
    </div>
  </div>
</n-modal>
</n-config-provider>
</template>

<script>
import { NConfigProvider, NModal, NCollapse, NCollapseItem, NTimeline, NTimelineItem, lightTheme } from 'naive-ui';
import changelog from "@output-mixins/changelog.js";

export default {
  props: [ 'show' ],
  emits: [ 'update:show' ],
  mixins: [ changelog ],
  components: { NConfigProvider, NModal, NCollapse, NCollapseItem, NTimeline, NTimelineItem },
  data: function() {
    return {
      changeColors: {
        fixed: '#f25954',
        improved: '#ba23ca',
        added: '#10c064',
        removed: '#f25500',
      },
    };
  },
  computed: {
    allVersionNames: function() {
      return _.map( this.changeLog, 'version' );
    },
  },
}
</script>

<style lang="scss">

.ale-changelog-list {
  margin-top: 6px;
}

.changelog-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: currentColor;
}

.changelog-body {
  --n-title-font-size: 17px !important;
  --n-title-font-weight: 700 !important;
  text-align: left;
  max-height: 50vh;
  overflow: auto;
  padding: 4px 4px 4px 0;
}

.version-highlights {
  padding: 6px;
  margin: 0 0 7px;
  color: rgb(128 93 54);
  background: rgb(246, 153, 50, .06);
  border: 1px solid rgb(246, 153, 50, .2);
  font-size: 0.85em;
}

.project-info {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #ededed;
  font-size: 0.78em;
  text-align: center;
  color: #b5b5b5;

  a {
    color: #b5b5b5;
    text-decoration: underline;
    &:hover { color: #717171; }
  }

  .divider {
    margin: 0 6px;
  }

  .project-badges {
    margin-top: 10px;
    opacity: 0.35;
    transition: opacity 200ms ease;
    img { display: inline-block; margin: 2px; }
    &:hover { opacity: 1; }
  }

  .current-version {
    margin-top: 8px;
  }
}

</style>
