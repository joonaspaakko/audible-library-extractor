<template>
  <div id="ale-gallery">
    
    <!-- <ale-breadcrumbs :library="library" :general="general"></ale-breadcrumbs> -->
    <ale-search :collectionSource="collectionSource" />
    
    <ale-grid-view v-if="$store.getters.collectionSource && $store.getters.collectionSource.length" />

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
import buildCategories from "@output-mixins/buildCategories";
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
      collectionSource: 'library.books',
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
      
    } 
    else if (this.$route.name === "series") {
      
      // console.log('%c' + 'series' + '', 'background: #dbff00; color: #000; padding: 2px 5px; border-radius: 8px;', this.$store.state.library.series);
      
      this.$store.commit('addListRenderingOpts', { 
        listName: 'sort', 
        option: { active: false,  current: true, key: 'bookNumbers',     label: 'Book number',  		 type: 'sort', tippy: "If you are sorting numbers without a specific series selected the sorting may be inaccurate." },
        activate: true,
        sortValues: true,
      });
      
      const seriesASIN = this.$route.params.series;
      const series = _.find( this.$store.state.library.series, { asin: seriesASIN });
      
      const books = _.filter( this.$store.state.library.books, function( book ) {
        return _.includes( series.books, book.asin );
      });
      this.$store.commit("prop", { key: "seriesCollection", value: books });
      this.collectionSource = 'seriesCollection';
      this.$store.commit("prop", { key: 'booksArray', value: this.$store.getters.collectionSource });
    }
    
  },
  
  mounted: function() {
    
    console.log('%c' + 'gallery Mounted' + '', 'background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;');
    
  },
  
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
