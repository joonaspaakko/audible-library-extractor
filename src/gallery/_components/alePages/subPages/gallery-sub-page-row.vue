<template>
  <router-link :to="{ name: 'series', params: { series: item.asin }, query: { subPageSource: subPageSource.name } }">

    <h2>{{ item.name }}</h2>

    <div class="books-total" v-if="item.books && item.books.length" content="Total number of books." v-tippy="{ placement: 'right' }">
      {{ item.books.length }}
    </div>

  </router-link>
</template>

<script>

export default {
  name: "GallerySubPageRow",
  mixins: [],
  data: function () {
    return {
      
    };
  },
};
</script>

<style lang="scss" scoped>

@import "@gallery/box-layout.scss";

> a {
  padding: 7px 14px !important;
  display: inline-block !important;
  width: 100%;
  box-sizing: border-box;
}

h2 {
  display: inline-block;
  width: 100%;
  margin-bottom: 0 !important;
  font-size: 1.20em !important;
  line-height: 1.30em !important;
}

.books-total {
  border: none !important;
  background: transparent !important;
  padding: 0 6px !important;
  width: auto !important;
  height: 23px !important;
  line-height: 23px !important;
  font-size: .9em !important;
  top: 6px !important;
  right: 4px !important;
}

.theme-dark .books-total .my-books {
  color: $audibleOrange !important;
}

.theme-light .books-total .my-books {
  font-weight: bold;
}

</style>
