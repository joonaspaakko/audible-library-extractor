// import { param } from "jquery";

export default {
  methods: {
    amapxios: function(options) {
      const vue = this;

      asyncMap(
        options.requests,
        function(request, stepCallback) {
          const axiosConfig = options.config ? options.config : null;
          axios
            .get(request.requestUrl || request.url || request, axiosConfig)
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
