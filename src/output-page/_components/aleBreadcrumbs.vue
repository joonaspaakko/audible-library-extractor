<template>
  <div id="ale-breadcrumbs" v-if="this.general.categories">
    <div>
      <router-link class="crumb" :to="{ name: 'ale-categories' }">Categories</router-link> 
    </div>
    <div v-if="crumbs.parent" class="divider">
      <font-awesome-icon fas icon="chevron-right" />
    </div>
    <div v-if="crumbs.parent">
      <router-link class="crumb" :to="{ name: 'ale-category', params: { parent: crumbs.parent.slug } }">{{ crumbs.parent.name }}</router-link> 
    </div>
    <div v-if="crumbs.child" class="divider">
      <font-awesome-icon fas icon="chevron-right" />
    </div>
    <div v-if="crumbs.child">
      <router-link class="crumb" :to="{ name: 'ale-category', params: { parent: crumbs.parent.slug, child: crumbs.child.slug } }">{{ crumbs.child.name }}</router-link> 
    </div>
    <div v-if="crumbs.asin" class="divider">
      <font-awesome-icon fas icon="chevron-right" />
    </div>
    <div v-if="crumbs.asin">
      <router-link class="crumb" :to="{ name: 'ale-category', params: { parent: crumbs.parent.slug, child: crumbs.child.slug }, query: { book: crumbs.asin.slug } }">{{ crumbs.asin.name }}</router-link> 
    </div>
  </div>
</template>

<script>

export default {
  name: 'aleBreadcrumbs',
  props: ['library', 'general'],
	data: function() {
		return {
      crumbs: {
        parent: null,
        child: null,
        asin: null,
      },
		}
  },
  
  created: function() {
    
    const vue = this;
    // console.log( 'routeNAMEEEE!!!' );
    // console.log( routeName ); 
    // console.log( this.categories )
    if ( this.general.categories ) {
      
      const parentCat = this.$route.params.parent;
      if ( parentCat ) {
        const parentCatObj = _.find( this.general.categories.parent, ['slug', parentCat]);
        this.crumbs.parent = {
          name: parentCatObj.name,
          slug: parentCatObj.slug,
        };
        const childCat = this.$route.params.child;
        if ( childCat ) {
          const childCatObj = _.find( parentCatObj.sub, ['slug', childCat]);
          this.crumbs.child = {
            name: childCatObj.name,
            slug: childCatObj.slug,
          };
        }
      }
      
      const asin = this.$route.query.book;
      if ( asin ) {
        const book = _.find( vue.library.books, ['asin', asin]);
        if ( book ) this.crumbs.asin = {
          name:  book.title,
          slug: asin,
        };
      }
      
    }
    
  },
	
}
</script>

<style lang="scss">
@import '~@/_variables.scss';


#ale-breadcrumbs {
  text-align: center;
  position: fixed;
  z-index: 50;
  padding: 6px 10px;
  right: 0;
  bottom: 0;
  left: 0;
  @include themify($themes) {
    background: themed(backColor);
    box-shadow: 0 0 10px rgba( themed(outerColor), .5);
    border-top: 2px solid rgba( themed(frontColor), .1);
  }
  .divider {
    padding: 0 8px;
    @include themify($themes) {
      color: themed(audibleOrange);
    }
  }
  > div { 
    display: inline-block; 
    position: relative;
    top: 1px;
  } 
  .crumb {
    display: inline-block;
    font-size: .9em;
    line-height: 1.12em;
    position: relative;
    top: -1px;
    text-decoration: none;
    @include themify($themes) {
      color: themed(frontColor);
    }
    &:hover {
      @include themify($themes) {
        color: rgba( themed(frontColor), .6);
      }
    }
  }
}


</style>
