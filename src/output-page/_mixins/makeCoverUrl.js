export default {
  methods: {
    makeCoverUrl: function(coverID, size) {
      return (
        "https://m.media-amazon.com/images/I/" + coverID + "._SL" + (size || 500) + "_.jpg"
      );
    }
  }
};
