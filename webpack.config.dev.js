const path = require('path');
const webpackBaseConfig = require('./webpack.config.base')

let webpackDevConfig = {
  mode: 'development',
  devServer: {
    contentBase: path.join(__dirname, 'dev'),
    compress: false,
    port: 9000,
    writeToDisk: true,
  }
}

module.exports = Object.assign({}, webpackBaseConfig, webpackDevConfig)