const path = require('path');
const webpackBaseConfig = require('./webpack.config.base')

let webpackProdConfig = {
  mode: 'production'
}

module.exports = Object.assign({}, webpackBaseConfig, webpackProdConfig)