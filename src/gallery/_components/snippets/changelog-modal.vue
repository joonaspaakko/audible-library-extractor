<template>
<n-config-provider :theme="lightTheme">
<n-modal
  :show="show"
  preset="card"
  title="What's new"
  style="width: 640px; max-width: 90vw;"
  :bordered="false"
  size="medium"
  @update:show="$emit('update:show', $event)"
>
  <n-collapse class="changelog-body" :default-expanded-names="[ latestVersionName ]">
    <n-collapse-item
      v-for="versionBlock in changeLog"
      :key="versionBlock.version"
      :title="versionBlock.version"
      :name="versionBlock.version"
    >
      <div v-if="versionBlock.highlights" class="version-highlights">
        <div class="version-highlights-label">Highlights from this version</div>
        <div v-html="versionBlock.highlights"></div>
      </div>
      <n-tree
        block-line
        expand-on-click
        :selectable="false"
        :indent="0"
        :data="treeData(versionBlock)"
        :default-expanded-keys="categoryKeys(versionBlock)"
        :render-switcher-icon="renderSwitcherIcon"
        :render-label="renderLabel"
        :node-props="nodeProps"
        class="changelog-tree"
      />
    </n-collapse-item>
  </n-collapse>

  <div class="project-info">
    <div class="project-links">
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/joonaspaakko/audible-library-extractor">Source</a>
      <span class="divider">·</span>
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/joonaspaakko/audible-library-extractor/issues">Report an issue</a>
      <span class="divider">·</span>
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/joonaspaakko/audible-library-extractor/labels/bug">Known bugs</a>
    </div>

    <div class="project-badges-label">Latest releases by platform</div>
    <div class="project-badges">
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/joonaspaakko/audible-library-extractor/releases/latest">
        <img src="https://img.shields.io/github/v/release/joonaspaakko/audible-library-extractor?include_prereleases&label=Github&color=6e41bf" alt="">
      </a>
      <a target="_blank" rel="noopener noreferrer" href="https://chrome.google.com/webstore/detail/audible-library-extractor/deifcolkciolkllaikijldnjeloeaall">
        <img src="https://img.shields.io/chrome-web-store/v/deifcolkciolkllaikijldnjeloeaall?color=2acb41&label=Chrome" alt="">
      </a>
      <a target="_blank" rel="noopener noreferrer" href="https://addons.mozilla.org/en-US/firefox/addon/audible-library-extractor/">
        <img src="https://img.shields.io/amo/v/audible-library-extractor?label=Firefox" alt="">
      </a>
    </div>

    <div class="current-version">
      You're currently using version {{ $store.state.appVersion || $store.state.version }}.
    </div>
  </div>
</n-modal>
</n-config-provider>
</template>

<script>
import { h } from 'vue';
import { NConfigProvider, NModal, NCollapse, NCollapseItem, NTree, lightTheme } from 'naive-ui';
import changelog from "@output-mixins/changelog.js";
import IconFixed from '~icons/ph/check-circle-fill';
import IconImproved from '~icons/codicon/star-full';
import IconAdded from '~icons/ph/plus-circle-fill';
import IconRemoved from '~icons/ph/minus-circle-fill';
import IconInfo from '~icons/ph/info-fill';
import IconChevron from '~icons/ph/caret-right-bold';
import IconLink from '~icons/ph/link-simple-bold';

