export function plotlyAlleleFreqChart (Plotly) {
  let width = null
  let height = 600
  let xCategory = ''
  let yCategory = ''
  let onPointClicked = null
  let widths = []
  let darkMode = false
  let x = ''
  let y = ''
  let colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

  function chart (selection) {
    selection.each(function (rows) {
      const freqs = unpack(rows, y)

      let max = 0

      // Get the maximum frequency
      for (let j = 0; j < freqs.length; j++) {
        max = Math.max(max, freqs[j])
      }

      const data = []
      const ys = []
      const barColors = []
      const text = []
      const heights = []
      const barWidths = []

      let sum = 0
      for (let i = 0; i < widths.length; i++) {
        sum += widths[i]
        ys.push(widths[i] / 100)
        barColors.push((sum / 100).toFixed(4))
        heights.push(-(max / 40))
        barWidths.push(max / 20)

        if (i > 0) {
          // Bin label
          text.push(`${barColors[i - 1]} - ${barColors[i]}`)
        } else {
          text.push(`0 - ${ys[i].toFixed(4)}`)
        }
      }

      data.push({
        x: unpack(rows, x),
        y: unpack(rows, y),
        showlegend: false,
        name: xCategory,
        type: 'bar',
        marker: {
          color: colors
        }
      })

      data.push({
        x: ys,
        y: heights,
        width: barWidths,
        orientation: 'h',
        type: 'bar',
        text: text,
        showlegend: false,
        name: '',
        hovertemplate: '%{text}',
        marker: {
          colorscale: [
            ['0', '#ff7878'],
            ['1', '#78fd78']
          ],
          color: barColors,
          line: {
            color: '#333',
            width: 1
          }
        }
      })

      const config = {
        displayModeBar: false,
        responsive: true,
        displaylogo: false
      }

      const layout = {
        height: height,
        margin: { autoexpand: true },
        dragmode: false,
        autosize: true,
        hovermode: 'closest',
        barmode: 'stacked',
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          font: { color: darkMode ? 'white' : 'black' }
        },
        xaxis: {
          title: { text: xCategory, font: { color: darkMode ? 'white' : 'black' } },
          tickfont: { color: darkMode ? 'white' : 'black' },
          automargin: true,
          range: [0, 1.0]
        },
        yaxis: {
          title: { text: yCategory, font: { color: darkMode ? 'white' : 'black' } },
          tickfont: { color: darkMode ? 'white' : 'black' },
          zeroline: true,
          showgrid: true,
          gridcolor: darkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
          rangemode: 'tozero',
          automargin: true
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

  chart.y = (_) => {
    if (!arguments.length) {
      return y
    }
    y = _
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

  chart.widths = (_) => {
    if (!arguments.length) {
      return widths
    }
    widths = _
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
