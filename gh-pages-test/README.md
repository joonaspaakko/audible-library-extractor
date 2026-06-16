# Local GitHub Pages emulator

Test a locally saved gallery (the `ALE-gallery.zip` from the gallery's
"Save / Export" panel) the same way GitHub Pages would serve it, including the
caching behavior that affects the service worker.

## Why not just `http-server`?

GitHub Pages does a few specific things a generic static server doesn't:

- Sends `Cache-Control: max-age=600` on **every** file (10 min), with **no**
  `immutable`, even on Vite's hashed assets.
- Sends a strong `ETag` and answers `If-None-Match` with `304 Not Modified`.
- Serves from a repo subpath like `/my-audible-library/`.
- Service workers only run on `https://` or `http://localhost`, so the gallery's
  Workbox service worker (NetworkFirst HTML, StaleWhileRevalidate JS/CSS,
  CacheFirst images) only registers on a `localhost` origin.

`server.js` reproduces all of that.

## Usage

1. In the gallery, open the export panel ([save-gallery.vue](../src/gallery/_components/snippets/save-gallery.vue))
   and click **Export ZIP**. This downloads `ALE-gallery.zip` to `~/Downloads`.

2. Unzip and serve in one step (grabs the newest `ALE-gallery*.zip` from
   `~/Downloads`, extracts it, then serves):

   ```sh
   yarn ghpages
   ```

   Open http://localhost:8000/my-audible-library/

### Or run the two halves separately

```sh
yarn ghpages:unzip
# or: node gh-pages-test/unzip-gallery.js path/to/ALE-gallery.zip

yarn ghpages:serve
# or: node gh-pages-test/server.js
```

## Options

```sh
node gh-pages-test/server.js \
  --dir gh-pages-test/site \      # folder to serve
  --base /my-audible-library/ \   # repo subpath
  --port 8000
```

These flags also pass through the combined script, since they go to the server
(the last command in the chain):

```sh
yarn ghpages --port 8124
```

To serve the `dist` build directly instead of an exported zip:

```sh
node gh-pages-test/server.js --dir dist
```

## Testing caching / the service worker

- First load populates the Workbox caches. In DevTools, Application → Service
  Workers and Cache Storage show `pages`, `assets`, `images`.
- Re-export with new data, re-unzip, hard-reload: NetworkFirst HTML picks up the
  change immediately; StaleWhileRevalidate assets update on the second load.
- The `max-age=600` + ETag combo lets you watch real `200` vs `304` revalidation
  in the Network tab, matching production.

### Stale service worker between exports

On a real deploy each export lives at its own origin
(`joonaspaakko.github.io/<repo>/`), so a service worker from a previous export
never bleeds into a new one. Locally every export reuses the same
`http://localhost:8000` origin, so a service worker from an earlier run CAN keep
serving the old files. Symptom: the page loads something with no console errors,
but not the build you just extracted.

To start clean, like a brand new deploy, use `--fresh`. On the first navigation
it sends `Clear-Site-Data`, which unregisters the old service worker and wipes
its caches, then reverts to normal GitHub Pages caching so the new service
worker installs and can be tested for real:

```sh
yarn ghpages:fresh
# or: node gh-pages-test/server.js --fresh
```

`--fresh` is opt-in. A plain `yarn ghpages` stays fully faithful to GitHub Pages
caching, including a persistent service worker. You can also clear manually in
DevTools → Application → Clear site data, or just use an incognito window.

## Notes

- `site/` is regenerated on each unzip (wiped first, so stale hashed assets don't
  linger). It is git-ignored.
