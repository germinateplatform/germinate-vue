export function plotlySunburstChart (Plotly) {
  let height = 800
  let onLeafClicked = null
  let darkMode = false
  let colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

  function chart (selection) {
    selection.each(function (rows) {
      const data = [{
        labels: rows.labels,
        parents: rows.parents,
        values: rows.values,
        type: 'sunburst',
        marker: { line: { width: 1 } },
        branchvalues: 'total',
        textinfo: 'label+value'
      }]

      const config = {
        modeBarButtonsToRemove: ['toImage'],
        displayModeBar: false,
        responsive: true,
        displaylogo: false
      }

      const layout = {
        height: height,
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        margin: { l: 20, r: 20, b: 20, t: 20 },
        xaxis: {
          automargin: true
        },
        yaxis: {
          automargin: true
        },
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h',
          font: { color: darkMode ? 'white' : 'black' }
        },
        sunburstcolorway: colors,
        extendsunburstcolorway: true
      }

      Plotly.purge(this)
      Plotly.newPlot(this, data, layout, config)

      if (onLeafClicked) {
        this.on('plotly_sunburstclick', data => {
          if (data.nextLevel === undefined && data.points && data.points.length > 0) {
            const path = data.points[0].currentPath.split('/')
            if (path.length > 0 && path[0] === '') {
              path.shift()
            }
            path.pop()

            path.push(data.points[0].label)

            onLeafClicked(path)
          }
        })
      }
    })
  }

  chart.height = (_) => {
    if (!arguments.length) {
      return height
    }
    height = _
    return chart
  }

  chart.colors = (_) => {
    if (!arguments.length) {
      return colors
    }
    colors = _
    return chart
  }

  chart.onLeafClicked = (_) => {
    if (!arguments.length) {
      return onLeafClicked
    }
    onLeafClicked = _
    return chart
  }

  chart.darkMode = (_) => {
    if (!arguments.length) {
      return darkMode
    }
    darkMode = _
    return chart
  }

  return chart
}
