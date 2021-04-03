// import { param } from "jquery";
import rateLimit from "axios-rate-limit";

export default {
  methods: {
    amapxios: function(options) {
      const vue = this;
      
      
      asyncMap(
        options.requests,
        function(request, stepCallback) {
          const axiosConfig = options.config || {};
          const axiosLimited = rateLimit(axios.create(), { maxRPS: 15 });
          axiosLimited
            .get((request.requestUrl || request.url || request), axiosConfig)
            .then(function(response) {
              options.step(
                response,
                function(result) {
                  stepCallback(null, result);
                },
                request
              );
            })
            .catch(function(e) {
              console.log(e);
              if (!e.response) {
                console.log( "%c" + "axios caught an error" + "", "background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;", e );
              } else if (options.returnCatch) {
                options.step(
                  e.response,
                  function(result) {
                    stepCallback(null, result);
                  },
                  request
                );
              } else {
                stepCallback(null, null);
              }
            });
        },
        function(err, results) {
          if (!err) {
            options.done(options.flatten ? _.flatten(results) : results);
          } else {
            console.log(err);
          }
        }
      );
    }
  }
};
