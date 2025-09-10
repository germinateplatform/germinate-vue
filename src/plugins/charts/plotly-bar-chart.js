export function plotlyBarChart (Plotly) {
  let height = 600
  let xCategory = ''
  let yCategory = ''
  let xLabels = null
  let groupBy = null
  let darkMode = false
  let onPointClicked = null
  let mode = 'traces'
  let x = ''
  let columnsToIgnore = []
  let colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

  function chart (selection) {
    selection.each(function (rows) {
      let dims = Object.keys(rows[0])
      dims = dims.filter(d => d !== x && !columnsToIgnore.includes(d))

      const data = []
      let xValues = null

      if (groupBy) {
        const set = new Set(unpack(rows, x))
        xValues = [...set]

        const groupBySet = new Set(unpack(rows, groupBy))
        const groupByValues = [...groupBySet]

        if (groupByValues.length < 2) {
          xValues = null
        } else {
          for (let i = 0; i < groupByValues.length; i++) {
            data.push({
              x: xValues,
              y: unpackConditional(rows, dims[0], groupBy, groupByValues[i]),
              name: groupByValues[i] || 'N/A',
              type: 'bar',
              marker: {
                color: mode === 'traces' ? colors[i % colors.length] : colors,
              },
            })
          }
        }
      }

      if (!xValues) {
        xValues = unpack(rows, x)
        for (let i = 0; i < dims.length; i++) {
          data.push({
            x: xValues,
            y: unpack(rows, dims[i]),
            name: dims[i],
            type: 'bar',
            marker: {
              color: mode === 'traces' ? colors[i % colors.length] : colors,
            },
          })
        }
      }

      const config = {
        modeBarButtonsToRemove: ['toImage'],
        displayModeBar: false,
        responsive: true,
        displaylogo: false,
      }

      let xTickLabels = null
      let xTickValues = null

      function setTicks () {
        xTickLabels = []

        const potentialLabels = []

        xLabels.forEach(scale => {
          scale.forEach((l, i) => {
            if (i > potentialLabels.length - 1) {
              potentialLabels.push([l])
            } else {
              potentialLabels[i].push(l)
            }
          })
        })

        xTickLabels = potentialLabels.map(lbs => lbs.join('<br>'))

        xTickValues = potentialLabels.map(lbs => {
          return lbs.map(lb => xValues.includes(lb) ? lb : undefined).find(lb => lb !== undefined) || null
        })
      }

      if (xLabels) {
        setTicks()
      }

      const layout = {
        height,
        hovermode: 'x',
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
          fixedrange: true,
        },
        yaxis: {
          title: { text: yCategory, font: { color: darkMode ? 'white' : 'black' } },
          tickfont: { color: darkMode ? 'white' : 'black' },
          automargin: true,
          fixedrange: true,
          showgrid: true,
          gridcolor: darkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
        },
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h',
          x: 0,
          y: 1.1,
          font: { color: darkMode ? 'white' : 'black' },
        },
      }

      if (groupBy) {
        layout.barmode = 'group'
      }

      // Plotly.purge(this)
      Plotly.react(this, data, layout, config)

      if (onPointClicked) {
        const dragLayer = this.getElementsByClassName('nsewdrag')[0]

        this.on('plotly_hover', () => {
          dragLayer.style.cursor = 'pointer'
        })
        this.on('plotly_unhover', () => {
          dragLayer.style.cursor = ''
        })
        this.on('plotly_click', data => {
          if (data && data.points && data.points.length > 0 && data.event && data.event.button === 0) {
            onPointClicked({
              x: data.points[0].x,
              trace: data.points[0].data.name,
            })
          }
        })
      }
    })
  }

  function unpack (rows, key) {
    return rows.map(row => row[key])
  }

  function unpackConditional (rows, key, referenceColumn, referenceValue) {
    return rows.filter(row => row[referenceColumn] === referenceValue).map(row => row[key])
  }

  chart.x = nx => {
    x = nx
    return chart
  }

  chart.onPointClicked = opc => {
    onPointClicked = opc
    return chart
  }

  chart.xCategory = xc => {
    xCategory = xc
    return chart
  }

  chart.groupBy = gb => {
    groupBy = gb
    return chart
  }

  chart.xLabels = xl => {
    xLabels = xl
    return chart
  }

  chart.yCategory = yc => {
    yCategory = yc
    return chart
  }

  chart.height = h => {
    height = h
    return chart
  }

  chart.colors = c => {
    colors = c
    return chart
  }

  chart.mode = m => {
    mode = m
    return chart
  }

  chart.columnsToIgnore = cti => {
    columnsToIgnore = cti
    return chart
  }

  chart.darkMode = d => {
    darkMode = d
    return chart
  }

  return chart
}
