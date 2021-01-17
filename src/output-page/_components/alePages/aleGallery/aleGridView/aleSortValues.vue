<template>
  <div class="sort-values-container">
    
    <div v-if="$store.getters.sortBy !== 'favorite'" :class="'sort-'+$store.getters.sortBy" v-html="sortContents()"></div>
    <div v-else :class="'sort-'+$store.getters.sortBy">
      <font-awesome v-if="book.favorite" :icon="['fas', 'heart']" />
      <span v-else>&nbsp;</span>
    </div>
    
  </div>
</template>

<script>
import timeStringToSeconds from "../../../../_mixins/timeStringToSeconds";
import secondsToTimeString from "../../../../_mixins/secondsToTimeString";
import progressbarWidth from "../../../../_mixins/progressbarWidth";

export default {
  name: "sortValues",
  props: ["book"],
  mixins: [timeStringToSeconds, secondsToTimeString, progressbarWidth],
  data: function() {
    return {
      notAvailable: "N/A"
    };
  },
  
  created: function() {
    
    // console.log('%c' + 'SORT VALUES CREATED' + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;');
    
  },
  
  methods: {
    
    sortContents: function() {
      let sortKey = this.$store.getters.sortBy;
      
      switch( sortKey ) {
        
        case "bookNumbers":
          const numbersDelim = ", ";

            console.log( 'seriesNumbers' )
          if (this.book.series) {
            
            const seriesAsin = this.$route.params.series;
            const seriesNumbers = _.find(this.book.series, { asin: seriesAsin }).bookNumbers;
            if ( seriesNumbers ) {
              return _.isArray(seriesNumbers) ? seriesNumbers.join(numbersDelim) : seriesNumbers;
            }
            
          } else {
            return "";
          }
          break;
        case "authors.name":
        case "narrators.name":
        case "publishers.name":
          return _.get( this.book, sortKey.replace('.name', '[0].name') );
          break;
        case "rating":
          const ratings = this.book.ratings ? " <small>("+ this.book.ratings +")</small>" : "";
          return this.book[sortKey] + ratings;
          break;
        case "ratings":
          const rating = this.book.rating ? " <small>(" + this.book.rating + ")</small>" : "";
          return this.book[sortKey] + rating;
          break;
        case "progress":
            var css = this.progressbarWidth(this.book);
            return (
              this.progress(this.book) +
              '<div class="progress-bar">' +
              '<div style="width: ' + css.width +';"></div>' +
              "</div>"
            );
          break;

        case "title":
          return this.book.titleShort || this.book.title || this.notAvailable;
          break;

        default:
          if ( this.book[sortKey] ) return this.book[sortKey]
          else return this.notAvailable;
      
      }
    },
    
    progress: function(book) {
      
      if ( book.asin === "B00B5HZGUG" ) console.log( book )
      
      if (book.progress && book.length) {
        if (book.progress.toLowerCase().trim() === "finished") {
          const length = this.timeStringToSeconds(book.length);
          return (
            "<div>Finished ( " +this.secondsToTimeString(length, true) + " )</div>"
          );
        } else {
          const progress = this.timeStringToSeconds(book.progress);
          const length = this.timeStringToSeconds(book.length);
          const difference = length - progress;
          return (
            this.secondsToTimeString(difference, true) + " / " + this.secondsToTimeString(length, true)
          );
        }
      } else {
        if ( book.progress ) return "<div>" + book.progress + ' ('+ this.notAvailable +')' + "</div>";
        else if ( book.length ) return "<div>Length: " + book.length + "</div>";
        else return "<div>" + book.progress + "</div>";
      }
    }
  }
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

.ale-book .sort-values-container {
  // width: $thumbnailSize + 2;
  > div {
    white-space: nowrap;
    overflow: hidden;
    -ms-text-overflow: ellipsis;
    text-overflow: ellipsis;
    // margin: 6px;
    margin-left: 1px;
    margin-right: 1px;
    margin-bottom: -4px;
    padding: 3px 6px;
    padding-bottom: (3px+3px);
    font-size: .9em;
    font-weight: 700;
    border-radius: 2px 2px 0 0;
    color: #fff;
    @include themify($themes) {
      background: themed(audibleOrange);
    }
    
    &.sort-favorite {
      color: #e93f33 !important;
    }
  }
  
}

.theme-dark .ale-book .sort-values-container > div {
  color: #fff;
  background: #000;
}
.theme-light .ale-book .sort-values-container > div {
  color: #fff;
  background: #202020;
}

.ale-book.details-open .sort-values-container > div {
  margin-left: 0px;
  margin-right: 0px;
}

.ale-book .sort-values-container div.sort-bookNumbers {
  width: auto;
  margin: 0;
  padding: 0;
  position: absolute;
  z-index: 10;
  top: 6px;
  right: 6px;
  border-radius: none;
  // bottom: 0;
  // left: 0;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  font-weight: 700;
  // box-shadow: -4px 4px 8px rgba( #000, .8 );
  border-radius: 2px;
  padding: 3px 6px;
  // @include themify($themes) {
  //   color: themed(backColor);
  //   background: themed(frontColor);
  // }
  color: #fff;
  @include themify($themes) {
    background: themed(audibleOrange);
  }
}

.ale-book .sort-values-container .sort-progress .progress-bar {
  height: 2px;
  border-radius: 2px;
  @include themify($themes) {
    // background: darken(themed(audibleOrange), 15);
    border: 1px solid rgba( darken(themed(audibleOrange), 15), .5 );
  }
  div {
    height: 100%;
    border-radius: 2px;
    @include themify($themes) {
      background: lighten(saturate(themed(audibleOrange), 5), 5);
    }
  }
}
</style>
