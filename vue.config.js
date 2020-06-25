// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack')

module.exports = {
  lintOnSave: true,
  runtimeCompiler: true,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  chainWebpack: config => {
    config.module
      .rule("Snap")
        .test(require.resolve("snapsvg/dist/snap.svg.js"))
        .use("imports-loader")
        .loader("imports-loader?this=>window,fix=>module.exports=0");

    config.resolve.alias.set("snapsvg", "snapsvg/dist/snap.svg.js");
  },
  configureWebpack: {
    plugins: [
      // new BundleAnalyzerPlugin(),
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/)
    ]
  }
}
