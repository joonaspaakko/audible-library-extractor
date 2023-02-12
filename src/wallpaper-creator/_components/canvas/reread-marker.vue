<template>
  <div
    class="reread-wrapper"
    :class="{ 'static': isStatic }"
    :style="{ 
      fontSize: (store.coverSize/11)+'px',
      lineHeight: (store.coverSize/11)+'px',
    }">
    <div v-if="$slots.default" class="reread-label" :style="{
      borderRadius: (store.coverSize/20)+'px',
      borderWidth: (store.coverSize/50)+'px',
    }"> 
    <span class="icon" :style="{
      borderRadius: (store.coverSize/20)+'px' + ' 0 0 ' + (store.coverSize/20)+'px',
      padding: (store.coverSize/25)+'px' + ' ' + (store.coverSize/30)+'px' + ' ' + (store.coverSize/25)+'px' + ' ' + (store.coverSize/18)+'px',
    }"><mdi-bookshelf/></span><span :style="{
      padding: (store.coverSize/25)+'px' + ' ' + (store.coverSize/18)+'px' + ' ' + (store.coverSize/25)+'px' + ' ' + (store.coverSize/30)+'px',
    }"><slot></slot></span>
    </div>
    <div 
      v-else
      class="reread-marker" 
      :style="{ 
        borderWidth: (store.coverSize/50)+'px',
        width: (store.coverSize/6)+'px',
        height: (store.coverSize/6)+'px',
        top: relative ? null : -(((store.coverSize/8)/2))+'px',
        right: relative ? null : -(((store.coverSize/8)/2))+'px',
        position:  relative ? 'relative' : 'absolute',
      }"
      @click="book ? $store.commit('updateBookCover', { key: 'reread', value: false, book: book }) : null"
    >
      <!-- <ic-outline-exposure-plus-1/> -->
      <mdi-bookshelf/>
    </div>
  </div>
</template>

<script>

export default {
  
  props: ['book', 'relative', 'isStatic'],
  data: function () {
    return {
      store: this.$store.state,
    };
  },
   
};
</script>

<style scoped lang="scss">

.reread-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.reread-marker {
  cursor: pointer;
  border: 2px solid white;
  background: #0798f1;
  color: white;
  position: absolute;
  z-index: 6;
  top: 0;
  right: 0;
  // padding: 5px;
  border-radius: 9999px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.static div.reread-marker {
  position: relative !important;
  top: unset !important;
  right: unset !important;
  bottom: unset !important;
  left: unset !important;
}


.reread-label {
  background: #0798f1;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid white;
  span {
    display: inline-block;
  }
  .icon {
    display: inline-block;
    border-right: 2px solid darken(#0798f1,10);
    background: darken(#0798f1,10);
  }
}

</style>