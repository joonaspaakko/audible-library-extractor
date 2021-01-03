<template>
  <div class="basic-info">
    <arrayToHTML v-if="book.authors"    label="Author"    :array="book.authors"    :general="general"></arrayToHTML>
    <arrayToHTML v-if="book.narrators"  label="Narrator"  :array="book.narrators"  :general="general"></arrayToHTML>
    <arrayToHTML v-if="book.series"     label="Series"    :array="book.series"     :general="general"></arrayToHTML>
    <arrayToHTML v-if="book.publishers" label="Publisher" :array="book.publishers" :general="general"></arrayToHTML>
    <div v-if="book.length">
      <strong class="strong-label">Length:</strong>
      {{ book.length }}
    </div>
    
    <div class="line-it-up">
      <div class="rating" v-if="book.rating">
        <strong class="strong-label">Overall rating:</strong> <span>{{ book.rating }} ({{ book.ratings }} ratings)</span>
      </div>
      <div class="own-rating" v-if="book.myRating">
        <strong class="strong-label">My rating:</strong> <span>{{ book.myRating }}</span>
      </div>
    </div>
    <!-- <good-reads-link v-if="goodreads" :book="book" :general="general"></good-reads-link> -->
    
  </div>
</template>

<script>

import arrayToHTML from './arrayToHTML'
import goodReadsLink from './goodReadsLink'

export default {
  name: 'aleBookBasicInfo',
  props: ['book', 'general', 'goodreads'],
  components: {
    goodReadsLink,
    arrayToHTML,
  },
}
</script>

<style lang="scss" scoped>
  .line-it-up {
    > * {
      display: inline-block;
    }
  }
</style>
