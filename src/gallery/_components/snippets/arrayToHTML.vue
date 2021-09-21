<template>
  <div :class="identifierClass" v-if="inputDataExists">
    <strong class="strong-label" v-if="!noLabel">{{ label }}:</strong>
    <span v-for="(item, index) in array" :key="item.name + '(' + index + ')'">
      <span>
        <span v-if="index !== 0">
          <span v-if="chevron" class="chevron">
            <font-awesome fas icon="chevron-right" />
          </span>
          <span v-else>{{ delim || ", " }}</span>
        </span>
        <a :href="makeUrl(label.toLowerCase(), item)" target="_blank" rel="noopener noreferrer">{{
          item.name
        }}</a
        ><span v-if="item.bookNumbers" class="book-number">
          (book
          <span v-for="(number, index) in item.bookNumbers"
            ><span v-if="index !== 0">{{ "," }}</span
            ><span>{{ number }}</span></span
          >)</span
        ></span
      >
    </span>
  </div>
</template>

<script>
import makeUrl from "@output-mixins/makeFullUrl";

export default {
  name: "arrayToHTML",
  data: function() {
    return {
      inputDataExists: null,
    };
  },
  props: ["label", "array", "delim", "noLabel", "chevron"],
  mixins: [makeUrl],
  created: function() {
    this.inputDataExists = this.checkIfArrayHasData();
  },

  computed: {
    identifierClass: function() {
      return "details-" + _.kebabCase(this.label);
    }
  },

  methods: {
    checkIfArrayHasData: function() {
      return this.array && !_.isEmpty( this.array );
    },
  }
};
</script>

<style scoped lang="scss">
@import "~@/_variables.scss";
.chevron {
  @include themify($themes) { color: rgba(themed(frontColor), .7); };
  font-size: 9px;
  line-height: 9px;
  padding-left: 5px;
  position: relative;
  top: -1px;
}
</style>