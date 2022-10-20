import fs from 'fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';
import { chromeExtension } from "vite-plugin-chrome-extension";

const src = function( path, prefix ) {
  prefix = prefix || './src';
  path = path || '';
  return fileURLToPath(new URL( prefix+'/'+path, import.meta.url ));
};
const dist = function( path ) { return src(path, './dist'); };
const root = function( path ) { return src(path, './'); };

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  publicDir: src('public'),
  // Build options
  // root: 'src',
  build: {
    outDir: dist(''),
    chunkSizeWarningLimit: 800, // KB
    rollupOptions: {
      input: {
        'content-script': src('content-script/audible-library-extractor-content-script.js'),
        'gallery': './gallery.html',
        // 'wallpaper-creator': fileURLToPath(new URL('./resources/auth/index.html', import.meta.url)),
      },
      output: {
        // dir: 'dist',
				entryFileNames: 'assets/[name].[hash].js',
				assetFileNames: 'assets/[name].[hash].[ext]',
				chunkFileNames: 'assets/[name].[hash].js',
				manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    include: [
      'lodash',
      'jquery',
      'axios',
      'axios-retry',
      'date-fns',
      'dompurify',
      'async-es/map',
      'async-es/mapLimit',
      'async-es/waterfall',
      'domurl',
    ],
  },
  // Basically string replacements. You can think of as a global immutable variable.
  define: {
    "$version": JSON.stringify(process.env.npm_package_version),
  },
  plugins: [
    vue(),
    Components({
      dirs: [
        'src',
      ],
      resolvers: [
        IconsResolver({
          prefix: '',
        }),
      ],
    }), 
    Icons(),
    crx({
      manifest
    }),
    // chromeExtension(),
    viteStaticCopy({
      targets: [
        { src: src('extension-js'), dest: dist('assets') },
        { src: src('assets/js'), dest: dist('assets') },
        // { src: 'background.js', dest: dist('') },
        // { src: 'assets', dest: dist('') },
      ]
    }),
    {
      name: 'file-paths.json',
      generateBundle(opts, bundle, isWrite) {
        
        const files = [];
        
        for (const [key, o] of Object.entries(bundle)) {
          files.push({
            type: o.type,
            src:  o.name,
            dist: o.fileName,
          });
        }

        fs.writeFileSync(dist('file-paths.json'), JSON.stringify(files, null, 2));
        
      }
    },
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
      '@contscript'       : src('content-script'),
      '@contscript-comps' : src('content-script/_components'),
      '@contscript-mixins': src('content-script/_components/_mixins'),
      '@wallpaper-mixins' : src('wallpaper-creator/animated-wallpaper/_mixins'),
      '@wallpaper-comps'  : src('wallpaper-creator/animated-wal lpaper/_components'),
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
