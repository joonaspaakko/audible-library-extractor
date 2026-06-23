<template>
  <div class="list-view-header ale-row">
    <tr class="ale-row-inner">
      <th
        v-for="(item, index) in headers"
        :key="item.label"
        class="header-item ale-col"
        :class="item.class"
        @contextmenu.prevent="$emit('open-column-menu', $event)"
        @mousedown.right.stop
      >
        <gallery-col-resizer :identifier="item.class"></gallery-col-resizer>
        <div class="ale-col-inner">
          
          <gallery-sorter
            v-if="sorterIndex(item) > -1" 
            :label="false"
            :item="sorterItem(item.key)"
            :index="sorterIndex(item)"
            :currentList="optionsList" 
            :listName="listName"
            :tippyTop="true"
          >
            {{ item.label }}
          </gallery-sorter>
          <span v-else class="text-container">{{ item.label }}</span>
        </div>
      </th>
    </tr>
  </div>
</template>

<script>
export default {
  name: "aleHeader",
  props: ["keys", "frozenKeys"],
  emits: ["open-column-menu"],
  data: function() {
    return {
      listName: 'sort',
      optionsList: null,
    };
  },

  created: function() {
    this.optionsList = this.$store.state.listRenderingOpts[ this.listName ];
  },

  computed: {
    // Recomputes when the keys prop changes so the header tracks live column visibility.
    headers() {
      return this.prepareHeaders(this.keys);
    },
  },

  methods: {
    prepareHeaders: function(keys) {
      const vue = this;
      const frozen = this.frozenKeys || [];
      return _.map(keys, function(key) {
        const header = {
          key: key,
          label: _.startCase(key),
          align: "left",
          class: "col-" + _.kebabCase(key)
        };

        // Frozen columns carry sticky-col; the generated stylesheet sets each one's left offset.
        if ( _.includes( frozen, key ) ) header.class = header.class + " sticky-col";

        switch (key) {
          case "authors":
          case "narrators":
          case "publishers":
          case "tags":
            header.key += '.name';
            break;
        }

        return header;
      });
    },

    sorterIndex: function(item) {
      return _.findIndex(this.optionsList, {
        key: item.key
      });
    },

    sorterItem: function(name) {
      const regex = new RegExp("^" + name);
      return _.find(this.optionsList, function(o) {
        return o.key.match(regex);
      });
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
