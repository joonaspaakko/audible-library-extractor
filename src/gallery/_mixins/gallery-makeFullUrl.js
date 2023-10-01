import domurl from 'domurl';
import slugify from "@output-mixins/gallery-slugify.js";

export default {
  mixins: [
    slugify,
  ],
  methods: {
    makeFullUrl: function(inputURL) {
      const url = new domurl(this.$store.state.urlOrigin + inputURL);
      url.query.ipRedirectOverride = true;
      url.query.overrideBaseCountry = true;
      return url.toString();
    },
    makeUrl: function(type, input, array) {
      const store = this.$store.state;
      const base = this.$store.state.urlOrigin;
      
      let newUrl = "";
      if ( array && !store.sticky.detailLinksToAudible ) {
        const inSubPage = _.get(this.$route, 'meta.subPage');
        const routeSubPage = this.$route.name === 'wishlist' ? 'wishlist' : 'library';
        const subPageSource = inSubPage ? this.$store.state.sticky.subPageSource : routeSubPage;
        switch (type) {
          case "store":
          case "book":
            newUrl = base + "/pd/" + encodeURIComponent(input);
            
            let url = new domurl(newUrl);
            url.query.ipRedirectOverride = true;
            url.query.overrideBaseCountry = true;
            newUrl = url.toString();
            break;
          case "author":
            newUrl = { 
              name: 'author', 
              params: { 
                author: input.url || this.slugify(input.name)
              }, 
              query: { 
                subPageSource,
                refresh: true,
              } 
            };
            break;
          case "narrator":
            newUrl = { 
              name: 'narrator', 
              params: { 
                narrator: this.slugify(input.name)
              }, 
              query: { 
                subPageSource,
                refresh: true,
              } 
            };
            break;
          case "series":
            newUrl = { 
              name: 'series', 
              params: { 
                series: input.asin
              }, 
              query: { 
                subPageSource,
                refresh: true,
              } 
            };
            break;
          case "publisher":
            newUrl = { 
              name: 'publisher', 
              params: { 
                publisher: this.slugify(input.name)
              }, 
              query: { 
                subPageSource,
                refresh: true,
              } 
            };
            break;
          case "tags":
            newUrl = { 
              name: subPageSource, 
              query: { 
                filterExtras: `tags:${input.name}`,
                refresh: true,
              } 
            };
            break;
          case "categories":
            
            const cat = {};
            cat.current = _.get(input, 'name');
            cat.currentIndex = _.findIndex( array, { name: cat.current });
            
            const currentIsParent = cat.currentIndex === 0;
            const currentIsChild  = cat.currentIndex === 1;
            cat.parent = currentIsParent ? cat.current : _.get(array, '0.name');
            if ( currentIsParent ) {
              cat.child = undefined;
            }
            else {
              cat.child  = currentIsChild  ? cat.current : _.get(array, '1.name');
            }
            
            newUrl = { 
              name: 'category', 
              params: { 
                parent: cat.parent ? this.slugify(cat.parent) : undefined, 
                child:  cat.child ? this.slugify(cat.child) : undefined, 
              }, 
              query: { 
                subPageSource,
                refresh: true,
              } 
            };
            break;
        }
      }
      else {
        switch (type) {
          case "store":
          case "book":
            newUrl = base + "/pd/" + encodeURIComponent(input);
            break;
          case "author":
            if (input.url) newUrl = base + "/author/" + (input.url || this.slugify(input.name));
            else newUrl = base + "/search?searchAuthor=" + encodeURIComponent(input.name);
            break;
          case "narrator":
            if (input.name) newUrl = base + "/search?searchNarrator=" + encodeURIComponent(input.name);
            break;
          case "series":
            if (input.asin) newUrl = base + "/series/" + input.asin;
            break;
          case "publisher":
            if (input.name) newUrl = base + "/search?searchProvider=" + encodeURIComponent(input.name);
            break;
          case "categories":
          case "tags":
            if (input.url) newUrl = base + "/cat/" + input.url;
            break;
        }
      }
      
      if (!newUrl) {
        return "";
      } 
      else if ( array && !store.sticky.detailLinksToAudible ) {
        return newUrl;
      }
      else {
        let url = new domurl(newUrl);
        url.query.ipRedirectOverride = true;
        url.query.overrideBaseCountry = true;
        return url.toString();
      }
      
    }
  }
};
