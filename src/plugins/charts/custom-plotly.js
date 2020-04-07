var Plotly = require('plotly.js/lib/core')

// Only register the chart types we're actually using to reduce the final bundle size
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
