<template>
  <div class="basic-info">
    <arrayToHTML v-if="book.authors" label="Author" :array="book.authors" ></arrayToHTML>
    <arrayToHTML v-if="book.narrators" label="Narrator" :array="book.narrators" ></arrayToHTML>
    <arrayToHTML v-if="book.series" label="Series" :array="book.series" ></arrayToHTML>
    <arrayToHTML v-if="book.publishers" label="Publisher" :array="book.publishers" ></arrayToHTML>
    <div v-if="book.length">
      <strong class="strong-label">Length:</strong>{{ book.length }}
    </div>

    <!-- <div class="line-it-up"> -->
      <div class="language" v-if="book.language">
        <strong class="strong-label">Language:</strong>
        <span>{{ book.language }}</span>
      </div>
      <div class="format" v-if="book.format">
        <strong class="strong-label">Format:</strong>
        <span>{{ book.format }}</span>
      </div>
      <div class="format" v-if="book.releaseDate" v-tippy content="YYYY-MM-DD">
        <strong class="strong-label">Release date:</strong>
        <span>{{ book.releaseDate }}</span>
      </div>
      <div class="rating" v-if="book.rating">
        <strong class="strong-label" v-tippy="ratingTippyOpts" :content="ratingLegend">Rating:</strong>
        <!-- <span>{{ book.rating }} ({{ book.ratings }} ratings)</span> -->
        <star-ratings :size="12" :rating="book.rating" number="true" :ratings="book.ratings"></star-ratings>
      </div>
      <div class="own-rating" v-if="book.myRating">
        <strong class="strong-label" v-tippy="ratingTippyOpts" :content="ratingLegend">My rating: </strong>
        <star-ratings :size="12" v-tippy="{ placement: 'right', flipBehavior: ['right', 'top', 'bottom']  }" :content="myRatingLabel( book.myRating )" :rating="book.myRating" number="true"></star-ratings>
      </div>
    <!-- </div> -->
    <!-- <good-reads-link v-if="goodreads" :book="book"></good-reads-link> -->
  </div>
</template>

<script>
export default {
  name: "aleBookBasicInfo",
  props: ["book", "goodreads"],
  data: function() {
    return {
      ratingTippyOpts: { 
        placement: 'top', 
        flipBehavior: ['top', 'right', 'left', 'bottom'], 
        allowHTML: true,
      },
      ratingLegend: `
        <style>
        .ratings-tippy {
          margin: 0; 
          padding: 0px 0px 0px 15px;
        }
        .ratings-tippy li {
          padding-bottom: 5px;
        }
        </style>
        <ol class="ratings-tippy">
          <li>Not for me</li>
          <li>It’s okay</li>
          <li>Pretty good</li>
          <li>It’s great</li>
          <li>I love it</li>
        </ol>
      `,
    };
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


:deep(.strong-label) {
  padding-right: 5px;
}

.line-it-up {
  > * {
    display: inline-block;
  }
}

</style>
