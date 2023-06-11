<template>
  <tr class="ale-row-inner" @click="$compEmitter.emit('book-clicked', book.asin)">
    
    <!-- 
      Note to self: 
      
      I've lazyfied the columns multiple times with <gallery-lazy>, but I always ended up tearing it down in fear of adding too many elements to observe.
      SO DON'T TRY IT ANYMORE FUTURE ME!!!
      
      - It's already observing for every row in the loaded chunk, though assuming you don't skip any rows, as you're scrolling 
        down you're also releasing each row from observation... Lazy loading each column would mean it would take less time to 
        render each row, since there's way less to render, but it would also add like way over a dozen more elements to observe 
        per each row  (1 for each column).
        
      - It might seem like it's negligible, like what's a few more elements to observe... but the potential performance 
        issues start showing up when you scroll down without doing a whole lot of sideways scrolling.
        
      - Like if you initially see 3 columns and scroll down 1000 rows while never scrolling sideways, you're now observing
        maybe something like 25 thousand elements and you keep observing for them until you scroll sideways to see some 
        or all of them or somehow refresh the current page/view.
       
    -->
    
    <!-- <gallery-lazy
    tag="td" -->
    <td
    v-for="col in columns"
    :key="col.key"
    class="ale-col"
    :class="col.class"
    :name="col.name"
    >
      <div class="ale-col-inner">
        
        <span v-if="col.key === 'title'" class="icons-n-stuff">
          <span class="info-icon"><fa-solid-chevron-down class="pointer" /></span>
          <gallery-sample-button v-if="sticky.bookDetailSettings.playButton" :book="book" :index="rowIndex" :size="16" />
          <div class="cloud-player-icon" v-else-if="book.asin && sticky.bookDetailSettings.cloudPlayer">
            <gallery-open-web-player :size="20" :book="book" :icon="true" :tooltip="false" :noBG="true" />
          </div>
          <div class="thumbnail-wrapper">
            <img crossorigin="anonymous" v-if="!imageLoading" :src="coverUrl27" alt="">
          </div>
        </span>

        <span class="text-container"> {{ col.text || "&nbsp;" }}</span>
      </div>
    </td>
    <!-- </gallery-lazy> -->
    
  </tr>
</template>

<script>
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";
import stringifyArray from "@output-mixins/gallery-stringifyArray.js";
import makeFullUrl from "@output-mixins/gallery-makeFullUrl.js";

export default {
  name: "aleListItem",
  props: ["book", "rowIndex", "keys"],
  mixins: [stringifyArray, makeCoverUrl, makeFullUrl],
  data: function() {
    return {
      sticky: this.$store.state.sticky,
      // bookUrl: "",
      coverUrl: "",
      coverUrl27: "",
      bookTitle: "",
      goodreadsUrl: "",
      columns: null,
      imageLoading: true,
    };
  },

  created: function() {
    
    // this.bookUrl = this.makeFullUrl(this.book.url);
    this.coverUrl = this.makeCoverUrl(this.book.cover);
    if (this.coverUrl) this.coverUrl27 = this.coverUrl.replace("_SL500_", "_SL54_");
    this.bookTitle = this.book.title || this.book.titleShort;
    this.columns = this.prepareColumns();
    
  },

  mounted: function() {
    const vue = this;
    this.$nextTick(function() {
      // setTimeout(function() {
      this.imageLoading = false;
      // }, 600);
    });
  },

  methods: {

    prepareColumns: function() {
      
      const vue = this;
      return _.map(this.keys, function(key) {
        
        let col = {};
        col.key = key;
        col.class = "col-" + _.kebabCase(key);
        
        switch (key) {
          case "authors":
          case "narrators":
          case "categories":
          case "publishers":
          case "tags":
            col.text = vue.stringifyArray(
              vue.book[ key ],
              "name",
              key === "categories" ? " > " : null
            );
            break;

          case "series":
            var series = vue.book.series;
            if ( series ) series = _.map(series, function( series ) {
              let numbers = series.bookNumbers ? (' (book '+ _.castArray(series.bookNumbers).join(", ") +')') : '';
              return !series.name ? '' : series.name + numbers;
            }).join(", ");
            col.text = series || '';
            break;
            
          case "title":
            col.text = vue.book[ key ] || vue.book.titleShort;
            col.class += " sticky-col";
            break;

          case "bookNumbers":
            if ( !vue.book.series ) {
              col.text = '';
            }
            else {
              let allNumbers = vue.book.series.filter(function( o ) { return o.bookNumbers; });
                  allNumbers = allNumbers.map(function( o ) { return o.bookNumbers; });
                  allNumbers = allNumbers.join(", ");
                  
              col.text = allNumbers || '∞';
              
              // let allNumbers = _.filter(vue.book.series, "bookNumbers");
              // allNumbers = _.map(allNumbers, "bookNumbers");
              // allNumbers = _.flatten(allNumbers);
              // if (_.isEmpty(allNumbers)) allNumbers = null;
              // else if (_.isArray(allNumbers)) {
              //   allNumbers = allNumbers.join(", ");
              // }
              // col.text = vue.book.series ? (allNumbers || '∞') : '';
            }
            break;
          
          case "isbn10":
            const isbn10 = _.find( vue.book.isbns, { type: "ISBN_10" });
            if ( isbn10 ) col.text = isbn10.identifier;
            break;
          case "isbn13":
            const isbn13 = _.find( vue.book.isbns, { type: "ISBN_13" });
            if ( isbn13 ) col.text = isbn13.identifier;
            break;
            
          default:
            col.text = vue.book[ key ];
            col.name = "";
            break;
        }

        if (!col.text) col.text = null;
        
        return col;
        
      });
    }
  }
};
</script>

<style lang="scss">


.ale-row-inner {
  .icons-n-stuff .thumbnail-wrapper {
    display: inline-block;
    &, img {
      width: 27px;
      height: 27px;
      object-fit: contain;
    }
  }
}
</style>
