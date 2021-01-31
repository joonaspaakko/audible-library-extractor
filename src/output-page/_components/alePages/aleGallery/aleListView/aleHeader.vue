<template>
  <div class="list-view-header ale-row">
    <tr class="ale-row-inner">
      <th
        v-for="(item, index) in headers"
        :key="item.label"
        class="header-item ale-col"
        :class="item.class"
      >
        <col-resizer :identifier="item.class"></col-resizer>
        <div class="ale-col-inner">
          
          <sorter
            v-if="sorterIndex(item) > -1" 
            :label="false"
            :item="sorterItem(item.key)"
            :index="sorterIndex(item)"
            :currentList="optionsList" 
            :listName="listName"
          >
            <span class="text-container">{{ item.label }}</span>
          </sorter>
          <span v-else class="text-container">{{ item.label }}</span>
        </div>
      </th>
    </tr>
  </div>
</template>

<script>
import colResizer from "./colResizer";
import sorter from "../../../snippets/sorter";

export default {
  name: "aleHeader",
  props: ["keys"],
  components: {
    colResizer,
    sorter
  },
  data: function() {
    return {
      listName: 'sort',
      optionsList: null,
      headers: null
    };
  },

  created: function() {
    this.optionsList = this.$store.state.listRenderingOpts[ this.listName ];
    this.headers = this.prepareHeaders(this.keys);
    // FIXME: need to first of all add the missing ".name" sorters and I alo need to add generic sorters to some of the other columns
  },

  methods: {
    prepareHeaders: function(keys) {
      const vue = this;
      return _.map(keys, function(key) {
        const header = {
          key: key,
          label: _.startCase(key),
          align: "left",
          class: "col-" + _.kebabCase(key)
        };

        switch (key) {
          case "titleShort":
          case "title":
            header.class = header.class + " sticky-col";
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
@import "~@/_variables.scss";
</style>
