const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    background: './src/background.js',
    options: './src/options.js',
    popup: './src/popup.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {alias: {vue: 'vue/dist/vue.esm.js'}},
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {from: './src/manifest.json', to: './'},
        {from: './src/images/', to: './images/'},
      ]
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      chunks: ['background'],
      // filename: 'background.html'
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      chunks: ['options'],
      template: './src/options.html',
      filename: 'options.html',
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      chunks: ['popup'],
      template: './src/popup.html',
      filename: 'popup.html',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};