export function plotlyMapChart (Plotly) {
  let onPointsSelected = null
  let onSelectionCleared = null
  let onDistinctChromosomes = null
  let distinctChromosomes = []
  let darkMode = false
  let colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

  function chart (selection) {
    selection.each(function (rows) {
      const unique = {}
      let total = 0
      rows.forEach(row => {
        if (!unique[row.chromosome]) {
          unique[row.chromosome] = 1
          distinctChromosomes.push(row.chromosome)
        } else {
          unique[row.chromosome]++
        }
        total++
      })

      // If it's smaller than 5% of the average chromosome size, don't include it
      const threshold = total / distinctChromosomes.length / 100 * 5

      distinctChromosomes = distinctChromosomes.filter(c => unique[c] > threshold)
      distinctChromosomes.sort((a, b) => a.localeCompare(b))

      const data = []
      const layout = {
        height: distinctChromosomes.length * 100 + 200,
        margin: { autoexpand: true },
        autosize: true,
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        selectdirection: 'h',
        dragmode: 'select',
        grid: {
          rows: distinctChromosomes.length,
          columns: 1,
          pattern: 'independent',
          subplots: []
        },
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h',
          font: { color: darkMode ? 'white' : 'black' }
        },
        xaxis: {
          title: { font: { color: darkMode ? 'white' : 'black' } },
          tickfont: { color: darkMode ? 'white' : 'black' }
        }
      }

      distinctChromosomes.forEach((c, i) => {
        const x = unpackConditional(rows, 'position', 'chromosome', c)
        let min = Number.MAX_SAFE_INTEGER
        let max = -Number.MAX_SAFE_INTEGER

        x.forEach(function (value) {
          if (value < min) {
            min = value
          }
          if (value > max) {
            max = value
          }
        })

        const datum = {
          x: x,
          type: 'histogram',
          name: c,
          marker: {
            color: colors[i % colors.length]
          },
          xaxis: 'x',
          xbins: {
            size: Math.max(1, Math.round((max - min) / 500))
          }
        }

        const axisIndex = (i > 0) ? (i + 1) : ''
        datum.yaxis = 'y' + axisIndex
        data.push(datum)

        layout['yaxis' + axisIndex] = {
          title: { text: c, font: { color: darkMode ? 'white' : 'black' } },
          tickfont: { color: darkMode ? 'white' : 'black' },
          showgrid: true,
          gridcolor: darkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)'
        }

        layout.grid.subplots.push(['xy' + axisIndex])
      })

      const config = {
        modeBarButtonsToRemove: ['toImage'],
        displayModeBar: true,
        responsive: true,
        displaylogo: false
      }

      // Plotly.purge(this)
      Plotly.react(this, data, layout, config)

      this.on('plotly_selected', eventData => {
        if (!eventData || (eventData.points.length < 1)) {
          Plotly.restyle(this, { selectedpoints: null })

          if (onSelectionCleared) {
            onSelectionCleared()
          }
        } else {
          const chromosome = eventData.points[0].curveNumber

          if (onPointsSelected) {
            onPointsSelected(distinctChromosomes[chromosome], eventData.range.x[0], eventData.range.x[1])
          }
        }
      })

      if (onDistinctChromosomes) {
        onDistinctChromosomes(distinctChromosomes)
      }
    })
  }

  function unpackConditional (rows, key, referenceColumn, referenceValue) {
    return rows.filter(row => row[referenceColumn] === referenceValue).map(row => +row[key])
  }

  chart.colors = (_) => {
    if (!arguments.length) {
      return colors
    }
    colors = _
    return chart
  }

  chart.onDistinctChromosomes = (_) => {
    if (!arguments.length) {
      return onDistinctChromosomes
    }
    onDistinctChromosomes = _
    return chart
  }

  chart.onPointsSelected = (_) => {
    if (!arguments.length) {
      return onPointsSelected
    }
    onPointsSelected = _
    return chart
  }

  chart.onSelectionCleared = (_) => {
    if (!arguments.length) {
      return onSelectionCleared
    }
    onSelectionCleared = _
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
