import { uuidv4 } from '@/mixins/util'

export function plotlyScatterPlot (Plotly) {
  let colorBy = {
    column: null,
    ids: null,
    names: null
  }
  let colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
  const colorByOptions = ['dataset_name', 'entity_parent_name', 'Date', 'treatments_description', 'rep', 'block', 'trial_row', 'trial_column', 'trial_site', 'location', 'group_ids']
  let height = null
  let width = null
  let darkMode = false
  let xCategory = 'x'
  let yCategory = 'y'
  let swapAxes = false
  let onPointClicked = null
  let onPointsSelected = null
  let onColorByStatsLoaded = null

  function chart (selection) {
    selection.each(function (rows) {
      const symbolList = ['circle', 'square', 'diamond', 'cross', 'x', 'triangle-up', 'triangle-down', 'triangle-left', 'triangle-right', 'triangle-ne', 'triangle-se', 'triangle-sw', 'triangle-nw', 'pentagon', 'hexagon', 'hexagon2', 'octagon', 'star', 'hexagram', 'star-triangle-up', 'star-triangle-down', 'star-square', 'star-diamond', 'diamond-tall', 'diamond-wide', 'hourglass', 'bowtie']

      let cats = []
      if (colorBy.column !== null || (colorBy.column === null && colorBy.ids === null && colorBy.names === null)) {
        const categories = new Set()

        const unpacked = unpack(rows, colorBy.column)
        for (let i = 0; i < unpacked.length; i++) {
          categories.add(unpacked[i])
        }

        categories.forEach(c => cats.push(c))

        cats.sort()
      } else {
        cats = ['Unmarked', 'Marked']
      }

      const data = []

      const [xAxis, yAxis] = swapAxes ? [yCategory, xCategory] : [xCategory, yCategory]

      for (let i = 0; i < cats.length; i++) {
        let x
        let y
        let ids
        let names

        if (colorBy.column !== null || (colorBy.column === null && colorBy.ids === null && colorBy.names === null)) {
          x = unpackConditional(rows, xAxis, colorBy.column, cats[i])
          y = unpackConditional(rows, yAxis, colorBy.column, cats[i])
          ids = unpackConditional(rows, 'dbId', colorBy.column, cats[i])
          names = unpackConditional(rows, 'name', colorBy.column, cats[i])
        } else if (colorBy.ids !== null) {
          x = unpackConditionalMarked(rows, xAxis, colorBy.ids, cats[i] === 'Marked')
          y = unpackConditionalMarked(rows, yAxis, colorBy.ids, cats[i] === 'Marked')
          ids = unpackConditionalMarked(rows, 'dbId', colorBy.ids, cats[i] === 'Marked')
          names = unpackConditionalMarked(rows, 'name', colorBy.ids, cats[i] === 'Marked')
        } else if (colorBy.names != null) {
          x = unpackConditionalByName(rows, xAxis, colorBy.names, cats[i] === 'Marked')
          y = unpackConditionalByName(rows, yAxis, colorBy.names, cats[i] === 'Marked')
          ids = unpackConditionalByName(rows, 'dbId', colorBy.names, cats[i] === 'Marked')
          names = unpackConditionalByName(rows, 'name', colorBy.names, cats[i] === 'Marked')
        }

        ids = ids.map(i => `${i}-${uuidv4()}`)
        data.push({
          x: x,
          y: y,
          marker: {
            color: colors[i % colors.length],
            symbol: symbolList[i % symbolList.length],
            size: 6,
            opacity: 0.7
          },
          mode: 'markers',
          name: cats[i] ? cats[i] : '',
          ids: ids,
          text: names,
          type: 'scattergl',
          unselected: {
            marker: {
              opacity: 0.2
            }
          },
          showlegend: cats[i] !== undefined
        })
        data.push({
          x: x,
          marker: {
            color: colors[i % colors.length]
          },
          opacity: 0.5,
          name: cats[i] ? cats[i] : '',
          type: 'histogram',
          yaxis: 'y2',
          showlegend: false
        })
        data.push({
          y: y,
          marker: {
            color: colors[i % colors.length]
          },
          opacity: 0.5,
          name: cats[i] ? cats[i] : '',
          type: 'histogram',
          xaxis: 'x2',
          showlegend: false
        })
      }

      const layout = {
        autosize: true,
        bargap: 0,
        width: width === null ? Math.min(this.offsetWidth, window.innerHeight) * 0.95 : width,
        height: height === null ? Math.min(this.offsetWidth, window.innerHeight) * 0.95 : height,
        hovermode: 'closest',
        dragmode: 'select',
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        margin: { t: 65, autoexpand: true },
        xaxis: {
          domain: [0, 0.95],
          showgrid: false,
          showline: true,
          title: { text: xAxis, font: { color: darkMode ? 'white' : 'black' } },
          tickfont: { color: darkMode ? 'white' : 'black' }
        },
        xaxis2: {
          domain: [0.95, 1],
          showgrid: false,
          showticklabels: false,
          zeroline: false
        },
        yaxis: {
          domain: [0, 0.95],
          showgrid: false,
          showline: true,
          title: { text: yAxis, font: { color: darkMode ? 'white' : 'black' } },
          tickfont: { color: darkMode ? 'white' : 'black' }
        },
        yaxis2: {
          domain: [0.95, 1],
          showgrid: false,
          showticklabels: false,
          zeroline: false
        },
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h',
          font: { color: darkMode ? 'white' : 'black' }
        },
        barmode: 'overlay'
      }

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
          Plotly.restyle(this, { selectedpoints: [null] })

          if (onPointsSelected) {
            onPointsSelected(null)
          }
        } else {
          if (onPointsSelected) {
            const mapped = eventData.points.map(p => parseInt(p.id.split('-')[0])).filter((value, index, self) => self.indexOf(value) === index)

            onPointsSelected(mapped)
          }
        }
      })

      if (onPointClicked) {
        this.on('plotly_click', data => {
          if (data.points.length > 0) {
            onPointClicked(parseInt(data.points[0].id.split('-')[0]))
          }
        })
      }

      if (onColorByStatsLoaded) {
        getColorByStats(rows)
      }
    })
  }

  async function getColorByStats (rows) {
    const statsResult = {}

    colorByOptions.forEach(o => {
      statsResult[o] = unpackDistinct(rows, o).length
    })

    onColorByStatsLoaded(statsResult)
  }

  function unpackDistinct (rows, key) {
    return [...new Set(unpack(rows, key))]
  }

  function unpack (rows, key) {
    return rows.map(row => row[key])
  }

  function unpackConditionalMarked (rows, key, markedIds, isMarked) {
    return rows.filter(row => {
      const isDataPointMarked = markedIds.indexOf(parseInt(row.dbId)) !== -1
      return isMarked ? isDataPointMarked : !isDataPointMarked
    }).map(row => extractValue(row, key))
  }

  function unpackConditionalByName (rows, key, names, isMarked) {
    return rows.filter(row => {
      const isDataPointMarked = names.indexOf(row.name.toUpperCase()) !== -1
      return isMarked ? isDataPointMarked : !isDataPointMarked
    }).map(row => extractValue(row, key))
  }

  function unpackConditional (rows, key, referenceColumn, referenceValue) {
    return rows.filter(row => row[referenceColumn] === referenceValue).map(row => extractValue(row, key))
  }

  function extractValue (row, key) {
    return row[key]
    // const dataPoint = row[key]
    // if (dataPoint === null || dataPoint === undefined || dataPoint === '') {
    //   return null
    // } else {
    //   let isDate = false

    //   if (key === 'Date') {
    //     isDate = true
    //   } else if (dataPoint.split('-').length === 3 && !isNaN(Date.parse(dataPoint))) {
    //     isDate = true
    //   }

    //   if (isDate) {
    //     return dataPoint;
    //   } else {
    //     var value = parseFloat(dataPoint)

    //     if (isNaN(value)) {
    //       return dataPoint;
    //     } else {
    //       return value;
    //     }
    //   }
    // }
  }

  chart.colorBy = (_) => {
    if (!arguments.length) {
      return colorBy
    }
    colorBy = _

    if (colorBy.names) {
      colorBy.names = colorBy.names.map(n => n.toUpperCase())
    }

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

  chart.swapAxes = (_) => {
    if (!arguments.length) {
      return swapAxes
    }
    swapAxes = _
    return chart
  }

  chart.colors = (_) => {
    if (!arguments.length) {
      return colors
    }
    colors = _
    return chart
  }

  chart.onPointClicked = (_) => {
    if (!arguments.length) {
      return onPointClicked
    }
    onPointClicked = _
    return chart
  }

  chart.onColorByStatsLoaded = (_) => {
    if (!arguments.length) {
      return onColorByStatsLoaded
    }
    onColorByStatsLoaded = _
    return chart
  }

  chart.onPointsSelected = (_) => {
    if (!arguments.length) {
      return onPointsSelected
    }
    onPointsSelected = _
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
