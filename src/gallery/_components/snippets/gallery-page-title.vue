<template>
  <div class="gallery-title-wrapper" v-if="title || subtitle">
    <h2 class="gallery-title" v-if="title">
      <router-link :to="{ name: this.$router.name, query: { refresh: true } }">
        {{ title }}
      </router-link>
    </h2>
    <div class="divider" v-if="subtitle"></div>
    <h3 class="gallery-sub-title" v-if="subtitle">
      {{ subtitle }}
    </h3>
  </div>
</template>

<script>
import domurl from 'domurl';

export default {
  name: "pageTitle",
  data() {
    return {
      route: {
        title: null,
        subtitle: null,
      },
    }
  },
  
  computed: {
    title() {
      return this.$store.state.pageTitle;
    },
    subtitle() {
      return this.$store.state.pageSubTitle;
    },
  },
  created: function() {
    
    this.route.title    = _.get(this.$route, 'meta.title');
    this.route.subtitle = _.get(this.$route, 'meta.subtitle');
    
    if ( !this.title    && this.route.title    ) this.$store.commit('prop', { key: 'pageTitle',    value: this.route.title });
    if ( !this.subtitle && this.route.subtitle ) this.$store.commit('prop', { key: 'pageSubTitle', value: this.route.subtitle });
    
    // const routeDolly = _.cloneDeep(this.$route);
    // routeDolly.query = {
    //   refresh: true,
    // };
    // this.pageLink = routeDolly;
    
  },
  
  beforeUnmount: function() {
    
    this.$store.commit('prop', { key: 'pageTitle', value: null });
    this.$store.commit('prop', { key: 'pageSubTitle', value: null });
    
  },
  
  methods: {
    titleClicked( e ) {
      this.$router.go();
    },
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