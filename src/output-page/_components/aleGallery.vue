<template>
  <div id="ale-gallery">
    <ale-lightswitch></ale-lightswitch>
    <ale-bookdetails :library="library" :gallery="gallery"></ale-bookdetails> <!-- itunes style floater that plants itself between the cover items -->
    <ale-books :library="library" :gallery="gallery"></ale-books>
  </div>
</template>

<script>
import aleBooks from './aleGallery/aleBooks'
import aleBookdetails from './aleGallery/aleBookdetails'
import aleLightswitch from './aleGallery/aleLightswitch'

export default {
  name: 'aleGallery',
  components: {
    aleBooks,
    aleBookdetails,
    aleLightswitch,
  },
  props: ['library'],
  data: function() {
    return {
      gallery: {
        details: {
          open: false,
          index: 0
        }
      }
    }
  },
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
