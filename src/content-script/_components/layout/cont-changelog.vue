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
  <n-collapse class="changelog-body" :default-expanded-names="allVersionNames">
    <n-collapse-item
      v-for="versionBlock in changeLog"
      :key="versionBlock.version"
      :title="versionBlock.version"
      :name="versionBlock.version"
    >
      <div v-if="versionBlock.highlights" class="version-highlights" v-html="versionBlock.highlights"></div>
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
import { h } from 'vue';
import { NConfigProvider, NModal, NCollapse, NCollapseItem, NTree, lightTheme } from 'naive-ui';
import changelog from "@output-mixins/changelog.js";
import IconFixed from '~icons/ph/check-circle-fill';
import IconImproved from '~icons/ph/arrow-circle-up-fill';
import IconAdded from '~icons/ph/plus-circle-fill';
import IconRemoved from '~icons/ph/minus-circle-fill';
import IconInfo from '~icons/ph/info-fill';
import IconChevron from '~icons/ph/caret-right-bold';
import IconLink from '~icons/ph/link-simple-bold';

export default {
  props: [ 'show' ],
  emits: [ 'update:show' ],
  mixins: [ changelog ],
  components: { NConfigProvider, NModal, NCollapse, NCollapseItem, NTree },
  data: function() {
    return {
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
    allVersionNames: function() {
      return _.map( this.changeLog, 'version' );
    },
  },
  methods: {

    // Turns a version's categories into n-tree nodes. A category without a
    // label (used pre-v.1.0.0) skips the parent node and its items become
    // top level nodes instead, so old versions render as a flat list.
    treeData: function( versionBlock ) {

      let nodes = [];
      _.forEach( versionBlock.categories, ( category ) => {
        let itemNodes = _.map( category.items, this.itemNode );
        if ( category.label ) {
          nodes.push({
            key: this.categoryKey( versionBlock, category ),
            label: category.label + ' (' + category.items.length + ')',
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
      if ( option.isCategory ) return option.label;

      let item = option.item;
      let icon = this.typeIcons[ item.type ];
      let label = this.typeLabels[ item.type ];
      let color = this.typeColors[ item.type ];

      let tag = h('div', { class: 'changelog-item-tag', style: { color: color, background: color + '1a' } }, [
        icon ? h(icon) : null,
        label,
      ]);

      let body = [
        h('div', { class: 'changelog-item-title' }, item.title),
        item.description ? h('div', { class: 'changelog-item-description', innerHTML: item.description }) : null,
      ];

      let children = [
        tag,
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

      return h('div', { class: [ 'changelog-item', item.issue ? 'changelog-item--linked' : '' ] }, children);

    },

  },
}
</script>

<style lang="scss">

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
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ededed;
  border-radius: 6px;
  background: #fafafa;
  cursor: default;

  &.changelog-item--linked:hover {
    border-color: #d5d5d5;
    background: #f2f2f2;
  }
}

.changelog-item-body {
  flex: 1 1 auto;
  min-width: 0;
}

.changelog-item-tag {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100px;
  padding: 2px 7px;
  border-radius: 9999px;
  font-size: 0.78em;
  font-weight: 600;
  white-space: nowrap;

  svg {
    font-size: 1.4em;
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
  background: #ededed;
  color: #767676;
  font-size: 0.78em;
  white-space: nowrap;
  text-decoration: none;

  // Expands the click target to the whole card (its nearest positioned ancestor) without wrapping the card in an <a>.
  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  &:hover { color: #4d4d4d; }
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
