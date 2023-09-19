// NOTE-1: For some reason making changes to this file in "dev mode", or 
// while running "yarn vite" will cause an error. Restart dev server.

// NOTE-2: I don't know why, but sometimes the service worker does not 
// work. Extraction probably works and while gallery page works, any
// feature that moves you to that page will not. The fix seems to be to  
// re-install the extension from the dist folder.

import { fileURLToPath, URL } from 'node:url';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json'; 
// import manifest from './manifest.json' assert { type: 'json' } // Node >=17
import { viteStaticCopy } from 'vite-plugin-static-copy';
import copy from 'rollup-plugin-copy';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';
import dynamicImport from 'vite-plugin-dynamic-import';
import loadVersion from 'vite-plugin-package-version';
import { viteSingleFile } from "vite-plugin-singlefile";
import { customFilePathsJSON, customSingleFileGallery } from "./custom-vite-plugins.js";
import { ViteEjsPlugin } from "vite-plugin-ejs";

const src = function( path, prefix ) {
  prefix = prefix || './src';
  path = path || '';
  return fileURLToPath(new URL( prefix+'/'+path, import.meta.url ));
};
const dist = function( path ) { return src(path, './dist'); };
const root = function( path ) { return src(path, './'); };

const gallerySingleFile = process.env.gallerySingleFile;
const wallpaperSingleFile = process.env.wallpaperSingleFile;
const buildSingleFile = gallerySingleFile || wallpaperSingleFile;

const copyFilesBefore = [
  // { src: src('assets/js'),    dest: 'assets' },
  { src: src('gallery/app.webmanifest'),    dest: dist() },
];
const copyFilesAfter = [
  { src: src('extension-js'), dest: 'assets' },
  { src: src('assets/js'),    dest: 'assets' },
  { src: src('gallery/app.webmanifest'),    dest: dist('') },
  { src: src('gallery/images'),    dest: dist('assets') },
  { src: src('gallery/favicons'),    dest: dist('') },
];

const inputs = {};
let manualChunks = null;

if ( gallerySingleFile ) {
  inputs['gallery'] = 'gallery.html';
}
else if ( wallpaperSingleFile ) {
  inputs['animated-wallpaper'] = 'animated-wallpaper.html';
}
else {
  inputs['gallery'] = 'gallery.html';
  inputs['content-script'] = 'audible-library-extractor-content-script.js';
  inputs['wallpaper-creator'] = 'wallpaper-creator.html';
  inputs['animated-wallpaper'] = 'animated-wallpaper.html';
  
  manualChunks = {
    jquery: ['jquery'],
    jszip: ['jszip', 'jszip-utils'],
    howler: ['howler'],
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  publicDir: src('public'),
  // Build options
  // root: 'src',
  build: {
    outDir: dist(''),
    // emptyOutDir: buildSingleFile,
    emptyOutDir: true,
    chunkSizeWarningLimit: 800, // KB
    rollupOptions: {
      input: inputs,
      output: {
        // dir: 'dist',
				entryFileNames: 'assets/[name].[hash].js',
				assetFileNames: 'assets/[name].[hash].[ext]',
				chunkFileNames: 'assets/[name].[hash].js',
        manualChunks: manualChunks,
      },
    },
    commonjsOptions: {
       esmExternals: true,
    }, 
    // sourcemap: 'inline',
  },
  optimizeDeps: {
    include: [
      'lodash',
      // 'jquery',
      'axios',
      'axios-retry',
      'date-fns',
      'dompurify',
      'async-es/map',
      'async-es/mapLimit',
      'async-es/waterfall',
      'domurl',
      'file-saver',
      'howler',
      '@splidejs/vue-splide', 
      'vue-slider-component', 
      '@vueform/multiselect',
      'fitty',
    ],
  },
  // Basically string replacements. You can think of as a global immutable variable.
  define: {
    "$version": JSON.stringify(process.env.npm_package_version),
  },
  plugins: [
    vue(),
    ( buildSingleFile ? viteSingleFile() : undefined ),
    Components({
      dirs: [
        'src',
      ],
      extensions: ['vue'],
      deep: true,
      resolvers: [
        IconsResolver({
          prefix: '',
        }),
      ],
    }), 
    Icons(),
    ( buildSingleFile ? undefined : crx({ manifest }) ),
    copy({
      targets: copyFilesBefore,
      hook: 'generateBundle',
      copyOnce: true,
    }),
    viteStaticCopy({
      targets: copyFilesAfter,
      hook: 'writeBundle',
    }),
    dynamicImport(),
    loadVersion(),
    ViteEjsPlugin({
      singleFileMode: buildSingleFile,
    }),
    customFilePathsJSON,
    customSingleFileGallery,
    buildSingleFile ? null : splitVendorChunkPlugin(),
  ],
  resolve: {
    alias: {
      '@'                 : src(''),
      '@root'             : src(''),
      '@dist'             : dist(''),
      '@fonts'            : src('fonts'),
      '@assets'           : src('assets'),
      '@gallery'          : src('gallery'),
      '@node'             : root('node_modules'),
      'node_modules'      : root('node_modules'),
      '@output-page'      : src('gallery'),
      '@output-images'    : src('gallery/images'),
      '@output-mixins'    : src('gallery/_mixins'),
      '@output-modules'   : src('gallery/_modules'),
      '@output-comps'     : src('gallery/_components'),
      '@output-pages'     : src('gallery/_components/alePages'),
      '@output-snippets'  : src('gallery/_components/snippets'),
      '@editor-mixins'    : src('wallpaper-creator/_mixins'),
      '@editor-comps'     : src('wallpaper-creator/_components'),
      '@editor-images'    : src('wallpaper-creator/images'),
      '@contscript'       : src('content-script'),
      '@contscript-comps' : src('content-script/_components'),
      '@contscript-mixins': src('content-script/_components/_mixins'),
      '@wallpaper-mixins' : src('wallpaper-creator/animated-wallpaper/_mixins'),
      '@wallpaper-comps'  : src('wallpaper-creator/animated-wallpaper/_components'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { 
         additionalData: `
          @use "@gallery/_variables.scss" as *;
        ` 
     }, 
    },
  },
});
