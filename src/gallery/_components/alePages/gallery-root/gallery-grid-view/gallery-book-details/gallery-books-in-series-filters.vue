<template>
<div class="list-filter-wrapper" :style="{ top: $store.state.sticky.viewMode === 'grid' ? $store.state.topNavOffset + 'px' : '31px' }">
  <div class="row">
    
    <div class="show-all-toggle" v-if="showAllToggle" @click="clickedShowAll">
      <div>
        <fa6-solid-ban style="padding-right: 4px;" :class="{ active: $store.state.sticky.booksInSeriesAll}" />
        <span v-if="!showFinishedToggle">Not in library:</span>
        <span>{{ count.notInLibrary }}</span>
      </div>
    </div>
    
    <div class="show-finished" v-if="showFinishedToggle" @click="clickedShowFinished">
      <div>
        <fa6-solid-box-archive style="padding-right: 4px;" :class="{ active: $store.state.sticky.booksInSeriesFinished}" />
        <span v-if="!showAllToggle">Finished books:</span>
        <span>{{ count.finished }}</span>
      </div>
    </div>
    
  <!-- </div>
  
  <div class="row"> -->
    <div style="flex: unset; padding-left: 6px; padding-right: 6px; min-width: 30px;" @click="$store.commit('stickyProp', { key: 'booksInSeriesOpenInApp', value: !$store.state.sticky.booksInSeriesOpenInApp })"
    >  
    <!-- v-tippy :content="$store.state.sticky.booksInSeriesOpenInApp ? 'Open in app' : 'Search in goodreads'" -->
      <span v-if="$store.state.sticky.booksInSeriesOpenInApp">
        <!-- open in app -->
        <img class="img-icon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTEuNSA5My43IiB3aWR0aD0iMTUxLjUiIGhlaWdodD0iOTMuNyI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPjxnPjxnPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTc1LjggODAuN2w3NS43LTQ3LjJ2MTIuOEw3NS44IDkzLjcgMCA0Ni4zVjMzLjVsNzUuOCA0Ny4yeiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTc1LjggMjEuNWE0OC4xNyA0OC4xNyAwIDAgMC00MC43IDIxLjkgMTIuOTQgMTIuOTQgMCAwIDEgMS44LTEuNmMyMS4zLTE3LjcgNTItMTMuNyA2OC43IDguNmwxMS4xLTcuMWE0OS44MiA0OS44MiAwIDAgMC00MC45LTIxLjgiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik03NS44IDQzLjRhMjcuNzIgMjcuNzIgMCAwIDAtMjIuNCAxMS41IDIyLjcgMjIuNyAwIDAgMSAxMy41LTQuNGM4LjIgMCAxNS41IDQuMiAyMC40IDExLjNsMTAuNi02LjZhMjUuNzkgMjUuNzkgMCAwIDAtMjIuMS0xMS44TTI0LjYgMjQuMkM1NS44LS40IDk5LjkgNi4zIDEyMy40IDM5bC4yLjIgMTEuNS03LjFhNzAuODIgNzAuODIgMCAwIDAtMTE4LjYgMCA2MC42MyA2MC42MyAwIDAgMSA4LjEtNy45Ii8+PC9nPjwvZz48L3N2Zz4=" alt="" />
      </span>
      <span v-else>
        <!-- goodreads -->
        <img class="img-icon" src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iNTEyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik01LjExMSAxOC45MDdoLjEyOWMuNTg1IDAgMS4xNzYgMCAxLjc2Mi4wMDUuMDc0IDAgLjE0My0uMDE5LjE2Ni4wOTguMzI4IDEuNjM2IDEuMzgzIDIuNTU5IDIuOSAyLjk5NSAxLjI0MS4zNTYgMi40OTUuMzY2IDMuNzQ5LjA4NCAxLjU1OC0uMzQ3IDIuNTgyLTEuMzI3IDMuMTM2LTIuODMxLjM2OS0xLjAwOC40OTQtMi4wNTMuNTA4LTMuMTE3LjAwNS0uMjcyLjAxNC0yLjIwMy0uMDA5LTIuNDc1bC0uMDQxLS4wMTRjLS4wMzcuMDctLjA3OS4xMzYtLjExNS4yMDYtMS4wMTkgMi4wMi0yLjgyNiAzLjE1OS00Ljg2MSAzLjIzOS00Ljc1LjE4OC03LjgxMi0yLjY3Mi03LjkzMi04LjI1OS0uMDIzLTEuMTExLjA4My0yLjE5OC4zODMtMy4yNjcuOTUtMy4zMzMgMy40NC01LjU0MSA3LjA5Ny01LjU2OSAyLjgyNi0uMDE5IDQuNjgxIDEuODE0IDUuMzU5IDMuMjk1LjAyMy4wNTIuMDYuMTA4LjExLjA4OVYuNDk4aDIuMDQzYzAgMTMuMTM5LjAwNSAxNS41NzIuMDA1IDE1LjU3Mi0uMDA1IDMuNjgtMS4yMzIgNi43MzYtNC43NSA3LjYwMy0zLjIwNS43OTItNy4zMzIuMjI1LTkuMDM5LTIuNjgxLS4zNjktLjYzMy0uNTQ0LTEuMzI3LS41OTktMi4wODZ6bTYuNzQ3LTE3LjE5NEM5LjQzNyAxLjY5IDYuODU0IDMuNjIxIDYuNTU0IDcuOTg1Yy0uMTg5IDIuNzY2LjY4MyA1LjcyOCAzLjI5OCA2Ljk2NiAxLjI3My42MDUgMy40MjcuNzAzIDQuOTk1LS40MDggMi4xOTUtMS41NTYgMi44OTEtNC41NDcgMi41MjctNy4yMTktLjQ0OC0zLjMzMy0yLjIwNS01LjYyNS01LjUxNi01LjYxMXoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=" />
      </span>
    </div>
    
  </div>
  
  <!-- <div class="shadow-box"></div> -->
  
