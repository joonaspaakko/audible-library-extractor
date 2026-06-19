// UNZIP A SAVED GALLERY INTO THE TEST SERVER FOLDER
//
// Takes the ALE-gallery.zip produced by save-gallery.vue and extracts it into
// gh-pages-test/site, ready to be served by server.js exactly like GitHub Pages.
//
// Usage:
//   node gh-pages-test/unzip-gallery.js [path/to/ALE-gallery.zip]
//
// If no path is given, it grabs the newest ALE-gallery.zip from ~/Downloads.
//
// The core pieces are also exported so server.js can watch Downloads and unzip
// automatically when a new gallery zip is saved.

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

export const siteDir = path.join( __dirname, 'site' );
export const downloadsDir = path.join( os.homedir(), 'Downloads' );

// FIND THE ZIP

export function newestZipInDownloads() {

  if ( !fs.existsSync( downloadsDir ) ) return null;

  const zips = fs.readdirSync( downloadsDir )
    .filter( name => name.startsWith( 'ALE-gallery' ) && name.endsWith( '.zip' ) )
    .map( name => {
      const full = path.join( downloadsDir, name );
      return { full, mtime: fs.statSync( full ).mtimeMs };
    })
    .sort( ( a, b ) => b.mtime - a.mtime );

  return zips.length ? zips[ 0 ].full : null;
}

// EXTRACT
// Wipes the previous site so stale hashed assets don't linger, then writes every
// file from the zip into siteDir. Returns the number of files written.

export async function unzipGallery( zipPath ) {

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

  return count;
}

// CLI ENTRY
// Only runs when this file is executed directly, not when imported by server.js.

const runDirectly = process.argv[ 1 ] && path.resolve( process.argv[ 1 ] ) === fileURLToPath( import.meta.url );

if ( runDirectly ) {

  const zipPath = process.argv[ 2 ] ? path.resolve( process.argv[ 2 ] ) : newestZipInDownloads();

  if ( !zipPath || !fs.existsSync( zipPath ) ) {
    console.error( 'Could not find a zip. Pass a path: node gh-pages-test/unzip-gallery.js path/to/ALE-gallery.zip' );
    process.exit( 1 );
  }

  console.log( `Extracting ${ zipPath }` );

  const count = await unzipGallery( zipPath );

  console.log( `Wrote ${ count } files to ${ siteDir }` );
  console.log( '' );
  console.log( 'Now run:  node gh-pages-test/server.js' );

}
