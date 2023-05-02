<template>
  <Splide :options="options" class="manual-splider">
    <SplideSlide>
      <slot name="page-1"></slot>
    </SplideSlide>
    <SplideSlide v-if="$slots['page-2']">
      <slot name="page-2"></slot>
    </SplideSlide>
  </Splide>
</template>

<script>
import '@splidejs/vue-splide/css/sea-green';
import { Splide, SplideSlide } from '@splidejs/vue-splide';


export default {
  name: "manua-splider",
	components: {
		Splide,
    SplideSlide,
  },
  data() {
    return {
      options: {
				type        : 'slide',
				rewind      : true,
        rewindByDrag: true,
        autoplay    : false,
        drag        : true,
        arrows      : false,
				// autoWidth   : true,
				width				: null,
				trimSpace   : false,
				gap         : '4px',
				// lazyLoad    : 'nearby',
				// preloadPages: 0,
				perPage     : 1,
      },
    }
  },
  
};
</script>
 
<style scoped lang='scss'>

.manual-splider,
:deep(.splide__track),
:deep(.splide__list),
:deep(.splide__list li) {
  height: 100%;
}

:deep(.splide__slide) {
  display: flex;
}

</style>