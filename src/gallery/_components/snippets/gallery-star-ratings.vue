<template>
  <div class="sRatings-wrapper" :data-rating="rating || 0" v-if="config.rating" :class="{ 'sRatings-block': block || opt.block, 'prioritize-ratings-text': prioritizeRatingsText }">
    <div class="rating-count" v-if="ratings && prioritizeRatingsText"><span v-html="ratings"></span><span v-if="ratingsText !== false"> ratings</span></div>
    <div v-for="(star, index) in config.length" :key="index" :data-star="star" :data-whole="config.rating.whole === star" :data-fraction="config.rating.fraction && config.rating.whole === star-1" :style="{ width: ((config.rating.whole === star-1 && (noPlaceholder || opt.noPlaceholder) && config.rating.fraction) ? (((size || opt.size)*config.rating.originalFraction)+'px') : (size || opt.size)+'px'), height: (size || opt.size)+'px' }">
      <div class="sRatings-placeholder" v-if="config.rating.whole <= star && !(noPlaceholder || opt.noPlaceholder)" :style="{ left: (config.rating.fraction && config.rating.whole === star-1) ? config.rating.fraction+'%' : '0%', 'background-size': (size || opt.size)+'px', 'background-image': (image || placeholderImage || opt.placeholderImage) ? ('url('+ ((image && !placeholderImage) ? image : (placeholderImage || opt.placeholderImage)) +')') : false, opacity: (placeholderOpacity || opt.placeholderOpacity) }" :class="{ 'sRatings-show': config.rating.whole < star }"></div>
      <div class="sRatings-star" v-if="config.rating.whole >= star || (config.rating.fraction && config.rating.whole === star-1)" :style="{ width: (config.rating.whole >= star || (config.rating.whole === star-1 && (noPlaceholder || opt.noPlaceholder))) ? '100%' : config.rating.fraction+'%', 'background-size': (size || opt.size)+'px', 'background-image': (image || opt.image) ? 'url('+ (image || opt.image) +')' : false }"></div>
    </div>
    <div class="text-label" :style="{ width: (numberOf || opt.numberOf) ? 'auto' : false, padding: (numberOf || opt.numberOf) ? '0 6px' : false }" v-if="number || opt.number" v-html="(numberOf || opt.numberOf) ? (rating +'/'+ (stars || opt.stars)) : rating"></div>
    <div class="rating-count" v-if="ratings && !prioritizeRatingsText">(<span v-html="ratings"></span><span v-if="ratingsText !== false"> ratings</span>)</div>
  </div>
</template>

<script>
export default {
  
  name: 'starRating',
  props: ['size','rating','stars','ratings', 'ratingsText', 'prioritizeRatingsText', 'number', 'numberOf', 'block', 'image', 'placeholderImage', 'placeholderOpacity', 'noPlaceholder'],
  
  data: function() {
    return {
      opt: null,
      config: {
        rating: null,
        length: null,
      }
    };  
  },
  
  created: function() {
    
    this.opt = {
      rating: 5,
      stars : 5,
      size  : 15,
      number: false,
      numberOf: false,
      block : false,
      image: false,
      placeholderImage: false,
      placeholderOpacity: false,
      noPlaceholder: false,
    };
    
    const rating = this.splitDecimals( this.rating );
    this.config.rating  = this.toPercentage( rating );
    const noPlaceholder = (this.noPlaceholder || this.opt.noPlacehoder);
    this.config.length = noPlaceholder ? this.config.rating.whole + (this.config.rating.fraction ? 1 : 0) : parseInt( this.stars || this.opt.stars, 10);
    
  },
  methods: {
    
    splitDecimals: function( input ) {
      
      const inputString = ''+input;
      let splitInput;
      if ( inputString.indexOf(".") > -1 ) {
        splitInput = inputString.split('.');
      }
      else if ( inputString.indexOf(",") > -1 ) {
        splitInput = inputString.split(',');
      }
      
      if ( splitInput ) return { whole: splitInput[0], fraction: '.'+splitInput[1] }; 
      else return { whole: input, fraction: null };
      
    },
    
    toPercentage: function( rating ) {
      let percentage = { whole: parseInt( rating.whole, 10) };
      if ( rating.fraction ) percentage.originalFraction = rating.fraction;
      if ( rating.fraction ) percentage.fraction = Math.floor( parseFloat( rating.fraction, 10) * 100 );
      return percentage;
    },
    
  },
}
</script>

