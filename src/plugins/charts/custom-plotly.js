var Plotly = require('plotly.js/lib/core')

Plotly.register([
  require('plotly.js/lib/bar'),
  require('plotly.js/lib/box'),
  require('plotly.js/lib/choropleth'),
  require('plotly.js/lib/histogram'),
  require('plotly.js/lib/pie'),
  require('plotly.js/lib/splom'),
  require('plotly.js/lib/scattergl')
])

module.exports = Plotly
