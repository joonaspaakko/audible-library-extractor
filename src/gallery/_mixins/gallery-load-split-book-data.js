// Chunks are fetched once per cacheID and stored in IndexedDB. When the cacheID changes
// (new library export), all stored chunks are cleared and re-fetched, which is a
// deliberate compromise for simplicity and reliability.

import axios from 'axios';

// MODULE-LEVEL CONSTANTS:

// Database config:
const db = {
  name: 'ale_split_book_data',
  version: 1,
  stores: {
    meta: 'meta',
    chunks: 'chunks',
  },
};

// Intentionally outside the export so it survives component destroy/create cycles. 
// No point resetting on every close.
let dbInstance = null;

export default {

  methods: {

    /**
     * Main entry point, called on component `created`.
     * Loads split book data (summary + peopleAlsoBought) for the current book
     * from IndexedDB, fetching from the server and caching if not yet stored.
     * @param {string} [afterError] - Truthy on a retry; suppresses further retries.
     */
    async loadJSON(afterError) {

      // In the extension environment book data isn't split into chunks.
      if ( !this.store.standalone ) return;

      const { asin, chunkId } = this.book;
      const cacheID = this.store.library.extras.cacheID;

      try {

        const database = await this.getBookDatabase();

        // Wipe stale chunks if the library was re-exported with a new cacheID.
        await this.validateBookDataCache(database, cacheID);

        // Try the local cache first...
        let chunkRecord = await this.getChunkFromDatabase(database, chunkId);

        if ( !chunkRecord ) {
          // Not cached — fetch from server and persist for subsequent opens.
          const books = await this.fetchBookDataChunk(chunkId, cacheID);
          await this.writeChunkToDatabase(database, chunkId, books);
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
      if ( !dbInstance ) dbInstance = await this.openBookDatabase();
      return dbInstance;
    },

    /**
     * Opens (or creates) the IndexedDB database and its object stores.
     * @returns {Promise<IDBDatabase>}
     */
    openBookDatabase() {
      return new Promise((resolve, reject) => {

        const request = indexedDB.open(db.name, db.version);

        request.onupgradeneeded = (event) => {
          const idb = event.target.result;
          // 'meta' holds housekeeping data — currently just the last known cacheID.
          if ( !idb.objectStoreNames.contains(db.stores.meta) ) {
            idb.createObjectStore(db.stores.meta, { keyPath: 'key' });
          }
          // 'chunks' stores fetched chunk arrays, keyed by chunkIndex.
          if ( !idb.objectStoreNames.contains(db.stores.chunks) ) {
            idb.createObjectStore(db.stores.chunks, { keyPath: 'chunkIndex' });
          }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror   = (event) => reject(event.target.error);

      });
    },

    /**
     * Validates the stored cacheID against the current one.
     * If they differ, wipes all cached chunks and records the new ID — atomically,
     * so stale data is never served even if something fails mid-transaction.
     * @param {IDBDatabase} database
     * @param {string} currentCacheID
     * @returns {Promise<void>}
     */
    validateBookDataCache(database, currentCacheID) {
      return new Promise((resolve, reject) => {

        // Both stores in one transaction so the clear + meta write are atomic.
        const tx = database.transaction([db.stores.meta, db.stores.chunks], 'readwrite');
        const metaStore = tx.objectStore(db.stores.meta);
        const chunkStore = tx.objectStore(db.stores.chunks);

        const getRequest = metaStore.get('cacheID');

        getRequest.onsuccess = () => {
          const storedCacheID = getRequest.result?.value ?? null;

          if ( storedCacheID !== currentCacheID ) {
            // cacheID changed — nuke all stored chunks and record the new one.
            chunkStore.clear();
            metaStore.put({ key: 'cacheID', value: currentCacheID });
          }

          tx.oncomplete = () => resolve();
          tx.onerror    = () => reject(tx.error);
        };

        getRequest.onerror = () => reject(getRequest.error);

      });
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