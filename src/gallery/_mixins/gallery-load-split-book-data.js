// Chunks are fetched once per cacheID and stored in IndexedDB. When the cacheID changes
// (new library export), all stored chunks are cleared and re-fetched, which is a
// deliberate compromise for simplicity and reliability.

import axios from 'axios';

// MODULE-LEVEL CONSTANTS:

// Database config:
export const db = {
  name: 'ale_split_book_data',
  version: 2,
  stores: {
    meta: 'meta',
    chunks: 'chunks',
    pages: 'pages',
  },
};

// Split-data field sets are described entirely by the export manifest
// (extras.splitFields), written by save-gallery. The loader is driven by that
// manifest, so adding a new split field needs no changes here.

// Intentionally outside the export so it survives component destroy/create cycles.
// No point resetting on every close.
let dbInstance = null;

// Keyed by namespaced chunk key ("summary-3") — prevents duplicate fetches when
// multiple books from the same chunk are opened before the first fetch resolves
// and writes to IndexedDB.
const inflightChunkFetches = {};

// Shared DB open. Used by both this mixin and the route loader.
export function openDB() {
  return new Promise((resolve, reject) => {

    const request = indexedDB.open(db.name, db.version);

    request.onupgradeneeded = (event) => {
      const idb = event.target.result;
      if ( !idb.objectStoreNames.contains(db.stores.meta) ) {
        idb.createObjectStore(db.stores.meta, { keyPath: 'key' });
      }
      if ( !idb.objectStoreNames.contains(db.stores.chunks) ) {
        idb.createObjectStore(db.stores.chunks, { keyPath: 'chunkIndex' });
      }
      if ( !idb.objectStoreNames.contains(db.stores.pages) ) {
        idb.createObjectStore(db.stores.pages, { keyPath: 'name' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror   = (event) => reject(event.target.error);

    // Another (older) page still holding the DB open at a lower version blocks the
    // upgrade. Reject so callers degrade rather than hang.
    request.onblocked = () => reject(new Error('IndexedDB upgrade blocked by another open connection'));

  });
}

// Shared cache validation. Wipes chunks+pages if cacheID changed.
export function validateCache(database, currentCacheID) {
  return new Promise((resolve, reject) => {

    const tx = database.transaction([db.stores.meta, db.stores.chunks, db.stores.pages], 'readwrite');
    const metaStore  = tx.objectStore(db.stores.meta);
    const chunkStore = tx.objectStore(db.stores.chunks);
    const pageStore  = tx.objectStore(db.stores.pages);

    const getRequest = metaStore.get('cacheID');

    getRequest.onsuccess = () => {
      const storedCacheID = getRequest.result?.value ?? null;

      if ( storedCacheID !== currentCacheID ) {
        chunkStore.clear();
        pageStore.clear();
        metaStore.put({ key: 'cacheID', value: currentCacheID });
      }

      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    };

    getRequest.onerror = () => reject(getRequest.error);

  });
}

// Set once if opening the DB fails unrecoverably this session (most likely a
// VersionError: stale cached code requesting a lower version than a newer build
// already created). When true we stop retrying and split data simply doesn't load,
// rather than crashing book details or spamming the console on every attempt.
let dbOpenFailed = false;

// Returns the module-level db instance, opening it first if needed. Shared so the
// book-detail loader and the background prefetcher reuse one connection. Returns
// null (instead of throwing) once an open has failed, so callers can degrade quietly.
export async function getBookDatabase() {
  if ( dbOpenFailed ) return null;
  if ( !dbInstance ) {
    try {
      dbInstance = await openDB();
    }
    catch ( err ) {
      dbOpenFailed = true;
      console.warn( '[splitData] IndexedDB unavailable, split data disabled this session:', err.name || err );
      return null;
    }
  }
  return dbInstance;
}

// Reads a chunk record from IndexedDB by its namespaced key ("summary-3").
function getChunkFromDatabase( database, chunkKey ) {
  return new Promise((resolve, reject) => {

    const tx = database.transaction(db.stores.chunks, 'readonly');
    const request = tx.objectStore(db.stores.chunks).get(chunkKey);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror   = () => reject(request.error);

  });
}

// Persists a fetched chunk to IndexedDB under its namespaced key.
function writeChunkToDatabase( database, chunkKey, books ) {
  return new Promise((resolve, reject) => {

    const tx = database.transaction(db.stores.chunks, 'readwrite');
    // keyPath is 'chunkIndex'; it now holds the namespaced string key.
    const request = tx.objectStore(db.stores.chunks).put({ chunkIndex: chunkKey, books });

    request.onsuccess = () => resolve();
    request.onerror   = () => reject(request.error);

  });
}

// Fetches a chunk JSON file. Axios throws on non-2xx, so no status check needed.
async function fetchChunkFile( field, chunkIndex, cacheID ) {
  const { data } = await axios.get(`data/split-book-data/${field.filePrefix}-${chunkIndex}.${cacheID}.json`);
  return data;
}

// Loads one chunk from IndexedDB, fetching and caching it if not yet stored.
// Reuses any in-flight fetch for the same chunk so an on-demand book open and the
// background prefetcher never fetch the same file twice.
export async function loadSplitChunk( database, field, chunkIndex, cacheID ) {

  const chunkKey = `${field.key}-${chunkIndex}`;

  const cached = await getChunkFromDatabase( database, chunkKey );
  if ( cached ) return cached.books;

  if ( !inflightChunkFetches[chunkKey] ) {
    inflightChunkFetches[chunkKey] = fetchChunkFile( field, chunkIndex, cacheID ).then( async (books) => {
      await writeChunkToDatabase( database, chunkKey, books );
      return books;
    })
    .finally(() => {
      delete inflightChunkFetches[chunkKey];
    });
  }

  return inflightChunkFetches[chunkKey];

}

// Runs a callback once the browser is idle, falling back to setTimeout where
// requestIdleCallback isn't supported (older Safari).
function whenIdle( callback ) {
  if ( typeof requestIdleCallback === 'function' ) {
    requestIdleCallback( callback, { timeout: 2000 });
  }
  else {
    setTimeout( callback, 200 );
  }
}

// Tracks the cacheID we've already kicked a prefetch off for, so it only runs once
// per export per session even if called from multiple route changes.
let prefetchedCacheID = null;

/**
 * Warms split-data chunks into IndexedDB in the background, one chunk per idle slice,
 * so book details open instantly and summaries are available for search. Cheap to
 * call repeatedly: dedupes via prefetchedCacheID and the shared in-flight map, and
 * skips chunks already cached.
 *
 * @param {Object} splitFields - The export manifest (extras.splitFields).
 * @param {string} cacheID
 * @param {Object} [opts]
 * @param {string[]} [opts.only] - Limit to these field keys (e.g. ['summary']).
 */
export async function prefetchSplitData( splitFields, cacheID, opts = {} ) {

  if ( _.isEmpty(splitFields) || cacheID == null ) return;
  if ( prefetchedCacheID === cacheID ) return;
  prefetchedCacheID = cacheID;

  const database = await getBookDatabase();
  if ( !database ) return;        // IndexedDB unavailable — skip prefetch this session.
  await validateCache( database, cacheID );

  // Flatten the manifest into a flat list of { field, chunkIndex } jobs.
  const jobs = [];
  _.each( splitFields, ( field ) => {
    if ( opts.only && !_.includes(opts.only, field.key) ) return;
    for ( let i = 0; i < field.chunkCount; i++ ) {
      jobs.push({ field, chunkIndex: i });
    }
  });

  // Walk the jobs one idle slice at a time, so prefetching never competes with route
  // navigation or the cover-image grid.
  let cursor = 0;
  const step = () => {

    if ( cursor >= jobs.length ) return;

    const { field, chunkIndex } = jobs[cursor];
    cursor++;

    loadSplitChunk( database, field, chunkIndex, cacheID )
    .catch(() => {})        // a failed prefetch is non-fatal; on-demand load can retry later
    .finally(() => whenIdle( step ));

  };

  whenIdle( step );

}

/**
 * Loads every chunk of a single split field and returns all its entries as one flat
 * array (each entry is `{ asin, [fieldKey]: value }`). Reuses cached chunks and the
 * shared in-flight map, so this is cheap once the prefetcher has warmed the field.
 * Used to hydrate a whole field (e.g. summaries) into memory for search.
 *
 * @param {Object} splitFields - The export manifest (extras.splitFields).
 * @param {string} cacheID
 * @param {string} fieldKey    - Which field to load ('summary').
 * @returns {Promise<Array>} All entries across the field's chunks.
 */
export async function loadAllFieldData( splitFields, cacheID, fieldKey ) {

  const field = splitFields && splitFields[fieldKey];
  if ( !field || cacheID == null ) return [];

  const database = await getBookDatabase();
  if ( !database ) return [];     // IndexedDB unavailable — no summaries to hydrate.
  await validateCache( database, cacheID );

  const chunks = await Promise.all(
    _.times( field.chunkCount, i => loadSplitChunk( database, field, i, cacheID ) )
  );

  return _.flatten( chunks );

}

export default {

  methods: {

    /**
     * Main entry point, called on component `created`.
     * Loads every split field for the current book (per the export manifest) from
     * IndexedDB, fetching from the server and caching if not yet stored.
     * @param {string} [afterError] - Truthy on a retry; suppresses further retries.
     */
    async loadJSON(afterError) {

      // In the extension environment book data lives directly on the book object.
      if ( !this.store.standalone ) {
        this.splitData.bookSummary      = this.book.summary          ?? null;
        this.splitData.peopleAlsoBought = this.book.peopleAlsoBought ?? null;
        return;
      }

      const { asin } = this.book;

      // The export manifest describes every split field generically (including where
      // its value lands via splitDataProp), so new split fields need no changes here.
      const splitFields = this.store.audibledata.extras.splitFields;
      if ( _.isEmpty(splitFields) ) return;

      const cacheID = this.store.audibledata.extras.cacheID;

      try {

        const database = await getBookDatabase();

        // IndexedDB unavailable (e.g. stale-cache VersionError). Degrade quietly:
        // the book detail just renders without split summary / peopleAlsoBought.
        if ( !database ) return;

        // Wipe stale chunks if the library was re-exported with a new cacheID.
        await validateCache(database, cacheID);

        await Promise.all( _.map( splitFields, async ( field ) => {

          const chunkIndex = this.book[ field.chunkIdProp ];

          // This book has no data for this field.
          if ( chunkIndex == null ) return;

          const books = await loadSplitChunk( database, field, chunkIndex, cacheID );
          const bookData = _.find( books, { asin } ) ?? null;

          if ( bookData && field.splitDataProp ) this.splitData[ field.splitDataProp ] = bookData[ field.key ];

        }));

      } catch ( err ) {

        console.warn(`[loadBookData] Failed to load data for asin ${asin}:`, err);

        if ( !afterError ) setTimeout(() => this.loadJSON('afterError'), 1000);

      }

    },

  },

};