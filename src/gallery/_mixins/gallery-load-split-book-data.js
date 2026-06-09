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

// Intentionally outside the export so it survives component destroy/create cycles.
// No point resetting on every close.
let dbInstance = null;

// Keyed by chunkId — prevents duplicate fetches when multiple books from the same
// chunk are opened before the first fetch resolves and writes to IndexedDB.
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

export default {

  methods: {

    /**
     * Main entry point, called on component `created`.
     * Loads split book data (summary + peopleAlsoBought) for the current book
     * from IndexedDB, fetching from the server and caching if not yet stored.
     * @param {string} [afterError] - Truthy on a retry; suppresses further retries.
     */
    async loadJSON(afterError) {

      // In the extension environment book data lives directly on the book object.
      if ( !this.store.standalone ) {
        this.splitData.bookSummary      = this.book.summary          ?? null;
        this.splitData.peopleAlsoBought = this.book.peopleAlsoBought ?? null;
        return;
      }

      const { asin, chunkId } = this.book;

      // No chunkId means this book had no split data.
      if ( chunkId == null ) return;

      const cacheID = this.store.audibledata.extras.cacheID;

      try {

        const database = await this.getBookDatabase();

        // Wipe stale chunks if the library was re-exported with a new cacheID.
        await this.validateBookDataCache(database, cacheID);

        // Try the local cache first...
        let chunkRecord = await this.getChunkFromDatabase(database, chunkId);

        if ( !chunkRecord ) {
          // Not cached — fetch from server and persist for subsequent opens.
          // Re-use any in-flight fetch for the same chunk to avoid duplicate requests.
          if ( !inflightChunkFetches[chunkId] ) {
            inflightChunkFetches[chunkId] = this.fetchBookDataChunk(chunkId, cacheID).then( async (books) => {
              await this.writeChunkToDatabase(database, chunkId, books);
              return books;
            })
            .finally(() => {
              delete inflightChunkFetches[chunkId];
            });
          }
          const books = await inflightChunkFetches[chunkId];
          chunkRecord = { chunkIndex: chunkId, books };
        }

        // Update book details...
        const bookData = this.findBookDataInChunk(chunkRecord.books, asin);
        if ( bookData ) {
          this.splitData.bookSummary = bookData.summary;
          this.splitData.peopleAlsoBought = bookData.peopleAlsoBought;
        }

      } catch ( err ) {

        console.warn(`[loadBookData] Failed to load data for asin ${asin}:`, err);
        
        if ( !afterError ) setTimeout(() => this.loadJSON('afterError'), 1000);

      }

    },

    // ==========
    //  HELPERS:
    // ==========

    /**
     * Returns the module-level db instance, opening the database first if needed.
     * Caching at module scope means repeated book-detail opens skip the handshake.
     * @returns {Promise<IDBDatabase>}
     */
    async getBookDatabase() {
      if ( !dbInstance ) dbInstance = await openDB();
      return dbInstance;
    },

    validateBookDataCache(database, currentCacheID) {
      return validateCache(database, currentCacheID);
    },

    /**
     * Retrieves a full chunk record from IndexedDB by its chunkIndex.
     * @param {IDBDatabase} database
     * @param {number} chunkIndex
     * @returns {Promise<Object|null>} The chunk record, or null if not yet cached.
     */
    getChunkFromDatabase(database, chunkIndex) {
      return new Promise((resolve, reject) => {

        const tx = database.transaction(db.stores.chunks, 'readonly');
        const store = tx.objectStore(db.stores.chunks);
        const request = store.get(chunkIndex);

        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror   = () => reject(request.error);

      });
    },

    /**
     * Persists a fetched chunk (array of book data objects) to IndexedDB.
     * @param {IDBDatabase} database
     * @param {number} chunkIndex
     * @param {Array}  books
     * @returns {Promise<void>}
     */
    writeChunkToDatabase(database, chunkIndex, books) {
      return new Promise((resolve, reject) => {

        const tx = database.transaction(db.stores.chunks, 'readwrite');
        const store = tx.objectStore(db.stores.chunks);
        const request = store.put({ chunkIndex, books });

        request.onsuccess = () => resolve();
        request.onerror   = () => reject(request.error);

      });
    },

    /**
     * Fetches a chunk JSON file from the server via Axios.
     * Axios throws automatically on non-2xx responses, so no status check needed.
     * @param {number} chunkIndex
     * @param {string} cacheID
     * @returns {Promise<Array>}
     */
    async fetchBookDataChunk(chunkIndex, cacheID) {
      const { data } = await axios.get(`data/split-book-data/chunk-${chunkIndex}.${cacheID}.json`);
      return data;
    },

    /**
     * Finds a single book's extra data within a chunk's books array by asin.
     * @param {Array}  books
     * @param {string} asin
     * @returns {Object|null}
     */
    findBookDataInChunk(books, asin) {
      return _.find(books, { asin }) ?? null;
    },

  },

};