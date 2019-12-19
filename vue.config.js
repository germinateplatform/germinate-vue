module.exports = {
  lintOnSave: true,
  runtimeCompiler: true,
  publicPath: '/',
  chainWebpack: config => {
    config.module
      .rule("Snap")
        .test(require.resolve("snapsvg/dist/snap.svg.js"))
        .use("imports-loader")
        .loader("imports-loader?this=>window,fix=>module.exports=0");

    config.resolve.alias.set("snapsvg", "snapsvg/dist/snap.svg.js");
  }
}
