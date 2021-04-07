<template>
  <div class="icons">
    <div class="icon-wrap" v-tippy content="Visible books">
      <div class="book-in-selection">
        <div class="inner-wrap">
          {{ $store.getters.collection.length }}
        </div>
      </div>
    </div>

    <div
      v-for="item in items"
      :key="item.name"
      class="icon-wrap"
      :class="{ disabled: !item.on }"
      v-tippy
      :content="item.tooltip"
      @click="openSearchOptions(item, $event)"
    >
      <div
        v-if="item.name !== 'scope' && $store.state.listRenderingOpts[ item.name ].length > 0 || item.name === 'scope' && $store.state.listRenderingOpts[ item.name ].length > 1"
        class="search-opt-btn"
        :data-option="item.name"
        :class="{ active: listName === item.name }"
      >
        <font-awesome fas :icon="item.icon" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "searchIcons",
  props: ["listName"],
  data: function() {
    return {
      items: [
        {
          name: "scope",
          on: true,
          active: false,
          icon: "microscope",
          tooltip: "Change the search scope for more accurate results"
        },
        {
          name: "filter",
          on: true,
          active: false,
          icon: "filter",
          tooltip: "Filter books"
        },
        {
          name: "sort",
          on: true,
          active: false,
          icon: "sort",
          tooltip: "Sort books"
        }
      ]
    };
  },

  methods: {
    openSearchOptions: function(clickedOption, e) {
      const listBeforeClick = this.listName;
      this.$emit("update:listName", false);
      if (listBeforeClick !== clickedOption.name) {
        this.$nextTick(function() {
          this.$emit("update:listName", clickedOption.name);
        });
      }
    }
  }
};
</script>


<style lang="scss" scoped>
  @import "~@/_variables.scss";
  
  .book-in-selection {
    -webkit-touch-callout: none; 
    -webkit-user-select: none; 
    -khtml-user-select: none; 
    -moz-user-select: none; 
    -ms-user-select: none; 
    user-select: none; 
  }
  
</style>
