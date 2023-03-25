import timeStringToSeconds from "../gallery-timeStringToSeconds.js";
export default {
  mixins: [timeStringToSeconds],
  methods: {
    sortProgress: function(params) {
      var vue = this;
      return _.orderBy(
        params.books, [
          function(o) {
            if (o.progress) {
              if (o.progress.toLowerCase().trim() === "finished") {
                return 100;
              } else if (o.length) {
                var progress = vue.timeStringToSeconds(o.progress);
                const length = vue.timeStringToSeconds(o.length);
                progress = length - progress;
                return (progress / length) * 100;
              } else {
                return 0;
              }
            } else {
              return 0;
            }
          },
          function(o) {
            if (o.length) return !vue.timeStringToSeconds(o.length);
            else return 0;
          },
        ],
        params.direction
      );
    }
  }
};
