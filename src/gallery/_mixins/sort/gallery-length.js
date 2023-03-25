import timeStringToSeconds from "../gallery-timeStringToSeconds.js";

export default {
  mixins: [timeStringToSeconds],
  methods: {
    sortLength: function(params) {
      const vue = this;
      return _.orderBy(
        params.books,
        function(o) {
          if (o.length) return vue.timeStringToSeconds(o.length);
          else return 0;
        },
        params.direction
      );
    }
  }
};
