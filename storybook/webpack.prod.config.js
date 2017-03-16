/**
 *   Copyright 2017 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

const path = require('path');
const webpack = require('webpack');
const validate = require('webpack-validator');

module.exports = validate({
  entry: path.join(__dirname, '..', 'src', 'index'),

  externals: {
    react: 'react',
    pdfjs: 'pdfjs-dist'
  },

  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: 'index.js',
    libraryTarget: 'umd'
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': '"production"'
      }
    }),

    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    }),

    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin()
  ],

  eslint: {
    configFile: path.join(__dirname, './eslint.config.js'),
    useEslintrc: false
  },

  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        include: /src/,
        loader: 'eslint'
      }
    ],
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      include: /src/,
      loader: 'babel'
    }]
  },

  resolve: {
    alias: {
      src: path.join(__dirname, '..', 'src'),
      components: path.join(__dirname, '..', 'src', 'components')
    }
  }
});
