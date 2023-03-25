export default {
  methods: {
    prepareKeys: function( config ) {
      
      config = config || {};
      const vue = this;
      let collection = config.collection || _.get(this.$store.state, this.$store.state.collectionSource);
      // Flattens all available keys into an array: ['title', 'sample'] ...etc
      let keys = _.union(_.flatten(_.map(collection, e => _.keys(e))));

      keys = keys.concat([
        'isbn10', 
        'isbn13'
      ]);

      // Here I make sure these keys get prioritized to the front of the table...
      let priorityKeys = [
        "added",
        "title",
        "series",
        "bookNumbers",
        "authors",
        "narrators",
        "tags",
        "categories",
        "length",
        "progress",
        "releaseDate",
        "publishers",
        "myRating",
        "rating",
        "ratings",
        "favorite",
        "format",
        "language",
        "whispersync",
        "fromPlusCatalog",
        "unavailable",
        "archived",
        "downloaded",
        "storePageChanged",
        "storePageMissing",
      ];
      if ( config.priorityKeys ) priorityKeys = config.priorityKeys;
      let leftoverKeys = _.remove(keys, function(key) {
        return !_.includes(priorityKeys, key);
      });

      keys = priorityKeys.concat(leftoverKeys);
      priorityKeys = null;
      leftoverKeys = null;

      // All the keys we don't want to show in the table
      let removeKeys = [
        "titleShort",
        "sample",
        "blurb",
        "url",
        "summary",
        "moreLikeThis",
        "peopleAlsoBought",
        "asin",
        "cover",
        "sample", // Slipped into titleShort in prepareData() method so they can be in a fixed column together
        "cover", // Same...
        "isbns",
        // "added",
        // "series",
        // "authors",
        // "narrators",
        // "categories",
        // "summary",
        // "length",
        // "progress",
        // "releaseDate",
        // "publishers",
        // "myRating",
        // "rating",
        // "ratings",
        // "downloaded",
        // "format",
        // "language",
        // "favorite",
        // "storePageMissing",
        // "storePageChanged",
      ];
      keys = _.remove(keys, function(key) {
        return !_.includes( (config.removeKeys || removeKeys), key);
      });

      return keys;
    }
  }
};
