import timeStringToSeconds from "./gallery-timeStringToSeconds.js";
export default {
  mixins: [timeStringToSeconds],
  methods: {
    progressbarWidth: function(book) {
      if (book.progress) {
        if (book.progress.toLowerCase().trim() === "finished") {
          return {
            width: "100%"
          };
        } else if (book.length) {
          var progress = this.timeStringToSeconds(book.progress);
          const length = this.timeStringToSeconds(book.length);

          progress = length - progress;

          return {
            width: (progress / length) * 100 + "%"
          };
        } else {
          return {
            width: 0
          };
        }
      } else {
        return {
          width: 0
        };
      }
    }
  }
};
