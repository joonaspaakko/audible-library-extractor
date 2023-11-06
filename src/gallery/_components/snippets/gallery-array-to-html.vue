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
        <component :is="routerOrLink(label.toLowerCase()).tag" v-bind:[routerOrLink(label.toLowerCase()).attr]="makeUrl(label.toLowerCase(), item, (!$store.state.sticky.detailLinksToAudible ? array : null))" :target="$store.state.sticky.detailLinksToAudible ? '_blank' : null" rel="noopener noreferrer">
          {{ item.name }}<span v-if="item.bookNumbers" class="book-number"> (book {{ stringifyBookNumbers(item.bookNumbers) }})</span>
        </component>
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
    },
  },

  methods: {
    checkIfArrayHasData: function() {
      return this.array && !_.isEmpty( this.array );
    },
    stringifyBookNumbers( numbers ) {
      return _.isArray(numbers) ? _.join(numbers, ',') : numbers;
    },
    routerOrLink( label ) {
      if ( !this.$store.state.sticky.detailLinksToAudible && !(label === 'store' || label === 'book') ) {
        return {
          tag: "router-link",
          attr: 'to',
        };
      }
      else {
        return {
          tag: "a",
          attr: 'href',
        };
      }
    }
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
  padding: 0px 4px 0 4px;
  display: inline-block;
  position: relative;
  top: 1px;
  display: inline-block;
}

.book-number {
  @include themify($themes) { color: rgba(themed(frontColor), .9); };
  white-space: nowrap;
}

</style>