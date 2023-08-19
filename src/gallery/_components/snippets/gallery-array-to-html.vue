<template>
  <div class="array-list-wrapper" :class="identifierClass" v-if="inputDataExists">
    <strong class="strong-label" v-if="!noLabel">{{ label }}:</strong>
    <span clas="array-item" v-for="(item, index) in array" :key="item.name + '(' + index + ')'">
      <span v-if="index !== 0">
        <span v-if="chevron" class="chevron">
          <fa-solid-chevron-right/>
        </span>
        <span v-else>{{ delim || ", " }}</span>
      </span>
      <span>
        
        
        <a :href="makeUrl(label.toLowerCase(), item, (!$store.state.sticky.detailLinksToAudible ? array : null))" :target="$store.state.sticky.detailLinksToAudible ? '_blank' : null" rel="noopener noreferrer">
          {{ item.name }}
          
          <span v-if="item.bookNumbers" class="book-number">
            (book
              <span v-for="(number, index) in item.bookNumbers">
                <span v-if="index !== 0">{{ "," }}</span>
                <span>{{ number }}</span>
              </span>)
          </span>
        </a>
        
      </span>
    </span>
  </div>
</template>

<script>
import makeUrl from "@output-mixins/gallery-makeFullUrl.js";

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

// .array-list-wrapper span {
//   display: inline-flex;
//   justify-content: center;
//   align-items: center;
// }

.chevron {
  @include themify($themes) { color: rgba(themed(frontColor), .7); };
  font-size: 9px;
  line-height: 9px;
  padding: 1px 4px 0 1px;
  display: inline-block;
}

.book-number {
  @include themify($themes) { color: rgba(themed(frontColor), .9); };
  white-space: nowrap;
}

</style>