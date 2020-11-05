<template>
  <div id="ale-books" v-shortkey.once="{down: ['arrowdown'], right: ['arrowright'], up: ['arrowup'], left: ['arrowleft'], tab: ['tab'], tabShift: ['tab', 'shift']}" @shortkey="adjacentDetails">
    <div class="list-view" v-shortkey.once="['esc']" @shortkey="closeTippy">
      <table>
        <thead>
          
          <ale-header :keys="keys" :general="general" :gallery="gallery"></ale-header>
          
        </thead>
        <tbody>
          
          <lazy-component
            v-for="(book, index) in booksArray"
            class="ale-row"
            :key="book.asin"
            :name="'rowTippy-'+book.asin"
          >
            
            <ale-list-row 
            :book="book" 
            :general="general" 
            :rowIndex="index" 
            :keys="keys"
            @updateTippyEl="setTippyInst"
            ></ale-list-row>
            
          </lazy-component>
          
        </tbody>
      </table>
      
    </div>
    
  </div>
</template>

<script>

// import slugify from '../../../_mixins/slugify';
// import makeCoverUrl from '../../../_mixins/makeCoverUrl';
import aleHeader from './aleListView/aleHeader';
import aleListRow from './aleListView/aleRow';

export default {
  name: 'aleBooks',
  props: ['booksArray', 'library', 'gallery', 'general'],
  components: {
    aleHeader,
    aleListRow,
  },
	data: function() {
		return {
      keys: '',
      tippyRowInst: null,
      listViewEl: null,
      prevScrollTop: 0,
      dontCloseTippy: null,
		}
  },
  
  created: function() {
    
    this.keys = this.prepareKeys();
    
  },
  
  mounted: function() {
    this.listViewEl = $('.list-view');
    this.listViewEl.on('scroll', this.listScrolled );
  },
  
  beforeDestroy: function() {
    this.listViewEl.off('scroll', this.listScrolled );
  },
  
  methods: {
    
    // Shortcut logic for navigating to adjacent books with the tooltip info box open.
    adjacentDetails: function( e ) {
      if ( this.tippyRowInst ) {
        
        const vue = this;
        if ( this.dontCloseTippy ) clearTimeout( this.dontCloseTippy );
        this.dontCloseTippy = setTimeout(function() { vue.dontCloseTippy = false; }, 500);
        
        const tippyEl = this.tippyRowInst.reference;
        tippyEl.scrollIntoView({ block: 'center' });
        
        switch ( e.srcKey ) {
          case 'up':
          case 'left':
          case 'tabShift':
              if ( tippyEl.previousSibling ) {
                tippyEl.blur();
                tippyEl.previousSibling.focus();
              }
            break;
          case 'down':
          case 'right':
          case 'tab':
              if ( tippyEl.nextSibling ) {
                tippyEl.blur();
                tippyEl.nextSibling.focus();
              }
            break;
        }
        
      }
    },
    
    closeTippy: function() {
      
      if ( this.tippyRowInst && this.tippyRowInst.state.isVisible ) this.tippyRowInst.hide();
      
    },
    
    setTippyInst: function( tippyRowInst ) {
      if ( this.tippyRowInst && this.tippyRowInst !== tippyRowInst ) this.tippyRowInst.hide();
      this.tippyRowInst = tippyRowInst;
    },
    
    listScrolled: _.throttle(function( e ) {
      
      
      if ( this.tippyRowInst && this.tippyRowInst.state.isVisible && !this.dontCloseTippy ) {
        const scrollTop = this.listViewEl.scrollTop();
        const scrollDistance = Math.abs( scrollTop - this.prevScrollTop );
        if ( scrollDistance >= 150 ) {
          this.closeTippy();
          this.prevScrollTop = scrollTop;
        }
      }
      
    }, 300, { 'leading': true, 'trailing': false }),
    
    prepareKeys: function() {
      
      const vue = this;
      // Flattens all available keys into an array: ['title', 'sample'] ...etc
      let keys = _.union(_.flatten(_.map(vue.library.books, (e) => _.keys(e))));
    
      // Here I make sure these keys get prioritized to the front of the table...
      let priorityKeys = [
        "added",
        "title",
        "series",
        "bookNumbers",
        "authors",
        "narrators",
        "categories",
        "summary",
        "length",
        "progress",
        "releaseDate",
        "publishers",
        "myRating",
        "rating",
        "ratings",
      ];
      let leftoverKeys = _.remove( keys, function( key ) {
        return !_.includes(priorityKeys, key );
      });
      
      keys = priorityKeys.concat( leftoverKeys );
      priorityKeys = null;
      leftoverKeys = null;
      
      // All the keys we don't want to show in the table
      let removeKeys = [
        'titleShort',
        'sample',
        'blurb',
        'url',
        'summary',
        'moreLikeThis',
        'peopleAlsoBought',
        'asin',
        'coverUrl',
        'sample', // Slipped into titleShort in prepareData() method so they can be in a fixed column together
        // "added",
        // "series",
        // "authors",
        // "narrators",
        // "categories",
        // "summary",
        // "length",
        // "progress",
        // "releaseDate",
        // "publishers",
        // "myRating",
        // "rating",
        // "ratings",
        // "downloaded",
        // "format",
        // "language",
        // "favorite",
        // "storePageMissing",
        // "storePageChanged",
      ];
      keys = _.remove( keys, function( key ) {
        return !_.includes(removeKeys, key );
      });
      
      return keys;

    },
    
  },
  
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

#ale-gallery { margin-bottom: 0 !important; }

#ale-books {
  position: absolute;
  top: 200px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  background: $lightBackColor;
  border-radius: 8px;
  @include themify($themes) {
    background: rgba( lighten( themed(backColor), 3), .98 );
    box-shadow: themed(shadowSmall);
    color: themed(frontColor);
  }
}

