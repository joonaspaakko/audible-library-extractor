<template>
  <div class="basic-info">
    <arrayToHTML v-if="book.authors" label="Author" :array="book.authors" ></arrayToHTML>
    <arrayToHTML v-if="book.narrators" label="Narrator" :array="book.narrators" ></arrayToHTML>
    <arrayToHTML v-if="book.series" label="Series" :array="book.series" ></arrayToHTML>
    <arrayToHTML v-if="book.publishers" label="Publisher" :array="book.publishers" ></arrayToHTML>
    
    <div v-if="book.length">
      <strong class="strong-label">Length:</strong>
      {{ book.length }}
    </div>

    <div class="line-it-up">
      <div class="rating" v-if="book.rating">
        <strong class="strong-label">Rating:</strong>
        <!-- <span>{{ book.rating }} ({{ book.ratings }} ratings)</span> -->
        <star-rating :size="12" :rating="book.rating" number="true" :ratings="book.ratings"></star-rating>
      </div>
      <div class="own-rating" v-if="book.myRating">
        <strong class="strong-label">My rating: </strong>
        <star-rating :size="12" v-tippy="{ placement: 'right', flipBehavior: ['right', 'top', 'bottom']  }" :content="myRatingLabel( book.myRating )" :rating="book.myRating" number="true"></star-rating>
      </div>
    </div>
    <!-- <good-reads-link v-if="goodreads" :book="book"></good-reads-link> -->
  </div>
</template>

<script>
import arrayToHTML from "./arrayToHTML";
import goodReadsLink from "./goodReadsLink";
import starRating from '@output-comps/snippets/starRatings';

export default {
  name: "aleBookBasicInfo",
  props: ["book", "goodreads"],
  components: {
    goodReadsLink,
    arrayToHTML,
    starRating,
  },
  
  methods: {
    myRatingLabel: function( rating ) {
      
      switch ( parseFloat(rating) ) {
        case 1:
          return 'Not for me';
          break;
        case 2:
          return 'It’s okay';
          break;
        case 3:
          return 'Pretty good';
          break;
        case 4:
          return 'It’s great';
          break;
        case 5:
          return 'I love it';
          break;
      }
      
    },
  },
  
};
</script>

<style lang="scss" scoped>
.line-it-up {
  > * {
    display: inline-block;
  }
}

</style>