<style scoped lang="scss">
  .sRatings-wrapper {
    vertical-align: middle;
    $star-size: 15px; 
    font-size: 0;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    
    &.sRatings-block { display: flex; }
    [data-star] {
      margin-left: 2px;
      &:first-child { margin-left: 0; }
      margin-top: 1px;
      margin-bottom: 1px;
      display: inline-block;
      width: $star-size;
      height: $star-size;
      position: relative;
      z-index: 0;
      
      > div { overflow: hidden; }
      
      .sRatings-placeholder.sRatings-show { display: inline-block; }
      .sRatings-placeholder {
        display:none;
        background-position: top right;
        background-repeat: no-repeat;
        background-size: $star-size;
        background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA0Ny42OSI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNjMWMxYzE7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5zdGFyLWdyYXk8L3RpdGxlPjxnIGlkPSJMYXllcl8yIiBkYXRhLW5hbWU9IkxheWVyIDIiPjxnIGlkPSJMYXllcl8xLTIiIGRhdGEtbmFtZT0iTGF5ZXIgMSI+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNTAsMTguNDhhMi4xNywyLjE3LDAsMCwxLS43OCwxLjQ0TDM4LjMxLDMwLjU2bDIuNTksMTVhNC41NCw0LjU0LDAsMCwxLDAsLjYsMS43OSwxLjc5LDAsMCwxLS4zMiwxLjA3LDEuMDcsMS4wNywwLDAsMS0uOTIuNDQsMi40MywyLjQzLDAsMCwxLTEuMi0uMzZMMjUsNDAuMjNsLTEzLjQ5LDcuMWEyLjU1LDIuNTUsMCwwLDEtMS4yLjM2LDEuMSwxLjEsMCwwLDEtMS0uNDRBMS43OSwxLjc5LDAsMCwxLDksNDYuMThhNC44Nyw0Ljg3LDAsMCwxLC4wNi0uNmwyLjU5LTE1TC43NSwxOS45MkEyLjI5LDIuMjksMCwwLDEsMCwxOC40OHEwLTEuMTEsMS42OC0xLjM4bDE1LjA5LTIuMkwyMy41MywxLjIzUTI0LjEsMCwyNSwwdDEuNDcsMS4yM0wzMy4yMywxNC45bDE1LjA5LDIuMlE1MCwxNy4zNyw1MCwxOC40OFoiLz48L2c+PC9nPjwvc3ZnPg==");
        position: absolute;
        z-index: 2;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
      .sRatings-star.sRatings-hide { display: none; }
      .sRatings-star {
        width: 100%;
        height: 100%;
        background-position: top left;
        background-repeat: no-repeat;
        background-size: $star-size;
        background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA0Ny42OSI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmODk4MWM7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5zdGFyLW9yYW5nZTwvdGl0bGU+PGcgaWQ9IkxheWVyXzIiIGRhdGEtbmFtZT0iTGF5ZXIgMiI+PGcgaWQ9IkxheWVyXzEtMiIgZGF0YS1uYW1lPSJMYXllciAxIj48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik01MCwxOC40OGEyLjE3LDIuMTcsMCwwLDEtLjc4LDEuNDRMMzguMzEsMzAuNTZsMi41OSwxNWE0LjU0LDQuNTQsMCwwLDEsMCwuNiwxLjc5LDEuNzksMCwwLDEtLjMyLDEuMDcsMS4wNywxLjA3LDAsMCwxLS45Mi40NCwyLjQzLDIuNDMsMCwwLDEtMS4yLS4zNkwyNSw0MC4yM2wtMTMuNDksNy4xYTIuNTUsMi41NSwwLDAsMS0xLjIuMzYsMS4xLDEuMSwwLDAsMS0xLS40NEExLjc5LDEuNzksMCwwLDEsOSw0Ni4xOGE0Ljg3LDQuODcsMCwwLDEsLjA2LS42bDIuNTktMTVMLjc1LDE5LjkyQTIuMjksMi4yOSwwLDAsMSwwLDE4LjQ4cTAtMS4xMSwxLjY4LTEuMzhsMTUuMDktMi4yTDIzLjUzLDEuMjNRMjQuMSwwLDI1LDB0MS40NywxLjIzTDMzLjIzLDE0LjlsMTUuMDksMi4yUTUwLDE3LjM3LDUwLDE4LjQ4WiIvPjwvZz48L2c+PC9zdmc+");
        position: relative;
        z-index: 5;
      }
    }
    .text-label { 
      position: relative; 
      top: 1px;
      text-align: center; 
      display: inline-block; 
      font-size: 11px; 
      width: $star-size*1.4; 
      height: $star-size*1.4; 
      line-height: $star-size*1.4; 
      border: 1px solid #e1e1e1; 
      border-radius: 999px; 
      margin-left: 5px;
      margin-top: 1px;
      margin-bottom: 1px;
    }
    // It might be better if ratings text was only shown on hover...? Though that would make it hard to find on mobile.
    .rating-count {
      position: relative;
      top: 1px;
      display: inline-block;
      color: #a1a1a1;
      font-size: 11px;
      margin-left: 5px;
      margin-top: 1px;
      margin-bottom: 1px;
    }
  }
  
  
  
  
  
.sRatings-wrapper {
  .text-label {
    border: none !important;
    font-size: 13px; 
    line-height: 13px; 
    width: auto !important;
    height: auto !important;
  }
  
  &.prioritize-ratings-text {
    .text-label {
      font-size: 11px; 
      line-height: 13px; 
    }
    .rating-count {
      font-size: 13px; 
      line-height: 13px; 
      margin-left: 0px;
      margin-right: 5px;
    }
  }
}
</style>