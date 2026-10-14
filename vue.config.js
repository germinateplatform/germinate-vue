const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  devServer: {
    port: 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:9080/germinate',
        changeOrigin: true
      }
    }
  },

  transpileDependencies: false,

  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',

  configureWebpack: {
    plugins: [
      new NodePolyfillPlugin()
    ],

    resolve: {
      fallback: {
        path: require.resolve('path-browserify'),
        querystring: require.resolve('querystring-es3')
      }
    },

    devtool: 'source-map',
    target: 'web'
  }
})