export default {
  name: 'changelogModal',
  props: [ 'show' ],
  emits: [ 'update:show' ],
  mixins: [ changelog ],
  components: { NConfigProvider, NModal, NCollapse, NCollapseItem, NTree },
  data: function() {
    return {
      lightTheme: lightTheme,
      typeIcons: {
        fixed: IconFixed,
        improved: IconImproved,
        added: IconAdded,
        removed: IconRemoved,
        info: IconInfo,
      },
      typeLabels: {
        fixed: 'Fixed',
        improved: 'Improved',
        added: 'Added',
        removed: 'Removed',
        info: 'Info',
      },
      typeColors: {
        fixed: '#f25954',
        improved: '#ba23ca',
        added: '#10c064',
        removed: '#f25500',
        info: '#8a8a8a',
      },
    };
  },
  computed: {
    latestVersionName: function() {
      return _.get( this.changeLog, '0.version' );
    },
  },
  methods: {

    // Turns a version's categories into n-tree nodes. A category without a
    // label (used pre-v.1.2.13) skips the parent node and its items become
    // top level nodes instead, so old versions render as a flat list.
    treeData: function( versionBlock ) {

      let nodes = [];
      _.forEach( versionBlock.categories, ( category ) => {
        let itemNodes = _.map( category.items, this.itemNode );
        if ( category.label ) {
          nodes.push({
            key: this.categoryKey( versionBlock, category ),
            label: category.label,
            subLabel: category.subLabel,
            count: category.items.length,
            isCategory: true,
            children: itemNodes,
          });
        }
        else {
          nodes.push( ...itemNodes );
        }
      });

      return nodes;

    },

    itemNode: function( item, index ) {
      return {
        key: item.title + index,
        item: item,
        isLeaf: true,
      };
    },

    categoryKey: function( versionBlock, category ) {
      return versionBlock.version + '-' + category.label;
    },

    // Categories default to expanded, keeping every section visible without an extra click.
    categoryKeys: function( versionBlock ) {
      return _( versionBlock.categories )
        .filter( 'label' )
        .map( ( category ) => this.categoryKey( versionBlock, category ) )
        .value();
    },

    renderSwitcherIcon: function({ option }) {
      if ( !option.isCategory ) return null;
      return h(IconChevron);
    },

    nodeProps: function({ option }) {
      return option.isCategory ? {} : { class: 'changelog-item-node' };
    },

    renderLabel: function({ option }) {
      if ( option.isCategory ) {
        return h('span', { class: 'changelog-category-label' }, [
          option.label + ' (' + option.count + ')',
          option.subLabel ? h('span', { class: 'changelog-category-sublabel' }, option.subLabel) : null,
        ]);
      }

      let item = option.item;
      let icon = this.typeIcons[ item.type ];
      let label = this.typeLabels[ item.type ];
      let color = this.typeColors[ item.type ];

      let badge = h('div', {
        class: [ 'changelog-item-badge', item.type === 'improved' ? 'changelog-item-badge--improved' : '' ],
        style: { color: color, background: color + '1a' },
        title: label,
      }, icon ? h(icon) : null);

      let body = [
        h('div', { class: 'changelog-item-title' }, item.title),
        item.description ? h('div', { class: 'changelog-item-description', innerHTML: item.description }) : null,
      ];

      let children = [
        badge,
        h('div', { class: 'changelog-item-body' }, body),
      ];

      if ( item.issue ) {
        children.push( h('a', {
          class: 'changelog-item-issue',
          target: '_blank',
          rel: 'noopener noreferrer',
          href: this.changelogIssueUrl( item.issue ),
          onClick: ( e ) => e.stopPropagation(),
        }, [ h(IconLink), '#' + item.issue ]) );
      }

      return h('div', {
        class: [ 'changelog-item', item.issue ? 'changelog-item--linked' : '' ],
        style: { '--changelog-item-accent': color },
      }, children);

    },

  },
}
</script>

<style lang="scss">

.changelog-category-sublabel {
  margin-left: 6px;
  font-size: 0.8em;
  font-weight: 400;
  color: #a5a5a5;
}

.changelog-tree {

  .changelog-item-node .n-tree-node-switcher {
    display: none;
  }

  .n-tree-node-switcher {
    width: 24px !important;
  }

  .n-tree-node-content {
    align-items: center;
    padding: 4px 0;
  }

  .n-tree-node-content__text {
    display: flex;
    align-items: center;
    min-height: 22px;
  }

  .changelog-item-node .n-tree-node-content__text {
    display: block;
  }

  .n-tree-node.changelog-item-node,
  .n-tree-node.changelog-item-node:not(.n-tree-node--disabled):hover {
    background: transparent !important;
    cursor: default;
  }

}

