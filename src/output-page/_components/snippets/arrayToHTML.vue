<template>
  <div :class="identifierClass" v-if="inputDataExists">
    <strong class="strong-label">{{ label }}:</strong>
    <span v-for="(item, index) in array" :key="item.name + '(' + index + ')'">
      <span>
        <span v-if="index !== 0">{{ delim || ", " }}</span>
        <a :href="makeUrl(label.toLowerCase(), item)" target="_blank">{{
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
  props: ["label", "array", "delim"],
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
