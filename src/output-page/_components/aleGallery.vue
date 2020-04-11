<template>
  <div id="ale-gallery">
    <ale-background :library="library" :gallery="gallery"></ale-background>
    <ale-search :library="library" :gallery="gallery"></ale-search>
    <ale-lightswitch></ale-lightswitch>
    <ale-bookdetails :library="library" :gallery="gallery"></ale-bookdetails> <!-- itunes style floater that plants itself between the cover items -->
    <ale-books :library="library" :gallery="gallery"></ale-books>
  </div>
</template>

<script>
import aleBackground from './aleGallery/aleBackground'
import aleSearch from './aleGallery/aleSearch'
import aleBooks from './aleGallery/aleBooks'
import aleBookdetails from './aleGallery/aleBookdetails'
import aleLightswitch from './aleGallery/aleLightswitch'

export default {
  name: 'aleGallery',
  components: {
    aleBackground,
    aleSearch,
    aleBooks,
    aleBookdetails,
    aleLightswitch,
  },
  props: ['library'],
  data: function() {
    return {
      gallery: {
  			fuseResults: [],
        details: {
          open: false,
          index: -1,
          slider: null,
          sliderMount: false,
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';

#ale-gallery {
  max-width: $containerSize;
  margin: 0 auto;
  text-align: center;
}

</style>