.changelog-item {
  --changelog-item-accent: #b5b5b5;
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 9px 10px 9px 12px;
  border: 1px solid #ededed;
  border-left: 3px solid var(--changelog-item-accent);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / .03);
  cursor: default;
  transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;

  &.changelog-item--linked:hover {
    border-color: #e2e2e2;
    border-left-color: var(--changelog-item-accent);
    background: #fcfcfc;
    box-shadow: 0 2px 6px rgb(0 0 0 / .06);
  }
}

.changelog-item-body {
  flex: 1 1 auto;
  min-width: 0;
}

.changelog-item-badge {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  margin-top: 1px;
  border-radius: 9999px;

  svg {
    font-size: 1.2em;
  }

  &--improved svg {
    font-size: 0.9em;
  }
}

.changelog-item-title {
  font-size: 0.92em;
  font-weight: 600;
  line-height: 1.4;
}

.changelog-item-description {
  margin-top: 5px;
  font-size: 0.85em;
  line-height: 1.5;
  color: #767676;
}

.changelog-item-issue {
  align-self: flex-start;
  flex: 0 0 auto;
  margin-top: 1px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 9999px;
  background: #f2f2f2;
  color: #868686;
  font-size: 0.78em;
  white-space: nowrap;
  text-decoration: none;
  transition: color 150ms ease, background 150ms ease;

  // Expands the click target to the whole card (its nearest positioned ancestor) without wrapping the card in an <a>.
  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  &:hover {
    color: #fff;
    background: var(--changelog-item-accent);
  }
}

.changelog-body {
  --n-title-font-size: 17px !important;
  --n-title-font-weight: 700 !important;
  text-align: left;
  max-height: 50vh;
  overflow: auto;
  padding: 4px 4px 4px 0;

  .n-collapse-item__content-wrapper .n-collapse-item__content-inner {
    padding-left: 14px;
  }
}

.version-highlights {
  padding: 12px;
  margin: 0 0 7px;
  background: linear-gradient(155deg, rgb(64 130 220 / .07), rgb(64 130 220 / .02));
  border: 1px solid rgb(64 130 220 / .18);
  border-radius: 8px;
  font-size: 0.85em;
  line-height: 1.45;

  .version-highlights-label {
    margin-bottom: 17px;
    color: #4082dc;
    font-size: 0.8em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .highlight-notice {
    position: relative;
    margin: 9px 0 10px;
    padding: 9px 14px 9px 16px;
    color: #4a4a4a;
    background: rgb(242 89 84 / .06);
    border: 1px solid rgb(242 89 84 / .22);
    border-left: 3px solid #f25954;
    border-radius: 6px;

    p {
      margin: 0;
    }
  }

  .highlight-badge {
    position: absolute;
    top: -11px;
    left: 10px;
    display: inline-block;
    padding: 3px 10px;
    color: #fff;
    background: #f25954;
    border-radius: 9999px;
    font-weight: 700;
    box-shadow: 0 2px 4px rgb(242 89 84 / .3);
  }

  ul {
    display: grid;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    position: relative;
    padding: 8px 10px;
    color: #565656;
    background: #fff;
    border: 1px solid rgb(64 130 220 / .14);
    border-radius: 6px;
  }

  li strong {
    color: #1a1a1a;
    font-weight: 700;
  }
}

.project-info {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #ededed;
  font-size: 0.78em;
  text-align: center;
  color: #b5b5b5;

  a {
    color: #8a8a8a;
    text-decoration: underline;
    &:hover { color: #4d4d4d; }
  }

  .divider {
    margin: 0 6px;
  }

  .project-badges-label {
    margin-top: 14px;
    color: #222;
    font-size: 0.9em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .project-badges {
    margin-top: 10px;
    img { display: inline-block; margin: 2px; }
  }

  .current-version {
    margin-top: 8px;
    color: #717171;
  }
}

</style>
