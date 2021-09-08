export default {
  methods: {
    
    loadImage: function( url, callback ) {
      
      var img = new Image();
      img.onload = function() { 
        callback(this);
      }
      img.src = url;
      
    },
    
    getRandomCovers: function( arr, n ) {
      var result = new Array(n),
          len = arr.length,
          taken = new Array(len);
      if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
      while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
      }
      return result;
    },
    
    splitUnevenly: function(number, parts, min) {

      var randombit = number - min * parts;
      var out = [];

      for (var i=0; i < parts; i++) {
        out.push(Math.random());
      }

      var mult = randombit / out.reduce(function (a,b) {return a+b;});

      return out.map(function (el) { return el * mult + min; });
    },
    
    random: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    toMS: function( seconds ) {
      return seconds * 1000;
    },
    
    toSec: function( milliseconds ) {
      return milliseconds / 1000;
    },
    
    imageLoader: function(Images, Callback){
      
      let vue = this;
      // Keep the count of the verified images
      var allLoaded = 0;

      // The object that will be returned in the callback
      var _log = {
          success: [],
          error: []
      };

      // Executed everytime an img is successfully or wrong loaded
      var verifier = function(){
          allLoaded++;

          // triggers the end callback when all images has been tested
          if(allLoaded == Images.length){
              Callback.apply(vue, _log);
          }
      };

      // Loop through all the images URLs
      for (var index = 0; index < Images.length; index++) {
          // Prevent that index has the same value by wrapping it inside an anonymous fn
          (function(i){
              // Image path providen in the array e.g image.png
              var imgSource = Images[i];
              var img = new Image();
              
              img.addEventListener("load", function(){
                  _log.success.push(imgSource);
                  verifier();
                  img = null;
              }, { passive: true, once: true }); 
              
              img.addEventListener("error", function(){
                  _log.error.push(imgSource);
                  verifier();
                  img = null;
              }, { passive: true, once: true }); 
            
              img.src = imgSource;
          })(index);
      }
    },
    
  }
  
};
