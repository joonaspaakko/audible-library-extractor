
export default {
  methods: {
    getDataFrompUserReviews: function(hotpotato, userReviewsFetched) {
      if ( !_.find(hotpotato.config.steps, { name: "userReviews" }) ) {
        
        this.$store.commit('resetProgress');
        userReviewsFetched(null, hotpotato);
        
      } else {
        
        this.$store.commit('update', [
          { key: 'bigStep.step', value: 0 },
        ]);
        
        this.$store.commit('update', [
          { key: 'bigStep.title', value: 'My reviews' },
          { key: 'bigStep.step', add: 1 },
          { key: 'progress.text', value: 'Fetching user reviews...' },
          { key: 'progress.step', value: 0 },
          { key: 'progress.max', value: 0 },
          { key: 'progress.bar', value: true },
        ]);
        
        const vue = this;
                
        this.scrapingPrep({
          url: this.listenerUrl, 
          done: (prep) => {
            
            const requestURLS = _.map(prep.pageNumbers, function(page) {
              prep.urlObj.query.page = page;
              return prep.urlObj.toString();
            });
            
            this.amapxios({
              requests: requestURLS,
              step: (response, stepCallback, request) => {
                
                const audible = $($.parseHTML(response.data)).find("div.adbl-main")[0];
                const rows = audible.querySelectorAll('.bc-container > .bc-row-responsive');
                
                const reviews = [];
                _.each( rows, ( row ) => {
                  
                  const review = {};
                  
                  const main = row.querySelector('.listenerReviews1');
                  const sidebar = main.previousElementSibling;
                  
                  const title = main.querySelector(':scope > h4');
                  review.title = DOMPurify.sanitize(title.textContent.trimAll());
                  
                  const coverWrapper = sidebar.querySelector('.adbl-asin-impression');
                  review.asin = DOMPurify.sanitize(coverWrapper.getAttribute('data-asin'));
                  
                  const summary = main.querySelector('p.bc-size-body.bc-color-secondary');
                  if ( summary ) review.summary = DOMPurify.sanitize(vue.getSummary(summary));
                  
                  const starCategories = main.querySelectorAll('.bc-review-stars');
                  review.ratings = [];
                  _.each( starCategories, ( starWrapper ) => {
                    const categoryNameWrapper = starWrapper.previousElementSibling;
                    if ( categoryNameWrapper ) {
                      const categoryName = categoryNameWrapper.textContent.trim();
                      if ( categoryName ) {
                        review.ratings.push({
                          name: DOMPurify.sanitize(categoryName),
                          stars: DOMPurify.sanitize(starWrapper.querySelectorAll('.full-review-star').length),
                          // allStars: DOMPurify.sanitize(starWrapper.querySelectorAll('i.bc-icon-star-empty').length),
                          // reviewStars: DOMPurify.sanitize(starWrapper.querySelectorAll('.full-review-star').length),
                        });
                      }
                    }
                    
                  });
                  
                  reviews.push( review );
                  
                  vue.$store.commit('update', { key: 'progress.max', add: 1 });
                  vue.$store.commit('update', { key: 'progress.step', add: 1 });
                  
                });
                
                stepCallback( reviews );
                
              },
              flatten: true,
              done: ( reviews ) => {
                
                hotpotato.userReviews = reviews;
                vue.$store.commit('resetProgress');    
                
                // console.log( hotpotato.userReviews );
                
                vue.$nextTick(function() {
                  userReviewsFetched(null, hotpotato);
                });
                
              }
            });
            
          },
        });
        
      }
    },
    
  }
};
