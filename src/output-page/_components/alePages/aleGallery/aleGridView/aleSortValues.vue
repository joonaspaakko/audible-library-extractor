<template>
  <div class="sort-values-container">
    <div
      :class="'sort-' + $store.getters.sortBy"
      v-html="sortContents"
      v-if="sortContents"
    ></div>
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
  computed: {

    // activeSortKey: function() {
    //   return _.find(this.$store.state.listRenderingOpts.sort, "current")
    //     .key;
    // },

    sortContents: function() {
      const sortKey = this.$store.getters.sortBy.replace(".name", "");

      var specialBoy = sortKey === "bookNumbers" ? this.book.series : null;
      if (this.book[sortKey] || specialBoy) {
        switch (sortKey) {
          case "bookNumbers":
            const numbersDelim = ", ";

            if (this.book.series) {
              let allNumbers = _.filter(this.book.series, "bookNumbers");
              allNumbers = _.map(allNumbers, "bookNumbers");
              allNumbers = _.flatten(allNumbers);
              if (_.isEmpty(allNumbers)) allNumbers = null;
              if (allNumbers === null) {
              }

              const seriesName = this.gallery.searchOptions.lists
                .numberSortSeriesName;
              if (seriesName) {
                const seriesNumbers = _.find(this.book.series, [
                  "name",
                  seriesName
                ]).bookNumbers;
                if (seriesNumbers) {
                  return _.isArray(seriesNumbers)
                    ? seriesNumbers.join(numbersDelim)
                    : seriesNumbers;
                } else {
                  return allNumbers ? allNumbers.join(numbersDelim) : "";
                }
              } else {
                return allNumbers ? allNumbers.join(numbersDelim) : "";
              }
            } else {
              return "";
            }
            break;
          case "authors":
          case "narrators":
          case "publisher":
            return this.book[sortKey][0].name;
            break;
          case "rating":
            const ratings = this.book.ratings
              ? " <small>(" +
                this.book.ratings
                  .match(/\d/g)
                  .join("")
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                ")</small>"
              : "";
            return this.book[sortKey] + ratings;
            break;
          case "ratings":
            const text = this.book[sortKey];
            const rating = this.book.rating
              ? " <small>(" + this.book.rating + ")</small>"
              : "";
            return (
              text
                .match(/\d/g)
                .join("")
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + rating
            );
            break;
          case "progress":
            // const progress = this.book[ sortKey ];
            // return progress;
            var css = this.progressbarWidth(this.book);
            return (
              this.progress(this.book) +
              '<div class="progress-bar">' +
              '<div style="width: ' +
              css.width +
              ';"></div>' +
              "</div>"
            );
            break;

          case "title":
            return this.book.titleShort || this.book[sortKey];
            break;

          default:
            return this.book[sortKey];
        }
      }
      // Value missing!
      else {
        switch (sortKey) {
          case "bookNumbers":
            return false; // empty
            break;
          case "progress":
            return '<div>No progress</div> <div class="progress-bar"></div>'; // empty
            break;
          default:
            return this.notAvailable;
        }
      }
    }
  },

  methods: {
    progress: function(book) {
      if (book.progress && book.length) {
        if (book.progress.toLowerCase().trim() === "finished") {
          const length = this.timeStringToSeconds(book.length);
          return (
            "<div>Finished ( " +
            this.secondsToTimeString(length, true) +
            " )</div>"
          );
        } else {
          const progress = this.timeStringToSeconds(book.progress);
          const length = this.timeStringToSeconds(book.length);
          const difference = length - progress;
          return (
            this.secondsToTimeString(difference, true) +
            " / " +
            this.secondsToTimeString(length, true)
          );
        }
      } else {
        return "<div>Length: " + book.length + "</div>";
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
    font-weight: 700;
    border-radius: 2px 2px 0 0;
    color: #fff;
    @include themify($themes) {
      background: themed(audibleOrange);
    }
  }
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
    background: darken(themed(audibleOrange), 15);
    border: 2px solid darken(themed(audibleOrange), 15);
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
