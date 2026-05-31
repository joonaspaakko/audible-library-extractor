import { formatDistanceToNow, isToday, isYesterday, parseISO, format } from 'date-fns';

export default {
  methods: {
    /**
     * Returns a promise that resolves after the given number of milliseconds.
     * Used for retry delays and staggered worker wakeups after rate limits.
     * @param {number} ms
     * @returns {Promise<void>}
     */
    sleep( ms ) { return new Promise( resolve => setTimeout( resolve, ms ) ); },

    /**
     * Safely parses a JSON string, returning null if parsing fails.
     * @param {string} str
     * @returns {Object|null}
     */
    safeParseJSON( str ) {
      try {
        return JSON.parse( str );
      } catch {
        return null;
      }
    },

    /**
     * Formats an ISO date string as a relative label (e.g. "3 days ago").
     * @param {string|null} iso
     * @returns {string}
     */
    formatDate( iso ) {
      if ( !iso ) return '';
      const date = parseISO( iso );
      if ( isToday( date ) ) return 'Today';
      if ( isYesterday( date ) ) return 'Yesterday';
      return formatDistanceToNow( date, { addSuffix: true } );
    },

    /**
     * Formats an ISO date string as a full date-time string.
     * Used in tooltips where the relative label would be ambiguous.
     * @param {string|null} iso
     * @returns {string}
     */
    formatDateTime( iso ) {
      if ( !iso ) return '';
      return format( parseISO( iso ), 'MMM d, yyyy, HH:mm' );
    },

    /**
     * Formats a size in KB as a human-readable string.
     * @param {number|null} kb
     * @returns {string}
     */
    formatSize( kb ) {
      if ( kb == null ) return '';
      if ( kb < 1024 ) return `${kb} KB`;
      return `${( kb / 1024 ).toFixed( 1 )} MB`;
    },

    /**
     * Strips characters that are invalid in a GitHub repo name.
     * GitHub allows letters, numbers, hyphens, and underscores (max 100 characters).
     * @param {string} value
     * @returns {string}
     */
    sanitizeRepoName( value ) {
      return value
        .replace( / /g, '-' )
        .replace( /[^a-zA-Z0-9_-]/g, '' )
        .slice( 0, 100 );
    },

    /**
     * Computes the Git blob SHA-1 for raw bytes.
     * This is the same hash GitHub uses internally. If our hash matches a cached entry,
     * the file is already on GitHub and can be skipped without uploading.
     * Git prepends a `blob <size>\0` header before hashing, which we replicate here.
     * @param {Uint8Array} contentBytes
     * @returns {Promise<string>}
     */
    async gitBlobShaBytes( contentBytes ) {
      
      const headerBytes = new TextEncoder().encode( `blob ${contentBytes.length}\0` );
      const full = new Uint8Array( headerBytes.length + contentBytes.length );
      
      full.set( headerBytes, 0 );
      full.set( contentBytes, headerBytes.length );
      
      const hashBuffer = await crypto.subtle.digest( 'SHA-1', full );
      return Array.from( new Uint8Array( hashBuffer ) ).map( b => b.toString( 16 ).padStart( 2, '0' ) ).join( '' );
      
    },

    /**
     * Computes the Git blob SHA-1 for a plain string.
     * Convenience wrapper around gitBlobShaBytes for text content.
     * @param {string} content
     * @returns {Promise<string>}
     */
    gitBlobSha( content ) {
      return this.gitBlobShaBytes( new TextEncoder().encode( content || '' ) );
    },
  },
};
