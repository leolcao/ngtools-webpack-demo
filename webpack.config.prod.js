var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ngToolsWebpack = require('@ngtools/webpack');

var { common, buildDefines } = require('./webpack.common.js');

// ensure production environment
process.env.NODE_ENV = 'production';

var config = {

  // Source maps are completely regenerated for each chunk at each build
  devtool: 'source-map',

  // No need to set `context`, base directory for resolving entry points:
  // entry point paths are relative to current directory

  // Client application only, no dev server
  entry: {

    'vendor': common.relPaths.vendorEntryAot,

    'main': common.relPaths.mainEntryAot,

  },

  output: {

    path: common.absPaths.buildOutput,
    filename: common.relPaths.bundleJs,
    chunkFilename: common.relPaths.chunk,

    publicPath: common.urls.public,

  },

  module: {

    rules: [

      // Pre-loaders
      // none

      // Loaders
      common.rules.typescript.aot,
      common.rules.sass.global,
      common.rules.sass.component,
      common.rules.css.global,
      common.rules.css.component,
      common.rules.html,

      // Post-loaders
      // none

    ],

    // speed up build by excluding some big libraries from parsing
    noParse: common.noParse,

  },

  resolve: {

    extensions: common.resolve.extensions,

  },

  plugins: [

    new webpack.DefinePlugin(buildDefines()),

    // TODO exclude this plugin until this is fixed:
    // https://github.com/angular/angular-cli/issues/4431
    // https://github.com/angular/angular-cli/issues/6518
    /*
    // Provides context to Angular's use of System.import
    new webpack.ContextReplacementPlugin(
      common.patterns.angularContext,
      common.absPaths.clientSrc,
      {}
    ),
    */

    new webpack.optimize.CommonsChunkPlugin({
      name: ['main', 'vendor'],
      filename: common.relPaths.bundleJs,
      minChunks: mod => common.patterns.nodeModules.test(mod.resource),
    }),

    new ExtractTextPlugin(common.relPaths.bundleCss),

    // use @ngtools for AoT build
    new ngToolsWebpack.AotPlugin({
      tsConfigPath: './tsconfig-aot.json',
      skipMetadataEmit: true,
      entryModule: 'src/app/module#AppModule',  // drop extension and trailing `./`
    }),

    // Minimize scripts
    new webpack.optimize.UglifyJsPlugin(),

    // Only emit files when there are no errors
    new webpack.NoEmitOnErrorsPlugin(),

    // Copy static assets from their folder to common output folder
    new CopyWebpackPlugin([{
      from: common.absPaths.staticFiles,
    }]),

  ],

};

module.exports = config;
