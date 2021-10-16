const webpack = require('webpack');
const ejs = require('ejs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const { VueLoaderPlugin } = require('vue-loader');
const { version } = require('./package.json');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const FileManagerPlugin = require('filemanager-webpack-plugin-fixed');
const Chunks2JsonPlugin = require('chunks-2-json-webpack-plugin');
 
const _ = require('lodash');

const config = {
  mode: process.env.NODE_ENV,
  context: path.join(__dirname, '/src'),
  entry: {
    'background': './background.js',
    'content-script/audible-library-extractor-content-script': './content-script/content-script.js',
    'gallery/gallery': './gallery/gallery.js',
    'wallpaper-creator/wallpaper-creator': './wallpaper-creator/wallpaper-creator.js',
    'wallpaper-creator/animated-wallpaper/animated-wallpaper': './wallpaper-creator/animated-wallpaper/animated-wallpaper.js',
  },
  output: {
    publicPath: '',
    path: path.join(__dirname, '/dist'),
    filename: '[name].js',
    chunkFilename: 'chunks/[name].js',
  },
  watchOptions: {
    ignored: [
      // path.join(__dirname, '/dist'),
      path.join(__dirname, '/node_modules')
    ],
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      'node_modules': path.join(__dirname, '/node_modules'),
      '@': path.join(__dirname, '/src/gallery'),
      '@output-images': path.join(__dirname, '/src/gallery/images'),
      '@output-page': path.join(__dirname, '/src/gallery'),
      '@output-comps': path.join(__dirname, '/src/gallery/_components'),
      '@output-snippets': path.join(__dirname, '/src/gallery/_components/snippets'),
      '@output-mixins': path.join(__dirname, '/src/gallery/_mixins'),
      '@contscript-mixins': path.join(__dirname, '/src/content-script/_components/_mixins'),
      '@editor-comps': path.join(__dirname, '/src/wallpaper-creator/_components'),
      '@editor-mixins': path.join(__dirname, '/src/wallpaper-creator/_mixins'),
      '@wallpaper-comps': path.join(__dirname, '/src/wallpaper-creator/animated-wallpaper/_components'),
      '@wallpaper-mixins': path.join(__dirname, '/src/wallpaper-creator/animated-wallpaper/_mixins'),
      '@dist': path.join(__dirname, '/dist'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [{ loader: 'vue-loader' }]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.sass$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader?indentedSyntax'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '/images/',
          emitFile: false,
          esModule: false,
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '/fonts/',
          emitFile: false,
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      global: 'window',
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: 'chunks/[name].css',
    }),
    new Chunks2JsonPlugin({ 
      outputDir: './dist/',
      excludeFile: /^(?!chunks\/)/,
      publicPath: '',
      filename: 'chunk-file-paths.js',  
      objectToString: function( result ) {
        let chunks = _.map( result, function( o ) {
          let js = o.js;
          let css = o.css;
          return _.concat( js, css );
        });
        chunks = _.flatten(chunks);
        chunks = _.compact(chunks);
        return 'window.chunksFilePaths = ' + JSON.stringify(chunks.sort(), null, 2) + ';';
      },
    }),
  ],
  optimization: {
    chunkIds: 'named',
  },
};

var copyPluginArray = { patterns: [
  { from: 'assets', to: 'assets' },
  { from: 'gallery/favicons', to: 'gallery/favicons' },
  { from: 'gallery/extension-js', to: 'gallery/extension-js' },
  { from: 'gallery/app.webmanifest', to: 'gallery/manifest.json' },
  // { from: 'gallery/images/', to: 'gallery/images/' },
  { from: 'gallery/gallery.html', to: 'gallery/index.html', transform: transformHtml },
  { from: 'wallpaper-creator/wallpaper-creator.html', to: 'wallpaper-creator/index.html', transform: transformHtml },
  { from: 'wallpaper-creator/animated-wallpaper/animated-wallpaper.html', to: 'wallpaper-creator/animated-wallpaper/index.html', transform: transformHtml },
  { from: 'wallpaper-creator/textures', to: 'wallpaper-creator/textures' },
  {
    from: 'manifest.json',
    to: 'manifest.json',
    transform: (content) => {
      const jsonContent = JSON.parse(content);
      jsonContent.version = version;

      if (config.mode === 'development') {
        jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval' http://localhost:8098; object-src 'self'";
      }

      return JSON.stringify(jsonContent, null, 2);
    },
  },
]};

if (config.mode === 'production') {

  config.plugins.push(new BundleAnalyzerPlugin());

  config.plugins.push(
    new FileManagerPlugin({
      onEnd: {
        delete: [
          './dist/gallery/chunks',
          './dist/gallery/chunk-file-paths.js',
        ],
        move: [
          { source: './dist/chunks', destination: './dist/gallery/chunks' },
          { source: './dist/chunk-file-paths.js', destination: './dist/gallery/chunk-file-paths.js' },
        ],
      }
    })
  );

  config.plugins.push(new CleanWebpackPlugin());
  
}
else {
  copyPluginArray.patterns.push({ from: __dirname + '/dist/chunks', to: __dirname + '/dist/gallery/chunks', force: true });
}

config.plugins.push( new CopyPlugin(copyPluginArray) );

if (process.env.HMR === 'true') {
  config.plugins = (config.plugins || []).concat([
    new ExtensionReloader({
      manifest: __dirname + '/src/manifest.json',
    }),
  ]);
}

function transformHtml(content) {
  return ejs.render(content.toString(), {
    ...process.env,
  });
}

module.exports = config;
