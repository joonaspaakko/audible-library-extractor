export default {
  methods: {
    makeFullUrl: function(inputURL) {
      const url = new domurl(this.$store.state.urlOrigin + inputURL);
      url.query.ipRedirectOverride = true;
      url.query.overrideBaseCountry = true;
      return url.toString();
    },
    makeUrl: function(type, input) {
      const base = this.$store.state.urlOrigin;
      let newUrl = "";
      
      switch (type) {
        case "store":
        case "book":
          newUrl = base + "/pd/" + encodeURIComponent(input);
          break;
        case "author":
          if (input.url) newUrl = base + "/author/" + input.url;
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

      if (!newUrl) {
        return "";
      } else {
        let url = new domurl(newUrl);
        url.query.ipRedirectOverride = true;
        url.query.overrideBaseCountry = true;
        return url.toString();
      }
    }
  }
};