.list-view {
  position: absolute;
  top: 5px;
  right: 5px;
  bottom: 5px;
  left: 5px;
  font-size: 0px;
  line-height: 0px;
  overflow: auto;
  padding-bottom: 150px;
  > table {
    position: relative;      
  }
  table,
  thead,
  tbody,
  tfoot,
  tr {
      margin: 0;
      padding: 0;
      border: none;
      border-collapse: collapse;
      border-spacing: 0;
      vertical-align: baseline;
  }

  .list-view-header {
    position: -webkit-sticky;
    position: sticky;
    top: 0px;
    z-index: 5;
  }
  .sticky-col {
    position: -webkit-sticky;
    position: sticky;
    left: 0px;
    z-index: 2;
  }


  .ale-row {
    text-align: left;
    height: 28px;
  }
  .ale-row-inner {
    white-space: nowrap;
  }
  .ale-col {
    // display: inline-flex;
    // justify-content: left;
    // align-content: center;
    // justify-items: left;
    // align-items: center;
    display: inline-block;
    font-size: 14px;
    line-height: 1.55em;
    padding: 0 8px;
  }
  
  .ale-col-inner {
    height: 27px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    
    .text-container {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    &, & > .icons-n-stuff {
      display: flex;
      justify-items: start;
      align-items: center;
      justify-content: start;
      align-content: center;
      > * { 
        display: inline-block;
      }
      > img {
        width: 27px;
        height: 27px;
      }
    }
    & > .icons-n-stuff {
      > * { 
        padding-right: 5px !important;
        padding-left: 3px;
        &:first-child { padding-left: 0; };
      }
    }
    
  }

  // ***********
  //   COLORS & stuff...
  // ***********

  // .ale-row,
  .list-view,
  .ale-col {
    @include themify($themes) {
      border: 1px solid rgba( themed(frontColor), .14 );
    }
  }
  
  .list-view-header { height: auto; }

  // .ale-row {
  //   border-left: none !important;
  //   border-right: none !important;
  //   border-top: none !important;
  // }

  .ale-col {
    // border-top-width: 0px !important;
    border-right-width: 0px !important;
    border-bottom-width: 0px !important;
    // &:first-child { border-top-width: 0px !important; border-left-width: 0px !important; }
  }

  .sticky-col {
    border-right-width: 2px !important;
  }
  
} // .list-view 

  
.theme-light {
  
  .ale-row {
    background: url("../../../images/table-loader-light.gif") no-repeat 10px center;
  }
  
  .list-view {
    a {
      color: #252525;
      &:visited {
        color: lighten( #252525, 45% );
      }
    }
  }
  .ale-row {
    .ale-col { background: #fff; }
    color: darken( $lightFrontColor, 2 );
    &:nth-child(odd) .ale-col {
      background: #f8f8f8;
    }
    &:hover .ale-col {
      background: darken( #f8f8f8, 5) !important;
    }
  }
  .list-view-header .ale-col {
    background: darken( #f8f8f8, 5) !important;
  }
  .list-view-header .ale-row-inner {
    border-top: 1px solid darken( #f8f8f8, 15) !important;
    border-bottom: 1px solid darken( #f8f8f8, 32) !important;
  }
  
  .ale-row {
    outline: none;
    &:focus,
    &.tippy-active {
       .ale-col {
        background: #fce9ce !important; 
       }
    }
  }
}

.theme-dark {
  
  .ale-row {
    background: url("../../../images/table-loader-dark.gif") no-repeat 10px center;
  }
  
  .list-view {
    a {
      color: #e1e1e1;
      &:visited {
        color: darken( #e1e1e1, 45% );
      }
    }
  }
  .ale-row {
    .ale-col { background: #15171a; }
    color: darken( $darkFrontColor, 10 );
    &:nth-child(odd) .ale-col {
      background: lighten( #15171a, 2 );
    }
    &:hover .ale-col {
      background: lighten( #15171a, 5 ) !important;
    }
  }
  
  .list-view,
  .ale-row, 
  .ale-col {
    border-color: lighten( $darkBackColor, 11 );
  }
  
  .list-view-header .ale-col {
    background: darken( #15171a, 1) !important;
  }
  .list-view-header .ale-row-inner {
    border-top: 1px solid lighten( $darkBackColor, 11) !important;
    border-bottom: 1px solid lighten( $darkBackColor, 11) !important;
  }
  
  .ale-row {
    outline: none;
    &:focus,
    &.tippy-active {
       .ale-col {
        background: #372b1f !important; 
       }
    }
  }
  
}

.list-view {
  
  .ale-col { width: 300px; }
  .col-added { width: 50px; }
  .col-categories { width: 350px; }
  .col-series { width: 350px; }
  .col-length { width: 100px; }
  .col-progress { width: 120px; }
  .col-release-date { width: 100px; }
  .col-publishers { width: 180px; }
  .col-my-rating { width: 70px; }
  .col-rating { width: 70px; }
  .col-ratings { width: 70px; }
  .col-downloaded { width: 70px; }
  .col-format { width: 140px; }
  .col-language { width: 90px; }
  .col-favorite { width: 90px; }
  .col-store-page-missing { width: 130px; }
  .col-store-page-changed { width: 130px; }

  tbody .col-title { 
    outline: none;
    cursor: pointer; 
    -webkit-touch-callout: none; 
    -webkit-user-select: none; 
    -khtml-user-select: none; 
    -moz-user-select: none; 
    -ms-user-select: none; 
    user-select: none;
    .info-icon {
      font-size: 0.9em;
      line-height: 1em;
      // padding-right: 5px;
      color: #f29a33;
    }
  }
}

.ale-col { position: relative; }

</style>
