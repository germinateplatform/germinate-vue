module.exports = {
  presets: [
    ['@vue/app', {
      useBuiltIns: "entry",
      polyfills: [
        'es6.promise',
        'es6.string',
        'es6.array',
        'es6.set',
        'es6.object.assign',
        'es7.array'
      ]
    }]
  ]
}
