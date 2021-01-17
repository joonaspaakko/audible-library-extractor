<template>
  <div id="ale-gallery">
    <!-- <ale-breadcrumbs :library="library" :general="general"></ale-breadcrumbs> -->
    <ale-search collectionSource="library.books" />
    
    <ale-grid-view v-if="$store.state.booksArray && $store.state.booksArray.length > 0" />

    <!-- <ale-list-view 
    v-if="booksArray && booksArray.length > 0"
    :booksArray="booksArray" 
    ></ale-list-view> -->

    <audio-player></audio-player>
  </div>
</template>

<script>
import aleSearch from "./aleGallery/aleSearch";
import aleGridView from "./aleGallery/aleGridView";
import aleListView from "./aleGallery/aleListView";

// import aleBreadcrumbs from '../aleBreadcrumbs'
import audioPlayer from "@output-snippets/audio-player";
import buildCategories from "../../_mixins/buildCategories";
import filterAndSort from "@output-mixins/filter-and-sort.js";
import smoothscroll from "smoothscroll-polyfill";
smoothscroll.polyfill();

export default {
  name: "aleGallery",
  components: {
    aleSearch,
    aleGridView,
    aleListView,
    // aleBreadcrumbs,
    audioPlayer
  },
  mixins: [buildCategories, filterAndSort],
  data: function() {
    return {
    };
  },

  methods: {
    updateListRenderingOptions: function() {
      const list = {
        scope: [
          { active: true,  key: 'title' },
          { active: true,  key: 'authors.name' },
          { active: true,  key: 'narrators.name' },
          { active: true,  key: 'series.name' },
          { active: false, key: 'categories.name' },
          { active: false, key: 'publishers.name' },
        ],
        filter: [
          { active: true, type: 'filter', label: 'Not started', key: 'notStarted', condition: function( book ) { return !book.progress; } },
          { active: true, type: 'filter', label: 'Started', key: 'started', condition: function( book ) { return book.progress && !book.progress.toLowerCase().match('finished') ? true : false; }  },
          { active: true, type: 'filter', label: 'Finished', key: 'finished', condition: function( book ) { return book.progress && book.progress.toLowerCase().match('finished') ? true : false; }  },
          // FIXME: I have to think a little bit more about how to add more filters if at all...
          // { key: 'divider' },
          // { active: true, type: 'filterExtras', label: 'Favorites', key: 'favorites', condition: function( book ) { return book.favorite; } },
        ],
        sort: [
          { active: false, sticky: true, key: 'sortValues',      label: 'Show sort values', type: 'sortExtras', tippy: 'Value comes from the active sort category below.' },
          { active: false,                 key: 'randomize',       label: 'Randomize',        type: 'sortExtras', tippy: "Ignores sorting and randomizes instead unless there's an active search." },
          { key: 'divider' },
          // active: true = arrow down / descending
          { active: true,  current: true,  key: 'added',           label: 'Added',   			     type: 'sort', tippy: 'High number = new <br/> Low number = old' },
          { active: true,  current: false, key: 'title',           label: 'Title',        		 type: 'sort' },
          { active: true,  current: false, key: 'releaseDate',     label: 'Release date', 		 type: 'sort' },
          { active: true,  current: false, key: 'length',          label: 'Length',       		 type: 'sort' },
          { active: true,  current: false, key: 'authors.name',    label: 'Author',       		 type: 'sort' },
          { active: true,  current: false, key: 'narrators.name',  label: 'Narrator',     		 type: 'sort' },
          // FIXME: Is this needed?
          // You can open a the page for a series and 
          { active: true,  current: false, key: 'bookNumbers',     label: 'Book number',  		 type: 'sort', tippy: "If you are sorting numbers without a specific series selected the sorting may be inaccurate." },
          { active: true,  current: false, key: 'rating',  			   label: 'Rating',  				   type: 'sort' },
          { active: true,  current: false, key: 'ratings',  			 label: 'Number of ratings', type: 'sort' },
          { active: false, current: false, key: 'progress',  			 label: 'Progress',          type: 'sort' },
          { active: true,  current: false, key: 'publishers.name', label: 'Publishers',        type: 'sort' },
          { active: true,  current: false, key: 'favorite',        label: 'Favorite',          type: 'sort' },
        ],
      };
      
      this.$setListRenderingOpts( list );
      
    }
  },

  created: function() {
    this.updateListRenderingOptions();

    const vue = this;
    if (this.$route.name === "category") {
      this.general.categories = this.buildCategories();
    } else if (this.$route.name === "series") {
      const sortValues = _.find(this.gallery.searchOptions.lists.sortExtras, [
        "key",
        "sortValues"
      ]);
      sortValues.active = true;
      const sort = _.find(this.gallery.searchOptions.lists.sort, [
        "key",
        "bookNumber"
      ]);
      const sortItemIndex = _.findIndex(this.gallery.searchOptions.lists.sort, [
        "key",
        "bookNumbers"
      ]);
      this.gallery.searchOptions.lists.sort[sortItemIndex].active = false;
      this.gallery.searchOptions.lists.sortIndex = sortItemIndex;

      this.gallery.customResults = _.filter(
        this.$store.state.library.books,
        function(book) {
          if (book.series && vue.$route.params.series) {
            return _.find(book.series, function(series) {
              // console.log( series.asin === 'B077XNSN35' )
              return series.asin === vue.$route.params.series;
            });
          }
        }
      );
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";
#ale-gallery {
  max-width: $containerSize;
  margin: 0 auto 550px auto;
  text-align: center;
  padding: 0 20px;
  &:before {
    content: ".";
    visibility: hidden;
    display: block;
    height: 0;
    clear: both;
  }
}
</style>
