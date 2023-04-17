export default {
  methods: {
    
    sortBookNumbers: function(params) {
      
      // const seriesAsin = this.$route.params.series;
      // const seriesObj = _.find( this.$store.state.library.series, { asin: seriesAsin });
      return _.orderBy(
        params.books, 
        function( book ) {
          
          return book.added;
          
        },
        params.direction
      );
    },
    
    sortBookNumbersOriginal: function(params) {
      
      const seriesAsin = this.$route.params.series;
      
      return _.orderBy(
        params.books, 
          function(o) {
            
            let numberize = function( allNumbers ) {
              if (_.isEmpty( allNumbers ) || !allNumbers ) allNumbers = undefined;
              const numbers = _.isArray(allNumbers) ? allNumbers[0] : allNumbers;
              const dashSplit = typeof numbers == "string" ? numbers.split("-") : [numbers];
              return dashSplit[0] ? parseFloat(dashSplit[0]) : dashSplit[0];
            };
            
            if ( seriesAsin && o.series ) {
              let activeSeries = _.find( o.series, { asin: seriesAsin });
              return numberize(activeSeries.bookNumbers);
            }
            else {
                
              let anyNumbers = _.find(o.series, "bookNumbers");
              if (anyNumbers) {
                
                let allNumbers = _.filter( o.series, 'bookNumbers')
                allNumbers = _.map( allNumbers, 'bookNumbers')
                allNumbers = _.flatten( allNumbers );
                return numberize( allNumbers );
              } 
              else {
                
                let inSeries = _.find(o.series);
                if ( inSeries ) return -1; // In series: no number
                else return -2; // Not in series
              }
              
            }
          },
        // ],
        params.direction
      );
    },
    
    // sortBookNumbersOriginal: function(params) {
    //   return _.orderBy(
    //     params.books, 
    //       // [
    //       // function(o) {
    //       //   return this.$store.state.sortBySeries
    //       // },
    //       function(o) {
    //         // let allNumbers = _.filter( o.series, 'bookNumbers')
    //         // allNumbers = _.map( allNumbers, 'bookNumbers')
    //         // allNumbers = _.flatten( allNumbers );
    //         // if (_.isEmpty( allNumbers ) ) allNumbers = null;
  
    //         let anyNumbers = _.find(o.series, "bookNumbers");
    //         if (anyNumbers) {
    //           const seriesObj = _.find(o.series, [ "name", params.seriesName ? params.seriesName : o.series[0].name ]);
              
    //           if ( o.series && _.find( o.series, { name: 'The Secret History of the World, Repairman Jack, The Adversary Cycle' }) ) console.log('%c' + 'series' + '', 'background: #00bb1e; color: #fff; padding: 2px 5px; border-radius: 8px;', o.series);
              
    //           const number = seriesObj.bookNumbers;
    //           if ( o.title === 'The Tomb: Repairman Jack #1' ) console.log( number )
    //           const numbers = _.isArray(number) ? number[0] : number;
    //           // If the number is a string, we assume it's a number range (Some collections/omnibusses have these: books 1-3)
    //           // ...and once again use the first number from that range
    //           const dashSplit = typeof numbers == "string" ? numbers.split("-") : [numbers];
    //           return parseFloat(dashSplit[0]);
    //         } else {
    //           return params.missingNumber >= 0 ? params.missingNumber : 9999999;
    //         }
    //       },
    //     // ],
    //     params.direction
    //   );
    // },
  }
};
