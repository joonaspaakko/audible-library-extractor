// LOCAL GITHUB PAGES EMULATOR
//
// Serves a folder the same way GitHub Pages does so you can test a locally
// saved gallery (the unzipped ALE-gallery.zip) with realistic caching.
//
// What it mimics:
//   - Cache-Control: max-age=600 on every file (GitHub Pages default, NO immutable)
//   - Strong ETag + 304 conditional responses (If-None-Match)
//   - Serving from a repo subpath, like /my-audible-library/
//   - .nojekyll is irrelevant locally but is served like any other file
//   - 404.html fallback if present, otherwise a plain 404
//
// Why https: service workers only register on https:// or http://localhost.
// This server runs on http://localhost so the Workbox service worker in the
// gallery registers and you can test its NetworkFirst / StaleWhileRevalidate /
// CacheFirst behavior for real.
//
// Usage:
//   node gh-pages-test/server.js [--dir <folder>] [--base /my-audible-library/] [--port 8000]
//
// Defaults: serves ./gh-pages-test/site at http://localhost:8000/my-audible-library/

import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

// ARGS

function getArg( name, fallback ) {
  const index = process.argv.indexOf( name );
  if ( index !== -1 && process.argv[ index + 1 ] ) return process.argv[ index + 1 ];
  return fallback;
}

function hasFlag( name ) {
  return process.argv.includes( name );
}

const rootDir = path.resolve( getArg( '--dir', path.join( __dirname, 'site' ) ) );
const port = parseInt( getArg( '--port', '8000' ), 10 );

// On a real GitHub Pages deploy, each export lives at its own origin
// (joonaspaakko.github.io/<repo>/), so a service worker and caches from a
// previous export never bleed into a new one. Locally every export reuses the
// same localhost origin, so a stale service worker CAN serve old files.
//
// --fresh restores that real-deploy isolation: on the first navigation it sends
// Clear-Site-Data, wiping the previous export's service worker and caches. It is
// OFF by default so a normal run stays faithful to GitHub Pages caching.
const fresh = hasFlag( '--fresh' );
let freshCleared = false;

// Normalize the base path so it always looks like "/my-audible-library/"
let base = getArg( '--base', '/my-audible-library/' );
if ( !base.startsWith( '/' ) ) base = '/' + base;
if ( !base.endsWith( '/' ) ) base = base + '/';

// MIME TYPES

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.url':  'text/plain; charset=utf-8',
};

function mimeFor( filePath ) {
  return mimeTypes[ path.extname( filePath ).toLowerCase() ] || 'application/octet-stream';
}

// ETAG
// GitHub Pages sends a strong ETag and supports If-None-Match revalidation.
// We hash the file contents so the ETag changes only when the file changes,
// which is exactly the signal the service worker's revalidation relies on.

function etagFor( buffer ) {
  return '"' + crypto.createHash( 'sha1' ).update( buffer ).digest( 'hex' ) + '"';
}

// RESOLVE REQUEST PATH TO A FILE ON DISK

async function resolveFile( urlPath ) {

  // Strip the base prefix so /my-audible-library/data/x.js maps to <root>/data/x.js
  let relative = urlPath;
  if ( relative.startsWith( base ) ) {
    relative = relative.slice( base.length );
  }
  else if ( relative === base.slice( 0, -1 ) ) {
    relative = '';
  }

  relative = decodeURIComponent( relative.replace( /^\/+/, '' ) );

  // Prevent path traversal outside the served root
  const resolved = path.resolve( rootDir, relative );
  if ( resolved !== rootDir && !resolved.startsWith( rootDir + path.sep ) ) {
    return null;
  }

  let target = resolved;

  try {
    const stat = await fsp.stat( target );
    if ( stat.isDirectory() ) {
      target = path.join( target, 'index.html' );
      await fsp.stat( target );
    }
    return target;
  }
  catch {
    return null;
  }
}

// SERVER

const server = http.createServer( async ( req, res ) => {

  const url = new URL( req.url, 'http://localhost' );

  // Redirect bare "/" or "/my-audible-library" to the base path with trailing slash
  if ( url.pathname === '/' || url.pathname === base.slice( 0, -1 ) ) {
    res.writeHead( 302, { Location: base } );
    res.end();
    return;
  }

  // Requests outside the base path get a hint (GitHub Pages would 404 these too)
  if ( !url.pathname.startsWith( base ) ) {
    res.writeHead( 404, { 'Content-Type': 'text/html; charset=utf-8' } );
    res.end( `<h1>404</h1><p>Your gallery is served under <a href="${ base }">${ base }</a></p>` );
    return;
  }

  let filePath = await resolveFile( url.pathname );

  // 404 fallback
  if ( !filePath ) {
    const custom404 = path.join( rootDir, '404.html' );
    if ( fs.existsSync( custom404 ) ) {
      const body = await fsp.readFile( custom404 );
      res.writeHead( 404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'max-age=600' } );
      res.end( body );
    }
    else {
      res.writeHead( 404, { 'Content-Type': 'text/html; charset=utf-8' } );
      res.end( '<h1>404 Not Found</h1>' );
    }
    return;
  }

  const body = await fsp.readFile( filePath );
  const etag = etagFor( body );

  const isHtml = mimeFor( filePath ).startsWith( 'text/html' );
  const isNavigation = isHtml && req.headers[ 'sec-fetch-mode' ] === 'navigate';

  // --fresh: on the first page navigation, wipe the previous export's service
  // worker and caches so this origin behaves like a brand new GitHub Pages
  // deploy. After that one response, serving reverts to normal so the new
  // service worker installs and its caching can be tested for real.
  if ( fresh && isNavigation && !freshCleared ) {
    freshCleared = true;
    res.writeHead( 200, {
      'Content-Type': mimeFor( filePath ),
      'Content-Length': body.length,
      'Clear-Site-Data': '"cache", "storage"',
      'Cache-Control': 'no-store',
    } );
    res.end( body );
    return;
  }

  // Conditional request: serve 304 like GitHub Pages does
  if ( req.headers[ 'if-none-match' ] === etag ) {
    res.writeHead( 304, {
      'ETag': etag,
      'Cache-Control': 'max-age=600',
    } );
    res.end();
    return;
  }

  res.writeHead( 200, {
    'Content-Type': mimeFor( filePath ),
    'Content-Length': body.length,
    // GitHub Pages caches EVERYTHING for 10 minutes, no immutable, even hashed assets
    'Cache-Control': 'max-age=600',
    'ETag': etag,
  } );
  res.end( body );

} );

server.listen( port, () => {
  console.log( '' );
  console.log( '  GitHub Pages emulator running' );
  console.log( '  --------------------------------' );
  console.log( `  Serving:  ${ rootDir }` );
  console.log( `  URL:      http://localhost:${ port }${ base }` );
  console.log( `  Headers:  Cache-Control: max-age=600, strong ETag, 304 on revalidate` );
  if ( fresh ) {
    console.log( `  Fresh:    first navigation sends Clear-Site-Data (wipes old SW + caches)` );
  }
  console.log( '' );
  console.log( '  Service worker will register (localhost is a secure context).' );
  console.log( '  Press Ctrl+C to stop.' );
  console.log( '' );
} );
