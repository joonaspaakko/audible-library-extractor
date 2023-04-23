<template>
  <div class="gallery-title-wrapper" v-if="pageTitle || pageSubTitle">
    <h2 class="gallery-title" v-if="pageTitle">
      <router-link :to="pageLink">
        {{ pageTitle }}
      </router-link>
    </h2>
    <div class="divider"></div>
    <h3 class="gallery-sub-title" v-if="pageSubTitle">
      {{ pageSubTitle }}
    </h3>
  </div>
</template>

<script>
import domurl from 'domurl';

export default {
  name: "pageTitle",
  props: ['pageTitle', 'pageSubTitle'],
  data() {
    return {
      pageLink: '#',
    }
  },
  mounted: function() {
    
    if ( this.pageTitle ) this.$store.commit('prop', { key: 'pageTitle', value: this.pageTitle });
    if ( this.pageSubTitle ) this.$store.commit('prop', { key: 'pageSubTitle', value: this.pageSubTitle });
    
    const routeDolly = _.cloneDeep(this.$route);
    routeDolly.query = {
      refresh: true,
    };
    this.pageLink = routeDolly;
    
  },
  
  beforeUnmount: function() {
    
    this.$store.commit('prop', { key: 'pageTitle', value: null });
    
  },
  
};
</script>


<style lang="scss">


.gallery-title-wrapper {
  margin-bottom: 20px;
  text-align: center;
  > * { 
    display: inline-block; 
    position: relative;
  }
  .divider {
    display: block !important;
  }
}

.gallery-title {
  font-size: 23px;
  line-height: 24px;
  font-weight: 700;
  margin: 0px;
  @include themify($themes) {
    &, & a { 
      color: themed(frontColor) !important;
    }
  }
}

.gallery-sub-title {
  font-size: 14px;
  line-height: 16px;
  font-weight: normal;
  margin: 0px;
  margin-top: 10px;
  padding: 5px 10px;
  border-radius: 9999px;
}

.theme-light .gallery-sub-title {
  color: $lightBackColor;
  border: 1px solid $lightFrontColor;
  background: $lightFrontColor;
}

.theme-dark .gallery-sub-title {
  color: $darkFrontColor;
  border: 1px solid $audibleOrange;
  background: $darkBackColor;
}
</style>