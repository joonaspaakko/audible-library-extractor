
export default {
  methods: {
    getDataFromPurchaseHistory: function( hotpotato, purchaseHistoryFetched ) {

      // No books to date and dates already collected in a previous extraction: nothing to gain from re-scanning.
      const noNewBooks = hotpotato.library && !_.some( hotpotato.library, 'isNewThisRound' );
      const alreadyHasPurchaseHistory = this.$store.state.storageHasData.purchaseHistory;

      if ( !_.find( hotpotato.config.steps, { name: "purchaseHistory" }) || ( noNewBooks && alreadyHasPurchaseHistory ) ) {

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
          { key: 'subStep.max', value: 3 },
          { key: 'progress.text', value: 'Scanning purchase history...' },
          { key: 'progress.step', value: 0 },
          { key: 'progress.max', value: 0 },
        ]);

        const baseUrl = this.purchaseHistoryUrl + '?tf=orders&ps=40';

        // Build set of ASINs that need a purchaseDate this round.
        // isNewThisRound = scanned fresh this extraction (new books in partial scan, all books in full scan).
        // Books that already have a purchaseDate from a previous extraction are excluded.
        const needsDates = new Set();
        if ( hotpotato.library ) {
          const booksNeedingDates = _.filter( hotpotato.library, ( b ) => b.isNewThisRound && !b.purchaseDate );
          _.each( booksNeedingDates, ( b ) => needsDates.add( b.asin ) );
        }

        // Only a partial scan can exit early once every target ASIN has a date.
        const someBooksAreNew = hotpotato.library && _.some( hotpotato.library, 'isNewThisRound' );
        const everyBookIsNew = hotpotato.library && _.every( hotpotato.library, 'isNewThisRound' );
        const isPartialScan = hotpotato.purchaseHistory && someBooksAreNew && !everyBookIsNew;

        // Shared across all phases: assigns a stable incrementing group number per order id
        // as pages are parsed, so the grouping survives across the reconnaissance/year batches.
        const orderGroupMap = new Map();
        const allItems = [];

        // Three request batches run as a waterfall: reconnaissance, then every year's first page,
        // then every remaining page. Sequencing them keeps per-year progress readable and lets a
        // partial scan bail after phase 1 (amapxios shares one global rate limiter, so overlap is
        // rate-safe regardless).
        waterfall(
          [
            // PHASE 1. Reconnaissance: last 365 days tells us which years exist, and its items
            // are the most recent purchases (often all a partial scan needs).
            ( waterfallback ) => {
              this.reconPurchaseHistory( hotpotato, baseUrl, needsDates, isPartialScan, orderGroupMap, allItems, waterfallback );
            },
            // PHASE 2. First page of every year: learns each year's page count and keeps its items.
            ( years, waterfallback ) => {
              this.getPurchaseHistoryFirstPages( hotpotato, baseUrl, years, orderGroupMap, allItems, waterfallback );
            },
            // PHASE 3. Every remaining page across all years, pooled into one flat batch.
            ( remainingUrls, waterfallback ) => {
              this.getRemainingPurchaseHistoryPages( hotpotato, remainingUrls, orderGroupMap, allItems, waterfallback );
            },
          ],
          ( err ) => {

            if ( err ) console.error( '%c' + 'error' + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;', err );

            // DEDUPLICATE by asin, keeping first occurrence (earliest year / recent recon page)
            const seen = {};
            const deduped = _.filter( allItems, ( item ) => {
              if ( seen[ item.asin ] ) return false;
              seen[ item.asin ] = true;
              return true;
            });

            // MERGE purchaseDate into library books
            if ( hotpotato.library ) {
              _.each( deduped, ( item ) => {
                const book = _.find( hotpotato.library, { asin: item.asin });
                if ( book ) book.purchaseDate = item.purchaseDate;
              });
            }

            // STORE raw list and finish
            hotpotato.purchaseHistory = deduped;

            this.$nextTick( () => {
              purchaseHistoryFetched( null, hotpotato );
            });

          }
        );

      }
    },

    // Reads the year <option>s from the date filter dropdown out of a purchase history page.
    parsePurchaseHistoryYears: function( response ) {

      const html = $($.parseHTML( response.data )).find('form').addBack();
      const years = [];
      html.find('select#ui-it-purchase-history-date-filter option').each( function() {
        const val = $(this).attr('value');
        if ( val && /^\d+$/.test( val ) ) years.push( val );
      });

      return years;

    },

    // PHASE 1: fetch the last 365 days. Its dropdown gives us every year with purchases, and its
    // rows are the most recent orders, so a partial scan is often satisfied here without touching
    // the per-year pages at all. Hands the year list to phase 2.
    reconPurchaseHistory: function( hotpotato, baseUrl, needsDates, isPartialScan, orderGroupMap, allItems, waterfallback ) {

      this.$store.commit( 'update', [
        { key: 'subStep.step', value: 1 },
        { key: 'progress.text', value: 'Finding purchase years...' },
        { key: 'progress.step', value: 0 },
        { key: 'progress.max', value: 0 },
      ]);

      let years = [];

      this.amapxios({
        requests: [ baseUrl + '&df=last_365_days' ],
        step: ( response, stepCallback ) => {

          years = this.parsePurchaseHistoryYears( response );

          this.processPurchaseHistoryPage( response, ( items ) => {

            allItems.push( ...items );
            _.each( items, ( item ) => needsDates.delete( item.asin ) );
            stepCallback();

          }, orderGroupMap );

        },
        done: () => {

          // Partial scan already has every date it needed: skip phases 2 and 3.
          const satisfied = isPartialScan && needsDates.size === 0;
          waterfallback( null, satisfied ? [] : years );

        }
      });

    },

    // PHASE 2: fetch page 1 of every year in one batch. Each response tells us that year's total
    // page count and gives us its items (kept, never re-fetched). Returns the flat list of every
    // remaining page url (2..N across all years) for phase 3.
    getPurchaseHistoryFirstPages: function( hotpotato, baseUrl, years, orderGroupMap, allItems, waterfallback ) {

      this.$store.commit( 'update', { key: 'subStep.step', add: 1 });

      // Nothing left to do: recon covered it.
      if ( !years.length ) return waterfallback( null, [] );

      this.$store.commit( 'update', [
        { key: 'progress.text', value: 'Scanning years...' },
        { key: 'progress.step', value: 0 },
        { key: 'progress.max', value: years.length },
      ]);

      this.amapxios({
        requests: _.map( years, ( year ) => baseUrl + '&df=' + year + '&pn=1' ),
        step: ( response, stepCallback, request ) => {

          const year = new Url( DOMPurify.sanitize( request ) ).query.df;

          // Highest numbered pagination button is this year's page count. The current page is a
          // <span>, other pages are <a>, and prev/next are number-less <div>s, so take the max of
          // every numbered button rather than the last (which would be the next arrow).
          const pageButtons = $($.parseHTML( response.data )).find('a.purchase-history-pagination-button, span.purchase-history-pagination-button');
          const pageNumbers = _.map( pageButtons, ( el ) => parseInt( $(el).text().trim(), 10 ) );
          const totalPages = _.max( pageNumbers.filter( _.isFinite ) ) || 1;

          // Page 1 is already in hand: parse it now, queue only pages 2..N.
          this.processPurchaseHistoryPage( response, ( items ) => {

            allItems.push( ...items );

            const remaining = _.map( _.range( 2, totalPages + 1 ), ( pn ) => baseUrl + '&df=' + year + '&pn=' + pn );

            this.$store.commit( 'update', { key: 'progress.step', add: 1 });
            stepCallback( remaining );

          }, orderGroupMap );

        },
        flatten: true,
        done: ( remainingUrls ) => {
          waterfallback( null, remainingUrls );
        }
      });

    },

    // PHASE 3: fetch every remaining page (2..N of every year) as one flat, pooled batch with a
    // single global progress bar.
    getRemainingPurchaseHistoryPages: function( hotpotato, remainingUrls, orderGroupMap, allItems, waterfallback ) {

      this.$store.commit( 'update', { key: 'subStep.step', add: 1 });

      // Every year was a single page: nothing left to fetch.
      if ( !remainingUrls.length ) return waterfallback( null );

      this.$store.commit( 'update', [
        { key: 'progress.text', value: 'Fetching purchase history...' },
        { key: 'progress.step', value: 0 },
        { key: 'progress.max', value: remainingUrls.length },
      ]);

      this.amapxios({
        requests: remainingUrls,
        step: ( response, stepCallback ) => {

          this.processPurchaseHistoryPage( response, ( items ) => {

            allItems.push( ...items );
            this.$store.commit( 'update', { key: 'progress.step', add: 1 });
            stepCallback();

          }, orderGroupMap );

        },
        done: () => {
          waterfallback( null );
        }
      });

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
