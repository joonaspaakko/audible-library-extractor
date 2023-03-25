export default {
  methods: {
    timeStringToSeconds: function(string) {
      if ( string && string.match(/\d/) ) {
        
        // This is a little janky and very specific to
        // the progress and length time format in Audible
        const hasMinutes = string.match(/[0-9]( ?)+(m|min|分)/);
        const numbers = string.match(/\d+/g);
        const v = {};
        const hoursToSec = function(n) {
          return +n * 60 * 60;
        };
        const minsToSec = function(n) {
          return +n * 60;
        };
        // If the matched array contains 2 groups of numbers,
        // then we the array must contain hours and minutes
        if (numbers.length === 2) {
          v.h = numbers[0];
          v.m = numbers[1];
          v.numbers = hoursToSec(v.h) + minsToSec(v.m);
        }
        // If there's only one group of numbers and it doesn't
        // contain the word 'min', it will be treated as hours
        else if (!hasMinutes) {
          v.h = numbers[0];
          v.numbers = hoursToSec(v.h);
        }
        // Again... If there's only one group of numbers but it
        // contains the word 'min', then it will be treated as minutes
        else {
          v.m = numbers[0];
          v.numbers = minsToSec(v.m);
        }
        return v.numbers;
        
      }
      else { return 0; }
    }
  }
};