</div>
</template>

<script>

export default {
  name: "booksInSeriesFilters",
  props: ['series'],
  data: function() {
    return {
      store: this.$store.state,
      showAllToggle: false,
      showFinishedToggle: false,
      count: {
        notInLibrary: 0,
        finished: 0,
      },
    };
  },
  
  created: function() {
    if ( this.series.collection ) {
      
      this.count.finished = this.countFinished();
      this.showFinishedToggle = this.count.finished > 0;
      
      this.count.notInLibrary = this.countNotInLibrary();
      this.showAllToggle = this.count.notInLibrary > 0;
      
    }
  },
  
  methods: {
    
    countFinished: function() {
      
      let count = 0;
      _.each(this.series.collection, function(o) {
        if ( o.books ) {
          let bookCount = _.filter(o.books, function(o) {
            let progress = _.get(o, 'obj.progress');
            return progress ? progress.match(/finished/i) : false;
          });
          count += bookCount.length;
        }
      });
      
      return count;
      
    },
    
    countNotInLibrary: function() {
      
      let count = 0;
      _.each(this.series.collection, function(o) {
        if ( o.books ) {
          let bookCount = _.filter(o.books, 'notInLibrary');
          count += bookCount.length;
        }
      });
      
      return count;
      
    },
    
    clickedShowAll() {
      this.$store.commit('stickyProp', { key: 'booksInSeriesAll', value: !this.$store.state.sticky.booksInSeriesAll });
      this.$nextTick(function() {
        this.$compEmitter.emit("resizeSummary");
      });
    },
    
    clickedShowFinished() {
      this.$store.commit('stickyProp', { key: 'booksInSeriesFinished', value: !this.$store.state.sticky.booksInSeriesFinished });
      this.$nextTick(function() {
        this.$compEmitter.emit("resizeSummary");
      });
    },

  },
};
</script>

<style lang="scss" scoped>


.list-filter-wrapper {
  position: sticky;
  top: 0px;
  z-index: 20;
  padding: 15px 20px;
  margin: -20px -20px;
  margin-bottom: 0;
  @include themify($themes) {
    // background: lighten(themed(backColor), 5);
    $bgColor: lighten(themed(backColor), 7.5);
    background: mix(blue, $bgColor, 2%);
    .shadow-box {
      padding: 0 !important;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      width: 100%;
      height: 6px;
      overflow: hidden;
      &:after {
        position: absolute;
        top: 0;
        left: -20%;
        right: 0;
        content: '';
        width: 150%;
        height: 12px;
        box-shadow: inset 0 3px 3px rgba(darken(themed(backColor), 30), 0.2);
      }
    }
  }
}

.list-filter-wrapper {
  display: flex;
  flex-direction: column;
  > div {
    padding-top: 8px;
    &:first-child { padding-top: 0; }
    -webkit-touch-callout: none; 
    -webkit-user-select: none; 
    -khtml-user-select: none; 
    -moz-user-select: none; 
    -ms-user-select: none; 
    user-select: none; 
    // position: relative;
    // z-index: 1;
    // height: 10px;
    text-align: center;
    > div {
      outline: none;
      // position: relative;
      // top: -6px;
      // left: 0px;
      border-radius: 4px;
      padding: 3px 1px;
      font-size: 12px;
      line-height: 14px;
      cursor: pointer;
      @include themify($themes) {
        color: rgba( themed(frontColor), .5);
        border: 1px solid rgba( themed(frontColor), .2);
        // background: rgba( themed(frontColor), .02);
        // background: themed(backColor);
      }
      svg {
        margin-left: 2px;
      }
    }
  }
}
.active {
  @include themify($themes) {
    color: rgba( themed(audibleOrange), 1);
  }
}
.row {
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  div {
    flex: 1;
    display: inline-flex;
    justify-items: center;
    justify-content: center;
    align-items: center;
    align-content: center;
    margin-left: 6px; 
    &:first-child { margin-left: 0; }
  }
}

.img-icon {
  display: block;
  height: 12px;
  opacity: .75;
}

.theme-light .my-books-in-series .list-filter-wrapper > div {
  > div {
    color: rgba( $lightFrontColor, .9) !important;
  }
  .active {
    color: rgba( $audibleOrange, 1) !important;
  }
  .img-icon {
    -webkit-filter: invert(1);
    filter: invert(1);
  }
}
</style>
