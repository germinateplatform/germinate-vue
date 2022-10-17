// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: false,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  configureWebpack: {
    plugins: [
      new NodePolyfillPlugin()
    ],
    // plugins: [
    //   new BundleAnalyzerPlugin()
    // ],
    resolve: {
      // ... rest of the resolve config
      fallback: {
        path: require.resolve('path-browserify'),
        querystring: require.resolve('querystring-es3')
      }
    }
  }
})
