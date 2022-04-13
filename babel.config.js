module.exports = {
  presets: [
    ['@vue/app', {
      useBuiltIns: "entry"
    }],
    // '@vue/cli-plugin-babel/preset',
    [
      '@babel/preset-env', {
        'useBuiltIns': 'usage',
        'corejs': 2
      }
    ]
  ],
  plugins: ['@babel/plugin-syntax-dynamic-import']
}
