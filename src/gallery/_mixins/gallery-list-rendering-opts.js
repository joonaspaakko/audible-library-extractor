
export default {
  methods: {

    updateListRenderingOptions: function() {
      
      const vue = this;
      let list = {
        scope: [{
            active: true,
            key: 'title',
            // weight: 2,
            weight: 15,
          },
          {
            active: true,
            key: 'authors.name',
            // weight: .9,
            weight: 5,
          },
          {
            active: true,
            key: 'narrators.name',
            // weight: .9,
            weight: 5,
          },
          {
            active: true,
            key: 'series.name',
            // weight: .8,
            weight: 10,
          },
          {
            active: false,
            key: 'categories.name',
            // weight: .2,
            weight: 1,
          },
          {
            active: false,
            key: 'tags.name',
            // weight: .2,
            weight: 1,
          },
          {
            active: false,
            key: 'publishers.name',
            // weight: .2,
            weight: 1,
          },
          {
            active: false,
            key: 'blurb',
            // weight: .5,
            weight: 1,
          },
          {
            active: false,
            key: 'summary',
            // weight: .4,
            weight: 1,
          },
        ],
        filter: [{
            active: true,
            type: 'filter',
            label: 'Not started',
            key: 'notStarted',
            condition: function(book) {
              return !book.progress;
            }
          },
          {
            active: true,
            type: 'filter',
            label: 'Started',
            key: 'started',
            condition: function(book) {
              return book.progress && !book.progress.toLowerCase().match('finished') ? true : false;
            },
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
          },
          {
            active: true,
            type: 'filter',
            label: 'Finished',
            key: 'finished',
            condition: function(book) {
              return book.progress && book.progress.toLowerCase().match('finished') ? true : false;
            },
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
          },

          // { type: 'divider', key: 'divider1' },

          // { active: true,  type: 'filterExtras', label: 'All',          key: 'all',          group: 'filterExtras', condition: function( book ) { return book.asin;            } },
          {
            onlyWishlist: true,
            active: false,
            type: 'filterExtras',
            label: 'On sale',
            key: 'onsale',
            group: 'filterExtras',
            condition: function(book) {
              return book.onSale;
            }
          },
          
          {
            onlyWishlist: true,
            active: false,
            type: 'filterExtras',
            label: 'Price',
            key: 'price',
            group: 'filterExtras',
            range: true,
            rangeMinDist: 0,
            rangeSuffix: '',
            rangeInterval: 1,
            rangeMin: function() {
              let books = vue.$store.getters.collectionSource;
              const min = _.minBy(books, 'price');
              return min ? Math.floor(min.price) : -1;
            },
            rangeMax: function() {
              let books = vue.$store.getters.collectionSource;
              const max = _.maxBy(books, 'price');
              return max ? Math.ceil(max.price) : -1;
            },
            condition: function(book) {
              if ( book.price ) {
                let min = this.range[0];
                let max = this.range[1];
                return book.price >= min && book.price <= max;
              }
            },
          },

          { type: 'divider', key: 'divider1', onlyWishlist: true, },

          {
            excludeFromSeriesSubPage: true,
            active: false,
            type: 'filterExtras',
            label: 'In series',
            key: 'inseries',
            group: 'filterExtras',
            condition: function(book) {
              return book.series;
            }
          },
          {
            excludeFromSeriesSubPage: true,
            active: false,
            type: 'filterExtras',
            label: 'Not in series',
            key: 'not-inseries',
            group: 'filterExtras',
            condition: function(book) {
              return !book.series;
            }
          },
          {
            excludeFromSeriesSubPage: true,
            type: 'divider',
            key: 'divider1.1'
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Not from plus catalog',
            key: 'not-from-plus-catalog',
            group: 'filterExtras',
            condition: function(book) {
              return !book.fromPlusCatalog;
            }
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Plus catalog: Available',
            key: 'plus-catalog-available',
            group: 'filterExtras',
            condition: function(book) {
              return book.fromPlusCatalog && !book.unavailable;
            },
            tippy: "It is possible for this status to change after last gallery update..."
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Plus catalog: Unavailable',
            excludeFromWishlist: true,
            key: 'plus-catalog-unavailable',
            group: 'filterExtras',
            condition: function(book) {
              return book.fromPlusCatalog && book.unavailable;
            },
            tippy: "Books that are from the plus catalog, but they are locked. Conditions: a book left the plus catalog or inactive membership."
          },
          {
            type: 'divider',
            key: 'divider1.3.1',
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Podcast episodes: include',
            key: 'podcasts-inlcude',
            group: 'filterExtras',
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
            condition: function(book) {
              return _.get(book, "format") === 'Podcast' && !_.get(book, "podcastParent");
            }
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Podcast episodes: exclude',
            key: 'podcasts-exclude',
            group: 'filterExtras',
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
            condition: function(book) {
              
              return _.get(book, "format") !== 'Podcast' && !_.get(book, "podcastParent");
            }
          },
          {
            type: 'divider',
            key: 'divider1.3'
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Store page available',
            key: 'store-page-available',
            group: 'filterExtras',
            condition: function(book) {
              return !(book.storePageChanged || book.storePageMissing);
            }
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Store page unavailable',
            key: 'store-page-unavailable',
            group: 'filterExtras',
            condition: function(book) {
              return book.storePageChanged || book.storePageMissing;
            },
            tippy: "Store page has been removed or changed after it was added."
          },
          {
            type: 'divider',
            key: 'divider1.4',
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Favorites: include',
            key: 'favorites',
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
            group: 'filterExtras',
            condition: function(book) {
              return book.favorite;
            }
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Favorites: exclude',
            key: 'favorites-not',
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
            group: 'filterExtras',
            condition: function(book) {
              return !book.favorite;
            }
          },
          
          {
            type: 'divider',
            key: 'divider1.4.1',
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Books I have rated',
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
            key: 'rated-by-me',
            group: 'filterExtras',
            condition: function(book) {
              return book.myRating;
            },
          },
          {
            active: false,
            type: 'filterExtras',
            label: "Books I haven't rated",
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
            key: 'not-rated-by-me',
            group: 'filterExtras',
            condition: function(book) {
              return !book.myRating;
            },
          },
          
          {
            type: 'divider',
            key: 'divider1.4.2',
            excludeFromWishlist: true
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'New books',
            excludeFromWishlist: true,
            key: 'new-books',
            group: 'filterExtras',
            condition: function(book) {
              return book.isNew;
            },
            tippy: "Most recent additions."
          },

          {
            type: 'divider',
            key: 'divider2.0'
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Full cast: include',
            key: 'full-cast-include',
            group: 'filterExtras',
            condition: function(book) {
              return _.find(book.narrators, function(narrator) {
                return narrator.name.match(/full cast/im);
              });
            }
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Full cast: exclude',
            key: 'full-cast-exclude',
            group: 'filterExtras',
            condition: function(book) {
              return !_.find(book.narrators, function(narrator) {
                return narrator.name.match(/full cast/im);
              });
            }
          },
          {
            type: 'divider',
            key: 'divider1.9'
          },
          {
            active: false,
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
            type: 'filterExtras',
            label: 'Whisperync: owned',
            key: 'whispersync-owned',
            group: 'filterExtras',
            condition: function(book) {
              return book.whispersync === 'owned';
            }
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Whispersync: available',
            excludeFromPodcasts: true,
            key: 'whispersync-available',
            group: 'filterExtras',
            condition: function(book) {
              return book.whispersync === 'available';
            }
          },
          {
            active: false,
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
            type: 'filterExtras',
            label: 'Whisperync: available + owned',
            key: 'whispersync-owned-or-available',
            group: 'filterExtras',
            condition: function(book) {
              return book.whispersync;
            }
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Whispersync: unavailable',
            excludeFromPodcasts: true,
            key: 'whispersync-false',
            group: 'filterExtras',
            tippy: 'Either unavailable or unkown...',
            condition: function(book) {
              return !book.whispersync;
            }
          },
          {
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
            type: 'divider',
            key: 'divider-archived',
          },
          
          {
            active: false,
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
            type: 'filterExtras',
            label: 'Archived',
            key: 'archived',
            group: 'filterExtras',
            condition: function(book) {
              return book.archived;
            }
          },
          {
            active: false,
            excludeFromWishlist: true,
            excludeFromPodcasts: true,
            type: 'filterExtras',
            label: 'Not archived',
            key: 'not-archived',
            group: 'filterExtras',
            condition: function(book) {
              return !book.archived;
            }
          },
          
          {
            excludeFromPodcasts: true,
            type: 'divider',
            key: 'divider2.2'
          },

          {
            active: false,
            type: 'filterExtras',
            label: 'Length',
            key: 'length',
            group: 'filterExtras',
            range: true,
            rangeMinDist: 1,
            rangeSuffix: 'h',
            rangeMin: function() {
              return 0;
            },
            rangeMax: function() {
              let books = vue.$store.getters.collectionSource;
              let longest = _.maxBy(books, function(book) {
                return vue.timeStringToSeconds(book.length);
              });
              // seconds to minutes + rounded UP
              return longest ? Math.ceil(vue.timeStringToSeconds(longest.length) / 3600) : 0;
            },
            condition: function(book) {
              if (book.length) {
                let min = this.range[0];
                let max = this.range[1];
                let length = vue.timeStringToSeconds(book.length) / 3600;
                return length >= min && length <= max;
                // return Math.ceil(length) >= min && Math.floor(length) <= max; 
              }
            },
            // Good idea, but I think it made it too restrictive and 0-10 was a little tightly packed.
            // rangeMarks: function( max ) {
            //   return lengthMarksCalc( max );
            // } 
          },

          {
            type: 'divider',
            key: 'divider2.1'
          },

          {
            active: false,
            type: 'filterExtras',
            label: 'Narrators',
            key: 'narrators',
            group: 'filterExtras',
            range: true,
            rangeMinDist: 0,
            rangeSuffix: '',
            rangeMin: function() {
              return 1;
            },
            rangeMax: function() {
              let books = vue.$store.getters.collectionSource;
              let most = _.maxBy(books, function(book) {
                let narrators = _.filter(book.narrators, function(narrator) {
                  return narrator.name && !narrator.name.match('full cast');
                });
                if (!narrators.length && book.narrators && book.narrators.length) narrators = book.narrators; // If there's one narrator and it's "full cast", consider that as one...
                return (book.narrators) ? book.narrators.length : 0;
              });
              return most ? most.narrators.length : 0;
            },
            condition: function(book) {
              if (book.narrators) {
                let hasFullCast = _.find(book.narrators, function(narrator) {
                  return narrator.name.match('full cast')
                });
                let min = this.range[0];
                let max = this.range[1];
                let length = book.narrators.length;
                if (hasFullCast && length === 1) {
                  length = max;
                  return length >= min && length <= max;
                } else {
                  return length >= min && length <= max;
                }
              }
            }
          },

          {
            type: 'divider',
            key: 'divider3',
            excludeFromWishlist: true,
          },

          {
            active: false,
            type: 'filterExtras',
            excludeFromWishlist: true,
            label: 'books in series',
            key: 'booksinseries',
            group: 'filterExtras',
            range: true,
            rangeMinDist: 0,
            rangeSuffix: '',
            tippy: 'Number of owned books in series',
            rangeMin: function() {
              return 1;
            },
            rangeMax: function() {
              let books = _.filter(vue.$store.getters.collectionSource, 'series');

              let most = 1;
              _.each(books, function(book) {
                let bigBoe = _.maxBy(book.series, function(series) {
                  let foundSeries = _.find(vue.$store.state.library.series, {
                    asin: series.asin
                  });
                  if (foundSeries && foundSeries.books) return foundSeries.books.length;
                });
                if (bigBoe) {
                  const bigBoeLength = _.find(vue.$store.state.library.series, {
                    asin: bigBoe.asin
                  }).books.length;
                  if (most < bigBoeLength) most = bigBoeLength;
                }
              });

              return most;
            },
            condition: function(book) {
              if (book.series) {

                let min = this.range[0];
                let max = this.range[1];

                let result = false;
                _.each(book.series, function(cSeries) {
                  const series = _.find(vue.$store.state.library.series, {
                    asin: cSeries.asin
                  });
                  if (series) {
                    if (series.books.length >= min && series.books.length <= max) {
                      result = true;
                      return false;
                    }
                  }
                });

                return result;

              }
            }
          },

          {
            type: 'divider',
            key: 'divider4'
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Average rating',
            key: 'rating',
            group: 'filterExtras',
            range: true,
            rangeMinDist: 0,
            rangeSuffix: '',
            rangeMin: function() {
              let books = vue.$store.getters.collectionSource;
              let smallestRating = _.minBy(books, function(book) {
                if (book.rating) return parseFloat(book.rating);
              });
              // return smallestRating ? Math.floor(parseFloat(smallestRating.rating)) : 0; 
              return smallestRating ? parseFloat(smallestRating.rating) : 0;
            },
            rangeMax: function() {
              let books = vue.$store.getters.collectionSource;
              let biggestRating = _.maxBy(books, function(book) {
                if (book.rating) return parseFloat(book.rating);
              });
              // return biggestRating ? Math.ceil(parseFloat(biggestRating.rating)) : 0; 
              return biggestRating ? parseFloat(biggestRating.rating) : 0;
            },
            condition: function(book) {
              if (book.rating) {
                let min = this.range[0];
                let max = this.range[1];
                let rating = parseFloat(book.rating);
                // return Math.floor(rating) >= min && Math.ceil(rating) <= max; 
                return rating >= min && rating <= max;
              }
            },
            rangeInterval: .1,
          },

          {
            type: 'divider',
            key: 'divider5.2'
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Ratings',
            key: 'number-of-ratings',
            group: 'filterExtras',
            range: true,
            rangeMinDist: 1,
            rangeSuffix: '',
            rangeMin: function() {
              // return 1; 

              let books = vue.$store.getters.collectionSource;
              let bigBoe = _.minBy(books, function(book) {
                if (book.ratings) return parseFloat(book.ratings)
              });
              // seconds to minutes + rounded UP
              return bigBoe ? bigBoe.ratings : 0;

            },
            rangeMax: function() {
              let books = vue.$store.getters.collectionSource;
              let bigBoe = _.maxBy(books, function(book) {
                if (book.ratings) return parseFloat(book.ratings)
              });
              // seconds to minutes + rounded UP
              return bigBoe ? bigBoe.ratings : 0;
            },
            condition: function(book) {
              if (book.ratings) {
                let min = this.range[0];
                let max = this.range[1];
                let ratings = parseFloat(book.ratings);
                return ratings >= min && ratings <= max;
              }
            }
          },

          {
            type: 'divider',
            key: 'divider5',
            excludeFromWishlist: true
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'My rating',
            excludeFromWishlist: true,
            key: 'myrating',
            group: 'filterExtras',
            range: true,
            rangeMinDist: 0,
            rangeSuffix: '',
            rangeInterval: 1,
            rangeMarks: function( range ) {
              return true;
            }, 
            rangeMin: function() {
              let books = vue.$store.getters.collectionSource;
              let smallestRating = _.minBy(books, function(book) {
                if (book.myRating) return parseFloat(book.myRating);
              });
              return smallestRating ? parseFloat(smallestRating.myRating) : 0;
            },
            rangeMax: function() {
              let books = vue.$store.getters.collectionSource;
              let biggestRating = _.maxBy(books, function(book) {
                if (book.myRating) return parseFloat(book.myRating);
              });
              return biggestRating ? parseFloat(biggestRating.myRating) : 0;
            },
            condition: function(book) {
              if (book.myRating) {
                let min = this.range[0];
                let max = this.range[1];
                let rating = parseFloat(book.myRating);
                return rating >= min && rating <= max;
              }
            },
            tooltipFormatter: function( val ) {
              switch ( val ) {
                case 1:
                  return val+' (Not for me)';
                  break;
                case 2:
                  return val+' (It’s okay)';
                  break;
                case 3:
                  return val+' (Pretty good)';
                  break;
                case 4:
                  return val+' (It’s great)';
                  break;
                case 5:
                  return val+' (I love it)';
                  break;
                default: 
                  return 0;
                break;
              }
            },
          },

          {
            type: 'divider',
            key: 'divider5.1'
          },
          {
            active: false,
            type: 'filterExtras',
            label: 'Added',
            key: 'added',
            group: 'filterExtras',
            range: true,
            rangeMinDist: 1,
            rangeSuffix: '',
            rangeMin: function() {
              let books = vue.$store.getters.collectionSource;
              let smalled = _.minBy(books, function(book) {
                if (book.added) return parseFloat(book.added);
              });
              return smalled ? parseFloat(smalled.added) : 0;
            },
            rangeMax: function() {
              let books = vue.$store.getters.collectionSource;
              let biggest = _.maxBy(books, function(book) {
                if (book.added) return parseFloat(book.added);
              });
              return biggest ? parseFloat(biggest.added) : 0;
            },
            condition: function(book) {
              if (book.added) {
                let min = this.range[0];
                let max = this.range[1];
                let added = parseFloat(book.added);
                return added >= min && added <= max;
              }
            },
            rangeInterval: 1,
            tippy: "Low number = old book <br> High number = new book <br><br> For example: if you pick the range 1-10 you get 10 of the oldest books based on when they were added."
          },

          {
            type: 'divider',
            key: 'divider8.8'
          },

          {
            active: false,
            type: 'filterExtras',
            label: 'Authors',
            key: 'authors-by-name',
            group: 'filterExtras',
            dropdownOpts: function(type) {
              let allTags = [];
              _.each(vue.$store.getters.collectionSource, function(book) {
                if (book.authors) allTags.push(_.map(book.authors, 'name'));
              });
              allTags = _.union(_.flatten(allTags)).sort();
              return allTags;
            },
            value: [],
            condition: function(book) {
              if ( book.authors ) {
                let bookTags = _.map(book.authors, 'name');
                let selectedTags = this.value;
                if ( selectedTags.length > 0 ) {
                  let found = false;
                  _.each(selectedTags, function(selectedTag) {
                    if (_.includes(bookTags, selectedTag)) {
                      found = true;
                      return false;
                    }
                  });
                  return found;
                }
              }
            }
          },
          {
            type: 'divider',
            key: 'divider8.9'
          },

          {
            active: false,
            type: 'filterExtras',
            label: 'Narrators',
            key: 'narrators-by-name',
            group: 'filterExtras',
            dropdownOpts: function(type) {
              let allTags = [];
              _.each(vue.$store.getters.collectionSource, function(book) {
                if (book.narrators) allTags.push(_.map(book.narrators, 'name'));
              });
              allTags = _.union(_.flatten(allTags)).sort();
              return allTags;
            },
            value: [],
            condition: function(book) {
              if ( book.narrators ) {
                let bookTags = _.map(book.narrators, 'name');
                let selectedTags = this.value;
                if ( selectedTags.length > 0 ) {
                  let found = false;
                  _.each(selectedTags, function(selectedTag) {
                    if (_.includes(bookTags, selectedTag)) {
                      found = true;
                      return false;
                    }
                  });
                  return found;
                }
              }
            }
          },

          {
            type: 'divider',
            key: 'divider9.0'
          },

          {
            active: false,
            type: 'filterExtras',
            label: 'Tags',
            key: 'tags',
            group: 'filterExtras',
            dropdownOpts: function(type) {
              let allTags = [];
              _.each(vue.$store.getters.collectionSource, function(book) {
                if (book.tags) allTags.push(_.map(book.tags, 'name'));
              });
              allTags = _.union(_.flatten(allTags)).sort();
              return allTags;
            },
            value: [],
            condition: function(book) {
              if ( book.tags ) {
                let bookTags = _.map(book.tags, 'name');
                let selectedTags = this.value;
                if ( selectedTags.length > 0 ) {
                  let found = false;
                  _.each(selectedTags, function(selectedTag) {
                    if (_.includes(bookTags, selectedTag)) {
                      found = true;
                      return false;
                    }
                  });
                  return found;
                }
              }
            }
          },

          {
            type: 'divider',
            key: 'divider9.1'
          },

          {
            active: false,
            type: 'filterExtras',
            label: 'Language',
            key: 'language',
            group: 'filterExtras',
            dropdownOpts: function(type) {
              let allTags = [];
              _.each(vue.$store.getters.collectionSource, function(book) {
                if (book.language) allTags.push(book.language);
              });
              allTags = _.union(allTags).sort();
              return allTags;
            },
            value: [],
            condition: function(book) {
              if ( book.language ) {
                let selectedTags = this.value;
                return _.includes(selectedTags, book.language);
              }
            }
          },

          // {
          //   type: 'divider',
          //   key: 'divider9.2'
          // },

          // {
          //   active: false,
          //   type: 'filterExtras',
          //   label: 'Parent category',
          //   key: 'parent-category',
          //   group: 'filterExtras',
          //   dropdownOpts: function(type) {
          //     let allTags = [];
          //     _.each(vue.$store.getters.collectionSource, function(book) {
          //       if (book.categories && book.categories[0]) allTags.push(book.categories[0].name);
          //     });
          //     allTags = _.union(allTags).sort();
          //     return allTags;
          //   },
          //   value: [],
          //   condition: function(book) {
          //     if ( book.categories && book.categories[0] ) {
          //       let selectedTags = this.value;
          //       return (book.categories && book.categories[0]) ? _.includes(selectedTags, book.categories[0].name) : false;
          //     }
          //   }
          // },

          // {
          //   type: 'divider',
          //   key: 'divider9.3'
          // },

          // {
          //   active: false,
          //   type: 'filterExtras',
          //   label: 'Child category',
          //   key: 'child-category',
          //   group: 'filterExtras',
          //   dropdownOpts: function(type) {
          //     let allTags = [];
          //     _.each(vue.$store.getters.collectionSource, function(book) {
          //       if (book.categories && book.categories[1]) allTags.push(book.categories[1].name);
          //     });
          //     allTags = _.union(allTags).sort();
          //     return allTags;
          //   },
          //   value: [],
          //   condition: function(book) {
          //     if ( book.categories && book.categories[1] ) {
          //       let selectedTags = this.value;
          //       return (book.categories && book.categories[1]) ? _.includes(selectedTags, book.categories[1].name) : false;
          //     }
          //   }
          // },

          {
            type: 'divider',
            key: 'divider9.4'
          },

          {
            active: false,
            type: 'filterExtras',
            label: 'Series by name',
            key: 'series-by-name',
            group: 'filterExtras',
            dropdownOpts: function(type) {
              let allTags = [];
              _.each(vue.$store.getters.collectionSource, function(book) {
                if (book.series) allTags.push(_.map(book.series, 'name'));
              });
              allTags = _.union(_.flatten(allTags)).sort();
              return allTags;
            },
            value: [],
            condition: function(book) {
              if ( book.series ) {
                let bookTags = _.map(book.series, 'name');
                let selectedTags = this.value;
                if ( selectedTags.length > 0 ) {
                  let found = false;
                  _.each(selectedTags, function(selectedTag) {
                    if (_.includes(bookTags, selectedTag)) {
                      found = true;
                      return false;
                    }
                  });
                  return found;
                }
              }
            }
          },
          
          {
            type: 'divider',
            key: 'divider9.5'
          },

          {
            active: false,
            type: 'filterExtras',
            label: 'Format',
            key: 'format',
            group: 'filterExtras',
            dropdownOpts: function(type) {
              let allTags = [];
              _.each(vue.$store.getters.collectionSource, function(book) {
                if (book.format) allTags.push( book.format );
              });
              allTags = _.union( allTags ).sort();
              return allTags;
            },
            value: [],
            condition: function(book) {
              if ( book.format ) {
                return book.format ? _.includes( this.value, book.format) : false;
              }
            }
          },
          
          {
            type: 'divider',
            key: 'divider9.6'
          },

          {
            active: false,
            type: 'filterExtras',
            label: 'Publishers',
            key: 'publishers-by-name',
            group: 'filterExtras',
            dropdownOpts: function(type) {
              let allTags = [];
              _.each(vue.$store.getters.collectionSource, function(book) {
                if (book.publishers) allTags.push(_.map(book.publishers, 'name'));
              });
              allTags = _.union(_.flatten(allTags)).sort();
              return allTags;
            },
            value: [],
            condition: function(book) {
              if ( book.publishers ) {
                let bookTags = _.map(book.publishers, 'name');
                let selectedTags = this.value;
                if ( selectedTags.length > 0 ) {
                  let found = false;
                  _.each(selectedTags, function(selectedTag) {
                    if (_.includes(bookTags, selectedTag)) {
                      found = true;
                      return false;
                    }
                  });
                  return found;
                }
              }
            }
          },
          
          {
            type: 'divider',
            key: 'divider9.7'
          },

          {
            active: false,
            type: 'filterExtras',
            label: 'Collections',
            key: 'collections',
            group: 'filterExtras',
            excludeFromWishlist: true,
            dropdownTrackBy: 'valueProp',
            dropdownLabel: 'label',
            dropdownValueProp: 'valueProp',
            dropdownOpts: function(type) {
              if ( vue.$store.state.library.collections ) {
                let allTags = _.map( vue.$store.state.library.collections, function( collection ) {
                  return {
                    label: collection.title,
                    valueProp: collection.id,
                  };
                });
                // _.each(vue.$store.state.library.collections, function(book) {
                //   if (book.publishers) allTags.push(_.map(book.publishers, 'name'));
                // });
                return _.sortBy(allTags, 'title');
              }
              else { return []; }
            },
            value: [],
            condition: function( book ) {
              
              const selectedTags = _.get(this, 'value') || [];
              const collectionIds = _.get(book, 'collectionIds', []);
              const allCollections = _.get(vue.$store.state, 'library.collections', []);
              if ( selectedTags.length && collectionIds.length && allCollections.length ) {
                
                let ping = false;
                _.each(selectedTags, ( selected ) => {
                  if ( _.includes(book.collectionIds, selected) ) {
                    ping = true;
                    return false;
                  }
                });
                
                return ping;
                
              }
            }
          },

        ],
        sort: [{
            active: false,
            sticky: true,
            key: 'sortValues',
            label: 'Show sort values',
            type: 'sortExtras',
            tippy: "Shows the active sorter's value on top of the cover in the grid view."
          },
          {
            active: false,
            key: 'randomize',
            label: 'Randomize',
            type: 'sortExtras',
            tippy: "Sorting is ignored and the order is randomized."
          },
          
          // Just an idea...
          // {
          //   active: false,
          //   key: 'autofilternil',
          //   label: 'Auto filter nil',
          //   type: 'sortExtras',
          //   tippy: "If a sorting value is missing, it's automatically filtered out of the list."
          // },

          {
            type: 'divider',
            key: 'divider1'
          },
          // active: true = arrow down / descending
          {
            active: true,
            current: true,
            key: 'added',
            label: 'Added',
            type: 'sort',
            tippy: '<small>&#9650;</small> Old at the top <br><small style="display: inline-block; transform: rotate(180deg);">&#9650;</small> New at the top'
          },
          {
            onlyWishlist: true,
            active: true,
            current: false,
            key: 'price',
            label: 'Price',
            type: 'sort',
          },
          {
            active: true,
            current: false,
            key: 'title',
            label: 'Title',
            type: 'sort'
          },
          {
            active: true,
            current: false,
            key: 'authors.name',
            label: 'Author',
            type: 'sort'
          },
          {
            active: true,
            current: false,
            key: 'narrators.name',
            label: 'Narrator',
            type: 'sort'
          },
          {
            active: true,
            current: false,
            key: 'narratorsNumber',
            label: 'Number of narrators',
            type: 'sort'
          },
          {
            active: false,
            current: false,
            key: 'length',
            label: 'Length',
            type: 'sort'
          },
          {
            active: true,
            current: false,
            key: 'series',
            label: 'Series',
            type: 'sort',
            tippy: 'Sorts books by the series name alphabetically.'
          },
          // { active: true , current: false, key: 'seriesNumber'  , label: 'Series length'          , type: 'sort' }, 

          {
            type: 'divider',
            key: 'divider2'
          },
          {
            active: false,
            current: false,
            key: 'releaseDate',
            label: 'Release date',
            type: 'sort'
          },
          {
            active: false,
            current: false,
            key: 'rating',
            label: 'Average rating',
            type: 'sort'
          },
          {
            active: false,
            current: false,
            key: 'ratings',
            label: 'Number of ratings',
            type: 'sort'
          },
          {
            active: false,
            current: false,
            key: 'myRating',
            label: 'My rating',
            type: 'sort',
            excludeFromWishlist: true
          },
          {
            active: true,
            current: false,
            key: 'publishers.name',
            label: 'Publishers',
            type: 'sort'
          },

          {
            type: 'divider',
            key: 'divider3'
          },
          {
            active: false,
            current: false,
            key: 'progress',
            label: 'Progress',
            type: 'sort',
            excludeFromWishlist: true
          },
          {
            active: false,
            current: false,
            key: 'favorite',
            label: 'Favorite',
            type: 'sort',
            excludeFromWishlist: true,
          },
          {
            active: true,
            current: false,
            key: 'categories',
            label: 'Categories',
            type: 'sort',
          },
          {
            active: true,
            current: false,
            key: 'tags.name',
            label: 'Tags',
            type: 'sort',
          },
          {
            active: false,
            current: false,
            key: 'isNew',
            label: 'New books',
            type: 'sort',
            excludeFromWishlist: true,
          },
          {
            active: false,
            current: false,
            key: 'archived',
            label: 'Archived',
            type: 'sort',
            excludeFromWishlist: true,
          },

          {
            type: 'divider',
            key: 'divider4',
          },
          {
            active: true,
            current: false,
            key: 'language',
            label: 'Language',
            type: 'sort'
          },
          {
            active: true,
            current: false,
            key: 'format',
            label: 'Format',
            type: 'sort'
          },
          {
            active: false,
            current: false,
            key: 'whispersync',
            label: 'Whispersync',
            type: 'sort',
          },
          {
            active: false,
            current: false,
            key: 'fromPlusCatalog',
            label: 'From plus catalog',
            type: 'sort'
          },
          {
            active: false,
            current: false,
            key: 'unavailable',
            label: 'Plus catalog: Unavailable',
            type: 'sort',
          },
          {
            active: false,
            current: false,
            key: 'downloaded',
            label: 'Downloaded',
            type: 'sort',
            excludeFromWishlist: true
          },

          {
            type: 'divider',
            key: 'divider5'
          },
          {
            active: false,
            current: false,
            key: 'storePageMissing',
            label: 'Store page missing',
            type: 'sort',
            tippy: 'The original store page could not be found. There may be a new store page that replaced it.'
          },
          {
            active: false,
            current: false,
            key: 'storePageChanged',
            label: 'Store page changed',
            type: 'sort',
            tippy: 'There is a store page that exists, but it is for a different version of the book.'
          },
          {
            active: false,
            current: false,
            key: 'isbn10',
            label: 'Isbn 10',
            type: 'sort',
            excludeFromWishlist: true
          },
          {
            active: false,
            current: false,
            key: 'isbn13',
            label: 'Isbn 13',
            type: 'sort',
            excludeFromWishlist: true
          },
          {
            active: true,
            current: false,
            key: 'bookNumbers',
            label: 'Book Numbers',
            type: 'sort',
            tippy: '<strong>This is only a simple number sort.</strong> <br> If you want the correct series order, as listed in Audible, check the series page in the top menu or the "my books in the series" button in book details. <br><br>Click any book cover (or row) to reveal book details. <br><br> The infinite symbol (∞) means the book is in a series but does not have a number.'
          },
        ],
      };
      
      this.removeArchived( list );
      
      // FIXME: thinking about adding a dropdown that allows sorting with A and showing value from B
      // For example, sort by "Added" and show "Author" as the 'sort value'
      // this.addSortValueDropdown( list );

      this.addExcludeDropdowns( list );
      
      
      // This should always be last, because it executes filters etc from url parameters...
      this.$setListRenderingOpts( list );

    },
    
    addExcludeDropdowns( list ) {
      
      let filters = list.filter;
      
      // Split the array in two
      const firstDropdown_index = _.findIndex( filters, 'dropdownOpts');
      filters =_.chunk( filters, firstDropdown_index-1 );
      const dropdowns = filters[1];
      
      // Remove dividers for now...
      _.remove( dropdowns, ( filter) => {
        return filter.type === 'divider';
      });
      
      const clonedDropdowns = _.cloneDeep( dropdowns );
      
      _.each( clonedDropdowns, ( dropdown ) => {
        dropdown.conditionOriginal = dropdown.condition; 
        dropdown.condition = function( book ) {
          return !dropdown.conditionOriginal( book );
        };
        dropdown.placeholder = 'Exclude...';
        // dropdown.label       = dropdown.label + ' — Exclude';
        dropdown.key         = dropdown.key + '-exclude';
        dropdown.exclude     = true;
      });
      
      // const clonedFilters = _.clone( filters );
      
      let zipper = _.zip( dropdowns, clonedDropdowns );
            
      _.each( zipper, ( node, index ) => {
        node.unshift({
          type: 'divider',
          key: 'divider-99999.' + index,
        })
      });
      
      zipper = _.flatten( zipper );
      filters[ 1 ] = zipper;
      list.filter = _.flatten( filters );
      
    },
    
    removeArchived: function( list ) {

      if ( !this.$store.state.library.collections ) return;
      
      let collections = this.$store.state.library.collections;
      let archive = collections ? _.find( collections, { id: '__ARCHIVE' }) : null;
      if ( !archive || archive.books.length < 1 ) {
        let removeArchiveKeys = ['archived', 'not-archived'];
        _.remove(list.filter, function( filter ) {
          return filter.key === 'divider-archived' || _.includes( removeArchiveKeys, filter.key );
        });
        _.remove(list.sort, function( sorter ) {
          return _.includes( removeArchiveKeys, sorter.key );
        });
      }
      
    },
    
    // addSortValueDropdown: function( list) {
      
    //   // Obviously this is not complete in any way... but...
    //   // FIXME: Make sure series/subpage sorter "bookNumbers" is moved
    //   // FIXME: Not sure why yet, but the options list's arrow is not getting a new position when this dropdown makes it wider....
      
    //   let vue = this;
    //   let newItem = {
    //     active: false,
    //     sticky: true,
    //     key: 'sortValues-list',
    //     label: 'Show value from a',
    //     type: 'sortExtras',
    //     tippy: "Shows the active sorter's value on top of the cover in the grid view.",
    //     dropdownOpts: function(type) {
    //       let allTags = _.filter(list.sort, { type: 'sort' });
    //       allTags = _.map( allTags, 'label');
    //       return allTags;
    //     },
    //     value: [],
    //     condition: function(book) {
    //       if ( book.authors ) {
    //         let bookTags = _.map(book.authors, 'name');
    //         let selectedTags = this.value;
    //         if ( selectedTags.length > 0 ) {
    //           let found = false;
    //           _.each(selectedTags, function(selectedTag) {
    //             if (_.includes(bookTags, selectedTag)) {
    //               found = true;
    //               return false;
    //             }
    //           });
    //           return found;
    //         }
    //       }
    //     }
    //   };
      
    //   list.sort.splice(1,0, newItem);
      
    // },
    
  }
};


function lengthMarksCalc(max) {

  var marks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20];

  if (max < 20) {
    while (marks[marks.length - 1] > max) {
      marks.pop();
    }
    if (max > marks[marks.length - 1]) {
      if (max <= marks[marks.length - 1] + 2) marks.pop();
      marks.push(max);
    }
  } else {

    var remainder = max - 20;
    var tens = Math.floor(remainder / 10);

    if (tens === 0) {
      if (max <= marks[marks.length - 1] + 4) marks.pop();
      marks.push(max);
    } else {

      var tensArray = _.range(1, tens + 1);
      _.each(tensArray, function() {
        marks.push(marks[marks.length - 1] + 10);
      });

      if (max > marks[marks.length - 1]) {
        if (max <= marks[marks.length - 1] + 4) marks.pop();
        marks.push(max);
      }

    }

  }

  return marks;

}