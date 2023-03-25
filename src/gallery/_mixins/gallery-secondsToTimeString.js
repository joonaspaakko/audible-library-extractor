export default {
  methods: {
    secondsToTimeString: function(s, delimCharacters) {
      var pad = function(num, size) {
          return delimCharacters ? num : ("000" + num).slice(size * -1);
        },
        time = parseFloat(s).toFixed(3),
        hours = Math.floor(time / 60 / 60),
        minutes = Math.floor(time / 60) % 60,
        seconds = Math.floor(time - minutes * 60),
        milliseconds = time.slice(-3);
      var h =
        (hours.toString().length > 1 ? hours : pad(hours, 2)) +
        (delimCharacters ? "h " : ".");
      var m = pad(minutes, 2) + (delimCharacters ? "m " : "");
      if (delimCharacters && !hours) h = "";
      return h + m;
    }
  }
};
