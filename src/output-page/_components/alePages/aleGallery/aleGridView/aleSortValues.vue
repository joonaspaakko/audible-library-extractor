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
      // notAvailable: "N/A"
      notAvailable: "&nbsp;"
    };
  },
  
  methods: {
    
    sortContents: function() {
      let sortKey = this.$store.getters.sortBy;
      
      switch( sortKey ) {
        
        case "bookNumbers":
          
          if ( this.$route.params.series && this.book.series ) {
            let activeSeries = _.find( this.book.series, { asin: this.$route.params.series });
            return activeSeries && _.isArray(activeSeries.bookNumbers) ? activeSeries.bookNumbers.join(", ") : '';
          }
          else if (this.book.series) {
            
            let allNumbers = _.filter( this.book.series, 'bookNumbers')
            allNumbers = _.map( allNumbers, "bookNumbers");
            allNumbers = _.flatten(allNumbers);
            if (_.isEmpty(allNumbers)) allNumbers = null;
            else if (_.isArray(allNumbers)) {
              allNumbers = allNumbers.join(", ");
            }
            return allNumbers || "∞";
            
          } else {
            return '';
          }
          break;
          
        case "seriesOrder":
          const numbersDelim = ", ";
          if (this.book.series) {
            
            const seriesAsin = this.$route.params.series;
            const series = _.find(this.book.series, { asin: seriesAsin });
            if ( series ) {
              const seriesNumbers = series.bookNumbers;
              if ( seriesNumbers ) {
                return _.isArray(seriesNumbers) ? seriesNumbers.join(numbersDelim) : seriesNumbers;
              }
              else {
                return "∞";
              }
            }
            else {
              return this.notAvailable;
            }
            
          } else {
            return this.notAvailable;
          }
          break;
        case "authors.name":
        case "narrators.name":
        case "publishers.name":
          var name = _.get( this.book, sortKey.replace('.name', '[0].name') );
          return name || this.notAvailable;
          break;
        case "rating":
          if ( this.book.ratings ) {
            const ratings = this.book.ratings ? " <small>("+ this.book.ratings +")</small>" : "";
            return this.book[sortKey] + ratings;
          }
          else {
            return this.notAvailable;
          }
          break;
        case "ratings":
          if ( this.book.rating ) {
            const rating = this.book.rating ? " <small>(" + this.book.rating + ")</small>" : "";
            return this.book[sortKey] + rating;
          }
          else {
            return this.notAvailable;
          }
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
          
        case "series":
          if ( this.book.series ) {
            return _.map(this.book.series, 'name').join(', ');
          }
          else { return this.notAvailable; }
          break;
          
        case "categories":
          if ( this.book.categories ) {
            return this.book.categories[0].name;
          }
          else { return this.notAvailable; }
          break;
          
        case "isbn10":
        case "isbn13":
          if ( this.book.isbns ) {
            if ( sortKey === 'isbn10' ) {
              const isbn10 = _.find(this.book.isbns, ["type", "ISBN_10"]);
              if (isbn10) return isbn10.identifier;
            }
            else if ( sortKey === 'isbn13' ) {
              const isbn13 = _.find(this.book.isbns, ["type", "ISBN_13"]);
              if (isbn13) return isbn13.identifier;
            }
            else {
              return this.notAvailable;
            }
          }
          else {
            return this.notAvailable;
          }
          break;
          
        case "narratorsNumber":
          if ( this.book.narrators ) {
            let hasFullCast = _.find( this.book.narrators, function( narrator ) { return narrator.name.match('full cast') });
            if ( hasFullCast && this.book.narrators.length === 1 ) {
              return '​∞ full cast';
            }
            else {
              return (this.book.narrators.length -(hasFullCast ? 1 : 0)) + (hasFullCast ? ' full cast' : '');
            }
          }
          else { return this.notAvailable; }
          break;
          
        default:
          if ( this.book[sortKey] ) return this.book[sortKey]
          else return this.notAvailable;
      
      }
    },
    
    progress: function(book) {
      
      // if ( book.asin === "B00B5HZGUG" ) console.log( book )
      
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
  -webkit-user-select: text !important; 
  -khtml-user-select: text !important; 
  -moz-user-select: text !important; 
  -ms-user-select: text !important; 
  user-select: text !important; 

  // width: $thumbnailSize + 2;
  > div {
    -webkit-user-select: text !important; 
    -khtml-user-select: text !important; 
    -moz-user-select: text !important; 
    -ms-user-select: text !important; 
    user-select: text !important; 
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
    border: 1px solid red;
    box-sizing: border-box;
    color: #fff;
    @include themify($themes) {
      background: themed(audibleOrange);
    }
    
    &.sort-favorite {
      color: #e93f33 !important;
    }
    &:empty {
      display: none; 
    }
  }
  
}

.theme-dark .ale-book .sort-values-container > div {
  color: #fff;
  background: lighten( $darkBackColor, 9);
  border-color: lighten( $darkBackColor, 14);
}
.theme-light .ale-book .sort-values-container > div {
  color: #fff;
  background: #202020;
  border-color: lighten( #202020, 5);
}

.ale-book.details-open .sort-values-container > div {
  margin-left: 0px;
  margin-right: 0px;
}

.ale-book .sort-values-container div.sort-seriesOrder,
.ale-book .sort-values-container div.sort-bookNumbers {
  width: auto;
  margin: 0;
  position: absolute;
  z-index: 10;
  top: 6px;
  right: 6px;
  // bottom: 0;
  // left: 0;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  font-weight: 700;
  // box-shadow: -4px 4px 8px rgba( #000, .8 );
  // border-radius: 2px;
  padding: 3px 6px;
  // @include themify($themes) {
  //   color: themed(backColor);
  //   background: themed(frontColor);
  // }
  color: #fff;
  background: #c30d2d;
  box-shadow: -1px 1px 2px rgba( #000, .25 );
  // border: 1px solid darken( #c30d2d, 10);
  // border-radius: 0 3px 0 3px;
  border-radius: 3px;
  // @include themify($themes) {
  //   background: themed(audibleOrange);
  //   border: 1px solid darken( themed(audibleOrange), 20);
  // }
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
