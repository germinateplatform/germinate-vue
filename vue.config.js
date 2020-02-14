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
  presets: [
    ['@vue/app', {
      polyfills: [
        'es6.promise',
        'es6.string',
        'es6.array',
        'es6.set',
        'es6.object.assign',
        'es7.array'
      ]
    }
  ]
}
