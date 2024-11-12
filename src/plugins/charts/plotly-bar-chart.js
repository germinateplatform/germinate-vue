export function plotlyBarChart (Plotly) {
  let width = 1280
  let height = 600
  let xCategory = ''
  let yCategory = ''
  let xLabels = null
  let darkMode = false
  let onPointClicked = null
  let mode = 'traces'
  let x = ''
  let colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

  function chart (selection) {
    selection.each(function (rows) {
      let dims = Object.keys(rows[0])
      dims = dims.filter(d => d !== x)

      const data = []

      const xValues = unpack(rows, x)
      for (let i = 0; i < dims.length; i++) {
        data.push({
          x: xValues,
          y: unpack(rows, dims[i]),
          name: dims[i],
          type: 'bar',
          marker: {
            color: mode === 'traces' ? colors[i % colors.length] : colors
          }
        })
      }

      const config = {
        modeBarButtonsToRemove: ['toImage'],
        displayModeBar: false,
        responsive: true,
        displaylogo: false
      }

      let xTickLabels = null
      let xTickValues = null

      if (xLabels) {
        xTickValues = xValues
        xTickLabels = []

        xLabels.forEach(scale => {
          scale.forEach((l, i) => {
            if (i > xTickLabels.length - 1) {
              xTickLabels.push(l)
            } else {
              xTickLabels[i] += '<br>' + l
            }
          })
        })
      }

      const layout = {
        height: height,
        hovermode: 'closest',
        barmode: 'group',
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        xaxis: {
          title: { text: xCategory, font: { color: darkMode ? 'white' : 'black' } },
          tickfont: { color: darkMode ? 'white' : 'black' },
          tickmode: xTickLabels ? 'array' : 'auto',
          ticktext: xTickLabels,
          tickvals: xTickValues,
          automargin: true,
          fixedrange: true
        },
        yaxis: {
          title: { text: yCategory, font: { color: darkMode ? 'white' : 'black' } },
          tickfont: { color: darkMode ? 'white' : 'black' },
          automargin: true,
          fixedrange: true,
          showgrid: true,
          gridcolor: darkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)'
        },
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h',
          font: { color: darkMode ? 'white' : 'black' }
        }
      }

      // Plotly.purge(this)
      Plotly.react(this, data, layout, config)

      if (onPointClicked) {
        const dragLayer = this.getElementsByClassName('nsewdrag')[0]

        this.on('plotly_hover', () => { dragLayer.style.cursor = 'pointer' })
        this.on('plotly_unhover', () => { dragLayer.style.cursor = '' })
        this.on('plotly_click', data => {
          if (data && data.points && data.points.length > 0 && data.event && data.event.button === 0) {
            onPointClicked(data.points[0].x)
          }
        })
      }
    })
  }

  function unpack (rows, key) {
    return rows.map(row => row[key])
  }

  chart.x = (_) => {
    if (!arguments.length) {
      return x
    }
    x = _
    return chart
  }

  chart.onPointClicked = (_) => {
    if (!arguments.length) {
      return onPointClicked
    }
    onPointClicked = _
    return chart
  }

  chart.xCategory = (_) => {
    if (!arguments.length) {
      return xCategory
    }
    xCategory = _
    return chart
  }

  chart.xLabels = (_) => {
    if (!arguments.length) {
      return xLabels
    }
    xLabels = _
    return chart
  }

  chart.yCategory = (_) => {
    if (!arguments.length) {
      return yCategory
    }
    yCategory = _
    return chart
  }

  chart.width = (_) => {
    if (!arguments.length) {
      return width
    }
    width = _
    return chart
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

  chart.mode = (_) => {
    if (!arguments.length) {
      return mode
    }
    mode = _
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
