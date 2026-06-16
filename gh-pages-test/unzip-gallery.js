// UNZIP A SAVED GALLERY INTO THE TEST SERVER FOLDER
//
// Takes the ALE-gallery.zip produced by save-gallery.vue and extracts it into
// gh-pages-test/site, ready to be served by server.js exactly like GitHub Pages.
//
// Usage:
//   node gh-pages-test/unzip-gallery.js [path/to/ALE-gallery.zip]
//
// If no path is given, it grabs the newest ALE-gallery.zip from ~/Downloads.

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const siteDir = path.join( __dirname, 'site' );

// FIND THE ZIP

function newestZipInDownloads() {

  const downloads = path.join( os.homedir(), 'Downloads' );
  if ( !fs.existsSync( downloads ) ) return null;

  const zips = fs.readdirSync( downloads )
    .filter( name => name.startsWith( 'ALE-gallery' ) && name.endsWith( '.zip' ) )
    .map( name => {
      const full = path.join( downloads, name );
      return { full, mtime: fs.statSync( full ).mtimeMs };
    })
    .sort( ( a, b ) => b.mtime - a.mtime );

  return zips.length ? zips[ 0 ].full : null;
}

const zipPath = process.argv[ 2 ]
  ? path.resolve( process.argv[ 2 ] )
  : newestZipInDownloads();

if ( !zipPath || !fs.existsSync( zipPath ) ) {
  console.error( 'Could not find a zip. Pass a path: node gh-pages-test/unzip-gallery.js path/to/ALE-gallery.zip' );
  process.exit( 1 );
}

// EXTRACT

console.log( `Extracting ${ zipPath }` );

// Wipe the previous site so stale hashed assets don't linger
await fsp.rm( siteDir, { recursive: true, force: true } );
await fsp.mkdir( siteDir, { recursive: true } );

const buffer = await fsp.readFile( zipPath );
const entries = unzipSync( new Uint8Array( buffer ) );

let count = 0;

for ( const [ relativePath, contents ] of Object.entries( entries ) ) {

  // Directory entries have empty contents and a trailing slash
  if ( relativePath.endsWith( '/' ) ) continue;

  const outPath = path.join( siteDir, relativePath );
  await fsp.mkdir( path.dirname( outPath ), { recursive: true } );
  await fsp.writeFile( outPath, contents );
  count++;
}

console.log( `Wrote ${ count } files to ${ siteDir }` );
console.log( '' );
console.log( 'Now run:  node gh-pages-test/server.js' );
