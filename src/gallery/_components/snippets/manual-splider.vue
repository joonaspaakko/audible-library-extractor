<template>
  <Splide :options="options" class="manual-splider" @splide:active="onActive" @splide:resize="onActive">
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
  
  methods: {
    onActive( slider ) {
      
      let slide = slider.Components.Slides.getAt( slider.index ).slide;
      const slideHeight = slide.querySelector(':scope > div').offsetHeight;
      const slidePadding = 35;
      slide.parentElement.parentElement.style.height = null;
      setTimeout(() => {
        slide.parentElement.parentElement.style.height = (slide.offsetHeight) + 'px';
      }, 1);
      
        
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

// :deep(.splide__track) {
//   height: auto !important;
// }

:deep(.splide__slide) {
  display: flex;
}

:deep(.splide__pagination) {
  gap: 5px !important;
}

:deep(.splide__pagination__page) {
  // width: 7px !important;
  // height: 7px !important;
  border-radius: 999999px !important;
}

// :deep(.splide__track) {
//   transition: height .2s !important;
// }
// :deep(.splide__list) {
//   transition: height .2s !important;
// }

// :deep(.splide__pagination__page.is-active) {
//   width: 10px !important;
//   height: 10px !important;
// }

// :deep(.splide .splide__track .splide__list) {
//   align-items: flex-start !important;
// }
// :deep(.splide__slide:not(.is-active)) {
//   height: 0 !important;    
// }

</style>