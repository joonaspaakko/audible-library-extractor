
export default {
  methods: {
    getDataFromPurchaseHistory: function( hotpotato, purchaseHistoryFetched ) {
      if ( !_.find( hotpotato.config.steps, { name: "purchaseHistory" }) ) {

        this.$store.commit( "resetProgress" );
        purchaseHistoryFetched( null, hotpotato );

      }
      else {

        this.$store.commit( 'update', [
          { key: 'bigStep.step', value: 0 },
        ]);

        this.$store.commit( 'update', [
          { key: 'bigStep.title', value: 'Purchase history' },
          { key: 'bigStep.step', add: 1 },
          { key: 'subStep.step', value: 1 },
          { key: 'subStep.max', value: 2 },
          { key: 'progress.text', value: 'Scanning purchase history...' },
          { key: 'progress.step', value: 0 },
          { key: 'progress.max', value: 0 },
        ]);

        const vue = this;
        const baseUrl = vue.purchaseHistoryUrl + '?tf=orders&ps=40';

        // STEP A: fetch first page to read available year options
        vue.amapxios({
          requests: [ baseUrl ],
          step: function( response, stepCallback ) {

            const html = $($.parseHTML( response.data )).find('form').addBack();
            const yearOptions = [];
            html.find('select#ui-it-purchase-history-date-filter option').each( function() {
              const val = $(this).attr('value');
              if ( val && /^\d+$/.test( val ) ) yearOptions.push( val );
            });

            stepCallback( yearOptions );

          },
          done: function( results ) {

            const years = _.flatten( results );

            vue.$store.commit( 'update', [
              { key: 'subStep.step', value: 1 },
              { key: 'subStep.max', value: years.length + 1 },
            ]);

            // STEP B: iterate years sequentially, pages within each year in parallel

            // Build set of ASINs that need a purchaseDate this round.
            // isNewThisRound = scanned fresh this extraction (new books in partial scan, all books in full scan).
            // Books that already have a purchaseDate from a previous extraction are excluded.
            const needsDates = hotpotato.library
              ? new Set( _.map( _.filter( hotpotato.library, function( b ) {
                  return b.isNewThisRound && !b.purchaseDate;
                }), 'asin' ) )
              : new Set();

            // If nothing needs dates (e.g. all new books already have one somehow), skip entirely.
            // An empty needsDates set with no library means full scan — don't skip.
            const isPartialScan = !!hotpotato.purchaseHistory
              && hotpotato.library && _.some( hotpotato.library, 'isNewThisRound' )
              && !_.every( hotpotato.library, 'isNewThisRound' );

            const allItems = [];
            const orderGroupMap = new Map();

            function processYears( remainingYears, done ) {

              if ( !remainingYears.length ) {
                done();
                return;
              }

              // Early exit: all target ASINs have been found
              if ( isPartialScan && needsDates.size === 0 ) {
                done();
                return;
              }

              const year = remainingYears[0];
              const rest = remainingYears.slice( 1 );

              vue.$store.commit( 'update', [
                { key: 'subStep.step', add: 1 },
                { key: 'progress.text', value: 'Purchase history: ' + year },
                { key: 'progress.step', value: 0 },
                { key: 'progress.max', value: 0 },
              ]);

              // Fetch page 1 of this year to learn total pages
              vue.amapxios({
                requests: [ baseUrl + '&df=' + year ],
                step: function( response, stepCallback ) {

                  const parsedHtml = $($.parseHTML( response.data ));

                  // Find the last numbered page link to get total page count
                  const pageLinks = parsedHtml.find('.purchase-history-pagination-button a');
                  const lastPageLink = pageLinks.last();
                  const totalPages = lastPageLink.length ? parseInt( lastPageLink.text().trim(), 10 ) || 1 : 1;

                  // Build all page URLs for this year (page 1 response is already in hand so
                  // include it too — amapxios fetches everything fresh in parallel)
                  const pageUrls = _.map( _.range( 1, totalPages + 1 ), function( pn ) {
                    return baseUrl + '&df=' + year + '&pn=' + pn;
                  });

                  stepCallback( pageUrls );

                },
                done: function( pageUrlResults ) {

                  const pageUrls = _.flatten( pageUrlResults );

                  vue.$store.commit( 'update', { key: 'progress.max', value: pageUrls.length });

                  // Fetch all pages for this year in parallel
                  vue.amapxios({
                    requests: pageUrls,
                    step: function( response, stepCallback ) {
                      vue.processPurchaseHistoryPage( response, function( items ) {
                        vue.$store.commit( 'update', { key: 'progress.step', add: 1 });
                        stepCallback( items );
                      }, orderGroupMap );
                    },
                    flatten: true,
                    done: function( yearItems ) {
                      allItems.push( ...yearItems );
                      // Mark found ASINs off the target set
                      _.each( yearItems, function( item ) { needsDates.delete( item.asin ); });
                      processYears( rest, done );
                    }
                  });

                }
              });

            }

            processYears( years, function() {

              // STEP C: deduplicate by asin, keeping first occurrence (earliest year)
              const seen = {};
              const deduped = _.filter( allItems, function( item ) {
                if ( seen[ item.asin ] ) return false;
                seen[ item.asin ] = true;
                return true;
              });

              // STEP D: merge purchaseDate into library books
              if ( hotpotato.library ) {
                _.each( deduped, function( item ) {
                  const book = _.find( hotpotato.library, { asin: item.asin });
                  if ( book ) book.purchaseDate = item.purchaseDate;
                });
              }

              // STEP E: store raw list and finish
              hotpotato.purchaseHistory = deduped;

              vue.$nextTick( function() {
                purchaseHistoryFetched( null, hotpotato );
              });

            });

          }
        });

      }
    },

    processPurchaseHistoryPage: function( response, completeStep, orderGroupMap ) {

      const vue = this;
      const parsedHtml = $($.parseHTML( response.data ));
      const items = [];
      let lastPurchaseDate = null;

      parsedHtml.find('tr.bc-table-row').each( function() {

        const row = this;

        const returnLink = row.querySelector('a[data-order-item-asin]');
        if ( !returnLink ) return;

        const asin = DOMPurify.sanitize( returnLink.dataset.orderItemAsin || '' );
        if ( !asin ) return;

        const dateEl = row.querySelector('.ui-it-purchasehistory-item-purchasedate');
        const rawDate = dateEl ? DOMPurify.sanitize( dateEl.textContent.trim() ) : null;
        const parsedDate = rawDate ? vue.fixDates( rawDate ) : null;
        if ( parsedDate ) lastPurchaseDate = parsedDate;
        const purchaseDate = parsedDate || lastPurchaseDate;

        const rawOrderId = returnLink.dataset.orderId || '';
        if ( rawOrderId && !orderGroupMap.has( rawOrderId ) ) {
          orderGroupMap.set( rawOrderId, orderGroupMap.size + 1 );
        }
        const orderGroup = rawOrderId ? orderGroupMap.get( rawOrderId ) : null;

        items.push({ asin, purchaseDate, orderGroup });

      });

      completeStep( items );

    },

  }
};
