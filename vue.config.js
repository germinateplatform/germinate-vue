const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  devServer: {
    port: 4000,
    client: {
      overlay: {
        // The browser warning 'ResizeObserver loop completed with undelivered notifications' is harmless (elements resized
        // while observed, e.g. the map and the edit fields of the passport page): not shown as an error. Only for npm run serve.
        runtimeErrors: error => !(error && error.message && error.message.includes('ResizeObserver loop'))
      }
    },
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
