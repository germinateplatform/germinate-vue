// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack')

module.exports = {
  lintOnSave: true,
  runtimeCompiler: true,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  configureWebpack: {
    plugins: [
      // new BundleAnalyzerPlugin(),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      })
    ],
    resolve: {
      // ... rest of the resolve config
      fallback: {
        'path': require.resolve('path-browserify')
      }
    },
    devtool: 'source-map',
    target: 'web'
  }
}
