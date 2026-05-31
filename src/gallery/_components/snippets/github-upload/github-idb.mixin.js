export default {
  data() {
    return {
      idb: null,
    };
  },

  methods: {
    /**
     * Opens (or returns the cached handle to) the IndexedDB database.
     * We reuse the same connection for the whole session; opening a new one per call
     * is wasteful and can cause contention on some browsers.
     * @returns {Promise<IDBDatabase>}
     */
    idbOpen() {
    
      // If we already have a connection, return it
      if ( this.idb ) return Promise.resolve( this.idb );
      
      // Otherwise, open a new connection and cache it for next time
      return new Promise( ( resolve, reject ) => {
        
        const req = indexedDB.open( 'ale-github-blob-cache', 1 );
        
        req.onupgradeneeded = e => e.target.result.createObjectStore( 'blobs' );
        
        req.onsuccess = e => {
          this.idb = e.target.result;
          resolve( this.idb );
        };
        
        req.onerror = () => reject( req.error );
        
      });
      
    },

    /**
     * Loads all cached blob SHAs for a given repo into a `{ contentHash → sha }` map.
     * All entries are stored as `owner/repo/contentHash`, so we can range-scan just
     * the current repo without loading the entire store.
     * @param {string} owner
     * @param {string} repo
     * @returns {Promise<Object>}
     */
    async idbCacheLoad( owner, repo ) {
      try {
      
        const db = await this.idbOpen();
        return await new Promise( ( resolve, reject ) => {
        
          const prefix = `${owner}/${repo}/`;
          // IDB keys are sorted, so bound(prefix, prefix + '\uffff') matches everything starting with the prefix
          const range  = IDBKeyRange.bound( prefix, prefix + '\uffff' );
          const result = {};
          
          const req = db.transaction( 'blobs', 'readonly' ).objectStore( 'blobs' ).openCursor( range );
          req.onsuccess = e => {
            const cursor = e.target.result;
            if ( cursor ) {
              result[ cursor.key.slice( prefix.length ) ] = cursor.value;
              cursor.continue();
            }
            else {
              resolve( result );
            }
          };
          
          req.onerror = () => reject( req.error );
          
        });
        
      }
      catch {
        return {};
      }
    },

    /**
     * Persists a single blob SHA to the cache.
     * Called right after each successful upload so the next run can skip unchanged files.
     * @param {string} owner
     * @param {string} repo
     * @param {string} hash Content hash key
     * @param {string} sha GitHub blob SHA value
     */
    async idbCacheSave( owner, repo, hash, sha ) {
      try {
      
        const db = await this.idbOpen();
        await new Promise( ( resolve, reject ) => {
        
          const tx = db.transaction( 'blobs', 'readwrite' );
          
          tx.objectStore( 'blobs' ).put( sha, `${owner}/${repo}/${hash}` );
          tx.oncomplete = resolve;
          tx.onerror    = () => reject( tx.error );
          
        });
        
      }
      catch ( err ) {
        console.warn( 'IDB cache write failed:', err );
      }
    },

    /**
     * Validates the cache against the repo's creation date.
     * If the repo was deleted and recreated, its `created_at` changes, so old blob SHAs no longer
     * exist on GitHub even if file content is identical, so we wipe the cache and record
     * the new identity. If this is the first upload there's nothing to wipe.
     * @param {string} owner
     * @param {string} repo
     * @param {string} repoCreatedAt ISO date string from the GitHub API
     */
    async idbValidateRepoCache( owner, repo, repoCreatedAt ) {
      try {
      
        const db      = await this.idbOpen();
        const metaKey = `${owner}/${repo}/__meta`;

        // Read the creation date we recorded on the last upload
        const stored = await new Promise( ( resolve, reject ) => {
          const req = db.transaction( 'blobs', 'readonly' ).objectStore( 'blobs' ).get( metaKey );
          req.onsuccess = () => resolve( req.result );
          req.onerror   = () => reject( req.error );
        });

        // Cache is still valid, nothing to do
        if ( stored?.createdAt === repoCreatedAt ) return;

        // Creation date mismatch, so wipe all cached SHAs for this repo and record the new date
        await new Promise( ( resolve, reject ) => {
          const tx    = db.transaction( 'blobs', 'readwrite' );
          const store = tx.objectStore( 'blobs' );
          const prefix = `${owner}/${repo}/`;
          store.delete( IDBKeyRange.bound( prefix, prefix + '\uffff' ) );
          store.put( { createdAt: repoCreatedAt }, metaKey );
          tx.oncomplete = resolve;
          tx.onerror    = () => reject( tx.error );
        });

        if ( stored?.createdAt != null ) console.info( `Blob cache cleared for ${owner}/${repo} (repo was recreated)` );
        
      }
      catch ( err ) {
        console.warn( 'IDB cache validation failed:', err );
      }
    },

    /**
     * Clears the blob cache. Pass `owner` + `repo` to wipe a single repo,
     * or call with no arguments to wipe everything.
     * @param {string} [owner]
     * @param {string} [repo]
     */
    async clearBlobCache( owner, repo ) {
      try {
      
        const db = await this.idbOpen();
        await new Promise( ( resolve, reject ) => {
        
          const tx    = db.transaction( 'blobs', 'readwrite' );
          const store = tx.objectStore( 'blobs' );
          
          if ( owner && repo ) {
            const prefix = `${owner}/${repo}/`;
            store.delete( IDBKeyRange.bound( prefix, prefix + '\uffff' ) );
          }
          else {
            store.clear();
          }
          
          tx.oncomplete = resolve;
          tx.onerror    = () => reject( tx.error );
          
        });
        
      }
      catch ( err ) {
        console.warn( 'IDB cache clear failed:', err );
      }
    },
  },
};
