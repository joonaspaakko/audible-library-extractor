<template>
  <div class="book-info-toolbar">
    <!-- TODO: not sure if favorite book icon makes sense here...
               note: it's also visible in the spreadsheet tooltip book details
    -->
    <!-- <gallery-favorite-book   :size="size" :book="book" v-if="book.favorite" /> -->
    <gallery-sample-button   :size="size" :book="book" v-if="book.sample" />
    <!-- <sampleButton    :size="size" :book="book" :index="rowIndex" /> -->
    <gallery-goodreads-link  :size="size" :book="book" :icon="true" />
    <gallery-open-in-app     :size="size" :book="book" v-if="!tempAsin" />
    <gallery-open-web-player :size="size" :book="book" :icon="true" v-if="!tempAsin && !book.notInLibrary" />
  </div>
</template>

<script>
export default {
  name: "book-info-toolbar",
  props: ["book", "tempAsin"],
  data: function() {
    return {
      size: 20,
    };
  },
};
</script>

<style lang="scss">


.book-info-toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  justify-items: space-between;
  padding: 0 10%;
  border-radius: 99999px;
  height: 30px;
    
  .top-right {
    position: absolute;
    z-index: 3;
    top: 15px;
    right: 15px;
  }

  > * {
    &, & > * { 
      outline: none; 
      display: flex;
      align-content: center;
      justify-content: center;
      align-items: center;
      justify-items: center;
    }
    // margin-left: 7px; 
    // &:first-child { margin-left: 0; }
    padding: 4px 8px;
    display: inline-block;
  }
  
  .gr-icon {
    cursor: pointer;
    display: flex;
    align-content: center;
    justify-content: center;
    align-items: center;
    justify-items: center;
    img, svg {
      display: inline-block;
      max-width: 70%;
      height: auto;
    }
    background: #fff;
    border-radius: 10px;
  }
  
}

.theme-dark .book-info-toolbar {
  background: lighten($darkBackColor, 6);
  box-shadow: inset 0 3px 10px rgba($darkBackColor, .8);
}
.theme-light .book-info-toolbar {
  background: darken($lightBackColor, 1);
  box-shadow: inset 0 3px 10px rgba( darken($lightBackColor, 30), 0.4);
}

</style>
